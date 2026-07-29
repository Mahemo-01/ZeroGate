import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ShieldAlert, ShieldX, WifiOff, CheckCircle2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu";

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

const formatExpiration = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const getColumns = (handleAction: (mac: string, action: 'revoke' | 'block') => void): ColumnDef<Device>[] => [
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
    cell: ({ row }) => <div className="font-mono text-xs text-muted-foreground">{row.getValue("mac_address")}</div>,
  },
  {
    accessorKey: "ip_address",
    header: "IP Address",
    cell: ({ row }) => <div className="font-mono text-xs text-primary font-semibold">{row.getValue("ip_address")}</div>,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div className="text-foreground">{row.getValue("email") || "N/A"}</div>,
  },
  {
    accessorKey: "risk_level",
    header: "Risk Level",
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
    header: "Expires at",
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