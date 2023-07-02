import DashboardLayout from "@components/Layout/DashboardLayout";
import Head from "next/head";
import AllModules from "@components/modules/AllModules";
import UnfinishedUserModules from "@components/modules/UnfinishedUserModules";
import { type GetServerSideProps } from "next";
import { getServerAuthSession } from "src/server/common/get-server-auth-session";
import CompletedUserModules from "@components/modules/CompletedUserModules";
import SignedModules from "@components/modules/SignedModules";
import { useSession } from "@utils/useSession";
import { Roles } from "@utils/constants";
import { z } from "zod";

export interface ColorPattern {
  bg: string;
  text: string;
}

const Modules = () => {
  const { data: session } = useSession();
  const colorLogic = {
    odd: true,
    getColor: function () {
      const color: ColorPattern = {
        bg: "blue.800",
        text: "white",
      };

      if (this.odd === true) {
        color.bg = "yellow.300";
        color.text = "black";
      }

      this.odd = !this.odd;

      return color;
    },
  };

  return (
    <>
      <Head>
        <title>Modulos • Proativa</title>
        <meta name="description" content="Odyssey Proativa" />
      </Head>
      <main className="container mx-auto flex h-max flex-col gap-4 p-4">
        {session?.user?.role === Roles.Admin && (
          <SignedModules color={colorLogic.getColor()} />
        )}
        <UnfinishedUserModules color={colorLogic.getColor()} />
        <CompletedUserModules color={colorLogic.getColor()} />
        <AllModules color={colorLogic.getColor()} />
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
