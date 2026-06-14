"use client";

import { Check, Mail } from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-zinc-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-black dark:border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen justify-center flex flex-col md:flex-row bg-[#F8FAFC] dark:bg-zinc-950 transition-colors duration-300">
      {/* Left Panel - Branding with Abstract Background */}
      {/* <div className="w-full md:w-1/2 bg-black text-white p-8 md:p-16 flex flex-col justify-center relative overflow-hidden"> */}
        {/* <div className="max-w-lg mx-auto md:ml-20 space-y-8 relative z-10 transition-all duration-700 ease-in-out transform translate-y-0 opacity-100"> */}
          {/* <div className="w-16 h-16 rounded-lg flex items-center justify-center mb-12 overflow-hidden p-1 bg-white">
             <img 
                src="/logo.png" 
                alt="Unixparts Logo" 
                className="w-full h-full object-contain"
             />
          </div> */}
          
          {/* <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Welcome to Unixparts
          </h1>
          
          <p className="text-gray-400 text-lg leading-relaxed">
            Access the internal Unixparts system to manage inventory, sales, warehouse operations, suppliers, and financial workflows.
          </p>

          <div className="space-y-6 pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-2 rounded-lg">
                <Check className="w-5 h-5 text-white" />
              </div>
              <span className="text-gray-300">Secure access to all modules</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-2 rounded-lg">
                <Check className="w-5 h-5 text-white" />
              </div>
              <span className="text-gray-300">Real-time data synchronization</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-2 rounded-lg">
                <Check className="w-5 h-5 text-white" />
              </div>
              <span className="text-gray-300">Multi-branch support</span>
            </div>
          </div> */}
        {/* </div> */}
        
        {/* Subtle background glow */}
        {/* <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-red-600/10 rounded-full blur-[100px]"></div> */}
      {/* </div> */}
      
      {/* Right Panel - Clean Login Form */}
      <div className="w-full md:w-1/2 bg-white dark:bg-zinc-950 p-8 md:p-16 flex items-center justify-center relative transition-colors duration-300">
        <div className="max-w-xl w-full mx-auto space-y-8 relative z-10">
          
          {/* Mobile Logo */}
          <div className=" flex justify-center mb-6">
             <div className="w-16 h-16 rounded-lg overflow-hidden p-1 bg-black dark:bg-zinc-900">
               <img 
                  src="/logo.png" 
                  alt="Unixparts Logo" 
                  className="w-full h-full object-contain"
               />
             </div>
          </div>

          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Welcome back</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">Sign in to your account to continue</p>
            </div>
            <ThemeToggle className="p-2.5 rounded-xl bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shadow-sm" />
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label className="text-lg font-bold text-gray-800 dark:text-gray-200">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                <input 
                  type="email" 
                  placeholder="Enter Email Address"
                  autoComplete="email"
                  className="w-full pl-11 pr-4 py-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all dark:text-white text-lg shadow-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

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

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                <span className="text-base text-gray-600 dark:text-gray-400 font-medium">Remember me</span>
              </label>
              <a href="#" className="text-base text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium">Forgot password?</a>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-black dark:bg-white dark:text-black text-white font-bold py-4 rounded-xl shadow-lg shadow-black/10 hover:shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-lg disabled:opacity-70 disabled:cursor-not-allowed btn-primary"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-base text-gray-500 dark:text-gray-400">
            Don't have an account? <Link href="/signup" className="text-black dark:text-white font-bold hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-zinc-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-black dark:border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}