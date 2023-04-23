import { Button } from "@chakra-ui/react";
import useCustomToast from "@hooks/useCustomToast";
import { type RouterTypes, trpc } from "@utils/trpc";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

type OutputProcedure = NonNullable<
  RouterTypes["lesson"]["getLesson"]["output"]
>;

const LessonFooter = (props: OutputProcedure) => {
  const { showErrorToast, showSuccessToast } = useCustomToast();

  const router = useRouter();
  const [posting, setPosting] = useState(false);
  const compLesson = trpc.user.compLesson.useMutation({
    onError(err) {
      showErrorToast(err.message, "Não foi possível finalizar o tópico");
    },
    onSuccess() {
      showSuccessToast("O tópico foi finalizado com sucesso");
      if (props.next) router.push(`/lessons/${props.next}`);
    },
    onSettled() {
      setPosting(false);
    },
  });
  const finishModule = trpc.user.finishModule.useMutation({
    onError(err) {
      showErrorToast(err.message, "Não foi possível concluir o módulo");
    },
    onSuccess() {
      showSuccessToast("O módulo foi concluido com sucesso");
      router.push(`/modules/${props.moduleId}`);
    },
    onSettled() {
      setPosting(false);
    },
  });

  return (
    <div className="flex items-center justify-center gap-x-2">
      {props.previous ? (
        <NextLink href={`/lessons/${props.previous}`}>
          <Button colorScheme="linkedin">Anterior</Button>
        </NextLink>
      ) : (
        <Button colorScheme="linkedin" isDisabled={true}>
          Anterior
        </Button>
      )}
      {props.next ? (
        <Button
          colorScheme="linkedin"
          isDisabled={posting}
          isLoading={posting}
          onClick={() => {
            setPosting(true);
            compLesson.mutate(props.id);
          }}
        >
          Próximo
        </Button>
      ) : (
        <Button
          colorScheme="green"
          isDisabled={posting}
          isLoading={posting}
          loadingText="concluindo"
          onClick={() => {
            setPosting(true);
            compLesson.mutate(props.id);
            finishModule.mutate(props.moduleId);
          }}
        >
          Concluir
        </Button>
      )}
    </div>
  );
};

export default LessonFooter;
