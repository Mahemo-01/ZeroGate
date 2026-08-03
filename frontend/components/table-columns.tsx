import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Column } from "@tanstack/react-table";
import { MoreHorizontal, Shield, ShieldAlert, ShieldX, WifiOff, CheckCircle2, ChevronUp, ChevronDown, ArrowUpDown, Copy, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu";
import { copyToClipboard } from "@/lib/clipboard"

export interface Device {
  id: number;
  mac_address: string;
  ip_address: string;
  email: string;
  is_authenticated: boolean;
  is_blocked: boolean;
  risk_level: 'None' | 'Low' | 'Medium' | 'High';
  first_seen: string;
  expiration_time: string;
}

export interface ThreatAlert {
  id: number;
  timestamp: string;
  signature: string;
  severity: number;
  action_taken: string;
  device: {
    mac_address: string;
    email: string;
    label: string;
  };
}

const formatExpiration = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

interface SortableHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: string;
}

export function SortableHeader<TData, TValue>({ column, title }: SortableHeaderProps<TData, TValue>) {
  const isSorted = column.getIsSorted();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => column.toggleSorting(isSorted === "asc")}
      className="-ml-3 h-8 data-[state=open]:bg-accent text-muted-foreground hover:text-primary hover:cursor-pointer font-medium"
    >
      <span>{title}</span>
      {isSorted === "asc" ? (
        <ChevronUp className="ml-2 h-3.5 w-3.5 text-foreground" />
      ) : isSorted === "desc" ? (
        <ChevronDown className="ml-2 h-3.5 w-3.5 text-foreground" />
      ) : (
        <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-50" />
      )}
    </Button>
  );
}

const MacCell = ({ mac }: { mac: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(mac);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
      <span>{mac}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 text-muted-foreground/60 hover:text-primary hover:cursor-pointer hover:bg-accent"
        onClick={handleCopy}
        title="Copy MAC Address"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
      </Button>
    </div>
  );
};

export const getColumns = (handleAction: (mac: string, action: 'revoke' | 'block' | 'whitelist') => void): ColumnDef<Device>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || table.getIsSomePageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="border-input data-[state=checked]:bg-primary data-[state=checked]:border-primary"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="border-input data-[state=checked]:bg-primary data-[state=checked]:border-primary"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "mac_address",
    header: "MAC Address",
    cell: ({ row }) => <MacCell mac={row.getValue("mac_address")} />,
  },
  {
    accessorKey: "ip_address",
    header: ({ column }) => <SortableHeader column={column} title="IP Address" />,
    cell: ({ row }) => <div className="font-mono text-xs text-primary font-semibold">{row.getValue("ip_address")}</div>,
  },
  {
    accessorKey: "email",
    header: ({ column }) => <SortableHeader column={column} title="Email" />,
    cell: ({ row }) => <div className="text-foreground">{row.getValue("email") || "N/A"}</div>,
  },
  {
    accessorKey: "risk_level",
    header: ({ column }) => <SortableHeader column={column} title="Risk Level" />,
    cell: ({ row }) => {
      const risk = row.getValue("risk_level") as string || "None";

      const colors: Record<string, string> = {
        None: "text-muted-foreground",
        Low: "text-yellow-500",
        Medium: "text-orange-500",
        High: "text-red-500"
      };

      return <span className={`text-xs font-semibold ${colors[risk]}`}>{risk}</span>;
    },
  },
  {
    id: "status",
    accessorFn: (row) => row.is_authenticated,
    header: "Status",
    cell: ({ row }) => {
      const device = row.original;
      const isExpired = new Date(device.expiration_time) < new Date();

      if (isExpired) return <Badge variant="outline" className="border-red-500/30 text-red-400 bg-red-950/20">Offline</Badge>;
      if (device.is_authenticated) return <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10">Active</Badge>;

      return <Badge variant="outline" className="border-border text-muted-foreground">Pending</Badge>;
    },
  },
  {
    accessorKey: "expiration_time",
    header: ({ column }) => <SortableHeader column={column} title="Expires at" />,
    cell: ({ row }) => (
      <div className="text-xs text-muted-foreground font-medium">
        {formatExpiration(row.getValue("expiration_time"))}
      </div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const device = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center justify-center rounded-md h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors mx-auto">
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border-border text-popover-foreground">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Network Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleAction(device.mac_address, 'revoke')} className="text-amber-400 focus:text-amber-400 focus:bg-amber-950/30 cursor-pointer">
                <WifiOff className="mr-2 h-4 w-4" /> Disconnect Session
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction(device.mac_address, 'block')} className="text-red-400 focus:text-red-400 focus:bg-red-950/30 cursor-pointer">
                <ShieldAlert className="mr-2 h-4 w-4" /> Block Device
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction(device.mac_address, 'whitelist')} className="text-emerald-500 focus:text-emerald-500 focus:bg-emerald-950/30 cursor-pointer">
                <Shield className="mr-2 h-4 w-4" /> Add to Whitelist
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export const getBlockedColumns = (handleAction: (mac: string, action: 'revoke' | 'block' | 'unblock') => void): ColumnDef<Device>[] => [
  {
    accessorKey: "mac_address",
    header: "Threat MAC",
    cell: ({ row }) => <div className="font-mono text-xs font-bold text-red-500">{row.getValue("mac_address")}</div>,
  },
  {
    accessorKey: "email",
    header: "Identified User",
    cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("email") || "Unknown"}</div>,
  },
  {
    accessorKey: "risk_level",
    header: "Identified Risk",
    cell: ({ row }) => <div className="text-red-400 font-medium">{row.getValue("risk_level") || "High"}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: () => <Badge variant="outline" className="border-red-500/50 text-red-500 bg-red-500/10"><ShieldX className="w-3 h-3 mr-1" />Blocked</Badge>,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const device = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center justify-center rounded-md h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors mx-auto">
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border-border text-popover-foreground">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Network Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => handleAction(device.mac_address, 'unblock')}
                className="text-green-500 focus:text-green-500 focus:bg-green-950/30 cursor-pointer"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" /> Restore Access
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];

