import { useState, useEffect, useMemo, useCallback } from "react";
import type { Device } from "@/components/table-columns";
import { useZeroGateSocket } from "@/providers/websocket-provider";

export function useDeviceNetwork() {
  const [data, setData] = useState<Device[]>([]);
  const { lastMessage } = useZeroGateSocket();

  const normalDevices = useMemo(() => data.filter(d => !d.is_blocked), [data]);
  const blockedDevices = useMemo(() => data.filter(d => d.is_blocked), [data]);

  const stats = useMemo(() => {
    const now = new Date();

    return {
      total: data.length,
      active: data.filter(d => {
        const isExpired = new Date(d.expiration_time) < now;
        return d.is_authenticated && !d.is_blocked && !isExpired;
      }).length,
      offline: data.filter(d => {
        const isExpired = new Date(d.expiration_time) < now;
        return (!d.is_authenticated || isExpired) && !d.is_blocked;
      }).length,
      blocked: blockedDevices.length
    };
  }, [data, blockedDevices]);

  const handleAction = useCallback(async (mac: string, action: 'revoke' | 'block' | 'unblock') => {
    try {
      const host = window.location.hostname;
      const response = await fetch(`http://${host}:8000/api/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mac_address: mac }),
      });

      if (!response.ok) { console.error(`Failed to execute ${action} (${response.status})`); }
    } catch (error) { console.error("Network error executing action:", error); }
  }, []);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const host = window.location.hostname;
        const response = await fetch(`http://${host}:8000/api/devices`);
        const json = await response.json();
        if (json.status === "success") setData(json.data);
      } catch (error) { console.error("Failed to fetch devices:", error); }
    };
    fetchDevices();
  }, []);

  useEffect(() => {
    if (lastMessage) {
      try {
        const json = JSON.parse(lastMessage);
        if (json.status === "success") setData(json.data);
      } catch (error) { console.error("Error parsing WS message:", error); }
    }
  }, [lastMessage]);

  return { normalDevices, blockedDevices, stats, handleAction };
}