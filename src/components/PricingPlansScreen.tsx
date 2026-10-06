import React from "react";
import { 
  Check, Star, Zap, Sparkles, HelpCircle, Shield, Sliders, ArrowRight, 
  DollarSign, CreditCard, Lock, ShieldCheck, AlertCircle, X, Coins, 
  Fingerprint, CheckCircle2, RefreshCw, Chrome, HelpCircle as HelpIcon,
  Laptop, ChevronRight, Apple, ArrowLeft
} from "lucide-react";
import { StakeholderUser } from "./StakeholderScreen";
import BottomNavBar from "./BottomNavBar";
import PaymentGateway from "./PaymentGateway";

interface PricingPlansScreenProps {
  currentUser: StakeholderUser;
  onUpdateCurrentUser: (user: StakeholderUser) => void;
  onNavigateToScreen: (screenId: string) => void;
  addToast?: (title: string, description: string, type: "task" | "risk" | "info" | "success") => void;
}

export default function PricingPlansScreen({
  currentUser,
  onUpdateCurrentUser,
  onNavigateToScreen,
  addToast,
}: PricingPlansScreenProps) {
  // Plan descriptions database
  const plans = [
    {
      id: "Free",
      name: "Free Plan",
      price: 0,
      period: "forever",
      tagline: "Essential tools for single-property owners",
      badge: "Basic Care",
      color: "border-slate-800 text-slate-400 bg-zinc-950/40",
      accent: "text-zinc-400",
      buttonText: "Current Plan",
      features: [
        "Basic device health tracking",
        "Standard weather risk updates",
        "Track up to 3 home appliances",
        "Access local contractor list",
        "Basic file storage (up to 10MB)",
      ],
      details: "Perfect for homeowners starting to log appliance details. Access a pre-screened list of local contractors. No monthly fee."
    },
    {
      id: "Pro",
      name: "HomePulse Pro",
      price: 19,
      period: "month",
      tagline: "Automatic alerts & smart home safety",
      badge: "Most Popular",
      color: "border-blue-500/30 text-blue-400 bg-blue-950/15 ring-1 ring-blue-500/20",
      accent: "text-blue-400",
      buttonText: "Upgrade to Pro",
      features: [
        "Priority dispatch (Pro help within 4 hours)",
        "Automatic water shutoff support",
        "Smart heating & cooling system alerts",
        "Track unlimited home appliances",
        "Monthly home savings statements",
        "AI home care recommendations",
      ],
      details: "Our premium plan designed to protect your home from sudden system failures and leaks. Get real-time alerts and smart safety tools. Saves users an average of $380/year."
    },
    {
      id: "Enterprise",
      name: "Ultimate Protection",
      price: 49,
      period: "month",
      tagline: "Ultimate proactive security & direct support",
      badge: "Absolute Protection",
      color: "border-purple-500/30 text-purple-400 bg-purple-950/15 ring-1 ring-purple-500/20",
      accent: "text-purple-400",
      buttonText: "Deploy Shield",
      features: [
        "Advanced regular safety scans",
        "Guaranteed 2-hour emergency pro help",
        "Sync across multiple family accounts",
        "Up to $5,000 damage coverage guarantee",
        "24/7 dedicated support hotline",
        "Customized home safety settings",
      ],
      details: "The ultimate coverage for large homes and property managers. Get premium concierge support, fast service dispatching, and robust safety guarantees."
    }
  ];

  const [activeTab, setActiveTab] = React.useState<"monthly" | "annually">("monthly");
  const [selectedPlanId, setSelectedPlanId] = React.useState<string | null>(null);
  
  // Interactive checkout states
  const [checkoutStep, setCheckoutStep] = React.useState<"pricing" | "checkout" | "success">("pricing");
  const [checkoutPlan, setCheckoutPlan] = React.useState<typeof plans[0] | null>(null);
  const [paymentGateway, setPaymentGateway] = React.useState<"stripe" | "paypal" | "express" | "coinbase">("stripe");
  
  // Simulated gateway processing
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [simulatedError, setSimulatedError] = React.useState(false);
  const [paymentError, setPaymentError] = React.useState<string | null>(null);

  // STRIPE CREDIT CARD FORM STATES
  const [stripeForm, setStripeForm] = React.useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
    zip: ""
  });
  const [cardFocusedField, setCardFocusedField] = React.useState<string | null>(null);

  // PAYPAL SIMULATION STATES
  const [paypalStep, setPaypalStep] = React.useState<"login" | "review" | "processing">("login");
  const [paypalEmail, setPaypalEmail] = React.useState(currentUser.email || "homeowner@pulse.com");
  const [paypalPassword, setPaypalPassword] = React.useState("••••••••");

  // EXPRESS MOBILE SHEET WALLET STATES
  const [expressWallet, setExpressWallet] = React.useState<"apple" | "google">("apple");
  const [expressSheetOpen, setExpressSheetOpen] = React.useState(false);
  const [expressStep, setExpressStep] = React.useState<"idle" | "scanning" | "completed">("idle");

  // COINBASE COMMERCE CRYPTO STATES
  const [cryptoSelected, setCryptoSelected] = React.useState<"BTC" | "ETH" | "USDC">("USDC");
  const [cryptoStep, setCryptoStep] = React.useState<"qr" | "detecting" | "confirmed">("qr");
  const [cryptoTimer, setCryptoTimer] = React.useState(600); // 10 minutes countdown
  const [cryptoProgress, setCryptoProgress] = React.useState(0);

  // Billing calculation constants
  const taxRate = 8.5; // 8.5% VAT/Sales tax
  const getDiscountMultiplier = () => (activeTab === "annually" ? 0.8 : 1.0); // 20% discount on annual subscriptions

  // Start the countdown timer when crypto QR code is loaded
  React.useEffect(() => {
    if (checkoutStep === "checkout" && paymentGateway === "coinbase" && cryptoStep === "qr") {
      const interval = setInterval(() => {
        setCryptoTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [checkoutStep, paymentGateway, cryptoStep]);

  // Handle countdown representation
  const formatTimer = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  // Detect card brand based on starting digit
  const getCardBrand = (num: string) => {
    const cleanNum = num.replace(/\s+/g, "");
    if (cleanNum.startsWith("4")) return { name: "Visa", color: "from-blue-600 to-sky-500", icon: "💳 VISA" };
    if (cleanNum.startsWith("5")) return { name: "Mastercard", color: "from-orange-600 to-amber-500", icon: "💳 MASTERCARD" };
    if (cleanNum.startsWith("3")) return { name: "American Express", color: "from-teal-600 to-cyan-500", icon: "💳 AMEX" };
    if (cleanNum.startsWith("6")) return { name: "Discover", color: "from-red-600 to-pink-500", icon: "💳 DISCOVER" };
    return { name: "Generic", color: "from-zinc-800 to-zinc-700", icon: "💳 CREDIT CARD" };
  };

  // Helper formatting inputs
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    }
    return v;
  };

  // Initiates checkout wizard
  const handleSelectPlan = (tierId: string) => {
    const p = plans.find((x) => x.id === tierId);
    if (!p) return;
    
    if (p.price === 0) {
      // Free plan upgrades instantly with zero checkout needed
      onUpdateCurrentUser({
        ...currentUser,
        tier: "Free",
      });
      if (addToast) {
        addToast(
          "Subscription Downgraded",
          "You have switched back to the free essential tier successfully.",
          "info"
        );
      }
      return;
    }

    setCheckoutPlan(p);
    setStripeForm({ number: "", name: "", expiry: "", cvv: "", zip: "" });
    setPaypalStep("login");
    setCryptoStep("qr");
    setCryptoTimer(600);
    setPaymentError(null);
    setCheckoutStep("checkout");
  };

  // Calculates final costs
  const getPricingTotals = () => {
    if (!checkoutPlan) return { subtotal: 0, tax: 0, total: 0 };
    const base = Math.round(checkoutPlan.price * getDiscountMultiplier());
    const subtotal = activeTab === "annually" ? base * 12 : base;
    const tax = Math.round(subtotal * (taxRate / 100) * 100) / 100;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  // STRIFE CREDIT CARD DIRECT PROCESSOR
  const processStripePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError(null);

    // Validation
    if (!stripeForm.number || stripeForm.number.length < 15) {
      setPaymentError("Invalid Credit Card number length.");
      return;
    }
    if (!stripeForm.expiry || !stripeForm.expiry.includes("/")) {
      setPaymentError("Invalid Expiration date formatted (MM/YY).");
      return;
    }
    if (!stripeForm.cvv || stripeForm.cvv.length < 3) {
      setPaymentError("Invalid Security Code (CVV).");
      return;
    }
    if (!stripeForm.name.trim()) {
      setPaymentError("Cardholder Name is required.");
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      if (simulatedError) {
        setIsProcessing(false);
        setPaymentError("STRIFE EX-102: Transaction declined. Insufficient funds or invalid security token (mock sandbox error).");
        if (addToast) {
          addToast("Payment Failed", "Sandbox gateway simulation declined the transaction.", "risk");
        }
      } else {
        setIsProcessing(false);
        completeSubscriptionUpgrade();
      }
    }, 2000);
  };

  // PAYPAL SIMULATED GATEWAY PROCESSOR
  const processPaypalPayment = () => {
    setIsProcessing(true);
    setPaymentError(null);

    setTimeout(() => {
      setIsProcessing(false);
      if (simulatedError) {
        setPaymentError("PAYPAL P-908: User cancelled checkout or credentials verification failed.");
      } else {
        completeSubscriptionUpgrade();
      }
    }, 1800);
  };

  // EXPRESS APPLE/GOOGLE PAY SHEET PROGRESSION
  const triggerExpressWalletSheet = (brand: "apple" | "google") => {
    setExpressWallet(brand);
    setExpressStep("idle");
    setExpressSheetOpen(true);
  };

  const processExpressBioAuthentication = () => {
    setExpressStep("scanning");
    
    setTimeout(() => {
      if (simulatedError) {
        setExpressStep("idle");
        setExpressSheetOpen(false);
        if (addToast) {
          addToast("Biometrics Failed", "Express payment biometric key verification rejected.", "risk");
        }
      } else {
        setExpressStep("completed");
        setTimeout(() => {
          setExpressSheetOpen(false);
          completeSubscriptionUpgrade();
        }, 1200);
      }
    }, 2500);
  };

  // COINBASE COMMERCE BLOCKCHAIN VERIFIER
  const triggerCryptoConfirmationCheck = () => {
    setCryptoStep("detecting");
    setCryptoProgress(0);

    const interval = setInterval(() => {
      setCryptoProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setCryptoStep("confirmed");
            completeSubscriptionUpgrade();
          }, 800);
          return 100;
        }
        return p + 25; // Simulates quick blocks checks in sandbox mode
      });
    }, 900);
  };

  // Finalizes the database change in user object and shows confirmation screen
  const completeSubscriptionUpgrade = () => {
    if (!checkoutPlan) return;
    
    onUpdateCurrentUser({
      ...currentUser,
      tier: checkoutPlan.id as any
    });

    if (addToast) {
      addToast(
        "Payment Approved Successfully 🔒",
        `Welcome to ${checkoutPlan.name}! Your premium dashboard telemetry limits have been expanded.`,
        "success"
      );
    }
    
    setCheckoutStep("success");
  };

  // Render variables
  const { subtotal, tax, total } = getPricingTotals();
  const currentCardInfo = getCardBrand(stripeForm.number);

  return (
    <div className="w-full h-full flex flex-col justify-between bg-[#0A0A0A] text-white font-sans relative">
      
      {checkoutStep === "pricing" ? (
        /* SCREEN 1: THE PRICING MATRIX GRID */
        <div className="flex-1 overflow-y-auto px-5 pt-4 pb-20 scrollbar-none">
          {/* Top Title Block */}
          <div className="mb-5 text-left">
            <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase block">HomePulse Subscription Matrix</span>
            <h2 className="text-xl font-extrabold tracking-tight text-white font-display mt-0.5">SaaS Pricing & Plans</h2>
            <p className="text-[11px] text-zinc-400 mt-1 leading-normal">
              Calibrate your home protection depth. Switch between tiers to adjust telemetry polling rates, AI models, and emergency contractor dispatch priority guarantees.
            </p>
          </div>

          {/* Annual Toggle Segment */}
          <div className="bg-[#101820] p-1 rounded-xl border border-slate-800/80 max-w-[240px] flex items-center mb-6">
            <button
              onClick={() => setActiveTab("monthly")}
              className={`flex-1 text-[10px] font-mono font-bold py-1.5 rounded-lg transition-all ${
                activeTab === "monthly" 
                  ? "bg-blue-600 text-white shadow" 
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setActiveTab("annually")}
              className={`flex-1 text-[10px] font-mono font-bold py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "annually" 
                  ? "bg-blue-600 text-white shadow" 
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <span>Annually</span>
              <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1 rounded font-bold">20% Off</span>
            </button>
          </div>

          {/* Pricing Cards Grid */}
          <div className="space-y-4">
            {plans.map((p) => {
              const isCurrent = currentUser.tier === p.id;
              const finalPrice = Math.round(p.price * getDiscountMultiplier());

              return (
                <div
                  key={p.id}
                  className={`p-4 border rounded-2xl transition-all relative ${
                    isCurrent 
                      ? "border-blue-500 bg-blue-950/10 shadow-[0_0_15px_rgba(37,99,235,0.15)]" 
                      : "border-slate-800 bg-[#101820]/60 hover:border-slate-700"
                  }`}
                >
                  {isCurrent && (
                    <span className="absolute -top-2 right-4 bg-blue-500 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shadow font-mono">
                      Active Plan
                    </span>
                  )}

                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[9px] font-bold text-zinc-500 font-mono tracking-widest uppercase block">
                        {p.badge}
                      </span>
                      <h3 className="text-sm font-black text-white mt-0.5">{p.name}</h3>
                      <p className="text-[10px] text-zinc-400 mt-1 leading-normal">{p.tagline}</p>
                    </div>

                    <div className="text-right">
                      <div className="flex items-baseline justify-end">
                        <span className="text-lg font-black font-mono text-white">${finalPrice}</span>
                        <span className="text-[9px] text-zinc-500 font-mono ml-0.5">/{p.period === "forever" ? "forever" : "mo"}</span>
                      </div>
                      {activeTab === "annually" && p.price > 0 && (
                        <span className="text-[8px] font-mono text-emerald-400 block mt-0.5">
                          Billed annually (${finalPrice * 12}/yr)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Features Checklist */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5 pt-3 mt-3 border-t border-slate-900/60 text-left">
                    {p.features.map((f, i) => (
                      <div key={i} className="flex items-center space-x-2 text-[10px] text-zinc-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{f}</span>
                      </div>
                    ))}
                  </div>

                  {/* Detailed descriptions tab inside card */}
                  <div className="mt-3 p-2.5 bg-zinc-950/50 rounded-xl text-[9px] text-zinc-400 leading-normal text-left border border-slate-900/60">
                    <span className="font-bold text-zinc-300 uppercase font-mono block text-[7.5px] mb-0.5">Plan Architecture & SLA</span>
                    {p.details}
                  </div>

                  {/* Upgrade Button */}
                  <button
                    onClick={() => handleSelectPlan(p.id)}
                    disabled={isCurrent}
                    className={`w-full text-center py-2.5 rounded-xl font-mono text-[10px] uppercase font-black tracking-wider transition-all mt-4 cursor-pointer ${
                      isCurrent
                        ? "bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-not-allowed"
                        : p.id === "Enterprise"
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90 shadow-md"
                        : "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/10"
                    }`}
                  >
                    {isCurrent ? "Current Protection Level Active" : `Select ${p.name}`}
                  </button>
                </div>
              );
            })}
          </div>

          {/* SLA and Billing FAQ Info Panel */}
          <div className="bg-[#101820] p-4 border border-slate-800/80 rounded-2xl mt-6 space-y-3.5 text-left">
            <div className="flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                Secure Payment Sandbox
              </h3>
            </div>
            <p className="text-[10px] text-zinc-400 leading-normal">
              Pricing operates under automatic simulated sandbox flows. Choose from our pre-integrated mock payment processors to experience fully-functioning webhook and transaction loops.
            </p>

            <div className="space-y-1.5 pt-1 border-t border-slate-900/60 font-mono text-[10px] text-zinc-400">
              <div className="flex justify-between">
                <span>Active subscription:</span>
                <span className="text-white">{currentUser.tier || "Free"}</span>
              </div>
              <div className="flex justify-between">
                <span>Billing Period:</span>
                <span className="text-white capitalize">{activeTab}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>Payment Protection Status:</span>
                <span>Active Secure Gateway Shield</span>
              </div>
            </div>
          </div>
        </div>
      ) : checkoutStep === "checkout" && checkoutPlan ? (
        <div className="flex-1 overflow-y-auto px-5 pt-4 pb-20 scrollbar-none">
          <PaymentGateway
            plan={checkoutPlan}
            activePeriod={activeTab}
            totalAmount={total}
            subtotal={subtotal}
            taxAmount={tax}
            taxRate={taxRate}
            onPaymentSuccess={completeSubscriptionUpgrade}
            onCancel={() => setCheckoutStep("pricing")}
            addToast={addToast}
          />
        </div>
      ) : (
        /* SCREEN 3: CHECKOUT SUCCESS SCREEN (CONFETTI / MEMBERSHIP CARD) */
        <div className="flex-1 overflow-y-auto px-5 pt-8 pb-20 scrollbar-none flex flex-col justify-center items-center">
          
          {/* Confetti container representation */}
          <div className="relative p-5 w-full max-w-[340px] mx-auto text-center space-y-4 animate-fade-in">
            
            {/* Ambient pulse elements */}
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 opacity-20 blur-lg animate-pulse"></div>

            <div className="relative bg-[#101820] border border-slate-800 rounded-2xl p-6 space-y-4">
              
              {/* Success Badge */}
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto animate-bounce shadow">
                <Check className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <span className="text-[9px] text-emerald-400 font-mono uppercase tracking-widest block font-bold">Transaction Cleared</span>
                <h3 className="text-base font-black text-white leading-tight">Welcome to {checkoutPlan?.name}!</h3>
                <p className="text-[10px] text-zinc-400 leading-normal mt-1">
                  Your payment was successfully tokenized and cleared across the secure simulated payment gateway network.
                </p>
              </div>

              {/* Digital Premium Pass Mockup Card */}
              <div className="bg-zinc-950 p-3.5 rounded-xl border border-slate-900 text-left space-y-2.5 font-mono">
                <div className="flex justify-between items-center text-[8px] text-zinc-500 border-b border-slate-900 pb-1.5 font-bold">
                  <span>MEMBER ACCESS ID</span>
                  <span>HP-PRO-2026-991A</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <span className="text-[7.5px] text-zinc-500 block">CARDHOLDER</span>
                    <span className="text-[10px] text-white font-bold block">{currentUser.name || "Default Owner"}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[7.5px] text-zinc-500 block">TIER</span>
                    <span className="text-[10px] text-blue-400 font-bold block uppercase">{checkoutPlan?.id} LEVEL</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <div>
                    <span className="text-[7.5px] text-zinc-500 block">PERIOD LIMITS</span>
                    <span className="text-[9.5px] text-white font-bold block">Appliance Limit: Expanded</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[7.5px] text-zinc-500 block">SLA PRIORITY</span>
                    <span className="text-[9.5px] text-emerald-400 font-bold block">4-Hr Guaranteed</span>
                  </div>
                </div>
              </div>

              {/* simulated invoice actions */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (addToast) addToast("Invoice Downloaded", "PDF transaction invoice saved successfully (simulated download).", "info");
                  }}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 border border-slate-800 hover:border-slate-700 text-zinc-300 font-bold font-mono py-2 rounded-xl text-[10px] uppercase transition-colors cursor-pointer"
                >
                  Download PDF Invoice Receipts
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCheckoutStep("pricing");
                    onNavigateToScreen("screen-dashboard");
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black font-mono py-2 rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-blue-600/15"
                >
                  Return to Dashboard
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* EXPRESS BIOMETRIC BOTTOM OVERLAY DIALOG */}
      {expressSheetOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center transition-opacity animate-fade-in">
          <div className="w-full max-w-[370px] bg-zinc-950 border-t border-slate-800 rounded-t-3xl p-5 space-y-4 animate-slide-up text-left relative shadow-2xl">
            
            {/* Top Close bar */}
            <button
              onClick={() => setExpressSheetOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Apple/Google header */}
            <div className="flex items-center gap-2">
              {expressWallet === "apple" ? (
                <>
                  <Apple className="w-5 h-5 text-white" />
                  <h4 className="text-xs font-black uppercase font-mono tracking-wider"> Pay Express checkout</h4>
                </>
              ) : (
                <>
                  <Chrome className="w-5 h-5 text-blue-400" />
                  <h4 className="text-xs font-black uppercase font-mono tracking-wider">Google Pay Express</h4>
                </>
              )}
            </div>

            <p className="text-[10px] text-zinc-400 leading-normal">
              Authorize securely. Touch your fingerprints sensor or align your face with the camera to tokenize the checkout process.
            </p>

            {/* Itemized row */}
            <div className="bg-[#101820] p-3 rounded-xl border border-slate-900 text-[10px] font-mono space-y-1.5 text-zinc-400">
              <div className="flex justify-between">
                <span>Direct Recipient:</span>
                <span className="text-white">HomePulse SaaS Inc.</span>
              </div>
              <div className="flex justify-between">
                <span>Account Method:</span>
                <span className="text-white font-mono">{expressWallet === "apple" ? "Apple Wallet Direct" : "Google Wallet Token"}</span>
              </div>
              <div className="flex justify-between font-bold text-white text-[11px] border-t border-slate-900 pt-1.5 mt-1">
                <span>CHARGE AMOUNT:</span>
                <span className="text-emerald-400">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Biometric Icon & Trigger */}
            <div className="py-4 flex flex-col items-center justify-center space-y-3">
              {expressStep === "idle" ? (
                <button
                  type="button"
                  onClick={processExpressBioAuthentication}
                  className="w-14 h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-[0.95] shadow-lg shadow-blue-600/15 border border-blue-500"
                >
                  <Fingerprint className="w-8 h-8 animate-pulse" />
                </button>
              ) : expressStep === "scanning" ? (
                <div className="relative w-14 h-14">
                  <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <Fingerprint className="w-8 h-8 text-blue-400 absolute inset-0 m-auto animate-pulse" />
                </div>
              ) : (
                <div className="w-14 h-14 bg-emerald-500/15 border border-emerald-500 text-emerald-400 rounded-full flex items-center justify-center animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
              )}

              <span className="text-[10px] font-mono font-bold text-zinc-400">
                {expressStep === "idle" 
                  ? "Tap fingerprint to scan" 
                  : expressStep === "scanning" 
                  ? "Scanning Biometric Keys..." 
                  : "Authentication Verified"
                }
              </span>
            </div>

            <button
              onClick={() => setExpressSheetOpen(false)}
              className="w-full text-center py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-xl text-[10.5px] font-mono font-bold transition-all cursor-pointer"
            >
              Cancel Payment Request
            </button>
          </div>
        </div>
      )}

      <BottomNavBar activeTab="plans" onNavigateToScreen={onNavigateToScreen} />
    </div>
  );
}
