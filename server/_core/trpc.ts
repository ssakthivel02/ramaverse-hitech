import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { createHmac, randomBytes } from "node:crypto";
import { createFixedWindowLimiter } from "./rateLimit";

import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;

// Do not trust caller-controlled X-Forwarded-For without a verified proxy chain.
// Hash the direct peer address with an ephemeral secret: no plaintext IP log/store.
// This is bounded, per-process protection; do not treat it as multi-instance quota.
const remoteSalt = randomBytes(32);
const general = createFixedWindowLimiter({ maxRequests: 1200, windowMs: 60_000, maxEntries: 20_000 });
const costly = createFixedWindowLimiter({ maxRequests: 60, windowMs: 60_000, maxEntries: 20_000 });
function remoteKey(ctx: TrpcContext) {
  return createHmac("sha256", remoteSalt)
    .update(ctx.req?.socket?.remoteAddress || "unidentified-peer")
    .digest("hex");
}
function rejectIfLimited(ctx: TrpcContext, result: ReturnType<typeof general.consume>) {
  if (result.allowed) return;
  ctx.res?.setHeader?.("Retry-After", String(result.retryAfterSeconds));
  ctx.res?.setHeader?.("Cache-Control", "no-store");
  throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Request limit reached; retry later." });
}
const generalLimiter = t.middleware(async ({ ctx, next }) => {
  rejectIfLimited(ctx, general.consume(remoteKey(ctx)));
  return next();
});
const costlyLimiter = t.middleware(async ({ ctx, next, path }) => {
  rejectIfLimited(ctx, costly.consume(remoteKey(ctx) + ":" + path));
  return next();
});
export const publicProcedure = t.procedure.use(generalLimiter);
export const expensivePublicProcedure = publicProcedure.use(costlyLimiter);

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== 'admin') {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);
