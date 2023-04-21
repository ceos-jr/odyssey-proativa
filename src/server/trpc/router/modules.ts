import { FormSchema } from "src/pages/modules/create";
import { z } from "zod";

import {
  router,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
} from "../trpc";

export const moduleRouter = router({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.module.findMany({});
  }),
  getUnique: publicProcedure
    .input(z.object({ moduleId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.module.findUnique({
        where: { id: input.moduleId },
        include: {
          lessons: {
            select: {
              id: true,
              name: true,
              tasks: { select: { id: true } },
            },
            orderBy: { index: "asc" },
          },
        },
      });
    }),
  getUserModStats: protectedProcedure
    .input(z.object({ moduleId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.userModuleProgress.findUnique({
        where: {
          userId_moduleId: {
            userId: ctx.session.user.id,
            moduleId: input.moduleId,
          },
        },
        include: {
          lessonProg: {
            select: {
              lessonId: true,
              completed: true,
              tasksProg: { select: { taskId: true, status: true } },
            },
          },
        },
      });
    }),
  subsToModule: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        lessons: z.array(
          z.object({
            id: z.string(),
            tasks: z.array(z.object({ id: z.string() })),
          })
        ),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.userModuleProgress.create({
        data: {
          userId: ctx.session.user.id,
          moduleId: input.id,
          lessonProg: {
            create: input.lessons.map((less) => ({
              lessonId: less.id,
              tasksProg: {
                create: less.tasks.map((task) => ({
                  taskId: task.id,
                })),
              },
            })),
          },
        },
      });
    }),
  desubToModule: protectedProcedure
    .input(
      z.object({
        moduleId: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.userModuleProgress.delete({
        where: {
          userId_moduleId: {
            moduleId: input.moduleId,
            userId: ctx.session.user.id,
          },
        },
      });
    }),
  createModWLessons: adminProcedure
    .input(FormSchema)
    .mutation(async ({ ctx, input }) => {
      const resp = await ctx.prisma.module.create({
        data: {
          name: input.name,
          description: input.description,
          lessons: {
            createMany: {
              data: input.lessons,
            },
          },
        },
        select: { lessons: true },
      });

      const data = resp.lessons.map((less, i, arr) => {
        if (arr[i - 1]) {
          less.previous = arr[i - 1]?.id ?? "";
        }
        if (i < arr.length) {
          less.next = arr[i + 1]?.id ?? "";
        }
        return { id: less.id, next: less.next, previous: less.previous };
      });
      return ctx.prisma.$transaction(
        data.map((less) =>
          ctx.prisma.lesson.update({
            where: { id: less.id },
            data: { next: less.next, previous: less.previous },
          })
        )
      );
    }),
  updSttsOnModSugg: adminProcedure
    .input(z.object({ id: z.string(), readed: z.boolean() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.modSuggestion.update({
        where: { id: input.id },
        data: { readed: input.readed },
      });
    }),
  getUserModSuggestions: adminProcedure
    .input(z.string())
    .query(({ ctx, input }) => {
      return ctx.prisma.modSuggestion.findMany({
        where: { userId: input },
        include: { module: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      });
    }),
});
