export const CREDITS_PER_SECOND = 20;
export const APPROX_DOLLAR_PER_CREDIT = 0.000018;

export interface CostEstimate {
	totalCredits: number;
	approximateDollars: number;
	soundCount: number;
}

export function estimateCost(
	sounds: Array<{ duration: number }>,
): CostEstimate {
	const totalCredits = sounds.reduce(
		(sum, sound) => sum + sound.duration * CREDITS_PER_SECOND,
		0,
	);

	return {
		totalCredits,
		approximateDollars: totalCredits * APPROX_DOLLAR_PER_CREDIT,
		soundCount: sounds.length,
	};
}
