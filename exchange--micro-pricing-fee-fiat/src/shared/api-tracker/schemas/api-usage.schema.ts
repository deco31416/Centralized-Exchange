import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Tracks API call usage per source per UTC day.
 * Used to calculate remaining budget for smart cron scheduling.
 */
@Schema({ timestamps: true, collection: 'api_usage_logs' })
export class ApiUsage extends Document {
    /** UTC date string: "2026-02-15" */
    @Prop({ required: true })
    dateUtc: string;

    /** API source: EXCHANGERATE_API | FRANKFURTER | EXCHANGERATE_HOST */
    @Prop({ required: true, uppercase: true })
    source: string;

    /** Number of calls made today */
    @Prop({ type: Number, default: 0 })
    callCount: number;

    /** Daily limit for this source */
    @Prop({ type: Number, required: true })
    dailyLimit: number;

    /** Timestamp of last API call */
    @Prop()
    lastCallAt: Date;

    /** Errors encountered today */
    @Prop({ type: Number, default: 0 })
    errorCount: number;

    /** Rate limit hit? (429 response received) */
    @Prop({ default: false })
    rateLimitHit: boolean;

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;
}

export const ApiUsageSchema = SchemaFactory.createForClass(ApiUsage);

ApiUsageSchema.index({ dateUtc: 1, source: 1 }, { unique: true });
ApiUsageSchema.index({ dateUtc: -1 });
