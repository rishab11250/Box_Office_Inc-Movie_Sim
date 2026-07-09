import { useEffect, useState } from "react";
import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import { Trophy, Film, Star, User } from "lucide-react";

const AwardsHistory = () => {
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAwards = async () => {
      try {
        setLoading(true);
        const res = await api.get("/simulation/awards");
        setAwards(res.data.awards || []);
      } catch (error) {
        console.error("Failed to fetch awards:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAwards();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <Trophy className="text-yellow-400" size={40} /> Awards History
          </h1>
          <p className="text-slate-400 mt-2">
            The hall of fame recording every major industry award given out each year.
          </p>
        </div>

        {loading ? (
          <div className="text-white text-center py-10">Loading Hall of Fame...</div>
        ) : awards.length === 0 ? (
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
            No awards have been given out yet. Check back at the end of Year 1!
          </div>
        ) : (
          <div className="space-y-4">
            {awards.sort((a, b) => b.year - a.year).map((award, idx) => (
              <div key={idx} className="bg-linear-to-r from-slate-900 to-[#111827] border border-slate-800 rounded-3xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-yellow-500/20 transition-all"></div>
                
                <h2 className="text-2xl font-black text-white italic mb-6 border-b border-slate-800 pb-4">
                  YEAR {award.year} AWARDS
                </h2>
                
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-[#0B1020] p-4 rounded-2xl border border-slate-800 flex items-start gap-4">
                        <div className="bg-yellow-500/20 p-3 rounded-full shrink-0">
                            <Star className="text-yellow-500" size={24} />
                        </div>
                        <div>
                            <div className="text-slate-500 text-[10px] font-bold uppercase mb-1">Best Picture</div>
                            <div className="text-white font-bold text-lg leading-tight">{award.bestPictureTitle}</div>
                        </div>
                    </div>

                    <div className="bg-[#0B1020] p-4 rounded-2xl border border-slate-800 flex items-start gap-4">
                        <div className="bg-blue-500/20 p-3 rounded-full shrink-0">
                            <Film className="text-blue-500" size={24} />
                        </div>
                        <div>
                            <div className="text-slate-500 text-[10px] font-bold uppercase mb-1">Best Director</div>
                            <div className="text-white font-bold text-lg leading-tight">{award.bestDirectorName}</div>
                        </div>
                    </div>

                    <div className="bg-[#0B1020] p-4 rounded-2xl border border-slate-800 flex items-start gap-4">
                        <div className="bg-purple-500/20 p-3 rounded-full shrink-0">
                            <User className="text-purple-500" size={24} />
                        </div>
                        <div>
                            <div className="text-slate-500 text-[10px] font-bold uppercase mb-1">Best Actor</div>
                            <div className="text-white font-bold text-lg leading-tight">{award.bestActorName}</div>
                        </div>
                    </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AwardsHistory;
