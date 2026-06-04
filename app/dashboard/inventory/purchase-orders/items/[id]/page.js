"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Package, Building2, 
  Search, ChevronLeft, ChevronRight, Box, Plus, X, MoreVertical, Pencil, Trash2, Eye, Filter, DollarSign, Calendar, Printer, RotateCcw
} from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { QRCodeSVG } from "qrcode.react";
import { useSearchParams } from "next/navigation";
import { purchaseOrderService } from "@/app/lib/services/purchaseOrderService";
import { poItemService } from "@/app/lib/services/poItemService";
import { useBranches } from "@/app/lib/hooks/useBranches";
import { useStockItems } from "@/app/lib/hooks/useStockItems";
import { useToast } from "@/app/components/Toast";
import ConfirmModal from "@/app/components/ConfirmModal";
import ExportButton from "@/app/components/ExportButton";
import PrintableLabel from "@/app/components/PrintableLabel";
import { formatDateForExport, formatCurrencyForExport, formatStatusForExport } from "@/app/lib/utils/exportUtils";
import { Suspense } from "react";

function PurchaseOrderItemsContent({ params }) {
  const [poId, setPoId] = useState(null);
  const { success, error: showError } = useToast();
  
  useEffect(() => {
    Promise.resolve(params).then((resolvedParams) => {
      setPoId(resolvedParams.id);
    });
  }, [params]);
  
  const [items, setItems] = useState([]);
  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [dismantleModalOpen, setDismantleModalOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const searchParams = useSearchParams();
  const [printLabelModalOpen, setPrintLabelModalOpen] = useState(false);
  const [labelPreviewOpen, setLabelPreviewOpen] = useState(false);
  const [labelSize, setLabelSize] = useState({ width: 2.25, height: 1.25 });
  const [rememberSize, setRememberSize] = useState(false);
  const [labelStyles, setLabelStyles] = useState({
    branch: { fontSize: 10, bold: false, underline: false },
    supplier: { fontSize: 10, bold: false, underline: false },
    container: { fontSize: 10, bold: false, underline: false },
    stockNumber: { fontSize: 14, bold: true, underline: false },
    item: { fontSize: 10, bold: false, underline: false },
    poDescription: { fontSize: 10, bold: false, underline: false },
    qrSize: 50,
  });
  const printRef = useRef();
  const itemsPerPage = 8;

  const hasActiveFilters = useMemo(() => {
    return statusFilter !== "all" || searchQuery !== "";
  }, [statusFilter, searchQuery]);

  const handleClearFilters = () => {
    setStatusFilter("all");
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Auto-expand filters if active filters exist on load
  useEffect(() => {
    if (statusFilter !== "all") {
      setIsFilterOpen(true);
    }
  }, [statusFilter]);
  
  const { branches: apiBranches } = useBranches(0, 100, true);
  const branches = useMemo(() => Array.isArray(apiBranches) ? apiBranches : [], [apiBranches]);
  
  const { stockItems: apiStockItems } = useStockItems(0, 100);
  const stockItems = useMemo(() => {
    if (!apiStockItems) return [];
    return Array.isArray(apiStockItems) ? apiStockItems : (apiStockItems?.stock_items || []);
  }, [apiStockItems]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const poData = await purchaseOrderService.getById(poId);
      
      if (!poData) {
        console.warn("Purchase Order not found");
        setPurchaseOrder(null);
        setItems([]);
        setLoading(false);
        return;
      }
      
      setPurchaseOrder(poData);
      
      const itemsData = await poItemService.getAll(0, 100, poId);
      console.log('📦 Fetched PO Items:', itemsData);
      console.log('📦 Items count:', itemsData?.length || 0);
      console.log('📦 First item structure:', itemsData?.[0]);
      console.log('📦 First item container:', itemsData?.[0]?.container);
      console.log('📦 First item destination_branch:', itemsData?.[0]?.container?.destination_branch);
      setItems(itemsData || []);
    } catch (err) {
      console.error("Failed to fetch PO data:", err);
      setPurchaseOrder(null);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (poId) fetchData();
  }, [poId]);

  const filteredItems = useMemo(() => {
    if (!items || !Array.isArray(items)) return [];
    return items.filter(item => {
      const searchTarget = `${item.stock_number || ''} ${item.po_description || ''} ${item.stock_notes || ''}`.toLowerCase();
      const matchesSearch = searchTarget.includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [items, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Auto-open modal on exact stock number match (handheld scanner support)
  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length > 10) {
      const match = items.find(i => i.stock_number === query);
      if (match) {
        setSelectedItem(match);
        setViewModalOpen(true);
        // Clear search to prevent repeated opening? Optional.
      }
    }
  }, [searchQuery, items]);

  const handleDelete = async () => {
    try {
      await poItemService.delete(selectedItem.id);
      success("Item removed from order");
      setDeleteModalOpen(false);
      fetchData();
    } catch (err) {
      showError(err.message);
    }
  };

  const handleDismantle = async () => {
    try {
      await poItemService.dismantle({ item_id: selectedItem.id });
      success("Item dismantled successfully");
      setDismantleModalOpen(false);
      fetchData();
    } catch (err) {
      showError(err.message);
    }
  };

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === paginatedItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(paginatedItems.map(item => item.id));
    }
  };

  const handlePrintLabels = () => {
    if (selectedItems.length === 0) {
      showError("Please select at least one item to print labels");
      return;
    }
    setPrintLabelModalOpen(true);
  };

  const handlePreviewLabel = () => {
    if (rememberSize) {
      localStorage.setItem('labelSize', JSON.stringify(labelSize));
    }
    setPrintLabelModalOpen(false);
    setLabelPreviewOpen(true);
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `PO-${poId}-Labels-${new Date().toISOString().split('T')[0]}`,
    onAfterPrint: () => {
      setLabelPreviewOpen(false);
      setSelectedItems([]);
      success("Labels printed successfully");
    },
  });

  const getPrintData = () => {
    return items
      .filter(item => selectedItems.includes(item.id))
      .map(item => {
        const stockItem = stockItems.find(si => String(si.id) === String(item.item_id));
        const branch = branches.find(b => String(b.id) === String(item.current_branch_id));
        // Use branch name/code from API response if available
        const branchCode = item.current_branch?.branch_code || item.container?.destination_branch?.branch_code || branch?.branch_code || '';
        return {
          id: item.id,
          stock_number: item.stock_number,
          item_name: stockItem?.name || 'Unknown Item',
          po_description: item.po_description,
          branch_code: branchCode,
          supplier_code: purchaseOrder?.supplier_code || '',
          container_number: purchaseOrder?.container_number || '',
          qr_data: `${window.location.origin}/dashboard/inventory/all-inventory/view/${item.stock_number}`,
        };
      });
  };

  useEffect(() => {
    const savedSize = localStorage.getItem('labelSize');
    if (savedSize) {
      setLabelSize(JSON.parse(savedSize));
    }
  }, []);

  // Handle auto-opening item details from QR scan URL
  useEffect(() => {
    if (items.length > 0) {
      const itemId = searchParams.get('item_id');
      const stock = searchParams.get('stock');
      
      if (itemId) {
        const item = items.find(i => i.id.toString() === itemId);
        if (item) {
          setSelectedItem(item);
          setViewModalOpen(true);
        }
      } else if (stock) {
        const item = items.find(i => i.stock_number === stock);
        if (item) {
          setSelectedItem(item);
          setViewModalOpen(true);
        }
      }
    }
  }, [searchParams, items]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 font-bold text-xs uppercase tracking-wider">Loading Items...</p>
      </div>
    );
  }

  if (!purchaseOrder) {
    return (
      <div className="max-w-[1600px] mx-auto space-y-8 pb-12 px-4 sm:px-6">
        <div className="flex items-center gap-5">
          <Link 
            href="/dashboard/inventory/purchase-orders" 
            className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold dark:text-white">Purchase Order Not Found</h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400">The requested purchase order does not exist or has been deleted</p>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-gray-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Purchase Order #{poId} Not Found</p>
              <p className="text-xs text-gray-500">This order may have been deleted or the ID is incorrect</p>
            </div>
            <Link 
              href="/dashboard/inventory/purchase-orders"
              className="mt-4 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-semibold text-sm hover:opacity-90 transition-all"
            >
              Back to Purchase Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-12 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/inventory/purchase-orders" 
            className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold dark:text-white flex items-center gap-3">
              ORDER ITEMS <span className="text-sm font-semibold text-red-600 px-3 py-1 bg-red-50 dark:bg-red-900/20 rounded-lg">#{purchaseOrder?.po_id || poId}</span>
            </h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
              Collection of items registered under this procurement order
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm shadow-xl active:scale-95 transition-all filter-button ${
              isFilterOpen 
                ? 'bg-red-600 text-white shadow-red-600/10' 
                : 'bg-black dark:bg-white text-white dark:text-black shadow-black/10'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>{isFilterOpen ? 'Hide Filters' : 'Show Filters'}</span>
          </button>
          <button
            onClick={handlePrintLabels}
            disabled={selectedItems.length === 0}
            className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
              selectedItems.length > 0 
                ? "bg-blue-600 text-white hover:bg-blue-700" 
                : "bg-gray-100 dark:bg-zinc-800 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Printer className="w-4 h-4" />
            PRINT LABELS {selectedItems.length > 0 ? `(${selectedItems.length})` : ''}
          </button>
          <ExportButton
            data={filteredItems}
            columns={[
              { key: 'stock_number', label: 'Stock Number' },
              { key: 'po_description', label: 'Description' },
              { key: 'quantity', label: 'Quantity' },
              { key: 'status', label: 'Status', formatter: formatStatusForExport },
              { key: 'created_at', label: 'Created At', formatter: formatDateForExport },
            ]}
            filename={`po-items-${poId}-${new Date().toISOString().split('T')[0]}`}
          />
          <Link 
            href={`/dashboard/inventory/purchase-orders/items/add/${poId}`}
            className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-semibold text-sm hover:opacity-90 transition-all flex items-center gap-2 w-fit"
          >
            <Plus className="w-4 h-4" />
            ADD ITEM TO ORDER
          </Link>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Items" value={items.length} icon={<Package className="w-5 h-5 text-red-600" />} />
        <StatCard label="In Stock" value={items.filter(i => i.status === 'in_stock').length} icon={<Box className="w-5 h-5 text-emerald-600" />} />
        <StatCard label="Order Revenue" value={`AED ${parseFloat(purchaseOrder?.total_container_revenue || 0).toLocaleString()}`} icon={<DollarSign className="w-5 h-5 text-blue-600" />} />
        <StatCard label="Creation Date" value={purchaseOrder?.created_at ? new Date(purchaseOrder.created_at).toLocaleDateString() : 'N/A'} icon={<Calendar className="w-5 h-5 text-amber-600" />} />
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search items by stock number or description..."
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Collapsible Filters Card */}
      {isFilterOpen && (
        <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-gray-100 dark:border-zinc-800 shadow-sm p-6 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex justify-between items-center pb-2 border-b border-gray-50 dark:border-zinc-800/50">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Filters</h2>
              <p className="text-xs text-gray-400 dark:text-zinc-500 font-medium">Refine the items list below.</p>
            </div>
            {hasActiveFilters && (
              <button 
                onClick={handleClearFilters}
                className="text-xs font-bold text-red-600 hover:text-red-700 dark:text-red-400 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear Filters
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest pl-1">Status</label>
              <div className="flex flex-wrap gap-2">
                {['all', 'in_stock', 'sold', 'shipped'].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setStatusFilter(s);
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      statusFilter === s 
                        ? 'bg-red-600 text-white shadow-lg shadow-red-600/10' 
                        : 'bg-gray-50 dark:bg-zinc-800/50 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {s === "all" ? "All Status" : s.replace('_', ' ').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Items Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-x-auto responsive-table-container">
        <div className="overflow-x-auto lg:overflow-x-visible w-full scrollbar-hide">
        <table className="w-full min-w-[800px]">
            <thead>
                <tr className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800">
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === paginatedItems.length && paginatedItems.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Item Details</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Quantity</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Current Branch</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {paginatedItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">No Items Found</p>
                          <p className="text-xs text-gray-500">
                            {searchQuery || statusFilter !== 'all' 
                              ? 'Try adjusting your filters or search query' 
                              : 'Add items to this purchase order to get started'}
                          </p>
                        </div>
                        {!searchQuery && statusFilter === 'all' && (
                          <Link 
                            href={`/dashboard/inventory/purchase-orders/items/add/${poId}`}
                            className="mt-4 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-semibold text-sm hover:opacity-90 transition-all inline-flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Add First Item
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : paginatedItems.map((item, idx) => {
                    const stockItem = stockItems.find(si => String(si.id) === String(item.item_id));
                    const branch = branches.find(b => String(b.id) === String(item.current_branch_id));
                    const isSelected = selectedItems.includes(item.id);
                    return (
                        <tr key={item.id} className={`group hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors ${isSelected ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}>
                            <td className="px-6 py-4" data-label="Select">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleSelectItem(item.id)}
                                className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                              />
                            </td>
                            <td className="px-6 py-4" data-label="Item Details">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center font-semibold text-red-600 text-xs">
                                        #{idx + 1 + (currentPage-1)*itemsPerPage}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.stock_number}</p>
                                        <p className="text-xs text-gray-500 max-w-[250px] truncate">{item.po_description}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4" data-label="Category">
                                <span className="text-sm text-gray-700 dark:text-zinc-300">{stockItem?.name || `ID: ${item.item_id}`}</span>
                            </td>
                            <td className="px-6 py-4" data-label="Quantity">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{item.quantity} units</span>
                            </td>
                            <td className="px-6 py-4" data-label="Branch">
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-gray-400" />
                                    <span className="text-xs text-gray-600 dark:text-gray-400">
                                        {item.current_branch?.branch_name || item.current_branch?.branch_code || item.container?.destination_branch?.branch_name || branch?.branch_name || `Branch ${item.current_branch_id}`}
                                    </span>
                                </div>
                            </td>
                            <td className="px-6 py-4" data-label="Status">
                                <div className="flex flex-col gap-1.5">
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wide w-fit ${
                                        item.status === 'in_stock' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20' : 'bg-gray-100 text-gray-700 dark:bg-zinc-800'
                                    }`}>
                                        {item.status.replace('_', ' ')}
                                    </span>
                                    {item.is_dismantled && (
                                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wide bg-amber-50 text-amber-700 w-fit">
                                            Dismantled
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right relative" data-label="Actions">
                                <div className="flex items-center justify-end gap-2">
                                    <button 
                                        onClick={() => { setSelectedItem(item); setViewModalOpen(true); }}
                                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all"
                                        title="View Details"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => { 
                                          setSelectedItems([item.id]); 
                                          setPrintLabelModalOpen(true); 
                                        }}
                                        className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all"
                                        title="Print Label"
                                    >
                                        <Printer className="w-4 h-4" />
                                    </button>
                                    <div className="relative">
                                        <button 
                                            onClick={() => setMenuOpenId(menuOpenId === item.id ? null : item.id)}
                                            className={`p-2 rounded-lg transition-all ${
                                                menuOpenId === item.id 
                                                ? 'bg-gray-900 text-white dark:bg-white dark:text-black' 
                                                : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
                                            }`}
                                        >
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                        {menuOpenId === item.id && (
                                            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-lg z-50 p-1">
                                                {!item.is_dismantled && (
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedItem(item);
                                                            setDismantleModalOpen(true);
                                                            setMenuOpenId(null);
                                                        }}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/10 rounded-lg transition-colors"
                                                    >
                                                        <Box className="w-4 h-4" /> Dismantle Item
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => {
                                                        setSelectedItems([item.id]);
                                                        setPrintLabelModalOpen(true);
                                                        setMenuOpenId(null);
                                                    }}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-lg transition-colors"
                                                >
                                                    <Printer className="w-4 h-4" /> Print Label
                                                </button>
                                                <Link 
                                                    href={`/dashboard/inventory/purchase-orders/items/edit/${item.id}`}
                                                    onClick={() => setMenuOpenId(null)}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                                >
                                                    <Pencil className="w-4 h-4" /> Edit Item
                                                </Link>
                                                <div className="h-px bg-gray-200 dark:bg-zinc-800 my-1" />
                                                <button 
                                                    onClick={() => {
                                                        setSelectedItem(item);
                                                        setDeleteModalOpen(true);
                                                        setMenuOpenId(null);
                                                    }}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" /> Remove
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
        </div>

        {/* PAGINATION */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-zinc-800/50 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 dark:border-zinc-800">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredItems.length}</span> items
          </p>
          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="p-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 px-3">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Page</span>
                <span className="min-w-[32px] h-8 flex items-center justify-center bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg text-sm font-semibold">
                    {currentPage}
                </span>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">of {totalPages || 1}</span>
            </div>
            <button 
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="p-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ConfirmModal 
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Remove Item?"
        message={`Are you sure you want to remove item #${selectedItem?.stock_number} from this purchase order?`}
        confirmText="Remove Now"
        type="danger"
      />

      <ConfirmModal 
        isOpen={dismantleModalOpen}
        onClose={() => setDismantleModalOpen(false)}
        onConfirm={handleDismantle}
        title="Dismantle Part?"
        message={`This will mark item ${selectedItem?.stock_number} as dismantled and available for part-by-part recovery. Continue?`}
        confirmText="Confirm Dismantle"
        type="warning"
      />

      {viewModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-100 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl w-full max-w-2xl overflow-hidden border border-gray-200 dark:border-zinc-800 shadow-2xl">
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
                    <Box className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold dark:text-white">{selectedItem.stock_number}</h2>
                    <span className="text-xs text-gray-500">Item Details</span>
                  </div>
                </div>
                <button onClick={() => setViewModalOpen(false)} className="w-10 h-10 bg-gray-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <DetailBox label="PO Description" value={selectedItem.po_description} />
                <DetailBox label="Category" value={stockItems.find(si => String(si.id) === String(selectedItem.item_id))?.name || selectedItem.item_id} />
                <DetailBox label="Current Branch" value={selectedItem.current_branch?.branch_name || selectedItem.current_branch?.branch_code || selectedItem.container?.destination_branch?.branch_name || branches.find(b => String(b.id) === String(selectedItem.current_branch_id))?.branch_name || selectedItem.current_branch_id} />
                <DetailBox label="Status" value={selectedItem.status.toUpperCase()} />
                <DetailBox label="Quantity" value={`${selectedItem.quantity} units`} />
                <DetailBox label="Is Dismantled" value={selectedItem.is_dismantled ? "YES" : "NO"} />
              </div>

              {selectedItem.stock_notes && (
                 <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl space-y-1 border border-gray-200 dark:border-zinc-800">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock Notes</span>
                    <p className="text-sm text-gray-700 dark:text-zinc-300">"{selectedItem.stock_notes}"</p>
                 </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Print Label Size Modal */}
      {printLabelModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-100 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-zinc-800 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold dark:text-white">Print Labels</h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">Set the dimensions for the labels to be printed.</p>
                </div>
                <button onClick={() => setPrintLabelModalOpen(false)} className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors shrink-0">
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Label Width (in)
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    value={labelSize.width}
                    onChange={(e) => setLabelSize(prev => ({ ...prev, width: parseFloat(e.target.value) }))}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white dark:bg-zinc-800 border-2 border-blue-500 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Label Height (in)
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    value={labelSize.height}
                    onChange={(e) => setLabelSize(prev => ({ ...prev, height: parseFloat(e.target.value) }))}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="rememberSize"
                    checked={rememberSize}
                    onChange={(e) => setRememberSize(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="rememberSize" className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Remember label size
                  </label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setPrintLabelModalOpen(false)}
                  className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-sm hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePreviewLabel}
                  className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-all"
                >
                  Preview Label
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Label Preview & Customization Modal */}
      {labelPreviewOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl sm:rounded-2xl w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden border border-gray-200 dark:border-zinc-800 shadow-2xl">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-zinc-800 shrink-0 flex items-center justify-between bg-white dark:bg-zinc-900">
              <div>
                <h2 className="text-base sm:text-xl font-bold dark:text-white">Label Preview & Customization</h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 hidden sm:block">Review selected labels and adjust styles before printing.</p>
              </div>
              <button onClick={() => setLabelPreviewOpen(false)} className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 dark:bg-zinc-800 rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors shrink-0">
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-3 sm:p-6 overflow-y-auto flex-1 space-y-4 sm:space-y-8 bg-gray-50/30 dark:bg-zinc-950/30">
              
              {/* Selected Items (Horizontal Scroll) */}
              <div className="space-y-2 sm:space-y-3">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Package className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                  Selected Items ({getPrintData().length})
                </h3>
                <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 sm:pb-4 snap-x scrollbar-hide">
                  {getPrintData().map((item, index) => (
                    <div key={item.id} className="shrink-0 w-[280px] snap-start bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl p-3 flex items-start gap-3 hover:border-blue-500 dark:hover:border-blue-500 transition-colors shadow-sm">
                      <div className="shrink-0 bg-white p-1 rounded-lg border border-gray-100 dark:border-zinc-700">
                        <QRCodeSVG
                          value={item.qr_data}
                          size={48}
                          level="H"
                          includeMargin={false}
                        />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-white bg-blue-600 px-1.5 py-0.5 rounded-md">#{index + 1}</span>
                          <span className="text-xs font-bold text-gray-900 dark:text-white truncate">{item.stock_number}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate font-medium">{item.item_name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Preview */}
                <div className="space-y-3 sm:space-y-4 border border-gray-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-3 sm:p-6 bg-white dark:bg-zinc-900 shadow-sm flex flex-col">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                    First Label Preview
                  </h3>
                  <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-gray-50 dark:bg-zinc-950 rounded-lg sm:rounded-xl border border-gray-200 dark:border-zinc-800 overflow-x-auto min-h-[200px] sm:min-h-[300px]">
                    <div className="bg-white text-black p-4 rounded-xl shadow-lg border border-gray-200 flex" style={{ width: `${labelSize.width * 96}px`, height: `${labelSize.height * 96}px`, overflow: 'hidden' }}>
                      {getPrintData().length > 0 && (
                        <div className="w-full h-full flex items-start justify-between gap-4">
                          <div className="flex-1 flex flex-col justify-start space-y-1 overflow-hidden">
                            {getPrintData()[0].branch_code && (
                              <div style={{ color: '#000000', fontSize: `${labelStyles.branch.fontSize}px`, fontWeight: labelStyles.branch.bold ? 'bold' : 'normal', textDecoration: labelStyles.branch.underline ? 'underline' : 'none', lineHeight: 1.2 }} className="truncate">
                                {getPrintData()[0].branch_code}
                              </div>
                            )}
                            {getPrintData()[0].supplier_code && (
                              <div style={{ color: '#000000', fontSize: `${labelStyles.supplier.fontSize}px`, fontWeight: labelStyles.supplier.bold ? 'bold' : 'normal', textDecoration: labelStyles.supplier.underline ? 'underline' : 'none', lineHeight: 1.2 }} className="truncate">
                                {getPrintData()[0].supplier_code}
                              </div>
                            )}
                            {getPrintData()[0].container_number && (
                              <div style={{ color: '#000000', fontSize: `${labelStyles.container.fontSize}px`, fontWeight: labelStyles.container.bold ? 'bold' : 'normal', textDecoration: labelStyles.container.underline ? 'underline' : 'none', lineHeight: 1.2 }} className="truncate">
                                {getPrintData()[0].container_number}
                              </div>
                            )}
                            <div style={{ color: '#000000', fontSize: `${labelStyles.stockNumber.fontSize}px`, fontWeight: labelStyles.stockNumber.bold ? 'bold' : 'normal', textDecoration: labelStyles.stockNumber.underline ? 'underline' : 'none', lineHeight: 1.2 }} className="truncate">
                              {getPrintData()[0].stock_number}
                            </div>
                            <div style={{ color: '#000000', fontSize: `${labelStyles.item.fontSize}px`, fontWeight: labelStyles.item.bold ? 'bold' : 'normal', textDecoration: labelStyles.item.underline ? 'underline' : 'none', lineHeight: 1.2 }} className="truncate whitespace-normal line-clamp-2">
                              {getPrintData()[0].item_name}
                            </div>
                            {getPrintData()[0].po_description && (
                              <div style={{ color: '#000000', fontSize: `${labelStyles.poDescription.fontSize}px`, fontWeight: labelStyles.poDescription.bold ? 'bold' : 'normal', textDecoration: labelStyles.poDescription.underline ? 'underline' : 'none', lineHeight: 1.2 }} className="truncate whitespace-normal line-clamp-2">
                                {getPrintData()[0].po_description}
                              </div>
                            )}
                          </div>
                          <div className="shrink-0 flex items-center justify-center">
                            <QRCodeSVG
                              value={getPrintData()[0].qr_data}
                              size={labelStyles.qrSize}
                              level="H"
                              includeMargin={false}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Customization Grid */}
                <div className="space-y-3 sm:space-y-4 border border-gray-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-3 sm:p-6 bg-white dark:bg-zinc-900 shadow-sm flex flex-col">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Filter className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                    Customize Styles
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {Object.entries({
                      branch: 'Branch',
                      supplier: 'Supplier Code',
                      container: 'Container',
                      stockNumber: 'Stock Number',
                      item: 'Item',
                      poDescription: 'PO Description',
                    }).map(([key, label]) => (
                      <div key={key} className="p-3.5 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-200 dark:border-zinc-700/50 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{label}</span>
                          <input
                            type="number"
                            value={labelStyles[key].fontSize}
                            onChange={(e) => setLabelStyles(prev => ({ ...prev, [key]: { ...prev[key], fontSize: parseInt(e.target.value) } }))}
                            className="w-14 px-2 py-1 text-xs font-semibold bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg text-center focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          />
                        </div>
                        <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 p-2 rounded-lg border border-gray-100 dark:border-zinc-800">
                          <label className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-400 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={labelStyles[key].bold}
                              onChange={(e) => setLabelStyles(prev => ({ ...prev, [key]: { ...prev[key], bold: e.target.checked } }))}
                              className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            Bold
                          </label>
                          <div className="w-px h-3 bg-gray-200 dark:bg-zinc-700"></div>
                          <label className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-400 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={labelStyles[key].underline}
                              onChange={(e) => setLabelStyles(prev => ({ ...prev, [key]: { ...prev[key], underline: e.target.checked } }))}
                              className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            Underline
                          </label>
                        </div>
                      </div>
                    ))}
                    <div className="p-3.5 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-200 dark:border-zinc-700/50 flex flex-col gap-3 justify-center">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Label Size (in)</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            step="0.25"
                            value={labelSize.width}
                            onChange={(e) => setLabelSize(prev => ({ ...prev, width: parseFloat(e.target.value) || 0 }))}
                            className="w-16 px-1 py-1 text-xs font-semibold bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg text-center focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            title="Width (inches)"
                          />
                          <span className="text-gray-400 text-xs">×</span>
                          <input
                            type="number"
                            step="0.25"
                            value={labelSize.height}
                            onChange={(e) => setLabelSize(prev => ({ ...prev, height: parseFloat(e.target.value) || 0 }))}
                            className="w-16 px-1 py-1 text-xs font-semibold bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg text-center focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            title="Height (inches)"
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">Set the label print width and height in inches.</p>
                    </div>

                    <div className="p-3.5 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-200 dark:border-zinc-700/50 flex flex-col gap-3 justify-center">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">QR Code Size</span>
                        <input
                          type="number"
                          value={labelStyles.qrSize}
                          onChange={(e) => setLabelStyles(prev => ({ ...prev, qrSize: parseInt(e.target.value) }))}
                          className="w-14 px-2 py-1 text-xs font-semibold bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg text-center focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                      </div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">Set the dimension (in pixels) for the QR code embedded on the right.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 sm:p-4 lg:p-6 border-t border-gray-200 dark:border-zinc-800 shrink-0 flex flex-col sm:flex-row items-center justify-end gap-2 sm:gap-3 bg-white dark:bg-zinc-900">
                <button
                  onClick={() => {
                    setLabelStyles({
                      branch: { fontSize: 10, bold: false, underline: false },
                      supplier: { fontSize: 10, bold: false, underline: false },
                      container: { fontSize: 10, bold: false, underline: false },
                      stockNumber: { fontSize: 14, bold: true, underline: false },
                      item: { fontSize: 10, bold: false, underline: false },
                      poDescription: { fontSize: 10, bold: false, underline: false },
                      qrSize: 50,
                    });
                  }}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-xs sm:text-sm hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all"
                >
                  Reset Defaults
                </button>
                <button
                  onClick={() => setLabelPreviewOpen(false)}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-xs sm:text-sm hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handlePrint()}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-xl font-semibold text-xs sm:text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  <Printer className="w-3 h-3 sm:w-4 sm:h-4" />
                  Confirm Print
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Print Component */}
      <div className="hidden">
        <div ref={printRef}>
          <PrintableLabel items={getPrintData()} styles={labelStyles} labelSize={labelSize} />
        </div>
      </div>


    </div>
  );
}

export default function PurchaseOrderItemsPage({ params }) {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 font-black text-xs uppercase tracking-widest animate-pulse">Loading Items...</p>
      </div>
    }>
      <PurchaseOrderItemsContent params={params} />
    </Suspense>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-5 rounded-xl flex items-center justify-between hover:border-gray-300 dark:hover:border-zinc-700 transition-colors">
      <div className="space-y-1">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-lg font-bold dark:text-white">{value}</p>
      </div>
      <div className="w-10 h-10 bg-gray-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
        {icon}
      </div>
    </div>
  );
}

function DetailBox({ label, value }) {
  return (
    <div className="space-y-1">
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
      <div className="p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-lg text-sm font-medium dark:text-white border border-gray-200 dark:border-zinc-800">
        {value || 'N/A'}
      </div>
    </div>
  );
}
