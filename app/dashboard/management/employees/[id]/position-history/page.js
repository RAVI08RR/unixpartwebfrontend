"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Plus, Briefcase, Calendar, Building2, MapPin } from "lucide-react";
import { employeeService } from "@/app/lib/services/employeeService";
import { useToast } from "@/app/components/Toast";

export default function PositionHistoryPage() {
  const params = useParams();
  const { success, error } = useToast();
  const [employee, setEmployee] = useState(null);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    actual_position: "",
    visa_position: "",
    company_on_visa: "",
    branch_on_visa_id: "",
    current_branch_id: "",
    start_date: "",
    end_date: ""
  });

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [empData, posData] = await Promise.all([
        employeeService.getById(params.id),
        employeeService.getPositionHistory(params.id)
      ]);
      setEmployee(empData);
      setPositions(Array.isArray(posData) ? posData : []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      error('Failed to load position history');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await employeeService.addPosition(params.id, formData);
      success('Position record added successfully');
      setShowAddModal(false);
      setFormData({
        actual_position: "",
        visa_position: "",
        company_on_visa: "",
        branch_on_visa_id: "",
        current_branch_id: "",
        start_date: "",
        end_date: ""
      });
      fetchData();
    } catch (err) {
      error('Failed to add position: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading position history...</p>
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
              Position History
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
          Add Position
        </button>
      </div>

      {/* Current Position Card */}
      {employee && (
        <div className="bg-gradient-to-r from-red-500 to-rose-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Current Position</p>
              <h2 className="text-3xl font-bold mt-1">{employee.actual_position || 'N/A'}</h2>
              <p className="text-sm opacity-90 mt-2">Visa Position: {employee.visa_position || 'N/A'}</p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Briefcase className="w-8 h-8" />
            </div>
          </div>
        </div>
      )}

      {/* Position History Timeline */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-6">
        <h3 className="text-lg font-semibold mb-6">Position Changes</h3>
        {positions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No position history found
          </div>
        ) : (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-zinc-700"></div>
            
            <div className="space-y-8">
              {positions.map((position, index) => (
                <div key={position.id} className="relative flex gap-6">
                  {/* Timeline Dot */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center border-4 border-white dark:border-zinc-900">
                      <Briefcase className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                  
                  {/* Content Card */}
                  <div className="flex-1 bg-gray-50 dark:bg-zinc-800 rounded-lg p-4 -mt-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-lg text-gray-900 dark:text-white">
                          {position.actual_position}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Visa Position: {position.visa_position}
                        </p>
                      </div>
                      {index === 0 && !position.end_date && (
                        <span className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 text-xs font-medium rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      {position.current_branch && (
                        <div className="flex items-start gap-2">
                          <Building2 className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Current Branch</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {position.current_branch.branch_name}
                            </p>
                            <p className="text-xs text-gray-500">{position.current_branch.branch_code}</p>
                          </div>
                        </div>
                      )}
                      
                      {position.branch_on_visa && (
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Branch on Visa</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {position.branch_on_visa.branch_name}
                            </p>
                            <p className="text-xs text-gray-500">{position.branch_on_visa.branch_code}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-zinc-700 pt-3">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-red-500" />
                        <span className="font-medium">From:</span>
                        <span>{position.start_date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium">To:</span>
                        <span>{position.end_date || 'Present'}</span>
                      </div>
                    </div>
                    
                    {position.company_on_visa && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Company on Visa: {position.company_on_visa}
                      </p>
                    )}
                    
                    <p className="text-xs text-gray-400 mt-2">
                      Created: {new Date(position.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Position Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Add Position Record</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Actual Position *</label>
                <input
                  type="text"
                  required
                  value={formData.actual_position}
                  onChange={(e) => setFormData({...formData, actual_position: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800"
                  placeholder="e.g., Software Developer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Visa Position *</label>
                <input
                  type="text"
                  required
                  value={formData.visa_position}
                  onChange={(e) => setFormData({...formData, visa_position: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800"
                  placeholder="e.g., IT Specialist"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Company on Visa</label>
                <input
                  type="text"
                  value={formData.company_on_visa}
                  onChange={(e) => setFormData({...formData, company_on_visa: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800"
                  placeholder="Company name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Branch on Visa ID</label>
                <input
                  type="number"
                  value={formData.branch_on_visa_id}
                  onChange={(e) => setFormData({...formData, branch_on_visa_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800"
                  placeholder="Branch ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Current Branch ID</label>
                <input
                  type="number"
                  value={formData.current_branch_id}
                  onChange={(e) => setFormData({...formData, current_branch_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800"
                  placeholder="Branch ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Start Date *</label>
                <input
                  type="date"
                  required
                  value={formData.start_date}
                  onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty if this is the current position</p>
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
                  Add Position
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
