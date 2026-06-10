"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Calendar, Upload, FileText, X } from "lucide-react";
import { leaveService } from "@/app/lib/services/leaveService";
import { employeeService } from "@/app/lib/services/employeeService";
import { useToast } from "@/app/components/Toast";

import ProtectedRoute from "@/app/components/ProtectedRoute";
import { PERMISSIONS } from "@/app/lib/constants/permissions";

export default function SubmitLeavePage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);

  const [formData, setFormData] = useState({
    employee_id: "",
    leave_type: "annual",
    start_date: "",
    end_date: "",
    total_days: 1,
    reason: "",
    proof_documents: [],
  });

  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).map(file => ({
      file,
      type: "medical"
    }));
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileTypeChange = (index, type) => {
    setSelectedFiles(prev => {
      const newFiles = [...prev];
      newFiles[index].type = type;
      return newFiles;
    });
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const data = await employeeService.getAll();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let uploadedPaths = [];
      if (selectedFiles.length > 0) {
        if (!formData.employee_id) {
          throw new Error("Please select an employee first");
        }
        for (const fileObj of selectedFiles) {
          console.log("Uploading file:", fileObj.file.name, "Type:", fileObj.type);
          const res = await employeeService.uploadDocument(
            formData.employee_id,
            fileObj.file,
            fileObj.type,
            fileObj.file.name
          );
          console.log("Upload response:", res);
          // Try to get any path or ID from the response
          const path = res.document_path || res.file_path || res.path || res.file_url || res.url || (res.id ? res.id.toString() : null);
          
          if (path) {
            uploadedPaths.push(path);
          } else {
            // Fallback: if we got a success response but no path, push the filename
            console.warn("Could not extract path from response, using filename as fallback");
            uploadedPaths.push(fileObj.file.name);
          }
        }
      }

      const payload = {
        employee_id: parseInt(formData.employee_id),
        leave_type: formData.leave_type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        total_days: parseInt(formData.total_days) || 1,
        reason: formData.reason,
        proof_documents: uploadedPaths,
      };

      console.log("Submitting payload:", payload);
      await leaveService.submit(payload);
      success("Leave request submitted successfully!");
      router.push("/dashboard/management/leaves");
    } catch (err) {
      error(err.message || "Failed to submit leave request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute permission={PERMISSIONS.LEAVES.CREATE}>
      <div className="space-y-8 pb-12">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/management/leaves" className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Submit Leave Request</h1>
            <p className="text-gray-500 text-sm">Request time off for an employee</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Leave Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Employee <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.employee_id}
                  onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name} - {emp.employee_id}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Leave Type <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.leave_type}
                  onChange={(e) => setFormData({...formData, leave_type: e.target.value})}
                  required
                >
                  <option value="annual">Annual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="emergency">Emergency Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                  <option value="maternity">Maternity Leave</option>
                  <option value="paternity">Paternity Leave</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  End Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Total Days <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Number of days"
                  className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.total_days}
                  onChange={(e) => setFormData({...formData, total_days: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows="4"
                  placeholder="Explain the reason for leave..."
                  className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  required
                />
              </div>
            </div>
          </div>

          {/* Proof Documents Section */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Proof Documents</h2>
            
            <div className="space-y-4">
              <div>
                <label className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 dark:bg-zinc-800 border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-700 transition-all">
                  <Upload className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-bold text-gray-600 dark:text-gray-300">Choose Files to Upload</span>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Files to upload</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedFiles.map((fileObj, idx) => (
                      <div key={idx} className="flex flex-col gap-2 p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-100 dark:border-zinc-800">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300 truncate">{fileObj.file.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(idx)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <select
                          value={fileObj.type}
                          onChange={(e) => handleFileTypeChange(idx, e.target.value)}
                          className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="medical">Medical</option>
                          <option value="travel">Travel</option>
                          <option value="leave_proof">Other Leave Proof</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Submit Leave Request
                </>
              )}
            </button>
            <Link
              href="/dashboard/management/leaves"
              className="px-6 py-2.5 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-lg font-bold text-sm hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
