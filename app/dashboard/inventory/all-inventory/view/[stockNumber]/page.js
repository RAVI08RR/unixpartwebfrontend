"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, Package, Box, Building2, 
  DollarSign, FileText, Calendar, Hash, 
  Printer, Layers, ShieldCheck, Clock,
  ArrowRight, Heart, Share2, MoreVertical
} from "lucide-react";
import { poItemService } from "@/app/lib/services/poItemService";
import { useToast } from "@/app/components/Toast";

export default function ItemViewPage() {
  const router = useRouter();
  const params = useParams();
  const stockNumber = params.stockNumber;
  const { error: showError } = useToast();
  
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        // Use the specialized stock number API as requested
        const data = await poItemService.getByStockNumber(stockNumber);
        if (data) {
          setItem(data);
        } else {
          showError("Item not found");
        }
      } catch (err) {
        console.error("Failed to fetch item:", err);
        showError("Failed to load item details: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (stockNumber) {
      fetchItem();
    }
  }, [stockNumber]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 font-black text-xs uppercase tracking-[0.2em] animate-pulse">Retrieving Data...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-8">
        <div className="w-24 h-24 bg-red-50 dark:bg-red-900/10 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <Package className="w-12 h-12 text-red-600" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">Item Not Found</h1>
          <p className="text-gray-500 max-w-md mx-auto font-medium">
            We couldn't find an item with stock number <span className="text-red-600 font-bold">{stockNumber}</span>. It might have been deleted or the number is incorrect.
          </p>
        </div>
        <Link 
          href="/dashboard/inventory/all-inventory"
          className="inline-flex items-center gap-2 px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black text-sm hover:scale-105 transition-all shadow-xl active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Inventory
        </Link>
      </div>
    );
  }

  const saleItem = item.invoice_items?.[0] || null;

  return (
    <div className="max-w-[1400px] mx-auto pb-20 px-4 sm:px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Navigation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pt-4">
        <div className="flex items-center gap-5">
          <button 
            onClick={() => router.back()}
            className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all shadow-sm group"
          >
            <ArrowLeft className="w-6 h-6 text-gray-500 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-red-600/20">
                Live Inventory
              </span>
              <span className="text-xs font-bold text-gray-400">STOCK #{item.stock_number}</span>
            </div>
            <h1 className="text-xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase line-clamp-1">
              {item.stock_item?.name || "Inventory Item"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {item.status?.toLowerCase() === 'in_stock' ? (
            <Link 
              href={`/dashboard/sales/invoices/add?item=${item.id}&stock=${item.stock_number}`}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
            >
              <DollarSign className="w-5 h-5" />
              CREATE INVOICE
            </Link>
          ) : (
            <div className="flex-1 md:flex-none px-6 py-4 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-2xl font-black text-sm flex items-center justify-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              ITEM SOLD
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Hero section */}
          <div className="bg-white dark:bg-zinc-900 rounded-[40px] border border-gray-100 dark:border-zinc-800 shadow-xl overflow-hidden p-8 md:p-12 relative group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 dark:bg-red-400/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
            
            <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center md:items-start text-center md:text-left">
               <div className="w-40 h-40 md:w-48 md:h-48 bg-gray-50 dark:bg-zinc-800 rounded-[32px] flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-zinc-700 shrink-0">
                  <Package className="w-16 h-16 md:w-20 md:h-20 text-gray-200 dark:text-zinc-700" />
               </div>
               
               <div className="flex-1 space-y-6 w-full">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    <StatBox label="Quantity" value={item.quantity} suffix="Units" icon={<Box className="text-red-600" />} />
                    <StatBox label="Current Branch" value={item.current_branch?.branch_code || "N/A"} icon={<Building2 className="text-blue-600" />} />
                    <StatBox label="Status" value={item.status?.replace('_', ' ')} highlight icon={<ShieldCheck className="text-emerald-600" />} />
                  </div>

                  <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-zinc-800">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Description & Details</h3>
                    <p className="text-lg font-medium text-gray-700 dark:text-zinc-300 leading-relaxed italic">
                      "{item.po_description || "No specific purchase order description provided for this item."}"
                    </p>
                    <div className="flex flex-wrap gap-2">
                       <Badge text={`PO #${item.po_id}`} />
                       <Badge text={`Stock #: ${item.stock_number}`} color="red" />
                       <Badge text={item.current_branch?.branch_name} color="blue" />
                    </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Purchase Details */}
            <Section icon={<Hash className="w-5 h-5 text-purple-600" />} title="Sourcing & Logistics">
               <div className="space-y-4">
                  <InfoRow label="Supplier" value={item.purchase_order?.container?.supplier?.supplier_name || "Direct Purchase"} />
                  <InfoRow label="Container" value={item.purchase_order?.container?.container_number || "N/A"} />
                  <InfoRow label="PO Date" value={item.created_at ? new Date(item.created_at).toLocaleDateString() : "N/A"} />
                  <InfoRow label="Stock Notes" value={item.stock_notes || "None"} />
               </div>
            </Section>

            {/* Sale Details */}
            <Section icon={<DollarSign className="w-5 h-5 text-emerald-600" />} title="Sale Performance">
               {saleItem ? (
                 <div className="space-y-4">
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/20 mb-4">
                       <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Sold For</p>
                       <p className="text-2xl font-black text-emerald-800 dark:text-emerald-400">AED {parseFloat(saleItem.sale_amount || 0).toLocaleString()}</p>
                    </div>
                    <InfoRow label="Invoice #" value={saleItem.invoice?.invoice_number} highlight />
                    <InfoRow label="Sale Date" value={new Date(saleItem.sale_date).toLocaleDateString()} />
                    <InfoRow label="Customer" value={saleItem.invoice?.customer?.full_name || "Guest Customer"} />
                 </div>
               ) : (
                 <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4 bg-gray-50/50 dark:bg-zinc-800/30 rounded-3xl border border-dashed border-gray-200 dark:border-zinc-700">
                    <Clock className="w-10 h-10 text-gray-300" />
                    <div>
                      <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Awaiting Sale</p>
                      <p className="text-xs text-gray-400 mt-1">This item is currently available in inventory</p>
                    </div>
                 </div>
               )}
            </Section>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
           {/* Branch Contact Card */}
           <div className="bg-gradient-to-br from-zinc-900 to-black dark:from-zinc-900 dark:to-zinc-950 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
             <div className="relative z-10">
               <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                  <Building2 className="w-6 h-6 text-white" />
               </div>
               <h3 className="text-2xl font-black mb-2 tracking-tight">{item.current_branch?.branch_name}</h3>
               <p className="text-gray-400 text-sm font-medium mb-8">Branch ID: {item.current_branch?.branch_code}</p>
               
               <div className="space-y-4">
                  <button className="w-full py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95">
                     Locate Branch
                     <ArrowRight className="w-4 h-4" />
                  </button>
                  <button className="w-full py-4 bg-zinc-800/50 text-white border border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all active:scale-95">
                     Contact Manager
                  </button>
               </div>
             </div>
           </div>

           {/* Traceability Timeline (Simplified) */}
           <div className="bg-white dark:bg-zinc-900 rounded-[40px] border border-gray-100 dark:border-zinc-800 p-8 shadow-lg">
             <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-3 mb-8">
               <Layers className="w-5 h-5 text-red-600" />
               Lifecycle Timeline
             </h3>
             <div className="space-y-8">
               <TimelineItem label="Registered in System" date={new Date(item.created_at).toLocaleString()} active />
               <TimelineItem label="Dismantling Process" date="N/A" />
               <TimelineItem label="Final Sale Generated" date={saleItem ? new Date(saleItem.sale_date).toLocaleString() : "Pending"} active={!!saleItem} />
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, suffix, icon, highlight }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="p-1.5 bg-gray-50 dark:bg-zinc-800 rounded-lg">{icon}</span>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{label}</p>
      </div>
      <p className={`text-xl font-black tracking-tight ${highlight ? 'text-emerald-600 dark:text-emerald-400 uppercase' : 'text-gray-900 dark:text-white'}`}>
        {value} {suffix && <span className="text-[10px] text-gray-400 font-bold ml-1">{suffix}</span>}
      </p>
    </div>
  );
}

