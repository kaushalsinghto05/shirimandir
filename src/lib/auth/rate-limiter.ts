/**
 * Sliding Window In-Memory Rate Limiter (FR-AUTH-005)
 * Prevents brute force and credential stuffing attacks on auth endpoints.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const hitStore = new Map<string, RateLimitRecord>();

export interface RateLimitOptions {
  windowMs: number; // e.g. 15 minutes (15 * 60 * 1000)
  maxAttempts: number; // e.g. 5 attempts
}

export function checkRateLimit(
  key: string,
  options: RateLimitOptions = { windowMs: 15 * 60 * 1000, maxAttempts: 5 }
): { allowed: boolean; remainingAttempts: number; retryAfterSeconds?: number } {
  const now = Date.now();
  const windowStart = now - options.windowMs;

  let record = hitStore.get(key);
  if (!record) {
    record = { timestamps: [] };
    hitStore.set(key, record);
  }

  // Purge expired timestamps
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (record.timestamps.length >= options.maxAttempts) {
    const oldestTimestamp = record.timestamps[0];
    const retryAfterSeconds = Math.ceil((oldestTimestamp + options.windowMs - now) / 1000);
    return {
      allowed: false,
      remainingAttempts: 0,
      retryAfterSeconds: Math.max(1, retryAfterSeconds),
    };
  }

  record.timestamps.push(now);
  return {
    allowed: true,
    remainingAttempts: options.maxAttempts - record.timestamps.length,
  };
}

export function resetRateLimit(key: string): void {
  hitStore.delete(key);
}
