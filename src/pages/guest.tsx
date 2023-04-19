import { Heading, Text } from "@chakra-ui/react";
import ChangeRoleFooter from "@components/Layout/ChangeRoleFooter";
import Logo from "@components/Layout/Logo";
import Head from "next/head";

const Guest = () => {
  return (
    <>
      <Head>
        <title>Não autorizado • Proativa</title>
        <meta name="description" content="Odyssey Proativa" />
      </Head>
      <div className="flex h-screen flex-col items-center justify-center gap-8">
        <Logo className="h-1/3 w-1/4 text-primary" />
        <Heading>401 - Você é um visitante</Heading>
        <Text>Solicite a um administrador permissao para usar o Odyssey</Text>
        <ChangeRoleFooter />
      </div>
    </>
  );
};

export default Guest;
