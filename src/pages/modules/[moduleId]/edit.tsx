import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Icon,
  Input,
  useDisclosure,
} from "@chakra-ui/react";
import DashboardLayout from "@components/Layout/DashboardLayout";
import Head from "next/head";
import {
  type Control,
  useForm,
  useWatch,
  useFieldArray
} from "react-hook-form";
import DisplayMarkdown from "@components/Layout/DisplayMarkdown";
import AutoResizeTextarea from "@components/Layout/AutoResizeTextarea";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  AiFillDelete,
  AiOutlineArrowDown,
  AiOutlineArrowUp,
  AiOutlinePlus,
} from "react-icons/ai";
import { trpc } from "@utils/trpc";
import { useRouter } from "next/router";
import useCustomToast from "@hooks/useCustomToast";
import { FormSchemaUpdate } from "src/pages/modules/index";
import DeleteLessonAlert from "@components/modules/DeleteLessonAlert";
import { useState } from "react";

type FormSchemaType = z.infer<typeof FormSchemaUpdate>;

const EditModule = () => {
  const router = useRouter();
  const moduleId = useRouter().query.moduleId as string;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [lessonToDelete, setLessonToDelete] = useState<number>(0)

  const { data: formS } = trpc.module.getUnique.useQuery(
    {
      moduleId,
    },
    { refetchOnWindowFocus: true }
  );

  const {
    handleSubmit,
    control,
    register,
    formState: { errors },
  } = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchemaUpdate),
    defaultValues: {
      name: formS?.name ?? "",
      body: formS?.body ?? "",
      description: formS?.description ?? "",
      lessons: formS?.lessons?.map((lesson, index) => {
        return {
          id: lesson.id ?? "",
          name: lesson.name,
          index: lesson.index ?? index
        }
      }) ?? [{
        id: "",
        name: "",
        index: 0
      }]
    },
    mode: "all",
  });

  const { fields, append, remove, move, update } = useFieldArray({
    name: "lessons",
    control,
  });

  const swapFields = (fromIndex: number, diff: number) => {
    const toIndex = fromIndex + diff;
    const updatedFields = [...fields];

    if (updatedFields[fromIndex] && updatedFields[toIndex]) {
      const toIndex = fromIndex + diff;
      
      const fromField = updatedFields[fromIndex];
      const toField = updatedFields[toIndex];

      const aux = fromField.index;

      fromField.index = fromField.index + diff;
      toField.index = aux;

      move(fromIndex, toIndex);

      // update(fromIndex, toField);
      // update(toIndex, fromField);
    }
  }

  const { showErrorToast, showSuccessToast } = useCustomToast();

  const editModule = trpc.module.editModule.useMutation({
    onError(err) {
      showErrorToast(err.message, "Não foi possível editar o módulo");
    },
    onSuccess() {
      showSuccessToast("O módulo foi editado com sucesso");
      router.push(`/modules/${moduleId}`);
    },
  });

  const onSubmit = async (data: FormSchemaType) => {
    console.log(data);

    data.lessons.forEach((_, index) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      data.lessons[index]!.index = index + 1;
    });
    editModule.mutate({ inputModule: data, modId: moduleId });
  };

  return (
    <>
      <Head>
        <title>Editar modulo • Proativa</title>
        <meta name="description" content="Odyssey Proativa" />
      </Head>
      <main className="container mx-auto flex h-max flex-col p-4">
        <DeleteLessonAlert
          isOpen={isOpen}
          onClose={onClose}
          onClickToDelete={() => {
            remove(lessonToDelete)
            onClose()
          }}
        />
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mx-auto flex max-w-4xl flex-col gap-y-4">
            <Heading>Editar Modulo</Heading>
            <FormControl id="name" isInvalid={!!errors.name}>
              <FormLabel>Nome do Modulo</FormLabel>
              <Input
                bgColor="white"
                placeholder="o melhor modulo do mundo"
                {...register("name")}
              />
              {errors.name && (
                <FormErrorMessage>{errors.name.message}</FormErrorMessage>
              )}
            </FormControl>
            <FormControl id="description">
              <FormLabel>Descrição do Modulo</FormLabel>
              <Input
                bgColor="white"
                placeholder="uma descrição concisa e util"
                {...register("description")}
              />
            </FormControl>
            <FormControl id="body">
              <FormLabel>Corpo do Modulo (em markdown)</FormLabel>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <AutoResizeTextarea
                  placeholder="corpo do seu módulo"
                  bgColor="white"
                  {...register("body")}
                />
                <PreviewText control={control} />
              </div>
            </FormControl>
            <div className="flex justify-between gap-x-4">
              <Heading>Tópicos</Heading>
              <Button
                leftIcon={<AiOutlinePlus />}
                colorScheme="green"
                variant="solid"
                onClick={() =>
                  append({
                    id: (fields.length + 1).toString(),
                    name: "",
                    index: fields.length + 1,
                  })
                }
              >
                Novo Tópico
              </Button>
            </div>
            {errors.lessons?.message && (
              <div className="text-red-500">{errors.lessons.message}</div>
            )}            
            {fields.map((field, index) => {
              return (
                <FormControl
                  key={field.id}
                  id={`lessons_${index}_name`}
                  isInvalid={!!errors.lessons && !!errors.lessons[index]}
                >
                  <FormLabel>Nome do tópico {field.index}</FormLabel>
                  
                  {console.log("Index: ", field.index, "Name: ", field.name)}
                  <div className="flex justify-between gap-x-4">
                    <Input
                      placeholder="nome"
                      {...register(`lessons.${index}.name` as const)}
                      bgColor="white"
                    />
                    <Button
                      leftIcon={<AiFillDelete />}
                      colorScheme="red"
                      variant="solid"
                      onClick={() => {
                        setLessonToDelete(index)
                        onOpen();
                      }}
                    >
                      Deletar
                    </Button>
                    <Icon
                      as={AiOutlineArrowUp}
                      w={6}
                      h={6}
                      className="cursor-pointer transition-colors hover:text-secondary"
                      onClick={() => {
                        swapFields(index, -1);
                      }}
                    />
                    <Icon
                      as={AiOutlineArrowDown}
                      w={6}
                      h={6}
                      className="cursor-pointer transition-colors hover:text-secondary"
                      onClick={() => {
                        swapFields(index, +1);
                      }}
                    />
                  </div>
                  {errors.lessons && errors.lessons[index]?.name && (
                    <FormErrorMessage>
                      {errors.lessons[index]?.name?.message}
                    </FormErrorMessage>
                  )}
                </FormControl>
              );
            })}
            <Button
              variant="solid"
              colorScheme="green"
              className="my-4 w-1/3"
              type="submit"
            >
              Editar Modulo
            </Button>
          </div>
        </form>
      </main>
    </>
  );
};

export default EditModule;

const PreviewText = ({ control }: { control: Control<FormSchemaType> }) => {
  const text = useWatch({ control, name: "body" });
  return <DisplayMarkdown text={text} />;
};

EditModule.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

