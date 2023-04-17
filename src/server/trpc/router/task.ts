import { TasksFormSchema } from "@components/lessons/TaskForm";
import { z } from "zod";

import { router, adminProcedure } from "../trpc";

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
});
