import { trpc } from "@utils/trpc";
import useCustomToast from "./useCustomToast";

const useUpdateSuggestion = (userId?: string, moduleId?: string) => {
  const utils = trpc.useContext();
  const { showErrorToast, showSuccessToast } = useCustomToast();

  const changeModGlobally = trpc.modSug.updSttsOnModSugg.useMutation({
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

  const changeModForUser = trpc.modSug.updSttsOnModSugg.useMutation({
    async onMutate(data) {
      await utils.modSug.getUserModSuggestions.cancel(userId);
      const prevData = utils.modSug.getUserModSuggestions.getData(userId);
      const updData = prevData;
      updData?.forEach((el) => {
        if (el.id === data.id) el.readed = !el.readed;
      });
      utils.modSug.getUserModSuggestions.setData(updData);
      return { prevData };
    },
    onError(err, _, ctx) {
      utils.modSug.getUserModSuggestions.setData(ctx?.prevData, userId);
      showErrorToast(err.message, "Erro ao atualizar a sugestão");
    },
    onSuccess() {
      showSuccessToast("Sugestão atualizada com sucesso");
    },
  });

  const changeSingleModule = trpc.module.updSttsOnModSugg.useMutation({
    async onMutate(data) {
      await utils.modSug.allByModuleId.cancel(moduleId);
      const prevData = utils.modSug.allByModuleId.getData(moduleId);
      console.log(prevData);
      const updData = prevData;
      updData?.forEach((el) => {
        if (el.id === data.id) el.readed = !el.readed;
      });
      utils.modSug.allByModuleId.setData(updData, moduleId);
      return { prevData };
    },
    onError(err, _, ctx) {
      utils.modSug.allByModuleId.setData(ctx?.prevData, moduleId);
      showErrorToast(err.message, "Erro ao atualizar a sugestão");
    },
    onSuccess() {
      showSuccessToast("Sugestão atualizada com sucesso");
    },
  });

  const changeLesGlobally = trpc.lessSug.updSttsOnLessSugg.useMutation({
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

  const changeLesForUser = trpc.lessSug.updSttsOnLessSugg.useMutation({
    async onMutate(data) {
      await utils.lessSug.getUserLesSuggestions.cancel(userId);
      const prevData = utils.lessSug.getUserLesSuggestions.getData(userId);
      const updData = prevData;
      updData?.forEach((el) => {
        if (el.id === data.id) el.readed = !el.readed;
      });
      utils.lessSug.getUserLesSuggestions.setData(updData);
      return { prevData };
    },
    onError(err, _, ctx) {
      utils.lessSug.getUserLesSuggestions.setData(ctx?.prevData, userId);
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
    changeSingleModule,
  };
};

export default useUpdateSuggestion;
