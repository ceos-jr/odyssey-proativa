import {
  Button,
  Heading,
  Tab,
  Table,
  TableContainer,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Highlight,
  Tr,
  Skeleton,
  useToast,
  Popover,
  Portal,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverHeader,
  PopoverCloseButton,
  PopoverBody,
} from "@chakra-ui/react";
import { trpc } from "@utils/trpc";
import NextImage from "next/image";
import moment from "moment";
import "moment/locale/pt-br";
import { FaUserCircle } from "react-icons/fa";
moment.locale("pt-br");

const LessonSuggestions = () => {
  const toast = useToast();
  const utils = trpc.useContext();
  const lessSuggestions = trpc.admin.getLessSuggestions.useQuery();
  const changeLessStts = trpc.lesson.updSttsOnLessSugg.useMutation({
    async onMutate(data) {
      await utils.admin.getLessSuggestions.cancel();
      const prevData = utils.admin.getLessSuggestions.getData();
      const updData = prevData;
      updData?.forEach((el) => {
        if (el.id === data.id) el.readed = !el.readed;
      });
      utils.admin.getLessSuggestions.setData(updData);
      return { prevData };
    },
    onError(err, _, ctx) {
      utils.admin.getLessSuggestions.setData(ctx?.prevData);
      toast({
        title: "Não foi possível atualizar a sugestão",
        description: `Erro: ${err.message}`,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    },
    onSuccess() {
      toast({
        title: "A sugestão foi atualizada com sucesso",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    },
  });

  return (
    <>
      {!lessSuggestions.data ? (
        <>
          <Skeleton height="30px" />
          <Skeleton height="40" />
        </>
      ) : (
        <>
          <Heading>Sugestões para os tópicos</Heading>
          <Tabs
            className="rounded-lg bg-white p-4 shadow-lg"
            variant="soft-rounded"
          >
            <TabList>
              <Tab _selected={{ color: "white", bg: "red.500" }}>Não lidos</Tab>
              <Tab _selected={{ color: "white", bg: "primary" }}>Todos</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                {lessSuggestions.data.filter((sugg) => !sugg.readed).length ===
                0 ? (
                  <Text>
                    <Highlight
                      query="não lida"
                      styles={{
                        px: "2",
                        py: "1",
                        rounded: "full",
                        bg: "red.100",
                      }}
                    >
                      Nenhuma sugestão não lida foi encontrada
                    </Highlight>
                  </Text>
                ) : (
                  <TableContainer>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Tópico</Th>
                          <Th>Usuário</Th>
                          <Th isNumeric>Data</Th>
                          <Th isNumeric>Ação</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {lessSuggestions.data
                          .filter((sugg) => !sugg.readed)
                          .map((sugg) => (
                            <Tr key={sugg.id}>
                              <Td>{sugg.lesson.name}</Td>
                              <Td>
                                <div className="flex items-center gap-x-2">
                                  <div className="relative h-8 w-8">
                                    {sugg.user?.image ? (
                                      <NextImage
                                        src={sugg.user.image}
                                        alt="user avatar"
                                        fill
                                        className="rounded-full object-cover"
                                      />
                                    ) : (
                                      <FaUserCircle className="h-full w-full" />
                                    )}
                                  </div>
                                  {sugg.user.name}
                                </div>
                              </Td>
                              <Td isNumeric>
                                {moment(sugg.createdAt).fromNow()}
                              </Td>
                              <Td
                                isNumeric
                                className="flex items-center justify-end gap-x-2"
                              >
                                <Popover>
                                  <PopoverTrigger>
                                    <Button>Ver</Button>
                                  </PopoverTrigger>
                                  <Portal>
                                    <PopoverContent>
                                      <PopoverArrow />
                                      <PopoverHeader>
                                        Sugestão de {sugg.user.name}
                                      </PopoverHeader>
                                      <PopoverCloseButton />
                                      <PopoverBody>{sugg.text}</PopoverBody>
                                    </PopoverContent>
                                  </Portal>
                                </Popover>{" "}
                                {sugg.readed ? (
                                  <Button
                                    colorScheme="red"
                                    onClick={() =>
                                      changeLessStts.mutate({
                                        id: sugg.id,
                                        readed: !sugg.readed,
                                      })
                                    }
                                  >
                                    Marcar como não Lido
                                  </Button>
                                ) : (
                                  <Button
                                    colorScheme="whatsapp"
                                    onClick={() =>
                                      changeLessStts.mutate({
                                        id: sugg.id,
                                        readed: !sugg.readed,
                                      })
                                    }
                                  >
                                    Marcar como Lido
                                  </Button>
                                )}
                              </Td>
                            </Tr>
                          ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                )}
              </TabPanel>
              <TabPanel>
                {lessSuggestions.data.length === 0 ? (
                  <Text>
                    <Highlight
                      query="nenhuma sugestão"
                      styles={{
                        px: "2",
                        py: "1",
                        rounded: "full",
                        bg: "red.100",
                      }}
                    >
                      Nenhuma sugestão foi encontrada
                    </Highlight>
                  </Text>
                ) : (
                  <TableContainer>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Tópico</Th>
                          <Th>Usuário</Th>
                          <Th isNumeric>Data</Th>
                          <Th isNumeric>Ação</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {lessSuggestions.data.map((sugg) => (
                          <Tr key={sugg.id}>
                            <Td>{sugg.lesson.name}</Td>
                            <Td>
                              <div className="flex items-center gap-x-2">
                                <div className="relative h-8 w-8">
                                  {sugg.user?.image ? (
                                    <NextImage
                                      src={sugg.user.image}
                                      alt="user avatar"
                                      fill
                                      className="rounded-full object-cover"
                                    />
                                  ) : (
                                    <FaUserCircle className="h-full w-full" />
                                  )}
                                </div>
                                {sugg.user.name}
                              </div>
                            </Td>
                            <Td isNumeric>
                              {moment(sugg.createdAt).fromNow()}
                            </Td>
                            <Td
                              isNumeric
                              className="flex items-center justify-end gap-x-2"
                            >
                              <Popover>
                                <PopoverTrigger>
                                  <Button>Ver</Button>
                                </PopoverTrigger>
                                <Portal>
                                  <PopoverContent>
                                    <PopoverArrow />
                                    <PopoverHeader>
                                      Sugestão de {sugg.user.name}
                                    </PopoverHeader>
                                    <PopoverCloseButton />
                                    <PopoverBody>{sugg.text}</PopoverBody>
                                  </PopoverContent>
                                </Portal>
                              </Popover>{" "}
                              {sugg.readed ? (
                                <Button
                                  colorScheme="red"
                                  onClick={() =>
                                    changeLessStts.mutate({
                                      id: sugg.id,
                                      readed: !sugg.readed,
                                    })
                                  }
                                >
                                  Marcar como não Lido
                                </Button>
                              ) : (
                                <Button
                                  colorScheme="whatsapp"
                                  onClick={() =>
                                    changeLessStts.mutate({
                                      id: sugg.id,
                                      readed: !sugg.readed,
                                    })
                                  }
                                >
                                  Marcar como Lido
                                </Button>
                              )}
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </>
      )}
    </>
  );
};

export default LessonSuggestions;
