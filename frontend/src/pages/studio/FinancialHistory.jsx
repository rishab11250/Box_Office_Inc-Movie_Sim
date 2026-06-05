import { useSelector } from "react-redux";
import DashboardLayout from "../../layouts/DashboardLayout";
import { IndianRupee, ArrowDownCircle, ArrowUpCircle, Filter } from "lucide-react";

const FinancialHistory = () => {
  const { user } = useSelector((state) => state.auth);
  const studio = user?.studio;
  const history = [...(studio?.financialHistory || [])].reverse();

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        <div>
          <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter italic">Ledger & Financials</h1>
          <p className="text-slate-400 mt-2">Historical weekly financial logs for {studio?.name}.</p>
        </div>

        {history.length === 0 ? (
            <div className="bg-[#111827] border border-slate-800 rounded-3xl p-20 text-center text-slate-500">
                No financial records available yet. Simulate weeks to generate data.
            </div>
        ) : (
            <div className="bg-[#111827] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900/50 text-slate-500 uppercase text-[10px] font-black tracking-widest">
                                <th className="p-5">Timeline</th>
                                <th className="p-5">Revenue</th>
                                <th className="p-5">Payroll</th>
                                <th className="p-5">Production</th>
                                <th className="p-5">Marketing</th>
                                <th className="p-5">Net Profit</th>
                                <th className="p-5">Ending Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50 text-sm">
                            {history.map((log, idx) => (
                                <tr key={idx} className="hover:bg-slate-800/30 transition-colors group">
                                    <td className="p-5">
                                        <div className="text-white font-bold tracking-tighter">Y{log.year} W{log.week}</div>
                                    </td>
                                    <td className="p-5">
                                        <div className="text-green-500 font-bold flex items-center gap-1">
                                            <ArrowUpCircle size={12} />
                                            ₹{log.revenue?.toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="p-5 text-slate-300">₹{log.payroll?.toLocaleString()}</td>
                                    <td className="p-5 text-slate-300">₹{log.movieCosts?.toLocaleString()}</td>
                                    <td className="p-5 text-slate-300">₹{log.marketingCosts?.toLocaleString()}</td>
                                    <td className="p-5">
                                        <div className={`font-black ${log.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            ₹{log.profit?.toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="text-white font-black">₹{log.balance?.toLocaleString()}</div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FinancialHistory;
