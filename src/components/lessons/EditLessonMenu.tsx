import {
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import { BiTask } from "react-icons/bi";
import { BsPencil, BsThreeDots } from "react-icons/bs";
import NextLink from "next/link";

interface EditLessonMenuProps {
  lessonId: string;
}

const EditLessonMenu = ({ lessonId }: EditLessonMenuProps) => {
  return (
    <Menu>
      <MenuButton as={IconButton} icon={<BsThreeDots />} />
      <MenuList>
        <NextLink href={`/lessons/${lessonId}/edit`}>
          <MenuItem icon={<BsPencil />}>Editar Tópico</MenuItem>
        </NextLink>
        <NextLink href={`/lessons/${lessonId}/managetasks`}>
          <MenuItem icon={<BiTask />}>Editar Atividades</MenuItem>
        </NextLink>
      </MenuList>
    </Menu>
  );
};

export default EditLessonMenu;
