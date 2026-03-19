"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Calendar, Briefcase, ArrowLeft, Check, Loader2 } from "lucide-react";
import { employeeService } from "@/app/lib/services/employeeService";
import { branchService } from "@/app/lib/services/branchService";
import { useToast } from "@/app/components/Toast";

export default function AddEmployeePage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    nationality: "",
    mobile_number: "",
    emergency_contact: "",
    personal_email: "",
    work_email: "",
    passport_number: "",
    passport_expiry: "",
    visa_status: "",
    actual_position: "",
    visa_position: "",
    visa_type: "",
    branch_on_visa_id: "",
    current_branch_id: "",
    position_start_date: new Date().toISOString().split('T')[0],
    eid_number: "",
    eid_expiry: "",
    visa_number: "",
    visa_expiry: "",
    insurance_policy_number: "",
    insurance_expiry: "",
    starting_salary: "",
    current_salary: "",
    annual_leave_entitlement: "30",
    status: "active"
  });

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    setBranchesLoading(true);
    try {
      const data = await branchService.getDropdown();
      setBranches(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch branches:", err);
    } finally {
      setBranchesLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name) {
      error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      // Build payload with only non-empty values
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        starting_salary: formData.starting_salary ? parseFloat(formData.starting_salary) : 0,
        current_salary: formData.current_salary ? parseFloat(formData.current_salary) : 0,
        annual_leave_entitlement: formData.annual_leave_entitlement ? parseInt(formData.annual_leave_entitlement) : 30,
        status: formData.status
      };

      // Only add optional fields if they have values
      if (formData.nationality) payload.nationality = formData.nationality;
      if (formData.mobile_number) payload.mobile_number = formData.mobile_number;
      if (formData.emergency_contact) payload.emergency_contact = formData.emergency_contact;
      if (formData.personal_email) payload.personal_email = formData.personal_email;
      if (formData.work_email) payload.work_email = formData.work_email;
      if (formData.passport_number) payload.passport_number = formData.passport_number;
      if (formData.passport_expiry) payload.passport_expiry = formData.passport_expiry;
      if (formData.visa_status) payload.visa_status = formData.visa_status;
      if (formData.actual_position) payload.actual_position = formData.actual_position;
      if (formData.visa_position) payload.visa_position = formData.visa_position;
      if (formData.visa_type) payload.visa_type = formData.visa_type;
      if (formData.branch_on_visa_id) payload.branch_on_visa_id = parseInt(formData.branch_on_visa_id);
      if (formData.current_branch_id) payload.current_branch_id = parseInt(formData.current_branch_id);
      if (formData.position_start_date) payload.position_start_date = formData.position_start_date;
      if (formData.eid_number) payload.eid_number = formData.eid_number;
      if (formData.eid_expiry) payload.eid_expiry = formData.eid_expiry;
      if (formData.visa_number) payload.visa_number = formData.visa_number;
      if (formData.visa_expiry) payload.visa_expiry = formData.visa_expiry;
      if (formData.insurance_policy_number) payload.insurance_policy_number = formData.insurance_policy_number;
      if (formData.insurance_expiry) payload.insurance_expiry = formData.insurance_expiry;

      await employeeService.create(payload);
      success("Employee created successfully!");
      router.push("/dashboard/management/employees");
    } catch (err) {
      error(err.message || "Failed to create employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/management/employees" className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Employee</h1>
          <p className="text-gray-500 text-sm">Create a new employee record</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">First Name <span className="text-red-500">*</span></label>
              <input type="text" placeholder="Enter first name" className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Name <span className="text-red-500">*</span></label>
              <input type="text" placeholder="Enter last name" className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nationality</label>
              <input type="text" placeholder="e.g. UAE" className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.nationality} onChange={(e) => setFormData({...formData, nationality: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mobile Number</label>
              <input type="tel" placeholder="+971 XX XXX XXXX" className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.mobile_number} onChange={(e) => setFormData({...formData, mobile_number: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Personal Email</label>
              <input type="email" placeholder="personal@example.com" className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.personal_email} onChange={(e) => setFormData({...formData, personal_email: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Work Email</label>
              <input type="email" placeholder="work@company.com" className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.work_email} onChange={(e) => setFormData({...formData, work_email: e.target.value})} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Employment Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Actual Position</label>
              <input type="text" placeholder="e.g. Sales Manager" className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.actual_position} onChange={(e) => setFormData({...formData, actual_position: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Branch</label>
              <select className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.current_branch_id} onChange={(e) => setFormData({...formData, current_branch_id: e.target.value})} disabled={branchesLoading}>
                <option value="">{branchesLoading ? 'Loading...' : 'Select Branch'}</option>
                {branches.map(branch => (<option key={branch.id} value={branch.id}>{branch.label || branch.branch_name || branch.name}</option>))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Starting Salary (AED)</label>
              <input type="number" step="0.01" placeholder="0.00" className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.starting_salary} onChange={(e) => setFormData({...formData, starting_salary: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Salary (AED)</label>
              <input type="number" step="0.01" placeholder="0.00" className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.current_salary} onChange={(e) => setFormData({...formData, current_salary: e.target.value})} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={loading} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-all disabled:opacity-50 flex items-center gap-2">
            {loading ? (<><Loader2 className="w-4 h-4 animate-spin" />Creating...</>) : (<><Check className="w-4 h-4" />Create Employee</>)}
          </button>
          <Link href="/dashboard/management/employees" className="px-6 py-2.5 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-lg font-bold text-sm hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
