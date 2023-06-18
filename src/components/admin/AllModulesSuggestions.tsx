import useUpdateSuggestion from "@hooks/useUpdateSuggestion";
import { trpc } from "@utils/trpc";
import AllUsersSuggestions from "./AllUsersSuggestions";

const AllModulesSuggestions = () => {
  const { data } = trpc.modSug.getModSuggestions.useQuery();
  const { changeModGlobally } = useUpdateSuggestion();

  const handleChange = (id: string, readed: boolean) => {
    changeModGlobally.mutate({ id, readed: !readed });
  };

  return (
    <AllUsersSuggestions
      title="Sugestões aos Módulos"
      data={data}
      handleChange={handleChange}
    />
  );
};

export default AllModulesSuggestions;
