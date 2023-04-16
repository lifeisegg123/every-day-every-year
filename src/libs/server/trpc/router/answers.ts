import { TRPCError } from "@trpc/server";
import { router, procedure } from "../trpc";
import { z } from "zod";

export const answersRouter = router({
  create: procedure
    .input(
      z.object({
        answer: z.string(),
        questionId: z.string(),
        year: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be signed in to perform this action",
        });
      }

      const answer = await ctx.prisma.answer.create({
        data: {
          description: input.answer,
          year: input.year,
          authorId: ctx.session.id,
          questionId: input.questionId,
        },
      });

      if (!answer) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Answer not created",
        });
      }

      return answer;
    }),

  getByQuestion: procedure
    .input(
      z.object({
        questionId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be signed in to perform this action",
        });
      }

      const answers = await ctx.prisma.answer.findMany({
        where: {
          questionId: input.questionId,
          authorId: ctx.session.id,
        },
      });

      return answers;
    }),
});
