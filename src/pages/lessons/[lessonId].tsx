import {
  Button,
  Heading,
  Highlight,
  Skeleton,
  SkeletonText,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import DashboardLayout from "@components/Layout/DashboardLayout";
import LessSuggestionModal from "@components/Layout/LessSuggestionModal";
import ResourceTab from "@components/lessons/ResourceTab";
import TaskList from "@components/lessons/Tasklist";
import { trpc } from "@utils/trpc";
import moment from "moment";
import "moment/locale/pt-br";
import { type GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { AiOutlineInbox } from "react-icons/ai";
import { getServerAuthSession } from "src/server/common/get-server-auth-session";
import DisplayMarkdown from "@components/Layout/DisplayMarkdown";
import LessonFooter from "@components/lessons/LessonFooter";

moment.locale("pt-br");

const Lesson = () => {
  const lessonId = useRouter().query.lessonId as string;
  const lesson = trpc.lesson.getLesson.useQuery({
    lessonId,
  });
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Head>
        <title>{lesson?.data?.name} • CEOS</title>
        <meta name="description" content="CEOS Capacitacao" />
      </Head>
      <main className="container mx-auto flex flex-col gap-4 p-4">
        <LessSuggestionModal
          onClose={onClose}
          isOpen={isOpen}
          lessonId={lessonId}
        />
        {!lesson.data ? (
          <LessonSkeleton />
        ) : (
          <>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <Heading as="h1" size="2xl">
                {lesson.data?.name}
              </Heading>
              <Button
                onClick={onOpen}
                leftIcon={<AiOutlineInbox />}
                colorScheme="twitter"
              >
                Sugestões
              </Button>
            </div>
            <Text as="i">
              Ultima atualização {moment(lesson.data?.updatedAt).fromNow()}
            </Text>
            {lesson.data.richText.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg bg-white p-16 shadow-lg">
                <Text className="text-lg font-bold">
                  {" "}
                  Nenhum conteúdo foi disponibilizado para esse tópico
                </Text>
                <Text>
                  {" "}
                  Entre em contato com seu{" "}
                  <Highlight
                    query="ADMIN"
                    styles={{
                      px: "2",
                      py: "1",
                      rounded: "full",
                      bg: "secondary",
                    }}
                  >
                    ADMIN
                  </Highlight>{" "}
                  para adicionar um conteúdo ou mande uma sugestão
                </Text>
              </div>
            ) : (
              <DisplayMarkdown text={lesson.data.richText} />
            )}
            <ResourceTab
              links={lesson.data.links}
              videos={lesson.data.videos}
              projects={lesson.data.projects}
            />
            <TaskList lessonId={lessonId} tasks={lesson.data.tasks} />
            <LessonFooter {...lesson.data} />
          </>
        )}
      </main>
    </>
  );
};

export default Lesson;
Lesson.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

const LessonSkeleton = () => {
  return (
    <Stack>
      <Skeleton mb="10" noOfLines={1} height="8" />
      <SkeletonText mb="20" noOfLines={3} />
      <Skeleton mb="20" height="56" />
    </Stack>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerAuthSession(context);
  //TODO: O cara pode ter uma sessao e acessar mesmo que nã esteja inscrito
  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  } else return { props: {} };
};
