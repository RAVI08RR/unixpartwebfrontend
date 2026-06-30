"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Search, Filter, Download, Plus, MoreVertical,
  UserCheck, Mail, Phone, Building2, Calendar,
  Edit, Trash2, Eye, FileText, CreditCard, Briefcase, X, DollarSign,
  ChevronLeft, ChevronRight, Upload, AlertCircle, ExternalLink, Loader2
} from "lucide-react";
import { employeeService } from "@/app/lib/services/employeeService";
import { useToast } from "@/app/components/Toast";
import { usePermission } from "@/app/lib/hooks/usePermission";
import { PERMISSIONS } from "@/app/lib/constants/permissions";
import { PermissionAlert } from "@/app/components/PermissionAlert";
import ExportButton from "@/app/components/ExportButton";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import Pagination from "@/app/components/Pagination";
import { TableContainer, Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from "@/app/components/Table";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [menuOpenId, setMenuOpenId] = useState(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpenId !== null && !event.target.closest('.actions-menu-container')) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpenId]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [permissionAlert, setPermissionAlert] = useState({ isOpen: false, action: '', resource: '' });
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [documentsModalOpen, setDocumentsModalOpen] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [deleteDocModalOpen, setDeleteDocModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);
  const [uploadDocType, setUploadDocType] = useState("other");

  const { hasPermission } = usePermission();
  const PAGE_SIZE = 10;
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const { success, error } = useToast();

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeeService.getAll(currentPage, PAGE_SIZE);
      setEmployees(response?.data || []);
      setTotal(response?.total || 0);
      setTotalPages(response?.total_pages || 1);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
      error('Failed to load employees');
      setEmployees([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees when currentPage changes
  useEffect(() => {
    fetchEmployees();
  }, [currentPage]);

  // Reset to first page when search or status filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

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
  const paginatedEmployees = filteredEmployees;

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
      setSelectedEmployee(details);
      setEmployeeDetails(details);
    } catch (err) {
      console.error('Failed to fetch employee details:', err);
      setEmployeeDetails(employee);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleOpenDocuments = async (employee) => {
    setSelectedEmployee(employee);
    setDocumentsModalOpen(true);
    await fetchDocuments(employee.id);
  };

  const fetchDocuments = async (employeeId) => {
    setLoadingDocuments(true);
    try {
      const docs = await employeeService.getDocuments(employeeId);
      // Support both array and paginated/wrapped object responses
      setDocuments(Array.isArray(docs) ? docs : (docs?.data || docs?.items || docs?.documents || []));
    } catch (err) {
      console.error("Failed to fetch documents:", err);
      setDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedEmployee) return;

    if (!uploadDocType) {
      error("Please select a document type first");
      return;
    }

    setUploadingDocument(true);
    try {
      const docName = file.name.split('.').slice(0, -1).join('.');
      await employeeService.uploadDocument(selectedEmployee.id, file, uploadDocType, docName);
      success("Document uploaded successfully!");
      await fetchDocuments(selectedEmployee.id);
      setUploadDocType("other");
    } catch (err) {
      error("Failed to upload document: " + err.message);
    } finally {
      setUploadingDocument(false);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    try {
      await employeeService.deleteDocument(documentId);
      success("Document deleted successfully!");
      if (selectedEmployee) {
        await fetchDocuments(selectedEmployee.id);
      }
      setDeleteDocModalOpen(false);
      setDocToDelete(null);
    } catch (err) {
      error("Failed to delete document: " + err.message);
    }
  };

  const handleDownloadDocument = async (documentId, fileName) => {
    if (!selectedEmployee) return;
    try {
      await employeeService.downloadDocument(selectedEmployee.id, documentId, fileName);
    } catch (err) {
      error("Failed to download document: " + err.message);
    }
  };

  const handleViewDocument = async (documentId) => {
    if (!selectedEmployee) return;
    try {
      const token = localStorage.getItem('access_token');
      const url = `/api/employees/${selectedEmployee.id}/documents/${documentId}/download`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load document');
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');

      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
    } catch (err) {
      error("Failed to view document: " + err.message);
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
    <ProtectedRoute permission={PERMISSIONS.EMPLOYEES.VIEW}>
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
          {hasPermission(PERMISSIONS.EMPLOYEES.CREATE) && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleAddClick}
                className="flex-none p-3.5 sm:px-6 sm:py-3.5 flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm shadow-xl shadow-black/10 hover:opacity-90 active:scale-95 transition-all w-auto"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline whitespace-nowrap font-black">Add Employee</span>
              </button>
            </div>
          )}
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
              <option value="terminated">Terminated</option>
            </select>
          </div>
        </div>

        {/* Table Section */}
        <TableContainer>
          <Table minWidth="1000px">
            <TableHeader>
              <TableHeaderCell>Employee</TableHeaderCell>
              <TableHeaderCell>Contact</TableHeaderCell>
              <TableHeaderCell>Position</TableHeaderCell>
              <TableHeaderCell>Branch</TableHeaderCell>
              <TableHeaderCell>Visa Status</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell className="text-right"></TableHeaderCell>
            </TableHeader>
            <TableBody>
              {paginatedEmployees.length > 0 ? (
                paginatedEmployees.map((employee) => {
                  const fullName = `${employee.first_name || ''} ${employee.last_name || ''}`.trim();
                  return (
                    <TableRow key={employee.id}>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-bold text-gray-700 dark:text-zinc-300">
                          {employee.work_email || employee.personal_email || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-zinc-500 font-medium">
                          {employee.mobile_number || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-bold text-gray-700 dark:text-zinc-300">
                          {employee.actual_position || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-zinc-500 font-medium">
                          Visa: {employee.visa_position || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-bold text-gray-700 dark:text-zinc-300">
                          {employee.current_branch?.branch_name || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-zinc-500 font-medium">
                          {employee.current_branch?.branch_code || ''}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-bold text-gray-700 dark:text-zinc-300">
                          {employee.visa_status || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-zinc-500 font-medium">
                          {employee.visa_type || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg ${employee.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                          }`}>
                          {employee.status || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleViewEmployee(employee)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-all animate-in fade-in"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
                          </button>
                          {hasPermission(PERMISSIONS.EMPLOYEES.UPDATE) && (
                            <Link
                              href={`/dashboard/management/employees/edit/${employee.id}`}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
                            </Link>
                          )}

                          {/* More Actions Dropdown */}
                          <div className="relative actions-menu-container">
                            <button
                              onClick={() => setMenuOpenId(menuOpenId === employee.id ? null : employee.id)}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
                              title="More Actions"
                            >
                              <MoreVertical className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
                            </button>

                            {menuOpenId === employee.id && (
                              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800 z-[200] py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                                  {hasPermission(PERMISSIONS.EMPLOYEES.UPDATE) && (
                                    <>
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
                                      <button
                                        onClick={() => {
                                          handleOpenDocuments(employee);
                                          setMenuOpenId(null);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors text-left"
                                      >
                                        <FileText className="w-4 h-4 text-gray-400" />
                                        Documents
                                      </button>
                                      <Link
                                        href={`/dashboard/management/employees/${employee.id}/bank-details`}
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
                                      >
                                        <CreditCard className="w-4 h-4 text-gray-400" />
                                        Bank Details
                                      </Link>
                                    </>
                                  )}
                                  {hasPermission(PERMISSIONS.EMPLOYEES.DELETE) && (
                                    <>
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
                                    </>
                                  )}
                                </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan="7" className="py-24 text-center">
                    <p className="text-gray-500 font-bold text-sm text-center w-full">No employees found.</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

          {/* Pagination Footer */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            total={total}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
          />

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
                    className={`px-4 py-3.5 text-sm font-bold border-b-2 transition-all relative ${activeTab === tab
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
                        <div className="bg-gray-50 dark:bg-zinc-800/30 rounded-2xl p-4 border border-gray-200/20 dark:border-zinc-800/50">
                          <label className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest block mb-1">Insurance Provider</label>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedEmployee.insurance_provider || '-'}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-zinc-800/30 rounded-2xl p-4 border border-gray-200/20 dark:border-zinc-800/50">
                          <label className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest block mb-1">Insurance Agent Name</label>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedEmployee.insurance_agent_name || '-'}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-zinc-800/30 rounded-2xl p-4 border border-gray-200/20 dark:border-zinc-800/50">
                          <label className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest block mb-1">Insurance Status</label>
                          <div className="mt-1">
                            {(() => {
                              const fetchedStatus = selectedEmployee.insurance_status || "";
                              let calculatedStatus = fetchedStatus;
                              if (selectedEmployee.is_insurance_under_process) {
                                calculatedStatus = "under_process";
                              } else if (!calculatedStatus) {
                                const expiryDate = selectedEmployee.insurance_expiry || "";
                                if (!expiryDate) {
                                  calculatedStatus = "active";
                                } else {
                                  const todayStr = new Date().toISOString().split('T')[0];
                                  calculatedStatus = expiryDate >= todayStr ? "active" : "expired";
                                }
                              }

                              let badgeColor = "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20";
                              let statusText = "Active";

                              if (calculatedStatus === "expired") {
                                badgeColor = "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20";
                                statusText = "Expired";
                              } else if (calculatedStatus === "under_process") {
                                badgeColor = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20";
                                statusText = "Under Process";
                              }

                              return (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${badgeColor}`}>
                                  {statusText}
                                </span>
                              );
                            })()}
                          </div>
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
                  className="px-5 py-2.5 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all"
                >
                  Close
                </button>
                {hasPermission(PERMISSIONS.EMPLOYEES.UPDATE) && (
                  <Link
                    href={`/dashboard/management/employees/edit/${selectedEmployee.id}`}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-600/20"
                  >
                    Edit Employee
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Documents Modal */}
        {documentsModalOpen && selectedEmployee && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-in zoom-in duration-200">
            <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-8 max-w-3xl w-full border border-gray-100 dark:border-zinc-800 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-black dark:text-white">Documents for {selectedEmployee.first_name} {selectedEmployee.last_name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Manage and view documents related to this employee.</p>
                </div>
                <button
                  onClick={() => {
                    setDocumentsModalOpen(false);
                    setSelectedEmployee(null);
                    setDocuments([]);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {loadingDocuments ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-500 text-sm font-bold">Loading documents...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Show all uploaded documents */}
                  {documents.length > 0 ? (
                    documents.map((doc) => {
                      const docTypeNames = {
                        'passport': 'Passport',
                        'eid_front': 'EID Front',
                        'eid_back': 'EID Back',
                        'visa': 'Visa',
                        'labour_contract': 'Labour Contract',
                        'insurance': 'Insurance',
                        'education': 'Education',
                        'experience': 'Experience',
                        'other': 'Other'
                      };
                      const displayName = doc.document_name || (docTypeNames[doc.document_type] || doc.document_type || 'General').toUpperCase();

                      return (
                        <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-200 dark:border-zinc-700">
                          <div className="flex items-center gap-3">
                            <div
                              className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-200 dark:bg-zinc-700 flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                              onClick={() => handleViewDocument(doc.id)}
                              title="Click to view full size"
                            >
                              {doc.file_name && (doc.file_name.endsWith('.jpg') || doc.file_name.endsWith('.jpeg') || doc.file_name.endsWith('.png') || doc.file_name.endsWith('.webp')) ? (
                                <img
                                  src={`/api/employees/${selectedEmployee.id}/documents/${doc.id}/download`}
                                  alt={displayName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div className="w-full h-full flex items-center justify-center" style={{ display: doc.file_name && (doc.file_name.endsWith('.jpg') || doc.file_name.endsWith('.jpeg') || doc.file_name.endsWith('.png') || doc.file_name.endsWith('.webp')) ? 'none' : 'flex' }}>
                                <FileText className="w-6 h-6 text-gray-400" />
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900 dark:text-white">{displayName}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Uploaded {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : 'N/A'} • {doc.document_type || 'General'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewDocument(doc.id)}
                              className="px-3 py-2 text-xs font-bold text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors flex items-center gap-1"
                              title="View in new tab"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              View
                            </button>
                            <button
                              onClick={() => handleDownloadDocument(doc.id, doc.file_name || doc.document_name)}
                              className="px-3 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center gap-1"
                              title="Download file"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Download
                            </button>
                            <button
                              onClick={() => {
                                setDocToDelete(doc);
                                setDeleteDocModalOpen(true);
                              }}
                              className="px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-1"
                              title="Delete document"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400 text-sm">No documents uploaded yet.</p>
                    </div>
                  )}

                  {/* Upload new document section */}
                  <div className="pt-4 border-t border-gray-200 dark:border-zinc-800 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1">
                        <label className="block text-xs font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">Document Type</label>
                        <select
                          value={uploadDocType}
                          onChange={(e) => setUploadDocType(e.target.value)}
                          className="w-full px-3 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none"
                        >
                          <option value="passport">Passport</option>
                          <option value="eid_front">EID Front</option>
                          <option value="eid_back">EID Back</option>
                          <option value="visa">Visa</option>
                          <option value="labour_contract">Labour Contract</option>
                          <option value="insurance">Insurance</option>
                          <option value="education">Education</option>
                          <option value="experience">Experience</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div className="flex items-end flex-1 sm:flex-none">
                        <label className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl cursor-pointer transition-colors h-[42px]">
                          {uploadingDocument ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4" />
                              Upload File
                            </>
                          )}
                          <input
                            type="file"
                            className="hidden"
                            onChange={handleFileUpload}
                            disabled={uploadingDocument}
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.webp"
                          />
                        </label>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      Supported: PDF, JPG, PNG, WEBP, DOC, DOCX
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-zinc-800">
                <button
                  onClick={() => {
                    setDocumentsModalOpen(false);
                    setSelectedEmployee(null);
                    setDocuments([]);
                  }}
                  className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm hover:opacity-90 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Document Confirmation Modal */}
        {deleteDocModalOpen && docToDelete && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-in zoom-in duration-200">
            <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-8 max-w-md w-full border border-gray-100 dark:border-zinc-800 shadow-2xl space-y-6 text-center">
              <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white dark:border-zinc-800 shadow-lg">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-black dark:text-white uppercase tracking-tight">Delete Document?</h2>
                <p className="text-gray-500 dark:text-zinc-500 font-medium leading-relaxed">
                  Are you sure you want to delete this document? This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setDeleteDocModalOpen(false);
                    setDocToDelete(null);
                  }}
                  className="flex-1 py-4 bg-gray-50 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 rounded-2xl font-bold text-sm hover:bg-gray-100 dark:hover:bg-zinc-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteDocument(docToDelete.id)}
                  className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-red-600/30 hover:bg-red-700 active:scale-95 transition-all"
                >
                  Delete Document
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
