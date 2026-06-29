"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  UserCheck, Plus, Search, Eye, CheckCircle, Loader2, Clock, Trash2, Edit
} from "lucide-react";
import { attendanceService } from "@/app/lib/services/attendanceService";
import { useToast } from "@/app/components/Toast";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { usePermission } from "@/app/lib/hooks/usePermission";
import { PERMISSIONS } from "@/app/lib/constants/permissions";
import Pagination from "@/app/components/Pagination";
import { TableContainer, Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from "@/app/components/Table";

export default function AttendancePage() {
  const { success, error } = useToast();
  const { hasPermission } = usePermission();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingCount, setPendingCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 10;

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await attendanceService.getAll(currentPage, PAGE_SIZE);
      const items = response?.data || [];
      setAttendance(items);
      setTotal(response?.total || 0);
      setTotalPages(response?.total_pages || 1);

      // Calculate pending count from attendance data
      const pending = items.filter(a => a.status === 'pending' || !a.approved_by_supervisor).length;
      setPendingCount(pending);
    } catch (err) {
      error("Failed to load attendance data");
      setAttendance([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleApprove = async (id) => {
    try {
      await attendanceService.approve(id);
      success("Attendance approved successfully!");
      fetchData();
    } catch (err) {
      error(err.message || "Failed to approve attendance");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this attendance record? This action cannot be undone.")) return;

    try {
      await attendanceService.delete(id);
      success("Attendance deleted successfully!");
      fetchData();
    } catch (err) {
      error(err.message || "Failed to delete attendance");
    }
  };

  const filteredAttendance = attendance.filter(record => {
    const employeeName = `${record.employee?.first_name || ''} ${record.employee?.last_name || ''}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();

    return (
      employeeName.includes(searchLower) ||
      (record.date || '').includes(searchTerm) ||
      (record.status || '').toLowerCase().includes(searchLower) ||
      (record.notes || '').toLowerCase().includes(searchLower)
    );
  });

  // Pagination logic (hybrid server/client)
  const displayTotalPages = filteredAttendance.length > PAGE_SIZE ? Math.ceil(filteredAttendance.length / PAGE_SIZE) : totalPages;
  const displayTotal = filteredAttendance.length > PAGE_SIZE ? filteredAttendance.length : total;
  const paginatedAttendance = filteredAttendance.length > PAGE_SIZE
    ? filteredAttendance.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
    : filteredAttendance;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-sm text-gray-500">Loading attendance...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute permission={PERMISSIONS.ATTENDANCE.VIEW}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Track and manage employee attendance
            </p>
          </div>
          {hasPermission(PERMISSIONS.ATTENDANCE.CREATE) && (
            <Link
              href="/dashboard/management/attendance/submit"
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-all shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Submit Attendance
            </Link>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by employee, date, or status..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Records</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{attendance.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pending Approval</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Approved</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {attendance.filter(a => a.status === 'approved').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <TableContainer>
          {paginatedAttendance.length > 0 ? (
            <Table minWidth="800px">
              <TableHeader>
                <TableHeaderCell>Employee</TableHeaderCell>
                <TableHeaderCell>Date</TableHeaderCell>
                <TableHeaderCell>Check In</TableHeaderCell>
                <TableHeaderCell>Check Out</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell className="text-right">Actions</TableHeaderCell>
              </TableHeader>
              <TableBody>
                {paginatedAttendance.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {record.employee ? `${record.employee.first_name} ${record.employee.last_name}` : 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500">ID: {record.employee_id}</p>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {record.date || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {record.check_in || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {record.check_out || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${record.status === 'approved'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                        }`}>
                        {record.status || 'pending'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/management/attendance/${record.id}`}
                          className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors group"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                        </Link>
                        {hasPermission(PERMISSIONS.ATTENDANCE.UPDATE) && (
                          <Link
                            href={`/dashboard/management/attendance/edit/${record.id}`}
                            className="p-2 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors group"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-gray-400 group-hover:text-yellow-600" />
                          </Link>
                        )}
                        {record.status === 'pending' && hasPermission(PERMISSIONS.ATTENDANCE.APPROVE) && (
                          <button
                            onClick={() => handleApprove(record.id)}
                            className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors group"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4 text-gray-400 group-hover:text-green-600" />
                          </button>
                        )}
                        {hasPermission(PERMISSIONS.ATTENDANCE.DELETE) && (
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                <UserCheck className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                {searchTerm ? "No attendance found matching your search" : "No attendance records yet"}
              </p>
            </div>
          )}
        </TableContainer>

          {/* Pagination Footer */}
          <Pagination
            currentPage={currentPage}
            totalPages={displayTotalPages}
            total={displayTotal}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
      </div>
    </ProtectedRoute>
  );
}
