import { Heading } from "@chakra-ui/react";
import Head from "next/head";
import Image from "next/image";
import LogoExtended from "../../public/logo_extended.png";

const Custom500 = () => {
  return (
    <>
      <Head>
        <title>Erro no servidor • Proativa</title>
        <meta name="description" content="Odyssey Proativa" />
      </Head>
      <div className="flex h-screen flex-col items-center justify-center gap-8">
        <Image
          alt="logo proativa"
          src={LogoExtended}
          height={100}
          width={500}
        />
        <Heading>500 - Um erro no servidor ocorreu</Heading>
      </div>
    </>
  );
};

export default Custom500;
