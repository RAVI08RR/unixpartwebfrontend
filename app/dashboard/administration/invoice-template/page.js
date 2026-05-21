"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Upload, X } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/app/components/Toast";
import { apiClient } from "@/app/lib/api";

export default function InvoiceTemplatePage() {
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [formData, setFormData] = useState({
    logo_url: "",
    logo_file: null,
    company_name: "",
    company_address: "",
    contact_number_1: "",
    contact_number_2: "",
    contact_email: "",
    trn_number: "",
    invoice_header: "PROFORMA INVOICE",
    remarks_of_purchase: "All items verified by customer at time of purchase.",
    paper_size: "A4",
    orientation: "Portrait"
  });

  // Fetch existing template settings
  useEffect(() => {
    const fetchTemplate = async () => {
      setFetching(true);
      try {
        const data = await apiClient.get('/api/invoice-template');
        if (data) {
          setFormData({
            logo_url: data.logo_url || "",
            logo_file: null,
            company_name: data.company_name || "",
            company_address: data.company_address || "",
            contact_number_1: data.contact_number_1 || "",
            contact_number_2: data.contact_number_2 || "",
            contact_email: data.contact_email || "",
            trn_number: data.trn_number || "",
            invoice_header: data.invoice_header || "PROFORMA INVOICE",
            remarks_of_purchase: data.remarks_of_purchase || "All items verified by customer at time of purchase.",
            paper_size: data.paper_size || "A4",
            orientation: data.orientation || "Portrait"
          });
        }
      } catch (error) {
        console.error("Error fetching template:", error);
      } finally {
        setFetching(false);
      }
    };

    fetchTemplate();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showError("File size must be less than 2MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          logo_file: file,
          logo_url: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!formData.company_name || !formData.company_address) {
      showError("Please fill in required fields");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        logo_url: formData.logo_url,
        company_name: formData.company_name,
        company_address: formData.company_address,
        contact_number_1: formData.contact_number_1,
        contact_number_2: formData.contact_number_2,
        contact_email: formData.contact_email,
        trn_number: formData.trn_number,
        invoice_header: formData.invoice_header,
        remarks_of_purchase: formData.remarks_of_purchase,
        paper_size: formData.paper_size,
        orientation: formData.orientation
      };

      await apiClient.post('/api/invoice-template', payload);
      success("Invoice template updated successfully!");
    } catch (error) {
      showError("Failed to update template: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading template...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/administration/branches" 
          className="flex items-center justify-center w-10 h-10 rounded-[15px] bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 hover:shadow-lg transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-black dark:text-white tracking-tight">Edit Invoice Template</h1>
          <p className="text-gray-500 dark:text-zinc-500 text-sm font-medium">Customize the invoice header for your branch.</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-zinc-900 rounded-[15px] border border-gray-100 dark:border-zinc-800 shadow-sm p-6 space-y-6">
        {/* Logo */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Logo</label>
          <div className="flex gap-4 mb-4">
            <button
              type="button"
              className="px-4 py-2 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-lg font-semibold text-sm hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all"
            >
              URL
            </button>
            <label className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-semibold text-sm hover:opacity-90 transition-all cursor-pointer flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload
              <input
                type="file"
                accept="image/png,image/jpeg,image/gif,image/svg+xml"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
          
          {formData.logo_url && (
            <div className="relative inline-block">
              <img src={formData.logo_url} alt="Logo" className="h-20 object-contain border border-gray-200 dark:border-zinc-800 rounded-lg p-2" />
              <button
                onClick={() => setFormData({...formData, logo_url: "", logo_file: null})}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Max file size: 2MB. Supported formats: PNG, JPG, GIF, SVG.</p>
        </div>

        {/* Company Name */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Company Name *</label>
          <input
            type="text"
            value={formData.company_name}
            onChange={(e) => setFormData({...formData, company_name: e.target.value})}
            className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all"
            placeholder="Dubai Main Branch"
          />
        </div>

        {/* Company Address */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Company Address *</label>
          <textarea
            value={formData.company_address}
            onChange={(e) => setFormData({...formData, company_address: e.target.value})}
            rows={3}
            className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all"
            placeholder="PO Box 12345, Dubai, UAE"
          />
        </div>

        {/* Contact Numbers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Contact Number 1</label>
            <input
              type="text"
              value={formData.contact_number_1}
              onChange={(e) => setFormData({...formData, contact_number_1: e.target.value})}
              className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all"
              placeholder="+971 4 555 0101"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Contact Number 2</label>
            <input
              type="text"
              value={formData.contact_number_2}
              onChange={(e) => setFormData({...formData, contact_number_2: e.target.value})}
              className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all"
              placeholder="Optional"
            />
          </div>
        </div>

        {/* Contact Email */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Contact Email</label>
          <input
            type="email"
            value={formData.contact_email}
            onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
            className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all"
            placeholder="accounts@company.com"
          />
        </div>

        {/* TRN Number */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">TRN Number</label>
          <input
            type="text"
            value={formData.trn_number}
            onChange={(e) => setFormData({...formData, trn_number: e.target.value})}
            className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all"
            placeholder="100123456789012"
          />
        </div>

        {/* Invoice Header */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Invoice Header</label>
          <textarea
            value={formData.invoice_header}
            onChange={(e) => setFormData({...formData, invoice_header: e.target.value})}
            rows={2}
            className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all"
            placeholder="PROFORMA INVOICE"
          />
        </div>

        {/* Remarks of Purchase */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Remarks of Purchase</label>
          <textarea
            value={formData.remarks_of_purchase}
            onChange={(e) => setFormData({...formData, remarks_of_purchase: e.target.value})}
            rows={3}
            className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all"
            placeholder="All items verified by customer at time of purchase."
          />
        </div>

        {/* Paper Size and Orientation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Paper Size</label>
            <select
              value={formData.paper_size}
              onChange={(e) => setFormData({...formData, paper_size: e.target.value})}
              className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all"
            >
              <option value="A4">A4</option>
              <option value="Letter">Letter</option>
              <option value="Legal">Legal</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Orientation</label>
            <select
              value={formData.orientation}
              onChange={(e) => setFormData({...formData, orientation: e.target.value})}
              className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all"
            >
              <option value="Portrait">Portrait</option>
              <option value="Landscape">Landscape</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-lg font-semibold text-sm hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-all"
          >
            Preview Invoice Template
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
