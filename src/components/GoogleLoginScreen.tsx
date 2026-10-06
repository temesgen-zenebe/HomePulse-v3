import React from "react";
import { Shield, ChevronRight, UserCheck, AlertCircle, Info, Lock } from "lucide-react";

interface GoogleLoginScreenProps {
  onNavigateToScreen: (screenId: string) => void;
  onLoginSuccess: (user: { id: string; name: string; email: string; role: string; tier: string; approved: boolean }) => void;
  userEmail?: string;
}

export default function GoogleLoginScreen({ onNavigateToScreen, onLoginSuccess, userEmail = "temf2006@gmail.com" }: GoogleLoginScreenProps) {
  const [stage, setStage] = React.useState<"choose" | "consent">("choose");
  const [selectedEmail, setSelectedEmail] = React.useState(userEmail);
  const [isAuthorizing, setIsAuthorizing] = React.useState(false);

  const handleSelectAccount = (email: string) => {
    setSelectedEmail(email);
    setStage("consent");
  };

  const handleConfirmConsent = () => {
    setIsAuthorizing(true);
    setTimeout(() => {
      setIsAuthorizing(false);
      onLoginSuccess({
        id: "usr_google_1",
        name: selectedEmail === "temf2006@gmail.com" ? "Marcus Vance" : "Alternative User",
        email: selectedEmail,
        role: "homeowner",
        tier: "Basic",
        approved: true
      });
      onNavigateToScreen("screen-location-collection");
    }, 1200);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between bg-[#0B0F19] text-zinc-200 font-sans p-6 overflow-y-auto scrollbar-none">
      
      {/* Top Header representing Google Secure Auth Gateway */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
        <div className="flex items-center space-x-2">
          {/* Small Google multicolored circular indicator */}
          <div className="w-4 h-4 rounded-full border border-zinc-700 flex items-center justify-center bg-black">
            <span className="text-[9px] font-bold text-blue-400">G</span>
          </div>
          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">Google OAuth 2.0 Secure Gateway</span>
        </div>
        <div className="flex items-center space-x-1 text-emerald-400 text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
          <Lock className="w-3 h-3 text-emerald-400" />
          <span>SSL Active</span>
        </div>
      </div>

      {/* Main Authentic Google Box Wrapper */}
      <div className="my-auto flex flex-col items-center">
        <div className="w-full max-w-sm bg-[#121A2E] border border-slate-800/80 rounded-2xl shadow-2xl p-6 relative overflow-hidden">
          
          {/* Visual Multicolor Top bar */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-red-500 to-yellow-500"></div>

          {/* Centered Google Colorful Brand Logo */}
          <div className="flex flex-col items-center text-center mt-3 mb-6">
            <svg className="w-9 h-9" viewBox="0 0 24 24">
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
            
            <h2 className="text-md font-bold text-white mt-3 font-sans">
              {stage === "choose" ? "Choose an account" : "Grant Permission"}
            </h2>
            <p className="text-[10px] text-zinc-400 mt-1">
              to continue to <strong className="text-blue-400 font-semibold">HomePulse Care</strong>
            </p>
          </div>

          {/* STAGE 1: Choose Account */}
          {stage === "choose" ? (
            <div className="space-y-2">
              {/* Primary logged-in browser account choice */}
              <button
                onClick={() => handleSelectAccount("temf2006@gmail.com")}
                className="w-full p-3.5 rounded-xl bg-black/40 border border-slate-800/80 hover:bg-[#1E293B]/40 hover:border-blue-500/40 text-left transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  {/* Mock user avatar */}
                  <div className="w-8 h-8 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs uppercase">
                    MV
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-white">Marcus Vance</h4>
                    <p className="text-[9px] font-mono text-zinc-500">temf2006@gmail.com</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
              </button>

              {/* Alternative workspace account choice */}
              <button
                onClick={() => handleSelectAccount("developer@homepulse.io")}
                className="w-full p-3.5 rounded-xl bg-black/40 border border-slate-800/80 hover:bg-[#1E293B]/40 hover:border-blue-500/40 text-left transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center font-mono font-bold text-xs">
                    D
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-white">Sandbox Pro Resident</h4>
                    <p className="text-[9px] font-mono text-zinc-500">developer@homepulse.io</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
              </button>

              {/* Use another account simulation */}
              <button
                onClick={() => handleSelectAccount("custom_user@gmail.com")}
                className="w-full p-3 text-center text-[10.5px] font-medium text-blue-400 hover:text-blue-300 transition-colors mt-2"
              >
                Use another Google Account
              </button>
            </div>
          ) : (
            /* STAGE 2: OAuth Consent / Permission dialog */
            <div className="space-y-4">
              <div className="bg-[#090D16] rounded-xl p-3 border border-slate-800 flex items-start space-x-2.5">
                <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-[9.5px] text-zinc-400 leading-normal">
                  HomePulse requests OAuth permission to access and manage the following specifications:
                </p>
              </div>

              {/* Required Permissions checkmarks */}
              <div className="space-y-2 bg-[#090D16]/55 rounded-xl p-3.5 border border-slate-800/60 text-left">
                <div className="flex items-start space-x-2">
                  <div className="p-0.5 bg-blue-500/10 border border-blue-500/20 rounded mt-0.5">
                    <div className="w-2 h-2 bg-blue-500 rounded-sm"></div>
                  </div>
                  <div>
                    <h5 className="text-[10px] font-bold text-white">View Home Telemetry Nodes</h5>
                    <p className="text-[8.5px] text-zinc-500 leading-tight">Access real-time smart thermostat levels & HVAC health scores.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-2 pt-2 border-t border-slate-800/80">
                  <div className="p-0.5 bg-blue-500/10 border border-blue-500/20 rounded mt-0.5">
                    <div className="w-2 h-2 bg-blue-500 rounded-sm"></div>
                  </div>
                  <div>
                    <h5 className="text-[10px] font-bold text-white">Log Energy Efficiency Savings</h5>
                    <p className="text-[8.5px] text-zinc-500 leading-tight">Estimate monthly utility budgets based on appliance optimization.</p>
                  </div>
                </div>
              </div>

              {/* Warning/Terms summary */}
              <p className="text-[8.5px] text-zinc-500 text-center leading-normal">
                By clicking "Allow", you authorize this application to connect with your Google data according to our Privacy Policy and Terms of Use.
              </p>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-1">
                <button
                  onClick={() => setStage("choose")}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-zinc-300 font-bold text-[10px] rounded-lg transition-colors cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmConsent}
                  disabled={isAuthorizing}
                  className="flex-1 py-2 bg-[#2563EB] hover:bg-blue-600 disabled:opacity-50 text-white font-bold text-[10px] rounded-lg shadow-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isAuthorizing ? (
                    <span>Authorizing...</span>
                  ) : (
                    <>
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Allow Access</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Google Trust & Security Footer */}
      <div className="mt-4 text-center space-y-1.5 border-t border-slate-800/60 pt-4">
        <p className="text-[9px] text-zinc-500 font-mono flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-blue-500" />
          <span>Secured by Google Identity Services</span>
        </p>
        <p className="text-[8.5px] text-zinc-600">
          Google protects your credentials. Your Google account password is never shared with HomePulse.
        </p>
      </div>

    </div>
  );
}
