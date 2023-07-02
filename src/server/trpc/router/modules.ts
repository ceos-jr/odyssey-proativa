import { FormSchemaCreate } from "src/pages/modules/create";
import { FormSchemaUpdate } from "src/pages/modules/index";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  router,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
} from "../trpc";

interface Lesson {
  id: string;
  index: number;
  name: string;
}

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
              index: true,
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
  editModule: adminProcedure
    .input(z.object({ inputModule: FormSchemaUpdate, modId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const inputModule = input.inputModule;
      const modId = input.modId;

      const currentModule = await ctx.prisma.module.findUnique({
        where: { id: modId },
        include: {
          lessons: {
            select: {
              id: true,
              name: true,
              index: true,
              richText: true,
            },
            orderBy: { index: "asc" },
          },
        },
      });

      const inputSet = new Set(inputModule.lessons.map((lesson) => lesson.id)); // id's Input armazendos ~ O(n)
      const currtSet = new Set(
        currentModule?.lessons.map((lesson) => lesson.id)
      ); // id's Current armazendos ~ O(n)

      const lessonsToDelete = currentModule?.lessons.filter((lesson) => {
        // Se esta em current e nao esta em input -> delete
        if (!inputSet.has(lesson.id)) {
          // O(1) ~ essa e a vatagem do Set
          return true;
        }

        return false;
      });

      const lessonsStepOrder = (lessonsArray: Lesson[]) => {
        console.log(lessonsArray[0]);
        return lessonsArray.map((lesson, index) => {
          const stepOrder = {
            previous: "",
            next: "",
            id: lesson.id,
          };

          const i = index;

          // Sobre a ordem das lessons:
          // L = Lesson em questao, L-1 = Lesson anterior, L+1 = Lesson posterior

          // Para L-1 != null && L+1 != null
          //    L-1 <- L -> L+1

          // Para L-1 == null && L+1 != null
          //    null <- L -> L+1 (botao subir nao deve funcionar)

          // Para L-1 == null && L+1 != null
          //    null <- L -> L+1 (botao subir nao deve funcionar)

          // Para L-1 == null && L+1 == null
          //    null <- L -> null (botoes de subir e descer nao devem funcionar)

          if (lessonsArray[i - 1] && i - 1 >= 0) {
            // array[-1] = ultima posição
            stepOrder.previous = lessonsArray[i - 1]?.id ?? "";
          }

          if (lessonsArray[i + 1]) {
            stepOrder.next = lessonsArray[i + 1]?.id ?? "";
          }

          return stepOrder;
        });
      };

      await ctx.prisma.$transaction(async (transaction) => {
        // check more in: https://advancedweb.hu/how-to-use-async-functions-with-array-map-in-javascript/

        if (lessonsToDelete) {
          const deletedLessons = await Promise.all(
            lessonsToDelete.map(async (lesson) => {
              if (lesson?.id) {
                return transaction.lesson.delete({
                  where: { id: lesson.id },
                });
              }
            })
          );
        }

        const allSubsInMod = await transaction.userModuleProgress.findMany({
          // Inscritos no modulo ~ info usada para cirar cada lessonsProg no proximo map(3a).
          where: { moduleId: modId },
        });

        const editModuleLessons = await Promise.all(
          inputModule.lessons.map(async (lesson, realIndex) => {
            /* IMPORTANTE
          Esse map esta assim para preservar a ordem do input, ai nao precisa se preucupar com atributo index do frontend,
          na verdade pegar esse atributo la do front e jogar no db era a rezao de mtos problemas, la ele serve para gerar 
          um id temporario para lesson.
          - Nesse caso realIndex e o index que ele tem naturalmente no inputModule.lessons 
        */
            if (
              currtSet.has(lesson?.id || "") || // O(1) ~ se esta em current entao ja existe
              !lesson.id
            ) {
              return transaction.lesson.update({
                where: { id: lesson.id || "" },
                data: {
                  name: lesson.name,
                  index: realIndex,
                },
              });
            } else {
              // se nao esta em current entao ainda nao existe

              /* Importante - passo a passo da lesson
            1a Criar lesson 
            2a Encontrar todos os usuarios inscritos no modulo*
              - fora desse map, se ele ficar aqui dentro fica O(nˆ2)
            3a Criar lessonProg para todos eles
          */

              const newLesson = await transaction.lesson.create({
                // 1a
                data: {
                  moduleId: modId,
                  name: lesson.name,
                  richText: "",
                  index: realIndex,
                },
              });

              const newLessonsProgress = await Promise.all(
                allSubsInMod.map((sub) => {
                  // 3a
                  const lessonProg = transaction.userLessonProgress.create({
                    data: {
                      userId: sub.userId,
                      moduleId: modId,
                      lessonId: newLesson.id,
                    },
                  });

                  return lessonProg;
                })
              );

              return newLesson;
            }
          })
        );

        const updatedModule = await transaction.module.update({
          // modulo atualizado, com as lessons na ordem usada
          where: { id: modId },
          data: {
            name: inputModule.name,
            body: inputModule.body,
            description: inputModule.description,
            // Adicionar -> updatedAt
          },
          select: {
            lessons: {
              orderBy: { index: "asc" },
            },
          },
        });

        const corrections = await Promise.all(
          lessonsStepOrder(updatedModule.lessons).map((stepOrder) => {
            // Usar o index como a gente usava antes esta errado
            console.log(stepOrder);
            return transaction.lesson.update({
              where: { id: stepOrder.id },
              data: {
                previous: stepOrder.previous,
                next: stepOrder.next,
              },
            });
          })
        );
      });
    }),
  createModWLessons: adminProcedure
    .input(FormSchemaCreate)
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
          body: input.body,
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
  shiftSignature: adminProcedure 
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const modId = input;
      const userId = ctx.session.user.id;
      console.log(modId);
      const signedModule = await ctx.prisma.signedModule.findUnique({
        where: {
          userId_moduleId: {
            userId: userId, moduleId: modId
          }
        },
      });
      if (signedModule) {
        return await ctx.prisma.signedModule.delete({
          where: {
            userId_moduleId: {
              userId: userId, moduleId: modId
            }
          }
        })
      } else {
        return await ctx.prisma.signedModule.create({
          data: {
            userId: userId, 
            moduleId: modId
          }
        })
      }
    }),
    verifySignature: adminProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const modId = input;
      const userId = ctx.session.user.id;

      let isSigned = true;

      await ctx.prisma.signedModule.findUniqueOrThrow({
        where: {
          userId_moduleId: {
            userId: userId, moduleId: modId
          }
        },
      }).catch(() => {
        isSigned = false;
      });

      return isSigned;
    })
});
