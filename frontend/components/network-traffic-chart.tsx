import { Area, AreaChart } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Activity } from "lucide-react";

// --- MOCK DATA ---
const chartData = [
  { date: "2024-04-01", visitors: 222 },
  { date: "2024-04-08", visitors: 409 },
  { date: "2024-04-15", visitors: 120 },
  { date: "2024-04-22", visitors: 224 },
  { date: "2024-04-29", visitors: 315 },
  { date: "2024-05-06", visitors: 498 },
  { date: "2024-05-13", visitors: 197 },
  { date: "2024-05-20", visitors: 177 },
  { date: "2024-05-27", visitors: 420 },
  { date: "2024-06-03", visitors: 103 },
  { date: "2024-06-10", visitors: 155 },
  { date: "2024-06-17", visitors: 475 },
  { date: "2024-06-24", visitors: 132 },
  { date: "2024-06-30", visitors: 446 },
];

const chartConfig = {
  visitors: {
    label: "Total Visitors",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function NetworkTrafficChart() {
  return (
    <Card variant="glassmorphism" className="col-span-2 lg:col-span-4 flex flex-col justify-between p-6">
      <CardHeader className="flex flex-row items-center justify-between pb-0 space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold">Network Traffic</CardTitle>
          <CardDescription className="text-xs">Visitors last 30 days</CardDescription>
        </div>
        <Activity className="w-5 h-5 text-muted-foreground opacity-50" />
      </CardHeader>
      <CardContent className="p-0">
        <ChartContainer config={chartConfig} className="h-[100px] w-full">
          <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="fillVisitors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f8fafc" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f8fafc" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" hideLabel />} />
            <Area dataKey="visitors" type="natural" fill="url(#fillVisitors)" stroke="#f8fafc" strokeWidth={2} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}