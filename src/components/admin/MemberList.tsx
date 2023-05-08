import {
  Button,
  Heading,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Skeleton,
  AlertDialog,
  AlertDialogHeader,
  AlertDialogCloseButton,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogContent,
  useDisclosure,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { trpc } from "@utils/trpc";
import { FaUserCircle } from "react-icons/fa";
import NextImage from "next/image";
import { BsThreeDots, BsTrash } from "react-icons/bs";
import React, { useState } from "react";
import { Roles } from "@utils/constants";
import { AiOutlineEye } from "react-icons/ai";
import NextLink from "next/link";
import useCustomToast from "@hooks/useCustomToast";


const MemberList = () => {
  const { showErrorToast, showSuccessToast } = useCustomToast();

  const utils = trpc.useContext();
  const allMembers = trpc.admin.getAllMembers.useQuery();

  const promoteUserToAdminMut = trpc.admin.PromoteToAdmin.useMutation({
    async onMutate() {
      await utils.admin.getAllMembers.cancel();
      const prevData = utils.admin.getAllMembers.getData();
      const filtData = prevData?.filter((user) => {
        if (user.id === promoteUserToAdmin.id) {
          user.role = 'admin';
        }
    });
      utils.admin.getAllMembers.setData(filtData);
      return { prevData };
    },
    onError(err, _, ctx) {
      utils.admin.getAllMembers.setData(ctx?.prevData);
      showErrorToast(err.message, "Não foi possível promover o usuário");
    },
    onSuccess() {
      showSuccessToast(
        "Usuário agora é administrador",
        `O usuário ${promoteUserToAdmin.name} foi promovido a administrador.`
      );
    },
  });

  const delUserMut = trpc.admin.delUser.useMutation({
    async onMutate() {
      await utils.admin.getAllMembers.cancel();
      const prevData = utils.admin.getAllMembers.getData();
      const filtData = prevData?.filter((user) => user.id !== delUser.id);
      utils.admin.getAllMembers.setData(filtData);
      return { prevData };
    },
    onError(err, _, ctx) {
      utils.admin.getAllMembers.setData(ctx?.prevData);
      showErrorToast(err.message, "Não foi possível deletar o usuário");
    },
    onSuccess() {
      showSuccessToast(
        "Usuário deletado com sucesso.",
        `O usuário ${delUser.name} foi deletado da capacitação.`
      );
    },
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [delUser, setDelUser] = useState({ name: "", id: "" });
  const [promoteUserToAdmin, setPromoteUserToAdmin] = useState({ name: "", id: "" });
  const cancelRef = React.useRef(null);

  return (
    <div className="flex flex-col gap-8 rounded-lg bg-white p-8 shadow-lg">
      {!allMembers.data ? (
        <>
          <Skeleton height="30px" />
          <Skeleton height="40" />
        </>
      ) : (
        <>
          <Heading>Membros da Proativa</Heading>
          <AlertDialog
            motionPreset="slideInBottom"
            leastDestructiveRef={cancelRef}
            onClose={onClose}
            isOpen={isOpen}
            isCentered
          >
            <AlertDialogOverlay />
        
            <AlertDialogContent>
              <AlertDialogHeader>
                Deletar usuário {delUser.name}?
              </AlertDialogHeader>
              <AlertDialogCloseButton />
              <AlertDialogBody>
                Você tem certeza que deseja deletar o usuário? Essa ação não
                pode ser desfeita
              </AlertDialogBody>
              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onClose}>
                  Não
                </Button>
                <Button
                  colorScheme="red"
                  ml={3}
                  onClick={() => {
                    delUserMut.mutate(delUser.id);
                    onClose();
                  }}
                >
                  Sim
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          {allMembers.data.length === 0 ? (
            <Text>
              Nenhum membro da Proativa foi encontrado, veja se há alguma
              confirmação pendente
            </Text>
          ) : (
            <TableContainer>
              <Table>
                <Thead>
                  <Tr>
                    <Th>Usuário</Th>
                    <Th>Cargo</Th>
                    <Th isNumeric>Módulos em progresso</Th>
                    <Th isNumeric>Módulos concluídos</Th>
                    <Th isNumeric>Ações</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {allMembers.data.map((mem) => (
                    <Tr key={mem.id}>
                      <Td>
                        {" "}
                        <div className="flex items-center gap-x-2">
                          <div className="relative h-8 w-8">
                            {mem?.image ? (
                              <NextImage
                                src={mem.image}
                                alt="user avatar"
                                fill
                                className="rounded-full object-cover"
                              />
                            ) : (
                              <FaUserCircle className="h-full w-full" />
                            )}
                          </div>
                          {mem.name}
                        </div>
                      </Td>
                      <Td>{mem.role}</Td>
                      <Td isNumeric>
                        {
                          mem.modulesProgress.filter((mod) => !mod.completed)
                            .length
                        }
                      </Td>
                      <Td isNumeric>
                        {
                          mem.modulesProgress.filter((mod) => mod.completed)
                            .length
                        }
                      </Td>
                      <Td className="flex justify-end">
                        <Menu>
                          <MenuButton as={IconButton} icon={<BsThreeDots />} />
                          <MenuList>
                          {mem.role === Roles.Member && (
                              <MenuItem
                                icon={<FaUserCircle />}
                                onClick={() => {
                                  setPromoteUserToAdmin({
                                    name: mem.name as string,
                                    id: mem.id,
                                  });
                                  promoteUserToAdminMut.mutate(mem.id)
                                }}
                              >
                                Transformar em Admin
                              </MenuItem>
                            )}
                            {mem.role !== Roles.Admin && (
                              <MenuItem
                                icon={<BsTrash />}
                                onClick={() => {
                                  setDelUser({
                                    name: mem.name as string,
                                    id: mem.id,
                                  });
                                  onOpen();
                                }}
                              >
                                Delete User
                              </MenuItem>
                            )}
                            <NextLink
                              href={{
                                pathname: "/admin/users/[userId]",
                                query: { userId: mem.id },
                              }}
                            >
                              <MenuItem icon={<AiOutlineEye />}>
                                Ver usuário
                              </MenuItem>
                            </NextLink>
                          </MenuList>
                        </Menu>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          )}
        </>
      )}
    </div>
  );
};

export default MemberList;
