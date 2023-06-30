import React, { useState } from "react";
import {
  Heading,
  Avatar,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Button,
  useDisclosure,
} from "@chakra-ui/react";
import { BsThreeDots } from "react-icons/bs";
import { AiFillDelete } from "react-icons/ai";
import { type RouterTypes } from "@utils/trpc";
import AddCommentModal from "@components/lessons/AddCommentModal";
import DeleteCommentAlert from "@components/lessons/DeleteCommentAlert";
import useCustomToast from "@hooks/useCustomToast";
import { useSession } from "@utils/useSession";
import { trpc } from "@utils/trpc";

export type Comments = NonNullable<
  RouterTypes["comments"]["getByLessonId"]["output"]
>;

interface LessonCommentsProps {
  comments: Comments;
  lessonId: string;
}

interface CommentCardProps {
  comment: Comments[0];
  onClickToDelete: (commentId: string) => void;
}

const CommentCard = ({ comment, onClickToDelete }: CommentCardProps) => {
  const { data } = useSession();

  return (
    <div
      className={`
      grid max-h-[150px] w-1/2 grid-cols-10 grid-rows-5
      rounded-lg bg-white py-2 shadow-lg`}
    >
      <div className="col-span-full row-span-1 flex items-center px-2">
        <Avatar
          size="sm"
          marginRight="1rem"
          name={comment.user.name ?? ""}
          src={comment.user.image ?? ""}
        />
        <Heading as="h3" size="sm" marginRight="auto">
          {comment.user.name}
        </Heading>
        {comment.user.id === data?.user?.id && (
          <Menu>
            <MenuButton size="sm" as={IconButton} icon={<BsThreeDots />} />
            <MenuList>
              <MenuItem
                onClick={() => onClickToDelete(comment.id)}
                icon={<AiFillDelete />}
              >
                Deletar
              </MenuItem>
            </MenuList>
          </Menu>
        )}
      </div>
      <div className="col-span-full row-span-4 overflow-y-auto py-2 px-4">
        <p>{comment.text}</p>
      </div>
    </div>
  );
};

const LessonComments = ({ comments, lessonId }: LessonCommentsProps) => {
  const [commentToDelete, setCommentToDelete] = useState<string>("");
  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose,
  } = useDisclosure();
  const {
    isOpen: isAlertOpen,
    onOpen: onAlertOpen,
    onClose: onAlertClose,
  } = useDisclosure();
  const { showErrorToast, showSuccessToast } = useCustomToast();
  const utils = trpc.useContext();

  const deleteComment = trpc.comments.deleteLessComment.useMutation({
    async onMutate() {
      await utils.comments.getByLessonId.cancel(lessonId);
      const prevData = utils.comments.getByLessonId.getData(lessonId);
      const filtData = prevData?.filter((less) => less.id !== commentToDelete);
      utils.comments.getByLessonId.setData(filtData, lessonId);

      return { prevData };
    },
    onError(err, _, ctx) {
      utils.comments.getByLessonId.setData(ctx?.prevData, lessonId);
      showErrorToast(err.message, "Não foi possivel deletar o comentario");
    },
    onSuccess() {
      showSuccessToast("O comentário foi deletado com sucesso");
    },
  });

  const onClickToDelete = (commentId: string) => {
    setCommentToDelete(commentId);
    onAlertOpen();
  };

  const clickToDeleteComment = () => {
    onAlertClose();
    deleteComment.mutate(commentToDelete);
  };

  return (
    <>
      <Heading as="h2" size="xl">
        Comentários
      </Heading>
      <div className="flex flex-col gap-4 rounded-lg bg-white py-4 px-8 shadow-lg">
        {comments.length > 0 ? (
          comments.map((comment) => {
            return (
              <CommentCard
                key={comment.id}
                comment={comment}
                onClickToDelete={onClickToDelete}
              />
            );
          })
        ) : (
          <p>Este tópico ainda não contém comentários</p>
        )}
        <AddCommentModal
          onClose={onModalClose}
          isOpen={isModalOpen}
          lessonId={lessonId}
        />
        <DeleteCommentAlert
          onClose={onAlertClose}
          isOpen={isAlertOpen}
          onClickToDelete={clickToDeleteComment}
        />
        <div className="my-4">
          <Button onClick={onModalOpen} colorScheme="green">
            Comentar
          </Button>
        </div>
      </div>
    </>
  );
};

export default LessonComments;
