import { type AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { ChakraProvider } from "@chakra-ui/react";
import { extendTheme } from "@chakra-ui/react";
import { trpc } from "../utils/trpc";
import "../styles/globals.css";
import { type NextPage } from "next";
import NextNProgress from "nextjs-progressbar";

import { Poppins } from "@next/font/google";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  subsets: ["latin"],
});

const colors = {
  primary: "#2a3756",
  secondary: "#fad20a",
  terciary: "#2d3e50",
};

const theme = extendTheme({
  colors,
  fonts: {
    body: poppins.style.fontFamily,
    heading: poppins.style.fontFamily,
  },
});

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
      <ChakraProvider theme={theme}>
        <div className={`${poppins.variable} font-poppins`}>{layout}</div>
      </ChakraProvider>
    </SessionProvider>
  );
}

export default trpc.withTRPC(MyApp);
