import Head from "next/head";
import DashboardLayout from "@components/Layout/DashboardLayout";
import { getServerAuthSession } from "src/server/common/get-server-auth-session";
import Stats from "@components/home/Stats";
import MostRecentModules from "@components/home/MostRecentModules";
import { type GetServerSideProps } from "next";
import { Roles } from "@utils/constants";

const Home = () => {
  return (
    <>
      <Head>
        <title>Odyssey • Proativa</title>
        <meta name="description" content="Odyssey Proativa" />
      </Head>
      <main className="flex h-max flex-col gap-4 p-4">
        <Stats />
        <MostRecentModules />
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
