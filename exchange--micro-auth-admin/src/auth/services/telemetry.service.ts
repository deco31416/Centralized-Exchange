import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SessionEvent, SessionEventDocument } from '../schemas/session-event.schema';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

export interface TelemetryEventData {
    userId?: string;
    action: string;
    ipAddress: string;
    userAgent: string;
    outcome: 'success' | 'fail';
    correlationId?: string;
    metadata?: Record<string, any>;
}

@Injectable()
export class TelemetryService {
    constructor(
        @InjectModel(SessionEvent.name)
        private sessionEventModel: Model<SessionEventDocument>,
        private readonly configService: ConfigService,
    ) { }

    /**
     * Log a session/auth event with telemetry data
     * SECURITY: Hashes IP, extracts IP prefix, stores truncated UA.
     * NOTE: We intentionally avoid parsing the User-Agent with heavy parsers
     * to reduce risk of ReDoS on attacker-controlled UA strings.
     */
    async logEvent(data: TelemetryEventData): Promise<void> {
        const { ipAddress, userAgent, ...rest } = data;

        const safeUserAgent = (userAgent || '').substring(0, 500);

        // Hash full IP
        const ipHash = this.hashIP(ipAddress);

        // Extract IP prefix for network-level pattern detection
        const ipPrefix = this.extractIPPrefix(ipAddress);

        const uaLower = safeUserAgent.toLowerCase();
        const deviceType = this.detectDeviceType(uaLower);
        const os = this.detectOs(uaLower);
        const browser = this.detectBrowser(uaLower);

        // Create event document
        const event = new this.sessionEventModel({
            ...rest,
            ipHash,
            ipPrefix,
            userAgent: safeUserAgent, // Store truncated UA (avoid huge strings)
            userAgentHash: this.hashUserAgent(safeUserAgent),
            deviceType,
            os,
            browser,
            timestamp: new Date(),
        });

        await event.save();
    }

    /**
     * Hash IP address with pepper
     */
    private hashIP(ip: string): string {
        const pepper = this.configService.get<string>('ARGON2_PEPPER', '');
        return crypto.createHash('sha256').update(ip + pepper).digest('hex');
    }

    /**
     * Hash User-Agent string
     */
    private hashUserAgent(ua: string): string {
        const pepper = this.configService.get<string>('ARGON2_PEPPER', '');
        return crypto.createHash('sha256').update(ua + pepper).digest('hex');
    }

    /**
     * Extract IP prefix for pattern detection
     * IPv4: /24 (e.g., 192.168.1.0/24)
     * IPv6: /48 (e.g., 2001:db8::/48)
     */
    private extractIPPrefix(ip: string): string {
        if (ip.includes(':')) {
            // IPv6
            const parts = ip.split(':');
            return parts.slice(0, 3).join(':') + '::/48';
        } else {
            // IPv4
            const parts = ip.split('.');
            return parts.slice(0, 3).join('.') + '.0/24';
        }
    }

    /**
     * Detect device type from User-Agent
     */
    private detectDeviceType(uaLower: string): 'mobile' | 'tablet' | 'desktop' {
        if (!uaLower) return 'desktop';

        // Tablet signals
        if (uaLower.includes('ipad') || uaLower.includes('tablet')) return 'tablet';
        // Android tablets sometimes omit "mobile"
        if (uaLower.includes('android') && !uaLower.includes('mobile')) return 'tablet';

        // Mobile signals
        if (
            uaLower.includes('mobile') ||
            uaLower.includes('iphone') ||
            uaLower.includes('ipod') ||
            uaLower.includes('android')
        ) {
            return 'mobile';
        }

        return 'desktop';
    }

    private detectOs(uaLower: string): string {
        if (!uaLower) return 'Unknown';
        if (uaLower.includes('windows nt')) return 'Windows';
        if (uaLower.includes('android')) return 'Android';
        if (uaLower.includes('iphone') || uaLower.includes('ipad') || uaLower.includes('ipod')) {
            return 'iOS';
        }
        if (uaLower.includes('mac os x') || uaLower.includes('macintosh')) return 'macOS';
        if (uaLower.includes('linux')) return 'Linux';
        return 'Unknown';
    }

    private detectBrowser(uaLower: string): string {
        if (!uaLower) return 'Unknown';

        // Order matters: Edge contains "chrome"; Chrome on iOS uses "crios".
        if (uaLower.includes('edg/')) return 'Edge';
        if (uaLower.includes('opr/') || uaLower.includes('opera')) return 'Opera';
        if (uaLower.includes('crios') || uaLower.includes('chrome')) return 'Chrome';
        if (uaLower.includes('firefox')) return 'Firefox';
        if (uaLower.includes('safari')) return 'Safari';
        return 'Unknown';
    }

    /**
     * Get recent events for a user (for security center or audit)
     */
    async getUserEvents(
        userId: string,
        limit: number = 50,
    ): Promise<SessionEvent[]> {
        return this.sessionEventModel
            .find({ userId })
            .sort({ timestamp: -1 })
            .limit(limit)
            .exec();
    }

    /**
     * Detect suspicious patterns (e.g., multiple IPs from same prefix)
     * Phase 2 enhancement
     */
    async detectAnomalies(userId: string): Promise<any> {
        // TODO: Implement anomaly detection logic
        // - Geo-velocity (impossible travel)
        // - Multiple failed attempts from same IP prefix
        // - New device + new IP simultaneously
        return null;
    }

    /**
     * Get IP prefix for display (public helper for Security Center)
     */
    getIpPrefix(ipHash: string): string {
        // Devuelve los primeros caracteres del hash enmascarados
        // Para simular "192.168.*.*"
        return ipHash.substring(0, 8) + '.*.*';
    }

    /**
     * Parse User Agent para display (public helper for Security Center)
     */
    parseUserAgent(deviceName: string): {
        browser: string;
        os: string;
        deviceType: string;
    } {
        // Extraer info básica del device name
        let browser = 'Unknown';
        let os = 'Unknown';
        let deviceType = 'desktop';

        if (deviceName.includes('Chrome')) {
            browser = 'Chrome';
        } else if (deviceName.includes('Firefox')) {
            browser = 'Firefox';
        } else if (deviceName.includes('Safari')) {
            browser = 'Safari';
        } else if (deviceName.includes('Edge')) {
            browser = 'Edge';
        }

        if (deviceName.includes('Windows')) {
            os = 'Windows';
        } else if (deviceName.includes('Mac')) {
            os = 'macOS';
        } else if (deviceName.includes('Linux')) {
            os = 'Linux';
        } else if (deviceName.includes('Android')) {
            os = 'Android';
            deviceType = 'mobile';
        } else if (deviceName.includes('iOS') || deviceName.includes('iPhone')) {
            os = 'iOS';
            deviceType = 'mobile';
        }

        if (deviceName.includes('Mobile')) {
            deviceType = 'mobile';
        } else if (deviceName.includes('Tablet') || deviceName.includes('iPad')) {
            deviceType = 'tablet';
        }

        return { browser, os, deviceType };
    }
}

