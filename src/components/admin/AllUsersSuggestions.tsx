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
  Popover,
  Portal,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverHeader,
  PopoverCloseButton,
  PopoverBody,
} from "@chakra-ui/react";
import { type RouterTypes } from "@utils/trpc";
import NextImage from "next/image";
import moment from "moment";
import "moment/locale/pt-br";
import { FaUserCircle } from "react-icons/fa";
moment.locale("pt-br");

type ModSugg = RouterTypes["admin"]["getModSuggestions"]["output"][0];
type LessSugg = RouterTypes["admin"]["getLessSuggestions"]["output"][0];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isModule = (x: any): x is ModSugg => "module" in x;

interface ISuggestionTableProps {
  suggestions: ModSugg[] | LessSugg[];
  message: string;
  query: string;
  handleChange: (id: string, readed: boolean) => void;
}

const SuggestionTable = ({
  suggestions,
  message,
  query,
  handleChange,
}: ISuggestionTableProps) => {
  return (
    <>
      {suggestions.length === 0 ? (
        <Text>
          <Highlight
            query={query}
            styles={{
              px: "2",
              py: "1",
              rounded: "full",
              bg: "red.100",
            }}
          >
            {message}
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
              {suggestions.map((sugg) => (
                <Tr key={sugg.id}>
                  <Td>
                    {isModule(sugg)
                      ? (sugg as ModSugg).module.name
                      : (sugg as LessSugg).lesson.name}
                  </Td>
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
                  <Td isNumeric>{moment(sugg.createdAt).fromNow()}</Td>
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
                    </Popover>
                    <Button
                      colorScheme={`${sugg.readed ? "red" : "whatsapp"}`}
                      onClick={() => handleChange(sugg.id, sugg.readed)}
                    >
                      {sugg.readed
                        ? "Marcar como não lido"
                        : "Marcar como lido"}
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}
    </>
  );
};

interface IAllUsersSuggestionsProps {
  title: string;
  data?: ModSugg[] | LessSugg[];
  handleChange: (id: string, readed: boolean) => void;
}

function filterReaded<T extends { readed: boolean }>(arr: T[]): T[] {
  return arr.filter((item) => !item.readed);
}

const AllUsersSuggestions = ({
  title,
  data,
  handleChange,
}: IAllUsersSuggestionsProps) => {
  const filteredData = data
    ? isModule(data[0])
      ? filterReaded(data as ModSugg[])
      : filterReaded(data as LessSugg[])
    : [];

  return (
    <div className="flex flex-col gap-8 rounded-lg bg-white p-8 shadow-lg">
      <Heading>{title}</Heading>
      {!data ? (
        <>
          <Skeleton height="10" />
          <Skeleton height="10" />
          <Skeleton height="10" />
        </>
      ) : (
        <>
          <Tabs variant="soft-rounded">
            <TabList>
              <Tab _selected={{ color: "white", bg: "red.500" }}>Não lidos</Tab>
              <Tab _selected={{ color: "white", bg: "primary" }}>Todos</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <SuggestionTable
                  suggestions={filteredData}
                  query="não lida"
                  message="Nenhuma sugestão não lida foi encontrada"
                  handleChange={handleChange}
                />
              </TabPanel>
              <TabPanel>
                <SuggestionTable
                  suggestions={data}
                  query="nenhuma sugestão"
                  message="Nenhuma sugestão foi encontrada"
                  handleChange={handleChange}
                />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default AllUsersSuggestions;
