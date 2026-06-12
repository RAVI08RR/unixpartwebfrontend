"use client";

import React, { useState, useEffect } from "react";
import { 
  User, Mail, Phone, Save, Briefcase, 
  MapPin, Key, Loader2, AlertCircle
} from "lucide-react";
import { employeeSelfService } from "../../lib/services/employeeSelfService";
import { useToast } from "../../components/Toast";
import { useCurrentUser } from "../../lib/hooks/useCurrentUser";
import PasswordInput from "../../components/PasswordInput";

export default function EmployeeProfile() {
  const { user } = useCurrentUser();
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  
  const [activeTab, setActiveTab] = useState("details"); // "details" | "edit" | "password"
  const [profile, setProfile] = useState(null);

  // Editable Contact Fields
  const [contactForm, setContactForm] = useState({
    mobile_number: "",
    personal_email: "",
    emergency_contact: ""
  });

  // Password Change Fields
  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: ""
  });

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await employeeSelfService.getProfile();
      setProfile(data);
      
      // Initialize contact form
      setContactForm({
        mobile_number: data.mobile_number || "",
        personal_email: data.personal_email || "",
        emergency_contact: data.emergency_contact || ""
      });
    } catch (err) {
      showErrorToast(err.message || "Failed to load employee profile");
    } finally {
      setLoading(false);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await employeeSelfService.updateProfile({
        mobile_number: contactForm.mobile_number,
        personal_email: contactForm.personal_email,
        emergency_contact: contactForm.emergency_contact
      });
      showSuccessToast("Contact information updated successfully!");
      fetchProfile();
      setActiveTab("details");
    } catch (err) {
      showErrorToast(err.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      showErrorToast("New password and confirm password do not match");
      return;
    }

    if (passwordForm.new_password.length < 6) {
      showErrorToast("New password must be at least 6 characters long");
      return;
    }

    setChangingPassword(true);
    try {
      await employeeSelfService.changePassword(
        passwordForm.old_password,
        passwordForm.new_password
      );
      showSuccessToast("Password changed successfully!");
      setPasswordForm({
        old_password: "",
        new_password: "",
        confirm_password: ""
      });
      setActiveTab("details");
    } catch (err) {
      showErrorToast(err.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "--";
    try {
      return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-sm text-gray-500">Retrieving employee credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
        <p className="text-gray-500 text-sm">View or update your personal account details</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab("details")}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === "details"
              ? "border-red-500 text-red-600 dark:text-red-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-zinc-300"
          }`}
        >
          My Profile Details
        </button>
        <button
          onClick={() => setActiveTab("edit")}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === "edit"
              ? "border-red-500 text-red-600 dark:text-red-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-zinc-300"
          }`}
        >
          Update Contact Info
        </button>
        <button
          onClick={() => setActiveTab("password")}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === "password"
              ? "border-red-500 text-red-600 dark:text-red-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-zinc-300"
          }`}
        >
          Change Password
        </button>
      </div>

      {/* Details View */}
      {activeTab === "details" && profile && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Card Left: Employee Name & Avatar Card */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 text-center space-y-4 shadow-sm h-fit">
            <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-red-600 to-red-400 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-xl">
              {profile.first_name?.[0]}{profile.last_name?.[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {profile.first_name} {profile.last_name}
              </h2>
              <p className="text-sm text-gray-500 mt-1 flex items-center justify-center gap-1.5 font-medium capitalize">
                <Briefcase className="w-4 h-4 text-red-500" />
                {profile.actual_position || "Team Member"}
              </p>
              <p className="text-xs text-gray-400 mt-1 flex items-center justify-center gap-1.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                {profile.current_branch?.branch_name || "Main Branch"}
              </p>
            </div>
            
            <div className="pt-4 border-t border-gray-100 dark:border-zinc-800">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                profile.status?.toLowerCase() === "active" 
                  ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400" 
                  : "bg-gray-100 text-gray-500 dark:bg-zinc-800"
              }`}>
                Employment: {profile.status ? profile.status.toUpperCase() : "ACTIVE"}
              </span>
            </div>
          </div>

          {/* Detailed Info Right */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Contact Information card */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-zinc-800 pb-2">
                Personal & Contact Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Mobile Number</p>
                  <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{profile.mobile_number || "--"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Personal Email</p>
                  <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{profile.personal_email || "--"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Work Email</p>
                  <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{profile.work_email || "--"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Nationality</p>
                  <p className="font-semibold text-gray-900 dark:text-white mt-0.5 capitalize">{profile.nationality || "--"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500 font-bold uppercase">Emergency Contact</p>
                  <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{profile.emergency_contact || "--"}</p>
                </div>
              </div>
            </div>

            {/* Visa & Identity Info */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-zinc-800 pb-2">
                Passport, Visa & EID
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Passport Number</p>
                  <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{profile.passport_number || "--"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Passport Expiry</p>
                  <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{formatDate(profile.passport_expiry)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Visa Number</p>
                  <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{profile.visa_number || "--"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Visa Expiry</p>
                  <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{formatDate(profile.visa_expiry)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Visa Status</p>
                  <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{profile.visa_status || "--"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Emirates ID</p>
                  <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{profile.eid_number || "--"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Emirates ID Expiry</p>
                  <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{formatDate(profile.eid_expiry)}</p>
                </div>
              </div>
            </div>

            {/* Insurance Details */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-zinc-800 pb-2">
                Insurance Cover Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Policy Number</p>
                  <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{profile.insurance_policy_number || "--"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Provider</p>
                  <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{profile.insurance_provider || "--"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Agent Name</p>
                  <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{profile.insurance_agent_name || "--"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Insurance Expiry</p>
                  <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{formatDate(profile.insurance_expiry)}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500 font-bold uppercase">Insurance Status</p>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold mt-1 ${
                    profile.is_insurance_under_process 
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400" 
                      : "bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400"
                  }`}>
                    {profile.is_insurance_under_process ? "Under Process" : "Active"}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Update Contact Details Tab */}
      {activeTab === "edit" && (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm max-w-2xl">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Update My Contact Information</h2>
          
          <form onSubmit={handleContactSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Phone className="w-4 h-4 text-zinc-400" />
                Mobile Phone Number
              </label>
              <input 
                type="tel" 
                placeholder="+971 XX XXX XXXX"
                value={contactForm.mobile_number}
                onChange={(e) => setContactForm({ ...contactForm, mobile_number: e.target.value })}
                className="w-full px-4 py-2.5 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Mail className="w-4 h-4 text-zinc-400" />
                Personal Email Address
              </label>
              <input 
                type="email" 
                placeholder="personal@example.com"
                value={contactForm.personal_email}
                onChange={(e) => setContactForm({ ...contactForm, personal_email: e.target.value })}
                className="w-full px-4 py-2.5 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-zinc-400" />
                Emergency Contact (Name and Phone)
              </label>
              <input 
                type="text" 
                placeholder="Name, Relationship & Mobile No."
                value={contactForm.emergency_contact}
                onChange={(e) => setContactForm({ ...contactForm, emergency_contact: e.target.value })}
                className="w-full px-4 py-2.5 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>

            <div className="pt-4 flex gap-3">
              <button 
                type="submit" 
                disabled={updating}
                className="flex items-center justify-center gap-2 py-2.5 px-6 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
              >
                {updating ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
                ) : (
                  <><Save className="w-4 h-4" />Save Details</>
                )}
              </button>
              <button 
                type="button" 
                onClick={() => setActiveTab("details")}
                className="py-2.5 px-6 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Change Password Tab */}
      {activeTab === "password" && (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm max-w-2xl">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Change Login Password</h2>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            <PasswordInput
              value={passwordForm.old_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
              placeholder="Enter current password"
              required={true}
              label="Current Password"
            />

            <PasswordInput
              value={passwordForm.new_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
              placeholder="Enter new password (min. 6 characters)"
              required={true}
              label="New Password"
            />

            <PasswordInput
              value={passwordForm.confirm_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
              placeholder="Confirm new password"
              required={true}
              label="Confirm New Password"
            />

            <div className="pt-4 flex gap-3">
              <button 
                type="submit" 
                disabled={changingPassword}
                className="flex items-center justify-center gap-2 py-2.5 px-6 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
              >
                {changingPassword ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Changing...</>
                ) : (
                  <><Key className="w-4 h-4" />Update Password</>
                )}
              </button>
              <button 
                type="button" 
                onClick={() => setActiveTab("details")}
                className="py-2.5 px-6 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
