import {
  Button,
  Heading,
  Text,
  Skeleton,
  useDisclosure,
  Accordion,
  AccordionButton,
  Box,
  AccordionItem,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import DashboardLayout from "@components/Layout/DashboardLayout";
import Head from "next/head";
import { AiOutlinePlus } from "react-icons/ai";
import React, { useState } from "react";
import { type RouterTypes, trpc } from "@utils/trpc";
import { useRouter } from "next/router";
import TaskForm from "@components/lessons/TaskForm";
import DeleteTaskAlert from "@components/lessons/DeleteTaskAlert";
import DisplayMarkdown from "@components/Layout/DisplayMarkdown";

const CreateTask = () => {
  const lessonId = useRouter().query.lessonId as string;
  const tasks = trpc.lesson.getLessTasks.useQuery({ lessonId });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isOpenDel,
    onOpen: onOpenDel,
    onClose: onCloseDel,
  } = useDisclosure();
  const [formData, setFormData] = useState<
    RouterTypes["lesson"]["getLessTasks"]["output"][0] | null
  >();
  const [delTask, setDelTask] = useState({ name: "", id: "" });

  return (
    <>
      <Head>
        <title>Atividades • CEOS</title>
        <meta name="description" content="CEOS Capacitacao" />
      </Head>
      <main className="container flex flex-col gap-4 p-4 mx-auto h-max">
        {!tasks.data ? (
          <>
            <Skeleton height="30px" />
            <Skeleton height="40px" />
            <Skeleton height="80px" mt="10px" />
            <Skeleton height="80px" mt="10px" />
          </>
        ) : (
          <>
            <div className="flex flex-col gap-x-2 justify-between sm:flex-row sm:items-center">
              <Heading as="h1" size="2xl">
                Atividades
              </Heading>
              <Button
                leftIcon={<AiOutlinePlus />}
                colorScheme="whatsapp"
                onClick={onOpen}
              >
                Nova Atividade
              </Button>
            </div>
            <TaskForm
              isOpen={isOpen}
              onClose={onClose}
              lessonId={lessonId}
              initialValues={formData}
              setFormData={setFormData}
            />
            <DeleteTaskAlert
              isOpen={isOpenDel}
              onClose={onCloseDel}
              taskId={delTask.id}
              name={delTask.name}
              lessonId={lessonId}
            />
            {tasks.data.length === 0 ? (
              <Text>
                Nenhuma atividade foi encontrada para esse tópico, por favor
                adicione uma nova
              </Text>
            ) : (
              <Accordion defaultIndex={[0]} allowMultiple>
                {tasks.data.map((task) => (
                  <AccordionItem
                    className="p-2 mt-2 bg-white rounded-lg shadow-lg"
                    key={task.id}
                  >
                    <h2 className="flex gap-x-2 justify-between font-bold">
                      <AccordionButton>
                        <Box flex="1" textAlign="left">
                          {task.name}
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                      <Button
                        onClick={() => {
                          setFormData(task);
                          onOpen();
                        }}
                        colorScheme="gray"
                      >
                        Editar
                      </Button>
                      <Button
                        onClick={() => {
                          setDelTask({ id: task.id, name: task.name });
                          onOpenDel();
                        }}
                        colorScheme="red"
                      >
                        Deletar
                      </Button>
                    </h2>
                    <AccordionPanel pb={4}>
                      <DisplayMarkdown text={task.richText} />
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </>
        )}
      </main>
    </>
  );
};

export default CreateTask;

CreateTask.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
