import useUpdateSuggestion from "@hooks/useUpdateSuggestion";
import { trpc } from "@utils/trpc";
import AllUsersSuggestions from "./AllUsersSuggestions";

const AllLessonsSuggestions = () => {
  const { data } = trpc.admin.getLessSuggestions.useQuery();
  const { changeLesGlobally } = useUpdateSuggestion();

  const handleChange = (id: string, readed: boolean) => {
    changeLesGlobally.mutate({ id, readed: !readed });
  };
  return (
    <AllUsersSuggestions
      title="Sugestões aos Tópicos"
      data={data}
      handleChange={handleChange}
    />
  );
};

export default AllLessonsSuggestions;
