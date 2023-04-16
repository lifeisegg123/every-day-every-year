import { createServerSideHelpers } from "@trpc/react-query/server";
import { GetStaticPaths, GetStaticPropsContext } from "next";
import { trpc } from "src/libs/client/trpc";
import { prisma } from "src/libs/server/prisma";
import { appRouter } from "src/libs/server/trpc";
import { getYear } from "date-fns";
import Layout from "src/components/Layout";
import { getToday } from "src/utils/date";
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
  useBoolean,
} from "@chakra-ui/react";
import SSRSafeSuspense from "src/components/SSRSafeSuspense";

const PrevModal = ({ questionId }: { questionId: string }) => {
  const [prevModalOpen, { on, off }] = useBoolean(false);
  const [prevAnswers] = trpc.answers.getByQuestion.useSuspenseQuery({
    questionId,
  });
  return (
    <>
      <Button size="xs" onClick={on}>
        이전 응답 보기
      </Button>

      <Modal isOpen={prevModalOpen} onClose={off}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Modal Title</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <ol>
              {prevAnswers.map((answer) => (
                <li key={answer.id}>
                  <h3>{answer.year}</h3>
                  <p>{answer.description}</p>
                </li>
              ))}
            </ol>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

const QuestionPage = ({ date }: { date: string }) => {
  const [{ description, id }] = trpc.questions.getOne.useSuspenseQuery({
    date,
  });

  const { mutate } = trpc.answers.create.useMutation();

  const thisYear = getYear(new Date()).toString();
  const today = getToday();

  return (
    <Layout
      header={
        <Layout.Header
          description={`${thisYear}-${today}일의 질문에 답하기`}
          rightNode={
            <SSRSafeSuspense fallback={null}>
              <PrevModal questionId={id} />
            </SSRSafeSuspense>
          }
        >
          매일 매년
        </Layout.Header>
      }
    >
      <Text color="whiteAlpha.900" fontSize="xl" marginBottom="4">
        Q. {description}
      </Text>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutate({
            questionId: id,
            answer: "MOCK",
            year: thisYear,
          });
        }}
      >
        <Textarea
          resize="none"
          bg="gray.600"
          color="whiteAlpha.800"
          name="answer"
        />
        <Button mt="4">등록하기</Button>
      </form>
    </Layout>
  );
};

export default QuestionPage;

export async function getStaticProps(
  context: GetStaticPropsContext<{ date: string }>
) {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma },
  });
  const date = context.params?.date as string;

  await helpers.questions.getOne.prefetch({ date });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      date,
    },
  };
}
export const getStaticPaths: GetStaticPaths = async () => {
  const questions = await prisma.question.findMany({
    select: {
      date: true,
    },
  });
  return {
    paths: questions.map(({ date }) => ({
      params: {
        date,
      },
    })),
    fallback: false,
  };
};
