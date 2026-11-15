import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { ApiUsage } from './schemas/api-usage.schema';

/**
 * API Rate-Limit Tracker
 *
 * Tracks API calls per source per 24h UTC window.
 * Calculates remaining budget and adjusts cron interval dynamically.
 *
 * Daily limits (free tiers):
 *   ExchangeRate-API:   1,500 calls/month  ≈  50/day
 *   Frankfurter:        No hard limit (ECB data)
 *   exchangerate.host:  Varies by plan
 *
 * The service exposes getRemainingBudget() and getOptimalIntervalMs()
 * for the PricingService to use in its smart cron.
 */
@Injectable()
export class ApiTrackerService {
    private readonly logger = new Logger(ApiTrackerService.name);

    // Default daily limits (can be overridden via env)
    private readonly LIMITS: Record<string, number> = {};

    // Interval bounds (configurable via env)
    private readonly MIN_INTERVAL: number;
    private readonly MAX_INTERVAL: number;

    // Manual override (set via PATCH endpoint, cleared on restart)
    private intervalOverrideMs: number | null = null;

    constructor(
        @InjectModel(ApiUsage.name) private usageModel: Model<ApiUsage>,
        private readonly configService: ConfigService,
    ) {
        this.LIMITS = {
            EXCHANGERATE_API: this.configService.get<number>('EXCHANGERATE_API_DAILY_LIMIT', 50),
            FRANKFURTER: this.configService.get<number>('FRANKFURTER_DAILY_LIMIT', 500),
            EXCHANGERATE_HOST: this.configService.get<number>('EXCHANGERATE_HOST_DAILY_LIMIT', 100),
            FLOATRATES: this.configService.get<number>('FLOATRATES_DAILY_LIMIT', 500),
            FAWAZ_CURRENCY: this.configService.get<number>('FAWAZ_CURRENCY_DAILY_LIMIT', 1000),
        };

        // Default: 1 hour min, 4 hours max → ~24 auto-calls/day
        this.MIN_INTERVAL = this.configService.get<number>('CRON_MIN_INTERVAL_MS', 3_600_000);
        this.MAX_INTERVAL = this.configService.get<number>('CRON_MAX_INTERVAL_MS', 14_400_000);
    }

    // ─── Track a call ────────────────────────────────────────────────

    /**
     * Record an API call for a source. Call this AFTER each external API request.
     * Returns remaining calls for the day.
     */
    async trackCall(source: string, wasError = false): Promise<{ remaining: number; total: number }> {
        const dateUtc = this.getTodayUtc();
        const src = source.toUpperCase();
        const dailyLimit = this.LIMITS[src] || 300;

        const usage = await this.usageModel.findOneAndUpdate(
            { dateUtc, source: src },
            {
                $inc: { callCount: 1, ...(wasError ? { errorCount: 1 } : {}) },
                $set: { lastCallAt: new Date(), dailyLimit },
                $setOnInsert: { dateUtc, source: src },
            },
            { upsert: true, new: true },
        ).exec();

        const remaining = Math.max(0, dailyLimit - usage.callCount);

        if (remaining <= 10) {
            this.logger.warn(`[ApiTracker] ⚠️ ${src}: Only ${remaining} calls remaining today!`);
        }

        return { remaining, total: dailyLimit };
    }

    /**
     * Mark that a 429 rate limit response was received.
     */
    async trackRateLimit(source: string): Promise<void> {
        const dateUtc = this.getTodayUtc();
        await this.usageModel.findOneAndUpdate(
            { dateUtc, source: source.toUpperCase() },
            { $set: { rateLimitHit: true } },
        ).exec();
        this.logger.error(`[ApiTracker] 🚫 ${source} rate limit hit! Stopping calls.`);
    }

    // ─── Budget Queries ──────────────────────────────────────────────

    /**
     * Get remaining budget for today.
     */
    async getRemainingBudget(): Promise<Record<string, { used: number; remaining: number; limit: number; rateLimitHit: boolean }>> {
        const dateUtc = this.getTodayUtc();
        const usages = await this.usageModel.find({ dateUtc }).exec();

        const budget: Record<string, any> = {};
        for (const [src, limit] of Object.entries(this.LIMITS)) {
            const usage = usages.find(u => u.source === src);
            budget[src] = {
                used: usage?.callCount ?? 0,
                remaining: Math.max(0, limit - (usage?.callCount ?? 0)),
                limit,
                rateLimitHit: usage?.rateLimitHit ?? false,
            };
        }
        return budget;
    }

    /**
     * Can we still call this source today?
     */
    async canCall(source: string): Promise<boolean> {
        const dateUtc = this.getTodayUtc();
        const src = source.toUpperCase();
        const usage = await this.usageModel.findOne({ dateUtc, source: src }).exec();
        if (!usage) return true;
        if (usage.rateLimitHit) return false;
        return usage.callCount < (this.LIMITS[src] || 300);
    }

