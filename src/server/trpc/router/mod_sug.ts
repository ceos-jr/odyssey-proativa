import { adminProcedure, protectedProcedure, router } from "@trpc/trpc";
import { z } from "zod";
import { SuggestionFormSchema } from "@components/Layout/ModSuggestionModal";

export const moduleSuggestion = router({
  allByModuleId: adminProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.prisma.modSuggestion.findMany({
      where: { moduleId: input },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });
  }),
  /*O endpoint createModSugg recebe como parâmetro um formulário referente a sugestão de um módulo e utiliza a função 'mutation' para criar essa sugestão por meio do método 'create' do Prisma.
  É um processo protegido, afeta apenas o usuário logado. */
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
    updSttsOnModSugg: adminProcedure
    .input(z.object({ id: z.string(), readed: z.boolean() }))
    .mutation(({ ctx, input }) => {
      /*
      - updSttsOnModSugg("Update Status On Module Suggestions"): Pede ao banco de dados para atualizar* uma sugestão aos 
        modulos, podendo marcar ela como lida ou não lida.
          -> Esse processo é exclusivo para administradores.
        
        *> Nesse caso atualizar é uma "mutation" do prisma, ou seja uma operação que muda valores no banco de dados.  
      */
      return ctx.prisma.modSuggestion.update({
        where: { id: input.id },
        data: { readed: input.readed },
      });
    }),
  getUserModSuggestions: adminProcedure
    .input(z.string())
    .query(({ ctx, input }) => {
      /*
      - getUserModSuggestions: Pede ao banco de dados para encontar sugestões aos 
        modulos de um usuario específico**.
          -> Esse processo é exclusivo para administradores.
        
        **-> Nesse caso o usuário específico é aquele com id igual input, que é do tipo z.string().
      */
      return ctx.prisma.modSuggestion.findMany({
        where: { userId: input },
        include: { module: { select: { name: true } } },
        orderBy: { createdAt: "desc" }, // Os valores são ordenados de maneira decrescente em relação a data de criação
        take: 5, // Atualmente somente 5 sugestões são requisitadas
      });
    }),
});


