"use client";

import { useState } from "react";
import { authenticateAdmin } from "./actions";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AdminLogin() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    setError(null);

    const result = await authenticateAdmin(formData);

    if (result?.error) {
      setError(result.error);
      setIsPending(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Card className="max-w-sm w-full bg-card border border-border rounded-2xl shadow-2xl p-8">

        <CardHeader className="text-center p-0 mb-2">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center border border-primary/20">
              <ShieldAlert className="w-8 h-8" />
            </div>
          </div>
          <CardTitle className="text-3xl font-black text-primary tracking-tight mb-1">ZeroGate NOC</CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <form action={handleSubmit} className="space-y-4 mt-2">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground/80 mb-2">
                Password
              </label>
              <Input
                type="password"
                id="password"
                name="password"
                required
                className="h-10 rounded-lg border-border bg-background text-foreground transition-all focus-visible:border-primary focus-visible:ring-primary"
                placeholder="••••••••"
                disabled={isPending}
              />
            </div>

            {error && (
              <div className="text-sm font-medium text-destructive text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-10 bg-primary hover:bg-primary text-primary-foreground font-bold rounded-lg transition-colors mb-2"
            >
              {isPending ? "Verifing creedentials..." : "Log in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}