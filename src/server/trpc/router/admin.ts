import { Roles, TaskStatus } from "@utils/constants";
import { z } from "zod";

import { router, adminProcedure } from "../trpc";

export const adminRouter = router({
  getUserCount: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.user.count({
      where: { NOT: { role: Roles.Guest } },
    });
  }),
  getAllMembers: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findMany({
      include: { modulesProgress: { select: { completed: true } } },
      where: { NOT: { role: Roles.Guest } },
    });
  }),
  getGuests: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findMany({
      where: { role: Roles.Guest },
    });
  }),
  getModCount: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.module.count({});
  }),
  getLessCount: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.lesson.count({});
  }),
  getModSuggestions: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.modSuggestion.findMany({
      include: {
        module: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, image: true } },
      },
    });
  }),
  getLessSuggestions: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.lesSuggestion.findMany({
      include: {
        lesson: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, image: true } },
      },
    });
  }),
  getLatestSubmissions: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.userTaskProgress.findMany({
      where: {
        status: TaskStatus.Submitted,
      },
      include: {
        user: { select: { name: true, image: true } },
        task: true,
      },
    });
  }),
  delUser: adminProcedure.input(z.string()).mutation(({ ctx, input }) => {
    return ctx.prisma.user.delete({
      where: { id: input },
    });
  }),
  aproveGuest: adminProcedure
    .input(z.string())
    .mutation(({ ctx, input: id }) => {
      return ctx.prisma.user.update({
        data: { role: Roles.Member },
        where: { id: id },
      });
    }),
  attributeGrade: adminProcedure
    .input(
      z.object({ taskId: z.string(), userId: z.string(), grade: z.number() })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.userTaskProgress.update({
        where: {
          userId_taskId: {
            taskId: input.taskId,
            userId: input.userId,
          },
        },
        data: {
          grade: input.grade,
          completedAt: new Date(),
          status: TaskStatus.Completed,
        },
      });
    }),
  delModule: adminProcedure.input(z.string()).mutation(({ ctx, input }) => {
    return ctx.prisma.module.delete({ where: { id: input } });
  }),
  //TODO:VAMO DIVIDIR AQUI
  getUser: adminProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.prisma.user.findUnique({
      where: { id: input },
    });
  }),
  getUserModuleList: adminProcedure
    .input(z.string())
    .query(({ ctx, input }) => {
      return ctx.prisma.userModuleProgress.findMany({
        where: { userId: input },
        include: { module: { select: { name: true } } },
      });
    }),
});
