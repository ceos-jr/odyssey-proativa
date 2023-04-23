/* eslint-disable react/jsx-no-undef */
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
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
        <button
          className="flex items-center justify-center gap-2 rounded-lg border-2 border-gray-100 px-4 py-2 shadow-lg transition-all hover:scale-110 hover:bg-primary hover:text-white"
          onClick={() => signIn("google")}
        >
          <FcGoogle className="h-10 w-10" />
          <Text>Login com o Google</Text>
        </button>
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
