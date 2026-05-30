import {
  LayoutDashboard,
  Film,
  Users,
  Building2,
  TrendingUp,
} from "lucide-react";

const Sidebar = () => {
  return (
    <div className="w-72 bg-[#0B1020] border-r border-slate-800 p-6">
      <h1 className="text-2xl font-bold text-violet-500 mb-10">
        CineVerse Empire
      </h1>

      <nav className="space-y-2">
        <button className="w-full flex gap-3 p-3 rounded-xl bg-violet-600">
          <LayoutDashboard size={20} />
          Dashboard
        </button>

        <button className="w-full flex gap-3 p-3 rounded-xl">
          <Film size={20} />
          Scripts
        </button>

        <button className="w-full flex gap-3 p-3 rounded-xl">
          <Users size={20} />
          Talent
        </button>

        <button className="w-full flex gap-3 p-3 rounded-xl">
          <Building2 size={20} />
          Studio
        </button>

        <button className="w-full flex gap-3 p-3 rounded-xl">
          <TrendingUp size={20} />
          Market
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;
