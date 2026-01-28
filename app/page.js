"use client";

import { Check, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "./dashboard/ThemeToggle";
import { authService } from "./lib/services/authService";
import { setAuthToken, clearAuthToken } from "./lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    // Clear any existing tokens (including mock tokens) before login attempt
    clearAuthToken();
    
    try {
        const response = await authService.login(email, password);
        if (response && response.access_token) {
            setAuthToken(response.access_token);
            // Also store user info if available
            if (response.user) {
                localStorage.setItem("current_user", JSON.stringify(response.user));
            }
            router.push("/dashboard");
        } else {
            setError("Login failed. No token received.");
        }
    } catch (err) {
        console.error("Login error", err);
        
        // DEVELOPMENT FALLBACK: Only use mock login if the server is physically unreachable
        if (err.message.includes('Network error') || err.message.includes('Failed to fetch')) {
            console.warn("API unreachable, using 'OFFLINE_MODE' for development");
            const mockToken = "mock_OFFLINE_USER_" + Date.now();
            setAuthToken(mockToken);
            localStorage.setItem("current_user", JSON.stringify({
                id: 1,
                name: "Demo User",
                email: "demo@unixparts.com",
                role: { name: "Administrator" }
            }));
            router.push("/dashboard");
            return;
        }
        
        setError(err.message || "Login failed. Please check your credentials.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-zinc-950 transition-colors duration-300">
      {/* Left Panel - Branding */}
      <div className="w-full md:w-1/2 bg-black text-white p-8 md:p-16 flex flex-col justify-center relative overflow-hidden">
        <div className="max-w-lg mx-auto md:ml-20 space-y-8 relative z-10 transition-all duration-700 ease-in-out transform translate-y-0 opacity-100">
          <div className="w-16 h-16 rounded-lg flex items-center justify-center mb-12 overflow-hidden p-1">
             <img 
                src="/logo.png" 
                alt="Unixparts Logo" 
                className="w-full h-full object-contain"
             />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Welcome to Unixparts
          </h1>
          
          <p className="text-gray-400 text-lg leading-relaxed">
            Access the internal Unixparts system to manage inventory, sales, warehouse operations, suppliers, and financial workflows across all branches—securely and efficiently.
          </p>

          <div className="space-y-6 pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-2 rounded-lg">
                <Check className="w-5 h-5 text-white" />
              </div>
              <span className="text-gray-300">Inventory, containers, and warehouse operations</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-2 rounded-lg">
                <Check className="w-5 h-5 text-white" />
              </div>
              <span className="text-gray-300">Sales, invoicing, and customer accounts</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-2 rounded-lg">
                <Check className="w-5 h-5 text-white" />
              </div>
              <span className="text-gray-300">Supplier settlements and expense tracking</span>
            </div>
          </div>
        </div>
        
        {/* Subtle background glow */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-red-600/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full md:w-1/2 bg-white dark:bg-zinc-950 p-8 md:p-16 flex items-center justify-center relative transition-colors duration-300">
        <div className="max-w-xl w-full mx-auto space-y-8">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h2 className="text-5xl font-black tracking-tight text-gray-900 dark:text-white">Welcome back</h2>
              <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">Sign in to your account to continue</p>
            </div>
            <ThemeToggle className="p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-sm" />
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label className="text-lg font-bold text-gray-700 dark:text-gray-300">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                <input 
                  type="email" 
                  placeholder="Enter Email Address"
                  autoComplete="email"
                  className="w-full pl-11 pr-4 py-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all dark:text-white text-lg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-lg font-bold text-gray-700 dark:text-gray-300">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Enter Password"
                  autoComplete="current-password"
                  className="w-full pl-11 pr-12 py-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all dark:text-white text-lg"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                <span className="text-base text-gray-600 dark:text-gray-400">Remember me</span>
              </label>
              <a href="#" className="text-base text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-colors">Forgot password?</a>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-black dark:bg-white dark:text-black text-white font-medium py-4 rounded-xl shadow-lg shadow-black/10 hover:shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-lg disabled:opacity-70 disabled:cursor-not-allowed"
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
