import { useState, useMemo, useEffect } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

interface TrafficData {
  date: string;
  visitors: number;
}

const chartConfig = {
  visitors: {
    label: "Total Visitors\u00A0",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function NetworkTrafficChart() {
  const [chartData, setChartData] = useState<TrafficData[]>([]);
  const [timeRange, setTimeRange] = useState("3m");

  const filteredData = useMemo(() => {
    if (timeRange === "7d") { return chartData.slice(-7); }
    if (timeRange === "30d") { return chartData.slice(-30); }
    return chartData;
  }, [timeRange, chartData]);

  useEffect(() => {
    const fetchRealTraffic = async () => {
      try {
        const res = await fetch("/api/network/traffic");
        if (!res.ok) { throw new Error(`Error del servidor: ${res.status}`); }
        const data = await res.json();
        setChartData(data);
      } catch (error) { console.error("Error fetching traffic data:", error); }
    };

    fetchRealTraffic();
    const interval = setInterval(fetchRealTraffic, 300000);
    return () => clearInterval(interval);
  }, []);

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