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
    
    // Clear any existing tokens before login attempt
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
        setError(err.message || "Login failed. Please check your credentials.");
    } finally {
        setLoading(false);
    }
  };

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

            <div className="space-y-2">
              <label className="text-lg font-bold text-gray-800 dark:text-gray-200">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Enter Password"
                  autoComplete="current-password"
                  className="w-full pl-11 pr-12 py-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all dark:text-white text-lg shadow-sm"
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
                <span className="text-base text-gray-600 dark:text-gray-400 font-medium">Remember me</span>
              </label>
              <a href="#" className="text-base text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium">Forgot password?</a>
            </div>

            {error && <p className="text-red-600 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">{error}</p>}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-black dark:bg-white dark:text-black text-white font-bold py-4 rounded-xl shadow-lg shadow-black/10 hover:shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-lg disabled:opacity-70 disabled:cursor-not-allowed"
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
