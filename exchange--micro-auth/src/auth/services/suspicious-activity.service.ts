import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Session, SessionDocument } from '../../database/schemas/session.schema';
import { Device, DeviceDocument } from '../../database/schemas/device.schema';

/**
 * Interface para información de sesión enriquecida
 */
export interface EnrichedSessionInfo {
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
    createdAt: Date;
    lastActivityAt: Date;
    isCurrent: boolean;
    isSuspicious: boolean;
}

/**
 * Service para detectar actividad sospechosa en sesiones
 */
@Injectable()
export class SuspiciousActivityService {
    constructor(
        @InjectModel(Session.name)
        private readonly sessionModel: Model<SessionDocument>,
        @InjectModel(Device.name)
        private readonly deviceModel: Model<DeviceDocument>,
    ) { }

    /**
     * Evalúa si una sesión es sospechosa basado en múltiples factores
     */
    async evaluateSuspiciousness(
        userId: string | Types.ObjectId,
        session: SessionDocument,
        device: DeviceDocument,
    ): Promise<boolean> {
        // Factor 1: Device reciente (<24h) + IP desconocida
        const deviceAge = Date.now() - device.first_seen_at.getTime();
        const is24hOld = deviceAge < 24 * 60 * 60 * 1000;

        if (is24hOld) {
            const knownIps = await this.getUserKnownIpHashes(userId);
            const isUnknownIp = !knownIps.includes(session.ip_hash);

            if (isUnknownIp) {
                return true; // Device nuevo + IP desconocida
            }
        }

        // Factor 2: IP hash nunca vista para este usuario
        const userDevices = await this.deviceModel
            .find({ user_id: userId })
            .select('last_ip_hash')
            .exec();

        const allKnownIps = userDevices.map(d => d.last_ip_hash);
        const isNewIp = !allKnownIps.includes(session.ip_hash);

        if (isNewIp) {
            return true; // IP completamente nueva
        }

        // Factor 3: >3 dispositivos activos simultáneos
        const activeDevicesCount = await this.getActiveDevicesCount(userId);
        if (activeDevicesCount > 3) {
            return true; // Muchos dispositivos activos
        }

        return false; // No sospechosa
    }

    /**
     * Obtiene IP hashes conocidos del usuario
     */
    private async getUserKnownIpHashes(
        userId: string | Types.ObjectId,
    ): Promise<string[]> {
        const devices = await this.deviceModel
            .find({ user_id: userId })
            .select('last_ip_hash')
            .exec();

        return devices
            .map((d) => d.last_ip_hash)
            .filter((value): value is string => typeof value === 'string' && value.length > 0);
    }

    /**
     * Cuenta dispositivos activos del usuario
     */
    private async getActiveDevicesCount(
        userId: string | Types.ObjectId,
    ): Promise<number> {
        const activeSessions = await this.sessionModel
            .find({
                user_id: userId,
                revoked_at: { $exists: false },
                expires_at: { $gt: new Date() },
            })
            .distinct('device_id')
            .exec();

        return activeSessions.length;
    }
}
