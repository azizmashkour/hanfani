"use client";

import { useCallback, useRef, useState } from "react";
import SearchableCountrySelect from "@/components/SearchableCountrySelect";
import { sendAgentMessage } from "@/actions/agent";

type MessageRole = "user" | "assistant";

interface Message {
  role: MessageRole;
  content: string;
}

export default function AgentPage() {
  const [country, setCountry] = useState("US");
  const [topic, setTopic] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    setInput("");
    setError(null);
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setIsLoading(true);

    try {
      const reply = await sendAgentMessage(text, country, topic.trim() || undefined);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get response");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I couldn't process your request. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [input, country, topic, isLoading, scrollToBottom]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-stone-50 dark:bg-stone-950">
      <main className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col px-8 py-10">
        <h1
          className={
            "mb-2 text-[28px] font-semibold tracking-tight " +
            "text-stone-900 dark:text-stone-50"
          }
        >
          AI Agent
        </h1>
        <p className="mb-8 text-[15px] leading-relaxed text-stone-600 dark:text-stone-400">
          Discover what&apos;s trending, explore coverage across news and platforms, and stay
          ahead with autonomous AI guidance. Ask about trends, get insights, and turn data
          into action.
        </p>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end">
          <SearchableCountrySelect
            id="agent-country"
            label="Country (for trends context)"
            value={country}
            onChange={setCountry}
          />
          <div>
            <label
              htmlFor="agent-topic"
              className="mb-2 block text-[13px] font-medium text-stone-700 dark:text-stone-300"
            >
              Topic (optional – for news/mentions)
            </label>
            <input
              id="agent-topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. AI developments"
              className={
                "w-full max-w-xs rounded-lg border border-stone-200 bg-white " +
                "px-4 py-2.5 text-[14px] text-stone-900 placeholder:text-stone-400 " +
                "transition focus:border-stone-400 focus:outline-none focus:ring-2 " +
                "focus:ring-stone-200/50 dark:border-stone-700 dark:bg-stone-900 " +
                "dark:text-stone-50 dark:placeholder:text-stone-500 " +
                "dark:focus:border-stone-600 dark:focus:ring-stone-600/30"
              }
            />
          </div>
        </div>

        <div
          className={
            "flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border " +
            "border-stone-200 bg-white shadow-sm dark:border-stone-700/80 " +
            "dark:bg-stone-900 dark:shadow-stone-950/50"
          }
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="mb-2 text-[15px] font-medium text-stone-700 dark:text-stone-300">
                  Start a conversation
                </p>
                <p className="max-w-md text-[14px] text-stone-500 dark:text-stone-400">
                  Ask about trending topics, request insights on a specific trend, or explore
                  news coverage. The agent has access to real-time trends and mentions.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {[
                    "What's trending in my country?",
                    "Summarize the top 5 trends",
                    "Why is [topic] trending?",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => {
                        setInput(suggestion);
                        inputRef.current?.focus();
                      }}
                      className={
                        "rounded-lg border border-stone-200 bg-stone-50 " +
                        "px-3 py-2 text-[13px] text-stone-600 transition " +
                        "hover:border-stone-300 hover:bg-stone-100 " +
                        "dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400 " +
                        "dark:hover:border-stone-600 dark:hover:bg-stone-700"
                      }
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={
                  `mb-4 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`
                }
              >
                <div
                  className={
                    `max-w-[85%] rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                        : "border border-stone-200 bg-stone-50 " +
                          "dark:border-stone-700 dark:bg-stone-800/50 dark:text-stone-100"
                    }`
                  }
                >
                  <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
                    {msg.content}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="mb-4 flex justify-start">
                <div
                  className={
                    "flex items-center gap-2 rounded-2xl border " +
                    "border-stone-200 bg-stone-50 px-4 py-3 " +
                    "dark:border-stone-700 dark:bg-stone-800/50"
                  }
                >
                  <span
                    className={
                      "h-3 w-3 animate-spin rounded-full border-2 " +
                      "border-stone-300 border-t-stone-600 " +
                      "dark:border-stone-600 dark:border-t-stone-400"
                    }
                  />
                  <span className="text-[14px] text-stone-500 dark:text-stone-400">
                    Thinking...
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div
                className={
                  "mb-4 rounded-xl border border-red-200/80 bg-red-50 " +
                  "px-4 py-3 text-[14px] text-red-800 " +
                  "dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
                }
              >
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-stone-200 p-4 dark:border-stone-700">
            <div className="flex gap-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about trends, coverage, or insights..."
                rows={2}
                disabled={isLoading}
                className={
                  "min-h-[48px] flex-1 resize-none rounded-xl border " +
                  "border-stone-200 bg-stone-50 px-4 py-3 text-[15px] " +
                  "text-stone-900 placeholder:text-stone-400 transition " +
                  "focus:border-stone-400 focus:outline-none focus:ring-2 " +
                  "focus:ring-stone-200/50 disabled:opacity-60 " +
                  "dark:border-stone-700 dark:bg-stone-800 dark:text-stone-50 " +
                  "dark:placeholder:text-stone-500 " +
                  "dark:focus:border-stone-600 dark:focus:ring-stone-600/30"
                }
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className={
                  "shrink-0 self-end rounded-xl bg-stone-900 px-5 py-3 " +
                  "text-[14px] font-medium text-white transition " +
                  "hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed " +
                  "dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
                }
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
