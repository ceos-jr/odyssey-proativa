import {
  Heading,
  Skeleton,
  Text,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from "@chakra-ui/react";
import { type CumulativeAvg } from "@trpc/router/grades";
import { trpc } from "@utils/trpc";
import { useRouter } from "next/router";
import {
  CartesianGrid,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Line,
  Tooltip,
} from "recharts";
import { colors } from "src/pages/_app";

const CustomChart = ({ data }: { data: CumulativeAvg[] }) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date_alias" />
        <YAxis padding={{ top: 30, bottom: 30 }} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="cumulative_avg"
          stroke={colors.primary}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

const GradesProgress = () => {
  const userId = useRouter().query.userId as string;
  const { data: avg7 } = trpc.grades.avg7DaysByUser.useQuery(userId, {
    refetchOnWindowFocus: false,
  });
  const { data: avg30 } = trpc.grades.avg30DaysByUser.useQuery(userId, {
    refetchOnWindowFocus: false,
  });
  return (
    <div className="flex flex-col gap-8 rounded-lg bg-white p-8 shadow-lg">
      <div>
        <Heading>Progresso das Notas</Heading>
      </div>
      {!avg7 || !avg30 ? (
        <>
          <Skeleton height="10px" />
          <Skeleton height="10px" />
          <Skeleton height="10px" />
        </>
      ) : avg30.length === 0 ? (
        <Text>Nenhuma nota registrada</Text>
      ) : (
        <Tabs variant="soft-rounded" colorScheme="green">
          <TabList>
            <Tab>Últimos 7 dias</Tab>
            <Tab>Últimos 30 dias</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <CustomChart data={avg7} />
            </TabPanel>
            <TabPanel>
              <CustomChart data={avg30} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      )}
    </div>
  );
};

export default GradesProgress;
