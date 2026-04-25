import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "../init";

export const profileRouter = createTRPCRouter({
	getProfile: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.auth.user.id;

		const [themes, sounds] = await Promise.all([
			prisma.generatedTheme.findMany({
				where: { userId },
				select: {
					id: true,
					name: true,
					createdAt: true,
					assetCount: true,
				},
			}),
			prisma.generatedSound.findMany({
				where: { userId },
				select: {
					id: true,
					prompt: true,
					createdAt: true,
					duration: true,
				},
			}),
		]);

		return {
			user: {
				id: ctx.auth.user.id,
				name: ctx.auth.user.name,
				email: ctx.auth.user.email,
				image: ctx.auth.user.image ?? null,
			},
			themes,
			sounds,
		};
	}),
});
