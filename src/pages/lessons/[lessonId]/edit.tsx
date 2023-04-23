/* eslint-disable react-hooks/exhaustive-deps */
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
} from "@chakra-ui/react";
import AutoResizeTextarea from "@components/Layout/AutoResizeTextarea";
import DashboardLayout from "@components/Layout/DashboardLayout";
import EditLinks from "@components/lessons/EditLinks";
import EditProjects from "@components/lessons/EditProjects";
import EditVideos from "@components/lessons/EditVideos";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@utils/trpc";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { type Control, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { BiReset } from "react-icons/bi";
import DisplayMarkdown from "@components/Layout/DisplayMarkdown";
import useCustomToast from "@hooks/useCustomToast";

export const LessonWUtils = z.object({
  id: z.string(),
  name: z.string().min(1, { message: "O nome do tópico é necessário" }),
  richText: z.string().min(1, { message: "O conteúdo do tópico é necessário" }),
  videos: z.array(
    z.object({
      name: z.string().min(1, { message: "O nome do video é necessário" }),
      url: z.string().min(1, { message: "O URL do video é necessário" }),
      description: z.string(),
    })
  ),
  links: z.array(
    z.object({
      name: z.string().min(1, { message: "O nome do link é necessário" }),
      url: z.string().min(1, { message: "O URL do link é necessário" }),
      description: z.string(),
    })
  ),
  projects: z.array(
    z.object({
      name: z.string().min(1, { message: "O nome do projeto é necessário" }),
      richText: z
        .string()
        .min(1, { message: "O conteúdo do projeto é necessário" }),
    })
  ),
});

export type FormSchemaType = z.infer<typeof LessonWUtils>;

const Edit = () => {
  const router = useRouter();
  const lessonId = useRouter().query.lessonId as string;
  const lesson = trpc.lesson.getLesson.useQuery(
    {
      lessonId,
    },
    { refetchOnWindowFocus: false }
  );

  const {
    handleSubmit,
    control,
    register,
    reset,
    resetField,
    formState: { errors },
  } = useForm<FormSchemaType>({
    resolver: zodResolver(LessonWUtils),
    defaultValues: {
      id: lesson?.data?.id ?? "",
      name: lesson?.data?.name ?? "",
      richText: lesson?.data?.richText ?? "",
    },
    mode: "all",
  });

  const { showErrorToast, showSuccessToast } = useCustomToast();
  const mutation = trpc.lesson.updateLessonWUtils.useMutation({
    onError(err) {
      showErrorToast(err.message, "Não foi possível editar o tópico");
    },
    onSuccess() {
      showSuccessToast("O tópico foi atualizado com sucesso");
      router.push(`/lessons/${lessonId}`);
    },
  });

  const onSubmit = async (data: FormSchemaType) => {
    mutation.mutate(data);
  };

  useEffect(() => {
    if (lesson.data) {
      const format: FormSchemaType = {
        id: lesson.data.id,
        name: lesson.data.name,
        richText: lesson.data.richText,
        videos: lesson.data.videos.map((video) => ({
          name: video.name,
          url: video.url,
          description: video.description ?? "",
        })),
        links: lesson.data.links.map((link) => ({
          name: link.name,
          url: link.url,
          description: link.description ?? "",
        })),
        projects: lesson.data.projects.map((proj) => ({
          name: proj.name,
          richText: proj.richText,
        })),
      };

      reset(format);
    }
  }, [lesson.data]);

  return (
    <>
      <Head>
        <title>{lesson.data?.name} • Proativa</title>
        <meta name="description" content="Odyssey Proativa" />
      </Head>
      <main className="container mx-auto flex flex-col gap-4 p-4">
        {!lesson.data ? (
          "loading..."
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-y-4">
              <Heading>Tópico</Heading>
              <FormControl isInvalid={!!errors.name} isRequired id="name">
                <div className="flex gap-2">
                  <FormLabel>Nome do tópico</FormLabel>
                  <BiReset
                    className="h-6 w-6 cursor-pointer transition-colors hover:text-secondary"
                    onClick={() => resetField("name")}
                  />
                </div>
                <Input
                  bgColor="white"
                  placeholder="um tópico excelente"
                  {...register("name")}
                />
                {errors.name && (
                  <FormErrorMessage>{errors.name.message}</FormErrorMessage>
                )}
              </FormControl>
              <FormControl
                isInvalid={!!errors.richText}
                isRequired
                id="rich-text"
              >
                <div className="flex gap-2">
                  <FormLabel>Conteúdo do tópico (em markdown)</FormLabel>
                  <BiReset
                    className="h-6 w-6 flex-shrink-0 cursor-pointer transition-colors hover:text-secondary"
                    onClick={() => resetField("richText")}
                  />
                </div>
                {errors.richText && (
                  <FormErrorMessage className="mb-2">
                    {errors.richText.message}
                  </FormErrorMessage>
                )}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <AutoResizeTextarea
                    bgColor="white"
                    {...register("richText")}
                  />
                  <PreviewText control={control} />
                </div>
              </FormControl>
              <EditVideos
                errors={errors}
                register={register}
                control={control}
                resetField={resetField}
              />
              <EditLinks
                errors={errors}
                register={register}
                control={control}
                resetField={resetField}
              />
              <EditProjects
                errors={errors}
                register={register}
                control={control}
                resetField={resetField}
              />
            </div>
            <Button type="submit" colorScheme="red" className="mt-4 w-full">
              Criar
            </Button>
          </form>
        )}
      </main>
    </>
  );
};

export default Edit;

Edit.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

const PreviewText = ({ control }: { control: Control<FormSchemaType> }) => {
  const text = useWatch({ control, name: "richText" });
  return <DisplayMarkdown text={text} />;
};
