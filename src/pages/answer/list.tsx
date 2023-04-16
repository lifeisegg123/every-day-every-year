import { GetServerSideProps } from "next";
import { getExtendedSession } from "src/libs/server/auth";
import { authOptions } from "../api/auth/[...nextauth]";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "src/libs/server/trpc";
import { prisma } from "src/libs/server/prisma";
import Layout from "src/components/Layout";
import { trpc } from "src/libs/client/trpc";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Text,
} from "@chakra-ui/react";

const AnswerListPage = () => {
  const [answerList] = trpc.answers.getMine.useSuspenseQuery();
  return (
    <Layout
      header={
        <Layout.Header description="내 답변 모아보기">매일 매년</Layout.Header>
      }
    >
      <Accordion>
        {answerList.map((v) => (
          <AccordionItem key={v.id}>
            <h2>
              <AccordionButton>
                <Text
                  color="whiteAlpha.700"
                  as="span"
                  flex="1"
                  textAlign="left"
                >
                  {v.year}-{v.question.date}
                  <Text
                    marginLeft="2"
                    color="whiteAlpha.800"
                    as="strong"
                    textAlign="left"
                    fontSize="lg"
                  >
                    {v.question.description}
                  </Text>
                </Text>

                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel color="whiteAlpha.900" pb={4}>
              {v.description}
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </Layout>
  );
};

export default AnswerListPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
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

  try {
    await helpers.answers.getMine.prefetch();
  } catch (err) {
    return {
      notFound: true,
    };
  }
  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
  };
};
