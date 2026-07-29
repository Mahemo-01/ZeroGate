"use client";

import { useEffect, useState, useMemo } from "react";
import { ColumnFiltersState, SortingState, VisibilityState, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, } from "@tanstack/react-table";
import { ShieldAlert, ShieldCheck, Users, Wifi, Clock } from "lucide-react";
import { InfoWidget } from "@/components/info-widget";
import { NetworkTrafficChart } from "@/components/network-traffic-chart";
import { DataTable } from "@/components/data-table";
import { DevicesTableToolbar } from "@/components/device-table-toolbar";
import { getColumns, blockedColumns, type Device } from "@/components/table-columns";

export default function DevicesView() {
  const [data, setData] = useState<Device[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const normalDevices = useMemo(() => data.filter(d => !d.is_blocked), [data]);
  const blockedDevices = useMemo(() => data.filter(d => d.is_blocked), [data]);

  const handleAction = async (mac: string, action: 'revoke' | 'block') => {
    try {
      const host = window.location.hostname;
      const response = await fetch(`http://${host}:8000/api/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mac_address: mac }),
      });

      if (!response.ok) { console.error(`Fallo al ejecutar ${action}`); }
    } catch (error) { console.error("Error de red al ejecutar acción:", error); }
  };

  const columns = useMemo(() => getColumns(handleAction), []);

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
    data: normalDevices,
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
    initialState: { pagination: { pageSize: 10 }, },
  });

  const blockedTable = useReactTable({
    data: blockedDevices,
    columns: blockedColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const totalDevices = data.length;
  const activeDevices = data.filter(d => d.is_authenticated).length;
  const expiredDevices = data.filter(d => !d.is_authenticated).length;

  return (
    <main className="min-h-screen bg-background p-8 text-foreground">
      <div className="max-w-[1400px] mx-auto space-y-8">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-black text-primary tracking-tight">Network Operations</h1>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-8 gap-4">
          <InfoWidget title="Total Visitors" value={totalDevices} icon={Users} />

          <InfoWidget
            title="Active Sessions"
            value={activeDevices}
            icon={Wifi}
            textColor={activeDevices > 0 ? "text-green-500" : "text-foreground"}
            iconColor={activeDevices > 0 ? "text-green-500/10" : "text-white/5"}
          />

          <InfoWidget title="Offline" value={expiredDevices} icon={Clock} />

          <InfoWidget
            title="Blocked"
            value={blockedDevices.length}
            icon={blockedDevices.length > 0 ? ShieldAlert : ShieldCheck}
            textColor={blockedDevices.length > 0 ? "text-red-500" : "text-foreground"}
            iconColor={blockedDevices.length > 0 ? "text-red-500/10" : "text-white/5"}
            bgClass={blockedDevices.length > 0 ? "bg-red-950/20" : ""}
          />

          <NetworkTrafficChart />
        </div>

        {/* MAIN TABLE */}
        <div className="space-y-4">
          <DevicesTableToolbar table={table} totalDevices={totalDevices} />
          <DataTable table={table} columnsLength={columns.length} showPagination={true} />
        </div>

        {/* BLOCKED TABLE */}
        {blockedDevices.length > 0 && (
          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-red-500" />
              <h2 className="text-2xl font-black text-red-500 tracking-tight">Blocked Devices</h2>
            </div>

            <DataTable
              table={blockedTable}
              columnsLength={blockedColumns.length}
              showPagination={false}
              containerClass="border-red-500/20 bg-red-950/5"
              headerClass="bg-red-950/10"
              headerTextClass="text-red-500/80 font-bold"
              rowClass="border-red-500/20 hover:bg-red-950/20"
            />
          </div>
        )}

      </div>
    </main>
  );
}