"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Users, Plus, Search, Edit, Trash2, Eye, Loader2, 
  Mail, Phone, Briefcase, Calendar, Filter
} from "lucide-react";
import { employeeService } from "@/app/lib/services/employeeService";
import { useToast } from "@/app/components/Toast";

export default function EmployeesPage() {
  const { success, error } = useToast();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const data = await employeeService.getAll();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      // Check if it's an authentication error
      if (err.message?.includes('authenticated') || err.message?.includes('session has expired')) {
        error("Your session has expired. Please log in again.");
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        error("Failed to load employees");
      }
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!employeeToDelete) return;
    
    setDeleting(true);
    try {
      await employeeService.delete(employeeToDelete.id);
      success("Employee deleted successfully!");
      setDeleteModalOpen(false);
      setEmployeeToDelete(null);
      fetchEmployees();
    } catch (err) {
      error(err.message || "Failed to delete employee");
    } finally {
      setDeleting(false);
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.personal_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.work_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.actual_position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.nationality?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-sm text-gray-500">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employees</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your organization's employees
          </p>
        </div>
        <Link
          href="/dashboard/management/employees/add"
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Add Employee
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search employees by name, email, code, or position..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{employees.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {employees.filter(e => e.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Inactive</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {employees.filter(e => e.status !== 'active').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
        {filteredEmployees.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Branch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Visa Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                            {employee.first_name?.[0]}{employee.last_name?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {employee.first_name} {employee.last_name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {employee.work_email || employee.personal_email || 'No email'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {employee.employee_id || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {employee.actual_position || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {employee.current_branch?.branch_name || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        employee.visa_type === 'company'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                          : employee.visa_type === 'third_party'
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}>
                        {employee.visa_type === 'company' ? 'Company' : employee.visa_type === 'third_party' ? 'Third Party' : 'Nil'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        employee.status === 'active'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          employee.status === 'active' ? 'bg-green-600 dark:bg-green-400' : 'bg-gray-600 dark:bg-gray-400'
                        }`}></span>
                        {employee.status || 'inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setViewModalOpen(true);
                          }}
                          className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors group"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                        </button>
                        <Link
                          href={`/dashboard/management/employees/edit/${employee.id}`}
                          className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors group"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                        </Link>
                        <button
                          onClick={() => {
                            setEmployeeToDelete(employee);
                            setDeleteModalOpen(true);
                          }}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              {searchTerm ? "No employees found matching your search" : "No employees added yet"}
            </p>
            {!searchTerm && (
              <Link
                href="/dashboard/management/employees/add"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                Add First Employee
              </Link>
            )}
          </div>
        )}
      </div>

      {/* View Employee Modal */}
      {viewModalOpen && selectedEmployee && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-3xl shadow-2xl my-8">
            <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {selectedEmployee.first_name?.[0]}{selectedEmployee.last_name?.[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedEmployee.first_name} {selectedEmployee.last_name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedEmployee.employee_id}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setViewModalOpen(false);
                    setSelectedEmployee(null);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Personal Information */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Personal Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Nationality</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedEmployee.nationality || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Mobile Number</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedEmployee.mobile_number || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Personal Email</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedEmployee.personal_email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Work Email</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedEmployee.work_email || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Emergency Contact</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedEmployee.emergency_contact || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Employment Information */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Employment Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Position</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedEmployee.actual_position || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Current Branch</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedEmployee.current_branch?.branch_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Position Start Date</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedEmployee.position_start_date || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                      selectedEmployee.status === 'active'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}>
                      {selectedEmployee.status || 'inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Visa & Passport Information */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Visa & Passport Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Passport Number</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedEmployee.passport_number || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Passport Expiry</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedEmployee.passport_expiry || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Visa Number</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedEmployee.visa_number || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Visa Expiry</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedEmployee.visa_expiry || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Visa Type</p>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                      selectedEmployee.visa_type === 'company'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        : selectedEmployee.visa_type === 'third_party'
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}>
                      {selectedEmployee.visa_type === 'company' ? 'Company' : selectedEmployee.visa_type === 'third_party' ? 'Third Party' : 'Nil'}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Visa Status</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedEmployee.visa_status || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Visa Position</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedEmployee.visa_position || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Branch on Visa</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedEmployee.branch_on_visa?.branch_name || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Emirates ID Information */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Emirates ID Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">EID Number</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedEmployee.eid_number || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">EID Expiry</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedEmployee.eid_expiry || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Salary & Benefits */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Salary & Benefits</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Starting Salary</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">AED {selectedEmployee.starting_salary || '0.00'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Current Salary</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">AED {selectedEmployee.current_salary || '0.00'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Annual Leave Entitlement</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedEmployee.annual_leave_entitlement || 30} days</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Insurance Policy</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedEmployee.insurance_policy_number || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Insurance Expiry</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedEmployee.insurance_expiry || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setViewModalOpen(false);
                  setSelectedEmployee(null);
                }}
                className="px-4 py-2.5 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-lg font-bold text-sm hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all"
              >
                Close
              </button>
              <Link
                href={`/dashboard/management/employees/edit/${selectedEmployee.id}`}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-all flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Employee
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Employee</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete <span className="font-bold">{employeeToDelete?.first_name} {employeeToDelete?.last_name}</span>? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setEmployeeToDelete(null);
                }}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-lg font-bold text-sm hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm transition-all disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
