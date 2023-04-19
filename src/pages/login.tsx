/* eslint-disable react/jsx-no-undef */
import { signIn } from "next-auth/react";
import { AiFillGithub } from "react-icons/ai";
import { Text } from "@chakra-ui/react";
import Head from "next/head";
import { getServerAuthSession } from "src/server/common/get-server-auth-session";
import { type GetServerSideProps } from "next";
import ChangeRoleFooter from "@components/Layout/ChangeRoleFooter";
import Image from "next/image";
import LogoExtended from "../../public/logo_extended.png";

const Login = () => {
  return (
    <>
      <Head>
        <title>Login • Proativa</title>
        <meta name="description" content="Odyssey Proativa" />
      </Head>
      <div className="flex h-screen flex-col items-center justify-center gap-y-8 p-8">
        <Image
          alt="logo proativa"
          src={LogoExtended}
          height={100}
          width={500}
        />
        <AiFillGithub
          className="h-16 w-16 cursor-pointer transition-colors hover:text-secondary"
          onClick={() => signIn("github")}
        />
        <Text>Login com o Github</Text>
        <ChangeRoleFooter />
      </div>
    </>
  );
};

export default Login;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerAuthSession(context);
  if (session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  } else {
    return { props: {} };
  }
};
