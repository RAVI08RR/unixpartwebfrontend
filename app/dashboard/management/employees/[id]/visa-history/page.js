"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Plus, FileText, Calendar, AlertCircle } from "lucide-react";
import { employeeService } from "@/app/lib/services/employeeService";
import { useToast } from "@/app/components/Toast";

export default function VisaHistoryPage() {
  const params = useParams();
  const { success, error } = useToast();
  const [employee, setEmployee] = useState(null);
  const [visas, setVisas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    visa_number: "",
    visa_type: "",
    visa_status: "",
    issue_date: "",
    expiry_date: "",
    sponsor_name: "",
    notes: ""
  });

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [empData, visaData] = await Promise.all([
        employeeService.getById(params.id),
        employeeService.getVisaHistory(params.id)
      ]);
      setEmployee(empData);
      setVisas(Array.isArray(visaData) ? visaData : []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      error('Failed to load visa history');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await employeeService.addVisa(params.id, formData);
      success('Visa record added successfully');
      setShowAddModal(false);
      setFormData({
        visa_number: "",
        visa_type: "",
        visa_status: "",
        issue_date: "",
        expiry_date: "",
        sponsor_name: "",
        notes: ""
      });
      fetchData();
    } catch (err) {
      error('Failed to add visa: ' + err.message);
    }
  };

  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading visa history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/management/employees"
            className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Visa History
            </h1>
            <p className="text-sm text-gray-500">
              {employee?.first_name} {employee?.last_name} - {employee?.employee_id}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Visa Record
        </button>
      </div>

      {/* Current Visa Card */}
      {employee && (
        <div className="bg-gradient-to-r from-red-500 to-rose-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Current Visa Status</p>
              <h2 className="text-3xl font-bold mt-1">{employee.visa_status || 'N/A'}</h2>
              <p className="text-sm opacity-90 mt-2">
                Visa Number: {employee.visa_number || 'N/A'} | Type: {employee.visa_type || 'N/A'}
              </p>
              {employee.visa_expiry && (
                <p className="text-sm opacity-90 mt-1">
                  Expires: {employee.visa_expiry}
                </p>
              )}
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8" />
            </div>
          </div>
        </div>
      )}

      {/* Visa History Timeline */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-6">
        <h3 className="text-lg font-semibold mb-6">Visa Records</h3>
        {visas.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No visa history found
          </div>
        ) : (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-zinc-700"></div>
            
            <div className="space-y-8">
              {visas.map((visa, index) => (
                <div key={visa.id} className="relative flex gap-6">
                  {/* Timeline Dot */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center border-4 border-white dark:border-zinc-900">
                      <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                  
                  {/* Content Card */}
                  <div className="flex-1 bg-gray-50 dark:bg-zinc-800 rounded-lg p-4 -mt-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-lg text-gray-900 dark:text-white">
                          {visa.visa_number}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Type: {visa.visa_type} | Status: {visa.visa_status}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        {index === 0 && (
                          <span className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 text-xs font-medium rounded-full">
                            Current
                          </span>
                        )}
                        {isExpired(visa.expiry_date) && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 text-xs font-medium rounded-full flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Expired
                          </span>
                        )}
                        {isExpiringSoon(visa.expiry_date) && !isExpired(visa.expiry_date) && (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 text-xs font-medium rounded-full flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Expiring Soon
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {visa.sponsor_name && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Sponsor: {visa.sponsor_name}
                      </p>
                    )}

                    <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-zinc-700 pt-3">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-red-500" />
                        <span className="font-medium">Issue:</span>
                        <span>{visa.issue_date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium">Expiry:</span>
                        <span>{visa.expiry_date}</span>
                      </div>
                    </div>
                    
                    {visa.notes && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 p-2 bg-gray-100 dark:bg-zinc-700 rounded">
                        {visa.notes}
                      </p>
                    )}
                    
                    {visa.created_at && (
                      <p className="text-xs text-gray-400 mt-2">
                        Created: {new Date(visa.created_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Visa Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Add Visa Record</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Visa Number *</label>
                <input
                  type="text"
                  required
                  value={formData.visa_number}
                  onChange={(e) => setFormData({...formData, visa_number: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800"
                  placeholder="e.g., 201/2024/1234567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Visa Type *</label>
                <select
                  required
                  value={formData.visa_type}
                  onChange={(e) => setFormData({...formData, visa_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800"
                >
                  <option value="">Select type</option>
                  <option value="employment">Employment</option>
                  <option value="residence">Residence</option>
                  <option value="visit">Visit</option>
                  <option value="mission">Mission</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Visa Status *</label>
                <select
                  required
                  value={formData.visa_status}
                  onChange={(e) => setFormData({...formData, visa_status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800"
                >
                  <option value="">Select status</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="under_process">Under Process</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Issue Date *</label>
                <input
                  type="date"
                  required
                  value={formData.issue_date}
                  onChange={(e) => setFormData({...formData, issue_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Expiry Date *</label>
                <input
                  type="date"
                  required
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sponsor Name</label>
                <input
                  type="text"
                  value={formData.sponsor_name}
                  onChange={(e) => setFormData({...formData, sponsor_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800"
                  placeholder="Company or individual name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800"
                  rows="3"
                  placeholder="Additional information"
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-zinc-800 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Add Visa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
