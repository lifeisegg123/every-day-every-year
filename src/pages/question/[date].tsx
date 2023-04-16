import { createServerSideHelpers } from "@trpc/react-query/server";
import { GetStaticPaths, GetStaticPropsContext } from "next";
import { trpc } from "src/libs/client/trpc";
import { prisma } from "src/libs/server/prisma";
import { appRouter } from "src/libs/server/trpc";
import { getYear } from "date-fns";
import Layout from "src/components/Layout";
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

  if (!prevAnswers.length) return null;

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

const AnswerForm = ({
  year,
  date,
  questionId,
}: {
  year: string;
  date: string;
  questionId: string;
}) => {
  const [submitted] = trpc.answers.hasSubmitted.useSuspenseQuery({
    date,
    year,
  });
  const { mutate } = trpc.answers.create.useMutation();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutate({
          questionId,
          answer: "MOCK",
          year,
        });
      }}
    >
      <Textarea
        resize="none"
        bg="gray.600"
        color="whiteAlpha.800"
        name="answer"
        placeholder={
          submitted ? "이미 등록한 답변입니다." : "답변을 입력해주세요."
        }
        disabled={submitted}
      />
      {!submitted && (
        <Button type="submit" mt="4" disabled={submitted}>
          등록하기
        </Button>
      )}
    </form>
  );
};

const QuestionPage = ({ date }: { date: string }) => {
  const [{ description, id }] = trpc.questions.getOne.useSuspenseQuery({
    date,
  });

  const thisYear = getYear(new Date()).toString();

  return (
    <Layout
      header={
        <Layout.Header
          description={`${thisYear}-${date}일의 질문에 답하기`}
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
      <SSRSafeSuspense fallback={null}>
        <AnswerForm date={date} year={thisYear} questionId={id} />
      </SSRSafeSuspense>
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
    fallback: "blocking",
  };
};
