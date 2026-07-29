import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface InfoWidgetProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  textColor?: string;
  iconColor?: string;
  bgClass?: string;
}

export function InfoWidget({
  title,
  value,
  icon: Icon,
  textColor = "text-foreground",
  iconColor = "text-white/5",
  bgClass
}: InfoWidgetProps) {
  return (
    <Card variant="glassmorphism" className={cn("col-span-1 flex flex-col justify-between p-6 min-h-[190px]", bgClass)}>
      <Icon
        className={cn("absolute -right-6 -bottom-6 w-32 h-32 transition-colors duration-300 pointer-events-none", iconColor)}
        strokeWidth={1.5}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
        </div>
        <div className={cn("text-5xl font-bold tabular-nums tracking-tight transition-colors duration-300", textColor)}>
          {value}
        </div>
      </div>
    </Card>
  );
}