import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Icon,
  Input,
} from "@chakra-ui/react";
import {
  type FieldErrorsImpl,
  useFieldArray,
  type UseFormRegister,
  type Control,
  type UseFormResetField,
} from "react-hook-form";
import { AiFillDelete, AiOutlineArrowUp, AiOutlinePlus } from "react-icons/ai";
import { BiReset } from "react-icons/bi";
import { type FormSchemaType } from "src/pages/lessons/[lessonId]/edit";

interface EditVideosProps {
  register: UseFormRegister<FormSchemaType>;
  errors: FieldErrorsImpl<FormSchemaType>;
  control: Control<FormSchemaType>;
  resetField: UseFormResetField<FormSchemaType>;
}

const EditVideos = ({
  register,
  control,
  errors,
  resetField,
}: EditVideosProps) => {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "videos",
  });
  return (
    <>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex gap-2">
          <Heading>Videos</Heading>
          <BiReset
            className="h-6 w-6 flex-shrink-0 cursor-pointer transition-colors hover:text-secondary"
            onClick={() => resetField("videos")}
          />
        </div>
        <Button
          leftIcon={<AiOutlinePlus />}
          colorScheme="green"
          variant="solid"
          onClick={() =>
            append({
              name: "",
              url: "",
              description: "",
            })
          }
        >
          Novo Video
        </Button>
      </div>
      {fields.map((field, index) => {
        return (
          <div
            className="flex items-center justify-between gap-x-4"
            key={field.id}
          >
            <div className="flex w-full flex-col">
              <div className="grid w-full grid-cols-2 gap-4">
                <FormControl
                  isRequired
                  isInvalid={!!errors?.videos && !!errors.videos[index]?.name}
                  id={`videos_${index}_name`}
                >
                  <FormLabel>Nome do video</FormLabel>
                  <Input
                    placeholder="nome"
                    {...register(`videos.${index}.name` as const)}
                    bgColor="white"
                  />
                  {errors.videos && errors.videos[index]?.name && (
                    <FormErrorMessage>
                      {errors.videos[index]?.name?.message}
                    </FormErrorMessage>
                  )}
                </FormControl>
                <FormControl
                  isRequired
                  isInvalid={!!errors?.videos && !!errors.videos[index]?.url}
                  id={`videos_${index}_url`}
                >
                  <FormLabel>URL do video</FormLabel>
                  <Input
                    placeholder="url"
                    {...register(`videos.${index}.url` as const)}
                    bgColor="white"
                    type="url"
                  />
                  {errors.videos && errors.videos[index]?.url && (
                    <FormErrorMessage>
                      {errors.videos[index]?.url?.message}
                    </FormErrorMessage>
                  )}
                </FormControl>
              </div>
              <FormLabel className="mt-4">Descrição do video</FormLabel>
              <Input
                placeholder="descrição"
                {...register(`videos.${index}.description` as const)}
                bgColor="white"
                id={`videos_${index}_description`}
              />
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
        );
      })}
    </>
  );
};

export default EditVideos;
