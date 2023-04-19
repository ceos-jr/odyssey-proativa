import { Heading, Text } from "@chakra-ui/react";
import Image from "next/image";
import LogoExtended from "../../public/logo_extended.png";
import Head from "next/head";

const Custom401 = () => {
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
        <Heading>401 - Não autorizado</Heading>
        <Text>Acesso negado devido a privilégios insuficientes</Text>
      </div>
    </>
  );
};

export default Custom401;
