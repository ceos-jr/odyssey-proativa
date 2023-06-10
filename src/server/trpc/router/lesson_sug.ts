import { z } from "zod";
import { router, adminProcedure, protectedProcedure } from "../trpc";
import { LessSuggestionSchema } from "@components/Layout/LessSuggestionModal";

export const lessonSuggestion = router({
  /*O endpoint createLessSugg recebe como parâmetro um formulário referente a sugestão de uma tarefa e utiliza a função 'mutation' para criar essa sugestão por meio do método 'create' do Prisma.
  É um processo protegido, afeta apenas o usuário logado. */
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