import { Heading, Text } from "@chakra-ui/react";
import ChangeRoleFooter from "@components/Layout/ChangeRoleFooter";
import Head from "next/head";
import Image from "next/image";
import LogoExtended from "../../public/logo_extended.png";
import { type GetServerSideProps } from "next";
import { getServerAuthSession } from "src/server/common/get-server-auth-session";
import { Roles } from "@utils/constants";

const Guest = () => {
  return (
    <>
      <Head>
        <title>Não autorizado • Proativa</title>
        <meta name="description" content="Odyssey Proativa" />
      </Head>
      <div className="flex h-screen flex-col items-center justify-center gap-8">
        <Image
          alt="logo proativa"
          src={LogoExtended}
          height={100}
          width={500}
        />
        <Heading>401 - Você é um visitante</Heading>
        <Text>Solicite a um administrador permissao para usar o Odyssey</Text>
        <ChangeRoleFooter />
      </div>
    </>
  );
};

export default Guest;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerAuthSession(context);
  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  } else if (session.user?.role !== Roles.Guest) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  } else return { props: {} };
};
