/* eslint-disable react/jsx-no-undef */
import { signIn } from "next-auth/react";
import { AiFillGithub } from "react-icons/ai";
import { Text } from "@chakra-ui/react";
import Head from "next/head";
import Logo from "@components/Layout/Logo";
import { getServerAuthSession } from "src/server/common/get-server-auth-session";
import { type GetServerSideProps } from "next";
import ChangeRoleFooter from "@components/Layout/ChangeRoleFooter";

const Login = () => {
  return (
    <>
      <Head>
        <title>Login • CEOS</title>
        <meta name="description" content="CEOS Capacitacao" />
      </Head>
      <div className="flex flex-col gap-y-8 justify-center items-center h-screen">
        <Logo className="w-1/4 h-1/4 text-primary" />
        <AiFillGithub
          className="w-16 h-16 transition-colors cursor-pointer hover:text-secondary"
          onClick={() => signIn("github")}
        />
        <Text>Sign in with Github</Text>
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
