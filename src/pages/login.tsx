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
      <div className="flex h-screen flex-col items-center justify-center gap-y-8">
        <Logo className="h-1/4 w-1/4 text-primary" />
        <AiFillGithub
          className="h-16 w-16 cursor-pointer transition-colors hover:text-secondary"
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
