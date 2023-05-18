import { Heading, HStack, Skeleton, Text } from "@chakra-ui/react";
import DashboardLayout from "@components/Layout/DashboardLayout";
import { trpc } from "@utils/trpc";
import Head from "next/head";
import { useRouter } from "next/router";
import NextImage from "next/image";
import { FaUserCircle } from "react-icons/fa";
import SubscribedModulesTable from "@components/user/SubscribedModulesTable";
import TasksTab from "@components/user/TasksTab";
import GradeDistribution from "@components/user/GradeDistribution";
import UserSuggestions from "@components/user/UserSuggestions";
import GradesProgress from "@components/user/GradesProgress";
import { getServerAuthSession } from "src/server/common/get-server-auth-session";
import { type GetServerSideProps } from "next";
import { Roles } from "@utils/constants";

const User = () => {
  const userId = useRouter().query.userId as string;
  const { data: user } = trpc.admin.getUser.useQuery(userId, {
    refetchOnWindowFocus: false,
  });
  const { data: modules } = trpc.admin.getUserModuleList.useQuery(userId, {
    refetchOnWindowFocus: false,
  });
  const { data: tasks } = trpc.task.getTasksByUser.useQuery(userId, {
    refetchOnWindowFocus: false,
  });

  const { data: tasksCount } = trpc.task.totalAndUnfCountByUser.useQuery(
    userId,
    {
      refetchOnWindowFocus: false,
    }
  );
  const { data: gradeDistribution } = trpc.grades.gradeDistByUser.useQuery(
    userId,
    {
      refetchOnWindowFocus: false,
    }
  );

  const { data: uModSugg } = trpc.module.getUserModSuggestions.useQuery(
    userId,
    {
      refetchOnWindowFocus: false,
    }
  );

  const { data: uLesSugg } = trpc.lesson.getUserLesSuggestions.useQuery(
    userId,
    {
      refetchOnWindowFocus: false,
    }
  );

  return (
    <>
      <Head>
        <title>{user?.name} • Proativa</title>
      </Head>
      <main className="flex flex-col gap-8">
        {!user ? (
          <Skeleton height="20px" />
        ) : (
          <>
            <HStack>
              <div className="relative h-12 w-12">
                {user?.image ? (
                  <NextImage
                    src={user.image}
                    alt="user avatar"
                    fill
                    className="rounded-full object-cover"
                  />
                ) : (
                  <FaUserCircle className="h-full w-full" />
                )}
              </div>
              <div>
                <Heading as="h1" size="xl">
                  {user.name}
                </Heading>
                <Text>{user.role}</Text>
              </div>
            </HStack>
          </>
        )}
        <SubscribedModulesTable modules={modules} />
        <TasksTab
          tasks={tasks}
          finishedCount={tasksCount?.finished}
          totalCount={tasksCount?.total}
        />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <GradeDistribution grades={gradeDistribution} />
          <GradesProgress />
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <UserSuggestions title="Sugestão aos Módulos" data={uModSugg} />
          <UserSuggestions title="Sugestão aos Tópicos" data={uLesSugg} />
        </div>
      </main>
    </>
    
  );
};

export default User;

User.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerAuthSession(context);
  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  } else if (session.user?.role !== Roles.Admin) {
    return {
      redirect: {
        destination: "/401",
        permanent: false,
      },
    };
  } else return { props: {} };
};