function Section({ icon, title, children }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-[40px] border border-gray-100 dark:border-zinc-800 p-8 shadow-lg">
      <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-3 mb-8">
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );
}

function InfoRow({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-zinc-800 last:border-0 grow">
      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest shrink-0">{label}</span>
      <span className={`text-sm font-black text-right ${highlight ? 'text-blue-600' : 'text-gray-900 dark:text-white'}`}>
        {value || "---"}
      </span>
    </div>
  );
}

function Badge({ text, color = "gray" }) {
  const colors = {
    red: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
    gray: "bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-400"
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${colors[color]}`}>
      {text}
    </span>
  );
}

function TimelineItem({ label, date, active }) {
  return (
    <div className="relative pl-8 pb-1 last:pb-0">
      <div className={`absolute left-0 top-1 w-2.5 h-2.5 rounded-full border-2 ${active ? 'bg-red-600 border-red-600 shadow-[0_0_8px_rgba(220,38,38,0.5)]' : 'bg-transparent border-gray-200 dark:border-zinc-800'}`}></div>
      {label !== "Final Sale Generated" && (
        <div className={`absolute left-[4px] top-6 w-[2px] h-[calc(100%-12px)] ${active ? 'bg-red-600/20' : 'bg-gray-100 dark:bg-zinc-800'}`}></div>
      )}
      <p className={`text-[11px] font-black uppercase tracking-widest leading-none mb-1 ${active ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>{label}</p>
      <p className="text-[10px] font-bold text-gray-400">{date}</p>
    </div>
  );
}
