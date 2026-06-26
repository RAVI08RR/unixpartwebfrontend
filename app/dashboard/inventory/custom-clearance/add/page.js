"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Ship, Hash, Navigation, Anchor, MapPin,
  Package, Calendar, Building2, User as UserIcon,
  Save, X, Tag
} from "lucide-react";
import { containerService } from "@/app/lib/services/containerService";
import { containerItemService } from "@/app/lib/services/containerItemService";
import { useSuppliers } from "@/app/lib/hooks/useSuppliers";
import { useBranches } from "@/app/lib/hooks/useBranches";
import { useStockItems } from "@/app/lib/hooks/useStockItems";
import { useToast } from "@/app/components/Toast";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { PERMISSIONS } from "@/app/lib/constants/permissions";

export default function AddClearancePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [createdContainer, setCreatedContainer] = useState(null);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [submittingItem, setSubmittingItem] = useState(false);
  const { success: showSuccess, error: showError } = useToast();
  const { suppliers } = useSuppliers(1, 10, null, true);
  const { branches } = useBranches(1, 10, true);
  const { stockItems: apiStockItems } = useStockItems(1, 10, null, true);

  const stockItems = useMemo(() => {
    if (!apiStockItems) return [];
    return Array.isArray(apiStockItems) ? apiStockItems : (apiStockItems?.stock_items || []);
  }, [apiStockItems]);

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
    container_size: "1 × 40FT",
    total_packages: 1,
    notify_user_id: 1,
    status: "",
    invoice_date: new Date().toISOString().split('T')[0]
  });

  const handleSupplierChange = async (supplierId) => {
    setFormData(prev => ({ ...prev, supplier_id: supplierId }));

    if (supplierId) {
      try {
        const response = await containerService.generateContainerCode(supplierId);
        if (response && response.container_code) {
          setFormData(prev => ({ ...prev, container_code: response.container_code }));
        }
      } catch (err) {
        console.error("Failed to generate container code:", err);
      }
    }
  };

  const [itemFormData, setItemFormData] = useState({
    item_id: "",
    item_description: "",
    quantity: 1,
    unit_price: "0.00"
  });

  const handleSubmit = async (e, shouldAddItems = false) => {
    if (e) e.preventDefault();

    if (!formData.container_code || !formData.container_number || !formData.vessel_name || !formData.supplier_id || !formData.destination_branch_id) {
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

      const result = await containerService.create(payload);
      setCreatedContainer(result);
      showSuccess("Custom clearance record created successfully!");

      if (shouldAddItems) {
        setItemModalOpen(true);
      } else {
        router.push("/dashboard/inventory/custom-clearance");
      }
    } catch (err) {
      showError(`Failed to create clearance: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async (e) => {
    if (e) e.preventDefault();
    if (!createdContainer) return;

    setSubmittingItem(true);
    try {
      const payload = {
        container_id: parseInt(createdContainer.id),
        item_id: parseInt(itemFormData.item_id),
        item_description: itemFormData.item_description || null,
        quantity: parseInt(itemFormData.quantity),
        unit_price: parseFloat(itemFormData.unit_price)
      };

      await containerItemService.create(payload);
      showSuccess("Item added successfully!");
      router.push(`/dashboard/inventory/custom-clearance/items/${createdContainer.id}`);
    } catch (err) {
      showError(`Failed to add item: ${err.message}`);
    } finally {
      setSubmittingItem(false);
    }
  };

  return (
    <ProtectedRoute permissions={[PERMISSIONS.CUSTOM_CLEARANCE.CREATE, PERMISSIONS.CONTAINERS.CREATE]}>
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

        <div className="bg-white dark:bg-zinc-900 rounded-[15px] border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
          <form onSubmit={(e) => handleSubmit(e, false)} className="p-6 sm:p-8 space-y-8">
            {/* Main Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <FormField label="Supplier" required>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <select
                    className="w-full pl-9 pr-3 bg-gray-50 dark:bg-zinc-800/50 border border-transparent focus:border-red-600/30 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-600/10 transition-all dark:text-white appearance-none cursor-pointer"
                    style={{ height: '45px' }}
                    value={formData.supplier_id}
                    onChange={(e) => handleSupplierChange(e.target.value)}
                    required
                  >
                    <option value="">Select Supplier</option>
                    {suppliers?.map(s => (
                      <option key={s.id} value={s.id}>{s.label || s.company || s.name}</option>
                    ))}
                  </select>
                </div>
              </FormField>

              <FormField label="Container Code" required>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="e.g. SUP-0010"
                    className="w-full pl-9 pr-3 bg-gray-50 dark:bg-zinc-800/50 border border-transparent focus:border-red-600/30 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-600/10 transition-all dark:text-white"
                    style={{ height: '45px' }}
                    value={formData.container_code}
                    onChange={(e) => setFormData({ ...formData, container_code: e.target.value })}
                    required
                  />
                </div>
              </FormField>

              <FormField label="Container Number" required>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="e.g. test-004"
                    className="w-full pl-9 pr-3 bg-gray-50 dark:bg-zinc-800/50 border border-transparent focus:border-red-600/30 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-600/10 transition-all dark:text-white"
                    style={{ height: '45px' }}
                    value={formData.container_number}
                    onChange={(e) => setFormData({ ...formData, container_number: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, vessel_name: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, voyage_number: e.target.value })}
                    required
                  />
                </div>
              </FormField>



              <FormField label="Destination Branch" required>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <select
                    className="w-full pl-9 pr-3 bg-gray-50 dark:bg-zinc-800/50 border border-transparent focus:border-red-600/30 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-600/10 transition-all dark:text-white appearance-none cursor-pointer"
                    style={{ height: '45px' }}
                    value={formData.destination_branch_id}
                    onChange={(e) => setFormData({ ...formData, destination_branch_id: e.target.value })}
                    required
                  >
                    <option value="">Select Branch</option>
                    {branches?.map(b => (
                      <option key={b.id} value={b.id}>{b.label || b.branch_name}</option>
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
                    onChange={(e) => setFormData({ ...formData, port_of_loading: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, port_of_discharging: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, shipping_agent: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                  />
                </div>
              </FormField>

              <FormField label="Container Size">
                <select
                  className="w-full px-3 bg-gray-50 dark:bg-zinc-800/50 border border-transparent focus:border-red-600/30 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-600/10 transition-all dark:text-white appearance-none cursor-pointer"
                  style={{ height: '45px' }}
                  value={formData.container_size}
                  onChange={(e) => setFormData({ ...formData, container_size: e.target.value })}
                >
                  <option value="1 × 40FT">1 × 40FT</option>
                  <option value="1 × 20FT">1 × 20FT</option>
                  <option value="2 × 20FT">2 × 20FT</option>
                </select>
              </FormField>

              <FormField label="Total Packages">
                <input
                  type="number"
                  className="w-full px-3 bg-gray-50 dark:bg-zinc-800/50 border border-transparent focus:border-red-600/30 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-600/10 transition-all dark:text-white"
                  style={{ height: '45px' }}
                  value={formData.total_packages}
                  onChange={(e) => setFormData({ ...formData, total_packages: e.target.value })}
                />
              </FormField>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-6 border-t border-gray-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                disabled={loading}
                className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium shadow-sm hover:bg-gray-900 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                style={{ fontSize: '15px' }}
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Saving...' : 'Save and Add Items'}</span>
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all disabled:opacity-50"
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

        {/* Add Item Modal */}
        {itemModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-[24px] w-full max-w-lg border border-gray-100 dark:border-zinc-800 shadow-2xl">
              <form onSubmit={handleCreateItem} className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black dark:text-white">Add Item to Container</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Container ID: {createdContainer?.id}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <FormField label="Item Category" required>
                    <select
                      className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[15px] text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all dark:text-white"
                      value={itemFormData.item_id}
                      onChange={(e) => setItemFormData({ ...itemFormData, item_id: e.target.value })}
                      required
                    >
                      <option value="">Select Item Category</option>
                      {stockItems.map(si => <option key={si.id} value={si.id}>{si.label || si.name}</option>)}
                    </select>
                  </FormField>

                  <FormField label="Quantity" required>
                    <input
                      type="number"
                      min="1"
                      className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[15px] text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all dark:text-white"
                      value={itemFormData.quantity}
                      onChange={(e) => setItemFormData({ ...itemFormData, quantity: e.target.value })}
                      required
                    />
                  </FormField>

                  <FormField label="Item Description">
                    <textarea
                      rows="3"
                      className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[15px] text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all dark:text-white resize-none"
                      value={itemFormData.item_description}
                      onChange={(e) => setItemFormData({ ...itemFormData, item_description: e.target.value })}
                      placeholder="Optional description..."
                    />
                  </FormField>

                  <FormField label="Unit Price (AED)">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[15px] text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all dark:text-white"
                      value={itemFormData.unit_price}
                      onChange={(e) => setItemFormData({ ...itemFormData, unit_price: e.target.value })}
                    />
                  </FormField>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={submittingItem}
                    className="flex-1 py-3 bg-black dark:bg-white text-white dark:text-black rounded-[15px] font-bold text-sm hover:opacity-90 transition-all"
                  >
                    {submittingItem ? 'Adding...' : 'Add Item'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setItemModalOpen(false);
                      router.push(`/dashboard/inventory/custom-clearance/items/${createdContainer.id}`);
                    }}
                    className="flex-1 py-3 text-gray-500 dark:text-gray-400 rounded-[15px] font-medium text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

function FormField({ label, children, required }) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
