import React from "react";
import { ShieldCheck, Mail, Lock, ArrowRight, Sparkles, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

interface LoginScreenProps {
  onNavigateToScreen: (screenId: string) => void;
  onLoginSuccess: (user: { id: string; name: string; email: string; role: string; tier: string; approved: boolean }) => void;
}

export default function LoginScreen({ onNavigateToScreen, onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = React.useState("temf2006@gmail.com");
  const [password, setPassword] = React.useState("••••••••");
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [roleMode, setRoleMode] = React.useState<"homeowner" | "provider" | "admin">("homeowner");

  const handleStandardLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setIsLoading(true);
    setError("");

    setTimeout(() => {
      setIsLoading(false);
      
      if (roleMode === "admin") {
        onLoginSuccess({
          id: "usr_admin",
          name: "Master Admin Vance",
          email: "admin@homepulse.io",
          role: "admin",
          tier: "Enterprise",
          approved: true
        });
        onNavigateToScreen("screen-admin");
      } else if (roleMode === "provider") {
        onLoginSuccess({
          id: "usr_pro_1",
          name: "Seattle Air & Heating",
          email: email.toLowerCase() === "service@seattleair.com" ? email : "service@seattleair.com",
          role: "provider",
          tier: "Free",
          approved: true
        });
        onNavigateToScreen("screen-provider-dashboard");
      } else {
        onLoginSuccess({
          id: "usr_1",
          name: "Marcus Vance",
          email: email,
          role: "homeowner",
          tier: "Basic",
          approved: true
        });
        onNavigateToScreen("screen-location-collection");
      }
    }, 1000);
  };

  const handleGoogleClick = () => {
    onNavigateToScreen("screen-google-login");
  };

  return (
    <div className="w-full h-full flex flex-col justify-between p-6 bg-gradient-to-b from-[#0A0A0A] via-[#101820] to-[#0A0A0A] relative text-white font-sans overflow-y-auto scrollbar-none">
      
      {/* Glow effect */}
      <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full filter blur-[70px] opacity-10 pointer-events-none transition-all duration-300 ${
        roleMode === "admin" ? "bg-red-600" : roleMode === "provider" ? "bg-amber-500" : "bg-blue-600"
      }`}></div>

      {/* Brand Header */}
      <div className="flex flex-col items-center text-center mt-6">
        <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-tr flex items-center justify-center shadow-lg mb-3 transition-all duration-300 ${
          roleMode === "admin" 
            ? "from-red-600 to-rose-700 shadow-red-500/10" 
            : roleMode === "provider" 
            ? "from-amber-500 to-amber-700 shadow-amber-500/10" 
            : "from-blue-600 to-indigo-700 shadow-blue-500/10"
        }`}>
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>
        <h1 className="text-xl font-extrabold tracking-tight text-white font-display">Welcome to HomePulse</h1>
        <p className="text-[10px] text-zinc-400 mt-1 max-w-[260px]">
          Access real-time telemetry, smart HVAC optimization, and certified local contractor dispatch.
        </p>
      </div>

      {/* Login Card */}
      <div className={`my-6 bg-[#111A24]/90 border rounded-2xl p-5 shadow-xl relative overflow-hidden transition-all duration-300 ${
        roleMode === "admin" 
          ? "border-red-900/40 shadow-red-950/20" 
          : roleMode === "provider" 
          ? "border-amber-900/40 shadow-amber-950/20" 
          : "border-slate-800 shadow-black/40"
      }`}>
        <div className={`absolute top-0 right-0 w-24 h-24 rounded-full filter blur-xl opacity-20 ${
          roleMode === "admin" ? "bg-red-500/10" : roleMode === "provider" ? "bg-amber-500/10" : "bg-blue-500/10"
        }`}></div>
        
        {/* Role Segment Toggle */}
        <div className="flex bg-black/45 rounded-xl p-1 mb-4 border border-slate-800/80 gap-1">
          <button
            type="button"
            onClick={() => {
              setRoleMode("homeowner");
              setEmail("temf2006@gmail.com");
              setPassword("••••••••");
            }}
            className={`flex-1 text-center py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              roleMode === "homeowner" 
                ? "bg-[#2563EB] text-white font-extrabold shadow-sm" 
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Homeowner
          </button>
          <button
            type="button"
            onClick={() => {
              setRoleMode("provider");
              setEmail("service@seattleair.com");
              setPassword("provider");
            }}
            className={`flex-1 text-center py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              roleMode === "provider" 
                ? "bg-amber-600 text-white font-extrabold shadow-sm" 
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Certified Pro
          </button>
          <button
            type="button"
            onClick={() => {
              setRoleMode("admin");
              setEmail("admin@homepulse.io");
              setPassword("admin");
            }}
            className={`flex-1 text-center py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              roleMode === "admin" 
                ? "bg-red-600 text-white font-extrabold shadow-sm" 
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            App Admin
          </button>
        </div>

        <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest mb-4">
          {roleMode === "admin" 
            ? "Administrative Authorization" 
            : roleMode === "provider" 
            ? "Provider Partner Verification" 
            : "Account Authentication"}
        </h3>
        
        <form onSubmit={handleStandardLogin} className="space-y-3.5">
          {error && (
            <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-[10px] text-red-400">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wide block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                placeholder={roleMode === "admin" ? "admin@homepulse.io" : roleMode === "provider" ? "service@seattleair.com" : "name@domain.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#070C12] border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-[11px] text-white focus:outline-none focus:border-blue-500 font-sans transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wide block mb-1">Security Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="password"
                placeholder={roleMode === "admin" ? "admin" : roleMode === "provider" ? "provider" : "••••••••"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#070C12] border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-[11px] text-white focus:outline-none focus:border-blue-500 font-mono transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full text-white font-bold text-xs py-3 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 border shadow-lg cursor-pointer ${
              roleMode === "admin" 
                ? "bg-red-600 hover:bg-red-500 border-red-400/20" 
                : roleMode === "provider"
                ? "bg-amber-600 hover:bg-amber-500 border-amber-400/20"
                : "bg-[#2563EB] hover:bg-blue-600 border-blue-400/20"
            }`}
          >
            <span>{isLoading ? "Verifying Credentials..." : roleMode === "admin" ? "Sign In as Administrator" : roleMode === "provider" ? "Sign In as Service Provider" : "Sign In to Dashboard"}</span>
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Separator */}
        <div className="relative my-5 flex items-center">
          <div className="flex-grow border-t border-slate-800/80"></div>
          <span className="flex-shrink mx-3 text-[9px] font-mono text-zinc-500 uppercase tracking-wider">or continue with</span>
          <div className="flex-grow border-t border-slate-800/80"></div>
        </div>

        {/* Google OAuth Login Button */}
        <button
          onClick={handleGoogleClick}
          className="w-full bg-white hover:bg-neutral-100 text-neutral-800 font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center space-x-2.5 shadow-md border border-neutral-300 cursor-pointer"
        >
          {/* Flat Google G Logo */}
          <svg className="w-4.5 h-4.5 flex-shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span className="font-sans">Sign in with Google</span>
        </button>
      </div>

      {/* Footer System Specs */}
      <div className="mb-4 space-y-3">
        <div className="flex items-center justify-center space-x-2 text-[9px] text-zinc-500 font-mono bg-[#101820]/40 border border-slate-800/50 rounded-full py-1 px-3">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
          <span>AES-256 END-TO-END SAAS ENCRYPTION</span>
        </div>
        <p className="text-[9px] text-zinc-600 text-center">
          By signing in, you agree to the HomePulse terms of service.
        </p>
      </div>

    </div>
  );
}
