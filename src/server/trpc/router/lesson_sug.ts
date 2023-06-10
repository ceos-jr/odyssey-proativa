import { z } from "zod";
import { router, adminProcedure } from "../trpc";

export const lessonSuggestion = router({
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