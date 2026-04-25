import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";
import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "../init";

const CreateThemeInput = z.object({
	name: z
		.string()
		.min(1)
		.max(50)
		.regex(/^[a-z0-9-]+$/),
	prompt: z.string().min(1).max(300),
	blobIndexUrl: z.string().url(),
	assetCount: z.number().int().min(1),
});

export const themeRouter = createTRPCRouter({
	create: protectedProcedure
		.input(CreateThemeInput)
		.mutation(async ({ ctx, input }) => {
			try {
				const theme = await prisma.generatedTheme.create({
					data: {
						name: input.name,
						prompt: input.prompt,
						blobIndexUrl: input.blobIndexUrl,
						assetCount: input.assetCount,
						userId: ctx.auth.user.id,
					},
				});
				return theme;
			} catch (error) {
				if (
					error instanceof Error &&
					"code" in error &&
					(error as { code: string }).code === "P2002"
				) {
					throw new TRPCError({
						code: "CONFLICT",
						message: "Theme already exists",
					});
				}
				throw error;
			}
		}),

	list: protectedProcedure.query(async ({ ctx }) => {
		return prisma.generatedTheme.findMany({
			where: { userId: ctx.auth.user.id },
		});
	}),

	getByName: protectedProcedure
		.input(z.string())
		.query(async ({ ctx, input }) => {
			const theme = await prisma.generatedTheme.findFirst({
				where: {
					userId: ctx.auth.user.id,
					name: input,
				},
			});

			if (!theme) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Theme not found",
				});
			}

			return theme;
		}),
});
