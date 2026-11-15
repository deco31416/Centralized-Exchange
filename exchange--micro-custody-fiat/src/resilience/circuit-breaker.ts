export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export class CircuitOpenError extends Error {
  constructor(message = 'Circuit breaker is open') {
    super(message);
    this.name = 'CircuitOpenError';
  }
}

export interface CircuitBreakerOptions {
  failureThreshold: number; // consecutive failures
  resetTimeoutMs: number;
}

/**
 * Circuit breaker simple (consecutive failures).
 *
 * - CLOSED: permite tráfico, cuenta fallas consecutivas.
 * - OPEN: rechaza hasta resetTimeout.
 * - HALF_OPEN: permite 1 request de prueba.
 */
export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private consecutiveFailures = 0;
  private openUntil = 0;
  private halfOpenInFlight = false;

  constructor(private readonly options: CircuitBreakerOptions) {}

  getState(): CircuitState {
    if (this.state === 'OPEN' && Date.now() >= this.openUntil) {
      this.state = 'HALF_OPEN';
      this.halfOpenInFlight = false;
    }
    return this.state;
  }

  async exec<T>(fn: () => Promise<T>): Promise<T> {
    const state = this.getState();

    if (state === 'OPEN') {
      throw new CircuitOpenError();
    }

    if (state === 'HALF_OPEN') {
      if (this.halfOpenInFlight) {
        throw new CircuitOpenError('Circuit breaker HALF_OPEN (probe in flight)');
      }
      this.halfOpenInFlight = true;
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    } finally {
      if (state === 'HALF_OPEN') {
        this.halfOpenInFlight = false;
      }
    }
  }

  private onSuccess(): void {
    this.consecutiveFailures = 0;
    this.state = 'CLOSED';
    this.openUntil = 0;
  }

  private onFailure(): void {
    this.consecutiveFailures += 1;

    if (this.consecutiveFailures >= this.options.failureThreshold) {
      this.state = 'OPEN';
      this.openUntil = Date.now() + this.options.resetTimeoutMs;
    }
  }
}
