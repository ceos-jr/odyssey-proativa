import { LessonWUtils } from "src/pages/lessons/[lessonId]/edit";
import { z } from "zod";

import { router, publicProcedure, adminProcedure } from "../trpc";

export const lessonRouter = router({
  getLesson: publicProcedure
    .input(z.object({ lessonId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.lesson.findUnique({
        where: { id: input.lessonId },
        include: { links: true, videos: true, projects: true, tasks: true },
      });
    }),
  getLessTasks: publicProcedure
    .input(z.object({ lessonId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.task.findMany({
        where: { lessonId: input.lessonId },
      });
    }),
  updateLessonWUtils: adminProcedure
    .input(LessonWUtils)
    .mutation(({ input, ctx }) => {
      return ctx.prisma.$transaction([
        ctx.prisma.video.deleteMany({ where: { lessonId: input.id } }),
        ctx.prisma.link.deleteMany({ where: { lessonId: input.id } }),
        ctx.prisma.project.deleteMany({ where: { lessonId: input.id } }),
        ctx.prisma.lesson.update({
          where: { id: input.id },
          data: {
            name: input.name,
            richText: input.richText,
            videos: { createMany: { data: input.videos } },
            links: { createMany: { data: input.links } },
            projects: { createMany: { data: input.projects } },
          },
        }),
      ]);
    }),
  updateVideo: adminProcedure.input(LessonWUtils).query(({ input, ctx }) => {
    return ctx.prisma.lesson.update({
      where: { id: input.id },
      data: {
        name: input.name,
        richText: input.richText,
      },
    });
  }),
  updSttsOnLessSugg: adminProcedure
    .input(z.object({ id: z.string(), readed: z.boolean() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.lesSuggestion.update({
        where: { id: input.id },
        data: { readed: input.readed },
      });
    }),
});
