"use client";

import { Check, Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "../dashboard/ThemeToggle";
import { authService } from "../lib/services/authService";
import PasswordInput from "../components/PasswordInput";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    if (!name || !email || !password) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
        const response = await authService.register({
          name,
          email,
          password,
          role_id: parseInt(roleId)
        });
        
        if (response && response.access_token) {
            localStorage.setItem("access_token", response.access_token);
            // Store user info if available, or create a basic object from state
            const userInfo = response.user || { name, email, role: { name: "User" } };
            localStorage.setItem("current_user", JSON.stringify(userInfo));
            router.push("/dashboard");
        } else {
            setError("Signup successful! Please login.");
            setTimeout(() => router.push("/"), 2000);
        }
    } catch (err) {
        console.error("Signup error", err);
        setError(err.message || "Signup failed. Please try again.");
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
            Join Unixparts
          </h1>
          
          <p className="text-gray-400 text-lg leading-relaxed">
            Create your account to access the internal Unixparts system and manage inventory, sales, warehouse operations, suppliers, and financial workflows.
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
          </div>
        </div>
        
        {/* Subtle background glow */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-red-600/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Right Panel - Signup Form */}
      <div className="w-full md:w-1/2 bg-white dark:bg-zinc-950 p-8 md:p-16 flex items-center justify-center relative transition-colors duration-300">
        <div className="max-w-xl w-full mx-auto space-y-8">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h2 className="text-5xl font-black tracking-tight text-gray-900 dark:text-white">Create Account</h2>
              <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">Sign up to get started</p>
            </div>
            <ThemeToggle className="p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-sm" />
          </div>

          <form className="space-y-5" onSubmit={handleSignup}>
            <div className="space-y-2">
              <label className="text-lg font-bold text-gray-700 dark:text-gray-300">Full Name</label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Enter your full name"
                  className="w-full pl-11 pr-4 py-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all dark:text-white text-lg"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-lg font-bold text-gray-700 dark:text-gray-300">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                <input 
                  type="email" 
                  placeholder="Enter Email Address"
                  className="w-full pl-11 pr-4 py-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all dark:text-white text-lg"
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
              autoComplete="new-password"
            />

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-black dark:bg-white dark:text-black text-white font-medium py-4 rounded-xl shadow-lg shadow-black/10 hover:shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <p className="text-center text-base text-gray-500 dark:text-gray-400">
            Already have an account? <Link href="/" className="text-black dark:text-white font-bold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
