import { createServerSideHelpers } from "@trpc/react-query/server";
import { getDate, getMonth } from "date-fns";
import { GetServerSideProps, GetServerSidePropsContext } from "next";

import { Button, Flex, Highlight, Text } from "@chakra-ui/react";
import Link from "next/link";
import Fade from "src/components/Fade";
import Layout from "src/components/Layout";
import { getExtendedSession } from "src/libs/server/auth";
import { prisma } from "src/libs/server/prisma";
import { appRouter } from "src/libs/server/trpc";
import { authOptions } from "./api/auth/[...nextauth]";
import { getToday } from "src/utils/date";

export default function Home() {
  const today = getToday();

  return (
    <Layout
      header={
        <Layout.Header description="매일 한개의 질문에 답하기">
          매일 매년
        </Layout.Header>
      }
    >
      <Flex direction="column" gap="4" marginTop="8">
        <Fade delayMs={500}>
          <Text color="whiteAlpha.900" fontSize="lg">
            <Highlight
              query="365"
              styles={{
                fontWeight: "bold",
                color: "whiteAlpha.900",
                fontSize: "xl",
              }}
            >
              365개의 질문에
            </Highlight>
          </Text>
        </Fade>
        <Fade delayMs={1500}>
          <Text color="whiteAlpha.900" fontSize="lg">
            <Highlight
              query="매일"
              styles={{
                fontWeight: "bold",
                color: "whiteAlpha.900",
                fontSize: "xl",
              }}
            >
              매일 답을 남기고
            </Highlight>
          </Text>
        </Fade>
        <Fade delayMs={2500}>
          <Text color="whiteAlpha.900" fontSize="lg">
            <Highlight
              query="매년"
              styles={{
                fontWeight: "bold",
                color: "whiteAlpha.900",
                fontSize: "xl",
              }}
            >
              매년의 기록을
            </Highlight>
          </Text>
        </Fade>
        <Fade delayMs={3500}>
          <Text color="whiteAlpha.900" fontSize="lg">
            쌓아가세요
          </Text>
        </Fade>
      </Flex>
      <Link href={`/question/${today}`} passHref legacyBehavior>
        <Button
          as="a"
          size="lg"
          position="fixed"
          bottom="16"
          left="50%"
          transform="translateX(-50%)"
        >
          오늘의 질문에 답하기
        </Button>
      </Link>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getExtendedSession(
    context.req,
    context.res,
    authOptions
  );

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: true,
      },
    };
  }

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
};
