import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = `https://cinemate-6k9l.onrender.com`;

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();
  const isLogin = mode === "login";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        const { data } = await axios.post(`${API_URL}/api/auth/login`, {
          email,
          password,
        });
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.id);
        navigate("/");
      } else {
        const { data } = await axios.post(`${API_URL}/api/auth/register`, {
          username,
          email,
          password,
          profilePic,
        });
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.id);
        navigate("/");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-white text-2xl font-bold text-center mb-1">
          {isLogin ? "Sign in" : "Create account"}
        </h1>
        <p className="text-gray-500 text-sm text-center mb-8">
          {isLogin ? "Welcome back." : "Fill in your details to get started."}
        </p>

        <div className="bg-[#161b27] border border-gray-800 rounded-2xl p-7 shadow-xl">
          {/* Tabs */}
          <div className="flex bg-[#0f1117] rounded-xl p-1 mb-6">
            {["login", "register"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setMode(tab);
                  setError("");
                  setPreview(null);
                  setProfilePic(null);
                }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  mode === tab
                    ? "bg-indigo-600 text-white"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {tab === "login" ? "Login" : "Register"}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-400 text-sm bg-red-950/40 border border-red-900/50 rounded-lg px-4 py-2.5 mb-4">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Profile picture — register only */}
            {!isLogin && (
              <div>
                <label className="text-gray-400 text-xs font-medium block mb-1.5">
                  Profile Picture URL
                </label>
                <input
                  type="text"
                  value={profilePic}
                  onChange={(e) => setProfilePic(e.target.value)}
                  required
                  className="w-full bg-[#0f1117] border border-gray-800 rounded-xl px-4 py-3 text-sm text-black  placeholder-gray-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="text-gray-400 text-xs font-medium block mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="akash"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full bg-[#0f1117] border border-gray-800 rounded-xl px-4 py-3 text-sm text-black placeholder-gray-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            )}

            <div>
              <label className="text-gray-400 text-xs font-medium block mb-1.5">
                Email
              </label>
              <input
                type="email"
                placeholder="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white border border-gray-800 rounded-xl px-4 py-3 text-sm text-black placeholder-gray-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-gray-400 text-xs font-medium">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-white border border-black-800 rounded-xl px-4 pr-11 py-3 text-sm text-gray-500  placeholder-gray-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-3.5 -trangray-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
                >
                  {showPass ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 mt-1"
            >
              {loading && (
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
              )}
              {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
            </button>
          </form>
        </div>

        <p className="text-gray-600 text-xs text-center mt-5">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => {
              setMode(isLogin ? "register" : "login");
              setError("");
              setPreview(null);
              setProfilePic(null);
            }}
            className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            {isLogin ? "Register" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}
