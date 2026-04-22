import { z } from "zod";

export const themeNameSchema = z
	.string()
	.min(1)
	.max(50)
	.regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens");

export const generateThemeRequestSchema = z.object({
	themeName: themeNameSchema,
	themePrompt: z.string().min(1).max(300),
	sounds: z
		.array(
			z.object({
				semanticName: z.string(),
				duration: z.number().min(0.1).max(2.0),
			}),
		)
		.min(1)
		.max(67),
});

export type GenerateThemeRequest = z.infer<typeof generateThemeRequestSchema>;

export const saveThemeRequestSchema = z.object({
	themeName: themeNameSchema,
	themePrompt: z.string().min(1).max(300),
	sounds: z
		.array(
			z.object({
				semanticName: z.string(),
				audioBase64: z.string(),
				duration: z.number(),
			}),
		)
		.min(60)
		.max(67),
});

export type SaveThemeRequest = z.infer<typeof saveThemeRequestSchema>;
