import { Text, Heading, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import Head from "next/head";
import DashboardLayout from "@components/Layout/DashboardLayout";
import { type GetServerSideProps } from "next";
import { getServerAuthSession } from "src/server/common/get-server-auth-session";
import { Roles } from "@utils/constants";
import { useSession } from "@utils/useSession";
import { TaskStatus } from "@utils/constants";
import UserTasksList from "@components/tasks/UserTasksList";
import { trpc, type RouterTypes } from "@utils/trpc";
import React from "react";

type TasksProgress = NonNullable<
	RouterTypes["task"]["getTasksByUser"]["output"]
>;

const Tasks = () => {
	const { data } = useSession();

	const allTasks = trpc.task.getTasksByUser.useQuery(data?.user?.id as string);
	const tasksProgress = allTasks.data || [] as TasksProgress;

	const filterProgresses = (status: TaskStatus) => {
		return tasksProgress.filter((progress) => progress.status === status);
	}

	const pending = filterProgresses(TaskStatus.Notsubmitted);
	const submitted = filterProgresses(TaskStatus.Submitted);
	const completed = filterProgresses(TaskStatus.Completed);

	return (
		<>
			<Head>
				<title>Atividades • Proativa</title>
				<meta name="description" content="Odyssey Proativa" />
			</Head>
			<main className="container mx-auto flex h-max flex-col gap-4 p-4">
				<Heading>Atividades</Heading>
				{tasksProgress && (
					<Tabs
						colorScheme="twitter"
						variant="soft-rounded"
						bgColor="white"
						rounded="lg"
						p="4"
						className="shadow-lg"
					>
						<TabList>
							<Tab>Pendentes</Tab>
							<Tab>Submetidas</Tab>
							<Tab>Concluídas</Tab>
						</TabList>
						<TabPanels>
							<TabPanel>
								{
									pending.length == 0 ? (
										<div className="flex flex-col items-center justify-center">
											<Text>Nenhuma atividade pendente</Text>
										</div>
									) : <UserTasksList tasksProgress={pending} />
								}
							</TabPanel>
							<TabPanel>
								{
									submitted.length == 0 ? (
										<div className="flex flex-col items-center justify-center">
											<Text>Nenhuma atividade submetida</Text>
										</div>
									) : <UserTasksList tasksProgress={submitted} />
								}
							</TabPanel>
							<TabPanel>
								{
									completed.length == 0 ? (
										<div className="flex flex-col items-center justify-center">
											<Text>Nenhuma atividade concluída</Text>
										</div>
									) : <UserTasksList tasksProgress={completed} />
								}
							</TabPanel>
						</TabPanels>
					</Tabs>
				)}
			</main>
		</>
	);
};

export default Tasks;

Tasks.getLayout = function getLayout(page: React.ReactElement) {
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
	} else if (session.user?.role === Roles.Guest) {
		return {
			redirect: {
				destination: "/guest",
				permanent: false,
			},
		};
	} else return { props: {} };
}
