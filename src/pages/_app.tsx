import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import { trpc } from "src/libs/client/trpc";

const gloablStyles = extendTheme({
  styles: {
    global: {
      body: {
        bg: "gray.900",
      },
    },
  },
});

function App({ Component, pageProps: { session, ...restProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <ChakraProvider theme={gloablStyles}>
        <Component {...restProps} />;
      </ChakraProvider>
    </SessionProvider>
  );
}

export default trpc.withTRPC(App);