    /**
     * Calculate the optimal refresh interval (ms) based on remaining API budget.
     *
     * Logic:
     *   remainingSeconds = seconds left in the UTC day
     *   minRemaining = minimum remaining calls across all sources
     *   interval = remainingSeconds / minRemaining * 1000 (in ms)
     *   Clamped between 30s (minimum) and 5min (maximum)
     *
     * If any source hit rate limit, return max interval.
     */
    async getOptimalIntervalMs(): Promise<{ intervalMs: number; reason: string }> {
        // Manual override takes priority
        if (this.intervalOverrideMs !== null) {
            return {
                intervalMs: this.intervalOverrideMs,
                reason: `Manual override: ${Math.round(this.intervalOverrideMs / 1000)}s`,
            };
        }

        const budget = await this.getRemainingBudget();

        const SAFETY_FACTOR = 1.2;      // Keep 20% buffer

        // Check if any source hit rate limits
        for (const [src, info] of Object.entries(budget)) {
            if (info.rateLimitHit) {
                return { intervalMs: this.MAX_INTERVAL, reason: `${src} rate limit hit — max interval` };
            }
        }

        // Minimum remaining calls across all active sources
        const remainingCalls = Object.values(budget).map(b => b.remaining);
        const minRemaining = Math.min(...remainingCalls);

        if (minRemaining <= 0) {
            return { intervalMs: this.MAX_INTERVAL, reason: 'Daily budget exhausted — max interval' };
        }

        // Seconds left in UTC day
        const now = new Date();
        const endOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
        const remainingSeconds = Math.max(1, (endOfDay.getTime() - now.getTime()) / 1000);

        // Calculate optimal interval
        const optimalMs = (remainingSeconds / minRemaining) * SAFETY_FACTOR * 1000;
        const clampedMs = Math.min(this.MAX_INTERVAL, Math.max(this.MIN_INTERVAL, Math.round(optimalMs)));

        return {
            intervalMs: clampedMs,
            reason: `${minRemaining} calls remaining, ${Math.round(remainingSeconds / 60)}min left → ${Math.round(clampedMs / 1000)}s interval`,
        };
    }

    /**
     * Manually override the refresh interval. Set to null to return to auto mode.
     */
    setIntervalOverride(ms: number | null): { intervalMs: number | null; mode: string } {
        this.intervalOverrideMs = ms;
        const mode = ms ? `manual (${Math.round(ms / 1000)}s)` : 'auto';
        this.logger.log(`⏱️  Interval mode: ${mode}`);
        return { intervalMs: ms, mode };
    }

    /**
     * Get current interval configuration.
     */
    getIntervalConfig() {
        return {
            minIntervalMs: this.MIN_INTERVAL,
            maxIntervalMs: this.MAX_INTERVAL,
            overrideMs: this.intervalOverrideMs,
            mode: this.intervalOverrideMs ? 'manual' : 'auto',
        };
    }

    // ─── Dashboard ───────────────────────────────────────────────────

    /**
     * Full usage summary — for admin dashboard.
     */
    async getUsageSummary(): Promise<any> {
        const budget = await this.getRemainingBudget();
        const optimal = await this.getOptimalIntervalMs();

        return {
            dateUtc: this.getTodayUtc(),
            sources: budget,
            smartCron: {
                currentIntervalMs: optimal.intervalMs,
                currentIntervalSec: Math.round(optimal.intervalMs / 1000),
                reason: optimal.reason,
            },
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * Get historical usage (last N days).
     */
    async getHistory(days = 7): Promise<ApiUsage[]> {
        const cutoff = new Date();
        cutoff.setUTCDate(cutoff.getUTCDate() - days);
        const cutoffStr = cutoff.toISOString().slice(0, 10);

        return this.usageModel
            .find({ dateUtc: { $gte: cutoffStr } })
            .sort({ dateUtc: -1, source: 1 })
            .exec();
    }

    // ─── Midnight Reset Log ──────────────────────────────────────────

    /** Log end-of-day summary at 23:59 UTC */
    @Cron('0 59 23 * * *', { timeZone: 'UTC' })
    async endOfDaySummary() {
        const budget = await this.getRemainingBudget();
        this.logger.log('━━━ End of UTC Day API Usage Summary ━━━');
        for (const [src, info] of Object.entries(budget)) {
            this.logger.log(`  ${src}: ${info.used}/${info.limit} calls (${info.remaining} remaining)`);
        }
    }

    // ─── Helpers ─────────────────────────────────────────────────────

    private getTodayUtc(): string {
        return new Date().toISOString().slice(0, 10);
    }
}
