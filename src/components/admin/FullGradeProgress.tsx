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
  
  const FullGradesProgress = () => {
    const { data: floatLongTermAvg } = trpc.grades.floatLongTermAvg.useQuery();

    const { data: integer1MonthAvg } = trpc.grades.integer1MonthAvg.useQuery();
    if (
        integer1MonthAvg && floatLongTermAvg &&
        integer1MonthAvg[0]?.media && floatLongTermAvg[0]?.media
    ) {
        integer1MonthAvg[0].media = floatLongTermAvg[0].media;
    } 

    const { data: integer3MonthAvg } = trpc.grades.integer3MonthAvg.useQuery();
    if (
        integer3MonthAvg && floatLongTermAvg &&
        integer3MonthAvg[0]?.media && floatLongTermAvg[0]?.media
    ) {
        integer3MonthAvg[0].media = floatLongTermAvg[0].media;
    }

    const { data: integer6MonthAvg } = trpc.grades.integer6MonthAvg.useQuery();
    if (
        integer6MonthAvg && floatLongTermAvg &&
        integer6MonthAvg[0]?.media && floatLongTermAvg[0]?.media
    ) {
        integer6MonthAvg[0].media = floatLongTermAvg[0].media;
    }

    return (
      <div className="flex flex-col gap-8 rounded-lg bg-white p-8 shadow-lg">
        <div>
          <Heading>Progresso das Notas</Heading>
        </div>
        {!integer1MonthAvg || !integer3MonthAvg || !integer6MonthAvg ? (
          <>
            <Skeleton height="10px" />
            <Skeleton height="10px" />
            <Skeleton height="10px" />
          </>
        ) : integer6MonthAvg.length === 0 ? (
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
                <CustomChart data={integer1MonthAvg} />
              </TabPanel>
              <TabPanel>
                <CustomChart data={integer3MonthAvg} />
              </TabPanel>
              <TabPanel>
                <CustomChart data={integer6MonthAvg} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        )}
      </div>
    );
  };
  
  export default FullGradesProgress;
  