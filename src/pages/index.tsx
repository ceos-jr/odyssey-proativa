import Head from "next/head";
import DashboardLayout from "@components/Layout/DashboardLayout";
import { getServerAuthSession } from "src/server/common/get-server-auth-session";
import Stats from "@components/home/Stats";
import MostRecentModules from "@components/home/MostRecentModules";
import { type GetServerSideProps } from "next";

const Home = () => {
  return (
    <>
      <Head>
        <title>Dashboard • CEOS</title>
        <meta name="description" content="CEOS Capacitacao" />
      </Head>
      <main className="flex flex-col gap-4 p-4 h-max">
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
  } else {
    return { props: {} };
  }
};
