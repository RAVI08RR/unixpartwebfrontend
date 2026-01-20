"use client";

import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from "recharts";
import { 
  Users, DollarSign, TrendingUp, CreditCard, 
  ArrowUpRight, ArrowDownRight, MoreVertical, 
  ShoppingBag, Clock, CheckCircle2, MoreHorizontal,
  Box, FileText, Info, Wallet
} from "lucide-react";
import { useState } from "react";

const ChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-gray-100 dark:border-zinc-800 p-3 rounded-xl shadow-xl transition-all animate-in fade-in zoom-in duration-200">
        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
            <p className="text-sm font-bold dark:text-white">
              {entry.name}: <span className="text-red-600">{typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}</span>
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const HoverTooltip = ({ children, content, className = "relative flex items-center justify-center" }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <div 
      className={className}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute bottom-full mb-3 z-[100] transition-all animate-in fade-in slide-in-from-bottom-1 duration-200">
          <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-gray-100 dark:border-zinc-800 px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
            <p className="text-xs font-bold dark:text-white flex items-center gap-2">
              <Info className="w-3 h-3 text-red-600" />
              {content}
            </p>
          </div>
          <div className="w-2 h-2 bg-white dark:bg-zinc-900 border-r border-b border-gray-100 dark:border-zinc-800 transform rotate-45 absolute left-1/2 -ml-1 -bottom-1"></div>
        </div>
      )}
    </div>
  );
};



const overallBalanceData = [
  { name: "Jan", value: 200 },
  { name: "Feb", value: 240 },
  { name: "Mar", value: 180 },
  { name: "Apr", value: 340 },
  { name: "May", value: 300 },
  { name: "Jun", value: 380 },
  { name: "Jul", value: 280 },
];

const roiData = [
  { name: "M1", value: 60 },
  { name: "M2", value: 80 },
  { name: "M3", value: 70 },
  { name: "M4", value: 90 },
  { name: "M5", value: 85 },
  { name: "M6", value: 100 },
];

const COLORS = ["#E31E24", "#000000", "#9CA3AF", "#E5E7EB"];

