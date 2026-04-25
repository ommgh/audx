import { createTRPCRouter } from "../init";
import { profileRouter } from "./profile";
import { soundRouter } from "./sound";
import { themeRouter } from "./theme";

export const appRouter = createTRPCRouter({
	theme: themeRouter,
	sound: soundRouter,
	profile: profileRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
