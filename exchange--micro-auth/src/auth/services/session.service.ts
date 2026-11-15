import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import {
  Session,
  SessionDocument,
} from '../../database/schemas/session.schema';
import { Device, DeviceDocument } from '../../database/schemas/device.schema';
import {
  RefreshToken,
  RefreshTokenDocument,
} from '../../database/schemas/refresh-token.schema';
import { CryptoService } from '../../crypto/crypto.service';
import { SessionResponseDto, DeviceResponseDto } from '../dto/response.dto';

/**
 * Service for managing user sessions and devices
 */
@Injectable()
export class SessionService {
  private readonly maxConcurrentSessions: number;
  private readonly refreshTokenTtl: number;

  constructor(
    @InjectModel(Session.name)
    private readonly sessionModel: Model<SessionDocument>,
    @InjectModel(Device.name)
    private readonly deviceModel: Model<DeviceDocument>,
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshTokenDocument>,
    private readonly cryptoService: CryptoService,
    private readonly configService: ConfigService,
  ) {
    this.maxConcurrentSessions =
      this.configService.get<number>('MAX_CONCURRENT_SESSIONS') || 10;
    this.refreshTokenTtl =
      this.configService.get<number>('JWT_REFRESH_TOKEN_TTL') || 3888000;
  }

  /**
   * Creates or updates device based on fingerprint
   */
  async createOrUpdateDevice(
    userId: string | Types.ObjectId,
    deviceName: string,
    userAgent: string,
    ipAddress: string,
  ): Promise<DeviceDocument> {
    const deviceFingerprint =
      this.cryptoService.generateDeviceFingerprint(userAgent);
    const ipHash = this.cryptoService.hashData(ipAddress);

    // Parse user-agent to extract device info
    const deviceInfo = this.parseUserAgent(userAgent);

    // Try to find existing device
    let device = await this.deviceModel
      .findOne({
        user_id: userId,
        device_fingerprint_hash: deviceFingerprint,
      })
      .exec();

    if (device) {
      // Update existing device
      device.last_seen_at = new Date();
      device.last_ip_hash = ipHash;
      device.user_agent = userAgent;
      device.platform = deviceInfo.platform;
      device.device_type = deviceInfo.deviceType;
      device.browser = deviceInfo.browser;
      await device.save();
    } else {
      // Create new device
      device = new this.deviceModel({
        user_id: userId,
        display_name: deviceName || deviceInfo.displayName || this.extractDeviceName(userAgent),
        device_fingerprint_hash: deviceFingerprint,
        platform: deviceInfo.platform,
        device_type: deviceInfo.deviceType,
        browser: deviceInfo.browser,
        user_agent: userAgent,
        first_seen_at: new Date(),
        last_seen_at: new Date(),
        last_ip_hash: ipHash,
      });
      await device.save();
    }

    return device;
  }

  /**
   * Parses user-agent string to extract platform, device type, and browser
   */
  private parseUserAgent(userAgent: string): {
    platform: string;
    deviceType: string;
    browser: string;
    displayName: string;
  } {
    const ua = userAgent.toLowerCase();

    // Detect platform (OS)
    let platform = 'Unknown';
    if (ua.includes('windows')) platform = 'Windows';
    else if (ua.includes('macintosh') || ua.includes('mac os x')) platform = 'macOS';
    else if (ua.includes('linux')) platform = 'Linux';
    else if (ua.includes('android')) platform = 'Android';
    else if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) platform = 'iOS';

