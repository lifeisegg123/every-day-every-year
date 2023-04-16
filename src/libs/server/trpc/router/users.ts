import { TRPCError } from "@trpc/server";
import { router, procedure } from "../trpc";

export const usersRouter = router({
  me: procedure.query(async ({ ctx, input }) => {
    console.log("why context not work", ctx.session);
    if (!ctx.session) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be signed in to perform this action",
      });
    }
    const me = await ctx.prisma.user.findUnique({
      where: {
        id: ctx.session.id,
      },
    });

    if (!me) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return me;
  }),
});
