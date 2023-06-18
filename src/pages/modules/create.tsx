import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Icon,
  Input,
} from "@chakra-ui/react";
import AutoResizeTextarea from "@components/Layout/AutoResizeTextarea";
import DashboardLayout from "@components/Layout/DashboardLayout";
import DisplayMarkdown from "@components/Layout/DisplayMarkdown";
import { zodResolver } from "@hookform/resolvers/zod";
import useCustomToast from "@hooks/useCustomToast";
import { trpc } from "@utils/trpc";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  type Control,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import {
  AiFillDelete,
  AiOutlineArrowDown,
  AiOutlineArrowUp,
  AiOutlinePlus,
} from "react-icons/ai";
import * as z from "zod";

export const FormSchema = z.object({
  name: z.string().min(1, { message: "O nome do módulo é necessário" }),
  body: z.string(),
  description: z.string(),
  lessons: z
    .array(
      z.object({
        name: z.string().min(1, { message: "O nome do tópico é obrigatório" }),
        richText: z.string(),
        index: z.number(),
      })
    )
    .min(1, { message: "Você deve incluir pelo menos 1 tópico" }),
});

type FormSchemaType = z.infer<typeof FormSchema>;

const CreateModule = () => {
  const {
    handleSubmit,
    control,
    register,
    formState: { errors },
  } = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: { lessons: [{ name: "", richText: "", index: 0 }] },
    mode: "all",
  });

  const { fields, append, remove, move } = useFieldArray({
    name: "lessons",
    control,
  });

  const router = useRouter();
  const { showErrorToast, showSuccessToast } = useCustomToast();

  const createModWLessons = trpc.module.createModWLessons.useMutation({
    onError(err) {
      showErrorToast(err.message, "Não foi possível criar o módulo");
    },
    onSuccess() {
      showSuccessToast("O módulo foi criado com sucesso");
      router.push("/modules");
    },
  });

  const onSubmit = async (data: FormSchemaType) => {
    data.lessons.forEach((_, index) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      data.lessons[index]!.index = index + 1;
    });
    createModWLessons.mutate(data);
  };
  return (
    <>
      <Head>
        <title>Criar módulo • Proativa</title>
        <meta name="description" content="Odyssey Proativa" />
      </Head>
      <main className="container mx-auto flex h-max flex-col p-4">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mx-auto flex max-w-4xl flex-col gap-y-4">
            <Heading>Modulo</Heading>
            <FormControl id="name" isInvalid={!!errors.name} isRequired>
              <FormLabel>Nome do Modulo</FormLabel>
              <Input
                bgColor="white"
                placeholder="o melhor módulo do mundo"
                {...register("name")}
              />
              {errors.name && (
                <FormErrorMessage>{errors.name.message}</FormErrorMessage>
              )}
            </FormControl>
            <FormControl id="description">
              <FormLabel>Descrição do Módulo</FormLabel>
              <Input
                bgColor="white"
                placeholder="uma descrição concisa e útil"
                {...register("description")}
              />
            </FormControl>
            <FormControl id="body">
              <FormLabel>Corpo do Módulo (em Markdown)</FormLabel>
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
                    name: "",
                    richText: "",
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
                  isRequired
                >
                  <FormLabel>Nome do Tópico</FormLabel>
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
                      onClick={() => remove(index)}
                    >
                      Deletar
                    </Button>
                    <Icon
                      as={AiOutlineArrowUp}
                      w={6}
                      h={6}
                      className="cursor-pointer transition-colors hover:text-secondary"
                      onClick={() => {
                        move(index, index - 1);
                      }}
                    />
                    <Icon
                      as={AiOutlineArrowDown}
                      w={6}
                      h={6}
                      className="cursor-pointer transition-colors hover:text-secondary"
                      onClick={() => {
                        move(index, index + 1);
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
              Criar Módulo
            </Button>
          </div>
        </form>
      </main>
    </>
  );
};

export default CreateModule;

const PreviewText = ({ control }: { control: Control<FormSchemaType> }) => {
  const text = useWatch({ control, name: "body" });
  return <DisplayMarkdown text={text} />;
};

CreateModule.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
