"use client";

import React, { useState, useEffect } from "react";
import { 
  Briefcase, DollarSign, TrendingUp, Calendar, 
  ArrowUpRight, Award, Building, Loader2, Info
} from "lucide-react";
import { employeeSelfService } from "../../lib/services/employeeSelfService";
import { useToast } from "../../components/Toast";
import { useCurrentUser } from "../../lib/hooks/useCurrentUser";

export default function EmployeeHistory() {
  const { user } = useCurrentUser();
  const { error: showErrorToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [positions, setPositions] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [currentSalary, setCurrentSalary] = useState(null);

  useEffect(() => {
    if (user) fetchHistoryData();
  }, [user]);

  const fetchHistoryData = async () => {
    setLoading(true);
    try {
      // 1. Get Positions History: /api/employee/me/positions
      try {
        const posData = await employeeSelfService.getPositionHistory();
        setPositions(Array.isArray(posData) ? posData : []);
      } catch (err) {
        console.warn("Failed to fetch position history", err);
      }

      // 2. Get Salary History: /api/employee/me/salary-history
      try {
        const salHistory = await employeeSelfService.getSalaryHistory();
        setSalaries(Array.isArray(salHistory) ? salHistory : []);
      } catch (err) {
        console.warn("Failed to fetch salary history", err);
      }

      // 3. Get Current Salary Details: /api/employee/me/salary
      try {
        const curSal = await employeeSelfService.getCurrentSalary();
        setCurrentSalary(curSal);
      } catch (err) {
        console.warn("Failed to fetch current salary", err);
      }

    } catch (err) {
      showErrorToast("Failed to load employment history logs");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Present";
    try {
      return new Date(dateStr).toLocaleDateString([], { month: 'short', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  const getStartingSalary = () => {
    if (salaries.length > 0) {
      // Sort by effective_from ascending to find the earliest
      const sorted = [...salaries].sort((a, b) => new Date(a.effective_from) - new Date(b.effective_from));
      return sorted[0].salary_amount;
    }
    return currentSalary?.current_salary || user?.current_salary || 0;
  };

  const getLatestSalary = () => {
    if (currentSalary?.current_salary) return currentSalary.current_salary;
    if (salaries.length > 0) {
      const sorted = [...salaries].sort((a, b) => new Date(b.effective_from) - new Date(a.effective_from));
      return sorted[0].salary_amount;
    }
    return user?.current_salary || 0;
  };

  const calculateIncrement = () => {
    const start = getStartingSalary();
    const latest = getLatestSalary();
    if (!start || !latest) return { diff: 0, pct: 0 };
    
    const diff = latest - start;
    const pct = start > 0 ? (diff / start) * 100 : 0;
    return { diff, pct };
  };

  const incrementInfo = calculateIncrement();

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employment History</h1>
        <p className="text-gray-500 text-sm">View position promotions timeline, branch transfers, and salary progression logs</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Timeline of Positions (Left 2 Columns) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Position Timeline */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-2">
                <Briefcase className="w-5 h-5 text-red-500" />
                Career Path Timeline
              </h2>

              {positions.length > 0 ? (
                <div className="relative border-l border-gray-200 dark:border-zinc-800 pl-6 ml-3 space-y-8">
                  {positions.map((pos, idx) => (
                    <div key={pos.id || idx} className="relative group">
                      
                      {/* Timeline dot */}
                      <span className="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white dark:bg-zinc-950 border border-red-500 group-hover:scale-125 transition-transform">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                      </span>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5 capitalize">
                            <Award className="w-4 h-4 text-zinc-400" />
                            {pos.actual_position || "Position"}
                          </h3>
                          <span className="text-xs text-gray-500 font-bold flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(pos.start_date)} - {formatDate(pos.end_date)}
                          </span>
                        </div>
                        
                        <p className="text-xs text-gray-500 font-semibold flex items-center gap-1">
                          <Building className="w-3.5 h-3.5" />
                          {pos.current_branch?.branch_name || "Main Branch"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 dark:bg-zinc-950/20 border border-dashed border-gray-200 dark:border-zinc-850 rounded-xl">
                  <Briefcase className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">No career promotions logged yet.</p>
                </div>
              )}
            </div>

            {/* Detailed Salary History list */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">Salary Adjustments Logs</h2>
              
              {salaries.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-zinc-850 text-gray-500 font-semibold text-xs uppercase">
                        <th className="pb-3 pl-2">Effective Date</th>
                        <th className="pb-3">Salary (AED)</th>
                        <th className="pb-3 pr-2">Increment Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-850">
                      {[...salaries].sort((a,b) => new Date(b.effective_from) - new Date(a.effective_from)).map((sal, idx) => (
                        <tr key={sal.id || idx} className="text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-900/40 transition-colors">
                          <td className="py-3 pl-2 font-bold">{formatDate(sal.effective_from)}</td>
                          <td className="py-3 font-semibold">{sal.salary_amount?.toLocaleString()} AED</td>
                          <td className="py-3 text-xs text-gray-450 pr-2">{sal.reason || "Salary adjustment"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 dark:bg-zinc-950/20 border border-dashed border-gray-200 dark:border-zinc-850 rounded-xl">
                  <DollarSign className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">No adjustment details recorded.</p>
                </div>
              )}
            </div>

          </div>

          {/* Salary Progression & Dashboard Widgets (Right 1 Column) */}
          <div className="space-y-6">
            
            {/* Progression Card */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5">
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-2">
                <TrendingUp className="w-5 h-5 text-red-500" />
                Salary Progression
              </h2>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-zinc-950 rounded-xl border border-gray-100 dark:border-zinc-900">
                  <p className="text-[10px] text-gray-500 uppercase font-black">Starting Salary</p>
                  <p className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
                    {getStartingSalary()?.toLocaleString()} <span className="text-xs font-semibold text-gray-500">AED</span>
                  </p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-zinc-950 rounded-xl border border-gray-100 dark:border-zinc-900">
                  <p className="text-[10px] text-gray-500 uppercase font-black">Current Salary</p>
                  <p className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
                    {getLatestSalary()?.toLocaleString()} <span className="text-xs font-semibold text-gray-500">AED</span>
                  </p>
                </div>

                {incrementInfo.diff > 0 && (
                  <div className="p-4 bg-green-50/50 dark:bg-green-950/10 rounded-xl border border-green-100 dark:border-green-950/20 text-green-700 dark:text-green-400">
                    <p className="text-[10px] uppercase font-black">Cumulative Increment</p>
                    <p className="text-xl font-black mt-0.5 flex items-center gap-1.5">
                      +{incrementInfo.diff.toLocaleString()} AED
                      <span className="inline-flex items-center text-xs font-black bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        {incrementInfo.pct.toFixed(1)}%
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex items-start gap-3 text-xs text-gray-400 leading-relaxed">
              <Info className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-gray-800 dark:text-white text-xs mb-1">Career Records</p>
                <span>
                  Employment updates are reviewed and processed by human resources. For questions regarding your contract title, branch assignments, or salary increments, please write directly to HR.
                </span>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