export default function DashboardPage() {
  return (
    <div className="space-y-8 pb-12">
      {/* Top Section: Balance and ROI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Overall Balance */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-3xl p-8 card-shadow transition-colors">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-gray-400 dark:text-gray-500 text-[10px] font-bold mb-1 uppercase tracking-[0.2em]">Overall Balance</p>
              <div className="flex items-center gap-3">
                <h3 className="text-4xl font-black dark:text-white">$2,538,942</h3>
                <span className="text-green-500 text-xs font-bold flex items-center bg-green-50 dark:bg-green-500/10 px-2 py-0.5 rounded-full border border-green-100 dark:border-green-500/20">
                  <ArrowUpRight className="w-3 h-3 mr-0.5" /> 16.2%
                </span>
              </div>
            </div>
            <div className="flex gap-4 border-b border-gray-100 dark:border-zinc-800 pb-1">
              <button className="text-red-600 font-bold border-b-2 border-red-600 pb-1 -mb-[5px] transition-all">Orders</button>
              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-medium transition-all">Expenses</button>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={overallBalanceData} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#000000" stopOpacity={0.05}/>
                        <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#F3F4F6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                    <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(0, 0, 0, 0.1)', strokeWidth: 1 }} />
                    <Area type="monotone" dataKey="value" name="Balance" stroke="#000000" strokeWidth={1.5} fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:w-48 space-y-4 pt-4">
              <div className="bg-red-600 p-4 rounded-2xl text-white shadow-lg shadow-red-600/20 group hover:-translate-y-1 transition-all cursor-pointer">
                 <div className="flex items-center gap-3">
                   <div className="bg-white/20 p-2 rounded-xl">
                      <ShoppingBag className="w-5 h-5" />
                   </div>
                   <div>
                      <p className="text-[10px] opacity-70 font-bold tracking-wider">Total Orders</p>
                      <p className="text-lg font-black">$4,291</p>
                   </div>
                 </div>
              </div>
              <div className="bg-black p-4 rounded-2xl text-white shadow-lg group hover:-translate-y-1 transition-all cursor-pointer">
                 <div className="flex items-center gap-3">
                   <div className="bg-white/20 p-2 rounded-xl">
                      <Users className="w-5 h-5" />
                   </div>
                   <div>
                      <p className="text-[10px] opacity-70 font-bold tracking-wider">Customers</p>
                      <p className="text-lg font-black">44%</p>
                   </div>
                 </div>
              </div>
              <div className="bg-gray-700 p-4 rounded-2xl text-white shadow-lg group hover:-translate-y-1 transition-all cursor-pointer">
                 <div className="flex items-center gap-3">
                   <div className="bg-white/20 p-2 rounded-xl">
                      <CreditCard className="w-5 h-5" />
                   </div>
                   <div>
                      <p className="text-[10px] opacity-70 font-bold tracking-wider">Total Income</p>
                      <p className="text-lg font-black">$4,679</p>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </div>


        {/* ROI */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 card-shadow transition-colors">
          <div className="flex justify-between mb-8">
            <div>
              <p className="text-gray-900 dark:text-white text-sm font-bold mb-2 uppercase tracking-wide">RETURN ON INVESTMENT</p>
              <div className="flex items-center gap-4">
                <h3 className="text-5xl font-black dark:text-white">283%</h3>
                <div className="flex items-center gap-1 text-gray-900 dark:text-white font-bold">
                   <ArrowUpRight className="w-4 h-4" /> 
                   <span>+24%</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm mt-3 font-medium">monthly</p>
            </div>

            <MoreVertical className="text-gray-300 w-5 h-5 cursor-pointer" />
          </div>
          
          <div className="h-[200px] w-full flex items-end gap-6 mt-4 justify-between px-2">
            {[60, 80, 70, 95, 85, 100].map((val, i) => (
               <div key={i} className="flex-1 h-full flex items-end justify-center group cursor-pointer">
                  <div 
                     className="w-full max-w-[40px] bg-black dark:bg-white rounded-xl transition-all duration-500 hover:opacity-80" 
                     style={{ height: `${val}%` }}
                  ></div>
               </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 card-shadow relative overflow-hidden">
           <div className="flex justify-between items-start mb-6">
              <div className="bg-black p-3 rounded-xl text-white">
                 <Users className="w-6 h-6" />
              </div>
              <MoreVertical className="text-gray-400 w-5 h-5" />
           </div>
           <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">TOTAL USERS</p>
           <h4 className="text-3xl font-bold dark:text-white mb-2">4,562</h4>
           <p className="text-green-500 text-sm font-bold">+22% last month</p>
           <div className="mt-8 flex gap-1.5 h-12">
              {[4,7,5,8,4,9,6,7,9,5].map((v, i) => (
                <HoverTooltip key={i} content={`Week ${i+1}: ${v * 10}% Growth`}>
                   <div className="w-4 bg-red-600/20 dark:bg-red-600/10 rounded-sm relative overflow-hidden group/bar cursor-pointer" style={{ height: '100%' }}>
                     <div 
                       className="absolute bottom-0 left-0 right-0 bg-red-600 rounded-sm transition-all duration-500 group-hover/bar:bg-black dark:group-hover/bar:bg-white" 
                       style={{ height: `${v * 10}%` }}
                     ></div>
                   </div>
                </HoverTooltip>
              ))}
           </div>
        </div>


        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 card-shadow relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer">
           <div className="flex justify-between items-start mb-6">
              <div className="bg-black dark:bg-white p-3 rounded-xl text-white dark:text-black shadow-lg">
                 <TrendingUp className="w-6 h-6" />
              </div>
              <MoreVertical className="text-gray-400 w-5 h-5" />
           </div>
           <p className="text-gray-400 dark:text-gray-500 text-[10px] font-bold mb-1 uppercase tracking-[0.2em]">TOTAL INCOME</p>
           <h4 className="text-3xl font-black dark:text-white mb-2">$6,280</h4>
           <p className="text-green-500 text-xs font-bold font-medium">+18% last month</p>
           <div className="absolute bottom-0 left-0 right-0 h-16 w-full opacity-50 group-hover:opacity-100 transition-opacity">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={overallBalanceData}>
                <Line type="monotone" dataKey="value" stroke="#E31E24" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 card-shadow relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer">
           <div className="flex justify-between items-start mb-6">
              <div className="bg-black dark:bg-white p-3 rounded-full text-white dark:text-black shadow-lg">
                 <Wallet className="w-6 h-6" />
              </div>
              <MoreVertical className="text-gray-400 w-5 h-5" />
           </div>
           <p className="text-gray-900 dark:text-white text-sm font-bold mb-1 uppercase tracking-wider">CURRENT BALANCE</p>
           <h4 className="text-4xl font-black dark:text-white mb-2">$2,529</h4>
           <p className="text-gray-500 text-sm font-bold">+62% last month</p>
           
           <div className="absolute right-6 bottom-6 w-20 h-20 flex items-center justify-center">
             <div className="relative w-full h-full animate-[spin_10s_linear_infinite]">
                {[...Array(8)].map((_, i) => (
                  <div 
                    key={i}
                    className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-2"
                    style={{ transform: `rotate(${i * 45}deg)` }}
                  >
                    <div className="w-2 h-4 bg-red-600 rounded-full mx-auto"></div>
                  </div>
                ))}
             </div>
           </div>
        </div>

      </div>

      {/* Row 3: Marketing and Payment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Marketing Report */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 card-shadow">
          <div className="flex justify-between mb-8">
            <h5 className="font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-sm">Marketing Report</h5>
            <MoreVertical className="text-gray-400 w-5 h-5" />
          </div>
          <div className="space-y-6 mb-12">
            {[
              { label: "Page View Volume", value: "+2.9k", color: "bg-red-600" },
              { label: "Return Ratio", value: "1.22", color: "bg-black" },
              { label: "ARPU on search", value: "0.63", color: "bg-gray-400" },
              { label: "Churn Ratio", value: "41.2", color: "bg-blue-400" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between border-b border-gray-50 dark:border-zinc-800 pb-4 last:border-0 hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 px-2 py-1 rounded-xl transition-colors">
                <div className="flex items-center gap-4">
                   <div className={`w-10 h-10 rounded-full ${item.color} flex items-center justify-center text-white shadow-sm`}>
                      <ArrowUpRight className="w-5 h-5" />
                   </div>
                   <span className="text-gray-600 dark:text-gray-400 font-bold text-sm">{item.label}</span>
                </div>
                <span className="font-black dark:text-white">{item.value}</span>
              </div>
            ))}

          </div>
          <div className="relative flex justify-center group/gauge cursor-pointer">
             <HoverTooltip content="Market Performance: 275/500 (55%)">
                <div className="w-48 h-24 overflow-hidden relative">
                    <div className="w-48 h-48 border-[20px] border-gray-100 dark:border-zinc-800 rounded-full"></div>
                    <div className="w-48 h-48 border-[20px] border-red-600 rounded-full absolute top-0 left-0 clip-gauge transform rotate-45 transition-transform duration-1000 group-hover/gauge:scale-105"></div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                        <p className="text-4xl font-bold dark:text-white">275</p>
                    </div>
                </div>
             </HoverTooltip>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">Learn more how to manage all aspects of your startup</p>
          <div className="bg-orange-50 dark:bg-orange-500/5 p-4 rounded-2xl mt-8 flex items-center gap-4 border border-orange-100 dark:border-orange-500/10">
             <div className="p-2 bg-red-600 rounded-lg text-white">
                <TrendingUp className="w-4 h-4" />
             </div>
             <p className="text-xs text-orange-800 dark:text-orange-400 font-medium">Learn more how to manage all aspect of your startup</p>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 card-shadow">
          <div className="flex justify-between mb-8">
            <h5 className="font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-sm">Payment Methods</h5>
            <MoreVertical className="text-gray-400 w-5 h-5" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-black text-white p-6 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer shadow-xl">
               <div className="flex justify-between items-start mb-10">
                  <span className="text-xs font-medium opacity-60">**** 8942</span>
                  <span className="text-xs font-black tracking-widest italic">VISA</span>
               </div>
               <p className="text-[10px] opacity-60 mb-1 uppercase tracking-widest font-bold">Balance</p>
               <p className="text-2xl font-black">$25,561.50</p>
               <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
            </div>
            <div className="bg-[#FFF0E5] p-6 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer shadow-lg">
               <div className="flex justify-between items-start mb-10 text-orange-950">
                  <span className="text-xs font-medium opacity-60">**** 8942</span>
                  <CreditCard className="w-5 h-5 opacity-40" />
               </div>
               <p className="text-[10px] text-orange-800 opacity-60 mb-1 uppercase tracking-widest font-bold">Balance</p>
               <p className="text-2xl font-black text-orange-950">$28,561.50</p>
               <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-orange-200/20 rounded-full blur-2xl"></div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold dark:text-white">Transactions</span>
              <button className="text-sm text-gray-400">See All</button>
            </div>
            {[
              { label: "Subscription", date: "Dec 12, 2024", amount: "- $4.58", status: "Approved" },
              { label: "Renewal", date: "Dec 10, 2024", amount: "+ $15.60", status: "Pending" },
              { label: "Subscription", date: "Dec 12, 2024", amount: "- $4.58", status: "Approved" },
              { label: "Renewal", date: "Dec 10, 2024", amount: "+ $15.60", status: "Pending" },
            ].map((t, i) => (
              <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 p-2 rounded-xl transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-zinc-800 flex items-center justify-center text-gray-400 group-hover:bg-white dark:group-hover:bg-zinc-700 transition-colors shadow-sm">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black dark:text-white">{t.label}</p>
                    <p className="text-[10px] font-bold text-gray-400 group-hover:text-gray-500">{t.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-black ${t.amount.startsWith('-') ? 'dark:text-white' : 'text-red-600'}`}>{t.amount}</p>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${t.status === 'Approved' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-500/20 dark:text-red-400'}`}>
                    {t.status}
                  </span>
                </div>
              </div>
            ))}

          </div>
        </div>
      </div>

      {/* Row 4: Recent Projects Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 card-shadow">
        <div className="flex justify-between items-center mb-8">
          <h5 className="font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-sm">Recent Projects</h5>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-gray-100 dark:bg-zinc-800 text-sm font-medium rounded-lg text-gray-600 dark:text-gray-400">Date</button>
            <button className="px-4 py-2 bg-gray-100 dark:bg-zinc-800 text-sm font-medium rounded-lg text-gray-600 dark:text-gray-400">Website</button>
            <button className="px-4 py-2 bg-gray-100 dark:bg-zinc-800 text-sm font-medium rounded-lg text-gray-600 dark:text-gray-400">Others</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="text-left border-b border-gray-50 dark:border-zinc-800">
              <tr>
                <th className="pb-4 text-xs font-medium text-gray-400 uppercase tracking-widest">#</th>
                <th className="pb-4 text-xs font-medium text-gray-400 uppercase tracking-widest">Name</th>
                <th className="pb-4 text-xs font-medium text-gray-400 uppercase tracking-widest">Budget</th>
                <th className="pb-4 text-xs font-medium text-gray-400 uppercase tracking-widest">Team</th>
                <th className="pb-4 text-xs font-medium text-gray-400 uppercase tracking-widest">Leader</th>
                <th className="pb-4 text-xs font-medium text-gray-400 uppercase tracking-widest text-right">Activity Log</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-zinc-800">
              {[
                { id: 1, name: "Auto Spare Parts ERP System", budget: "$26,374.00", leader: "Erin", members: 4 },
                { id: 2, name: "Container Intake & Warehouse Operations", budget: "$1,843.23", leader: "Timothy", members: 3 },
                { id: 3, name: "Inter-Branch Stock Transfer System", budget: "$0.9999", leader: "Tyler", members: 3 },
                { id: 4, name: "Dismantling & Parts Breakdown System", budget: "$238.61", leader: "Kristian", members: 3 },
                { id: 5, name: "POS / Invoicing System", budget: "$0.828", leader: "Isabelle", members: 2 },
              ].map((row, i) => (
                <tr key={i} className="group hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="py-6 text-sm text-gray-400">{row.id}</td>
                  <td className="py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-red-600">
                         {i === 0 ? <ShoppingBag className="w-5 h-5" /> : i === 1 ? <Box className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                      </div>
                      <span className="text-sm font-bold dark:text-white">{row.name}</span>
                    </div>
                  </td>
                  <td className="py-6 text-sm font-medium dark:text-gray-300">{row.budget}</td>
                  <td className="py-6">
                    <div className="flex -space-x-2">
                       {Array.from({ length: Math.min(row.members, 3) }).map((_, j) => (
                         <div key={j} className="w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-700 border-2 border-white dark:border-zinc-900 group-hover:border-gray-50 transition-colors"></div>
                       ))}
                       {row.members > 3 && (
                         <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 border-2 border-white dark:border-zinc-900 flex items-center justify-center text-[10px] font-bold text-gray-400">+{row.members - 3}</div>
                       )}
                    </div>
                  </td>
                  <td className="py-6 text-sm font-medium text-gray-600 dark:text-gray-400">{row.leader}</td>
                  <td className="py-6 text-right">
                     <div className="inline-block w-24 h-4 bg-gray-100 dark:bg-zinc-800 rounded relative overflow-hidden">
                        <div className="absolute inset-0 bg-red-600 scale-x-50 origin-left"></div>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 5: Delivery and Earning */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Delivery Analytics */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-3xl p-8 card-shadow">
          <div className="flex justify-between mb-8">
            <h5 className="font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-sm">Delivery Analytics</h5>
            <MoreVertical className="text-gray-400 w-5 h-5" />
          </div>
          <div className="relative h-64 flex flex-col items-center justify-center">
             <HoverTooltip content="Total Logistics Volume: 2,400 Units">
                <div className="w-48 h-48 rounded-full border-[20px] border-gray-100 dark:border-zinc-800 relative group/donut cursor-pointer transition-transform duration-300 hover:scale-105">
                <div className="absolute inset-0 border-[20px] border-red-600 rounded-full clip-donut-75 rotate-45"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-3xl font-bold dark:text-white">2.4k</p>
                    <p className="text-xs text-gray-400">Total</p>
                </div>
                </div>
             </HoverTooltip>

             <div className="flex gap-4 mt-8">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                   <span className="text-xs text-gray-400">On Time</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-black"></div>
                   <span className="text-xs text-gray-400">Delayed</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                   <span className="text-xs text-gray-400">Pending</span>
                </div>
             </div>
          </div>
          <div className="mt-8 space-y-6">
             {[
               { label: "Delivered", value: "85%", change: "+12%", color: "bg-black" },
               { label: "In Transit", value: "35%", change: "+6%", color: "bg-gray-400" },
               { label: "Pending", value: "28%", change: "-5%", color: "bg-red-600" },
               { label: "Cancelled", value: "12%", change: "+3%", color: "bg-blue-400" },
             ].map((d, i) => (
                <div key={i} className="space-y-2">
                   <div className="flex justify-between text-xs transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="font-bold dark:text-white">{d.label}</span>
                        <span className={d.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}>{d.change}</span>
                      </div>
                      <span className="font-bold dark:text-white">{d.value}</span>
                   </div>
                   <div className="h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div className={`h-full ${d.color}`} style={{ width: d.value }}></div>
                   </div>
                </div>
             ))}
          </div>
        </div>

        {/* Earning Report */}
        <div className="lg:col-span-3 bg-white dark:bg-zinc-900 rounded-3xl p-8 card-shadow">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h5 className="font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-sm mb-2">Earning Report</h5>
              <p className="text-xs text-gray-400">Monthly earnings overview</p>
            </div>
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-zinc-800 p-1 rounded-lg">
                <button className="px-3 py-1 bg-white dark:bg-zinc-700 text-xs font-bold rounded-md shadow-sm dark:text-white">Monthly</button>
                <button className="px-3 py-1 text-xs text-gray-400 font-bold">Yearly</button>
              </div>
              <MoreVertical className="text-gray-400 w-5 h-5" />
            </div>
          </div>
          <div className="h-64 w-full mb-8">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: "Jan", sales: 4000, profit: 2400 },
                  { name: "Feb", sales: 3000, profit: 1398 },
                  { name: "Mar", sales: 2000, profit: 9800 },
                  { name: "Apr", sales: 2780, profit: 3908 },
                  { name: "May", sales: 1890, profit: 4800 },
                  { name: "Jun", sales: 2390, profit: 3800 },
                  { name: "Jul", sales: 3490, profit: 4300 },
                ]}>
                  <XAxis dataKey="name" hide />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                  <Bar dataKey="profit" name="Profit" fill="#000000" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="sales" name="Sales" fill="#E31E24" radius={[4, 4, 0, 0]} />
                </BarChart>

             </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {[
               { label: "Total Sales", value: "$42,562", color: "bg-red-600", icon: ShoppingBag },
               { label: "Net Profit", value: "$18,290", color: "bg-black", icon: TrendingUp },
               { label: "Total Revenue", value: "$52,840", color: "bg-gray-700", icon: DollarSign },
               { label: "Active Users", value: "8,542", color: "bg-blue-600", icon: Users },
             ].map((stat, i) => (
                <div key={i} className={`${stat.color} p-4 rounded-2xl text-white transition-transform hover:scale-105`}>
                   <div className="bg-white/20 w-8 h-8 rounded-lg flex items-center justify-center mb-4">
                      <stat.icon className="w-4 h-4" />
                   </div>
                   <p className="text-[10px] opacity-70 uppercase mb-1">{stat.label}</p>
                   <p className="text-lg font-bold">{stat.value}</p>
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
