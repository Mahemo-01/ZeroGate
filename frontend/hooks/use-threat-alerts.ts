import { useState, useEffect, useCallback } from "react";
import type { ThreatAlert } from "@/components/table-columns";
import { useZeroGateSocket } from "@/providers/websocket-provider";

export function useThreatAlerts() {
  const [alerts, setAlerts] = useState<ThreatAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const { lastMessage } = useZeroGateSocket();

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
  }, [fetchAlerts]);

  useEffect(() => {
    if (lastMessage) {
      console.log("🔄 Security event detected. Updating alerts...");
      fetchAlerts();
    }
  }, [lastMessage, fetchAlerts]);

  return { alerts, loading };
}