"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Package, Building2, DollarSign, Calendar, 
  Pencil, Trash2, ArrowRightLeft, FileText, History,
  Truck, Percent, Download, Eye, Upload, Loader2, X, AlertCircle
} from "lucide-react";
import { assetService } from "@/app/lib/services/assetService";
import { branchService } from "@/app/lib/services/branchService";
import { supplierService } from "@/app/lib/services/supplierService";
import { useToast } from "@/app/components/Toast";
import TransferModal from "@/app/components/assets/TransferModal";
import SellAssetModal from "@/app/components/assets/SellAssetModal";
import SaleDetailsModal from "@/app/components/assets/SaleDetailsModal";

export default function AssetDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { success, error: showError } = useToast();
  
  const [asset, setAsset] = useState(null);
  const [branches, setBranches] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Tab data
  const [ownershipHistory, setOwnershipHistory] = useState([]);
  const [transferHistory, setTransferHistory] = useState([]);
  const [documents, setDocuments] = useState([]);
  
  // Modals
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [saleDetailsModalOpen, setSaleDetailsModalOpen] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selling, setSelling] = useState(false);
  
  // Sale data
  const [saleDetails, setSaleDetails] = useState(null);
  const [loadingSaleDetails, setLoadingSaleDetails] = useState(false);
  
  // Document upload
  const [uploadingDoc, setUploadingDoc] = useState(false);

  useEffect(() => {
    fetchAssetData();
    fetchBranches();
    fetchSuppliers();
  }, [params.id]);

  useEffect(() => {
    if (activeTab === "ownership" && asset) {
      fetchOwnershipHistory();
    } else if (activeTab === "transfers" && asset) {
      fetchTransferHistory();
    } else if (activeTab === "documents" && asset) {
      fetchDocuments();
    }
  }, [activeTab, asset]);

  const fetchAssetData = async () => {
    try {
      setLoading(true);
      // Use the endpoint that includes ownership history
      const data = await assetService.getByIdWithOwnership(params.id);
      setAsset(data);
      
      // Set ownership history from the response
      if (data.asset_ownerships && Array.isArray(data.asset_ownerships)) {
        setOwnershipHistory(data.asset_ownerships);
      }
    } catch (err) {
      showError("Failed to load asset data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const data = await branchService.getAll(0, 100);
      setBranches(Array.isArray(data) ? data : (data?.branches || []));
    } catch (err) {
      console.error("Failed to fetch branches:", err);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const data = await supplierService.getAll(0, 100);
      setSuppliers(Array.isArray(data) ? data : (data?.suppliers || []));
    } catch (err) {
      console.error("Failed to fetch suppliers:", err);
    }
  };

  const fetchOwnershipHistory = async () => {
    try {
      const data = await assetService.getOwnershipHistory(params.id);
      setOwnershipHistory(data);
    } catch (err) {
      console.error("Failed to fetch ownership history:", err);
    }
  };

  const fetchTransferHistory = async () => {
    try {
      const data = await assetService.getTransferHistory(params.id);
      setTransferHistory(data);
    } catch (err) {
      console.error("Failed to fetch transfer history:", err);
    }
  };

  const fetchDocuments = async () => {
    try {
      const data = await assetService.getDocuments(params.id);
      setDocuments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    }
  };

  const handleTransfer = async (transferData) => {
    setTransferring(true);
    try {
      await assetService.transfer(params.id, transferData);
      success("Asset transferred successfully!");
      setTransferModalOpen(false);
      fetchAssetData();
      fetchTransferHistory();
    } catch (err) {
      showError("Failed to transfer asset: " + err.message);
      throw err;
    } finally {
      setTransferring(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await assetService.delete(params.id);
      success("Asset deleted successfully!");
      router.push("/dashboard/inventory/assets");
    } catch (err) {
      showError("Failed to delete asset: " + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (documents.length >= 5) {
      showError("Maximum 5 documents allowed");
      return;
    }

    setUploadingDoc(true);
    try {
      const docName = file.name.split('.').slice(0, -1).join('.');
      await assetService.uploadDocument(params.id, file, docName);
      success("Document uploaded successfully!");
      fetchDocuments();
    } catch (err) {
      showError("Failed to upload document: " + err.message);
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleSell = async (saleData) => {
    setSelling(true);
    try {
      await assetService.sell(params.id, saleData);
      success("Asset sold successfully!");
      setSellModalOpen(false);
      fetchAssetData();
      // Fetch sale details after successful sale
      await fetchSaleDetails();
    } catch (err) {
      showError("Failed to sell asset: " + err.message);
      throw err;
    } finally {
      setSelling(false);
    }
  };

  const fetchSaleDetails = async () => {
    setLoadingSaleDetails(true);
    try {
      const details = await assetService.getSaleDetails(params.id);
      setSaleDetails(details);
    } catch (err) {
      console.error("Failed to fetch sale details:", err);
      setSaleDetails(null);
    } finally {
      setLoadingSaleDetails(false);
    }
  };

  const handleViewSaleDetails = async () => {
    await fetchSaleDetails();
    setSaleDetailsModalOpen(true);
  };

  const getSupplierName = (supplierId) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier ? supplier.name : 'Unknown';
  };

  const getBranchName = (branchId) => {
    const branch = branches.find(b => b.id === branchId);
    return branch ? (branch.branch_name || branch.name) : 'Unknown';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-sm text-gray-500">Loading asset details...</p>
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-500">Asset not found</p>
          <Link href="/dashboard/inventory/assets" className="text-blue-600 hover:underline mt-2 inline-block">
            Back to Assets
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: Package },
    { id: "ownership", label: "Ownership History", icon: Truck },
    { id: "transfers", label: "Transfer History", icon: ArrowRightLeft },
    { id: "documents", label: "Documents", icon: FileText },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/inventory/assets"
            className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-black dark:text-white tracking-tight">{asset.asset_id}</h1>
            <p className="text-gray-400 dark:text-zinc-500 text-sm font-normal">{asset.asset_name}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {asset.status?.toLowerCase() === 'sold' ? (
            <button
              onClick={handleViewSaleDetails}
              disabled={loadingSaleDetails}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-sm transition-all disabled:opacity-50"
            >
              <DollarSign className="w-4 h-4" />
              {loadingSaleDetails ? "Loading..." : "View Sale Details"}
            </button>
          ) : (
            <>
              <button
                onClick={() => setSellModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-sm transition-all"
              >
                <DollarSign className="w-4 h-4" />
                Sell Asset
              </button>
              <button
                onClick={() => setTransferModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-all"
              >
                <ArrowRightLeft className="w-4 h-4" />
                Transfer
              </button>
            </>
          )}
          <Link
            href={`/dashboard/inventory/assets/edit/${asset.id}`}
            className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-bold text-sm transition-all"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </Link>
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 overflow-hidden">
        <div className="border-b border-gray-100 dark:border-zinc-800">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-bold text-sm whitespace-nowrap transition-all border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InfoCard label="Asset ID" value={asset.asset_id} icon={Package} />
                <InfoCard label="Asset Name" value={asset.asset_name} icon={Package} />
                <InfoCard label="Category" value={asset.category} icon={Package} />
                <InfoCard label="Description" value={asset.description || 'N/A'} icon={FileText} />
                <InfoCard 
                  label="Purchase Price" 
                  value={`AED ${parseFloat(asset.purchase_price || 0).toLocaleString()}`} 
                  icon={DollarSign} 
                />
                <InfoCard 
                  label="Current Value" 
                  value={`AED ${parseFloat(asset.current_value || 0).toLocaleString()}`} 
                  icon={DollarSign} 
                />
                <InfoCard 
                  label="Purchase Date" 
                  value={asset.purchase_date ? new Date(asset.purchase_date).toLocaleDateString() : 'N/A'} 
                  icon={Calendar} 
                />
                <InfoCard 
                  label="Purchase Branch" 
                  value={getBranchName(asset.purchase_branch_id)} 
                  icon={Building2} 
                />
                <InfoCard 
                  label="Current Branch" 
                  value={getBranchName(asset.current_operating_branch_id)} 
                  icon={Building2} 
                />
                <InfoCard 
                  label="Status" 
                  value={asset.status?.toUpperCase() || 'ACTIVE'} 
                  icon={Package}
                  valueColor="text-green-600 dark:text-green-400"
                />
              </div>

              {asset.notes && (
                <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Notes
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{asset.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Ownership History Tab */}
          {activeTab === "ownership" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Ownership History</h3>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-all">
                  Modify Ownership
                </button>
              </div>

              {/* Current Ownership Summary */}
              {asset.asset_ownerships && asset.asset_ownerships.length > 0 && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="text-sm font-bold text-blue-900 dark:text-blue-200 mb-3 flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Current Ownership Structure
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {asset.asset_ownerships.map((ownership, index) => (
                      <div key={index} className="bg-white dark:bg-zinc-900 rounded-lg p-3 border border-blue-100 dark:border-blue-800/30">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                              {getSupplierName(ownership.supplier_id)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Supplier ID: {ownership.supplier_id}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <Percent className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            <span className="text-lg font-black text-blue-600 dark:text-blue-400">
                              {ownership.ownership_percentage}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-900 dark:text-blue-200">Total Ownership:</span>
                    <span className="text-sm font-black text-green-600 dark:text-green-400">
                      {asset.asset_ownerships.reduce((sum, o) => sum + parseFloat(o.ownership_percentage || 0), 0).toFixed(2)}%
                    </span>
                  </div>
                </div>
              )}

              {ownershipHistory.length > 0 ? (
                <div>
                  <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Historical Records
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-zinc-800">
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Owner Supplier
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Percentage
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            From Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            To Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                        {ownershipHistory.map((record, index) => (
                          <tr key={index} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                              <div className="flex items-center gap-2">
                                <Truck className="w-4 h-4 text-gray-400" />
                                {getSupplierName(record.supplier_id)}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm font-bold text-blue-600 dark:text-blue-400">
                              {record.ownership_percentage}%
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                              {record.from_date ? new Date(record.from_date).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                              {record.to_date ? new Date(record.to_date).toLocaleDateString() : 
                                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-bold rounded">
                                  Present
                                </span>
                              }
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {!record.to_date ? (
                                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-bold rounded">
                                  Active
                                </span>
                              ) : (
                                <span className="px-2 py-1 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 text-xs font-bold rounded">
                                  Historical
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <History className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No ownership history available</p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                    Ownership records will appear here once configured
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Transfer History Tab */}
          {activeTab === "transfers" && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Transfer History</h3>

              {transferHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-zinc-800">
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          From Branch
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          To Branch
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Reason
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Responsible Person
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                      {transferHistory.map((transfer, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {transfer.transfer_date ? new Date(transfer.transfer_date).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                            {getBranchName(transfer.from_branch_id)}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                            {getBranchName(transfer.to_branch_id)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {transfer.reason || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {transfer.responsible_person || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <ArrowRightLeft className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No transfer history available</p>
                </div>
              )}
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === "documents" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Documents ({documents.length}/5)
                </h3>
                {documents.length < 5 && (
                  <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm cursor-pointer transition-all">
                    <Upload className="w-4 h-4" />
                    Upload Document
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={uploadingDoc}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    />
                  </label>
                )}
              </div>

              {documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documents.map((doc) => (
                    <div key={doc.id} className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg border border-gray-200 dark:border-zinc-700">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                              {doc.document_name?.replace(/_/g, ' ') || 'Document'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {doc.document_path?.split('.').pop().toUpperCase()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => assetService.downloadDocument(asset.id, doc.id)}
                            className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Download"
                          >
                            <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">No documents uploaded yet</p>
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm cursor-pointer transition-all">
                    <Upload className="w-4 h-4" />
                    Upload First Document
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={uploadingDoc}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    />
                  </label>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Transfer Modal */}
      <TransferModal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        asset={asset}
        branches={branches}
        onTransfer={handleTransfer}
        isLoading={transferring}
      />

      {/* Sell Asset Modal */}
      <SellAssetModal
        isOpen={sellModalOpen}
        onClose={() => setSellModalOpen(false)}
        asset={asset}
        onSell={handleSell}
        isLoading={selling}
      />

      {/* Sale Details Modal */}
      <SaleDetailsModal
        isOpen={saleDetailsModalOpen}
        onClose={() => setSaleDetailsModalOpen(false)}
        asset={asset}
        saleDetails={saleDetails}
      />

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 max-w-md w-full border border-gray-100 dark:border-zinc-800 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Asset?</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete <span className="font-bold">{asset.asset_id}</span>? This action cannot be undone.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-lg font-bold text-sm hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm transition-all disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCard({ label, value, icon: Icon, valueColor }) {
  return (
    <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-gray-400" />
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {label}
        </p>
      </div>
      <p className={`text-sm font-bold ${valueColor || 'text-gray-900 dark:text-white'}`}>
        {value}
      </p>
    </div>
  );
}
