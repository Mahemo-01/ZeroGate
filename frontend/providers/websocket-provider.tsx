"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type WSContextType = {
  lastMessage: any;
};

const WSContext = createContext<WSContextType>({ lastMessage: null });

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [lastMessage, setLastMessage] = useState<any>(null);

  useEffect(() => {
    const host = window.location.hostname;
    const ws = new WebSocket(`ws://${host}:8000/ws/devices`);

    ws.onmessage = (event) => { setLastMessage(event.data); };
    ws.onerror = (error) => console.error("WebSocket Error:", error);
    return () => ws.close();
  }, []);

  return (
    <WSContext.Provider value={{ lastMessage }}>
      {children}
    </WSContext.Provider>
  );
}

export const useZeroGateSocket = () => useContext(WSContext);