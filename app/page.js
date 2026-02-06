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

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { success, error } = useToast();

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkExistingAuth = async () => {
      const token = getAuthToken();
      if (token) {
        // User already has a token, redirect to dashboard
        console.log('✅ User already authenticated, redirecting to dashboard');
        router.replace('/dashboard');
      } else {
        setIsCheckingAuth(false);
      }
    };
    
    checkExistingAuth();
  }, [router]);

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
            
            success("Login successful! Redirecting to dashboard...");
            
            // Get redirect URL from query params or default to dashboard
            const redirectUrl = searchParams.get('redirect') || '/dashboard';
            
            // Small delay to show success message
            setTimeout(() => {
              router.push(redirectUrl);
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
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F8FAFC] dark:bg-zinc-950 transition-colors duration-300">
      {/* Left Panel - Branding with Abstract Background */}
      <div className="w-full md:w-1/2 bg-black text-white p-8 md:p-16 flex flex-col justify-center relative overflow-hidden bg-cover bg-center bg-no-repeat" style={{backgroundImage: 'url(/abuinix.jpeg)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
        {/* Custom gradient overlay for better visual appeal */}
        <div className="absolute inset-0" style={{background: 'linear-gradient(180deg, rgba(30, 30, 30, 0) 0%, #1E1E1E 100%)'}}></div>
        
        <div className="max-w-lg mx-auto md:ml-20 space-y-8 relative z-10 transition-all duration-700 ease-in-out transform translate-y-0 opacity-100">
          <div className="w-16 h-16 rounded-lg flex items-center justify-center mb-12 overflow-hidden p-1">
             <img 
                src="/logo.png" 
                alt="Unixparts Logo" 
                className="w-full h-full object-contain"
             />
          </div>
          
          <h1 className="text-3xl md:text-3xl font-bold tracking-tight drop-shadow-2xl text-white">
            Welcome to Unixparts
          </h1>
          
          <p className="text-gray-100 text-lg leading-relaxed drop-shadow-xl">
            Access the internal Unixparts system to manage inventory, sales, warehouse operations, suppliers, and financial workflows across all branches—securely and efficiently.
          </p>

          <div className="space-y-6 pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/30 p-2 rounded-lg backdrop-blur-sm border border-white/20">
                <Check className="w-5 h-5 text-white" />
              </div>
              <span className="text-gray-100 drop-shadow-lg">Inventory, containers, and warehouse operations</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/30 p-2 rounded-lg backdrop-blur-sm border border-white/20">
                <Check className="w-5 h-5 text-white" />
              </div>
              <span className="text-gray-100 drop-shadow-lg">Sales, invoicing, and customer accounts</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/30 p-2 rounded-lg backdrop-blur-sm border border-white/20">
                <Check className="w-5 h-5 text-white" />
              </div>
              <span className="text-gray-100 drop-shadow-lg">Supplier settlements and expense tracking</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Clean Login Form */}
      <div className="w-full md:w-1/2 bg-white dark:bg-zinc-950 p-8 md:p-16 flex items-center justify-center relative transition-colors duration-300">
        <div className="max-w-xl w-full mx-auto space-y-8 relative z-10">
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