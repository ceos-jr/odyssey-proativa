/* importações: LessonWUtils é um tipo de dado específico para a página de edição de lições e 'z' é uma biblioteca de validação de dados. O dado a ser validado é o parâmetro de entrada dos endpoints. */
import { LessonWUtils } from "src/pages/lessons/[lessonId]/edit";
import { z } from "zod";

/* funções e tipos definidos pelo tRPC que vão nos ajudar a definir os endpoints */
import {
  router,
  publicProcedure,
  adminProcedure,
  protectedProcedure,
} from "../trpc";

/* lessonRouter é um objeto com os endpoints getLesson, getLessTasks etc. para lidar com as requisições relacionadas às aulas */
export const lessonRouter = router({
  /* O endpoint getLesson recebe um parâmetro lessonId como entrada e usa a função findUnique do Prisma para buscar uma lição com base nesse ID. Ele retorna uma lição específica e é uma função pública (pode ser acessada por qualquer usuário) */
  getLesson: protectedProcedure
    .input(z.object({ lessonId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.lesson.findUnique({
        where: { id: input.lessonId },
        include: { links: true, videos: true, projects: true, tasks: true },
      });
    }),

  /* O endpoint getLessTasks recebe lessonId como entrada e usa a função findMany do Prisma para buscar todas as tarefas relacionadas a uma lição com base no ID. Ele retorna as tarefas de uma lição específicas e é uma função pública. */
  getLessTasks: publicProcedure
    .input(z.object({ lessonId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.task.findMany({
        where: { lessonId: input.lessonId },
      });
    }),

  /* A rota updateLessonWUtils é atribuída à função 'mutation' do objeto adminProcedure (só pode ser acessada pelo administrador). Esse endpoint vai atualizar a lição (nome, texto, vídeos, links e projetos) e as operações createMany criam vários registros ligados a esses campos de uma só vez. */
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
  /* Esse trecho define um endpoint que é uma operação de consulta ('query') permitida apenas para o administrador e atualizará as informações de vídeo. */
  updateVideo: adminProcedure.input(LessonWUtils).query(({ input, ctx }) => {
    return ctx.prisma.lesson.update({
      where: { id: input.id },
      data: {
        name: input.name,
        richText: input.richText,
      },
    });
  }),
  /* O endpoint updSttsOnLessSugg atualiza o status de uma sugestão de lição como lida ou não lida. O endpoint espera que o cliente envie um objeto com 'id'(string) e 'readed'(booleano) validados pelo pacote 'zod'. Ele pode ser acessado apenas pelo admin. */
  updSttsOnLessSugg: adminProcedure
    .input(z.object({ id: z.string(), readed: z.boolean() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.lesSuggestion.update({
        where: { id: input.id },
        data: { readed: input.readed },
      });
    }),
  getUserLesSuggestions: adminProcedure
    .input(z.string())
    .query(({ ctx, input }) => {
      return ctx.prisma.lesSuggestion.findMany({
        where: { userId: input },
        include: { lesson: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      });
    }),
});
