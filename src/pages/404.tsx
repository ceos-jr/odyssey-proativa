import { Heading } from "@chakra-ui/react";
import Logo from "@components/Layout/Logo";
import Head from "next/head";

const Custom404 = () => {
  return (
    <>
      <Head>
        <title>Página não encontrada • CEOS</title>
        <meta name="description" content="CEOS Capacitacao" />
      </Head>
      <div className="flex flex-col gap-8 justify-center items-center h-screen">
        <Logo className="w-1/4 h-1/3 text-primary" />
        <Heading>404 - Página não encontrada</Heading>
      </div>
    </>
  );
};

export default Custom404;
