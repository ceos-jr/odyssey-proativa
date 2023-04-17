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

const ModSuggTabAdmin = () => {
  const toast = useToast();
  const utils = trpc.useContext();
  const modSuggestions = trpc.admin.getModSuggestions.useQuery();
  const changeSuggStts = trpc.module.updSttsOnModSugg.useMutation({
    async onMutate(data) {
      await utils.admin.getModSuggestions.cancel();
      const prevData = utils.admin.getModSuggestions.getData();
      const updData = prevData;
      updData?.forEach((el) => {
        if (el.id === data.id) el.readed = !el.readed;
      });
      utils.admin.getModSuggestions.setData(updData);
      return { prevData };
    },
    onError(err, _, ctx) {
      utils.admin.getModSuggestions.setData(ctx?.prevData);
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
      {!modSuggestions.data ? (
        <>
          <Skeleton height="30px" />
          <Skeleton height="40" />
        </>
      ) : (
        <>
          <Heading>Sugestões para os módulos</Heading>
          <Tabs
            className="p-4 bg-white rounded-lg shadow-lg"
            variant="soft-rounded"
          >
            <TabList>
              <Tab _selected={{ color: "white", bg: "red.500" }}>Não lidos</Tab>
              <Tab _selected={{ color: "white", bg: "primary" }}>Todos</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                {modSuggestions.data.filter((sugg) => !sugg.readed).length ===
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
                          <Th>Módulo</Th>
                          <Th>Usuário</Th>
                          <Th isNumeric>Data</Th>
                          <Th isNumeric>Ação</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {modSuggestions.data
                          .filter((sugg) => !sugg.readed)
                          .map((sugg) => (
                            <Tr key={sugg.id}>
                              <Td>{sugg.module.name}</Td>
                              <Td>
                                <div className="flex gap-x-2 items-center">
                                  <div className="relative w-8 h-8">
                                    {sugg.user?.image ? (
                                      <NextImage
                                        src={sugg.user.image}
                                        alt="user avatar"
                                        fill
                                        className="object-cover rounded-full"
                                      />
                                    ) : (
                                      <FaUserCircle className="w-full h-full" />
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
                                className="flex gap-x-2 justify-end items-center"
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
                                </Popover>
                                {sugg.readed ? (
                                  <Button
                                    colorScheme="red"
                                    onClick={() =>
                                      changeSuggStts.mutate({
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
                                      changeSuggStts.mutate({
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
                {modSuggestions.data.length === 0 ? (
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
                          <Th>Módulo</Th>
                          <Th>Usuário</Th>
                          <Th isNumeric>Data</Th>
                          <Th isNumeric>Ação</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {modSuggestions.data.map((sugg) => (
                          <Tr key={sugg.id}>
                            <Td>{sugg.module.name}</Td>
                            <Td>
                              <div className="flex gap-x-2 items-center">
                                <div className="relative w-8 h-8">
                                  {sugg.user?.image ? (
                                    <NextImage
                                      src={sugg.user.image}
                                      alt="user avatar"
                                      fill
                                      className="object-cover rounded-full"
                                    />
                                  ) : (
                                    <FaUserCircle className="w-full h-full" />
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
                              className="flex gap-x-2 justify-end items-center"
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
                              </Popover>
                              {sugg.readed ? (
                                <Button
                                  colorScheme="red"
                                  onClick={() =>
                                    changeSuggStts.mutate({
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
                                    changeSuggStts.mutate({
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

export default ModSuggTabAdmin;
