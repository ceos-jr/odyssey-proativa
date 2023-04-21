import { Heading, HStack, Skeleton, Text } from "@chakra-ui/react";
import DashboardLayout from "@components/Layout/DashboardLayout";
import { trpc } from "@utils/trpc";
import Head from "next/head";
import { useRouter } from "next/router";
import NextImage from "next/image";
import { FaUserCircle } from "react-icons/fa";
import SubscribedModulesTable from "@components/user/SubscribedModulesTable";
import LastTasks from "@components/user/LastTasks";
import GradeDistribution from "@components/user/GradeDistribution";
import UserSuggestions from "@components/user/UserSuggestions";
import GradesProgress from "@components/user/GradesProgress";

const User = () => {
  const userId = useRouter().query.userId as string;
  const { data: user } = trpc.admin.getUser.useQuery(userId, {
    refetchOnWindowFocus: false,
  });
  const { data: modules } = trpc.admin.getUserModuleList.useQuery(userId, {
    refetchOnWindowFocus: false,
  });
  const { data: lastTasks } = trpc.admin.getUserLastTasks.useQuery(userId, {
    refetchOnWindowFocus: false,
  });
  const { data: totalTasks } = trpc.admin.getUserTotalTasks.useQuery(userId, {
    refetchOnWindowFocus: false,
  });
  const { data: finishedTasksCount } =
    trpc.admin.getUserFinishedTasksCount.useQuery(userId, {
      refetchOnWindowFocus: false,
    });

  const { data: gradeDistribution } =
    trpc.admin.getUserGradeDistribution.useQuery(userId, {
      refetchOnWindowFocus: false,
    });

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
        <LastTasks
          tasks={lastTasks}
          finishedCount={finishedTasksCount}
          totalCount={totalTasks}
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
