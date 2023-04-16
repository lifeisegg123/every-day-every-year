import { createServerSideHelpers } from "@trpc/react-query/server";
import { GetStaticPaths, GetStaticPropsContext } from "next";
import { trpc } from "src/libs/client/trpc";
import { prisma } from "src/libs/server/prisma";
import { appRouter } from "src/libs/server/trpc";
import { getYear } from "date-fns";

const PrevModal = ({ questionId }: { questionId: string }) => {
  const [prevAnswers] = trpc.answers.getByQuestion.useSuspenseQuery({
    questionId,
  });
  return (
    <ol>
      {prevAnswers.map((answer) => (
        <li key={answer.id}>
          <h3>{answer.year}</h3>
          <p>{answer.description}</p>
        </li>
      ))}
    </ol>
  );
};

const QuestionPage = ({ date }: { date: string }) => {
  const [{ description, id }] = trpc.questions.getOne.useSuspenseQuery({
    date,
  });

  const { mutate } = trpc.answers.create.useMutation();

  const thisYear = getYear(new Date()).toString();

  return (
    <div>
      <button>이전 응답 보기</button>
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
        <div>{description}</div>
        <div>
          <textarea name="answer"></textarea>
        </div>
        <button>등록하기</button>
      </form>
      {/* <PrevModal questionId={id} /> */}
    </div>
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
