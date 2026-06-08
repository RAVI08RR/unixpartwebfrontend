"use client";

import React, { useState, useEffect } from "react";
import { 
  Folder, 
  FileText, 
  ChevronRight, 
  Search,
  ChevronLeft,
  Home,
  Loader2,
  File,
  Image as ImageIcon,
  Download,
  BookOpen,
  CreditCard,
  ShieldCheck,
  Plane,
  ScrollText,
  HeartPulse,
  GraduationCap,
  Briefcase,
  MoreHorizontal
} from "lucide-react";
import { fileManagerService } from "@/app/lib/services/fileManagerService";
import { containerService } from "@/app/lib/services/containerService";
import { purchaseOrderService } from "@/app/lib/services/purchaseOrderService";
import { assetService } from "@/app/lib/services/assetService";
import { employeeService } from "@/app/lib/services/employeeService";

// Document type definitions for employees
const EMPLOYEE_DOCUMENT_TYPES = [
  { type: 'passport', name: 'Passport', icon: BookOpen, color: 'blue', bgLight: 'bg-blue-50', bgDark: 'dark:bg-blue-900/20', text: 'text-blue-500' },
  { type: 'eid_front', name: 'EID Front', icon: CreditCard, color: 'emerald', bgLight: 'bg-emerald-50', bgDark: 'dark:bg-emerald-900/20', text: 'text-emerald-500' },
  { type: 'eid_back', name: 'EID Back', icon: CreditCard, color: 'teal', bgLight: 'bg-teal-50', bgDark: 'dark:bg-teal-900/20', text: 'text-teal-500' },
  { type: 'visa', name: 'Visa', icon: Plane, color: 'violet', bgLight: 'bg-violet-50', bgDark: 'dark:bg-violet-900/20', text: 'text-violet-500' },
  { type: 'labour_contract', name: 'Labour Contract', icon: ScrollText, color: 'amber', bgLight: 'bg-amber-50', bgDark: 'dark:bg-amber-900/20', text: 'text-amber-500' },
  { type: 'insurance', name: 'Insurance', icon: HeartPulse, color: 'rose', bgLight: 'bg-rose-50', bgDark: 'dark:bg-rose-900/20', text: 'text-rose-500' },
  { type: 'education', name: 'Education', icon: GraduationCap, color: 'indigo', bgLight: 'bg-indigo-50', bgDark: 'dark:bg-indigo-900/20', text: 'text-indigo-500' },
  { type: 'experience', name: 'Experience', icon: Briefcase, color: 'orange', bgLight: 'bg-orange-50', bgDark: 'dark:bg-orange-900/20', text: 'text-orange-500' },
  { type: 'other', name: 'Other', icon: MoreHorizontal, color: 'gray', bgLight: 'bg-gray-50', bgDark: 'dark:bg-gray-900/20', text: 'text-gray-500' },
];

