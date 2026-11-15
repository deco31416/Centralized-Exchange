import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SessionEventDocument = SessionEvent & Document;

@Schema({ timestamps: true, collection: 'session_events' })
export class SessionEvent {
    @Prop({ required: false, index: true })
    userId?: string;

    @Prop({ required: true, index: true })
    action: string; // 'login_success', 'login_fail', 'register', 'otp_sent', 'otp_verified', 'password_reset', etc.

    @Prop({ required: true })
    ipHash: string; // SHA-256 hash of IP address

    @Prop({ required: false })
    ipPrefix?: string; // e.g., '192.168.1.0/24' or '2001:db8::/48'

    @Prop({ required: true })
    userAgent: string; // Truncated UA string

    @Prop({ required: true })
    userAgentHash: string; // SHA-256 hash of full UA

    @Prop({ required: true, enum: ['mobile', 'tablet', 'desktop'] })
    deviceType: string;

    @Prop({ required: true })
    os: string; // Parsed from UA (e.g., 'Windows 10', 'iOS 15.0')

    @Prop({ required: true })
    browser: string; // Parsed from UA (e.g., 'Chrome 96.0.0')

    @Prop({ required: true, enum: ['success', 'fail'], index: true })
    outcome: string;

    @Prop({ required: false })
    correlationId?: string; // Request tracking ID

    @Prop({ type: Object, required: false })
    metadata?: Record<string, any>; // Additional context (error codes, feature flags, etc.)

    @Prop({ required: true, index: true })
    timestamp: Date;
}

export const SessionEventSchema = SchemaFactory.createForClass(SessionEvent);

// Indexes for common queries
SessionEventSchema.index({ userId: 1, timestamp: -1 });
SessionEventSchema.index({ action: 1, outcome: 1 });
SessionEventSchema.index({ correlationId: 1 });

// TTL index to auto-delete events after 90 days (optional, can be configured)
// SessionEventSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });
