// Rate limiting utility to prevent abuse of game actions

interface RateLimitConfig {
  maxCalls: number;
  timeWindow: number; // in milliseconds
}

class RateLimiter {
  private calls: Map<string, number[]> = new Map();

  isAllowed(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const windowStart = now - config.timeWindow;

    if (!this.calls.has(key)) {
      this.calls.set(key, [now]);
      return true;
    }

    const callTimes = this.calls.get(key)!;

    // Remove old calls outside the time window
    const validCalls = callTimes.filter((time) => time > windowStart);

    if (validCalls.length >= config.maxCalls) {
      return false;
    }

    validCalls.push(now);
    this.calls.set(key, validCalls);
    return true;
  }

  getRemainingCalls(key: string, config: RateLimitConfig): number {
    const now = Date.now();
    const windowStart = now - config.timeWindow;

    if (!this.calls.has(key)) {
      return config.maxCalls;
    }

    const callTimes = this.calls.get(key)!;
    const validCalls = callTimes.filter((time) => time > windowStart);

    return Math.max(0, config.maxCalls - validCalls.length);
  }

  reset(key: string): void {
    this.calls.delete(key);
  }

  clear(): void {
    this.calls.clear();
  }
}

// Global rate limiter instance
export const rateLimiter = new RateLimiter();

// Predefined rate limit configurations
export const RATE_LIMITS = {
  PHASE_OUT: { maxCalls: 5, timeWindow: 10000 }, // 5 phase-outs per 10 seconds
  INVESTMENT: { maxCalls: 10, timeWindow: 5000 }, // 10 investments per 5 seconds
  RESTART: { maxCalls: 3, timeWindow: 30000 }, // 3 restarts per 30 seconds
  GENERAL: { maxCalls: 20, timeWindow: 10000 }, // 20 general actions per 10 seconds
} as const;

// Helper function to check rate limits
export function checkRateLimit(
  action: keyof typeof RATE_LIMITS,
  userId?: string,
): boolean {
  const key = userId ? `${action}:${userId}` : action;
  return rateLimiter.isAllowed(key, RATE_LIMITS[action]);
}

// Helper function to get remaining calls
export function getRemainingCalls(
  action: keyof typeof RATE_LIMITS,
  userId?: string,
): number {
  const key = userId ? `${action}:${userId}` : action;
  return rateLimiter.getRemainingCalls(key, RATE_LIMITS[action]);
}
