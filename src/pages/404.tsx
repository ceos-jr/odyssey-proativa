import { Heading } from "@chakra-ui/react";
import Image from "next/image";
import LogoExtended from "../../public/logo_extended.png";
import Head from "next/head";

const Custom404 = () => {
  return (
    <>
      <Head>
        <title>Página não encontrada • CEOS</title>
        <meta name="description" content="CEOS Capacitacao" />
      </Head>
      <div className="flex h-screen flex-col items-center justify-center gap-8">
        <Image
          alt="logo proativa"
          src={LogoExtended}
          height={100}
          width={500}
        />
        <Heading>404 - Página não encontrada</Heading>
      </div>
    </>
  );
};

export default Custom404;
