"use client";

import { useEffect, useState } from "react";

// Define the TypeScript shape of our data
interface ThreatAlert {
  id: number;
  timestamp: string;
  signature: string;
  severity: number;
  action_taken: string;
  device: {
    mac_address: string;
    email: string;
    label: string;
  };
}

export default function Dashboard() {
  const [alerts, setAlerts] = useState<ThreatAlert[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch the data from your Python API when the page loads
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/alerts")
      .then((res) => res.json())
      .then((data) => {
        setAlerts(data);
        setLoading(false);
      })
      .catch((err) => console.error("Failed to fetch API:", err));
  }, []);

  return (
    <main className="min-h-screen bg-gray-900 text-white p-10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8 border-b border-gray-700 pb-4">
          <h1 className="text-4xl font-bold text-emerald-400 tracking-tight">ZeroGate NOC</h1>
          <p className="text-gray-400 mt-2">Active Threat Monitoring & Captive Portal Logs</p>
        </div>

        {/* The Data Table */}
        <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-950 text-gray-400 text-sm uppercase">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Threat Signature</th>
                <th className="px-6 py-4">Severity</th>
                <th className="px-6 py-4">Device (Identity)</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-4 text-center">Loading NOC Data...</td></tr>
              ) : alerts.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-4 text-center">Network Secure. No threats detected.</td></tr>
              ) : (
                alerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-gray-750 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-gray-300">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-red-400">
                      {alert.signature}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/50 rounded-full text-xs font-bold">
                        CRITICAL
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-semibold text-emerald-300">{alert.device.email}</div>
                      <div className="text-xs text-gray-400 font-mono mt-1">{alert.device.mac_address}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300 text-sm uppercase tracking-wider">
                        {alert.action_taken}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </main>
  );
}