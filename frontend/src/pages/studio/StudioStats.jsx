import { useSelector } from "react-redux";
import DashboardLayout from "../../layouts/DashboardLayout";
import { TrendingUp, Star, Award, Film, PieChart, Activity } from "lucide-react";

const StudioStats = () => {
  const { user } = useSelector((state) => state.auth);
  const studio = user?.studio;

  if (!studio) return null;

  const statCards = [
    { label: "Total Revenue", value: `₹${studio.stats?.totalRevenue?.toLocaleString()}`, icon: TrendingUp, color: "text-green-500" },
    { label: "Total Profit", value: `₹${studio.stats?.totalProfit?.toLocaleString()}`, icon: Activity, color: "text-blue-500" },
    { label: "Avg Critic Score", value: studio.stats?.avgCriticScore?.toFixed(1), icon: Award, color: "text-violet-500" },
    { label: "Avg Audience Score", value: studio.stats?.avgAudienceScore?.toFixed(1), icon: Star, color: "text-yellow-500" },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        <div>
          <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Studio Performance</h1>
          <p className="text-slate-400 mt-2">Comprehensive data analytics for {studio.name}.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((card, idx) => (
                <div key={idx} className="bg-[#111827] border border-slate-800 p-6 rounded-3xl space-y-2">
                    <div className={`${card.color} opacity-80`}><card.icon size={24} /></div>
                    <div className="text-3xl font-black text-white tracking-tight">{card.value}</div>
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">{card.label}</div>
                </div>
            ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 space-y-6">
                <h3 className="text-xl font-bold text-white uppercase italic border-b border-slate-800 pb-4">Release Records</h3>
                <div className="grid grid-cols-2 gap-y-8">
                    <div>
                        <div className="text-4xl font-black text-white">{studio.stats?.moviesReleased}</div>
                        <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Movies Released</div>
                    </div>
                    <div>
                        <div className="text-4xl font-black text-green-500">{studio.stats?.hits}</div>
                        <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Hits</div>
                    </div>
                    <div>
                        <div className="text-4xl font-black text-purple-500">{studio.stats?.blockbusters}</div>
                        <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Blockbusters</div>
                    </div>
                    <div>
                        <div className="text-4xl font-black text-orange-500">{studio.stats?.allTimeBlockbusters}</div>
                        <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Legendary</div>
                    </div>
                </div>
            </div>

            <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 space-y-6">
                <h3 className="text-xl font-bold text-white uppercase italic border-b border-slate-800 pb-4">Studio Hall of Fame</h3>
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-medium italic">Highest Grossing</span>
                        <span className="text-white font-bold">{studio.highestGrossingMovie?.title || 'None'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-medium italic">Most Profitable</span>
                        <span className="text-white font-bold">{studio.mostProfitableMovie?.title || 'None'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-medium italic">Highest Rated</span>
                        <span className="text-white font-bold">{studio.bestReviewedMovie?.title || 'None'}</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudioStats;
