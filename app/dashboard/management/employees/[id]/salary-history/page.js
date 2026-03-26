"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Plus, DollarSign, Calendar } from "lucide-react";
import { employeeService } from "@/app/lib/services/employeeService";
import { useToast } from "@/app/components/Toast";

export default function SalaryHistoryPage() {
  const params = useParams();
  const { success, error } = useToast();
  const [employee, setEmployee] = useState(null);
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    salary_amount: "",
    effective_from: "",
    effective_to: "",
    reason: ""
  });

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [empData, salaryData] = await Promise.all([
        employeeService.getById(params.id),
        employeeService.getSalaryHistory(params.id)
      ]);
      setEmployee(empData);
      setSalaries(Array.isArray(salaryData) ? salaryData : []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      error('Failed to load salary history');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await employeeService.addSalary(params.id, formData);
      success('Salary record added successfully');
      setShowAddModal(false);
      setFormData({
        salary_amount: "",
        effective_from: "",
        effective_to: "",
        reason: ""
      });
      fetchData();
    } catch (err) {
      error('Failed to add salary: ' + err.message);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>;
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
              Salary History
            </h1>
            <p className="text-sm text-gray-500">
              {employee?.first_name} {employee?.last_name} - {employee?.employee_id}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Salary Record
        </button>
      </div>

      {/* Current Salary Card */}
      {employee && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Current Salary</p>
              <h2 className="text-3xl font-bold mt-1">AED {employee.current_salary}</h2>
              <p className="text-sm opacity-90 mt-2">Starting Salary: AED {employee.starting_salary}</p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <DollarSign className="w-8 h-8" />
            </div>
          </div>
        </div>
      )}

      {/* Salary History Timeline */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-6">
        <h3 className="text-lg font-semibold mb-4">Salary Changes</h3>
        {salaries.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No salary history found
          </div>
        ) : (
          <div className="space-y-4">
            {salaries.map((salary, index) => (
              <div
                key={salary.id}
                className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg"
              >
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-lg text-gray-900 dark:text-white">
                        AED {salary.salary_amount}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {salary.reason || 'No reason provided'}
                      </p>
                    </div>
                    {index === 0 && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-xs rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>From: {salary.effective_from}</span>
                    </div>
                    {salary.effective_to && (
                      <div className="flex items-center gap-1">
                        <span>To: {salary.effective_to}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Created: {new Date(salary.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Salary Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Add Salary Record</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Salary Amount (AED) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.salary_amount}
                  onChange={(e) => setFormData({...formData, salary_amount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800"
                  placeholder="30000.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Effective From *</label>
                <input
                  type="date"
                  required
                  value={formData.effective_from}
                  onChange={(e) => setFormData({...formData, effective_from: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Effective To</label>
                <input
                  type="date"
                  value={formData.effective_to}
                  onChange={(e) => setFormData({...formData, effective_to: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reason *</label>
                <textarea
                  required
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800"
                  rows="3"
                  placeholder="e.g., Annual increment, Promotion, Performance bonus"
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Salary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
