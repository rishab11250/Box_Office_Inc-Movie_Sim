import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { DollarSign, Star, Users, Building } from "lucide-react";

import api from "../../api/axios";
import { setUser } from "../../features/auth/authSlice";

import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard from "../../components/common/StatCard";
import SimulationSummaryModal from "../../components/simulation/SimulationSummaryModal";

const Dashboard = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [simulationSummary, setSimulationSummary] = useState(null);
  const [customWeeks, setCustomWeeks] = useState(1);
  const { user } = useSelector((state) => state.auth);

  const currentYear = Math.floor((user?.currentWeek || 1) / 52) + 1;
  const currentWeekInYear = ((user?.currentWeek - 1) % 52) + 1;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");

        dispatch(setUser(res.data.user));
      } catch (error) {
        console.error(error);
      }
    };

    fetchUser();
  }, [dispatch]);

  const runSimulation = async (weeks) => {
    if (loading) return;
    try {
      setLoading(true);
      const res = await api.post("/simulation/next-week", { weeks });
      setSimulationSummary(res.data.summary);
      setShowSummary(true);

      // Refresh user data to show new stats
      const userRes = await api.get("/auth/me");
      dispatch(setUser(userRes.data.user));
    } catch (error) {
      alert(error?.response?.data?.message || "Simulation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Hero Banner */}
        <div className="rounded-3xl bg-linear-to-r from-violet-700 to-purple-500 p-8">
          <h1 className="text-4xl font-bold text-white">
            Build Your Dream Studio
          </h1>

          <p className="text-slate-100 mt-3">
            Create Blockbusters. Become a Legend.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-[#111827] p-6 rounded-2xl border border-slate-800">
          <div className="text-slate-400 font-bold uppercase text-xs tracking-widest mr-2">Advanced Controls</div>

          <div className="flex gap-2">
            {[1, 3, 5].map(w => (
              <button
                key={w}
                disabled={loading}
                onClick={() => runSimulation(w)}
                className="bg-slate-800 hover:bg-violet-600 text-white px-4 py-2 rounded-xl font-bold transition disabled:opacity-50"
              >
                +{w} {w === 1 ? 'Week' : 'Weeks'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 border-l border-slate-800 pl-4 ml-2">
            <input
              type="number"
              min="1"
              max="52"
              value={customWeeks}
              onChange={(e) => setCustomWeeks(e.target.value)}
              className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold outline-none focus:border-violet-500"
            />
            <button
              disabled={loading}
              onClick={() => runSimulation(customWeeks)}
              className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-2 rounded-xl font-bold transition disabled:opacity-50"
            >
              {loading ? "Simulating..." : "Run Custom"}
            </button>
          </div>
        </div>

        {/* Timeline Display */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <div className="bg-violet-600/20 text-violet-400 p-3 rounded-xl"><Calendar size={24} /></div>
                <div>
                    <div className="text-white font-black text-2xl tracking-tighter">YEAR {currentYear} • WEEK {currentWeekInYear}</div>
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">Global Industry Timeline</div>
                </div>
            </div>
            <div className="hidden md:block w-64 bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                    className="bg-violet-500 h-full transition-all duration-1000"
                    style={{ width: `${(currentWeekInYear / 52) * 100}%` }}
                />
            </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          <StatCard
            title="Money"
            value={`₹${user?.studio?.money ?? 0}`}
            icon={<DollarSign />}
          />

          <StatCard
            title="Prestige"
            value={user?.studio?.prestige ?? 0}
            icon={<Star />}
          />

          <StatCard
            title="Fans"
            value={user?.studio?.fans ?? 0}
            icon={<Users />}
          />

          <StatCard
            title="Studio Level"
            value={user?.studio?.studioLevel ?? 1}
            icon={<Building />}
          />
        </div>

        {/* Bottom Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-[#111827] rounded-2xl p-6 border border-slate-800">
            <h2 className="text-2xl font-bold text-white mb-4">
              Studio Overview
            </h2>

            <div className="space-y-3 text-slate-300">
              <p>Studio: {user?.studio?.name}</p>

              <p>Money: ₹{user?.studio?.money}</p>

              <p>Prestige: {user?.studio?.prestige}</p>

              <p>Fans: {user?.studio?.fans}</p>

              <p>Level: {user?.studio?.studioLevel}</p>
            </div>
          </div>

          <div className="bg-[#111827] rounded-2xl p-6 border border-slate-800">
            <h2 className="text-2xl font-bold text-white mb-4">
              Recent Events
            </h2>

            <div className="space-y-4 text-slate-300">
              <div>🎬 Welcome to CineVerse Empire</div>

              <div>🏢 Studio Founded</div>

              <div>📅 Week 1 Started</div>
            </div>
          </div>
        </div>
      </div>

      {showSummary && (
        <SimulationSummaryModal
          summary={simulationSummary}
          onClose={() => setShowSummary(false)}
        />
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
