import Head from "next/head";
import DashboardLayout from "@components/Layout/DashboardLayout";
import { getServerAuthSession } from "src/server/common/get-server-auth-session";
import Stats from "@components/home/Stats";
import MostRecentModules from "@components/home/MostRecentModules";
import { type GetServerSideProps } from "next";
import { Roles } from "@utils/constants";
import LastTasks from "@components/user/LastTasks";
import { trpc } from "@utils/trpc";
import GradeDistribution from "@components/user/GradeDistribution";
import GradesProgress from "@components/user/GradesProgress";

const Home = () => {
  const { data: tasks } = trpc.task.lastTasksByUser.useQuery();
  const { data: tasksCount } = trpc.task.totalAndUnfCountByUser.useQuery();
  const { data: gradeDist } = trpc.grades.gradeDistByUser.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  return (
    <>
      <Head>
        <title>Odyssey • Proativa</title>
        <meta name="description" content="Odyssey Proativa" />
      </Head>
      <main className="flex h-max flex-col gap-4 p-4">
        <Stats />
        <MostRecentModules />
        <LastTasks
          tasks={tasks}
          totalCount={tasksCount?.total}
          finishedCount={tasksCount?.finished}
        />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <GradeDistribution grades={gradeDist} />
          <GradesProgress />
        </div>
      </main>
    </>
  );
};

export default Home;

Home.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerAuthSession(context);
  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  } else if (session.user?.role === Roles.Guest) {
    return {
      redirect: {
        destination: "/guest",
        permanent: false,
      },
    };
  } else return { props: {} };
};
