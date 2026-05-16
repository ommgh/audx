import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "../init";

export const profileRouter = createTRPCRouter({
	getProfile: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.auth.user.id;

		const [payments] = await Promise.all([
			prisma.payment.findMany({
				where: { userId },
				select: {
					id: true,
					paymentId: true,
					status: true,
					amount: true,
					currency: true,
					createdAt: true,
				},
				orderBy: { createdAt: "desc" },
			}),
		]);

		const hasPro = payments.some((p) => p.status === "succeeded");

		return {
			user: {
				id: ctx.auth.user.id,
				name: ctx.auth.user.name,
				email: ctx.auth.user.email,
				image: ctx.auth.user.image ?? null,
			},
			plan: {
				isPro: hasPro,
				payments,
			},
		};
	}),
});
