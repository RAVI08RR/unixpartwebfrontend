"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Ship, Hash, Navigation, Anchor, MapPin, 
  Package, Calendar, Building2, User as UserIcon, Shield,
  Receipt, Truck, Info, AlertCircle, Save, X
} from "lucide-react";
import { containerService } from "@/app/lib/services/containerService";
import { useSuppliers } from "@/app/lib/hooks/useSuppliers";
import { useBranches } from "@/app/lib/hooks/useBranches";
import { useToast } from "@/app/components/Toast";

export default function AddClearancePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { success: showSuccess, error: showError } = useToast();
  const { suppliers } = useSuppliers();
  const { branches } = useBranches();
  
  const [formData, setFormData] = useState({
    container_code: "",
    container_number: "",
    supplier_id: "",
    destination_branch_id: "",
    vessel_name: "",
    voyage_number: "",
    shipping_agent: "",
    port_of_loading: "",
    port_of_discharging: "",
    container_size: "40ft",
    total_packages: 1,
    notify_user_id: 1,
    status: "draft",
    invoice_date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if(!formData.container_code || !formData.container_number || !formData.vessel_name || !formData.supplier_id || !formData.destination_branch_id) {
        showError("Please fill in all required fields (marked with *)");
        return;
    }

    setLoading(true);
    try {
        const payload = {
            ...formData,
            supplier_id: parseInt(formData.supplier_id),
            destination_branch_id: parseInt(formData.destination_branch_id),
            total_packages: parseInt(formData.total_packages)
        };

        await containerService.create(payload);
        showSuccess("Custom clearance record created successfully!");
        router.push("/dashboard/inventory/custom-clearance");
    } catch (err) {
        showError(`Failed to create clearance: ${err.message}`);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="mx-auto space-y-8 pb-12 w-full animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex items-center gap-5">
        <Link 
          href="/dashboard/inventory/custom-clearance" 
          className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 hover:shadow-lg transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-black dark:text-white tracking-tight">Add Clearance</h1>
          <p className="text-gray-500 dark:text-zinc-500 font-medium">Create a new vessel shipment and custom documentation</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
          {/* Main Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <FormField label="Container Code" required>
              <div className="relative group">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="e.g. CON-001"
                  className="w-full pl-9 pr-3 bg-gray-50 dark:bg-zinc-800/50 border border-transparent focus:border-red-600/30 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-600/10 transition-all dark:text-white"
                  style={{ height: '45px' }}
                  value={formData.container_code}
                  onChange={(e) => setFormData({...formData, container_code: e.target.value})}
                  required
                />
              </div>
            </FormField>

            <FormField label="Container Number" required>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="e.g. CNTR-A123456"
                  className="w-full pl-9 pr-3 bg-gray-50 dark:bg-zinc-800/50 border border-transparent focus:border-red-600/30 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-600/10 transition-all dark:text-white"
                  style={{ height: '45px' }}
                  value={formData.container_number}
                  onChange={(e) => setFormData({...formData, container_number: e.target.value})}
                  required
                />
              </div>
            </FormField>

            <FormField label="Vessel Name" required>
              <div className="relative">
                <Ship className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="e.g. MSC MARINA"
                  className="w-full pl-9 pr-3 bg-gray-50 dark:bg-zinc-800/50 border border-transparent focus:border-red-600/30 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-600/10 transition-all dark:text-white"
                  style={{ height: '45px' }}
                  value={formData.vessel_name}
                  onChange={(e) => setFormData({...formData, vessel_name: e.target.value})}
                  required
                />
              </div>
            </FormField>

            <FormField label="Voyage Number" required>
              <div className="relative">
                <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="e.g. VOY-2023-101"
                  className="w-full pl-9 pr-3 bg-gray-50 dark:bg-zinc-800/50 border border-transparent focus:border-red-600/30 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-600/10 transition-all dark:text-white"
                  style={{ height: '45px' }}
                  value={formData.voyage_number}
                  onChange={(e) => setFormData({...formData, voyage_number: e.target.value})}
                  required
                />
              </div>
            </FormField>

            <FormField label="Supplier" required>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <select 
                  className="w-full pl-9 pr-3 bg-gray-50 dark:bg-zinc-800/50 border border-transparent focus:border-red-600/30 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-600/10 transition-all dark:text-white appearance-none cursor-pointer"
                  style={{ height: '45px' }}
                  value={formData.supplier_id}
                  onChange={(e) => setFormData({...formData, supplier_id: e.target.value})}
                  required
                >
                  <option value="">Select Supplier</option>
                  {suppliers?.map(s => (
                    <option key={s.id} value={s.id}>{s.company || s.name}</option>
                  ))}
                </select>
              </div>
            </FormField>

            <FormField label="Destination Branch" required>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <select 
                  className="w-full pl-9 pr-3 bg-gray-50 dark:bg-zinc-800/50 border border-transparent focus:border-red-600/30 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-600/10 transition-all dark:text-white appearance-none cursor-pointer"
                  style={{ height: '45px' }}
                  value={formData.destination_branch_id}
                  onChange={(e) => setFormData({...formData, destination_branch_id: e.target.value})}
                  required
                >
                  <option value="">Select Branch</option>
                  {branches?.map(b => (
                    <option key={b.id} value={b.id}>{b.branch_name}</option>
                  ))}
                </select>
              </div>
            </FormField>

            <FormField label="Port of Loading">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="e.g. Port of Singapore"
                  className="w-full pl-9 pr-3 bg-gray-50 dark:bg-zinc-800/50 border border-transparent focus:border-red-600/30 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-600/10 transition-all dark:text-white"
                  style={{ height: '45px' }}
                  value={formData.port_of_loading}
                  onChange={(e) => setFormData({...formData, port_of_loading: e.target.value})}
                />
              </div>
            </FormField>

            <FormField label="Port of Discharging">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="e.g. Port of Jebel Ali"
                  className="w-full pl-9 pr-3 bg-gray-50 dark:bg-zinc-800/50 border border-transparent focus:border-red-600/30 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-600/10 transition-all dark:text-white"
                  style={{ height: '45px' }}
                  value={formData.port_of_discharging}
                  onChange={(e) => setFormData({...formData, port_of_discharging: e.target.value})}
                />
              </div>
            </FormField>

            <FormField label="Shipping Agent">
              <div className="relative">
                <Anchor className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="e.g. Maersk"
                  className="w-full pl-9 pr-3 bg-gray-50 dark:bg-zinc-800/50 border border-transparent focus:border-red-600/30 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-600/10 transition-all dark:text-white"
                  style={{ height: '45px' }}
                  value={formData.shipping_agent}
                  onChange={(e) => setFormData({...formData, shipping_agent: e.target.value})}
                />
              </div>
            </FormField>

            <FormField label="Invoice Date">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input 
                  type="date"
                  className="w-full pl-9 pr-3 bg-gray-50 dark:bg-zinc-800/50 border border-transparent focus:border-red-600/30 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-600/10 transition-all dark:text-white"
                  style={{ height: '45px' }}
                  value={formData.invoice_date}
                  onChange={(e) => setFormData({...formData, invoice_date: e.target.value})}
                />
              </div>
            </FormField>

            <FormField label="Container Size">
                <select 
                  className="w-full px-3 bg-gray-50 dark:bg-zinc-800/50 border border-transparent focus:border-red-600/30 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-600/10 transition-all dark:text-white appearance-none cursor-pointer"
                  style={{ height: '45px' }}
                  value={formData.container_size}
                  onChange={(e) => setFormData({...formData, container_size: e.target.value})}
                >
                  <option value="20ft">20ft Standard</option>
                  <option value="40ft">40ft Standard</option>
                  <option value="40ft HC">40ft High Cube</option>
                </select>
            </FormField>

            <FormField label="Total Packages">
                <input 
                  type="number" 
                  className="w-full px-3 bg-gray-50 dark:bg-zinc-800/50 border border-transparent focus:border-red-600/30 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-600/10 transition-all dark:text-white"
                  style={{ height: '45px' }}
                  value={formData.total_packages}
                  onChange={(e) => setFormData({...formData, total_packages: e.target.value})}
                />
            </FormField>

            <FormField label="Current Status">
                <select 
                  className="w-full px-3 bg-gray-50 dark:bg-zinc-800/50 border border-transparent focus:border-red-600/30 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-600/10 transition-all dark:text-white appearance-none cursor-pointer"
                  style={{ height: '45px' }}
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="draft">Draft</option>
                  <option value="shipped">Shipped</option>
                  <option value="arrived">Arrived</option>
                  <option value="cleared">Cleared</option>
                </select>
            </FormField>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-6 border-t border-gray-100 dark:border-zinc-800">
            <button 
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium shadow-sm hover:bg-gray-900 active:scale-95 transition-all disabled:opacity-50"
              style={{ fontSize: '15px' }}
            >
              {loading ? 'Creating...' : 'Create Clearance'}
            </button>
            <Link 
              href="/dashboard/inventory/custom-clearance"
              className="px-6 py-3 bg-gray-50 dark:bg-zinc-800 text-gray-500 rounded-lg font-medium text-center hover:bg-gray-100 dark:hover:bg-zinc-700 transition-all"
              style={{ fontSize: '15px' }}
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({ label, children, required }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
        {label} {required ? <span className="text-red-500">*</span> : <span className="text-gray-400 font-normal text-[10px]">(Optional)</span>}
      </label>
      {children}
    </div>
  );
}
