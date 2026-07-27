// app/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function CaptivePortal() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const mockMacAddress = "F1:E2:D3:C4:B5:A6";

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mac_address: mockMacAddress,
          email: email
        }),
      });

      if (response.ok) { setStatus("success"); } else { setStatus("error"); }
    } catch (error) {
      console.error("Connection failed:", error);
      setStatus("error");
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Card className="max-w-md w-full bg-card border border-border rounded-2xl shadow-2xl p-8">

        <CardHeader className="text-center p-0 mb-2">
          <CardTitle className="text-3xl font-black text-primary tracking-tight mb-1">ZeroGate</CardTitle>
          <CardDescription className="text-muted-foreground text-sm font-medium">Secure Guest Network Authentication</CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          {status === "success" ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/50">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Connection Established</h2>
              <p className="text-muted-foreground text-sm">Your device is authorized. You now have 2 hours of internet access.</p>
            </div>
          ) : (
            <form onSubmit={handleConnect} className="space-y-4 mt-2">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground/80 mb-2">Email Address</label>
                <Input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 rounded-lg border-border bg-background text-foreground transition-all focus-visible:border-primary focus-visible:ring-primary"
                  placeholder="guest@example.com"
                  disabled={status === "loading"}
                />
              </div>

              <Button
                type="submit"
                disabled={status === "loading"}
                className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg transition-colors mb-2"
              >
                {status === "loading" ? "Authorizing..." : "Connect to Network"}
              </Button>

              <p className="text-xs text-muted-foreground text-center w-fit mx-auto">
                By connecting, you agree to continuous network monitoring. Sessions are limited to 2 hours. Malicious traffic will result in immediate quarantine.
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}