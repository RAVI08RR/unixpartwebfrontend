"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Ship, Hash, Navigation, Anchor, MapPin, 
  Package, Calendar, Building2, User as UserIcon, Shield,
  Receipt, Truck, ExternalLink, Pencil
} from "lucide-react";
import { containerService } from "@/app/lib/services/containerService";
import { useSuppliers } from "@/app/lib/hooks/useSuppliers";
import { useBranches } from "@/app/lib/hooks/useBranches";
import { useToast } from "@/app/components/Toast";

export default function ViewClearancePage({ params }) {
  const { id } = use(params);
  const [fetching, setFetching] = useState(true);
  const { error: showError } = useToast();
  const { suppliers } = useSuppliers();
  const { branches } = useBranches();
  const [container, setContainer] = useState(null);

  useEffect(() => {
    const fetchContainer = async () => {
      try {
        const data = await containerService.getById(id);
        setContainer(data);
      } catch (err) {
        showError("Failed to fetch clearance details: " + err.message);
      } finally {
        setFetching(false);
      }
    };
    if (id) fetchContainer();
  }, [id]);

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        <p className="font-black text-xs uppercase tracking-widest text-gray-400">Loading Clearance Record...</p>
      </div>
    );
  }

  if (!container) return (
    <div className="text-center py-20">
        <p className="text-gray-500 font-bold">Clearance record not found.</p>
        <Link href="/dashboard/inventory/custom-clearance" className="text-red-600 font-black mt-4 block underline">Back to List</Link>
    </div>
  );

  const supplier = suppliers?.find(s => s.id === container.supplier_id);
  const branch = branches?.find(b => b.id === container.destination_branch_id);

  return (
    <div className="mx-auto space-y-8 pb-12 w-full animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
            <Link 
            href="/dashboard/inventory/custom-clearance" 
            className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 hover:shadow-lg transition-all"
            >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </Link>
            <div>
                <h1 className="text-3xl font-black dark:text-white tracking-tight uppercase italic flex items-center gap-3">
                    Clearance Record <span className="text-red-600">{container.container_code}</span>
                </h1>
                <p className="text-gray-500 dark:text-zinc-400 font-medium whitespace-pre">Detail view for Shipment Order & Custom documentation</p>
            </div>
        </div>
        <Link 
            href={`/dashboard/inventory/custom-clearance/edit/${id}`}
            className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:-translate-y-1 active:scale-95 transition-all flex items-center gap-3 italic"
        >
            <Pencil className="w-4 h-4" />
            Edit Record
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-zinc-900 rounded-[40px] p-10 border border-gray-100 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8">
                     <Shield className="w-24 h-24 text-gray-50/50 dark:text-zinc-800/20 -rotate-12" />
                </div>
                <div className="relative space-y-10">
                    <section className="space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 bg-red-50 dark:bg-red-900/20 px-4 py-1.5 rounded-full w-fit">Vessel & Voyage</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <InfoItem icon={<Ship className="w-4 h-4" />} label="Vessel Name" value={container.vessel_name} />
                            <InfoItem icon={<Hash className="w-4 h-4" />} label="Voyage #" value={container.voyage_number} />
                            <InfoItem icon={<Anchor className="w-4 h-4" />} label="Shipping Agent" value={container.shipping_agent} />
                            <InfoItem icon={<Calendar className="w-4 h-4" />} label="Invoice Date" value={container.invoice_date ? new Date(container.invoice_date).toLocaleDateString() : 'N/A'} />
                        </div>
                    </section>

                    <section className="space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-4 py-1.5 rounded-full w-fit">Technical Specs</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <InfoItem icon={<Package className="w-4 h-4" />} label="Container Number" value={container.container_number} />
                            <InfoItem icon={<Layout className="w-4 h-4" />} label="Container Size" value={container.container_size} />
                            <InfoItem icon={<Truck className="w-4 h-4" />} label="Total Packages" value={container.total_packages} />
                            <InfoItem icon={<Receipt className="w-4 h-4" />} label="Status" value={container.status?.toUpperCase()} />
                        </div>
                    </section>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-[40px] p-10 border border-gray-100 dark:border-zinc-800 shadow-sm space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-1.5 rounded-full w-fit">Transit Route</h3>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-8 py-4">
                    <div className="p-6 bg-gray-50 dark:bg-zinc-800/50 rounded-3xl flex-1 w-full flex flex-col items-center text-center gap-2 border border-gray-100 dark:border-zinc-800">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Port of Loading</span>
                        <p className="text-sm font-black dark:text-white uppercase italic">{container.port_of_loading || 'UNDEFINED'}</p>
                    </div>
                    <div className="flex items-center justify-center p-4 bg-red-100 dark:bg-red-900/20 rounded-full">
                        <ArrowLeft className="w-6 h-6 text-red-600 rotate-180" />
                    </div>
                    <div className="p-6 bg-gray-50 dark:bg-zinc-800/50 rounded-3xl flex-1 w-full flex flex-col items-center text-center gap-2 border border-gray-100 dark:border-zinc-800">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Port of Discharging</span>
                        <p className="text-sm font-black dark:text-white uppercase italic">{container.port_of_discharging || 'UNDEFINED'}</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Sidebar details */}
        <div className="space-y-8">
            <div className="bg-black dark:bg-white rounded-[40px] p-10 text-white dark:text-black shadow-2xl space-y-10 relative overflow-hidden">
                <div className="space-y-8">
                    <section className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Assigned Entity</p>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/10 dark:bg-black/5 rounded-2xl flex items-center justify-center">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-black uppercase italic">{branch?.branch_name || 'Generic Branch'}</p>
                                <p className="text-[10px] font-bold opacity-50">Branch Code: {branch?.branch_code || 'N/A'}</p>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Supplier Link</p>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/10 dark:bg-black/5 rounded-2xl flex items-center justify-center">
                                <UserIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-black uppercase italic">{supplier?.company || supplier?.name || 'External Vendor'}</p>
                                <p className="text-[10px] font-bold opacity-50">{supplier?.supplier_code || 'ID: ' + container.supplier_id}</p>
                            </div>
                        </div>
                    </section>

                    <div className="pt-6 border-t border-white/10 dark:border-black/5">
                         <Link 
                            href="/dashboard/inventory/purchase-orders"
                            className="w-full py-4 bg-white/10 dark:bg-black/5 hover:bg-white/20 dark:hover:bg-black/10 rounded-2xl flex items-center justify-center gap-3 transition-all text-xs font-black uppercase tracking-widest"
                         >
                            <ExternalLink className="w-4 h-4" />
                            Linked Purchase Orders
                         </Link>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }) {
    return (
        <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-gray-100 dark:border-zinc-800">
                <span className="text-gray-400">{icon}</span>
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-sm font-black dark:text-white uppercase italic">{value || 'N/A'}</p>
            </div>
        </div>
    );
}

function Layout({ className }) {
    return <Package className={className} />;
}
