import { httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import { type GetInferenceHelpers } from "@trpc/server";
import superjson from "superjson";
import { type AppRouter } from "../server/trpc/router/_app";
import {
  LOCAL_HOST,
  VERCEL_URL,
  IN_BROWSER,
  IN_DEVELOPMENT,
} from "./constants";

const getBaseUrl = () => {
  // browser should use relative url
  if (IN_BROWSER) return "";
  // SSR should use vercel url
  if (VERCEL_URL) return VERCEL_URL;
  // dev SSR should use localhost
  return LOCAL_HOST;
};

export const trpc = createTRPCNext<AppRouter>({
  config() {
    return {
      transformer: superjson,
      links: [
        loggerLink({
          enabled: (opts) =>
            IN_DEVELOPMENT ||
            (opts.direction === "down" && opts.result instanceof Error),
        }),
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],
    };
  },
  ssr: false,
});

/**
 * Inference helpers
 * @example type HelloOutput = RouterTypes['example']['hello']['output']
 **/
export type RouterTypes = GetInferenceHelpers<AppRouter>;
