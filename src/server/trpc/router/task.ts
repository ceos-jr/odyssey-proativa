import { TasksFormSchema } from "@utils/schemas";
import { TaskStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { router, adminProcedure, protectedProcedure } from "../trpc";

type TotalAndUnfCountByUser = {
  total: bigint;
  finished: bigint;
};

export const taskRouter = router({
  createTask: adminProcedure
    .input(TasksFormSchema)
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.prisma.task.create({
        data: {
          lessonId: input.lessonId,
          name: input.name,
          richText: input.richText,
        },
      });

      const users = await ctx.prisma.userLessonProgress.findMany({
        where: { lessonId: input.lessonId },
        select: { userId: true },
      });

      return ctx.prisma.userTaskProgress.createMany({
        data: users.map((user) => ({
          lessonId: input.lessonId,
          taskId: task.id,
          userId: user.userId,
        })),
      });
    }),
  updateTask: adminProcedure
    .input(TasksFormSchema)
    .mutation(({ ctx, input }) => {
      return ctx.prisma.task.update({
        where: { id: input.id },
        data: {
          name: input.name,
          richText: input.richText,
        },
      });
    }),
  deleteTask: adminProcedure.input(z.string()).mutation(({ ctx, input }) => {
    return ctx.prisma.task.delete({ where: { id: input } });
  }),
  lastTasksByUser: protectedProcedure
    .input(z.string().optional())
    .query(({ ctx, input }) => {
      if (input && ctx.session.user.role !== "ADMIN")
        throw new TRPCError({ code: "UNAUTHORIZED" });
      const userId = input ? input : ctx.session.user.id;

      return ctx.prisma.userTaskProgress.findMany({
        where: { userId },
        include: { task: { select: { name: true } } },
        orderBy: { completedAt: "desc" },
        take: 5,
      });
    }),
  totalAndUnfCountByUser: protectedProcedure
    .input(z.string().optional())
    .query(async ({ ctx, input }) => {
      if (input && ctx.session.user.role !== "ADMIN")
        throw new TRPCError({ code: "UNAUTHORIZED" });
      const userId = input ? input : ctx.session.user.id;

      const data = await ctx.prisma.$queryRaw<TotalAndUnfCountByUser[]>`
        SELECT 
          COUNT(*) AS total, 
          COUNT(CASE WHEN status::text = ${TaskStatus.COMPLETED}::text THEN 1 ELSE NULL END) AS finished
        FROM "UserTaskProgress"
        WHERE "userId" = ${userId}
      `;
      return {
        total: Number(data[0]?.total),
        finished: Number(data[0]?.finished),
      };
    }),
  totalTasksByUser: protectedProcedure
    .input(z.string().optional())
    .query(({ ctx, input }) => {
      if (input && ctx.session.user.role !== "ADMIN")
        throw new TRPCError({ code: "UNAUTHORIZED" });
      const userId = input ? input : ctx.session.user.id;
      return ctx.prisma.userTaskProgress.count({
        where: { userId },
      });
    }),
  finTasksByUser: protectedProcedure
    .input(z.string().optional())
    .query(({ ctx, input }) => {
      if (input && ctx.session.user.role !== "ADMIN")
        throw new TRPCError({ code: "UNAUTHORIZED" });
      const userId = input ? input : ctx.session.user.id;
      return ctx.prisma.userTaskProgress.count({
        where: { userId, status: TaskStatus.COMPLETED },
      });
    }),
});
