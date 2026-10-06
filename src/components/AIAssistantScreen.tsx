import React from "react";
import { Send, Sparkles, Smile, MessageSquare, Flame, HelpCircle } from "lucide-react";
import { ChatMessage } from "../types";
import BottomNavBar from "./BottomNavBar";

interface AIAssistantScreenProps {
  onNavigateToScreen: (screenId: string) => void;
}

export default function AIAssistantScreen({ onNavigateToScreen }: AIAssistantScreenProps) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: "m_1",
      sender: "ai",
      text: "Hello! I am HomePulse AI, your predictive property diagnostician. I'm connected to your home's telemetry and appliance profiles. How can I protect your home today?",
      timestamp: "10:00 AM"
    },
    {
      id: "m_2",
      sender: "user",
      text: "Why is my AC blowing warm air?",
      timestamp: "10:01 AM"
    },
    {
      id: "m_3",
      sender: "ai",
      text: "Warm air indicates a restriction in refrigerant flow, a dirty coil, or a failed capacitor. Let's isolate the root cause:\n\n1. Is your outdoor condenser unit's fan spinning?\n2. Did you replace the hallway return air filter recently?",
      timestamp: "10:02 AM"
    }
  ]);

  const [inputVal, setInputVal] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll messages
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `m_user_${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal("");
    setIsTyping(true);

    try {
      // API call to our server-side Express endpoint
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          currentInput: textToSend
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server did not return JSON");
      }

      const data = await response.json();
      
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: `m_ai_${Date.now()}`,
          sender: "ai",
          text: data.text || "I apologize, I experienced a minor transmission hiccup. Could you restate that?",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } catch (error) {
      console.error("Chat API error:", error);
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: `m_ai_err_${Date.now()}`,
          sender: "ai",
          text: "I am having difficulty connecting to my central diagnostic cores. Let's check: are you running in local offline demo mode?",
          timestamp: "Just Now"
        }
      ]);
    }
  };

  const handleQuickButton = (choice: "YES" | "NO") => {
    handleSend(choice === "YES" ? "Yes, the fan is spinning." : "No, the fan is completely still.");
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(inputVal);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between bg-[#0A0A0A] text-white font-sans relative">
      
      {/* Header */}
      <div className="px-5 pt-4 pb-2 bg-[#0A0A0A]/95 border-b border-slate-900 z-15 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative p-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xs font-extrabold tracking-tight text-white font-display">AI Assistant</h2>
            <p className="text-[9px] text-emerald-400 font-mono flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-ping"></span>
              <span>Gemini Node Online</span>
            </p>
          </div>
        </div>
        
        <HelpCircle 
          onClick={() => onNavigateToScreen("screen-taskdetail")}
          className="w-4 h-4 text-zinc-500 hover:text-white cursor-pointer transition-colors" 
        />
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4 h-[440px] scrollbar-none">
        {messages.map((m) => {
          const isUser = m.sender === "user";
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-full`}
            >
              <div
                className={`p-3.5 rounded-2xl text-[11px] leading-relaxed shadow-md ${
                  isUser
                    ? "bg-[#2563EB] text-white rounded-tr-none max-w-[85%]"
                    : "bg-[#101820] text-zinc-200 rounded-tl-none border border-slate-800/80 max-w-[85%]"
                } whitespace-pre-wrap`}
              >
                {m.text}
              </div>
              <span className="text-[8px] text-zinc-600 font-mono mt-1 px-1">
                {m.timestamp}
              </span>
            </div>
          );
        })}

        {/* AI Typing Loader Animation */}
        {isTyping && (
          <div className="flex flex-col items-start max-w-[85%]">
            <div className="p-3 bg-[#101820] text-zinc-200 rounded-2xl rounded-tl-none border border-slate-800/80 flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
            </div>
            <span className="text-[8px] text-zinc-600 font-mono mt-1 px-1">Thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action YES/NO Selector Buttons */}
      <div className="absolute bottom-32 inset-x-0 px-5 flex items-center justify-center space-x-3 pointer-events-auto">
        <button
          onClick={() => handleQuickButton("YES")}
          className="flex-1 py-1.5 bg-[#101820] hover:bg-[#1E293B] active:scale-95 text-xs font-bold text-emerald-400 border border-slate-800 hover:border-slate-700 rounded-xl transition-all shadow-md cursor-pointer"
        >
          YES
        </button>
        <button
          onClick={() => handleQuickButton("NO")}
          className="flex-1 py-1.5 bg-[#101820] hover:bg-[#1E293B] active:scale-95 text-xs font-bold text-red-400 border border-slate-800 hover:border-slate-700 rounded-xl transition-all shadow-md cursor-pointer"
        >
          NO
        </button>
      </div>

      {/* Footer Chat Input Form */}
      <div className="absolute bottom-16 inset-x-0 h-16 px-4 bg-[#0A0A0A]/95 border-t border-slate-900 flex items-center z-20">
        <form onSubmit={handleFormSubmit} className="w-full relative flex items-center">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Type home system questions..."
            className="w-full bg-[#101820] border border-slate-800 rounded-full py-2.5 pl-4 pr-12 text-[11px] text-white placeholder-zinc-500 focus:outline-none focus:border-[#2563EB] transition-colors font-sans"
          />
          <button
            type="submit"
            disabled={!inputVal.trim() || isTyping}
            className={`absolute right-1.5 p-2 rounded-full transition-all flex items-center justify-center ${
              inputVal.trim() && !isTyping
                ? "bg-[#2563EB] hover:bg-blue-600 text-white cursor-pointer"
                : "bg-slate-900 text-zinc-600 cursor-not-allowed"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      <BottomNavBar activeTab="chat" onNavigateToScreen={onNavigateToScreen} />

    </div>
  );
}
