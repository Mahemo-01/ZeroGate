import { useState, useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

// --- MOCK DATA ---
const chartData = [
  // MAYO
  { date: "2026-05-01", visitors: 182 }, { date: "2026-05-02", visitors: 205 }, { date: "2026-05-03", visitors: 198 },
  { date: "2026-05-04", visitors: 145 }, { date: "2026-05-05", visitors: 130 }, { date: "2026-05-06", visitors: 175 },
  { date: "2026-05-07", visitors: 210 }, { date: "2026-05-08", visitors: 260 }, { date: "2026-05-09", visitors: 290 },
  { date: "2026-05-10", visitors: 250 }, { date: "2026-05-11", visitors: 190 }, { date: "2026-05-12", visitors: 480 },
  { date: "2026-05-13", visitors: 430 }, { date: "2026-05-14", visitors: 215 }, { date: "2026-05-15", visitors: 180 },
  { date: "2026-05-16", visitors: 165 }, { date: "2026-05-17", visitors: 170 }, { date: "2026-05-18", visitors: 195 },
  { date: "2026-05-19", visitors: 140 }, { date: "2026-05-20", visitors: 135 }, { date: "2026-05-21", visitors: 120 },
  { date: "2026-05-22", visitors: 110 }, { date: "2026-05-23", visitors: 280 }, { date: "2026-05-24", visitors: 310 },
  { date: "2026-05-25", visitors: 305 }, { date: "2026-05-26", visitors: 260 }, { date: "2026-05-27", visitors: 210 },
  { date: "2026-05-28", visitors: 195 }, { date: "2026-05-29", visitors: 185 }, { date: "2026-05-30", visitors: 200 },
  { date: "2026-05-31", visitors: 220 },
  // JUNIO
  { date: "2026-06-01", visitors: 160 }, { date: "2026-06-02", visitors: 140 }, { date: "2026-06-03", visitors: 125 },
  { date: "2026-06-04", visitors: 115 }, { date: "2026-06-05", visitors: 105 }, { date: "2026-06-06", visitors: 130 },
  { date: "2026-06-07", visitors: 155 }, { date: "2026-06-08", visitors: 220 }, { date: "2026-06-09", visitors: 340 },
  { date: "2026-06-10", visitors: 410 }, { date: "2026-06-11", visitors: 485 }, { date: "2026-06-12", visitors: 460 },
  { date: "2026-06-13", visitors: 390 }, { date: "2026-06-14", visitors: 375 }, { date: "2026-06-15", visitors: 310 },
  { date: "2026-06-16", visitors: 250 }, { date: "2026-06-17", visitors: 230 }, { date: "2026-06-18", visitors: 205 },
  { date: "2026-06-19", visitors: 180 }, { date: "2026-06-20", visitors: 190 }, { date: "2026-06-21", visitors: 215 },
  { date: "2026-06-22", visitors: 260 }, { date: "2026-06-23", visitors: 185 }, { date: "2026-06-24", visitors: 160 },
  { date: "2026-06-25", visitors: 150 }, { date: "2026-06-26", visitors: 280 }, { date: "2026-06-27", visitors: 320 },
  { date: "2026-06-28", visitors: 290 }, { date: "2026-06-29", visitors: 210 }, { date: "2026-06-30", visitors: 190 },
  // JULIO
  { date: "2026-07-01", visitors: 180 }, { date: "2026-07-02", visitors: 175 }, { date: "2026-07-03", visitors: 210 },
  { date: "2026-07-04", visitors: 250 }, { date: "2026-07-05", visitors: 310 }, { date: "2026-07-06", visitors: 580 },
  { date: "2026-07-07", visitors: 520 }, { date: "2026-07-08", visitors: 340 }, { date: "2026-07-09", visitors: 210 },
  { date: "2026-07-10", visitors: 185 }, { date: "2026-07-11", visitors: 160 }, { date: "2026-07-12", visitors: 145 },
  { date: "2026-07-13", visitors: 170 }, { date: "2026-07-14", visitors: 195 }, { date: "2026-07-15", visitors: 220 },
  { date: "2026-07-16", visitors: 280 }, { date: "2026-07-17", visitors: 345 }, { date: "2026-07-18", visitors: 310 },
  { date: "2026-07-19", visitors: 260 }, { date: "2026-07-20", visitors: 240 }, { date: "2026-07-21", visitors: 215 },
  { date: "2026-07-22", visitors: 190 }, { date: "2026-07-23", visitors: 180 }, { date: "2026-07-24", visitors: 420 },
  { date: "2026-07-25", visitors: 490 }, { date: "2026-07-26", visitors: 510 }, { date: "2026-07-27", visitors: 430 },
  { date: "2026-07-28", visitors: 380 }
];

const chartConfig = {
  visitors: {
    label: "Total Visitors\u00A0",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function NetworkTrafficChart() {
  const [timeRange, setTimeRange] = useState("3m");

  const filteredData = useMemo(() => {
    if (timeRange === "7d") { return chartData.slice(-7); }
    if (timeRange === "30d") { return chartData.slice(-30); }
    return chartData;
  }, [timeRange]);

  return (
    <Card variant="glassmorphism" className="col-span-2 lg:col-span-4 flex flex-col justify-between p-6">
      <CardHeader className="flex flex-row items-center justify-between p-0 mb-4 space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold">Network Traffic</CardTitle>
          <CardDescription className="text-xs text-muted-foreground/70">Visitors history</CardDescription>
        </div>

        <div className="flex items-center rounded-md border border-border bg-transparent p-0 overflow-hidden">
          <button
            onClick={() => setTimeRange("3m")}
            className={cn(
              "px-4 py-1.5 text-xs font-medium transition-colors border-r border-border hover:bg-muted/50",
              timeRange === "3m" ? "bg-muted text-foreground" : "text-muted-foreground"
            )}
          >
            Last 3 months
          </button>
          <button
            onClick={() => setTimeRange("30d")}
            className={cn(
              "px-4 py-1.5 text-xs font-medium transition-colors border-r border-border hover:bg-muted/50",
              timeRange === "30d" ? "bg-muted text-foreground" : "text-muted-foreground"
            )}
          >
            Last 30 days
          </button>
          <button
            onClick={() => setTimeRange("7d")}
            className={cn(
              "px-4 py-1.5 text-xs font-medium transition-colors hover:bg-muted/50",
              timeRange === "7d" ? "bg-muted text-foreground" : "text-muted-foreground"
            )}
          >
            Last 7 days
          </button>
        </div>

      </CardHeader>

      <CardContent className="p-0">
        <ChartContainer config={chartConfig} className="h-[100px] w-full">
          <AreaChart data={filteredData} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
            <defs>
              <linearGradient id="fillVisitors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f8fafc" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f8fafc" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <YAxis hide domain={[0, 'auto']} tickCount={4} />
            <CartesianGrid vertical={false} horizontal={true} stroke="rgba(190, 190, 190, 0.12)" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={16}
              minTickGap={20}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
              }}
              className="text-xs text-muted-foreground/70 font-medium"
            />

            <ChartTooltip cursor={true} content={<ChartTooltipContent indicator="dot" hideLabel />} />
            <Area dataKey="visitors" type="natural" fill="url(#fillVisitors)" stroke="#f8fafc" strokeWidth={2} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}