"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { 
  MoreVertical, Search, Filter, Download, Plus, 
  ChevronLeft, ChevronRight, Pencil, Trash2, 
  Eye, Calendar, DollarSign, FileText,
  AlertCircle, Receipt, Truck, X
} from "lucide-react";
import { useExpenses } from "@/app/lib/hooks/useExpenses";
import { expenseService } from "@/app/lib/services/expenseService";
import { useToast } from "@/app/components/Toast";

export default function ExpensesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [supplierFilter, setSupplierFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { success, error } = useToast();
  
  // Data Fetching
  const itemsPerPage = 6;
  const { expenses, loading, refetch } = useExpenses();

  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [expenses.length, searchQuery, typeFilter, categoryFilter, supplierFilter]);

  // Menu state and delete modal
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  // Extract unique values for filters
  const uniqueTypes = useMemo(() => {
    const types = new Set(expenses.map(exp => exp.type).filter(Boolean));
    return ['All', ...Array.from(types)];
  }, [expenses]);

  const uniqueCategories = useMemo(() => {
    const categories = new Set(expenses.map(exp => exp.category).filter(Boolean));
    return ['All', ...Array.from(categories)];
  }, [expenses]);

  const uniqueSuppliers = useMemo(() => {
    const suppliers = new Set(expenses.map(exp => exp.supplier_code).filter(Boolean));
    return ['All', ...Array.from(suppliers)];
  }, [expenses]);

  // Filter and search logic
  const filteredExpenses = useMemo(() => {
    if (!expenses) return [];
    return expenses.filter(expense => {
      const searchTarget = `${expense.expense_id || ''} ${expense.description || ''}`.toLowerCase();
      const matchesSearch = searchTarget.includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === "All" || expense.type === typeFilter;
      const matchesCategory = categoryFilter === "All" || expense.category === categoryFilter;
      const matchesSupplier = supplierFilter === "All" || expense.supplier_code === supplierFilter;
      return matchesSearch && matchesType && matchesCategory && matchesSupplier;
    });
  }, [searchQuery, typeFilter, categoryFilter, supplierFilter, expenses]);

  // Pagination logic
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedExpenses = filteredExpenses.slice(startIndex, startIndex + itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const toggleMenu = (id) => {
    setMenuOpenId(prev => prev === id ? null : id);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedExpense) return;
    setDeleteError(null);
    try {
      await expenseService.delete(selectedExpense.id);
      success("Expense deleted successfully!");
      setDeleteModalOpen(false);
      setSelectedExpense(null);
      refetch();
    } catch (err) {
      const errorMsg = err.message || "Unknown error";
      setDeleteError(errorMsg);
      error("Failed to delete expense: " + errorMsg);
    }
  };

  const getTypeBadge = (type) => {
    const t = type?.toLowerCase() || 'general';
    const styles = {
      general: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50',
      personal: 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 border border-purple-200 dark:border-purple-900/50',
    };
    
    const resolvedStyle = styles[t] || 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 border border-gray-200 dark:border-zinc-700';
    
    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${resolvedStyle}`}>
        {t}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return `AED ${parseFloat(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const handleViewExpense = (expense) => {
    setSelectedExpense(expense);
    setViewModalOpen(true);
    setMenuOpenId(null);
  };

  if (!isMounted) return null;

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-12 animate-in fade-in duration-500 px-4 sm:px-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
        <div className="shrink-0">
          <h1 className="text-2xl font-black dark:text-white tracking-tight">Expenses</h1>
          <p className="text-gray-400 dark:text-zinc-500 text-sm font-normal">Track and manage all company expenses</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 flex-1 lg:max-w-6xl justify-end">
          {/* Search Bar */}
          <div className="relative w-full lg:max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by Expense ID, description..."
              className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto mt-2 sm:mt-0 btn-mobile-arrange">
            <div className="relative flex-1 sm:flex-none">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm shadow-xl shadow-black/10 active:scale-95 transition-all filter-button"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
              
              {isFilterOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Type Filter */}
                  <div className="mb-4">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Type</label>
                    <div className="space-y-1">
                      {uniqueTypes.map((type) => (
                        <button
                          key={type}
                          onClick={() => setTypeFilter(type)}
                          className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                            typeFilter === type 
                              ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' 
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div className="mb-4">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Category</label>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {uniqueCategories.map((category) => (
                        <button
                          key={category}
                          onClick={() => setCategoryFilter(category)}
                          className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                            categoryFilter === category 
                              ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' 
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Supplier Filter */}
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Supplier</label>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {uniqueSuppliers.map((supplier) => (
                        <button
                          key={supplier}
                          onClick={() => setSupplierFilter(supplier)}
                          className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                            supplierFilter === supplier 
                              ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' 
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800'
                          }`}
                        >
                          {supplier}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setTypeFilter('All');
                      setCategoryFilter('All');
                      setSupplierFilter('All');
                    }}
                    className="w-full mt-4 px-4 py-2.5 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 rounded-xl text-sm font-bold hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>

            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-gray-400 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-all shadow-sm">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>

            <Link 
              href="/dashboard/finance/expenses/add"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm shadow-xl shadow-black/10 active:scale-95 transition-all add-button"
            >
              <Plus className="w-4 h-4" />
              <span className="whitespace-nowrap font-black">Add Expense</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-[15px] border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden w-full max-w-full responsive-table-container">
        <div className="overflow-x-auto w-full scrollbar-hide">
          <table className="w-full min-w-[1400px]">
            <thead>
              <tr className="border-b border-gray-50 dark:border-zinc-800/50">
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Expense ID</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Date</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Description</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Type</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Category</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Supplier</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Document</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Amount</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/50">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-gray-500 font-black text-xs uppercase tracking-[0.2em]">Loading Expenses...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedExpenses.length > 0 ? (
                paginatedExpenses.map((expense, index) => {
                  return (
                    <tr key={expense.id} className="group transition-all hover:bg-gray-50/50 dark:hover:bg-zinc-800/30">
                      <td className="px-6 py-6" data-label="Expense ID">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center border-2 border-white dark:border-zinc-800 shadow-sm">
                            <Receipt className="w-5 h-5 text-red-600 dark:text-red-400" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-900 dark:text-white group-hover:text-red-600 transition-colors leading-tight">
                              {expense.expense_id || `EXP-${expense.id}`}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-6" data-label="Date">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-bold text-gray-700 dark:text-zinc-300">
                            {expense.date ? new Date(expense.date).toLocaleDateString('en-GB', { 
                              day: '2-digit', 
                              month: 'short', 
                              year: 'numeric' 
                            }) : '-'}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-6" data-label="Description">
                        <span className="text-sm font-bold text-gray-700 dark:text-zinc-300 line-clamp-2 max-w-xs">
                          {expense.description || '-'}
                        </span>
                      </td>

                      <td className="px-6 py-6" data-label="Type">
                        {getTypeBadge(expense.type)}
                      </td>

                      <td className="px-6 py-6" data-label="Category">
                        <span className="text-sm font-bold text-gray-700 dark:text-zinc-300">
                          {expense.category || '-'}
                        </span>
                      </td>

                      <td className="px-6 py-6" data-label="Supplier">
                        <span className="text-sm font-bold text-gray-700 dark:text-zinc-300">
                          {expense.supplier_code || 'N/A'}
                        </span>
                      </td>

                      <td className="px-6 py-6" data-label="Document">
                        <span className="text-sm font-bold text-gray-700 dark:text-zinc-300">
                          {expense.document || 'N/A'}
                        </span>
                      </td>

                      <td className="px-6 py-6" data-label="Amount">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm font-black dark:text-white">
                            {formatCurrency(expense.amount)}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-6 text-right relative" data-label="Actions">
                        <div className="flex items-center justify-end gap-2">
                          <div className="relative">
                            <button 
                              onClick={() => toggleMenu(expense.id)}
                              className={`p-2 rounded-xl transition-all ${
                                menuOpenId === expense.id 
                                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg menu-button-active'
                                  : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-zinc-800'
                              }`}
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>
                            
                            {menuOpenId === expense.id && (
                              <div className={`absolute right-0 w-48 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-200 ${
                                index > paginatedExpenses.length - 3 ? 'bottom-full mb-2' : 'top-full mt-2'
                              }`}>
                                <button 
                                  onClick={() => handleViewExpense(expense)}
                                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                  View Details
                                </button>
                                <Link 
                                  href={`/dashboard/finance/expenses/edit/${expense.id}`}
                                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded-xl transition-colors"
                                >
                                  <Pencil className="w-4 h-4" />
                                  Edit Expense
                                </Link>
                                <div className="h-px bg-gray-100 dark:bg-zinc-800 my-1" />
                                <button 
                                  onClick={() => {
                                    setSelectedExpense(expense);
                                    setDeleteModalOpen(true);
                                    setMenuOpenId(null);
                                  }} 
                                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete Expense
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="py-24 text-center">
                    <p className="text-gray-400 font-black text-sm uppercase tracking-widest italic animate-pulse">No expenses found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-8 py-6 bg-gray-50/50 dark:bg-zinc-800/20 border-t border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            Showing <span className="text-gray-900 dark:text-white font-black">{startIndex + 1}</span> to <span className="text-gray-900 dark:text-white font-black">{Math.min(startIndex + itemsPerPage, filteredExpenses.length)}</span> of <span className="text-gray-900 dark:text-white font-black">{filteredExpenses.length}</span> entries
          </p>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handlePrevPage}
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
              onClick={handleNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-5 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-sm font-bold text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm flex items-center gap-2 active:scale-95"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in zoom-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-8 max-w-md w-full border border-gray-100 dark:border-zinc-800 shadow-2xl space-y-6 text-center">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white dark:border-zinc-800 shadow-lg">
              <Trash2 className="w-10 h-10 text-red-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black dark:text-white uppercase tracking-tight">Delete Expense?</h2>
              <p className="text-gray-500 dark:text-zinc-500 font-medium leading-relaxed">
                Are you sure you want to delete <span className="font-black text-gray-900 dark:text-white italic">{selectedExpense?.expense_id || `EXP-${selectedExpense?.id}`}</span>? This action cannot be undone.
              </p>
            </div>

            {deleteError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div className="text-left space-y-2">
                    <p className="text-sm font-bold text-red-900 dark:text-red-200">
                      {deleteError}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button 
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDeleteError(null);
                  setSelectedExpense(null);
                }}
                className="flex-1 py-4 bg-gray-50 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 rounded-2xl font-bold text-sm hover:bg-gray-100 dark:hover:bg-zinc-700 transition-all"
              >
                Cancel
              </button>
              {!deleteError && (
                <button 
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-red-600/30 hover:bg-red-700 active:scale-95 transition-all"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* View Expense Modal */}
      {viewModalOpen && selectedExpense && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in zoom-in duration-200 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-8 max-w-3xl w-full border border-gray-100 dark:border-zinc-800 shadow-2xl my-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <Receipt className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h2 className="text-xl font-black dark:text-white">Expense Details</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{selectedExpense.expense_id || `EXP-${selectedExpense.id}`}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setViewModalOpen(false);
                  setSelectedExpense(null);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-6">
              {/* Expense ID */}
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Receipt className="w-3.5 h-3.5" />
                  Expense ID
                </label>
                <div className="px-4 py-3 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 font-bold">
                  {selectedExpense.expense_id || `EXP-${selectedExpense.id}`}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    Date
                  </label>
                  <div className="px-4 py-3 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 font-bold">
                    {formatDate(selectedExpense.date)}
                  </div>
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5" />
                    Amount
                  </label>
                  <div className="px-4 py-3 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-black text-gray-900 dark:text-white">
                    {formatCurrency(selectedExpense.amount)}
                  </div>
                </div>

                {/* Type */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                    Type
                  </label>
                  <div className="px-4 py-3 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 font-bold">
                    {selectedExpense.type || '-'}
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                    Category
                  </label>
                  <div className="px-4 py-3 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 font-bold">
                    {selectedExpense.category || '-'}
                  </div>
                </div>

                {/* Supplier */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5" />
                    Supplier Code
                  </label>
                  <div className="px-4 py-3 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 font-bold">
                    {selectedExpense.supplier_code || 'N/A'}
                  </div>
                </div>

                {/* Document */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" />
                    Document
                  </label>
                  <div className="px-4 py-3 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 font-bold">
                    {selectedExpense.document || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" />
                  Description
                </label>
                <div className="px-4 py-3 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 font-bold min-h-[80px] whitespace-pre-wrap">
                  {selectedExpense.description || '-'}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-zinc-800">
              <Link
                href={`/dashboard/finance/expenses/edit/${selectedExpense.id}`}
                className="flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm shadow-lg shadow-black/10 hover:opacity-90 active:scale-95 transition-all"
              >
                <Pencil className="w-4 h-4" />
                <span>Edit Expense</span>
              </Link>
              
              <button
                onClick={() => {
                  setViewModalOpen(false);
                  setSelectedExpense(null);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-zinc-700 active:scale-95 transition-all"
              >
                <X className="w-4 h-4" />
                <span>Close</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
