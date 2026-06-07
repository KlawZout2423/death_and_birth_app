"use client";

import { useState, useEffect } from "react";

// Inline SVG Icons to avoid dependency issues
const Icons = {
  MessageCircle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
  ),
  X: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  ),
  Send: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
  ),
  Bot: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
  )
};

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I am the Registry's digital assistant. How can I help you today?" },
  ]);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    fetch("/api/me")
      .then(res => res.json())
      .then(data => setUser(data?.user || null))
      .catch(() => setUser(null));
  }, []);

  const getSuggestedQuestions = () => {
    if (!user) return ["How do I register a birth?", "What is the Registrar General's role?", "Is my data secure?"];
    
    if (user.role === "ADMINISTRATOR") {
      return ["System health check", "How do banks get notified?", "Generate monthly report", "View security logs"];
    }
    
    if (user.email?.includes("pension") || user.email?.includes("ssnit")) {
      return ["How to process death benefits?", "Verify death notification", "How to link records to IDs?"];
    }

    if (user.email?.includes("bank")) {
      return ["Procedure for account freezing", "Verify KYC for next of kin", "Security protocols for data"];
    }

    return ["How do I register a record?", "Check my submissions", "How long does certification take?"];
  };

  const suggestedQuestions = getSuggestedQuestions();

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInputValue("");

    setTimeout(() => {
      let response = "I'm currently in 'Demonstration Mode'. In the full version, I can help you search records and verify certificates directly.";
      
      const query = text.toLowerCase();
      
      if (query.includes("birth")) {
        response = "To register a birth, go to the 'Register Birth' section. You'll need the clinic slip, parental IDs, and the baby's details. Verification usually takes 24-48 hours.";
      } else if (query.includes("status") || query.includes("certificate")) {
        response = "You can check any certificate status in the 'Certificates' tab. Once approved by the Registrar General, the digital certificate is available for download instantly.";
      } else if (query.includes("role") || query.includes("registrar general")) {
        response = "The Registrar General oversees the national identity lifecycle. This platform digitizes that process, connecting the registry directly to banks and pensions for total security.";
      } else if (query.includes("bank") || query.includes("notify") || query.includes("pension")) {
        response = "Our 'Broadcast' feature automatically notifies banks and SSNIT within seconds of a death being verified. This secures accounts and speeds up benefit claims for families.";
      } else if (query.includes("secure") || query.includes("security") || query.includes("data")) {
        response = "Data security is our priority. We use industry-standard encryption and strict Role-Based Access Control (RBAC) to ensure only authorized personnel can access sensitive records.";
      } else if (query.includes("health") || query.includes("system")) {
        response = "All systems are operational. Database connectivity is 100%, and the Institutional Notification Engine is currently monitoring 4 major financial partners.";
      } else if (query.includes("long") || query.includes("time")) {
        response = "The digital process reduces waiting times from weeks to just hours. Verification happens in real-time, and certificates are issued the moment approval is granted.";
      }

      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    }, 600);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[350px] h-[500px] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-rose-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Icons.Bot />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Registry Assistant</h3>
                <p className="text-[10px] text-rose-100">Always online</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/10 p-1 rounded-lg transition-colors"
            >
              <Icons.X />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50 dark:bg-zinc-950/50">
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div 
                  className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.role === "user" 
                      ? "bg-rose-600 text-white rounded-tr-none shadow-md" 
                      : "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-tl-none text-zinc-800 dark:text-zinc-200 shadow-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            
            {messages.length === 1 && (
              <div className="pt-2 space-y-2">
                <p className="text-[11px] text-zinc-500 uppercase font-bold px-1">Suggested Questions</p>
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q)}
                    className="block w-full text-left p-2 text-xs bg-white dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 border border-zinc-200 dark:border-zinc-700 rounded-xl transition-colors text-zinc-600 dark:text-zinc-400 shadow-sm"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(inputValue);
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-rose-500 dark:text-white"
              />
              <button 
                type="submit"
                className="p-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors shadow-md"
              >
                <Icons.Send />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95 ${
          isOpen ? "bg-zinc-800 text-white rotate-90" : "bg-rose-600 text-white"
        }`}
      >
        {isOpen ? <Icons.X /> : <Icons.MessageCircle />}
      </button>
    </div>
  );
}
