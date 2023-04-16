import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { trpc } from "src/libs/client/trpc";

function App({ Component, pageProps: { session, ...restProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <Component {...restProps} />;
    </SessionProvider>
  );
}

export default trpc.withTRPC(App);
