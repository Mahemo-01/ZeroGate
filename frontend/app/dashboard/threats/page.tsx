"use client";

import { useEffect, useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  SortingState
} from "@tanstack/react-table";
import { ShieldAlert } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { getThreatColumns, ThreatAlert } from "@/components/table-columns";
import { useDeviceNetwork } from "@/hooks/use-device-network";

export default function Dashboard() {
  const [alerts, setAlerts] = useState<ThreatAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([{ id: "timestamp", desc: true }]);

  const { handleAction } = useDeviceNetwork();
  const columns = useMemo(() => getThreatColumns(handleAction), [handleAction]);

  useEffect(() => {
    fetch("/api/alerts")
      .then((res) => {
        if (!res.ok) throw new Error("Error en el servidor");
        return res.json();
      })
      .then((data) => {
        setAlerts(data);
        setLoading(false);
      })
      .catch((err) => console.error("Failed to fetch API:", err));
  }, []);

  const table = useReactTable({
    data: alerts,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
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