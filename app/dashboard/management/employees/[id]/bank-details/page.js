"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CreditCard, Save, Plus, Building2, Hash, MapPin } from "lucide-react";
import { employeeService } from "@/app/lib/services/employeeService";
import { useToast } from "@/app/components/Toast";

export default function BankDetailsPage() {
  const params = useParams();
  const { success, error } = useToast();
  const [employee, setEmployee] = useState(null);
  const [bankDetails, setBankDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    account_name: "",
    account_number: "",
    iban_number: "",
    bank_name: "",
    bank_address: "",
    routing_code: "",
    swift_code: ""
  });

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [empData, bankData] = await Promise.all([
        employeeService.getById(params.id),
        employeeService.getBankDetails(params.id)
      ]);
      setEmployee(empData);
      setBankDetails(Array.isArray(bankData) ? bankData : (bankData ? [bankData] : []));
    } catch (err) {
      console.error('Failed to fetch data:', err);
      error('Failed to load bank details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await employeeService.createOrUpdateBankDetails(params.id, formData);
      success('Bank details saved successfully');
      setShowModal(false);
      setFormData({
        account_name: "",
        account_number: "",
        iban_number: "",
        bank_name: "",
        bank_address: "",
        routing_code: "",
        swift_code: ""
      });
      fetchData();
    } catch (err) {
      error('Failed to save bank details: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading bank details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
              Bank Details
            </h1>
            <p className="text-sm text-gray-500">
              {employee?.first_name} {employee?.last_name} - {employee?.employee_id}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Bank Account
        </button>
      </div>

      <div className="bg-gradient-to-r from-red-500 to-rose-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <CreditCard className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm opacity-90">Banking Information</p>
              <h2 className="text-2xl font-bold mt-1">
                {bankDetails.length} Account{bankDetails.length !== 1 ? 's' : ''}
              </h2>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-6">
        <h3 className="text-lg font-semibold mb-4">Bank Accounts ({bankDetails.length})</h3>
        {bankDetails.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500">No bank accounts added yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bankDetails.map((bank, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-zinc-700 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {bank.bank_name || 'Bank Name'}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {bank.account_name || 'Account Holder'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Hash className="w-4 h-4 text-red-500" />
                    <span className="font-medium">Account:</span>
                    <span>{bank.account_number || 'N/A'}</span>
                  </div>

                  {bank.iban_number && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Hash className="w-4 h-4 text-red-500" />
                      <span className="font-medium">IBAN:</span>
                      <span className="font-mono text-xs">{bank.iban_number}</span>
                    </div>
                  )}

                  {bank.swift_code && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Hash className="w-4 h-4 text-red-500" />
                      <span className="font-medium">SWIFT:</span>
                      <span>{bank.swift_code}</span>
                    </div>
                  )}

                  {bank.routing_code && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Hash className="w-4 h-4 text-red-500" />
                      <span className="font-medium">Routing:</span>
                      <span>{bank.routing_code}</span>
                    </div>
                  )}

                  {bank.bank_address && (
                    <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-zinc-700">
                      <MapPin className="w-4 h-4 text-red-500 mt-0.5" />
                      <span className="text-xs">{bank.bank_address}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Important Notes:</h4>
        <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1 list-disc list-inside">
          <li>Ensure all bank details are accurate for salary transfers</li>
          <li>IBAN format should be correct for international transfers</li>
          <li>Contact HR if you need to update your bank account</li>
        </ul>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Add Bank Account</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Account Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.account_name}
                    onChange={(e) => setFormData({...formData, account_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800"
                    placeholder="Account holder name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Bank Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.bank_name}
                    onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800"
                    placeholder="e.g., Emirates NBD"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Account Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.account_number}
                    onChange={(e) => setFormData({...formData, account_number: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800"
                    placeholder="Account number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">IBAN Number</label>
                  <input
                    type="text"
                    value={formData.iban_number}
                    onChange={(e) => setFormData({...formData, iban_number: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800"
                    placeholder="AE07 0331 2345 6789 0123 456"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">SWIFT Code</label>
                  <input
                    type="text"
                    value={formData.swift_code}
                    onChange={(e) => setFormData({...formData, swift_code: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800"
                    placeholder="e.g., EBILAEAD"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Routing Code</label>
                  <input
                    type="text"
                    value={formData.routing_code}
                    onChange={(e) => setFormData({...formData, routing_code: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800"
                    placeholder="Routing/Sort code"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Bank Address</label>
                <textarea
                  value={formData.bank_address}
                  onChange={(e) => setFormData({...formData, bank_address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800"
                  rows="2"
                  placeholder="Bank branch address"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                  className="px-4 py-2 bg-gray-100 dark:bg-zinc-800 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Bank Details
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
