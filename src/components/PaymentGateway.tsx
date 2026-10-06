import React from "react";
import { 
  CreditCard, Lock, ShieldCheck, AlertCircle, RefreshCw, 
  Coins, Fingerprint, Sliders, CheckCircle2, ArrowLeft,
  Apple, Chrome, X, Sparkles, ArrowRight
} from "lucide-react";

interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  badge: string;
  tagline: string;
}

interface PaymentGatewayProps {
  plan: PaymentPlan;
  activePeriod: "monthly" | "annually";
  totalAmount: number;
  subtotal: number;
  taxAmount: number;
  taxRate: number;
  onPaymentSuccess: () => void;
  onCancel: () => void;
  addToast?: (title: string, description: string, type: "task" | "risk" | "info" | "success") => void;
}

export default function PaymentGateway({
  plan,
  activePeriod,
  totalAmount,
  subtotal,
  taxAmount,
  taxRate,
  onPaymentSuccess,
  onCancel,
  addToast
}: PaymentGatewayProps) {
  const [gatewayType, setGatewayType] = React.useState<"stripe" | "paypal" | "express" | "coinbase">("stripe");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [simulatedError, setSimulatedError] = React.useState(false);
  const [paymentError, setPaymentError] = React.useState<string | null>(null);

  // Stripe form fields
  const [stripeForm, setStripeForm] = React.useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
    zip: ""
  });
  const [cardFocusedField, setCardFocusedField] = React.useState<string | null>(null);

  // PayPal fields
  const [paypalStep, setPaypalStep] = React.useState<"login" | "review">("login");
  const [paypalEmail, setPaypalEmail] = React.useState("homeowner@pulse.com");
  const [paypalPassword, setPaypalPassword] = React.useState("••••••••");

  // Express biometrics
  const [expressWallet, setExpressWallet] = React.useState<"apple" | "google">("apple");
  const [expressSheetOpen, setExpressSheetOpen] = React.useState(false);
  const [expressStep, setExpressStep] = React.useState<"idle" | "scanning" | "completed">("idle");

  // Coinbase blockchain state
  const [cryptoSelected, setCryptoSelected] = React.useState<"BTC" | "ETH" | "USDC">("USDC");
  const [cryptoStep, setCryptoStep] = React.useState<"qr" | "detecting">("qr");
  const [cryptoProgress, setCryptoProgress] = React.useState(0);
  const [cryptoTimer, setCryptoTimer] = React.useState(600); // 10 minutes

  // Countdown for crypto
  React.useEffect(() => {
    let interval: any;
    if (gatewayType === "coinbase" && cryptoStep === "qr") {
      interval = setInterval(() => {
        setCryptoTimer((t) => (t > 0 ? t - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gatewayType, cryptoStep]);

  const formatTimer = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  // Helper formats
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length > 0 ? parts.join(" ") : v;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    }
    return v;
  };

  const getCardBrand = (num: string) => {
    const cleanNum = num.replace(/\s+/g, "");
    if (cleanNum.startsWith("4")) return { name: "Visa", color: "from-blue-600 to-sky-500", icon: "💳 VISA" };
    if (cleanNum.startsWith("5")) return { name: "Mastercard", color: "from-orange-600 to-amber-500", icon: "💳 MASTERCARD" };
    if (cleanNum.startsWith("3")) return { name: "American Express", color: "from-teal-600 to-cyan-500", icon: "💳 AMEX" };
    if (cleanNum.startsWith("6")) return { name: "Discover", color: "from-red-600 to-pink-500", icon: "💳 DISCOVER" };
    return { name: "Generic", color: "from-zinc-800 to-zinc-700", icon: "💳 CREDIT CARD" };
  };

  // Processing handlers
  const handleStripeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError(null);

    // Validation
    if (!stripeForm.name.trim()) {
      setPaymentError("Cardholder Name is required.");
      return;
    }
    if (!stripeForm.number || stripeForm.number.replace(/\s/g, "").length < 15) {
      setPaymentError("Invalid credit card number (must be at least 15 digits).");
      return;
    }
    if (!stripeForm.expiry || !stripeForm.expiry.includes("/") || stripeForm.expiry.length < 5) {
      setPaymentError("Invalid expiry date. Format as MM/YY (e.g., 12/28).");
      return;
    }
    const [monthStr] = stripeForm.expiry.split("/");
    const month = parseInt(monthStr, 10);
    if (isNaN(month) || month < 1 || month > 12) {
      setPaymentError("Invalid expiration month. Must be between 01 and 12.");
      return;
    }
    if (!stripeForm.cvv || stripeForm.cvv.length < 3) {
      setPaymentError("Invalid security code (CVV must be 3 or 4 digits).");
      return;
    }
    if (!stripeForm.zip || stripeForm.zip.trim().length < 4) {
      setPaymentError("Invalid postal code / Zip.");
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      if (simulatedError) {
        setIsProcessing(false);
        setPaymentError("Sandbox Decline: [STRIFE EX-102] Insufficient mock funds or invalid CVV token matching state.");
        if (addToast) {
          addToast("Payment Refused", "Sandbox mock simulator blocked the credit card authorization.", "risk");
        }
      } else {
        setIsProcessing(false);
        onPaymentSuccess();
      }
    }, 1800);
  };

  const handlePaypalSubmit = () => {
    setIsProcessing(true);
    setPaymentError(null);

    setTimeout(() => {
      setIsProcessing(false);
      if (simulatedError) {
        setPaymentError("PayPal decline code P-908: Simulated secure profile authorization failure.");
        if (addToast) {
          addToast("PayPal Declined", "Could not link recurring profile with sandbox PayPal wallet.", "risk");
        }
      } else {
        onPaymentSuccess();
      }
    }, 1500);
  };

  const triggerExpressBiometrics = (brand: "apple" | "google") => {
    setExpressWallet(brand);
    setExpressStep("idle");
    setExpressSheetOpen(true);
  };

  const processExpressBiometricScan = () => {
    setExpressStep("scanning");
    setTimeout(() => {
      if (simulatedError) {
        setExpressStep("idle");
        setExpressSheetOpen(false);
        if (addToast) {
          addToast("Biometrics Timed Out", "Simulated biometric handshake failed to respond.", "risk");
        }
      } else {
        setExpressStep("completed");
        setTimeout(() => {
          setExpressSheetOpen(false);
          onPaymentSuccess();
        }, 1000);
      }
    }, 2000);
  };

  const triggerCryptoCheck = () => {
    setCryptoStep("detecting");
    setCryptoProgress(0);

    const interval = setInterval(() => {
      setCryptoProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onPaymentSuccess();
          }, 800);
          return 100;
        }
        return p + 25;
      });
    }, 600);
  };

  const currentCardInfo = getCardBrand(stripeForm.number);

  return (
    <div className="w-full h-full flex flex-col justify-between text-white font-sans relative">
      
      {/* Scroll Area inside PaymentGateway */}
      <div className="flex-1 text-left">
        
        {/* Back navigation */}
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-[10.5px] font-bold text-zinc-400 hover:text-white mb-4 bg-zinc-950 border border-slate-800/80 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Change Subscription Plan</span>
        </button>

        {/* Invoice Brief Card */}
        <div className="bg-[#101820] border border-slate-800/90 rounded-2xl p-4 mb-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full filter blur-[20px] pointer-events-none"></div>
          <span className="text-[8px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-mono uppercase tracking-widest inline-block mb-2">
            Secure Invoice Brief
          </span>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-extrabold text-white">{plan.name} Upgrade</h3>
              <p className="text-[10.5px] text-zinc-400 leading-tight mt-0.5 capitalize">{activePeriod} Subscription Tier</p>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-white font-mono">${plan.price}/{activePeriod === "annually" ? "yr" : "mo"}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-slate-800/80 pt-3 mt-3 space-y-2 text-[10px] font-mono text-zinc-400">
            <div className="flex justify-between">
              <span>Subscription Subtotal:</span>
              <span className="text-white font-bold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>SLA Tax Rate ({taxRate}%):</span>
              <span className="text-white">${taxAmount.toFixed(2)}</span>
            </div>
            {activePeriod === "annually" && (
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>Loyal Member Discount Applied:</span>
                <span>-20% Off Bundle</span>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-800/60 pt-2 text-[11px] font-bold text-white">
              <span>SECURED TOTAL DUE:</span>
              <span className="text-emerald-400 text-xs font-black font-mono">${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Gateway Selection Tabs */}
        <h4 className="text-[10.5px] font-bold text-zinc-400 font-mono uppercase text-left mb-2.5 tracking-wider">
          Secure Gateway Interface
        </h4>
        <div className="grid grid-cols-4 gap-2 mb-5">
          <button
            onClick={() => { setGatewayType("stripe"); setPaymentError(null); }}
            className={`p-2 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all ${
              gatewayType === "stripe"
                ? "bg-blue-600/15 border-blue-500 text-white"
                : "bg-[#101820]/60 border-slate-800/80 text-zinc-400 hover:border-slate-700"
            }`}
          >
            <CreditCard className="w-4 h-4 mb-1 text-blue-400" />
            <span className="text-[8.5px] font-bold font-mono">Stripe CC</span>
          </button>

          <button
            onClick={() => { setGatewayType("paypal"); setPaymentError(null); }}
            className={`p-2 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all ${
              gatewayType === "paypal"
                ? "bg-amber-600/15 border-amber-500 text-white"
                : "bg-[#101820]/60 border-slate-800/80 text-zinc-400 hover:border-slate-700"
            }`}
          >
            <Coins className="w-4 h-4 mb-1 text-amber-400" />
            <span className="text-[8.5px] font-bold font-mono">PayPal</span>
          </button>

          <button
            onClick={() => { setGatewayType("express"); setPaymentError(null); }}
            className={`p-2 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all ${
              gatewayType === "express"
                ? "bg-teal-600/15 border-teal-500 text-white"
                : "bg-[#101820]/60 border-slate-800/80 text-zinc-400 hover:border-slate-700"
            }`}
          >
            <Fingerprint className="w-4 h-4 mb-1 text-teal-400" />
            <span className="text-[8.5px] font-bold font-mono">Biometrics</span>
          </button>

          <button
            onClick={() => { setGatewayType("coinbase"); setPaymentError(null); }}
            className={`p-2 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all ${
              gatewayType === "coinbase"
                ? "bg-purple-600/15 border-purple-500 text-white"
                : "bg-[#101820]/60 border-slate-800/80 text-zinc-400 hover:border-slate-700"
            }`}
          >
            <Sliders className="w-4 h-4 mb-1 text-purple-400" />
            <span className="text-[8.5px] font-bold font-mono">Crypto Hub</span>
          </button>
        </div>

        {/* Sandbox Success / Failure Decline Simulator Controller */}
        <div className="bg-zinc-950 border border-slate-900 rounded-2xl p-3 mb-5 flex items-center justify-between text-left">
          <div className="space-y-0.5">
            <span className="text-[8.5px] font-mono text-zinc-500 block">GATEWAY SIMULATOR OVERRIDE</span>
            <span className="text-[10px] font-bold text-white block">Simulate Payment Failure / Decline State</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setSimulatedError(!simulatedError);
              setPaymentError(null);
            }}
            className={`text-[8.5px] font-bold font-mono px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              simulatedError
                ? "bg-red-500/15 text-red-400 border-red-500/30"
                : "bg-zinc-900 border-slate-800 text-zinc-400 hover:border-slate-700"
            }`}
          >
            {simulatedError ? "Declines Active 🔴" : "Approvals Active 🟢"}
          </button>
        </div>

        {/* Dynamic Payment Error Viewport */}
        {paymentError && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3 text-left text-[10px] mb-4 flex items-start gap-2.5 animate-pulse">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <p className="leading-normal font-mono font-medium">{paymentError}</p>
          </div>
        )}

        {/* STIPE VIEWPORT */}
        {gatewayType === "stripe" && (
          <div className="space-y-4">
            {/* Visual Credit Card Mockup */}
            <div className="perspective-1000">
              <div className={`w-full max-w-[340px] mx-auto h-[170px] rounded-2xl p-4 bg-gradient-to-br ${currentCardInfo.color} text-white shadow-xl flex flex-col justify-between transition-all duration-300 transform ${cardFocusedField === "cvv" ? "[transform:rotateY(180deg)]" : ""}`}>
                <div className="h-full flex flex-col justify-between text-left">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <span className="text-[7px] text-white/50 font-mono tracking-widest uppercase block">Secure Gateway Portal</span>
                      <span className="text-[11px] font-extrabold tracking-wider">{currentCardInfo.icon}</span>
                    </div>
                    <ShieldCheck className="w-5 h-5 text-white/80" />
                  </div>

                  <div className="w-8 h-6 rounded bg-amber-200/20 border border-amber-100/10 mt-1"></div>

                  <div className="space-y-1.5">
                    <div className="font-mono text-sm tracking-[0.2em] text-white/90">
                      {stripeForm.number || "•••• •••• •••• ••••"}
                    </div>
                    <div className="flex justify-between items-end font-mono text-[8px] text-white/70">
                      <div>
                        <span className="text-[6.5px] text-white/40 block">CARDHOLDER</span>
                        <span className="uppercase font-bold tracking-wider truncate max-w-[150px] block">{stripeForm.name || "YOUR NAME"}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[6.5px] text-white/40 block">EXPIRES</span>
                        <span className="font-bold block">{stripeForm.expiry || "MM/YY"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Input fields */}
            <form onSubmit={handleStripeSubmit} className="bg-[#101820] border border-slate-800 rounded-2xl p-4 text-left space-y-3.5">
              <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-2">
                <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">Stripe Secure Card Data</span>
                <span className="text-[8.5px] text-zinc-500">(100% Secure Sandbox)</span>
              </div>

              <div className="space-y-1">
                <label className="text-[9.5px] font-bold text-zinc-400 uppercase tracking-wide">Cardholder Full Name</label>
                <input
                  type="text"
                  required
                  value={stripeForm.name}
                  onChange={(e) => setStripeForm({ ...stripeForm, name: e.target.value })}
                  placeholder="Enter full name on card"
                  className="w-full bg-[#0A0A0A] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 placeholder-zinc-600 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9.5px] font-bold text-zinc-400 uppercase tracking-wide">Credit Card Number</label>
                <input
                  type="text"
                  required
                  maxLength={19}
                  value={stripeForm.number}
                  onChange={(e) => setStripeForm({ ...stripeForm, number: formatCardNumber(e.target.value) })}
                  placeholder="4111 2222 3333 4444"
                  className="w-full bg-[#0A0A0A] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 placeholder-zinc-600 transition-colors font-mono"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[9.5px] font-bold text-zinc-400 uppercase tracking-wide">Expiration</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={stripeForm.expiry}
                    onChange={(e) => setStripeForm({ ...stripeForm, expiry: formatExpiry(e.target.value) })}
                    placeholder="MM/YY"
                    className="w-full bg-[#0A0A0A] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 placeholder-zinc-600 transition-colors font-mono text-center"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9.5px] font-bold text-zinc-400 uppercase tracking-wide">CVV / CVC</label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    value={stripeForm.cvv}
                    onFocus={() => setCardFocusedField("cvv")}
                    onBlur={() => setCardFocusedField(null)}
                    onChange={(e) => setStripeForm({ ...stripeForm, cvv: e.target.value.replace(/\D/g, "") })}
                    placeholder="•••"
                    className="w-full bg-[#0A0A0A] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 placeholder-zinc-600 transition-colors font-mono text-center"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9.5px] font-bold text-zinc-400 uppercase tracking-wide">Postal Code</label>
                  <input
                    type="text"
                    required
                    maxLength={7}
                    value={stripeForm.zip}
                    onChange={(e) => setStripeForm({ ...stripeForm, zip: e.target.value.toUpperCase() })}
                    placeholder="Zip"
                    className="w-full bg-[#0A0A0A] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 placeholder-zinc-600 transition-colors font-mono text-center"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold font-mono py-2.5 rounded-xl uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing Secure Token...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Authorize Charge of ${totalAmount.toFixed(2)}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* PAYPAL VIEWPORT */}
        {gatewayType === "paypal" && (
          <div className="bg-[#101820] border border-slate-800 rounded-2xl p-4 text-left space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider">PayPal Commerce Sandbox</span>
              <span className="text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-bold">Secure Mock Link</span>
            </div>

            {paypalStep === "login" ? (
              <div className="space-y-3.5">
                <p className="text-[10.5px] text-zinc-400 leading-normal">
                  Connect your PayPal credentials to pre-approve monthly or annual recurring billing cycles.
                </p>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wide font-mono">PayPal Username</label>
                  <input
                    type="email"
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    placeholder="paypal@pulse.com"
                    className="w-full bg-[#0A0A0A] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wide font-mono">Password</label>
                  <input
                    type="password"
                    value={paypalPassword}
                    onChange={(e) => setPaypalPassword(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setPaypalStep("review")}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black font-mono py-2 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Link Sandbox Wallet</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-zinc-950/80 p-3 rounded-xl border border-slate-800 text-[10.5px] space-y-2 leading-relaxed">
                  <div className="flex justify-between border-b border-slate-900 pb-1.5 font-bold">
                    <span className="text-zinc-400">Linked Account:</span>
                    <span className="text-white font-mono">{paypalEmail}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-1.5">
                    <span className="text-zinc-400">Upgrade Profile:</span>
                    <span className="text-white">{plan.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">SaaS Cycle Rate:</span>
                    <span className="text-emerald-400 font-bold font-mono">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setPaypalStep("login")}
                    className="flex-1 bg-zinc-900 border border-slate-800 hover:bg-zinc-800 text-zinc-300 font-bold py-2 rounded-xl text-[10px] uppercase font-mono transition-colors cursor-pointer"
                  >
                    Go Back
                  </button>
                  <button
                    onClick={handlePaypalSubmit}
                    disabled={isProcessing}
                    className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-black py-2 rounded-xl text-[10px] uppercase font-mono transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Authorizing...</span>
                      </>
                    ) : (
                      <span>Pre-Approve Billing</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* BIOMETRICS VIEWPORT */}
        {gatewayType === "express" && (
          <div className="bg-[#101820] border border-slate-800 rounded-2xl p-4 text-left space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-2">
              <Fingerprint className="w-4 h-4 text-teal-400" />
              <h3 className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">Express OS Biometrics</h3>
            </div>
            <p className="text-[10.5px] text-zinc-400 leading-normal">
              Authorize securely with Apple FaceID or Google Passkey simulation wrapper. No typing needed.
            </p>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => triggerExpressBiometrics("apple")}
                className="w-full bg-black hover:bg-zinc-900 text-white font-extrabold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-transform cursor-pointer border border-zinc-800/60 active:scale-[0.99]"
              >
                <Apple className="w-4 h-4 text-white" />
                <span className="text-[11px] font-mono">Buy with  Pay</span>
              </button>

              <button
                type="button"
                onClick={() => triggerExpressBiometrics("google")}
                className="w-full bg-white hover:bg-zinc-100 text-black font-extrabold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-transform cursor-pointer border border-zinc-200 active:scale-[0.99]"
              >
                <Chrome className="w-4 h-4 text-zinc-800" />
                <span className="text-[11px] font-mono">Pay with <span className="text-blue-500">G</span><span className="text-red-500">o</span><span className="text-amber-500">o</span><span className="text-blue-500">g</span><span className="text-emerald-500">l</span><span className="text-red-500">e</span> Pay</span>
              </button>
            </div>
          </div>
        )}

        {/* CRYPTO BLOCKCHAIN VIEWPORT */}
        {gatewayType === "coinbase" && (
          <div className="bg-[#101820] border border-slate-800 rounded-2xl p-4 text-left space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center space-x-2">
                <Coins className="w-4 h-4 text-purple-400" />
                <h3 className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">Coinbase Commerce QR Hub</h3>
              </div>
              <span className="text-[8px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded font-bold">Web3 Sandbox</span>
            </div>

            {cryptoStep === "qr" ? (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex justify-between items-center text-[10.5px]">
                  <span className="text-zinc-400 font-bold">Selected Currency:</span>
                  <div className="flex gap-1.5 font-mono text-[9px]">
                    {(["USDC", "BTC", "ETH"] as const).map((coin) => (
                      <button
                        key={coin}
                        type="button"
                        onClick={() => setCryptoSelected(coin)}
                        className={`px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
                          cryptoSelected === coin
                            ? "bg-purple-600/10 border-purple-500 text-purple-400 font-bold"
                            : "bg-zinc-950 border-slate-900 text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        {coin}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SVG QR Code representation */}
                <div className="bg-white rounded-xl p-3 max-w-[130px] mx-auto aspect-square border-2 border-purple-500/30 shadow-lg flex items-center justify-center">
                  <svg className="w-full h-full text-zinc-950" viewBox="0 0 100 100" fill="currentColor">
                    <path d="M5,5 h30 v30 h-30 z M15,15 h10 v10 h-10 z" />
                    <path d="M65,5 h30 v30 h-30 z M75,15 h10 v10 h-10 z" />
                    <path d="M5,65 h30 v30 h-30 z M15,75 h10 v10 h-10 z" />
                    <path d="M45,5 h10 v10 h-10 z M45,25 h15 v10 h-15 z M5,45 h10 v10 h-10 z M25,45 h20 v10 h-20 z M55,45 h30 v10 h-30 z M45,65 h10 v30 h-10 z M65,55 h30 v10 h-30 z M65,75 h10 v15 h-10 z" />
                    <circle cx="50" cy="50" r="5" fill="#a855f7" />
                  </svg>
                </div>

                <div className="space-y-1 bg-zinc-950 p-2 rounded-xl border border-slate-800 text-[9.5px] text-center font-mono">
                  <span className="text-zinc-500 block text-[8px] uppercase">MOCK CONTRACT DEPOSIT ADDRESS</span>
                  <span className="text-purple-400 block break-all leading-tight select-all">
                    {cryptoSelected === "BTC" 
                      ? "bc1qa2pulse83hq8hdx99s9hps02ndgxs9x742r8d3"
                      : cryptoSelected === "ETH"
                      ? "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
                      : "0x892f25Cc8824C0312925a3b844Bc104e4438f321"
                    }
                  </span>
                </div>

                <div className="text-center space-y-1.5">
                  <span className="text-[10px] text-zinc-400 block font-bold">
                    Awaiting: <span className="text-white font-mono">{cryptoSelected === "BTC" ? "0.00036 BTC" : cryptoSelected === "ETH" ? "0.0068 ETH" : `${totalAmount.toFixed(2)} USDC`}</span>
                  </span>
                  <div className="flex items-center justify-center gap-1.5 text-[8.5px] font-mono text-zinc-500">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
                    <span>Expires in: {formatTimer(cryptoTimer)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={triggerCryptoCheck}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold font-mono py-2 rounded-xl text-[10px] uppercase tracking-wider transition-colors cursor-pointer shadow-lg"
                >
                  Verify Deposit Transaction
                </button>
              </div>
            ) : (
              <div className="py-6 text-center space-y-3.5 animate-pulse">
                <div className="relative w-12 h-12 mx-auto">
                  <div className="absolute inset-0 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <Coins className="w-5 h-5 text-purple-400 absolute inset-0 m-auto" />
                </div>
                <div className="space-y-1 font-mono text-[10px]">
                  <span className="text-white block font-bold">Scanning Mempool Blockchains...</span>
                  <span className="text-zinc-500 block">Confirmations: {cryptoProgress}% ({Math.floor(cryptoProgress/35)}/3 verified)</span>
                </div>
                <div className="max-w-[180px] mx-auto bg-zinc-950 h-1 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full transition-all duration-300" style={{ width: `${cryptoProgress}%` }}></div>
                </div>
              </div>
            )}
          </div>
        )}

        <p className="text-[9px] text-zinc-500 leading-normal text-left mt-4 px-1">
          🔐 Security Safeguard: All transactions are processed through isolated, clientside mock environments. No real payment parameters will be requested or stored in this workspace.
        </p>

      </div>

      {/* BIOMETRIC BOTTOM OVERLAY MODAL */}
      {expressSheetOpen && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-end justify-center transition-opacity animate-fadeIn">
          <div className="w-full max-w-[370px] bg-zinc-950 border-t border-slate-800 rounded-t-3xl p-5 space-y-4 text-left relative shadow-2xl">
            <button
              onClick={() => setExpressSheetOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              {expressWallet === "apple" ? (
                <>
                  <Apple className="w-5 h-5 text-white" />
                  <h4 className="text-xs font-black uppercase font-mono tracking-wider"> Pay Express</h4>
                </>
              ) : (
                <>
                  <Chrome className="w-5 h-5 text-blue-400" />
                  <h4 className="text-xs font-black uppercase font-mono tracking-wider">Google Pay Express</h4>
                </>
              )}
            </div>

            <p className="text-[10px] text-zinc-400 leading-normal">
              Authorize securely. Place your finger on the biometric scanner or align FaceID to confirm subscription tokenization.
            </p>

            <div className="bg-[#101820] p-3 rounded-xl border border-slate-900 text-[10px] font-mono space-y-1.5 text-zinc-400">
              <div className="flex justify-between">
                <span>Beneficiary:</span>
                <span className="text-white">HomePulse Systems Inc.</span>
              </div>
              <div className="flex justify-between">
                <span>Charge Cycle:</span>
                <span className="text-white capitalize">{activePeriod} Subscription</span>
              </div>
              <div className="flex justify-between font-bold text-white text-[11px] border-t border-slate-900 pt-1.5 mt-1">
                <span>TOTAL DUE:</span>
                <span className="text-emerald-400">${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="py-4 flex flex-col items-center justify-center space-y-2.5">
              {expressStep === "idle" ? (
                <button
                  type="button"
                  onClick={processExpressBiometricScan}
                  className="w-14 h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-full flex items-center justify-center cursor-pointer transition-all shadow-lg active:scale-95"
                >
                  <Fingerprint className="w-8 h-8 animate-pulse" />
                </button>
              ) : expressStep === "scanning" ? (
                <div className="relative w-14 h-14">
                  <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <Fingerprint className="w-8 h-8 text-blue-400 absolute inset-0 m-auto animate-pulse" />
                </div>
              ) : (
                <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500 text-emerald-400 rounded-full flex items-center justify-center animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
              )}

              <span className="text-[10px] font-mono font-bold text-zinc-400">
                {expressStep === "idle" 
                  ? "Tap scanner to authorize" 
                  : expressStep === "scanning" 
                  ? "Verifying biometrics..." 
                  : "Authentication Approved"
                }
              </span>
            </div>

            <button
              onClick={() => setExpressSheetOpen(false)}
              className="w-full text-center py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-xl text-[10px] font-mono font-bold transition-all cursor-pointer"
            >
              Cancel Payment Request
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
