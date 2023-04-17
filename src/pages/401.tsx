import { Heading, Text } from "@chakra-ui/react";
import Logo from "@components/Layout/Logo";
import Head from "next/head";

const Custom401 = () => {
  return (
    <>
      <Head>
        <title>Não autorizado • CEOS</title>
        <meta name="description" content="CEOS Capacitacao" />
      </Head>
      <div className="flex flex-col gap-8 justify-center items-center h-screen">
        <Logo className="w-1/4 h-1/3 text-primary" />
        <Heading>401 - Não autorizado</Heading>
        <Text>Acesso negado devido a privilégios insuficientes</Text>
      </div>
    </>
  );
};

export default Custom401;
