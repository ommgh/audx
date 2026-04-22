import { z } from "zod";

export const generateSoundSchema = z.object({
	text: z.string().min(1, "Prompt is required").max(500, "Prompt too long"),
	duration_seconds: z.number().min(0.5).max(30).optional(),
	prompt_influence: z.number().min(0).max(1).optional(),
});

export type GenerateSoundInput = z.infer<typeof generateSoundSchema>;