    // Detect device type
    let deviceType = 'Desktop';
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone') || ua.includes('ipod')) {
      deviceType = 'Mobile';
    } else if (ua.includes('ipad') || ua.includes('tablet')) {
      deviceType = 'Tablet';
    }

    // Detect browser
    let browser = 'Unknown';
    if (ua.includes('edg/') || ua.includes('edge')) browser = 'Edge';
    else if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome';
    else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
    else if (ua.includes('firefox')) browser = 'Firefox';
    else if (ua.includes('opera') || ua.includes('opr/')) browser = 'Opera';

    // Generate display name
    const displayName = `${browser} on ${platform} (${deviceType})`;

    return { platform, deviceType, browser, displayName };
  }

  /**
   * Creates a new session
   */
  async createSession(
    userId: string | Types.ObjectId,
    deviceId: string | Types.ObjectId,
    ipAddress: string,
    userAgent: string,
  ): Promise<SessionDocument> {
    const sessionId = this.cryptoService.generateSessionId();
    const ipHash = this.cryptoService.hashData(ipAddress);
    const userAgentHash = this.cryptoService.hashData(userAgent);
    const expiresAt = new Date(Date.now() + this.refreshTokenTtl * 1000);

    // Check and enforce session limit
    await this.enforceSessionLimit(userId);

    const session = new this.sessionModel({
      _id: sessionId,
      user_id: userId,
      device_id: deviceId,
      ip_hash: ipHash,
      user_agent_hash: userAgentHash,
      created_at: new Date(),
      last_seen_at: new Date(),
      expires_at: expiresAt,
    });

    await session.save();
    return session;
  }

  /**
   * Creates refresh token for session
   */
  async createRefreshToken(
    sessionId: string,
    userId: string | Types.ObjectId,
    deviceId: string | Types.ObjectId,
    parentTokenId?: string | Types.ObjectId,
  ): Promise<{ token: string; tokenDocument: RefreshTokenDocument }> {
    const token = this.cryptoService.generateSecureToken();
    const { hash, salt } = this.cryptoService.hashToken(token);
    const tokenHash = hash + ':' + salt;
    const expiresAt = new Date(Date.now() + this.refreshTokenTtl * 1000);

    const refreshToken = new this.refreshTokenModel({
      user_id: userId,
      session_id: sessionId,
      token_hash: tokenHash,
      parent_id: parentTokenId || null,
      expires_at: expiresAt,
      device_id: deviceId,
    });

    await refreshToken.save();

    return { token, tokenDocument: refreshToken };
  }

  /**
   * Validates and rotates refresh token
   */
  async rotateRefreshToken(token: string): Promise<{
    newToken: string;
    sessionId: string;
    userId: string;
    deviceId: string;
  }> {
    // Find and validate token
    const { hash, salt } = this.cryptoService.hashToken(token);
    const tokenHash = hash + ':' + salt;

    const refreshToken = await this.refreshTokenModel
      .findOne({
        token_hash: tokenHash,
        revoked_at: { $exists: false },
        expires_at: { $gt: new Date() },
      })
      .exec();

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Check for reuse detection
    if (refreshToken.rotated_at) {
      // Mark reuse detected and revoke session
      await this.revokeSessionChain(
        refreshToken.session_id,
        'Token reuse detected',
      );
      throw new UnauthorizedException('Token reuse detected - session revoked');
    }

    // Mark current token as rotated
    refreshToken.rotated_at = new Date();
    await refreshToken.save();

    // Create new token
    const { token: newToken } = await this.createRefreshToken(
      refreshToken.session_id,
      refreshToken.user_id,
      refreshToken.device_id,
      refreshToken._id as Types.ObjectId,
    );

    // Update session last seen
    await this.updateSessionLastSeen(refreshToken.session_id);

    return {
      newToken,
      sessionId: refreshToken.session_id,
      userId: refreshToken.user_id.toString(),
      deviceId: refreshToken.device_id.toString(),
    };
  }

  /**
   * Gets user's active sessions
   */
  async getUserSessions(
    userId: string | Types.ObjectId,
  ): Promise<SessionResponseDto[]> {
    const sessions = await this.sessionModel
      .find({
        user_id: userId,
        revoked_at: { $exists: false },
        expires_at: { $gt: new Date() },
      })
      .populate('device_id')
      .exec();

    return sessions.map((session) => ({
      id: session._id,
      device_name: (session.device_id as any)?.display_name || 'Unknown Device',
      ip_address: this.maskIpAddress(session.ip_hash),
      user_agent: this.extractBrowserInfo(session.user_agent_hash),
      is_current: false, // Will be set by controller based on current session
      created_at: session.created_at,
      last_seen_at: session.last_seen_at,
      expires_at: session.expires_at,
    }));
  }

  /**
   * Gets user's devices
   */
  async getUserDevices(
    userId: string | Types.ObjectId,
  ): Promise<DeviceResponseDto[]> {
    const devices = await this.deviceModel
      .find({
        user_id: userId,
      })
      .exec();

    const deviceSessions = await Promise.all(
      devices.map(async (device) => {
        const sessionCount = await this.sessionModel
          .countDocuments({
            device_id: device._id,
            revoked_at: { $exists: false },
            expires_at: { $gt: new Date() },
          })
          .exec();

        return {
          id: (device._id as Types.ObjectId).toString(),
          display_name: device.display_name,
          device_type: this.extractDeviceType(device.display_name),
          is_current: false, // Will be set by controller
          first_seen_at: device.first_seen_at,
          last_seen_at: device.last_seen_at,
          session_count: sessionCount,
        };
      }),
    );

    return deviceSessions;
  }

  /**
   * Revokes a specific session
   */
  async revokeSession(
    sessionId: string,
    reason: string = 'User logout',
  ): Promise<void> {
    await this.sessionModel
      .updateOne({ _id: sessionId }, { revoked_at: new Date(), reason })
      .exec();

    // Revoke all refresh tokens for this session
    await this.refreshTokenModel
      .updateMany(
        { session_id: sessionId, revoked_at: { $exists: false } },
        { revoked_at: new Date() },
      )
      .exec();
  }

  /**
   * Revokes all user sessions
   */
  async revokeAllUserSessions(
    userId: string | Types.ObjectId,
    reason: string = 'Global logout',
  ): Promise<void> {
    // Revoke all active sessions
    await this.sessionModel
      .updateMany(
        { user_id: userId, revoked_at: { $exists: false } },
        { revoked_at: new Date(), reason },
      )
      .exec();

    // Revoke all refresh tokens
    await this.refreshTokenModel
      .updateMany(
        { user_id: userId, revoked_at: { $exists: false } },
        { revoked_at: new Date() },
      )
      .exec();
  }

  /**
   * Revokes all sessions for a device
   */
  async revokeDeviceSessions(
    deviceId: string | Types.ObjectId,
    reason: string = 'Device revoked',
  ): Promise<void> {
    // Get all sessions for the device
    const sessions = await this.sessionModel
      .find({
        device_id: deviceId,
        revoked_at: { $exists: false },
      })
      .exec();

    // Revoke each session
    for (const session of sessions) {
      await this.revokeSession(session._id, reason);
    }
  }

  /**
   * Updates session last seen timestamp
   */
  async updateSessionLastSeen(sessionId: string): Promise<void> {
    await this.sessionModel
      .updateOne({ _id: sessionId }, { last_seen_at: new Date() })
      .exec();
  }

  /**
   * Validates session exists and is active
   */
  async validateSession(sessionId: string): Promise<SessionDocument> {
    const session = await this.sessionModel
      .findOne({
        _id: sessionId,
        revoked_at: { $exists: false },
        expires_at: { $gt: new Date() },
      })
      .exec();

    if (!session) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    return session;
  }

  /**
   * Enforces maximum concurrent sessions per user
   */
  private async enforceSessionLimit(
    userId: string | Types.ObjectId,
  ): Promise<void> {
    const activeSessions = await this.sessionModel
      .find({
        user_id: userId,
        revoked_at: { $exists: false },
        expires_at: { $gt: new Date() },
      })
      .sort({ created_at: 1 })
      .exec();

    if (activeSessions.length >= this.maxConcurrentSessions) {
      // Revoke oldest sessions to make room
      const sessionsToRevoke = activeSessions.slice(
        0,
        activeSessions.length - this.maxConcurrentSessions + 1,
      );

      for (const session of sessionsToRevoke) {
        await this.revokeSession(session._id, 'Session limit exceeded');
      }
    }
  }

  /**
   * Revokes entire session chain when reuse is detected
   */
  private async revokeSessionChain(
    sessionId: string,
    reason: string,
  ): Promise<void> {
    // Mark all refresh tokens as having reuse detected
    await this.refreshTokenModel
      .updateMany(
        { session_id: sessionId },
        { reuse_detected: true, revoked_at: new Date() },
      )
      .exec();

    // Revoke the session
    await this.revokeSession(sessionId, reason);
  }

  /**
   * Extracts device name from user agent
   */
  private extractDeviceName(userAgent: string): string {
    if (userAgent.includes('Mobile')) return 'Mobile Device';
    if (userAgent.includes('Chrome')) return 'Chrome Browser';
    if (userAgent.includes('Firefox')) return 'Firefox Browser';
    if (userAgent.includes('Safari')) return 'Safari Browser';
    if (userAgent.includes('Edge')) return 'Edge Browser';
    return 'Unknown Device';
  }

  /**
   * Extracts device type for display
   */
  private extractDeviceType(displayName: string): string {
    if (displayName.includes('Mobile')) return 'mobile';
    if (displayName.includes('Browser')) return 'desktop';
    return 'unknown';
  }

  /**
   * Masks IP address for privacy
   */
  private maskIpAddress(ipHash: string): string {
    return ipHash.substring(0, 8) + '...';
  }

  /**
   * Extracts browser info from user agent hash
   */
  private extractBrowserInfo(userAgentHash: string): string {
    return userAgentHash.substring(0, 12) + '...';
  }

  /**
   * Encuentra todas las sesiones activas de un usuario (para Security Center)
   */
  async findActiveSessionsByUserId(
    userId: string | Types.ObjectId,
  ): Promise<SessionDocument[]> {
    return this.sessionModel
      .find({
        user_id: userId,
        revoked_at: { $exists: false },
        expires_at: { $gt: new Date() },
      })
      .populate('device_id')
      .sort({ last_seen_at: -1 })
      .exec();
  }

  /**
   * Revoca una sesión específica por ID (para Security Center)
   */
  async revokeSessionById(
    sessionId: string,
    userId: string | Types.ObjectId,
  ): Promise<void> {
    // Verificar que la sesión pertenece al usuario
    const session = await this.sessionModel
      .findOne({
        _id: sessionId,
        user_id: userId,
      })
      .exec();

    if (!session) {
      throw new UnauthorizedException(
        'Session not found or does not belong to user',
      );
    }

    await this.revokeSession(sessionId, 'User revoked session');
  }

  /**
   * Revoca todas las sesiones excepto la actual (para Security Center)
   */
  async revokeAllExceptCurrent(
    userId: string | Types.ObjectId,
    currentSessionId: string,
  ): Promise<number> {
    const sessionsToRevoke = await this.sessionModel
      .find({
        user_id: userId,
        _id: { $ne: currentSessionId },
        revoked_at: { $exists: false },
      })
      .exec();

    // Revocación atómica - todas juntas o ninguna
    await Promise.all(
      sessionsToRevoke.map((session) =>
        this.revokeSession(
          session._id,
          'User revoked all other sessions',
        ),
      ),
    );

    return sessionsToRevoke.length;
  }
}

