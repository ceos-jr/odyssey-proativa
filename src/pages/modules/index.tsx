import DashboardLayout from "@components/Layout/DashboardLayout";
import Head from "next/head";
import AllModules from "@components/modules/AllModules";
import UnfinishedUserModules from "@components/modules/UnfinishedUserModules";
import { type GetServerSideProps } from "next";
import { getServerAuthSession } from "src/server/common/get-server-auth-session";
import CompletedUserModules from "@components/modules/CompletedUserModules";
import { Roles } from "@utils/constants";

const Modules = () => {
  return (
    <>
      <Head>
        <title>Modulos • Proativa</title>
        <meta name="description" content="Odyssey Proativa" />
      </Head>
      <main className="container mx-auto flex h-max flex-col gap-4 p-4">
        <UnfinishedUserModules />
        <CompletedUserModules />
        <AllModules />
      </main>
    </>
  );
};

export default Modules;

Modules.getLayout = function getLayout(page: React.ReactElement) {
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
