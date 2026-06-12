"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  FileText, Upload, Download, Eye, AlertCircle, 
  Trash2, Loader2, Calendar, File, CheckCircle2, ShieldCheck
} from "lucide-react";
import { employeeSelfService } from "../../lib/services/employeeSelfService";
import { useToast } from "../../components/Toast";
import { useCurrentUser } from "../../lib/hooks/useCurrentUser";

export default function EmployeeDocuments() {
  const { user } = useCurrentUser();
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState([]);

  // Uploader State
  const [selectedFile, setSelectedFile] = useState(null);
  const [docType, setDocType] = useState("passport");
  const [docName, setDocName] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const roleSlug = user?.role?.slug;
    const isEmployee = roleSlug === 'employee' || roleSlug === 'staff';
    if (user && isEmployee) {
      fetchDocuments();
    }
  }, [user]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const data = await employeeSelfService.getDocuments();
      setDocuments(Array.isArray(data) ? data : []);
    } catch (err) {
      showErrorToast(err.message || "Failed to load documents list");
    } finally {
      setLoading(false);
    }
  };

  // Drag Handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      // Auto fill name if blank
      if (!docName) {
        const baseName = file.name.split('.').slice(0, -1).join('.');
        setDocName(baseName);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Auto fill name if blank
      if (!docName) {
        const baseName = file.name.split('.').slice(0, -1).join('.');
        setDocName(baseName);
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      showErrorToast("Please select a file to upload");
      return;
    }

    setUploading(true);
    try {
      await employeeSelfService.uploadDocument(
        selectedFile,
        docType,
        docName || selectedFile.name
      );
      showSuccessToast("Document uploaded successfully!");
      setSelectedFile(null);
      setDocName("");
      fetchDocuments();
    } catch (err) {
      showErrorToast(err.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (docId, fileName) => {
    try {
      await employeeSelfService.downloadDocument(docId, fileName);
      showSuccessToast("Downloading document...");
    } catch (err) {
      showErrorToast("Failed to download document copy");
    }
  };

  const getDocTypeBadge = (type) => {
    const val = type?.toLowerCase();
    let style = "bg-gray-150 text-gray-700 dark:bg-zinc-800 dark:text-gray-300";
    if (val === "passport") style = "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 border border-blue-150 dark:border-blue-900/30";
    if (val === "visa") style = "bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400 border border-purple-150 dark:border-purple-900/30";
    if (val === "eid" || val === "emirates_id") style = "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-150 dark:border-green-900/30";
    if (val === "insurance") style = "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-150 dark:border-red-900/30";
    
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight ${style}`}>
        {type || "other"}
      </span>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Documents</h1>
        <p className="text-gray-500 text-sm">Upload or download official ID credentials, passport, visa and insurance records</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Upload Panel */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm h-fit space-y-4">
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-2">
            <Upload className="w-5 h-5 text-red-500" />
            Upload Document
          </h2>

          <form onSubmit={handleUpload} className="space-y-4">
            
            {/* Drag Area */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
              className={`
                border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2
                ${dragActive 
                  ? "border-red-500 bg-red-50/20" 
                  : "border-gray-200 hover:border-gray-300 dark:border-zinc-800 dark:hover:border-zinc-700 bg-gray-50/50 dark:bg-zinc-950/20"}
              `}
            >
              <input 
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
              
              {selectedFile ? (
                <>
                  <File className="w-10 h-10 text-red-500" />
                  <p className="text-xs font-bold text-gray-700 dark:text-zinc-300 truncate max-w-xs">{selectedFile.name}</p>
                  <p className="text-[10px] text-gray-400">{formatFileSize(selectedFile.size)}</p>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-400" />
                  <p className="text-xs font-bold text-gray-700 dark:text-zinc-300">Drag & drop your file here, or browse</p>
                  <p className="text-[10px] text-gray-400">PDF, PNG, JPG up to 10MB</p>
                </>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">Document Name</label>
              <input 
                type="text"
                placeholder="e.g. Visa copy 2026"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">Document Type</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20"
              >
                <option value="passport">Passport Copy</option>
                <option value="visa">Visa Copy</option>
                <option value="eid">Emirates ID Copy</option>
                <option value="insurance">Insurance Card</option>
                <option value="other">Other Document</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Uploading...</>
              ) : (
                "Upload Copy"
              )}
            </button>

          </form>

          <div className="pt-2 border-t border-gray-100 dark:border-zinc-800 flex items-start gap-2 text-[11px] text-gray-400 leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-green-500 shrink-0" />
            <span>Uploaded files are stored securely and only accessible by yourself and administration.</span>
          </div>

        </div>

        {/* Documents Grid / Table */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-6">Uploaded Document Files</h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : documents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {documents.map((doc) => (
                <div 
                  key={doc.id}
                  className="p-4 border border-gray-150 dark:border-zinc-800 rounded-xl hover:border-red-500/35 transition-all bg-gray-50/20 dark:bg-zinc-950/20 flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-red-50 dark:bg-zinc-850/50 text-red-500">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate" title={doc.document_name}>
                        {doc.document_name}
                      </p>
                      <div className="flex flex-wrap gap-1.5 items-center mt-1">
                        {getDocTypeBadge(doc.document_type)}
                        {doc.file_size && (
                          <span className="text-[10px] text-gray-400 font-medium">
                            {formatFileSize(doc.file_size)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-850/50 flex items-center justify-between">
                    <span className="text-[10px] text-gray-400">
                      Uploaded: {formatDate(doc.created_at || doc.upload_date)}
                    </span>
                    
                    <button
                      onClick={() => handleDownload(doc.id, doc.document_name)}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-850 rounded-lg text-gray-600 dark:text-zinc-300 transition-colors inline-flex items-center gap-1 text-xs font-bold"
                      title="Download file copy"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 dark:bg-zinc-950/20 border border-dashed border-gray-200 dark:border-zinc-850 rounded-xl">
              <File className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500">No documents uploaded yet.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
