import { flexRender, Table as TanstackTable } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTablePagination } from "./data-table-pagination";
import { cn } from "@/lib/utils";

interface DataTableProps<TData> {
  table: TanstackTable<TData>;
  columnsLength: number;
  showPagination?: boolean;
  containerClass?: string;
  headerClass?: string;
  rowClass?: string;
  headerTextClass?: string;
}

export function DataTable<TData>({
  table,
  columnsLength,
  showPagination = false,
  containerClass = "border-border bg-card/50",
  headerClass = "bg-muted/50 hover:bg-muted/50",
  rowClass = "border-border hover:bg-muted/60 data-[state=selected]:bg-muted/50",
  headerTextClass = "text-muted-foreground"
}: DataTableProps<TData>) {
  return (
    <div>
      <div className={cn("border rounded-md overflow-hidden", containerClass)}>
        <Table>
          <TableHeader className={headerClass}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-transparent hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className={cn("h-10", headerTextClass)}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={rowClass}
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
                <TableCell colSpan={columnsLength} className="h-10 text-center text-muted-foreground">
                  No devices found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {showPagination && <DataTablePagination table={table} />}
    </div>
  );
}