import { createServerSideHelpers } from "@trpc/react-query/server";
import { GetServerSidePropsContext } from "next";
import { signIn } from "next-auth/react";
import { getMonth, getDate } from "date-fns";

import { trpc } from "src/libs/client/trpc";
import { getExtendedSession } from "src/libs/server/auth";
import { prisma } from "src/libs/server/prisma";
import { appRouter } from "src/libs/server/trpc";
import { authOptions } from "./api/auth/[...nextauth]";
import Link from "next/link";

export default function Home() {
  const { data } = trpc.users.me.useQuery();
  const now = new Date();

  const today = `${getMonth(now) + 1}-${getDate(now)}`.padStart(5, "0");
  return (
    <>
      <div>{data?.id}</div>
      <button onClick={() => signIn("kakao")}>로그인</button>
      <Link href={`/question/${today}`}>오늘의 질문</Link>
    </>
  );
}

export async function getServerSideProps(
  context: GetServerSidePropsContext<{ id: string }>
) {
  const session = await getExtendedSession(
    context.req,
    context.res,
    authOptions
  );
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { session, prisma: prisma },
  });
  const id = context.params?.id as string;
  try {
    await helpers.users.me.prefetch();
  } catch (err) {
    return {
      props: { id },
      notFound: true,
    };
  }
  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
  };
}
