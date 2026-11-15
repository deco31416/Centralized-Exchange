import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { TokensService } from './tokens.service';

/**
 * Simulation Engine — Algorithmic Price Generator
 *
 * For tokens with pricingModel = 'SIMULATED', this engine generates
 * realistic-looking price movements using a random walk algorithm:
 *
 *   newPrice = currentPrice
 *     × (1 + dailyDrift / ticksPerDay)          ← trend component
 *     × (1 + gaussianNoise × volatility)        ← random noise
 *     × (1 + meanReversion × (initial/current - 1))  ← mean reversion
 *   newPrice = CLAMP(newPrice, floor, ceiling)
 *
 * The admin can change trend/volatility at any time via token update.
 * The admin can override ANY simulated price with the price update endpoint.
 */
@Injectable()
export class SimulationEngineService implements OnModuleInit {
    private readonly logger = new Logger(SimulationEngineService.name);
    private intervalRefs = new Map<string, ReturnType<typeof setTimeout>>();

    constructor(private readonly tokensService: TokensService) { }

    async onModuleInit() {
        // Start simulation for all enabled SIMULATED tokens after 10s
        setTimeout(() => this.startAllSimulations(), 10_000);
    }

    // ─── Control ─────────────────────────────────────────────────────

    async startAllSimulations(): Promise<void> {
        const tokens = await this.tokensService.getSimulatedTokens();
        this.logger.log(`🎰 Starting simulation engine for ${tokens.length} token(s)`);

        for (const token of tokens) {
            this.startSimulation(token.tokenCode, token.simulationConfig?.tickIntervalMs || 300_000);
        }
    }

    startSimulation(tokenCode: string, intervalMs: number): void {
        // Stop existing simulation if any
        this.stopSimulation(tokenCode);

        this.logger.log(`▶️  Simulation started: ${tokenCode} (tick every ${intervalMs / 1000}s)`);
        this.scheduleNextTick(tokenCode, intervalMs);
    }

    stopSimulation(tokenCode: string): void {
        const existing = this.intervalRefs.get(tokenCode);
        if (existing) {
            clearTimeout(existing);
            this.intervalRefs.delete(tokenCode);
            this.logger.log(`⏹️  Simulation stopped: ${tokenCode}`);
        }
    }

    stopAllSimulations(): void {
        for (const [code] of this.intervalRefs) {
            this.stopSimulation(code);
        }
    }

    // ─── Price Generation ────────────────────────────────────────────

    private scheduleNextTick(tokenCode: string, intervalMs: number): void {
        const ref = setTimeout(async () => {
            try {
                await this.generateTick(tokenCode);
            } catch (error) {
                this.logger.error(`[Sim] Tick failed for ${tokenCode}: ${error.message}`);
            }
            // Schedule next tick (re-read interval in case it changed)
            const token = await this.tokensService.findByCode(tokenCode).catch(() => null);
            if (token && token.enabled && token.pricingModel === 'SIMULATED' && token.simulationConfig?.enabled) {
                this.scheduleNextTick(tokenCode, token.simulationConfig.tickIntervalMs || intervalMs);
            } else {
                this.intervalRefs.delete(tokenCode);
            }
        }, intervalMs);

        this.intervalRefs.set(tokenCode, ref);
    }

    private async generateTick(tokenCode: string): Promise<void> {
        const token = await this.tokensService.findByCode(tokenCode);
        if (!token || !token.enabled || token.pricingModel !== 'SIMULATED') return;

        const config = token.simulationConfig;
        if (!config || !config.enabled) return;

        const currentPrice = token.currentPriceUsd;
        const ticksPerDay = (24 * 60 * 60 * 1000) / (config.tickIntervalMs || 300_000);

        // ─── 1. Trend component (daily drift distributed per tick) ───
        let driftFactor = 1;
        const dailyDrift = config.dailyDriftPct / 100;

        switch (config.trend) {
            case 'BULLISH':
                driftFactor = 1 + Math.abs(dailyDrift) / ticksPerDay;
                break;
            case 'BEARISH':
                driftFactor = 1 - Math.abs(dailyDrift) / ticksPerDay;
                break;
            case 'SIDEWAYS':
                driftFactor = 1 + (dailyDrift * 0.1) / ticksPerDay; // Very weak drift
                break;
            case 'VOLATILE':
                // Drift oscillates randomly
                driftFactor = 1 + (dailyDrift * (Math.random() > 0.5 ? 1 : -1)) / ticksPerDay;
                break;
            default:
                driftFactor = 1;
        }

        // ─── 2. Random noise (Gaussian) ──────────────────────────────
        const noise = this.gaussianRandom() * (config.volatilityPct / 100) / Math.sqrt(ticksPerDay);

        // ─── 3. Mean reversion ───────────────────────────────────────
        const initialPrice = config.initialPrice || currentPrice;
        const reversionForce = config.meanReversion * ((initialPrice / currentPrice) - 1) / ticksPerDay;

        // ─── 4. Calculate new price ──────────────────────────────────
        let newPrice = currentPrice * driftFactor * (1 + noise) * (1 + reversionForce);

        // ─── 5. Clamp to floor/ceiling ───────────────────────────────
        if (token.priceFloorUsd > 0) newPrice = Math.max(newPrice, token.priceFloorUsd);
        if (token.priceCeilingUsd > 0) newPrice = Math.min(newPrice, token.priceCeilingUsd);

        // Clamp to reasonable bounds (never negative, never absurdly large)
        newPrice = Math.max(newPrice, 0.000001);
        newPrice = Math.round(newPrice * 1_000_000) / 1_000_000; // 6 decimal precision

        const drift = ((newPrice - currentPrice) / currentPrice) * 100;

        // ─── 6. Save ─────────────────────────────────────────────────
        await this.tokensService.updatePriceInternal(
            tokenCode,
            newPrice,
            'SIMULATION',
            `Simulated tick: ${config.trend} drift=${drift.toFixed(4)}%`,
            { trend: config.trend, drift },
        );

        this.logger.debug(
            `[Sim] ${tokenCode}: $${currentPrice.toFixed(6)} → $${newPrice.toFixed(6)} ` +
            `(${drift >= 0 ? '+' : ''}${drift.toFixed(4)}%) trend=${config.trend}`,
        );
    }

    /**
     * Box-Muller transform → Gaussian random number (mean=0, stddev=1)
     */
    private gaussianRandom(): number {
        const u1 = Math.random();
        const u2 = Math.random();
        return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    }
}
