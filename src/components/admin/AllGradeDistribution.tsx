import { Heading, Skeleton, Text } from "@chakra-ui/react";
import { type GradeFrequency } from "@trpc/router/grades";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { colors } from "src/pages/_app";

const AllGradeDistribution = ({ grades }: { grades?: GradeFrequency[] }) => {
  let total = 0;
  const data = grades?.map((g) => {
    const count = Number(g.count);
    total += count;
    return {
      grade_bin: `${g.grade_bin} - ${g.grade_bin + 1}`,
      count: count,
    };
  });

  return (
    <div className="flex flex-col gap-8 rounded-lg bg-white p-8 shadow-lg">
      <div>
        <Heading>Distribuição das Notas</Heading>
        {grades ? (
          <Text>
            <span className="font-bold">{total}</span> atividades feitas
          </Text>
        ) : (
          <Skeleton height="10px" />
        )}
      </div>
      {grades && grades.length !== 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="grade_bin" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill={colors.primary} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <Text>Nenhuma nota registrada</Text>
      )}
    </div>
  );
};

export default AllGradeDistribution;
