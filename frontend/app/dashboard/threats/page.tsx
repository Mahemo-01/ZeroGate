"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  SortingState
} from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { getThreatColumns } from "@/components/table-columns";
import { useDeviceNetwork } from "@/hooks/use-device-network";
import { useThreatAlerts } from "@/hooks/use-threat-alerts";

export default function Dashboard() {
  const [sorting, setSorting] = useState<SortingState>([{ id: "timestamp", desc: true }]);
  const { alerts, loading } = useThreatAlerts();
  const { handleAction } = useDeviceNetwork();

  const columns = useMemo(() => getThreatColumns(handleAction), [handleAction]);
  const table = useReactTable({
    data: alerts,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <main className="min-h-screen bg-background p-8 text-foreground">
      <div className="max-w-[1400px] mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-black text-destructive tracking-tight">Threat Activity Log</h1>
        </div>

        {/* TABLE SECTION */}
        <div className="space-y-4">

          {loading ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground border rounded-md bg-card/50">
              Cargando datos del NOC...
            </div>
          ) : (
            <DataTable
              table={table}
              columnsLength={columns.length}
              showPagination={true}
              containerClass="border-border bg-card/50"
            />
          )}
        </div>

      </div>
    </main>
  );
}