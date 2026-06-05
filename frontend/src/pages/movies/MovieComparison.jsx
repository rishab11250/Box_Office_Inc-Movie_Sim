import { useEffect, useState, useCallback, useMemo } from "react";
import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import { Check, X, Scale, Star, Award, TrendingUp, IndianRupee } from "lucide-react";

const MovieComparison = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchMovies = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/movies/released");
      setMovies(res.data.movies || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const toggleSelection = (id) => {
    setSelectedIds(prev => {
        if (prev.includes(id)) return prev.filter(i => i !== id);
        if (prev.length >= 3) return prev;
        return [...prev, id];
    });
  };

  const comparisonData = useMemo(() => {
    return movies.filter(m => selectedIds.includes(m._id));
  }, [movies, selectedIds]);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-20">
        <div>
          <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter italic">Movie Comparison</h1>
          <p className="text-slate-400 mt-2">Select up to 3 movies to compare performance and ROI.</p>
        </div>

        {/* Selection Area */}
        <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6">
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">Select Released Movies ({selectedIds.length}/3)</h3>
            <div className="flex flex-wrap gap-3">
                {movies.map(movie => {
                    const isSelected = selectedIds.includes(movie._id);
                    return (
                        <button
                            key={movie._id}
                            onClick={() => toggleSelection(movie._id)}
                            className={`px-4 py-2 rounded-xl border text-sm font-bold transition-all ${
                                isSelected
                                ? 'bg-violet-600 border-violet-500 text-white'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'
                            }`}
                        >
                            {movie.title}
                        </button>
                    );
                })}
                {movies.length === 0 && <div className="text-slate-600 italic py-2">No released movies found.</div>}
            </div>
        </div>

        {/* Comparison Table */}
        {selectedIds.length > 0 ? (
            <div className="bg-[#111827] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-900/50">
                            <th className="p-8 border-b border-slate-800 text-slate-500 uppercase text-xs font-black tracking-widest">Metric</th>
                            {comparisonData.map(movie => (
                                <th key={movie._id} className="p-8 border-b border-slate-800">
                                    <div className="text-xl font-black text-white uppercase italic tracking-tighter">{movie.title}</div>
                                    <div className="text-violet-400 text-[10px] font-bold uppercase mt-1">{movie.verdict}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 text-slate-300">
                        <tr>
                            <td className="p-8 font-bold flex items-center gap-2"><IndianRupee size={16} className="text-green-500" /> Total Budget</td>
                            {comparisonData.map(m => <td key={m._id} className="p-8 font-bold">₹{((m.budget || 0) + (m.marketingBudget || 0)).toLocaleString()}</td>)}
                        </tr>
                        <tr>
                            <td className="p-8 font-bold flex items-center gap-2"><TrendingUp size={16} className="text-blue-500" /> Revenue</td>
                            {comparisonData.map(m => <td key={m._id} className="p-8 font-bold text-white">₹{m.worldwideGross?.toLocaleString()}</td>)}
                        </tr>
                        <tr>
                            <td className="p-8 font-bold flex items-center gap-2"><Scale size={16} className="text-purple-500" /> ROI %</td>
                            {comparisonData.map(m => <td key={m._id} className="p-8 font-black text-green-500">{(m.roi * 100).toFixed(1)}%</td>)}
                        </tr>
                        <tr>
                            <td className="p-8 font-bold flex items-center gap-2"><Award size={16} className="text-violet-500" /> Critic Score</td>
                            {comparisonData.map(m => <td key={m._id} className="p-8 font-bold">{m.criticScore} ({m.criticLabel})</td>)}
                        </tr>
                        <tr>
                            <td className="p-8 font-bold flex items-center gap-2"><Star size={16} className="text-yellow-500" /> Audience Score</td>
                            {comparisonData.map(m => <td key={m._id} className="p-8 font-bold">{m.audienceScore} ({m.audienceLabel})</td>)}
                        </tr>
                        <tr>
                            <td className="p-8 font-bold flex items-center gap-2"><TrendingUp size={16} className="text-emerald-500" /> Final Profit</td>
                            {comparisonData.map(m => <td key={m._id} className={`p-8 font-black text-2xl ${m.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>₹{m.profit?.toLocaleString()}</td>)}
                        </tr>
                    </tbody>
                </table>
            </div>
        ) : (
            <div className="bg-[#111827] border border-slate-800 rounded-3xl p-20 text-center text-slate-500">
                <Scale className="mx-auto mb-4 opacity-20" size={48} />
                Select movies above to start comparison.
            </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MovieComparison;
