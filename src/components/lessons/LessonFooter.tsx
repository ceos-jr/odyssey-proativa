import { Button, useToast } from "@chakra-ui/react";
import { type RouterTypes, trpc } from "@utils/trpc";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

type OutputProcedure = NonNullable<
  RouterTypes["lesson"]["getLesson"]["output"]
>;

const LessonFooter = (props: OutputProcedure) => {
  const toast = useToast();
  const router = useRouter();
  const [posting, setPosting] = useState(false);
  const compLesson = trpc.user.compLesson.useMutation({
    onError(err) {
      toast({
        title: "Não foi possível finalizar o tópico",
        description: `Erro: ${err.message}`,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    },
    onSuccess() {
      toast({
        title: "O tópico foi finalizado com sucesso",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      if (props.next) router.push(`/lessons/${props.next}`);
    },
    onSettled() {
      setPosting(false);
    },
  });
  const finishModule = trpc.user.finishModule.useMutation({
    onError(err) {
      toast({
        title: "Não foi possível concluir o módulo",
        description: `Erro: ${err.message}`,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    },
    onSuccess() {
      toast({
        title: "O módulo foi concluido com sucesso",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      router.push(`/modules/${props.moduleId}`);
    },
    onSettled() {
      setPosting(false);
    },
  });

  return (
    <div className="flex gap-x-2 justify-center items-center">
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
