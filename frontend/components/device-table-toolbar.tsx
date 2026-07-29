import { Table } from "@tanstack/react-table";
import { Settings2, ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DevicesTableToolbarProps<TData> {
  table: Table<TData>;
  totalDevices: number;
}

export function DevicesTableToolbar<TData>({ table, totalDevices }: DevicesTableToolbarProps<TData>) {
  return (
    <div className="flex items-center justify-between">
      <Tabs defaultValue="all" className="w-[400px]">
        <TabsList className="bg-muted border border-border">
          <TabsTrigger value="all" className="data-[state=active]:!bg-primary data-[state=active]:text-primary-foreground">
            All Devices <Badge variant="secondary" className="ml-2 bg-secondary text-secondary-foreground">{totalDevices}</Badge>
          </TabsTrigger>
          <TabsTrigger value="active" className="data-[state=active]:bg-muted data-[state=active]:text-green-500">
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
          <Plus className="mr-2 h-4 w-4" /> Whitelist Device
        </Button>
      </div>
    </div>
  );
}