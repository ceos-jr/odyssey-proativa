import {
  Heading,
  Stack,
  Skeleton,
  SkeletonText,
  Button,
  useDisclosure,
} from "@chakra-ui/react";
import DashboardLayout from "@components/Layout/DashboardLayout";
import ModSuggestionModal from "@components/Layout/ModSuggestionModal";
import DisplayMarkdown from "@components/Layout/DisplayMarkdown";
import LessonsList from "@components/modules/LessonsList";
import SingleModSuggestionList from "@components/modules/SingleModSuggestionList";
import useCustomToast from "@hooks/useCustomToast";
import { Roles } from "@utils/constants";
import { trpc } from "@utils/trpc";
import { useSession } from "@utils/useSession";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { AiOutlineDelete, AiOutlineInbox } from "react-icons/ai";
import { FaFileSignature } from "react-icons/fa";
import { BsPencil } from "react-icons/bs";
import NextLink from "next/link";

const UniqueModule = () => {
  const { data: session } = useSession();
  const [posting, setPosting] = useState(false);
  const { showErrorToast, showSuccessToast } = useCustomToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const router = useRouter();
  const utils = trpc.useContext();
  const moduleId = useRouter().query.moduleId as string;
  const { data: moduleData } = trpc.module.getUnique.useQuery({
    moduleId,
  });
  const { data: userRel } = trpc.module.getUserModStats.useQuery({ moduleId });

  const shiftOwner = trpc.module.shiftOwner.useMutation({
    onError(err) {
      showErrorToast(err.message, "Não mudar o responsável por esse módulo"); // melhorar esse texto
    },
    onSuccess() {
      showSuccessToast("Operação realizada"); // Melhorar esse texto
      utils.module.getUserModStats.refetch({ moduleId });
    },
  });

  const delModule = trpc.admin.delModule.useMutation({
    onError(err) {
      showErrorToast(err.message, "Não foi possível deletar o módulo");
    },
    onSuccess() {
      showSuccessToast("O módulo foi deletado com sucesso");
      router.push("/modules");
    },
  });

  const subsToModule = trpc.module.subsToModule.useMutation({
    onError(err) {
      showErrorToast(err.message, "Não foi possível se inscrever no módulo");
    },
    onSuccess() {
      showSuccessToast("Você foi inscrito com sucesso no módulo");
      utils.module.getUserModStats.refetch({ moduleId });
    },
    onSettled() {
      setPosting(false);
    },
  });

  const desubToModule = trpc.module.desubToModule.useMutation({
    async onMutate() {
      await utils.module.getUserModStats.cancel({ moduleId });
      const prevData = utils.module.getUserModStats.getData({ moduleId });
      utils.module.getUserModStats.setData(null, { moduleId });
      return { prevData };
    },
    onError(err, _, ctx) {
      utils.module.getUserModStats.setData(ctx?.prevData);
      showErrorToast(err.message, "Não foi possível se desincrever do módulo");
    },
    onSuccess() {
      showSuccessToast("Você foi desenscrevido com sucesso no módulo");
    },
    onSettled() {
      setPosting(false);
    },
  });

  return (
    <>
      <Head>
        <title>{moduleData?.name} • Proativa</title>
        <meta name="description" content="Odyssey Proativa" />
      </Head>
      <main className="container mx-auto flex h-max flex-col p-4">
        <ModSuggestionModal
          isOpen={isOpen}
          onClose={onClose}
          moduleId={moduleId}
        />
        {!moduleData ? (
          <UniqueModuleSkeleton />
        ) : (
          <>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <Heading className="w-6/12" as="h1" size="3xl">
                {`Modulo de ${moduleData.name}`}
              </Heading>
              <div className="flex flex-wrap justify-end gap-4">
                {!userRel ? (
                  <Button
                    colorScheme="green"
                    isLoading={posting}
                    onClick={() => {
                      setPosting(true);
                      subsToModule.mutate(moduleData);
                    }}
                  >
                    Inscrever
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={onOpen}
                      leftIcon={<AiOutlineInbox />}
                      colorScheme="twitter"
                    >
                      Sugestões
                    </Button>
                    <Button
                      colorScheme="red"
                      isLoading={posting}
                      onClick={() => {
                        setPosting(true);
                        desubToModule.mutate({ moduleId: moduleData.id });
                      }}
                    >
                      Desinscrever
                    </Button>
                  </>
                )}
                {session?.user?.role === Roles.Admin && (
                  <>
                    <NextLink href={`/modules/${moduleId}/edit`}>
                      <Button leftIcon={<BsPencil />} colorScheme="blue">
                        Editar
                      </Button>
                    </NextLink>
                    <Button
                      leftIcon={<AiOutlineDelete />}
                      colorScheme="red"
                      onClick={() => delModule.mutate(moduleId)}
                    >
                      Deletar
                    </Button>
                    <Button
                      leftIcon={<FaFileSignature />}
                      colorScheme="teal"
                      onClick={() => shiftOwner.mutate(moduleId)}
                    >
                      Assinar
                    </Button>
                  </>
                )}
              </div>
            </div>
            <DisplayMarkdown className="my-6" text={moduleData?.body || ""} />
            <Heading as="h2" className="my-4">
              Aulas
            </Heading>
            <LessonsList lessons={moduleData.lessons} userModRel={userRel} />
            {session?.user?.role === Roles.Admin && (
              <SingleModSuggestionList moduleId={moduleId} />
            )}
          </>
        )}
      </main>
    </>
  );
};

export default UniqueModule;

UniqueModule.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

const UniqueModuleSkeleton = () => {
  return (
    <Stack>
      <Skeleton mb="10" noOfLines={1} height="8" />
      <SkeletonText mb="20" noOfLines={3} />
    </Stack>
  );
};
