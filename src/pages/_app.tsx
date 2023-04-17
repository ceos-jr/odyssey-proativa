import { type AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { ChakraProvider } from "@chakra-ui/react";
import { extendTheme } from "@chakra-ui/react";
import { trpc } from "../utils/trpc";
import "../styles/globals.css";
import { type NextPage } from "next";
import NextNProgress from "nextjs-progressbar";

const colors = {
  primary: "#2196f2",
  secondary: "#ffc107",
  terciary: "#2860ff",
  accent: "#ff9100",
};

const theme = extendTheme({ colors });

export type NextPageWithLayout = NextPage & {
  /* eslint-disable no-unused-vars */
  getLayout?: (page: React.ReactElement) => React.ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);
  const layout = getLayout(<Component {...pageProps} />);
  return (
    <SessionProvider session={session}>
      <NextNProgress color={colors.primary} />
      <ChakraProvider theme={theme}>{layout}</ChakraProvider>
    </SessionProvider>
  );
}

export default trpc.withTRPC(MyApp);
