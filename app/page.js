"use client";

import { Check, Mail, Lock, ShieldCheck, ArrowRight, UserCheck } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "./dashboard/ThemeToggle";
import { authService } from "./lib/services/authService";
import { setAuthToken, clearAuthToken, getAuthToken } from "./lib/api";
import PasswordInput from "./components/PasswordInput";
import { useToast } from "./components/Toast";
import useAuthStore from "./lib/store/authStore";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false); // Start as false for instant render
  const { success, error } = useToast();
  const { setAuth, role, isInitialized } = useAuthStore();

  // Check if user is already authenticated on mount (one-time check)
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      console.log('✅ User already authenticated, redirecting');
      setIsCheckingAuth(true);
      
      // Get redirect URL from query params or default based on role
      let redirectUrl = searchParams.get('redirect');
      if (!redirectUrl) {
        // Check role from store or localStorage
        const currentRole = useAuthStore.getState().role;
        if (currentRole?.slug === 'employee' || currentRole?.slug === 'staff') {
          redirectUrl = '/employee';
        } else {
          // Check if employee from localStorage
          try {
            const userStr = localStorage.getItem('current_user');
            if (userStr) {
              const user = JSON.parse(userStr);
              if (user && user.employee_id) {
                redirectUrl = '/employee';
              }
            }
          } catch (e) {
            // ignore
          }
          redirectUrl = redirectUrl || '/dashboard';
        }
      }
      router.replace(redirectUrl);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Helper function to parse validation errors into user-friendly messages
  const parseValidationError = (errorMessage) => {
    if (errorMessage.includes("body.email: value is not a valid email address")) {
      return "Please enter a valid email address.";
    }
    if (errorMessage.includes("body.password: String should have at least 6 characters")) {
      return "Password must be at least 6 characters long.";
    }
    if (errorMessage.includes("body.email") && errorMessage.includes("@-sign")) {
      return "Please enter a valid email address with exactly one @ symbol.";
    }
    if (errorMessage.includes("Invalid credentials") || errorMessage.includes("401")) {
      return "Invalid email or password. Please check your credentials and try again.";
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
        const response = await authService.login(email, password);
        if (response && response.access_token) {
            // Store token in localStorage as fallback (cookie is set by API route)
            setAuthToken(response.access_token);
            
            // Also store user info if available
            if (response.user) {
                localStorage.setItem("current_user", JSON.stringify(response.user));
            }
            
            // Fetch user permissions
            let permissionsData = null;
            try {
                permissionsData = await authService.getUserPermissions();
                setAuth(permissionsData);
            } catch (permErr) {
                console.error("Failed to fetch permissions:", permErr);
                // Continue anyway - permissions will be fetched by AuthProvider
            }
            
            success("Login successful! Redirecting to dashboard...");
            
            // Get redirect URL from query params or default based on role
            let redirectUrl = searchParams.get('redirect');
            if (!redirectUrl) {
              const roleSlug = permissionsData?.role?.slug;
              if (roleSlug === 'employee' || roleSlug === 'staff') {
                redirectUrl = '/employee';
              } else {
                redirectUrl = '/dashboard';
              }
            }
            
            // Small delay to show success message
            setTimeout(() => {
              router.replace(redirectUrl);
            }, 500);
        } else {
            error("Login failed. No authentication token received.");
        }
    } catch (err) {
        console.error("Login error", err);
        const friendlyMessage = parseValidationError(err.message || "Login failed. Please check your credentials.");
        error(friendlyMessage);
    } finally {
        setLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-zinc-800 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400 font-medium">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-zinc-950 text-white transition-colors duration-300 font-sans selection:bg-red-500/30 selection:text-red-200">
      
      {/* Left Panel: Portal Branding & Visual Features */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-zinc-950 via-zinc-900 to-red-950/40 p-8 md:p-16 flex flex-col justify-between relative overflow-hidden border-b md:border-b-0 md:border-r border-zinc-900">
        
        {/* Subtle decorative background gradients/grids */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-zinc-800/20 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Brand Header */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center p-1.5 overflow-hidden shrink-0 border border-white/10 shadow-lg">
            <img src="/logo.png" alt="Unixparts Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="font-black tracking-wider text-sm leading-tight text-white uppercase block">Unixparts</span>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block">Administration Panel</span>
          </div>
        </div>

        {/* Features list / Visual representation */}
        <div className="max-w-md mx-auto md:ml-12 my-12 md:my-auto space-y-8 relative z-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" /> Secure Admin Sign-In
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Internal operations <br className="hidden md:inline" />
              & <span className="bg-gradient-to-r from-white via-zinc-200 to-red-500 bg-clip-text text-transparent">inventory portal</span>
            </h1>
            <p className="text-zinc-400 text-base md:text-lg leading-relaxed font-medium">
              Access the internal Unixparts system to manage inventory, sales, warehouse operations, suppliers, and financial workflows.
            </p>
          </div>

          <div className="space-y-4 border-t border-zinc-950/50 pt-6">
            <div className="flex items-start gap-3.5">
              <div className="bg-white/5 border border-white/10 p-2 rounded-xl text-red-500 mt-0.5 shadow-md">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-zinc-200 text-sm md:text-base">Inventory Control</h4>
                <p className="text-xs md:text-sm text-zinc-500 font-medium">Monitor stock listings, process item dismantles, and track purchase orders.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="bg-white/5 border border-white/10 p-2 rounded-xl text-red-500 mt-0.5 shadow-md">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-zinc-200 text-sm md:text-base">Sales & Invoicing</h4>
                <p className="text-xs md:text-sm text-zinc-500 font-medium">Generate tax invoices, manage customer credit limits, and record payments.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="bg-white/5 border border-white/10 p-2 rounded-xl text-red-500 mt-0.5 shadow-md">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-zinc-200 text-sm md:text-base">System Administration</h4>
                <p className="text-xs md:text-sm text-zinc-500 font-medium">Manage branch settings, employee records, roles, and granular permissions.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xs text-zinc-600 font-medium relative z-10 hidden md:block">
          &copy; {new Date().getFullYear()} Unixparts Co. All rights reserved. Secure Gateway.
        </div>
      </div>

      {/* Right Panel: Sleek Dark Login Form */}
      <div className="w-full md:w-1/2 bg-zinc-950 p-8 md:p-16 flex items-center justify-center relative border-t md:border-t-0 border-zinc-900">
        
        <div className="max-w-md w-full mx-auto space-y-8 relative z-10">
          
          {/* Header & Theme Control */}
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase">Admin Access</h2>
              <p className="text-sm md:text-base text-zinc-500 font-medium">Sign in to your account to continue</p>
            </div>
            <ThemeToggle className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors shadow-lg" />
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleLogin}>
            
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-red-500 transition-colors" />
                <input 
                  type="email" 
                  placeholder="Enter Email Address"
                  autoComplete="email"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-zinc-900/50 border border-zinc-800 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 rounded-xl focus:outline-none transition-all text-white text-base shadow-inner"
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
                placeholder="Enter Password"
                required={true}
                disabled={loading}
                size="large"
                variant="login"
                label="Password"
                autoComplete="current-password"
              />
            </div>

            {/* Login Options */}
            <div className="flex items-center justify-between text-sm font-medium">
              <label className="flex items-center gap-2 cursor-pointer select-none text-zinc-500 hover:text-zinc-350 transition-colors">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-zinc-800 bg-zinc-900 text-red-600 focus:ring-red-500 focus:ring-offset-zinc-950" 
                />
                <span>Remember me</span>
              </label>
              <a href="#" className="text-zinc-500 hover:text-red-400 transition-colors">Forgot password?</a>
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
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Quick links to self service for employees */}
          <div className="border-t border-zinc-900 pt-6 text-center text-xs md:text-sm text-zinc-500">
            Are you looking for employee self-service?{" "}
            <Link href="/employee/login" className="text-white font-bold hover:text-red-400 transition-colors hover:underline">
              Go to Employee Login
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-zinc-800 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400 font-medium">Loading...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}