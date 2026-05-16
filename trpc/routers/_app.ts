import { createTRPCRouter } from "../init";
import { profileRouter } from "./profile";

export const appRouter = createTRPCRouter({
	profile: profileRouter,
});

export type AppRouter = typeof appRouter;
