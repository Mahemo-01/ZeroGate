"use client";

import { useState } from "react";

export default function CaptivePortal() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  // In a real deployment, the router passes the user's MAC address automatically. 
  // For our local Mac test, we hardcode a mock MAC address.
  const mockMacAddress = "F1:E2:D3:C4:B5:A6";

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      // Send the data to your Python FastAPI server
      const response = await fetch(
        `http://127.0.0.1:8000/api/register?mac_address=${mockMacAddress}&email=${email}`,
        { method: "POST" }
      );

      if (response.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error("Connection failed:", error);
      setStatus("error");
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8">

        {/* Branding */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-emerald-400 tracking-tight mb-2">ZeroGate</h1>
          <p className="text-gray-400 text-sm">Secure Guest Network Authentication</p>
        </div>

        {status === "success" ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/50">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Connection Established</h2>
            <p className="text-gray-400 text-sm">Your device is authorized. You now have 2 hours of internet access.</p>
          </div>
        ) : (
          <form onSubmit={handleConnect} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-gray-600 transition-all"
                placeholder="guest@example.com"
                disabled={status === "loading"}
              />
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg transition-colors flex justify-center items-center"
            >
              {status === "loading" ? "Authorizing..." : "Connect to Network"}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              By connecting, you agree to continuous network monitoring. Sessions are limited to 2 hours. Malicious traffic will result in immediate quarantine.
            </p>
          </form>
        )}
      </div>
    </main>
  );
}