import { Roles, TaskStatus } from "@utils/constants";
import { z } from "zod";
import { router, adminProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
/* Imports:
  Roles, TaskStatus from @utils/constants
    - @utils/constants: é onde são guardadas constantes simples da aplicação.
    - Roles: Enumarator com todas as possiveis roles do projeto( ADMIN, MENBER, GUEST ).
    - TaskStatus: Enumarator com todos os possiveis esdados de uma task( NOTSUBMITTED, SUBMITTED, COMPLETED ).
  
  z from zod:
    - zod: zod é uma biblioteca de declaração e validação de tipos TypeScript.
    - z: É o objeto usado para chamar as funcio nalidades da biblioteca zod.    )
      
  router, adminProcedure from ../trpc: 
    - ../trpc: É o arquivo trpc.ts, entrypoint de uma aplicação tRPC, onde são definidos procedimentos báscos 
      e o router da aplicação.
    - router: Define os endpoints da aplicação. 
    - adminProcedure: Define o procedimento de admin, nesse caso ele confere se a sessão do usuario é valida 
      e se o usuario tem a role de "ADMIN" para permitir o acesso.

  TRPCError from "@trpc/server": 
    - É usado para retornar um erro no servidor TRPC.
  */

export const adminRouter = router({
  /* adminRouter: Aqui são definidos os endpoints assosciados ao Admin.
    ~ Para entender melhor as requisições feitas ao banco de dados olhe o arquivo schema.prisma em 
      "../../../../prisma/schema.prisma, nele a estrura dos dados é definida."
  */

  PromoteToAdmin: adminProcedure
    .input(z.string())
    .mutation(({ ctx, input: id }) => {
      /*
    - PromoteToAdmin: Pede para o banco de dados a atualizar* a posição de um usuario específico**.

    * -> atualizar é uma "mutation" do prisma, mais específicamente um "update".

    **-> Nesse caso o usuario específico é aquele que tem id igual ao input.
    */

      return ctx.prisma.user.update({
        data: { role: Roles.Admin },
        where: { id: id },
      });
    }),

  getUserCount: adminProcedure.query(({ ctx }) => {
    /*
    - getUserCount: Pede para o banco de dados a contagem* do numero de usuarios e retorna esse valor.
    */
    return ctx.prisma.user.count({
      where: { NOT: { role: Roles.Guest } },
      /*
       *-> Nessa contagem usuarios com role do estado de role "GUEST" não ser considerados.
       */
    });
  }),

  getAllMembers: adminProcedure.query(({ ctx }) => {
    /*
    - getAllMembers: Pede para o banco de dados encontrar* um grupo de usuarios com informações adcionais sobre os
      seus progressos nos modulos e retorna os valores recebidos. 
    */
    return ctx.prisma.user.findMany({
      include: { modulesProgress: { select: { completed: true } } },
      where: { NOT: { role: Roles.Guest } },
      /*
        *-> Nesse caso os valores requisitados são ->todos<- os usuarios com role diferente de "GUEST" juntamente com a 
          informação de quais modulos foram concluidos ou não por eles.  
      */
    });
  }),
  getGuests: adminProcedure.query(({ ctx }) => {
    /*
    - getGuests: Pede para o banco de dados encontrar um grupo de usuarios com role igual a "GUEST" e retorna esse valor. 
    */
    return ctx.prisma.user.findMany({
      where: { role: Roles.Guest },
      /*
       *-> Nessa contagem usuarios com role do estado de role "GUEST" são únicos considerados.
       */
    });
  }),
  getModCount: adminProcedure.query(({ ctx }) => {
    /*
    - getModCount: Pede para o banco de dados para contar o numero de modulos e retorna esse valor.
    */
    return ctx.prisma.module.count({});
  }),
  getLessCount: adminProcedure.query(({ ctx }) => {
    /*
    - getLessCount: Pede para o banco de dados para contar o numero de tópicos e retorna esse valor.
    */
    return ctx.prisma.lesson.count({});
  }),
  getModSuggestions: adminProcedure.query(({ ctx }) => {
    /*
    - getSuggestions: Pede para o banco de dados encontrar* um grupo de sugestões aos módulos com informações adcionais
      sobre quem as fez e quais modulos elas se referem e retorna esse valor.
    */
    return ctx.prisma.modSuggestion.findMany({
      include: {
        module: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, image: true } },
      },
      /*
        *-> Nesse caso os valores requisitados são todas as sugestões aos modulos juntamente com o nome e id do modulo
          em questão e nome, id e imagem do usuario que fez a sugestão. 
      */
    });
  }),
  getLessSuggestions: adminProcedure.query(({ ctx }) => {
    /*
    - getLessSuggestions: Pede ao banco de dados encontrar* um grupo de sugestões aos tópicos com informações adcionais
      sobre quem as fez e quais modulos elas se referem  e retorna esse valor.
    */
    return ctx.prisma.lesSuggestion.findMany({
      include: {
        lesson: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, image: true } },
      },
      /*
        *-> Nesse caso os valores requisitados são todas as sugestões aos tópicos juntamente com o nome e id do modulo
          em questão e do nome, id e imagem do usuario que fez a sugestão. 
      */
    });
  }),
  getLatestSubmissions: adminProcedure.query(({ ctx }) => {
    /*
    - getLatestSubmissions: Pede ao banco de dados encontrar* um grupo de valores que correspondem ao progresso de um 
      usuario em uma atividade com informações adicionais sobre quem fez e a qual tópico ela se refere e retornar esse valor.
    */
    return ctx.prisma.userTaskProgress.findMany({
      where: {
        status: TaskStatus.Submitted,
      },
      include: {
        user: { select: { name: true, image: true } },
        task: true,
      },
      orderBy: { submittedAt: "desc" },
      /*
        *-> Nesse caso os valores requisitados são todos os envios que possuem o estado de role igual a "SUBMITTED" juntamente
          com nome e imagem de quem fez o envio e o tópico ao qual o envio se refere. 
      */
    });
  }),
  delUser: adminProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    /*
    - delUser: Pede que o banco de dados delete* um usuario**.

    *-> Nesse caso deletar é uma "mutation" do prisma, ou seja uma operação que muda valores
     no banco de dados.  
    */
    const userToVerify = await ctx.prisma.user.findUnique({
      where: { id: input },
    });

    if (userToVerify?.role !== Roles.Admin) {
      // Impede que um usuario que é admin seja deletado.
      return ctx.prisma.user.delete({
        where: { id: input },
        /*
          **-> Nesse caso o usuario deletado é aquele que possui o id com valor igual a input***.

          ***-> input é um atributo fornecido a esse procedimiento que possui o tipo z.string().
        */
      });
    } else {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
  }),
  aproveGuest: adminProcedure
    .input(z.string())
    .mutation(({ ctx, input: id }) => {
      /*
    - aproveGuest: Pede ao banco de dados para atualizar* o estado de role de um usuario** de
      "Guest" para "MEMBER".

      *-> Nesse caso atualizar é uma "mutation" do prisma, ou seja uma operação que muda valores
     no banco de dados.  
    */
      return ctx.prisma.user.update({
        data: { role: Roles.Member },
        where: { id: id },
        /*
          **-> Nesse caso o usuario que sofre a alteração de estado de role é aquele que possui id igual a
            input.id***.
          ***-> input.id é um atributo fornecido a esse procedimiento que possui o tipo z.string().
        */
      });
    }),
  attributeGrade: adminProcedure
    .input(
      z.object({ taskId: z.string(), userId: z.string(), grade: z.number() })
    )
    .mutation(({ ctx, input }) => {
      /*
        - attributeGrade: Pede ao banco de dados para atualizar* o progresso** de uma ativiade de um usuario**. 

        *-> Nesse caso atualizar é uma "mutation" do prisma, ou seja uma operação que muda valores
     no banco de dados.  
      */
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
        /*
          **-> Nesse caso o progresso da atividade é encontrado cruzando o id do usuario*** com id da task*** em questão,
          depois esse progresso de atividade muda seu status para "COMPLETED", sua data de conclusão para data atual e 
          sua nota para o valor "grade" recebido como input do tipo z.number().

          ***-> Esses dois valores fpram recebidos como input's do tipo z.string().
        */
      });
    }),
  delModule: adminProcedure.input(z.string()).mutation(({ ctx, input }) => {
    /*
      - delModule: Pede ao banco de dados para deletar* um modulo**.

      *-> Nesse caso deletar é uma "mutation" do prisma, ou seja uma operação que muda valores
     no banco de dados.  

     **-> O modulo que deve ser deletado é aquele com id igual ao input.
    */
    return ctx.prisma.module.delete({ where: { id: input } });
  }),
  //TODO:VAMO DIVIDIR AQUI
  getUser: adminProcedure.input(z.string()).query(({ ctx, input }) => {
    /*
      - getUser: Pede ao banco de dados para encontrar* um único usuario e retorna esse valor.

     *-> O usuario que deve ser encontrado é aquele com id igual ao input.
    */
    return ctx.prisma.user.findUnique({
      where: { id: input },
    });
  }),
  getUserModuleList: adminProcedure
    .input(z.string())
    .query(({ ctx, input }) => {
      /*
      - getUserModuleList: Pede ao banco de dados para encontrar um grupo de valores referentes ao 
        progresso dos modulos de um certo usuario* juntamente com nome desses modulos e retorna esse valor.

      *-> O usuario em questão é aquele com id igual ao input.
      */

      return ctx.prisma.userModuleProgress.findMany({
        where: { userId: input },
        include: { module: { select: { name: true } } },
      });
    }),
});
