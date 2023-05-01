import { FormSchema } from "src/pages/modules/create";
import { z } from "zod";

import {
  router,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
} from "../trpc";

/* Imports:
  z from zod:
    - zod: zod é uma biblioteca de declaração e validação de tipos TypeScript.
    - z: É o objeto usado para chamar as funcio nalidades da biblioteca zod.    )
      
  router, adminProcedure,publicProcedure,protectedProcedure from ../trpc: 
    - ../trpc: É o arquivo trpc.ts, entrypoint de uma aplicação tRPC, onde são definidos procedimentos báscos 
      e o router da aplicação.
    - router: Define os endpoints da aplicação. 
    - adminProcedure: Define o procedimento de admin, nesse caso ele confere se a sessão do usuario é valida 
      e se o usuario tem a role de "ADMIN" para permitir o acesso.
    - proteectedProcedure: Define um Procedimento protegido, nesse caso ele confere se o usuario em questão 
      está autenticado para permitir o acesso, ou seja, é preciso ser "ADMIN" ou "MEMBER" para utilizar esse
      procedimento. 
    - publicProcedure: Define um prodedimento publico, que nada mais é que um procedimento que não precisa de 
      autenticação para ser realizado. 
        -> Idealmente esse procedimento seria utilizado por todos os tipos de usuarios, "GUEST", "MEMBER",
           "ADMIN", mas isso não é verificado.
 */

export const moduleRouter = router({
  getAll: publicProcedure.query(({ ctx }) => {
    /*
    - getAll: Pede para o banco de dados encontrar todos os modulos e retorna esse valor.
        -> Esse procediment é público.
    */
    return ctx.prisma.module.findMany({});
  }),
  getUnique: publicProcedure
    .input(z.object({ moduleId: z.string() }))
    .query(({ ctx, input }) => {
      /*
      - getUnique: Pede para o banco de dados encontrar um modulo especifico* com valores adicionais** sobre
        os tópicos e atividades presentes nesse módulo e retorna esse valor.
          -> Esse procedimento é público.
      */
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
        /*
          *-> Nesse caso o modulo específico é aquele que possui o id igual a input.moduleId. 
          **-> Os valores adicionais são ordenados de maneira ascendente de acordo com seu index e valores nulos serão
            considerados os menores possíveis. Como a ordem dos tópicos é relevante para o módulo é importante garantir
            que elas serão recebidas de maneira correta.  
        */
      });
    }),
  getUserModStats: protectedProcedure
    .input(z.object({ moduleId: z.string() }))
    .query(({ ctx, input }) => {
      /*
      - getUserModStats: Pede ao banco de dados para encontrar um valor específico* sobre o progresso de modulo
        de uma usuario com informações adicionais sobre o progresso dos tópicos e o progresso das atividades.
          -> Esse procedimento é protegido.
      */

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
        /*
          *-> Nesse caso o valor específico é encontrado pelo cruzamento do id do usuario em questão, oriundo do
          ctx.session.user.id, com do id do modulo buscado, oriundo do input.moduleId.
        */
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
      /*
      - subsToModule("Subscribe To a Module"): Pede ao banco de dados criar* informações sobre o progresso de 
        um usuario** em um modulo, ou seja, inscreve esse usuario em um modulo.
          -> Esse procedimento é protegido.

        *-> Nesse caso deletar é uma "mutation" do prisma, ou seja uma operação que muda valores
          no banco de dados.  
      */
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
        /*
          **-> O progresso de um usurio em um modulo é uma informação que depende de outras informações. 
            -> Nesse caso, o progresso de usuario em um modulo dependende dos progressos desse usuario nos tópicos
              desse modulo, que por sua vez, dependem dos progressos desse usuario nas atividades desses tópicos.
        */
      });
    }),
  desubToModule: protectedProcedure
    .input(
      z.object({
        moduleId: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      /*
      - desubToModule("Unsubscribe To Module"): Pede ao banco de dados para deletar* informacões sobre o progresso
        de um usuario** específico em um módulo** específico, ou seja, desinscreve um usuario em um módulo.
          -> Esse procedimento é protegido.
      *-> Nesse caso deletar é uma "mutation" do prisma, ou seja uma operação que muda valores
          no banco de dados.  
        -> Nesse caso ao deletar o progresso de um usuario em um modulo deleta-se também o progresso desse usuario nas
          atividades desse modulos, que por sua vez, pede a deleção dos progresso desse usuario nas atividades desse
          tópico.
      */
      return ctx.prisma.userModuleProgress.delete({
        where: {
          userId_moduleId: {
            moduleId: input.moduleId,
            userId: ctx.session.user.id,
          },
          /*
          **-> As informações sobre o progresso de usuário em um módulo são localizadas através do cruzamento do id do 
            modulo, oriundo do input.moduleId, com id do usuario, oriundo do ctx.session.user.id.
          */
        },
      });
    }),
  createModWLessons: adminProcedure
    .input(FormSchema)
    .mutation(async ({ ctx, input }) => {
      /*
      - createModWLessons("Create Module With Lessons"): Cria um módulo com tópicos seguindo os seguintes passos:
          1ª - Pede ao banco de dados para criar* um modulo com informações sobre os tópicos desse modulo.
            -> Ao criar o modulo as informações sobre os tópicos são retornadas e armazenadas.

          2ª - Registra a ordem de cada tópico no banco de dados a partir dos valores anteriormente armazenados.
            -> A ordem dos tópicos de um módulo é relevante.

          3ª - Pede ao banco de dados para atualizar* cada tópico de acordo com sua ordem obtida no passo anteior.
            -> Cada tópico passa a saber qual tópico anterior e posterior a ele.

        -> Esse processo é exclusivo para administradores.
        
        * -> Nesse caso criar e atualizar são operações de "mutation" do prisma, ou seja, operações que mudam valores
          no banco de dados.
      */
      const resp = await ctx.prisma.module.create({
        // 1ª passo ocorre aqui
        data: {
          name: input.name,
          description: input.description,
          lessons: {
            createMany: {
              data: input.lessons,
            },
          },
        },
        select: { lessons: true }, // informa que os tópicos devem ser retornados.
      });

      const data = resp.lessons.map((less, i, arr) => {
        // 2ª passo ocorre aqui
        /*
          -> As operações nesse escopo não afetam o banco de dados, logo chamaremos
            qualquer tópico trabalhado aqui de tópico_local para ficar mais claro.

          - lesson: O tópico_local em questão.
          - i: O index do tópico_local em questão.
          - arr: O array com todos os tópicos_locais.
        */
        if (arr[i - 1]) {
          less.previous = arr[i - 1]?.id ?? "";
          /* 
          - atualiza atributo "previos" do tópico_local em questão para id do tópico_local anterior, caso não exista anterior, 
            para uma string vazia.
          */
        }
        if (i < arr.length) {
          less.next = arr[i + 1]?.id ?? "";
          /* 
          - atualiza atributo "next" do tópico_local em questão para id do próximo tópico_local, caso não exista um próximo, 
            para uma string vazia.
          */
        }
        return { id: less.id, next: less.next, previous: less.previous }; // retorna para variavel data.
      });

      return ctx.prisma.$transaction(
        // 3ª passo ocorre aqui
        /* 
          - $transaction: É uma forma de transacionar dados com banco de maneira que ou todas as operçôes requisitadas
            são um sucesso ou todas são um fracasso. Impedindo que informações interdepentes fiquem com valor não esperado
            caso acorra alguma falha no processo.
        */
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
