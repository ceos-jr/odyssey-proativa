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
import DisplayMarkdown from "@components/Layout/DisplayMarkdown";
import {
  type FieldErrorsImpl,
  useFieldArray,
  type UseFormRegister,
  type Control,
  useWatch,
  type UseFormResetField,
} from "react-hook-form";
import { AiFillDelete, AiOutlineArrowUp, AiOutlinePlus } from "react-icons/ai";
import { BiReset } from "react-icons/bi";
import { type FormSchemaType } from "src/pages/lessons/[lessonId]/edit";

interface EditProjectsProps {
  register: UseFormRegister<FormSchemaType>;
  errors: FieldErrorsImpl<FormSchemaType>;
  control: Control<FormSchemaType>;
  resetField: UseFormResetField<FormSchemaType>;
}

const EditProjects = ({
  register,
  control,
  errors,
  resetField,
}: EditProjectsProps) => {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "projects",
  });
  return (
    <>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex gap-2">
          <Heading>Projetos</Heading>
          <BiReset
            className="h-6 w-6 flex-shrink-0 cursor-pointer transition-colors hover:text-secondary"
            onClick={() => resetField("projects")}
          />
        </div>
        <Button
          leftIcon={<AiOutlinePlus />}
          colorScheme="green"
          variant="solid"
          onClick={() =>
            append({
              name: "",
              richText: "",
            })
          }
        >
          Novo Projeto
        </Button>
      </div>
      {fields.map((field, index) => {
        return (
          <div key={field.id}>
            <div className="flex items-center justify-between gap-x-4">
              <div className="flex w-full flex-col">
                <FormControl
                  isRequired
                  isInvalid={
                    !!errors?.projects && !!errors.projects[index]?.name
                  }
                  id={`projects_${index}_name`}
                >
                  <FormLabel>Nome do project</FormLabel>
                  <Input
                    placeholder="nome"
                    {...register(`projects.${index}.name` as const)}
                    bgColor="white"
                  />
                  {errors.projects && errors.projects[index]?.name && (
                    <FormErrorMessage>
                      {errors.projects[index]?.name?.message}
                    </FormErrorMessage>
                  )}
                </FormControl>
                <FormControl
                  isRequired
                  isInvalid={
                    !!errors?.projects && !!errors.projects[index]?.richText
                  }
                  id={`projects_${index}_rich_text`}
                >
                  <FormLabel className="mt-4">
                    Conteúdo do projeto (em Markdown)
                  </FormLabel>
                  {errors.projects && errors.projects[index]?.richText && (
                    <FormErrorMessage className="mb-4">
                      {errors.projects[index]?.richText?.message}
                    </FormErrorMessage>
                  )}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <AutoResizeTextarea
                      placeholder="# Titulo do projeto"
                      {...register(`projects.${index}.richText` as const)}
                      bgColor="white"
                    />
                    <PreviewText control={control} index={index} />
                  </div>
                </FormControl>
              </div>
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
            </div>
          </div>
        );
      })}
    </>
  );
};

const PreviewText = ({
  control,
  index,
}: {
  control: Control<FormSchemaType>;
  index: number;
}) => {
  const projects = useWatch({ control, name: "projects" });
  const getRichText = () => {
    if (projects) {
      return projects[index]?.richText ?? "";
    }
    return "";
  };
  return <DisplayMarkdown text={getRichText()} />;
};

export default EditProjects;
