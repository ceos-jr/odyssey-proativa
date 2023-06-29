import DashboardLayout from "@components/Layout/DashboardLayout";
import Head from "next/head";
import AllModules from "@components/modules/AllModules";
import UnfinishedUserModules from "@components/modules/UnfinishedUserModules";
import { type GetServerSideProps } from "next";
import { getServerAuthSession } from "src/server/common/get-server-auth-session";
import CompletedUserModules from "@components/modules/CompletedUserModules";
import SignedModules from "@components/modules/SignedModules"
import { Roles } from "@utils/constants";
import { z } from "zod";

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
        <SignedModules />
        <AllModules />
      </main>
    </>
  );
};

export default Modules;

export const FormSchemaUpdate = z.object({
  name: z.string().min(1, { message: "O nome do módulo é necessário" }),
  body: z.string(),
  description: z.string(),
  lessons: z
    .array(
      z.object({
        id: z.string().nullable(),
        name: z.string().min(1, { message: "O nome do tópico é obrigatório" }),
        index: z.number(),
      })
    )
    .min(1, { message: "Você deve incluir pelo menos 1 tópico" }),
});

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
