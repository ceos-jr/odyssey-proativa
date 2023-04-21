import { TasksFormSchema } from "@components/lessons/TaskForm";
import { TaskStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { router, adminProcedure, protectedProcedure } from "../trpc";

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
