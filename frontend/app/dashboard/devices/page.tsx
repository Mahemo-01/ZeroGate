"use client";

import { useEffect, useState } from "react";
import { ColumnDef, ColumnFiltersState, SortingState, VisibilityState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, } from "@tanstack/react-table";
import { MoreHorizontal, ShieldAlert, WifiOff, Settings2, Plus, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface Device {
  id: number;
  mac_address: string;
  ip_address: string;
  email: string;
  is_authenticated: boolean;
  first_seen: string;
  expiration_time: string;
}

// Table Columns
export const columns: ColumnDef<Device>[] = [
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
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const device = row.original;
      const isExpired = new Date(device.expiration_time) < new Date();

      if (isExpired) {
        return <Badge variant="outline" className="border-red-500/30 text-red-400 bg-red-950/20">Expired</Badge>;
      }
      if (device.is_authenticated) {
        return <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10">Active</Badge>;
      }
      return <Badge variant="outline" className="border-border text-muted-foreground">Pending</Badge>;
    },
  },
  {
    accessorKey: "expiration_time",
    header: () => <div className="text-right">Expires At</div>,
    cell: ({ row }) => {
      const time = new Date(row.getValue("expiration_time"));
      return (
        <div className="text-right text-xs text-muted-foreground font-medium">
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const device = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>

          <DropdownMenuGroup>
            <DropdownMenuContent align="end" className="bg-popover border-border text-popover-foreground">
              <DropdownMenuLabel>Network Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(device.mac_address)}>
                Copy MAC Address
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem className="text-amber-400 focus:text-amber-400 focus:bg-amber-950/30">
                <WifiOff className="mr-2 h-4 w-4" />
                Revoke Session
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-400 focus:text-red-400 focus:bg-red-950/30">
                <ShieldAlert className="mr-2 h-4 w-4" />
                Quarantine Device
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuGroup>

        </DropdownMenu>
      );
    },
  },
];

// Area view
export default function DevicesView() {
  const [data, setData] = useState<Device[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  useEffect(() => {
    const host = window.location.hostname;

    const fetchDevices = async () => {
      try {
        const response = await fetch(`http://${host}:8000/api/devices`);
        const json = await response.json();
        if (json.status === "success") { setData(json.data); }
      } catch (error) { console.error("Failed to fetch devices:", error); }
    };

    fetchDevices();

    const ws = new WebSocket(`ws://${host}:8000/ws/devices`);
    ws.onopen = () => { console.log("WebSocket Connected to ZeroGate Network"); };

    ws.onmessage = (event) => {
      try {
        const incomingData = JSON.parse(event.data);
        if (incomingData.status === "success") { setData(incomingData.data); }
      } catch (error) { console.error("Error parsing WebSocket message:", error); }
    };

    ws.onclose = () => { console.log("WebSocket Disconnected"); };

    return () => { ws.close(); };
  }, []);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: { pageSize: 20 },
    },
  });

  return (
    <main className="min-h-screen bg-background p-8 text-foreground">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-black text-primary tracking-tight">Connected Devices</h1>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between">
          <Tabs defaultValue="all" className="w-[400px]">
            <TabsList className="bg-muted border border-border">
              <TabsTrigger value="all" className="data-[state=active]:!bg-primary data-[state=active]:text-primary-foreground">
                All Devices <Badge variant="secondary" className="ml-2 bg-secondary text-secondary-foreground">{data.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="active" className="data-[state=active]:bg-muted data-[state=active]:text-primary">
                Active
              </TabsTrigger>
              <TabsTrigger value="expired" className="data-[state=active]:bg-muted data-[state=active]:text-red-400">
                Expired
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium border h-8 px-4 py-2 bg-muted border-border text-foreground hover:bg-accent transition-colors">
                <Settings2 className="mr-2 h-4 w-4" />
                Customize Columns
                <ChevronDown className="ml-2 h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover border-border text-popover-foreground">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {column.id.replace("_", " ")}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground h-8 text-sm">
              <Plus className="mr-2 h-4 w-4" /> Add Exception
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="border border-border rounded-md overflow-hidden bg-card/50">
          <Table>
            <TableHeader className="bg-muted/50 hover:bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-border">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="text-muted-foreground h-10">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="border-border hover:bg-muted/60 data-[state=selected]:bg-muted/50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-10 text-center text-muted-foreground">
                    No connected devices found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex-1">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <p className="font-medium text-foreground">{table.getState().pagination.pageSize}</p>
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="h-8 w-8 p-0 bg-transparent border-border hover:bg-accent text-foreground"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                {"<"}
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0 bg-transparent border-border hover:bg-accent text-foreground"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                {">"}
              </Button>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}