export default function FileManagerPage() {
  const [currentPath, setCurrentPath] = useState(null); // null means root
  const [currentFolderName, setCurrentFolderName] = useState("");
  
  const [rootFolders, setRootFolders] = useState([]);
  const [contents, setContents] = useState({ folders: [], documents: [] });
  
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Subfolder & Drilldown states
  const [selectedEntityId, setSelectedEntityId] = useState(null);
  const [selectedDocType, setSelectedDocType] = useState(null);
  
  const [entityTypeName, setEntityTypeName] = useState("");
  const [entityName, setEntityName] = useState("");
  const [docTypeName, setDocTypeName] = useState("");

  // Whether we are showing the document type folder grid for employees
  const isEmployeeDocTypeFolderView = currentPath === "employees" && selectedEntityId && !selectedDocType;

  // Fetch data when path, page, or search changes
  useEffect(() => {
    // Don't fetch from API if we're showing the local doc-type folder grid
    if (isEmployeeDocTypeFolderView) {
      setIsLoading(false);
      return;
    }
    fetchData();
  }, [currentPath, selectedEntityId, selectedDocType, page]);

  // Debounced search
  useEffect(() => {
    if (currentPath && !isEmployeeDocTypeFolderView) {
      const timer = setTimeout(() => {
        setPage(1); // Reset to first page on search
        fetchData();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (!currentPath) {
        // Fetch root folders
        const data = await fileManagerService.getRootFolders();
        setRootFolders(data);
      } else {
        // Fetch folder contents
        const data = await fileManagerService.getFolderContents(currentPath, {
          page,
          page_size: 50,
          search: searchQuery,
          entity_id: selectedEntityId,
          document_type: selectedDocType
        });
        setContents({
          folders: data.folders || [],
          documents: data.documents || []
        });
        setTotalPages(Math.ceil((data.total_documents + data.total_folders) / 50) || 1);
      }
    } catch (error) {
      console.error("Failed to fetch file manager data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFolderClick = (entityType, folderName) => {
    setCurrentPath(entityType);
    setEntityTypeName(folderName);
    setSelectedEntityId(null);
    setSelectedDocType(null);
    setSearchQuery("");
    setPage(1);
  };

  const handleSubfolderClick = (folder) => {
    if (!selectedEntityId) {
      // Clicking on an employee/entity — set entity ID
      setSelectedEntityId(folder.entity_id || folder.id);
      setEntityName(folder.name || `Folder #${folder.entity_id || folder.id}`);
      // For employees, doc type folders will be shown automatically (no API call needed)
      // For other types, continue with existing behavior
    } else if (!selectedDocType) {
      // For non-employee paths, this handles the old doc type drill-down
      setSelectedDocType(folder.document_type || folder.type || folder.name);
      setDocTypeName(folder.name || folder.document_type || folder.type);
    }
    setPage(1);
    setSearchQuery("");
  };

  const handleDocTypeFolderClick = (docTypeObj) => {
    setSelectedDocType(docTypeObj.type);
    setDocTypeName(docTypeObj.name);
    setPage(1);
    setSearchQuery("");
  };

  const handleHomeClick = () => {
    setCurrentPath(null);
    setSelectedEntityId(null);
    setSelectedDocType(null);
    setEntityTypeName("");
    setEntityName("");
    setDocTypeName("");
    setSearchQuery("");
    setPage(1);
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return <File className="w-8 h-8 text-blue-500" />;
    const ext = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
      return <ImageIcon className="w-8 h-8 text-purple-500" />;
    }
    if (['pdf'].includes(ext)) {
      return <FileText className="w-8 h-8 text-red-500" />;
    }
    return <File className="w-8 h-8 text-blue-500" />;
  };

  const handleDownload = async (doc) => {
    try {
      const entityId = selectedEntityId || doc.container_id || doc.po_id || doc.asset_id || doc.employee_id || doc.entity_id;
      if (!entityId) {
        if (doc.file_url) {
          window.open(doc.file_url, '_blank');
          return;
        }
        alert("Cannot download document: missing entity context.");
        return;
      }
      
      const documentId = doc.id;
      if (currentPath === "containers") {
        await containerService.downloadDocument(entityId, documentId);
      } else if (currentPath === "purchase-orders") {
        await purchaseOrderService.downloadDocument(entityId, documentId);
      } else if (currentPath === "assets") {
        await assetService.downloadDocument(entityId, documentId);
      } else if (currentPath === "employees") {
        await employeeService.downloadDocument(entityId, documentId);
      } else {
        if (doc.file_url) {
          window.open(doc.file_url, '_blank');
        } else {
          alert("Download not supported for this folder type.");
        }
      }
    } catch (error) {
      console.error("Failed to download document:", error);
      alert("Failed to download document: " + error.message);
    }
  };

  // Get the icon component for a doc type
  const getDocTypeInfo = (type) => {
    return EMPLOYEE_DOCUMENT_TYPES.find(dt => dt.type === type) || EMPLOYEE_DOCUMENT_TYPES[EMPLOYEE_DOCUMENT_TYPES.length - 1];
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header & Breadcrumbs */}
      <div className="bg-white dark:bg-zinc-900 rounded-[28px] border border-gray-100 dark:border-zinc-800 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide pb-2 md:pb-0">
            <button 
              onClick={handleHomeClick}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                !currentPath 
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 font-bold' 
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 font-medium'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>File Manager</span>
            </button>

            {currentPath && (
              <>
                <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                <button
                  onClick={() => {
                    setSelectedEntityId(null);
                    setSelectedDocType(null);
                    setPage(1);
                    setSearchQuery("");
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                    !selectedEntityId 
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 font-bold' 
                      : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 font-medium'
                  }`}
                >
                  <Folder className="w-4 h-4" />
                  <span>{entityTypeName || currentPath}</span>
                </button>
              </>
            )}

            {currentPath && selectedEntityId && (
              <>
                <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                <button
                  onClick={() => {
                    setSelectedDocType(null);
                    setPage(1);
                    setSearchQuery("");
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                    !selectedDocType 
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 font-bold' 
                      : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 font-medium'
                  }`}
                >
                  <Folder className="w-4 h-4" />
                  <span>{entityName || `ID: ${selectedEntityId}`}</span>
                </button>
              </>
            )}

            {currentPath && selectedEntityId && selectedDocType && (
              <>
                <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 font-bold">
                  {(() => {
                    const info = getDocTypeInfo(selectedDocType);
                    const IconComp = info.icon;
                    return <IconComp className="w-4 h-4" />;
                  })()}
                  <span>{docTypeName || selectedDocType}</span>
                </div>
              </>
            )}
          </div>

          {currentPath && !isEmployeeDocTypeFolderView && (
            <div className="relative w-full md:w-64 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
            <p className="font-medium">Loading files...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {!currentPath ? (
              /* Root Folders View */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {rootFolders.map((folder, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleFolderClick(folder.entity_type, folder.name)}
                    className="flex flex-col items-center text-center p-6 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group"
                  >
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Folder className="w-8 h-8 text-blue-500" fill="currentColor" fillOpacity={0.2} />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">
                      {folder.name}
                    </h3>
                    <p className="text-xs font-medium text-gray-500">
                      {folder.document_count} items
                    </p>
                  </button>
                ))}
                {rootFolders.length === 0 && (
                  <div className="col-span-full py-12 text-center text-gray-500">
                    No folders available or you don't have access.
                  </div>
                )}
              </div>
            ) : isEmployeeDocTypeFolderView ? (
              /* Employee Document Type Folders View */
              <div>
                <div className="mb-6 px-1">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Documents — {entityName}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Select a document type to view files
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {EMPLOYEE_DOCUMENT_TYPES.map((docType) => {
                    const IconComp = docType.icon;
                    return (
                      <button
                        key={docType.type}
                        onClick={() => handleDocTypeFolderClick(docType)}
                        className="flex flex-col items-center text-center p-5 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700 transition-all group"
                      >
                        <div className={`w-14 h-14 ${docType.bgLight} ${docType.bgDark} rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                          <IconComp className={`w-7 h-7 ${docType.text}`} />
                        </div>
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {docType.name}
                        </span>
                        <span className="text-[10px] uppercase font-semibold text-gray-400 mt-1 tracking-wide">
                          {docType.type.replace(/_/g, ' ')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Inside Folder View */
              <>
                {contents.folders.length === 0 && contents.documents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <Folder className="w-16 h-16 mb-4 opacity-20" />
                    <p className="font-medium">This folder is empty</p>
                    {searchQuery && (
                      <p className="text-sm mt-2">No results found for "{searchQuery}"</p>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {/* Sub Folders (if any are returned) */}
                    {contents.folders.map((folder, idx) => (
                      <button
                        key={`folder-${idx}`}
                        onClick={() => handleSubfolderClick(folder)}
                        className="flex flex-col items-center text-center p-4 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-sm hover:border-blue-300 transition-all group"
                      >
                        <Folder className="w-12 h-12 text-blue-400 mb-3" fill="currentColor" fillOpacity={0.2} />
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-200 line-clamp-2">
                          {folder.name || 'Unnamed Folder'}
                        </span>
                      </button>
                    ))}

                    {/* Documents */}
                    {contents.documents.map((doc, idx) => (
                      <div
                        key={`doc-${idx}`}
                        className="relative flex flex-col items-center text-center p-4 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-md transition-all group"
                      >
                        <div className="w-full flex justify-end absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDownload(doc); }}
                            className="p-1.5 bg-gray-100 dark:bg-zinc-800 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-600 dark:text-gray-300"
                            title="Download/Open"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="w-16 h-16 bg-gray-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center mb-3">
                          {getFileIcon(doc.file_name || doc.original_name)}
                        </div>
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-200 line-clamp-2 w-full px-2" title={doc.file_name || doc.original_name || 'Document'}>
                          {doc.file_name || doc.original_name || 'Document'}
                        </span>
                        {(doc.document_type || doc.type) && (
                          <span className="text-[10px] uppercase font-bold text-gray-400 mt-1">
                            {doc.document_type || doc.type}
                          </span>
                        )}
                        {doc.created_at && (
                          <span className="text-[10px] text-gray-400 mt-1">
                            {new Date(doc.created_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-6">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 rounded-lg border border-gray-200 dark:border-zinc-700 disabled:opacity-50"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-medium">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-2 rounded-lg border border-gray-200 dark:border-zinc-700 disabled:opacity-50"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
