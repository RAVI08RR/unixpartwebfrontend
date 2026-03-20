"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { User, Mail, Phone, Calendar, Briefcase, ArrowLeft, Check, Loader2 } from "lucide-react";
import { employeeService } from "@/app/lib/services/employeeService";
import { branchService } from "@/app/lib/services/branchService";
import { useToast } from "@/app/components/Toast";

export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
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
    visa_type: "nil",
    branch_on_visa_id: "",
    current_branch_id: "",
    position_start_date: "",
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
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    setPageLoading(true);
    try {
      // Fetch branches
      setBranchesLoading(true);
      const branchesData = await branchService.getDropdown();
      setBranches(Array.isArray(branchesData) ? branchesData : []);
      setBranchesLoading(false);

      // Fetch employee data
      const employee = await employeeService.getById(params.id);
      console.log('Fetched employee data:', employee);
      
      setFormData({
        first_name: employee.first_name || "",
        last_name: employee.last_name || "",
        nationality: employee.nationality || "",
        mobile_number: employee.mobile_number || "",
        emergency_contact: employee.emergency_contact || "",
        personal_email: employee.personal_email || "",
        work_email: employee.work_email || "",
        passport_number: employee.passport_number || "",
        passport_expiry: employee.passport_expiry || "",
        visa_status: employee.visa_status || "",
        actual_position: employee.actual_position || "",
        visa_position: employee.visa_position || "",
        visa_type: employee.visa_type || "nil",
        branch_on_visa_id: employee.branch_on_visa_id || "",
        current_branch_id: employee.current_branch_id || "",
        position_start_date: employee.position_start_date || "",
        eid_number: employee.eid_number || "",
        eid_expiry: employee.eid_expiry || "",
        visa_number: employee.visa_number || "",
        visa_expiry: employee.visa_expiry || "",
        insurance_policy_number: employee.insurance_policy_number || "",
        insurance_expiry: employee.insurance_expiry || "",
        starting_salary: employee.starting_salary || "",
        current_salary: employee.current_salary || "",
        annual_leave_entitlement: employee.annual_leave_entitlement || "30",
        status: employee.status || "active"
      });
      
      console.log('Form data set successfully');
    } catch (err) {
      error("Failed to load employee data");
    } finally {
      setPageLoading(false);
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
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        nationality: formData.nationality || "",
        mobile_number: formData.mobile_number || "",
        emergency_contact: formData.emergency_contact || null,
        personal_email: formData.personal_email || null,
        work_email: formData.work_email || null,
        passport_number: formData.passport_number || "",
        passport_expiry: formData.passport_expiry || "2099-12-31",
        visa_status: formData.visa_status || "",
        actual_position: formData.actual_position || "",
        visa_position: formData.visa_position || "",
        visa_type: formData.visa_type || "nil",
        branch_on_visa_id: formData.branch_on_visa_id ? parseInt(formData.branch_on_visa_id) : null,
        current_branch_id: formData.current_branch_id ? parseInt(formData.current_branch_id) : 0,
        position_start_date: formData.position_start_date || new Date().toISOString().split('T')[0],
        eid_number: formData.eid_number || "",
        eid_expiry: formData.eid_expiry || "2099-12-31",
        visa_number: formData.visa_number || "",
        visa_expiry: formData.visa_expiry || "2099-12-31",
        insurance_policy_number: formData.insurance_policy_number || "",
        insurance_expiry: formData.insurance_expiry || "2099-12-31",
        starting_salary: formData.starting_salary ? parseFloat(formData.starting_salary) : 0,
        current_salary: formData.current_salary ? parseFloat(formData.current_salary) : 0,
        annual_leave_entitlement: formData.annual_leave_entitlement ? parseInt(formData.annual_leave_entitlement) : 30,
        status: formData.status
      };

      await employeeService.update(params.id, payload);
      success("Employee updated successfully!");
      router.push("/dashboard/management/employees");
    } catch (err) {
      error(err.message || "Failed to update employee");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-sm text-gray-500">Loading employee data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/management/employees" className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Employee</h1>
          <p className="text-gray-500 text-sm">Update employee information</p>
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
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Emergency Contact</label>
              <input type="text" placeholder="Name and phone number" className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.emergency_contact} onChange={(e) => setFormData({...formData, emergency_contact: e.target.value})} />
            </div>
          </div>
        </div>

        {/* Passport & Visa Information */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Passport & Visa Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Passport Number</label>
              <input type="text" placeholder="Enter passport number" className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.passport_number} onChange={(e) => setFormData({...formData, passport_number: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Passport Expiry</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="date" className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.passport_expiry} onChange={(e) => setFormData({...formData, passport_expiry: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Visa Number</label>
              <input type="text" placeholder="Enter visa number" className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.visa_number} onChange={(e) => setFormData({...formData, visa_number: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Visa Expiry</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="date" className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.visa_expiry} onChange={(e) => setFormData({...formData, visa_expiry: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Visa Status</label>
              <input type="text" placeholder="e.g. Valid, Expired" className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.visa_status} onChange={(e) => setFormData({...formData, visa_status: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Visa Type</label>
              <select className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.visa_type} onChange={(e) => setFormData({...formData, visa_type: e.target.value})}>
                <option value="">Select Visa Type</option>
                <option value="company">Company</option>
                <option value="third_party">Third Party</option>
                <option value="nil">Nil</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Visa Position</label>
              <input type="text" placeholder="Position on visa" className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.visa_position} onChange={(e) => setFormData({...formData, visa_position: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Branch on Visa</label>
              <select className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.branch_on_visa_id} onChange={(e) => setFormData({...formData, branch_on_visa_id: e.target.value})} disabled={branchesLoading}>
                <option value="">{branchesLoading ? 'Loading...' : 'Select Branch'}</option>
                {branches.map(branch => (<option key={branch.id} value={branch.id}>{branch.label || branch.branch_name || branch.name}</option>))}
              </select>
            </div>
          </div>
        </div>

        {/* Emirates ID Information */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Emirates ID Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Emirates ID Number</label>
              <input type="text" placeholder="784-XXXX-XXXXXXX-X" className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.eid_number} onChange={(e) => setFormData({...formData, eid_number: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Emirates ID Expiry</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="date" className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.eid_expiry} onChange={(e) => setFormData({...formData, eid_expiry: e.target.value})} />
              </div>
            </div>
          </div>
        </div>

        {/* Employment Information */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Employment Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Actual Position</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="e.g. Sales Manager" className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.actual_position} onChange={(e) => setFormData({...formData, actual_position: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Branch</label>
              <select className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.current_branch_id} onChange={(e) => setFormData({...formData, current_branch_id: e.target.value})} disabled={branchesLoading}>
                <option value="">{branchesLoading ? 'Loading...' : 'Select Branch'}</option>
                {branches.map(branch => (<option key={branch.id} value={branch.id}>{branch.label || branch.branch_name || branch.name}</option>))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Position Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="date" className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.position_start_date} onChange={(e) => setFormData({...formData, position_start_date: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <select className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On Leave</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Salary & Benefits */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Salary & Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Starting Salary (AED)</label>
              <input type="number" step="0.01" placeholder="0.00" className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.starting_salary} onChange={(e) => setFormData({...formData, starting_salary: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Salary (AED)</label>
              <input type="number" step="0.01" placeholder="0.00" className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.current_salary} onChange={(e) => setFormData({...formData, current_salary: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Annual Leave Entitlement (Days)</label>
              <input type="number" placeholder="30" className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.annual_leave_entitlement} onChange={(e) => setFormData({...formData, annual_leave_entitlement: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Insurance Policy Number</label>
              <input type="text" placeholder="Enter policy number" className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.insurance_policy_number} onChange={(e) => setFormData({...formData, insurance_policy_number: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Insurance Expiry</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="date" className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.insurance_expiry} onChange={(e) => setFormData({...formData, insurance_expiry: e.target.value})} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={loading} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-all disabled:opacity-50 flex items-center gap-2">
            {loading ? (<><Loader2 className="w-4 h-4 animate-spin" />Updating...</>) : (<><Check className="w-4 h-4" />Update Employee</>)}
          </button>
          <Link href="/dashboard/management/employees" className="px-6 py-2.5 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-lg font-bold text-sm hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
