import { trpc } from "@utils/trpc";
import useCustomToast from "./useCustomToast";

const useUpdateSuggestion = (userId?: string) => {
  const utils = trpc.useContext();
  const { showErrorToast, showSuccessToast } = useCustomToast();

  const changeModGlobally = trpc.module.updSttsOnModSugg.useMutation({
    async onMutate(data) {
      await utils.admin.getModSuggestions.cancel();
      const prevData = utils.admin.getModSuggestions.getData();
      const updData = prevData;
      updData?.forEach((el) => {
        if (el.id === data.id) el.readed = !el.readed;
      });
      utils.admin.getModSuggestions.setData(updData);
      return { prevData };
    },
    onError(err, _, ctx) {
      utils.admin.getModSuggestions.setData(ctx?.prevData);
      showErrorToast(err.message, "Erro ao atualizar a sugestão");
    },
    onSuccess() {
      showSuccessToast("Sugestão atualizada com sucesso");
    },
  });

  const changeModForUser = trpc.module.updSttsOnModSugg.useMutation({
    async onMutate(data) {
      await utils.module.getUserModSuggestions.cancel(userId);
      const prevData = utils.module.getUserModSuggestions.getData(userId);
      const updData = prevData;
      updData?.forEach((el) => {
        if (el.id === data.id) el.readed = !el.readed;
      });
      utils.module.getUserModSuggestions.setData(updData);
      return { prevData };
    },
    onError(err, _, ctx) {
      utils.module.getUserModSuggestions.setData(ctx?.prevData, userId);
      showErrorToast(err.message, "Erro ao atualizar a sugestão");
    },
    onSuccess() {
      showSuccessToast("Sugestão atualizada com sucesso");
    },
  });

  const changeLesGlobally = trpc.lesson.updSttsOnLessSugg.useMutation({
    async onMutate(data) {
      await utils.admin.getLessSuggestions.cancel();
      const prevData = utils.admin.getLessSuggestions.getData();
      const updData = prevData;
      updData?.forEach((el) => {
        if (el.id === data.id) el.readed = !el.readed;
      });
      utils.admin.getLessSuggestions.setData(updData);
      return { prevData };
    },
    onError(err, _, ctx) {
      utils.admin.getLessSuggestions.setData(ctx?.prevData);
      showErrorToast(err.message, "Erro ao atualizar a sugestão");
    },
    onSuccess() {
      showSuccessToast("Sugestão atualizada com sucesso");
    },
  });

  const changeLesForUser = trpc.lesson.updSttsOnLessSugg.useMutation({
    async onMutate(data) {
      await utils.lesson.getUserLesSuggestions.cancel(userId);
      const prevData = utils.lesson.getUserLesSuggestions.getData(userId);
      const updData = prevData;
      updData?.forEach((el) => {
        if (el.id === data.id) el.readed = !el.readed;
      });
      utils.lesson.getUserLesSuggestions.setData(updData);
      return { prevData };
    },
    onError(err, _, ctx) {
      utils.lesson.getUserLesSuggestions.setData(ctx?.prevData, userId);
      showErrorToast(err.message, "Erro ao atualizar a sugestão");
    },
    onSuccess() {
      showSuccessToast("Sugestão atualizada com sucesso");
    },
  });

  return {
    changeModGlobally,
    changeLesGlobally,
    changeModForUser,
    changeLesForUser,
  };
};

export default useUpdateSuggestion;
