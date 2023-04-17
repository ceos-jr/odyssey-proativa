import StatLessCountCard from "./StatLessCountCard";
import StatModCountCard from "./StatModCountCard";
import StatUserCountCard from "./StatUserCountCard";

const AdminStats = () => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatUserCountCard />
      <StatModCountCard />
      <StatLessCountCard />
    </div>
  );
};

export default AdminStats;
