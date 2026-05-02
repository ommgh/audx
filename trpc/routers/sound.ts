import { z } from "zod/v4";
import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "../init";

const CreateSoundInput = z.object({
	prompt: z.string().min(1).max(500),
	blobUrl: z.string().url(),
	duration: z.number().min(0.1).max(30),
	sizeKb: z.number().int().min(1),
});

export const soundRouter = createTRPCRouter({
	create: protectedProcedure
		.input(CreateSoundInput)
		.mutation(async ({ ctx, input }) => {
			const sound = await prisma.generatedSound.create({
				data: {
					prompt: input.prompt,
					blobUrl: input.blobUrl,
					duration: input.duration,
					sizeKb: input.sizeKb,
					userId: ctx.auth.user.id,
				},
			});
			return sound;
		}),

	list: protectedProcedure.query(async ({ ctx }) => {
		return prisma.generatedSound.findMany({
			where: { userId: ctx.auth.user.id },
		});
	}),
});
