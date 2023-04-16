import { TRPCError } from "@trpc/server";
import { router, procedure } from "../trpc";
import { z } from "zod";

export const questionsRouter = router({
  getOne: procedure
    .input(
      z.object({
        date: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const question = await ctx.prisma.question.findUnique({
        where: {
          date: input.date,
        },
        select: {
          description: true,
          id: true,
        },
      });

      if (!question) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Question not found",
        });
      }

      return question;
    }),
});
