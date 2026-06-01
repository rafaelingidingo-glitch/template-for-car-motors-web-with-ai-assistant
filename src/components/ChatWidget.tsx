"use client";

// ─── AI Customer Care Chat Widget ───
// Floating button in bottom-right corner that expands to a chat window.
// Communicates with the secure backend API (/api/chat) which uses
// z-ai-web-dev-sdk so the AI provider credentials are never exposed.
// Supports i18n (English & Swahili) and has a typing indicator.

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Bot, User, Trash2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";

// ─── Types ───
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// ─── Session ID ───
// Generate a unique session ID per browser tab so conversations are isolated
function generateSessionId(): string {
  return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function ChatWidget() {
  const { locale } = useLanguage();

  // Chat open/close state
  const [isOpen, setIsOpen] = useState(false);
  // Messages in the current conversation
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // Current input value
  const [input, setInput] = useState("");
  // Loading state while waiting for AI response
  const [isLoading, setIsLoading] = useState(false);
  // Session ID for this chat instance (persisted across renders)
  const [sessionId] = useState(generateSessionId);
  // Whether the user has scrolled up (to avoid auto-scrolling when reading history)
  const [hasScrolledUp, setHasScrolledUp] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ─── Auto-scroll to bottom ───
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!hasScrolledUp) {
      scrollToBottom();
    }
  }, [messages, hasScrolledUp, scrollToBottom]);

  // Detect when user scrolls up
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 80;
    setHasScrolledUp(!isNearBottom);
  }, []);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // ─── Welcome message on first open ───
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (isOpen && !hasInitialized.current) {
      hasInitialized.current = true;
      const welcomeMsg: ChatMessage = {
        id: "welcome",
        role: "assistant",
        content:
          locale === "sw"
            ? "Karibu AutoElite Motors! 🚗 Niko hapa kukusaidia kwa maswali kuhusu magari, bei, mkopo, na huduma zingine. Unaweza kuuliza chochote!"
            : "Welcome to AutoElite Motors! 🚗 I'm here to help you with any questions about vehicles, pricing, financing, trade-ins, and more. How can I assist you today?",
        timestamp: new Date(),
      };
      setMessages([welcomeMsg]);
    }
  }, [isOpen, locale]);

  // ─── Send message ───
  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setHasScrolledUp(false);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: trimmed,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to get response");
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content:
          locale === "sw"
            ? "Samahani, kuna tatizo la kimtandao. Tafadhali jaribu tena au tupigie simu kwa +255 757 337 929."
            : "Sorry, I'm having trouble connecting right now. Please try again or call us at +255 757 337 929.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [input, isLoading, sessionId, locale]);

  // ─── Clear conversation ───
  const clearChat = useCallback(async () => {
    try {
      await fetch(`/api/chat?sessionId=${sessionId}`, { method: "DELETE" });
    } catch {
      // Silently ignore — the in-memory session will expire anyway
    }
    hasInitialized.current = false;
    setMessages([]);
    // Re-trigger welcome message
    setTimeout(() => {
      hasInitialized.current = true;
      const welcomeMsg: ChatMessage = {
        id: "welcome-new",
        role: "assistant",
        content:
          locale === "sw"
            ? "Karibu tena! 🚗 Niko tayari kukusaidia. Unaweza kuuliza chochote kuhusu magari yetu."
            : "Welcome back! 🚗 I'm ready to help. Feel free to ask me anything about our vehicles.",
        timestamp: new Date(),
      };
      setMessages([welcomeMsg]);
    }, 100);
  }, [sessionId, locale]);

  // ─── Handle key press (Enter to send) ───
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  // ─── Format message content with basic markdown ───
  // SECURITY: First escape HTML to prevent XSS, then apply safe markdown transforms
  const formatMessage = useCallback((content: string) => {
    // Escape HTML entities to prevent XSS (AI response could contain HTML/JS)
    let formatted = content
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

    // Convert **bold** to <strong> (after escaping, this is safe)
    formatted = formatted.replace(
      /\*\*(.*?)\*\*/g,
      "<strong>$1</strong>"
    );
    // Convert line breaks
    formatted = formatted.replace(/\n/g, "<br />");
    return formatted;
  }, []);

  // Chat translations (inline for self-contained component)
  const chatT = {
    title: locale === "sw" ? "Msaada wa Mteja" : "Customer Care",
    placeholder: locale === "sw" ? "Andika ujumbe wako..." : "Type your message...",
    sendBtn: locale === "sw" ? "Tuma" : "Send",
    clearBtn: locale === "sw" ? "Futa mazungumzo" : "Clear chat",
    thinking: locale === "sw" ? "Inafikiri..." : "Thinking...",
    aiName: locale === "sw" ? "Msaada" : "Assistant",
  };

  return (
    <>
      {/* ─── Floating Chat Button ─── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-cta hover:bg-cta-hover text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
          aria-label={chatT.title}
        >
          <MessageCircle className="w-6 h-6 transition-transform group-hover:scale-110" />
          {/* Pulse ring animation */}
          <span className="absolute inset-0 rounded-full bg-cta/40 animate-ping opacity-30" />
        </button>
      )}

      {/* ─── Chat Window ─── */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] sm:w-[380px] h-[500px] max-h-[calc(100vh-6rem)] flex flex-col bg-white rounded-none shadow-2xl border border-gray-200 overflow-hidden chat-window-enter">
          {/* ─── Header ─── */}
          <div className="flex items-center justify-between px-4 py-3 bg-navy text-white shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-cta/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm leading-tight">
                  {chatT.title}
                </h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span className="text-[11px] text-white/70">
                    {locale === "sw" ? "Mtandaoni" : "Online"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {/* Clear chat button */}
              <button
                onClick={clearChat}
                className="p-1.5 text-white/60 hover:text-white transition-colors"
                aria-label={chatT.clearBtn}
                title={chatT.clearBtn}
              >
                <Trash2 className="w-4 h-4" />
              </button>
              {/* Close button */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-white/60 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ─── Messages Area ─── */}
          <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gray-50"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {/* AI avatar */}
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-navy flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                )}

                {/* Message bubble */}
                <div
                  className={`max-w-[80%] px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-cta text-white rounded-[2px] rounded-br-sm"
                      : "bg-white text-gray-800 rounded-[2px] rounded-bl-sm border border-gray-200 shadow-sm"
                  }`}
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html: formatMessage(msg.content),
                    }}
                  />
                  <span
                    className={`block text-[10px] mt-1 ${
                      msg.role === "user"
                        ? "text-white/60"
                        : "text-gray-400"
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {/* User avatar */}
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-cta/10 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5 text-cta" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-full bg-navy flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-white px-4 py-3 rounded-[2px] rounded-bl-sm border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
                    </div>
                    <span className="text-xs text-gray-400 ml-1">
                      {chatT.thinking}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>

          {/* ─── Input Area ─── */}
          <div className="px-4 py-3 border-t border-gray-200 bg-white shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={chatT.placeholder}
                disabled={isLoading}
                className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-[2px] focus:outline-none focus:ring-2 focus:ring-cta/30 focus:border-cta bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-gray-400"
                maxLength={2000}
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                size="sm"
                className="h-10 w-10 p-0 bg-cta hover:bg-cta-hover text-white rounded-[2px] border-none shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={chatT.sendBtn}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5 text-center">
              {locale === "sw"
                ? "Inaendeshwa na AI • Wasiliana nasi kwa maelezo zaidi"
                : "AI-powered • Contact us for detailed inquiries"}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
