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
          dataKey="media"
          stroke={colors.primary}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

const GradesProgress = () => {
  const { data: avg30Days } = trpc.grades.avg30Days.useQuery({
    refetchOnWindowFocus: false,
  });

  const { data: avg3Months } = trpc.grades.avg3Months.useQuery({
    refetchOnWindowFocus: false,
  });

  const { data: avg6Months } = trpc.grades.avg6Months.useQuery({
    refetchOnWindowFocus: false,
  });
  return (
    <div className="flex flex-col gap-8 rounded-lg bg-white p-8 shadow-lg">
      <div>
        <Heading>Progresso das Notas</Heading>
      </div>
      {!avg30Days || !avg3Months || !avg6Months ? (
        <>
          <Skeleton height="10px" />
          <Skeleton height="10px" />
          <Skeleton height="10px" />
        </>
      ) : avg6Months.length === 0 ? (
        <Text>Nenhuma nota registrada</Text>
      ) : (
        <Tabs variant="soft-rounded" colorScheme="green">
          <TabList>
            <Tab>Últimos 30 dias</Tab>
            <Tab>Últimos 3 meses</Tab>
            <Tab>Últimos 6 meses</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <CustomChart data={avg30Days} />
            </TabPanel>
            <TabPanel>
              <CustomChart data={avg3Months} />
            </TabPanel>
            <TabPanel>
              <CustomChart data={avg6Months} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      )}
    </div>
  );
};

export default GradesProgress;
