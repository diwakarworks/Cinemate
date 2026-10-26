import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import axios from "axios";

const API_URL = "https://cinemate-6k9l.onrender.com";

const WELCOME_MESSAGE =
  "Hey, cinephile!, I'm Cinemate, your entertainment companion. Ask me anything about films, series , directors, genres, or recommendations.";

const CinemateChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [messages, setMessages] = useState([
    { role: "assistant", content: WELCOME_MESSAGE, movies: [] },
  ]);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, isOpen]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = async (event) => {
    event?.preventDefault();

    const message = input.trim();
    if (!message || isLoading) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: message, movies: [] },
    ]);

    setInput("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_URL}/api/chat/messages`,
        {
          message,
          ...(conversationId ? { conversationId } : {}),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;

      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer || "I couldn't generate a response.",
          movies: Array.isArray(data.movies) ? data.movies : [],
        },
      ]);
    } catch (error) {
      console.error("Cinemate chat error:", error.response?.data || error.message);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I couldn't connect right now. Please try again.",
          movies: [],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    setConversationId(null);
    setMessages([
      {
        role: "assistant",
        content: "Hey, cinephile!, What would you like to watch or discuss today?",
        movies: [],
      },
    ]);
    setInput("");
    inputRef.current?.focus();
  };

  const widget = (
    <div className="fixed bottom-5 right-5 z-50 font-sans text-sm text-gray-900 antialiased">
      {/* Launcher */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open Cinemate chat"
          className="flex h-12 w-12 items-center justify-center rounded-full border-0 bg-gray-900 p-0 text-xl text-white shadow-lg transition hover:bg-gray-700"
        >
          🎬
        </button>
      )}

      {/* Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Cinemate chat"
          className="flex h-96 w-80 max-w-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white text-gray-900 shadow-2xl"
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xl leading-none">🎬</span>
              <div>
                <div className="text-sm font-semibold uppercase leading-tight tracking-wide text-gray-900">
                  Cinemate
                </div>
                <div className="flex items-center gap-1.5 text-xs leading-tight text-gray-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Your screen companion
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={startNewChat}
                title="New conversation"
                aria-label="New conversation"
                className="flex h-7 w-7 items-center justify-center rounded-md border-0 bg-transparent p-0 text-lg leading-none text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close"
                aria-label="Close chat"
                className="flex h-7 w-7 items-center justify-center rounded-md border-0 bg-transparent p-0 text-lg leading-none text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
              >
                ×
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            aria-live="polite"
            className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto bg-gray-50 px-3 py-3"
          >
            {messages.map((msg, index) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={index}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] break-words rounded-2xl px-3 py-2 text-[13px] leading-5 ${
                      isUser
                        ? "bg-gray-900 text-white"
                        : "border border-gray-200 bg-white text-gray-900 shadow-sm"
                    }`}
                  >
                    <p className="m-0 whitespace-pre-wrap text-inherit">
                      {msg.content}
                    </p>

                    {msg.movies.length > 0 && (
                      <ul className="m-0 mt-2 flex list-none flex-wrap gap-1 p-0">
                        {msg.movies.map((movie, movieIndex) => (
                          <li
                            key={`${movie}-${movieIndex}`}
                            className="m-0 rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800"
                          >
                            {movie}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-start">
                <div
                  className="flex items-center gap-1 rounded-2xl border border-gray-200 bg-white px-3 py-3 shadow-sm"
                  aria-label="Cinemate is thinking"
                >
                  {[0, 150, 300].map((delay) => (
                    <span
                      key={delay}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Composer */}
          <div className="shrink-0 border-t border-gray-200 bg-white px-3 pb-2 pt-2.5">
            <form
              onSubmit={sendMessage}
              className="m-0 flex items-center gap-2 rounded-full border border-gray-300 bg-white py-1 pl-3.5 pr-1 focus-within:border-gray-900"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask me about movies..."
                aria-label="Your message"
                className="m-0 h-8 min-w-0 flex-1 border-0 bg-white p-0 text-[13px] text-gray-900 placeholder-gray-400 shadow-none outline-none ring-0 focus:outline-none focus:ring-0"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                aria-label="Send message"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-0 bg-gray-900 p-0 text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              </button>
            </form>
            <p className="m-0 mt-1.5 text-center text-[11px] text-gray-400">
              Powered by Cinemate
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(widget, document.body);
};

export default CinemateChat;