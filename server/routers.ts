import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { ramaverseRouter } from "./routers/ramaverse";
import { seedDatabase } from "./seed";

// Seed database on startup asynchronously
seedDatabase().catch(err => console.error("[Seed] Startup seeding error:", err));

export const appRouter = router({
  system: systemRouter,
  ramaverse: ramaverseRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
});

export type AppRouter = typeof appRouter;
