import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { router, protectedProcedure } from "../trpc";

export const commentsRouter = router({
  getByUserId: protectedProcedure
    .input(z.string().optional())
    .query(({ ctx, input }) => {
      if (input && ctx.session.user.role !== "ADMIN")
        throw new TRPCError({ code: "UNAUTHORIZED" });
      const userId = input ? input : ctx.session.user.id;
      return ctx.prisma.lessonComment.findMany({
        where: {
          userId: userId,
        },
        include: {
          lesson: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),

  getByLessonId: protectedProcedure
    .input(z.string().optional())
    .query(({ ctx, input }) => {
      return ctx.prisma.lessonComment.findMany({
        where: {
          lessonId: input,
        },
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),

  createLessComment: protectedProcedure
    .input(z.object({ lessonId: z.string(), text: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.lessonComment.create({
        data: {
          lessonId: input.lessonId,
          userId: ctx.session.user.id,
          text: input.text,
        },
      });
    }),

  deleteLessComment: protectedProcedure
    .input(z.string())
    .mutation(({ ctx, input }) => {
      return ctx.prisma.$transaction(async (tx) => {
        const comment = await tx.lessonComment.findUnique({
          where: {
            id: input,
          },
        });
        if (!comment || comment.userId !== ctx.session.user.id)
          throw new TRPCError({ code: "UNAUTHORIZED" });

        return tx.lessonComment.delete({
          where: {
            id: input,
          },
        });
      });
    }),
});
