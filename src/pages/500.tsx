import { Heading } from "@chakra-ui/react";
import Logo from "@components/Layout/Logo";
import Head from "next/head";

const Custom500 = () => {
  return (
    <>
      <Head>
        <title>Erro no servidor • CEOS</title>
        <meta name="description" content="CEOS Capacitacao" />
      </Head>
      <div className="flex flex-col gap-8 justify-center items-center h-screen">
        <Logo className="w-1/4 h-1/3 text-primary" />
        <Heading>500 - Um erro no servidor ocorreu</Heading>
      </div>
    </>
  );
};

export default Custom500;
