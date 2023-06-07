// Importações:
// TaskStatus: enumeração exportada pelo Prisma que representará o status de uma tarefa;
// TRCPError: classe de erro exportada pelo TRPCError;
// z: pacote que define os esquemas de validação dos objetos (garante que estejam no formato esperado pela aplicação)
import { TaskStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { router, adminProcedure, protectedProcedure } from "../trpc";

// Representa a média cumulativa de uma turma  em um determinado dia
// {Object} CumulativeAvg
// {string} date_alias - O dia representado em formato de string.
// {number} media - A média cumulativa da turma naquele dia.

export type CumulativeAvg = {
  date_alias: string;
  media: number;
};

// Representa a frequência de notas dentro de um intervalo de valores.
// {Object} GradeFrequency
// {number} grade_bin - O intervalo de notas representado pela frequência.
// {number} count - A quantidade de notas dentro desse intervalo.

export type GradeFrequency = {
  grade_bin: number;
  count: number;
};

// Rota para lidar com procedimentos relacionados às notas
// {Object} GradesRouter
// Quatro rotas que retornam a média das notas nos últimos 7 e 30 dias:
// {Function} avg7Days - Retorna um array de médias dos últimos 7 dias das tasks completadas
// {Function} avg7DaysByUser - Retorna um array de médias dos últimos 7 dias das tasks completadas para um usuário específico
// {Function} avg30Days - Retorna um array de médias dos últimos 30 dias das tasks completadas
// {Function} avg30DaysByUser - Retorna um array de médias dos últimos 30 dias das tasks completadas de um usuário específico
// Duas rotas para distribuição de notas:
// {Function} gradeDist - Retorna um array de distribuição de notas de todas as tasks completadas
// {Function} gradeDistByUser - Retorna um array de distribuição de notas das tasks completadas de um usuário específico.

// As notas são obtidas da tabela "UserTaskProgress", que contém o progresso do usuário em tarefas relacionadas ao curso.
// As notas são filtradas pela coluna "status", que contém o estado da tarefa (completa ou incompleta), e pela coluna "submittedAt", que contém a data em que a tarefa foi concluída.

export const gradesRouter = router({
  //Disponível para usuário autenticado
  avg30Days: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.$queryRaw<CumulativeAvg[]>`
    WITH intervals AS (
      SELECT
        date_trunc('day', "submittedAt") AS interval_start,
        SUM(grade) AS grade_sum,
        COUNT(grade) AS grade_count,
        ROW_NUMBER() OVER (ORDER BY date_trunc('day', "submittedAt") DESC) AS row_num
      FROM
        "UserTaskProgress"
      WHERE
        status::text = ${TaskStatus.COMPLETED}::text
        AND "submittedAt" BETWEEN NOW() - INTERVAL '1 MONTH' AND NOW()
      GROUP BY
        interval_start
    )
    SELECT
      CASE
        WHEN row_num = 1 THEN to_char(NOW(), 'DD/MM')
        ELSE to_char(DATE_TRUNC('day', NOW()) - INTERVAL '1 day' * (row_num - 1), 'DD/MM')
      END AS date_alias,
      CAST(SUM(grade_sum) OVER (ORDER BY interval_start ASC) / SUM(grade_count) OVER (ORDER BY interval_start ASC) AS numeric(10, 2)) AS media
    FROM
      intervals
    ORDER BY
      interval_start ASC;
    `;
  }),
  //Disponível para usuário autenticado
  avg30DaysByUser: protectedProcedure
    .input(z.string().optional())
    .query(({ ctx, input }) => {
      if (input && ctx.session.user.role !== "ADMIN")
        throw new TRPCError({ code: "UNAUTHORIZED" });
      const userId = input ? input : ctx.session.user.id;

      return ctx.prisma.$queryRaw<CumulativeAvg[]>`
      WITH intervals AS (
        SELECT
          date_trunc('day', "submittedAt") AS interval_start,
          SUM(grade) AS grade_sum,
          COUNT(grade) AS grade_count,
          ROW_NUMBER() OVER (ORDER BY date_trunc('day', "submittedAt") DESC) AS row_num
        FROM
          "UserTaskProgress"
        WHERE
          "userId" = ${userId}
          AND status::text = ${TaskStatus.COMPLETED}::text
          AND "submittedAt" BETWEEN NOW() - INTERVAL '1 MONTH' AND NOW()
        GROUP BY
          interval_start
      )
      SELECT
        CASE
          WHEN row_num = 1 THEN to_char(NOW(), 'DD/MM')
          ELSE to_char(DATE_TRUNC('day', NOW()) - INTERVAL '1 day' * (row_num - 1), 'DD/MM')
        END AS date_alias,
        CAST(SUM(grade_sum) OVER (ORDER BY interval_start ASC) / SUM(grade_count) OVER (ORDER BY interval_start ASC) AS numeric(10, 2)) AS media
      FROM
        intervals
      ORDER BY
        interval_start ASC;
`;
    }),
  avg3Months: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.$queryRaw<CumulativeAvg[]>`
      WITH intervals AS (
        SELECT
          date_trunc('week', "submittedAt") AS interval_start,
          SUM(grade) AS grade_sum,
          COUNT(grade) AS grade_count,
          ROW_NUMBER() OVER (ORDER BY date_trunc('week', "submittedAt") DESC) AS row_num
        FROM
          "UserTaskProgress"
        WHERE
          status::text = ${TaskStatus.COMPLETED}::text
          AND "submittedAt" BETWEEN NOW() - INTERVAL '3 MONTH' AND NOW()
        GROUP BY
          interval_start
      )
      SELECT
        CASE
          WHEN row_num = 1 THEN to_char(NOW(), 'DD/MM')
          ELSE to_char(DATE_TRUNC('week', NOW()) - INTERVAL '1 week' * (row_num - 1), 'DD/MM')
        END AS date_alias,
        CAST(SUM(grade_sum) OVER (ORDER BY interval_start ASC) / SUM(grade_count) OVER (ORDER BY interval_start ASC) AS numeric(10, 2)) AS media
      FROM
        intervals
      ORDER BY
        interval_start ASC;
      `;
  }),
  avg3MonthsByUser: protectedProcedure
    .input(z.string().optional())
    .query(({ ctx, input }) => {
      if (input && ctx.session.user.role !== "ADMIN")
        throw new TRPCError({ code: "UNAUTHORIZED" });
      const userId = input ? input : ctx.session.user.id;

      return ctx.prisma.$queryRaw<CumulativeAvg[]>`
      WITH intervals AS (
        SELECT
          date_trunc('week', "submittedAt") AS interval_start,
          SUM(grade) AS grade_sum,
          COUNT(grade) AS grade_count,
          ROW_NUMBER() OVER (ORDER BY date_trunc('week', "submittedAt") DESC) AS row_num
        FROM
          "UserTaskProgress"
        WHERE
          "userId" = ${userId}
          AND status::text = ${TaskStatus.COMPLETED}::text
          AND "submittedAt" BETWEEN NOW() - INTERVAL '3 MONTH' AND NOW()
        GROUP BY
          interval_start
      )
      SELECT
        CASE
          WHEN row_num = 1 THEN to_char(NOW(), 'DD/MM')
          ELSE to_char(DATE_TRUNC('week', NOW()) - INTERVAL '1 week' * (row_num - 1), 'DD/MM')
        END AS date_alias,
        CAST(SUM(grade_sum) OVER (ORDER BY interval_start ASC) / SUM(grade_count) OVER (ORDER BY interval_start ASC) AS numeric(10, 2)) AS media
      FROM
        intervals
      ORDER BY
        interval_start ASC;
      `;
    }),
  avg6Months: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.$queryRaw<CumulativeAvg[]>`
      WITH intervals AS (
        SELECT
          date_trunc('week', "submittedAt") AS interval_start,
          SUM(grade) AS grade_sum,
          COUNT(grade) AS grade_count,
          ROW_NUMBER() OVER (ORDER BY date_trunc('week', "submittedAt") DESC) AS row_num
        FROM
          "UserTaskProgress"
        WHERE
          status::text = ${TaskStatus.COMPLETED}::text
          AND "submittedAt" BETWEEN NOW() - INTERVAL '6 MONTH' AND NOW()
        GROUP BY
          interval_start
      )
      SELECT
        CASE
          WHEN row_num = 1 THEN to_char(NOW(), 'DD/MM')
          ELSE to_char(DATE_TRUNC('week', NOW()) - INTERVAL '1 week' * (row_num - 1), 'DD/MM')
        END AS date_alias,
        CAST(SUM(grade_sum) OVER (ORDER BY interval_start ASC) / SUM(grade_count) OVER (ORDER BY interval_start ASC) AS numeric(10, 2)) AS media
      FROM
        intervals
      ORDER BY
        interval_start ASC;
  `;
  }),
  avg6MonthsByUser: protectedProcedure
    .input(z.string().optional())
    .query(({ ctx, input }) => {
      if (input && ctx.session.user.role !== "ADMIN")
        throw new TRPCError({ code: "UNAUTHORIZED" });
      const userId = input ? input : ctx.session.user.id;

      return ctx.prisma.$queryRaw<CumulativeAvg[]>`
      WITH intervals AS (
        SELECT
          date_trunc('week', "submittedAt") AS interval_start,
          SUM(grade) AS grade_sum,
          COUNT(grade) AS grade_count,
          ROW_NUMBER() OVER (ORDER BY date_trunc('week', "submittedAt") DESC) AS row_num
        FROM
          "UserTaskProgress"
        WHERE
          "userId" = ${userId}
          AND status::text = ${TaskStatus.COMPLETED}::text
          AND "submittedAt" BETWEEN NOW() - INTERVAL '6 MONTH' AND NOW()
        GROUP BY
          interval_start
      )
      SELECT
        CASE
          WHEN row_num = 1 THEN to_char(NOW(), 'DD/MM')
          ELSE to_char(DATE_TRUNC('week', NOW()) - INTERVAL '1 week' * (row_num - 1), 'DD/MM')
        END AS date_alias,
        CAST(SUM(grade_sum) OVER (ORDER BY interval_start ASC) / SUM(grade_count) OVER (ORDER BY interval_start ASC) AS numeric(10, 2)) AS media
      FROM
        intervals
      ORDER BY
        interval_start ASC;
      `;
    }),
  // A distribuição das notas é calculada usando a função width_bucket do SQL, que agrupa os valores em intervalos de tamanho fixo.

  //Disponível apenas para admin
  gradeDist: adminProcedure.input(z.string().optional()).query(({ ctx }) => {
    return ctx.prisma.$queryRaw<GradeFrequency[]>`
      SELECT
        bins.grade_bin,
        COALESCE(grade_counts.grade_count, 0) AS count
      FROM (
        SELECT generate_series(0, 4) AS grade_bin
      ) AS bins
      LEFT JOIN (
        SELECT
          (width_bucket(grade, 0, 5.001, 5) - 1) * 1 AS grade_bin,
          COUNT(*) AS grade_count
        FROM
          "UserTaskProgress"
        WHERE
          status::text = ${TaskStatus.COMPLETED}::text
        GROUP BY
          grade_bin
      ) AS grade_counts ON bins.grade_bin = grade_counts.grade_bin
      ORDER BY
        bins.grade_bin ASC
    `;
  }),
  //Disponível para usuário autenticado
  gradeDistByUser: protectedProcedure
    .input(z.string().optional())
    .query(({ ctx, input }) => {
      if (input && ctx.session.user.role !== "ADMIN")
        throw new TRPCError({ code: "UNAUTHORIZED" });
      const userId = input ? input : ctx.session.user.id;

      return ctx.prisma.$queryRaw<GradeFrequency[]>`
      SELECT
        bins.grade_bin,
        COALESCE(grade_counts.grade_count, 0) AS count
      FROM (
        SELECT generate_series(0, 4) AS grade_bin
      ) AS bins
      LEFT JOIN (
        SELECT
          (width_bucket(grade, 0, 5.001, 5) - 1) * 1 AS grade_bin,
          COUNT(*) AS grade_count
        FROM
          "UserTaskProgress"
        WHERE
          "userId" = ${userId} AND
          status::text = ${TaskStatus.COMPLETED}::text
        GROUP BY
          grade_bin
      ) AS grade_counts ON bins.grade_bin = grade_counts.grade_bin
      ORDER BY
        bins.grade_bin ASC
    `;
    }),
});
