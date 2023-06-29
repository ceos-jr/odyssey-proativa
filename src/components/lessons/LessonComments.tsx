import React from "react";
import {
  Heading,
  Avatar,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Button
} from "@chakra-ui/react";
import { BsThreeDots } from "react-icons/bs";
import { AiFillDelete } from "react-icons/ai"

const CommentCard = () => {
  return (
    <div className={`
      grid max-h-[150px] w-1/2 grid-cols-10 grid-rows-5
      rounded-lg bg-white shadow-lg py-2`
    }>
      <div className="flex items-center col-span-full row-span-1 px-2">
        <Avatar size="sm" marginRight="1rem" name="gabrigas" />
        <Heading as="h3" size="sm" marginRight="auto">
          Gabrigas
        </Heading>
        <Menu>
          <MenuButton size="sm" as={IconButton} icon={<BsThreeDots />} /> 
          <MenuList>
            <MenuItem icon={<AiFillDelete />}>Deletar</MenuItem>
          </MenuList>
        </Menu>
      </div>
      <div className="col-span-full row-span-4 py-2 px-4 overflow-y-auto">
        <p>
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quis ea ab voluptatibus quaerat? Quia, reiciendis officia voluptatum, repellendus debitis velit non ad cum doloribus sit nulla. Eum cupiditate quam corporis. Odio voluptates adipisci quibusdam fugit, delectus molestias expedita aliquam eaque veritatis assumenda sed itaque doloremque voluptatum, velit veniam voluptate? Vero! 
        </p>
      </div>
    </div>
  );
};

const LessonComments = () => {
  return (
    <>
      <Heading as="h2" size="xl">
        Comentários
      </Heading>
      <div className="flex flex-col gap-4 rounded-lg bg-white py-4 px-8 shadow-lg">
        <CommentCard />
        <CommentCard />
        <CommentCard />
        <CommentCard />
        <CommentCard />
        <div className="my-4">
          <Button
            colorScheme="green"
          >
            Comentar 
          </Button>
        </div> 
      </div>
    </>
  );
};

export default LessonComments;
