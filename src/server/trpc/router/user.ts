import { LessSuggestionSchema } from "@components/Layout/LessSuggestionModal";
import { SuggestionFormSchema } from "@components/Layout/ModSuggestionModal";
import { TaskStatus } from "@utils/constants";
import { z } from "zod";

import { router, protectedProcedure } from "../trpc";

export const userRouter = router({
  getMostRecentMod: protectedProcedure
    .input(z.number())
    .query(({ ctx, input }) => {
      return ctx.prisma.userModuleProgress.findMany({
        where: { userId: ctx.session.user.id },
        include: {
          module: { select: { name: true, description: true } },
          lessonProg: { select: { completed: true } },
        },
        orderBy: { lastTimeSeen: "desc" },
        take: input,
      });
    }),
  getUnfMod: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.userModuleProgress.findMany({
      where: { userId: ctx.session.user.id, completed: false },
      include: {
        module: { select: { name: true, description: true } },
        lessonProg: { select: { completed: true } },
      },
      orderBy: { lastTimeSeen: "desc" },
    });
  }),
  getCompMod: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.userModuleProgress.findMany({
      where: { userId: ctx.session.user.id, completed: true },
      include: {
        module: { select: { name: true, description: true } },
        lessonProg: { select: { completed: true } },
      },
      orderBy: { lastTimeSeen: "desc" },
    });
  }),
  getModProg: protectedProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.prisma.userModuleProgress.findUnique({
      where: {
        userId_moduleId: { userId: ctx.session.user.id, moduleId: input },
      },
    });
  }),
  getTaskProg: protectedProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.prisma.userTaskProgress.findUnique({
      where: { userId_taskId: { userId: ctx.session.user.id, taskId: input } },
    });
  }),
  getNumModInProg: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.userModuleProgress.count({
      where: { userId: ctx.session.user.id, completed: false },
    });
  }),
  getLesInProg: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.userLessonProgress.findMany({
      where: { userId: ctx.session.user.id, completed: false },
    });
  }),
  getTaskInProg: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.userTaskProgress.findMany({
      where: {
        userId: ctx.session.user.id,
        NOT: { status: TaskStatus.Completed },
      },
    });
  }),
  getTasks4Less: protectedProcedure
    .input(z.string())
    .query(({ ctx, input }) => {
      return ctx.prisma.userTaskProgress.findMany({
        where: { lessonId: input, userId: ctx.session.user.id },
      });
    }),
  updModLastSeen: protectedProcedure
    .input(z.string())
    .mutation(({ ctx, input }) => {
      return ctx.prisma.userModuleProgress.update({
        where: {
          userId_moduleId: { userId: ctx.session.user.id, moduleId: input },
        },
        data: { lastTimeSeen: new Date() },
      });
    }),
  updLessLastSeen: protectedProcedure
    .input(z.string())
    .mutation(({ ctx, input }) => {
      return ctx.prisma.userLessonProgress.update({
        where: {
          userId_lessonId: { userId: ctx.session.user.id, lessonId: input },
        },
        data: { lastTimeSeen: new Date() },
      });
    }),
  createModSugg: protectedProcedure
    .input(SuggestionFormSchema)
    .mutation(({ ctx, input }) => {
      return ctx.prisma.modSuggestion.create({
        data: {
          moduleId: input.moduleId,
          userId: ctx.session.user.id,
          text: input.text,
        },
      });
    }),
  createLessSugg: protectedProcedure
    .input(LessSuggestionSchema)
    .mutation(({ ctx, input }) => {
      return ctx.prisma.lesSuggestion.create({
        data: {
          lessonId: input.lessonId,
          userId: ctx.session.user.id,
          text: input.text,
        },
      });
    }),
  submitTask: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        richText: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.userTaskProgress.update({
        where: {
          userId_taskId: { taskId: input.id, userId: ctx.session.user.id },
        },
        data: {
          richText: input.richText,
          status: TaskStatus.Submitted,
        },
      });
    }),
  compLesson: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const userProg = await ctx.prisma.userLessonProgress.findUnique({
        where: {
          userId_lessonId: { userId: ctx.session.user.id, lessonId: input },
        },
      });

      if (!userProg?.completed) {
        return ctx.prisma.userLessonProgress.update({
          where: {
            userId_lessonId: { userId: ctx.session.user.id, lessonId: input },
          },
          data: { completed: true, completedAt: new Date() },
        });
      }
    }),
  finishModule: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const userProg = await ctx.prisma.userModuleProgress.findUnique({
        where: {
          userId_moduleId: { userId: ctx.session.user.id, moduleId: input },
        },
      });

      if (!userProg?.completed) {
        return ctx.prisma.userModuleProgress.update({
          where: {
            userId_moduleId: { userId: ctx.session.user.id, moduleId: input },
          },
          data: { completed: true, completedAt: new Date() },
        });
      }
      return null;
    }),
});