export const getThreatColumns = (handleAction: (mac: string, action: 'revoke' | 'block') => void): ColumnDef<ThreatAlert>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || table.getIsSomePageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="border-input data-[state=checked]:bg-primary data-[state=checked]:border-primary"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="border-input data-[state=checked]:bg-primary data-[state=checked]:border-primary"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "timestamp",
    header: ({ column }) => <SortableHeader column={column} title="Timestamp" />,
    cell: ({ row }) => (
      <div className="font-mono text-xs text-muted-foreground whitespace-nowrap">
        {new Date(row.getValue("timestamp")).toLocaleString('en-US', {
          month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'
        })}
      </div>
    ),
  },
  {
    accessorKey: "signature",
    header: ({ column }) => <SortableHeader column={column} title="Threat Signature" />,
    cell: ({ row }) => (
      <div className="font-medium text-destructive flex items-center gap-2">
        <ShieldAlert className="h-4 w-4" />
        {row.getValue("signature")}
      </div>
    ),
  },
  {
    accessorKey: "severity",
    header: ({ column }) => <SortableHeader column={column} title="Severity" />,
    cell: ({ row }) => {
      const severity = row.getValue("severity") as number;
      const isCritical = severity <= 2;

      return (
        <Badge variant={isCritical ? "destructive" : "secondary"} className={isCritical ? "bg-red-500/10 text-red-500 border-red-500/50" : ""}>
          {isCritical ? "CRITICAL" : `WARN (Lvl ${severity})`}
        </Badge>
      );
    },
  },
  {
    accessorFn: (row) => row.device.mac_address,
    id: "mac_address",
    header: "Target MAC",
    cell: ({ row }) => <MacCell mac={row.getValue("mac_address")} />,
  },
  {
    accessorFn: (row) => row.device.email,
    id: "email",
    header: "Target Identity",
    cell: ({ row }) => <div className="text-foreground">{row.getValue("email") || "Unknown User"}</div>,
  },
  {
    accessorKey: "action_taken",
    header: "System Action",
    cell: ({ row }) => (
      <Badge variant="outline" className="uppercase text-xs border-primary/30 text-primary bg-primary/5">
        {row.getValue("action_taken")}
      </Badge>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const mac = row.original.device.mac_address;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center justify-center rounded-md h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors mx-auto">
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border-border text-popover-foreground">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Incident Response</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => handleAction(mac, 'revoke')}
                className="text-amber-400 focus:text-amber-400 focus:bg-amber-950/30 cursor-pointer"
              >
                <WifiOff className="mr-2 h-4 w-4" /> Disconnect Session
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleAction(mac, 'block')}
                className="text-red-400 focus:text-red-400 focus:bg-red-950/30 cursor-pointer"
              >
                <ShieldAlert className="mr-2 h-4 w-4" /> Quarantine Device
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  }
];