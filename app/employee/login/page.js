"use client";

import { Check, Mail, Lock, ShieldCheck, ArrowRight, UserCheck } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "../../dashboard/ThemeToggle";
import { authService } from "../../lib/services/authService";
import { setAuthToken, clearAuthToken, getAuthToken } from "../../lib/api";
import PasswordInput from "../../components/PasswordInput";
import { useToast } from "../../components/Toast";
import useAuthStore from "../../lib/store/authStore";

function EmployeeLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const { success, error } = useToast();
  const { setAuth } = useAuthStore();

  // Check if employee is already authenticated on mount (one-time check only)
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      // Check if it's an employee session
      try {
        const currentUserStr = localStorage.getItem('current_user');
        if (currentUserStr) {
          const currentUser = JSON.parse(currentUserStr);
          if (currentUser && currentUser.employee_id) {
            console.log('✅ Employee already authenticated, redirecting to employee portal');
            setIsCheckingAuth(true);
            const redirectUrl = searchParams.get('redirect') || '/employee';
            router.replace(redirectUrl);
            return;
          }
        }
      } catch (e) {
        // ignore
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Helper function to parse validation errors into user-friendly messages
  const parseValidationError = (errorMessage) => {
    if (errorMessage.includes("value is not a valid email address")) {
      return "Please enter a valid email address.";
    }
    if (errorMessage.includes("String should have at least 6 characters")) {
      return "Password must be at least 6 characters long.";
    }
    if (errorMessage.includes("Invalid credentials") || errorMessage.includes("401") || errorMessage.includes("403")) {
      return "Invalid credentials. Please make sure you are entering a valid employee email and password.";
    }
    if (errorMessage.includes("422")) {
      return "Please check your email and password format.";
    }
    if (errorMessage.includes("500")) {
      return "Server error. Please try again later.";
    }
    return errorMessage;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Clear any existing tokens before login attempt
    clearAuthToken();
    
    try {
        const response = await authService.employeeLogin(email, password);
        
        // Backend returns: { token, employee_id, message }
        // (not access_token — the field is 'token')
        const token = response?.token || response?.access_token;
        const employeeId = response?.employee_id || response?.id || null;
        
        if (response && token) {
            // 1. Store the Bearer token in localStorage ('access_token' key)
            setAuthToken(token);
            
            // 2. Store employee identity with is_employee sentinel
            //    This is how AuthProvider & useCurrentUser detect employee sessions
            const userData = {
              is_employee: true,       // detection sentinel
              employee_id: employeeId, // = 5 from API
              email: email,
              name: response.name || response.user?.name || null,
            };
            localStorage.setItem('current_user', JSON.stringify(userData));
            
            // 3. Prime the auth store
            setAuth({
              role: { slug: 'employee', name: 'Employee' },
              permissions: [],
              user_id: employeeId,
            });
            
            success('Login successful! Redirecting to employee portal...');
            
            const redirectUrl = searchParams.get('redirect') || '/employee';
            setTimeout(() => router.replace(redirectUrl), 600);
        } else {
            error('Login failed. No authentication token received.');
        }
    } catch (err) {
        console.error("Employee login error", err);
        const friendlyMessage = parseValidationError(err.message || "Login failed. Please check your credentials.");
        error(friendlyMessage);
    } finally {
        setLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-zinc-800 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400 font-medium">Redirecting to portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-zinc-950 text-white transition-colors duration-300 font-sans selection:bg-red-500/30 selection:text-red-200">
      
      {/* Left Panel: Portal Branding & Visual Features */}
      {/* <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-zinc-950 via-zinc-900 to-red-950/40 p-8 md:p-16 flex-col justify-between relative overflow-hidden md:border-r border-zinc-900"> */}
        
        {/* Subtle decorative background gradients/grids */}
        {/* <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-zinc-800/20 rounded-full blur-[120px] pointer-events-none"></div> */}

        {/* Brand Header */}
        {/* <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center p-1.5 overflow-hidden shrink-0 border border-white/10 shadow-lg">
            <img src="/logo.png" alt="Unixparts Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="font-black tracking-wider text-sm leading-tight text-white uppercase block">Unixparts</span>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block">Self Service Portal</span>
          </div>
        </div> */}

        {/* Features list / Visual representation */}
        {/* <div className="max-w-md mx-auto md:ml-12 my-12 md:my-auto space-y-8 relative z-10"> */}
          {/* <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" /> Secure Employee Sign-In
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Manage your <br className="hidden md:inline" />
              <span className="bg-gradient-to-r from-white via-zinc-200 to-red-500 bg-clip-text text-transparent">work profile</span> online
            </h1>
            <p className="text-zinc-400 text-base md:text-lg leading-relaxed font-medium">
              Log in with your corporate or personal registered email to submit attendance, request leaves, upload documents, and view your career progress.
            </p>
          </div> */}

          {/* <div className="space-y-4 border-t border-zinc-950/50 pt-6"> */}
            {/* <div className="flex items-start gap-3.5">
              <div className="bg-white/5 border border-white/10 p-2 rounded-xl text-red-500 mt-0.5 shadow-md">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-zinc-200 text-sm md:text-base">Real-Time Attendance</h4>
                <p className="text-xs md:text-sm text-zinc-500 font-medium">Clock in and clock out dynamically, review history and monthly logs.</p>
              </div>
            </div> */}

            {/* <div className="flex items-start gap-3.5">
              <div className="bg-white/5 border border-white/10 p-2 rounded-xl text-red-500 mt-0.5 shadow-md">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-zinc-200 text-sm md:text-base">Leave & Document Management</h4>
                <p className="text-xs md:text-sm text-zinc-500 font-medium">Submit leave requests and upload passport/visa documents safely.</p>
              </div>
            </div> */}

            {/* <div className="flex items-start gap-3.5">
              <div className="bg-white/5 border border-white/10 p-2 rounded-xl text-red-500 mt-0.5 shadow-md">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-zinc-200 text-sm md:text-base">Salary & Position Timelines</h4>
                <p className="text-xs md:text-sm text-zinc-500 font-medium">Monitor your active salary rates and position transition timeline history.</p>
              </div>
            </div> */}
          {/* </div>
        </div> */}

        {/* Footer info */}
        {/* <div className="text-xs text-gray-400 dark:text-zinc-600 font-medium relative z-10 hidden md:block">
          &copy; {new Date().getFullYear()} Unixparts Co. All rights reserved. Secure Gateway.
        </div>
      </div> */}

      {/* Right Panel: Sleek Dark Login Form */}
      <div className="w-full w-1/2 bg-white dark:bg-zinc-950 p-8 md:p-16 flex items-center justify-center relative">
        
        <div className="max-w-md w-full mx-auto space-y-8 relative z-10">
          
          {/* Logo on Mobile */}
          <div className="flex flex-col items-center gap-2.5 ">
            <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-white/10 flex items-center justify-center p-1.5 border border-gray-200 dark:border-white/10 shadow-lg">
              <img src="/logo.png" alt="Unixparts Logo" className="w-full h-full object-contain" />
            </div>
            <div className="text-center">
              <span className="font-black tracking-wider text-sm leading-tight text-gray-900 dark:text-white uppercase block">Unixparts</span>
              <span className="text-[10px] text-gray-500 dark:text-zinc-500 font-bold uppercase tracking-widest block">Self Service Portal</span>
            </div>
          </div>
          
          {/* Header & Theme Control */}
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900 dark:text-white uppercase">Employee Access</h2>
              <p className="text-sm md:text-base text-gray-500 dark:text-zinc-500 font-medium">Sign in to access your employee portal</p>
            </div>
            <ThemeToggle className="p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 transition-colors shadow-lg" />
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleLogin}>
            
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Work or Personal Email</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-zinc-600 group-focus-within:text-red-500 transition-colors" />
                <input 
                  type="email" 
                  placeholder="name@company.com"
                  autoComplete="email"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 rounded-xl focus:outline-none transition-all text-gray-900 dark:text-white text-base shadow-inner"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required={true}
                disabled={loading}
                size="large"
                variant="login"
                label="Secure Password"
                autoComplete="current-password"
              />
            </div>

            {/* Login Options */}
            <div className="flex items-center justify-between text-sm font-medium">
              <label className="flex items-center gap-2 cursor-pointer select-none text-gray-500 hover:text-gray-700 dark:hover:text-zinc-350 transition-colors">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-gray-300 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 text-red-600 focus:ring-red-500 focus:ring-offset-white dark:focus:ring-offset-zinc-950" 
                />
                <span>Remember me</span>
              </label>
              <a href="#" className="text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors">Forgot password?</a>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-extrabold py-3.5 rounded-xl shadow-lg shadow-red-600/10 hover:shadow-red-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Quick links to normal dashboard for admins */}
          <div className="border-t border-gray-150 dark:border-zinc-900 pt-6 text-center text-xs md:text-sm text-gray-505 dark:text-zinc-500">
            Are you a system administrator?{" "}
            <Link href="/" className="text-gray-900 dark:text-white font-bold hover:text-red-500 dark:hover:text-red-400 transition-colors hover:underline">
              Go to Admin Login
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function EmployeeLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-zinc-800 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400 font-medium">Loading Employee Gateway...</p>
        </div>
      </div>
    }>
      <EmployeeLoginForm />
    </Suspense>
  );
}
