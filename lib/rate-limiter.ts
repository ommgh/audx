export interface RateLimitResult {
	allowed: boolean;
	remaining: number;
	limit: number;
}

interface RateLimitEntry {
	count: number;
	resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

export function checkRateLimit(
	ip: string,
	limit: number,
	windowMs: number,
): RateLimitResult {
	const now = Date.now();
	const entry = store.get(ip);

	if (!entry || now >= entry.resetAt) {
		store.set(ip, { count: 1, resetAt: now + windowMs });
		return { allowed: true, remaining: limit - 1, limit };
	}

	if (entry.count < limit) {
		entry.count += 1;
		return { allowed: true, remaining: limit - entry.count, limit };
	}

	return { allowed: false, remaining: 0, limit };
}

/** Exported for testing — clears all rate limit state */
export function resetRateLimitStore(): void {
	store.clear();
}
