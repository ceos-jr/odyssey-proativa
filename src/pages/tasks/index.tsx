import {
	Table,
	TableContainer,
	Thead,
	Tr,
	Th,
	Td,
	Tbody,
	Badge,
	useDisclosure,
	IconButton,
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
	Heading,
} from "@chakra-ui/react";
import Head from "next/head";
import DashboardLayout from "@components/Layout/DashboardLayout";
import { type GetServerSideProps } from "next";
import { getServerAuthSession } from "src/server/common/get-server-auth-session";
import { Roles } from "@utils/constants";
import { useSession } from "@utils/useSession";
import { TaskStatus } from "@utils/constants";
import { AiOutlineEye, AiOutlineSend } from "react-icons/ai";
import { BsThreeDots } from "react-icons/bs";
import ShowTaskModal from "@components/lessons/ShowTaskModal";
import SubmitTaskAlert from "@components/lessons/SubmitTaskAlert";
import { trpc, type RouterTypes } from "@utils/trpc";
import React, { useState } from "react";

type TasksType = NonNullable<
	RouterTypes["lesson"]["getLesson"]["output"]
>["tasks"];


const Tasks = () => {
	const { data } = useSession();
	const [task, setTask] = useState<TasksType[0] | null>(null);
	const sendTaskAle = useDisclosure();
	const taskModal = useDisclosure();
	const cancelRef = React.useRef(null);

	const allTasks = trpc.task.getTasksByUser.useQuery(data?.user?.id as string);
	const tasksProgress = allTasks.data;

	const getTaskStatus = (taskId: string) => {
		return tasksProgress?.find((uTask) => uTask.taskId === taskId)
			?.status as TaskStatus;
	};

	const getGrade = (taskId: string) => {
		return tasksProgress?.find((uTask) => uTask.taskId === taskId)?.grade;
	};


	const getSubmitedText = (taskId: string) => {
		return tasksProgress?.find((uTask) => uTask.taskId === taskId)?.richText;
	};

	return (
		<>
			<Head>
				<title>Atividades • Proativa</title>
				<meta name="description" content="Odyssey Proativa" />
			</Head>
			<main className="container mx-auto flex h-max flex-col gap-4 p-4">
				<Heading>Atividades</Heading>
				<ShowTaskModal
					task={task}
					isOpen={taskModal.isOpen}
					onClose={taskModal.onClose}
				/>
				<SubmitTaskAlert
					isOpen={sendTaskAle.isOpen}
					onClose={sendTaskAle.onClose}
					task={task}
					cancelRef={cancelRef}
					initialData={getSubmitedText(task?.id ?? "")}
				/>
				{tasksProgress && (
					<TableContainer className="rounded-lg bg-white shadow-lg">
						<Table>
							<Thead>
								<Tr>
									<Th>Nome</Th>
									<Th>Status</Th>
									<Th isNumeric>Nota</Th>
									<Th isNumeric>Ações</Th>
								</Tr>
							</Thead>
							<Tbody>
								{tasksProgress.map((progress) => (
									<Tr key={progress.taskId}>
										<Td>{progress.task.name}</Td>
										<Td>
											{tasksProgress &&
												getTaskStatus(progress.taskId) === TaskStatus.Completed ? (
												<Badge colorScheme="green">Completado</Badge>
											) : getTaskStatus(progress.taskId) === TaskStatus.Submitted ? (
												<Badge colorScheme="purple">Submetido</Badge>
											) : (
												<Badge colorScheme="red">Pendente</Badge>
											)}
										</Td>
										<Td isNumeric>
											{getGrade(progress.taskId) !== null ? getGrade(progress.taskId) : "sem nota"}
										</Td>
										<Td isNumeric>
											<Menu>
												<MenuButton as={IconButton} icon={<BsThreeDots />} />
												<MenuList>
													<MenuItem
														icon={<AiOutlineSend />}
														isDisabled={
															getTaskStatus(progress.taskId) === TaskStatus.Completed
																? true
																: false
														}
														onClick={() => {
															setTask(progress.task);
															sendTaskAle.onOpen();
														}}
													>
														Enviar Solução
													</MenuItem>
													<MenuItem
														icon={<AiOutlineEye />}
														onClick={() => {
															setTask(progress.task);
															taskModal.onOpen();
														}}
													>
														Visualizar Atividade
													</MenuItem>
												</MenuList>
											</Menu>
										</Td>
									</Tr>
								))}
							</Tbody>
						</Table>
					</TableContainer>
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
