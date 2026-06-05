import {
  LayoutDashboard,
  Film,
  Users,
  Building2,
  TrendingUp,
  FileBarChart,
  Pen,
  Bell,
  ShieldCheck,
  Settings,
} from "lucide-react";

import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: LayoutDashboard,
    },
    {
      name: "Movies",
      path: "/movies",
      icon: Film,
    },
    {
      name: "Ready for Release",
      path: "/movies/ready",
      icon: Film,
    },
    {
      name: "Library",
      path: "/movies/library",
      icon: Film,
    },
    {
      name: "Production Queue",
      path: "/movies/queue",
      icon: Layers,
    },
    {
      name: "Comparison",
      path: "/movies/comparison",
      icon: Scale,
    },
    {
      name: "Scripts",
      path: "/scripts",
      icon: Film,
    },
    {
      name: "Writers",
      path: "/writers",
      icon: Pen,
    },
    {
      name: "Directors",
      path: "/directors",
      icon: Users,
    },
    {
      name: "Actors",
      path: "/actors",
      icon: Users,
    },
    {
      name: "Crew Market",
      path: "/crew",
      icon: Users,
    },
    {
      name: "Owned Crew",
      path: "/crew/owned",
      icon: Building2,
    },
    {
      name: "Notifications",
      path: "/notifications",
      icon: Bell,
    },
    {
      name: "Talent",
      path: "/talent",
      icon: Users,
    },
    {
      name: "Studio Stats",
      path: "/studio/stats",
      icon: Building2,
    },
    {
      name: "Financials",
      path: "/studio/history",
      icon: IndianRupee,
    },
    {
      name: "Market",
      path: "/market",
      icon: TrendingUp,
    },
    {
      name: "Reports",
      path: "/reports",
      icon: FileBarChart,
    },
    {
      name: "Auth Monitor",
      path: "/auth-monitoring",
      icon: ShieldCheck,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: Settings,
    },
  ];

  return (
    <aside className="w-72 bg-[#0B1020] border-r border-slate-800 p-6 flex flex-col">
      <h1 className="text-3xl font-bold text-violet-500 mb-10">CineVerse</h1>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          const active = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex
                items-center
                gap-3
                p-3
                rounded-xl
                transition-all
                duration-200
                ${
                  active
                    ? "bg-violet-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }
              `}
            >
              <Icon size={20} />

              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
