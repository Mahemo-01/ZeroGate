"use client";

import { useState, useMemo } from "react";
import { useDeviceNetwork } from "@/hooks/use-device-network";
import { ColumnFiltersState, SortingState, VisibilityState, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, } from "@tanstack/react-table";
import { ShieldAlert, ShieldCheck, Users, Wifi, Clock } from "lucide-react";
import { InfoWidget } from "@/components/info-widget";
import { NetworkTrafficChart } from "@/components/network-traffic-chart";
import { DataTable } from "@/components/data-table";
import { DevicesTableToolbar } from "@/components/device-table-toolbar";
import { getColumns, getBlockedColumns } from "@/components/table-columns";

export default function DevicesView() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const { normalDevices, blockedDevices, stats, handleAction } = useDeviceNetwork()
  const columns = useMemo(() => getColumns(handleAction), [handleAction]);
  const blockedColumns = useMemo(() => getBlockedColumns(handleAction), [handleAction])

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

  return (
    <main className="min-h-screen bg-background p-8 text-foreground">
      <div className="max-w-[1400px] mx-auto space-y-8">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-black text-primary tracking-tight">Network Operations</h1>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-8 gap-4">
          <InfoWidget title="Total Visitors" value={stats.total} icon={Users} />

          <InfoWidget
            title="Active Sessions"
            value={stats.active}
            icon={Wifi}
            textColor={stats.active > 0 ? "text-green-500" : "text-foreground"}
            iconColor={stats.active > 0 ? "text-green-500/10" : "text-white/5"}
          />

          <InfoWidget title="Offline" value={stats.offline} icon={Clock} />

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
          <DevicesTableToolbar table={table} totalDevices={stats.total} />
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