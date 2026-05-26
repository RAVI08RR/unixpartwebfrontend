"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Search, Filter, Download, Plus, MoreVertical,
  UserCheck, Mail, Phone, Building2, Calendar,
  Edit, Trash2, Eye, FileText, CreditCard, Briefcase, X, DollarSign,
  ChevronLeft, ChevronRight
} from "lucide-react";
import { employeeService } from "@/app/lib/services/employeeService";
import { useToast } from "@/app/components/Toast";
import { usePermission } from "@/app/lib/hooks/usePermission";
import { PERMISSIONS } from "@/app/lib/constants/permissions";
import { PermissionAlert } from "@/app/components/PermissionAlert";
import ExportButton from "@/app/components/ExportButton";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [permissionAlert, setPermissionAlert] = useState({ isOpen: false, action: '', resource: '' });
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  const { success, error } = useToast();
  const { hasPermission } = usePermission();
  const itemsPerPage = 6;

  // Fetch employees
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getAll(0, 100);
      // API returns array directly
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
      error('Failed to load employees');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter employees
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const fullName = `${emp.first_name || ''} ${emp.last_name || ''}`.trim();
      const searchTarget = `${fullName} ${emp.work_email || ''} ${emp.employee_id || ''}`.toLowerCase();
      const matchesSearch = searchTarget.includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "All" || emp.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [employees, searchQuery, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = async () => {
    if (!selectedEmployee) return;
    
    if (!hasPermission(PERMISSIONS.EMPLOYEES.DELETE)) {
      setPermissionAlert({
        isOpen: true,
        action: 'delete',
        resource: 'employees'
      });
      setDeleteModalOpen(false);
      return;
    }

    try {
      await employeeService.delete(selectedEmployee.id);
      success('Employee deleted successfully');
      setDeleteModalOpen(false);
      setSelectedEmployee(null);
      fetchEmployees();
    } catch (err) {
      error('Failed to delete employee: ' + err.message);
    }
  };

  const handleAddClick = () => {
    if (!hasPermission(PERMISSIONS.EMPLOYEES.CREATE)) {
      setPermissionAlert({
        isOpen: true,
        action: 'create',
        resource: 'employees'
      });
      return;
    }
    window.location.href = '/dashboard/management/employees/add';
  };

  const handleViewEmployee = async (employee) => {
    setSelectedEmployee(employee);
    setViewModalOpen(true);
    setActiveTab('personal');
    setLoadingDetails(true);
    
    try {
      // Fetch additional details if needed
      const details = await employeeService.getById(employee.id);
      setEmployeeDetails(details);
    } catch (err) {
      console.error('Failed to fetch employee details:', err);
      setEmployeeDetails(employee);
    } finally {
      setLoadingDetails(false);
    }
  };

  const exportColumns = [
    { key: 'employee_id', label: 'Employee ID' },
    { 
      key: 'name', 
      label: 'Name', 
      formatter: (val, row) => `${row.first_name || ''} ${row.last_name || ''}`.trim() 
    },
    { key: 'work_email', label: 'Work Email' },
    { key: 'personal_email', label: 'Personal Email' },
    { key: 'mobile_number', label: 'Mobile Number' },
    { key: 'actual_position', label: 'Position' },
    { 
      key: 'current_branch', 
      label: 'Branch', 
      formatter: (val, row) => row.current_branch?.branch_name || 'N/A' 
    },
    { key: 'visa_status', label: 'Visa Status' },
    { key: 'visa_type', label: 'Visa Type' },
    { key: 'status', label: 'Status' }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 dark:text-zinc-500 font-black text-xs uppercase tracking-[0.2em]">Loading Employees...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-12 animate-in fade-in duration-500 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black dark:text-white tracking-tight">Employees</h1>
            <ExportButton
              data={filteredEmployees}
              columns={exportColumns}
              filename={`employees-${new Date().toISOString().split('T')[0]}`}
              onSuccess={(format) => success(`Employees exported successfully as ${format}!`)}
              onError={(err) => error(`Export failed: ${err.message}`)}
            />
          </div>
          <p className="text-gray-400 dark:text-zinc-500 text-sm font-normal">Manage employee information and records</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleAddClick}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm shadow-xl shadow-black/10 hover:opacity-90 active:scale-95 transition-all w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span className="whitespace-nowrap font-black">Add Employee</span>
          </button>
        </div>
      </div>

      {/* Filters Section Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-gray-100 dark:border-zinc-800/80 shadow-sm p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Filters</h2>
          <p className="text-xs text-gray-400 dark:text-zinc-500 font-medium">Refine the employees list below.</p>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees by name, email, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-zinc-800/40 border border-gray-200/50 dark:border-zinc-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500/30 dark:focus:ring-blue-500/20 transition-all placeholder-gray-400 dark:placeholder-zinc-500 text-gray-900 dark:text-white"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800/40 border border-gray-200/50 dark:border-zinc-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all text-gray-900 dark:text-white"
          >
            <option value="All">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-gray-100 dark:border-zinc-800/80 shadow-sm overflow-hidden w-full max-w-full">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50 dark:border-zinc-800/50">
                <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Employee</th>
                <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Contact</th>
                <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Position</th>
                <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Branch</th>
                <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Visa Status</th>
                <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Status</th>
                <th className="px-6 py-4 text-right text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/50">
              {paginatedEmployees.length > 0 ? (
                paginatedEmployees.map((employee) => {
                  const fullName = `${employee.first_name || ''} ${employee.last_name || ''}`.trim();
                  return (
                    <tr key={employee.id} className="group transition-all hover:bg-gray-50/50 dark:hover:bg-zinc-800/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center border-2 border-white dark:border-zinc-800 shadow-sm">
                            <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors leading-tight">
                              {fullName || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-400 dark:text-zinc-500 font-medium">
                              {employee.employee_id || 'No ID'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-700 dark:text-zinc-300">
                          {employee.work_email || employee.personal_email || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-zinc-500 font-medium">
                          {employee.mobile_number || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-700 dark:text-zinc-300">
                          {employee.actual_position || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-zinc-500 font-medium">
                          Visa: {employee.visa_position || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-700 dark:text-zinc-300">
                          {employee.current_branch?.branch_name || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-zinc-500 font-medium">
                          {employee.current_branch?.branch_code || ''}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-700 dark:text-zinc-300">
                          {employee.visa_status || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-zinc-500 font-medium">
                          {employee.visa_type || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg ${
                          employee.status === 'active' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                        }`}>
                          {employee.status || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleViewEmployee(employee)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-all animate-in fade-in"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
                          </button>
                          <Link
                            href={`/dashboard/management/employees/edit/${employee.id}`}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
                          </Link>
                          
                          {/* More Actions Dropdown */}
                          <div className="relative">
                            <button
                              onClick={() => setMenuOpenId(menuOpenId === employee.id ? null : employee.id)}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
                              title="More Actions"
                            >
                              <MoreVertical className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
                            </button>
                            
                            {menuOpenId === employee.id && (
                              <>
                                <div 
                                  className="fixed inset-0 z-10" 
                                  onClick={() => setMenuOpenId(null)}
                                />
                                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800 z-20 py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                                  <Link
                                    href={`/dashboard/management/employees/${employee.id}/position-history`}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
                                  >
                                    <Briefcase className="w-4 h-4 text-gray-400" />
                                    Position History
                                  </Link>
                                  <Link
                                    href={`/dashboard/management/employees/${employee.id}/salary-history`}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
                                  >
                                    <DollarSign className="w-4 h-4 text-gray-400" />
                                    Salary History
                                  </Link>
                                  <Link
                                    href={`/dashboard/management/employees/${employee.id}/visa-history`}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
                                  >
                                    <FileText className="w-4 h-4 text-gray-400" />
                                    Visa History
                                  </Link>
                                  <Link
                                    href={`/dashboard/management/employees/${employee.id}/documents`}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
                                  >
                                    <FileText className="w-4 h-4 text-gray-400" />
                                    Documents
                                  </Link>
                                  <Link
                                    href={`/dashboard/management/employees/${employee.id}/bank-details`}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
                                  >
                                    <CreditCard className="w-4 h-4 text-gray-400" />
                                    Bank Details
                                  </Link>
                                  <div className="border-t border-gray-100 dark:border-zinc-800 my-1"></div>
                                  <button
                                    onClick={() => {
                                      setSelectedEmployee(employee);
                                      setDeleteModalOpen(true);
                                      setMenuOpenId(null);
                                    }}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 w-full transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Employee
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="7" className="py-24 text-center">
                    <p className="text-gray-500 font-bold text-sm">No employees found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-8 py-6 bg-gray-50/50 dark:bg-zinc-800/20 border-t border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            Showing <span className="text-gray-900 dark:text-white font-black">{filteredEmployees.length === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="text-gray-900 dark:text-white font-black">{Math.min(currentPage * itemsPerPage, filteredEmployees.length)}</span> of <span className="text-gray-900 dark:text-white font-black">{filteredEmployees.length}</span> entries
          </p>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-5 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-sm font-bold text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm flex items-center gap-2 active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            
            <div className="hidden sm:flex items-center gap-1.5">
              {[...Array(totalPages)].map((_, i) => (
                <button 
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-xl text-sm font-black transition-all ${
                    currentPage === i + 1 
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/10' 
                    : 'text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-5 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-sm font-bold text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm flex items-center gap-2 active:scale-95"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-gray-100 dark:border-zinc-800 shadow-2xl p-6 max-w-md w-full mx-auto animate-in scale-in duration-200">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Employee</h3>
            <p className="text-gray-500 dark:text-zinc-400 text-sm font-medium mb-6">
              Are you sure you want to delete {selectedEmployee?.first_name} {selectedEmployee?.last_name}? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-5 py-2.5 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-600 dark:text-gray-400 rounded-xl font-bold text-sm transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-red-600/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permission Alert */}
      <PermissionAlert
        isOpen={permissionAlert.isOpen}
        onClose={() => setPermissionAlert({ isOpen: false, action: '', resource: '' })}
        action={permissionAlert.action}
        resource={permissionAlert.resource}
      />

      {/* View Employee Modal */}
      {viewModalOpen && selectedEmployee && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-[28px] border border-gray-100 dark:border-zinc-800 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in scale-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-zinc-800">
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white">
                  {selectedEmployee.first_name} {selectedEmployee.last_name}
                </h3>
                <p className="text-xs font-bold text-gray-400 dark:text-zinc-500 tracking-wider mt-0.5">{selectedEmployee.employee_id || 'No ID'}</p>
              </div>
              <button
                onClick={() => setViewModalOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 dark:border-zinc-800 px-6">
              {['personal', 'visa', 'salary', 'contact'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3.5 text-sm font-bold border-b-2 transition-all relative ${
                    activeTab === tab
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-755 dark:hover:text-zinc-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] scrollbar-hide">
              {loadingDetails ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-500 dark:text-zinc-500 font-black text-xs uppercase tracking-[0.2em]">Loading Details...</p>
                </div>
              ) : (
                <>
                  {activeTab === 'personal' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-zinc-800/30 rounded-2xl p-4 border border-gray-200/20 dark:border-zinc-800/50">
                        <label className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest block mb-1">First Name</label>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedEmployee.first_name || '-'}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-zinc-800/30 rounded-2xl p-4 border border-gray-200/20 dark:border-zinc-800/50">
                        <label className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest block mb-1">Last Name</label>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedEmployee.last_name || '-'}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-zinc-800/30 rounded-2xl p-4 border border-gray-200/20 dark:border-zinc-800/50">
                        <label className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest block mb-1">Nationality</label>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedEmployee.nationality || '-'}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-zinc-800/30 rounded-2xl p-4 border border-gray-200/20 dark:border-zinc-800/50">
                        <label className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest block mb-1">Passport Number</label>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedEmployee.passport_number || '-'}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-zinc-800/30 rounded-2xl p-4 border border-gray-200/20 dark:border-zinc-800/50">
                        <label className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest block mb-1">Passport Expiry</label>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedEmployee.passport_expiry || '-'}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-zinc-800/30 rounded-2xl p-4 border border-gray-200/20 dark:border-zinc-800/50">
                        <label className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest block mb-1">EID Number</label>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedEmployee.eid_number || '-'}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-zinc-800/30 rounded-2xl p-4 border border-gray-200/20 dark:border-zinc-800/50">
                        <label className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest block mb-1">EID Expiry</label>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedEmployee.eid_expiry || '-'}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-zinc-800/30 rounded-2xl p-4 border border-gray-200/20 dark:border-zinc-800/50">
                        <label className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest block mb-1">Status</label>
                        <p className="text-sm font-bold text-gray-900 dark:text-white capitalize">{selectedEmployee.status || '-'}</p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'visa' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-zinc-800/30 rounded-2xl p-4 border border-gray-200/20 dark:border-zinc-800/50">
                        <label className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest block mb-1">Visa Number</label>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedEmployee.visa_number || '-'}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-zinc-800/30 rounded-2xl p-4 border border-gray-200/20 dark:border-zinc-800/50">
                        <label className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest block mb-1">Visa Expiry</label>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedEmployee.visa_expiry || '-'}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-zinc-800/30 rounded-2xl p-4 border border-gray-200/20 dark:border-zinc-800/50">
                        <label className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest block mb-1">Visa Status</label>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedEmployee.visa_status || '-'}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-zinc-800/30 rounded-2xl p-4 border border-gray-200/20 dark:border-zinc-800/50">
                        <label className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest block mb-1">Visa Type</label>
                        <p className="text-sm font-bold text-gray-900 dark:text-white capitalize">{selectedEmployee.visa_type || '-'}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-zinc-800/30 rounded-2xl p-4 border border-gray-200/20 dark:border-zinc-800/50">
                        <label className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest block mb-1">Visa Position</label>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedEmployee.visa_position || '-'}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-zinc-800/30 rounded-2xl p-4 border border-gray-200/20 dark:border-zinc-800/50">
                        <label className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest block mb-1">Branch on Visa</label>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedEmployee.branch_on_visa?.branch_name || '-'}</p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'salary' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-zinc-800/30 rounded-2xl p-4 border border-gray-200/20 dark:border-zinc-800/50">
                        <label className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest block mb-1">Starting Salary</label>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">AED {selectedEmployee.starting_salary || '-'}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-zinc-800/30 rounded-2xl p-4 border border-gray-200/20 dark:border-zinc-800/50">
                        <label className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest block mb-1">Current Salary</label>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">AED {selectedEmployee.current_salary || '-'}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-zinc-800/30 rounded-2xl p-4 border border-gray-200/20 dark:border-zinc-800/50">
                        <label className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest block mb-1">Actual Position</label>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedEmployee.actual_position || '-'}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-zinc-800/30 rounded-2xl p-4 border border-gray-200/20 dark:border-zinc-800/50">
                        <label className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest block mb-1">Position Start Date</label>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedEmployee.position_start_date || '-'}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-zinc-800/30 rounded-2xl p-4 border border-gray-200/20 dark:border-zinc-800/50">
                        <label className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest block mb-1">Annual Leave</label>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedEmployee.annual_leave_entitlement || '-'} days</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-zinc-800/30 rounded-2xl p-4 border border-gray-200/20 dark:border-zinc-800/50">
                        <label className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest block mb-1">Current Branch</label>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedEmployee.current_branch?.branch_name || '-'}</p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'contact' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-zinc-800/30 rounded-2xl p-4 border border-gray-200/20 dark:border-zinc-800/50">
                        <label className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest block mb-1">Mobile Number</label>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedEmployee.mobile_number || '-'}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-zinc-800/30 rounded-2xl p-4 border border-gray-200/20 dark:border-zinc-800/50">
                        <label className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest block mb-1">Emergency Contact</label>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedEmployee.emergency_contact || '-'}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-zinc-800/30 rounded-2xl p-4 border border-gray-200/20 dark:border-zinc-800/50">
                        <label className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest block mb-1">Personal Email</label>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedEmployee.personal_email || '-'}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-zinc-800/30 rounded-2xl p-4 border border-gray-200/20 dark:border-zinc-800/50">
                        <label className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest block mb-1">Work Email</label>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedEmployee.work_email || '-'}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-zinc-800/30 rounded-2xl p-4 border border-gray-200/20 dark:border-zinc-800/50">
                        <label className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest block mb-1">Insurance Policy</label>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedEmployee.insurance_policy_number || '-'}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-zinc-800/30 rounded-2xl p-4 border border-gray-200/20 dark:border-zinc-800/50">
                        <label className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest block mb-1">Insurance Expiry</label>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedEmployee.insurance_expiry || '-'}</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 dark:border-zinc-800">
              <button
                onClick={() => setViewModalOpen(false)}
                className="px-5 py-2.5 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all"
              >
                Close
              </button>
              <Link
                href={`/dashboard/management/employees/edit/${selectedEmployee.id}`}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-600/20"
              >
                Edit Employee
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
