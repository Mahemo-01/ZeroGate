import { useState, useEffect, useCallback } from "react";
import type { ThreatAlert } from "@/components/table-columns";

export function useThreatAlerts() {
  const [alerts, setAlerts] = useState<ThreatAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = useCallback(async () => {
    try {
      const host = window.location.hostname;
      const res = await fetch(`http://${host}:8000/api/alerts`);

      if (!res.ok) throw new Error("Server error fetching alerts");

      const data = await res.json();
      setAlerts(data);
    } catch (err) {
      console.error("Failed to fetch API:", err);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchAlerts();
    const host = window.location.hostname;
    const ws = new WebSocket(`ws://${host}:8000/ws/devices`);

    ws.onmessage = () => {
      console.log("🔄 Security event detected. Updating alerts...");
      fetchAlerts();
    };

    ws.onerror = (error) => console.error("WebSocket Error:", error);
    return () => ws.close();
  }, [fetchAlerts]);

  return { alerts, loading };
}