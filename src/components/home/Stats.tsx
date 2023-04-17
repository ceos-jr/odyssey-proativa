import StatInProgLesCard from "./StatInProgLesCard";
import StatInProgModCard from "./StatInProgModCard";
import StatInProgTasksCard from "./StatInProgTasksCard";

const Stats = () => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatInProgModCard />
      <StatInProgLesCard />
      <StatInProgTasksCard />
    </div>
  );
};

export default Stats;
