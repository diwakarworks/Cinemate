import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import axios from "axios";

const API_URL = "https://cinemate-6k9l.onrender.com"; 

const WELCOME_MESSAGE =
  "Hey, cinephile!, I can recommend films, series based on your diary. What are you in the mood for?";

const DiaryRagChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: WELCOME_MESSAGE,
      movies: [],
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, isOpen]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = async (event) => {
    event.preventDefault();


    const query = input.trim();
    if (!query || isLoading) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: query, movies: [] },
    ]);
    setInput("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_URL}/api/rag/chat`,
        { question: query },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = response.data;

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            data.answer ||
            (Array.isArray(data.recommendations) &&
            data.recommendations.length > 0
              ? "Here are my recommendations based on your request."
              : "I couldn't find suitable recommendations. Try another query."),
          movies: Array.isArray(data.recommendations)
            ? data.recommendations
            : [],
        },
      ]);
    } catch (error) {
      console.error(
        "Diary RAG chat error:",
        error.response?.data || error.message,
      );

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            error.response?.data?.message ||
            "Sorry, I couldn't connect to your diary recommendations. Please try again.",
          movies: [],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const widget = (
    <div className="fixed bottom-5 right-5 z-50 font-sans text-sm text-gray-900 antialiased">
      {/* Launcher */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open Cinemate Discover"
          className="flex h-12 w-12 items-center justify-center rounded-full border-0 bg-gray-900 p-0 text-xl text-white shadow-lg transition hover:bg-gray-700"
        >
          🎬
        </button>
      )}

      {/* Panel */}
      {isOpen && (
        <aside
          aria-label="Cinemate Discover"
          className="flex h-96 w-80 max-w-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white text-gray-900 shadow-2xl"
        >
          {/* Header */}
          <header className="flex shrink-0 items-center gap-2.5 border-b border-gray-200 bg-white px-4 py-3">
            <span className="text-xl leading-none">🎬</span>

            <div className="min-w-0">
              <h2 className="m-0 text-sm font-semibold uppercase leading-tight tracking-wide text-gray-900">
                Cinemate Discover
              </h2>
              <p className="m-0 flex items-center gap-1.5 text-xs leading-tight text-gray-500">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Recommendations from your diary
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              title="Close"
              aria-label="Close chat"
              className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-0 bg-transparent p-0 text-lg leading-none text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
            >
              ×
            </button>
          </header>

          {/* Conversation */}
          <div
            aria-live="polite"
            className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto bg-gray-50 px-3 py-3"
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] break-words rounded-2xl px-3 py-2 text-[13px] leading-5 ${
                    msg.role === "user"
                      ? "rounded-br-sm bg-gray-900 text-white"
                      : "rounded-bl-sm border border-gray-200 bg-white text-gray-900 shadow-sm"
                  }`}
                >
                  <p className="m-0 whitespace-pre-wrap text-inherit">
                    {msg.content}
                  </p>

                  {msg.movies.length > 0 && (
                    <ul className="m-0 mt-2 flex list-none flex-wrap gap-1 p-0">
                      {msg.movies.map((movie, movieIndex) => {
                        const title =
                          typeof movie === "string"
                            ? movie
                            : movie.title ||
                              movie.name ||
                              movie.movieTitle ||
                              "";

                        if (!title) return null;

                        return (
                          <li
                            key={`${title}-${movieIndex}`}
                            className="m-0 rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800"
                          >
                            {title}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-500" />
                <span
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-500"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-500"
                  style={{ animationDelay: "300ms" }}
                />
                <span className="ml-1">Finding films from your diary...</span>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={sendMessage}
            className="m-0 shrink-0 border-t border-gray-200 bg-white px-3 pb-2 pt-2.5"
          >
            <div className="flex items-center gap-2 rounded-full border border-gray-300 bg-white py-1 pl-3.5 pr-1 focus-within:border-gray-900">
              <input
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about films in your diary..."
                aria-label="Ask your diary chatbot"
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
            </div>

            <p className="m-0 mt-1.5 text-center text-[11px] text-gray-400">
              Personalized with your movie diary
            </p>
          </form>
        </aside>
      )}
    </div>
  );

  return createPortal(widget, document.body);
};

export default DiaryRagChat;
