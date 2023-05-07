import { createServerSideHelpers } from "@trpc/react-query/server";
import { GetStaticPaths, GetStaticPropsContext } from "next";
import { trpc } from "src/libs/client/trpc";
import { prisma } from "src/libs/server/prisma";
import { appRouter } from "src/libs/server/trpc";
import { getYear } from "date-fns";
import Layout from "src/components/Layout";
import {
  Box,
  Button,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  Textarea,
  useBoolean,
  useToast,
} from "@chakra-ui/react";
import SSRSafeSuspense from "src/components/SSRSafeSuspense";
import { useState } from "react";

const PrevModal = ({ questionId }: { questionId: string }) => {
  const [prevModalOpen, { on, off }] = useBoolean(false);
  const [prevAnswers] = trpc.answers.getByQuestion.useSuspenseQuery({
    questionId,
  });

  if (!prevAnswers.length) return null;

  return (
    <>
      <Button size="xs" onClick={on}>
        과거의 답변들 보기
      </Button>

      <Modal isOpen={prevModalOpen} onClose={off}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <h2>과거의 답변들</h2>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box as="ol" listStyleType="none">
              {prevAnswers.map((answer) => (
                <Box
                  as="li"
                  key={answer.id}
                  borderTop="1px solid"
                  borderTopColor="gray.400"
                  py="4"
                >
                  <Heading as="h3" fontSize="sm" mb="2">
                    {answer.year}
                  </Heading>
                  <Text>{answer.description}</Text>
                </Box>
              ))}
            </Box>
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
  const [submitted, { refetch }] = trpc.answers.hasSubmitted.useSuspenseQuery({
    date,
    year,
  });
  const toast = useToast();

  const { mutate, isLoading } = trpc.answers.create.useMutation({
    onSuccess: () => {
      refetch();
      toast({
        title: "등록완료",
        description: "답변이 등록되었어요.",
        status: "success",
        isClosable: true,
      });
    },
  });

  const [answer, setAnswer] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutate({
          questionId,
          answer,
          year,
        });
      }}
    >
      <Textarea
        resize="none"
        bg="gray.600"
        color="whiteAlpha.800"
        name="answer"
        onChange={(e) => setAnswer(e.target.value)}
        value={answer}
        placeholder={
          submitted ? "이미 등록한 답변입니다." : "답변을 입력해주세요."
        }
        disabled={submitted}
      />
      {!submitted && (
        <Button type="submit" mt="4" disabled={submitted || isLoading}>
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
      <SSRSafeSuspense fallback={<Spinner />}>
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
