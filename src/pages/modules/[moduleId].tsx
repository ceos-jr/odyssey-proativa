import {
  Heading,
  Text,
  Stack,
  Skeleton,
  SkeletonText,
  Button,
  useDisclosure,
  TableContainer,
} from "@chakra-ui/react";
import DashboardLayout from "@components/Layout/DashboardLayout";
import ModSuggestionModal from "@components/Layout/ModSuggestionModal";
import DisplayMarkdown from "@components/Layout/DisplayMarkdown";
import LessonsList from "@components/modules/LessonsList";
import SingleModSuggestionList from "@components/modules/SingleModSuggestionList";
import useCustomToast from "@hooks/useCustomToast";
import { Role } from "@prisma/client";
import { Roles } from "@utils/constants";
import { trpc } from "@utils/trpc";
import { useSession } from "@utils/useSession";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { AiOutlineDelete, AiOutlineInbox } from "react-icons/ai";

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
              <Heading as="h1" size="3xl">
                {`Modulo de ${moduleData.name}`}
              </Heading>
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
                <div className="flex gap-4">
                  {session?.user?.role === Role.ADMIN && (
                    <Button
                      leftIcon={<AiOutlineDelete />}
                      colorScheme="red"
                      onClick={() => delModule.mutate(moduleId)}
                    >
                      Deletar
                    </Button>
                  )}
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
                </div>
              )}
            </div>
            <DisplayMarkdown className="my-6" text={moduleData?.body || ""} />
            <Heading as="h2" className="my-4">
              Aulas
            </Heading>
            <LessonsList lessons={moduleData.lessons} userModRel={userRel} />
            {session?.user?.role === Roles.Admin ? (
              <SingleModSuggestionList moduleId={moduleId} />
            ) : null}
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
