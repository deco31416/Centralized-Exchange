import {
    Controller,
    Get,
    Post,
    Body,
    Request,
    UseGuards,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { SessionService } from '../services/session.service';
import { TelemetryService } from '../services/telemetry.service';
import { SuspiciousActivityService } from '../services/suspicious-activity.service';

/**
 * DTO para revocar sesión específica
 */
export class RevokeSessionDto {
    sessionId: string;
}

/**
 * Response type para sesiones
 */
interface SessionInfo {
    sessionId: string;
    deviceId: string;
    deviceName: string;
    ipHash: string;
    ipPrefix: string;
    userAgent: {
        browser: string;
        os: string;
        deviceType: 'desktop' | 'mobile' | 'tablet';
    };
    createdAt: string;
    lastActivityAt: string;
    isCurrent: boolean;
    isSuspicious: boolean;
}

/**
 * Security Controller - Gestión de sesiones activas
 * Endpoints enterprise-grade para Security Center
 */
@Controller('auth/v2')
@UseGuards(JwtAuthGuard)
export class SecurityController {
    constructor(
        private readonly sessionService: SessionService,
        private readonly telemetryService: TelemetryService,
        private readonly suspiciousActivityService: SuspiciousActivityService,
    ) { }

    /**
     * GET /auth/v2/sessions
     * Lista todas las sesiones activas del usuario autenticado
     */
    @Get('sessions')
    async getSessions(@Request() req): Promise<{ sessions: SessionInfo[] }> {
        const userId = req.user.sub; // User ID from JWT
        const currentSessionId = req.user.sid; // Session ID from JWT

        // Obtener todas las sesiones activas
        const sessions = await this.sessionService.findActiveSessionsByUserId(
            userId,
        );

        // Enriquecer cada sesión con información detallada
        const enrichedSessions = await Promise.all(
            sessions.map(async (session) => {
                const device = session.device_id as any;

                // Obtener IP prefix (primeros 2 octetos enmascarados)
                const ipPrefix = this.telemetryService.getIpPrefix(session.ip_hash);

                // Parsear User Agent
                const userAgent = this.telemetryService.parseUserAgent(
                    device?.display_name || 'Unknown',
                );

                // Evaluar si es sospechosa
                const isSuspicious =
                    await this.suspiciousActivityService.evaluateSuspiciousness(
                        userId,
                        session,
                        device,
                    );

                return {
                    sessionId: session._id,
                    deviceId: device?._id?.toString() || 'unknown',
                    deviceName: device?.display_name || 'Unknown Device',
                    ipHash: session.ip_hash.substring(0, 16) + '...', // Parcialmente enmascarada
                    ipPrefix,
                    userAgent: {
                        browser: userAgent.browser,
                        os: userAgent.os,
                        deviceType: userAgent.deviceType as 'desktop' | 'mobile' | 'tablet',
                    },
                    createdAt: session.created_at.toISOString(),
                    lastActivityAt: session.last_seen_at.toISOString(),
                    isCurrent: session._id === currentSessionId,
                    isSuspicious,
                };
            }),
        );

        return { sessions: enrichedSessions };
    }

    /**
     * POST /auth/v2/sessions/revoke
     * Revoca una sesión específica
     */
    @Post('sessions/revoke')
    async revokeSession(
        @Body() body: RevokeSessionDto,
        @Request() req,
    ): Promise<{
        success: boolean;
        message: string;
        wasCurrentSession: boolean;
    }> {
        const userId = req.user.sub;
        const currentSessionId = req.user.sid;
        const { sessionId } = body;

        if (!sessionId) {
            throw new UnauthorizedException('Session ID is required');
        }

        // Verificar si es la sesión actual
        const wasCurrentSession = sessionId === currentSessionId;

        // Revocar la sesión (verifica ownership automáticamente)
        await this.sessionService.revokeSessionById(sessionId, userId);

        return {
            success: true,
            message: wasCurrentSession
                ? 'Current session revoked - please login again'
                : 'Session revoked successfully',
            wasCurrentSession,
        };
    }

    /**
     * POST /auth/v2/sessions/revoke-all
     * Revoca TODAS las sesiones excepto la actual
     */
    @Post('sessions/revoke-all')
    async revokeAllSessions(@Request() req): Promise<{
        success: boolean;
        revokedCount: number;
    }> {
        const userId = req.user.sub;
        const currentSessionId = req.user.sid;

        // Revocar todas excepto la actual
        const revokedCount = await this.sessionService.revokeAllExceptCurrent(
            userId,
            currentSessionId,
        );

        return {
            success: true,
            revokedCount,
        };
    }
}
