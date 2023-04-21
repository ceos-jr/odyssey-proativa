import { useToast } from "@chakra-ui/react";

const useCustomToast = () => {
  const toast = useToast();

  const showErrorToast = (err: string, title: string) => {
    toast({
      title: title,
      description: `Erro: ${err}`,
      status: "error",
      duration: 4000,
      isClosable: true,
    });
  };

  const showSuccessToast = (title: string) => {
    toast({
      title: title,
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  return {
    showErrorToast,
    showSuccessToast,
  };
};

export default useCustomToast;
