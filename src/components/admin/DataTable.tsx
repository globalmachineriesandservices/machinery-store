"use client";

import * as React from "react";
import {
  ColumnDef, ColumnFiltersState, SortingState, VisibilityState,
  flexRender, getCoreRowModel, getFilteredRowModel,
  getPaginationRowModel, getSortedRowModel, useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { DropdownMenuCheckboxItem } from "@radix-ui/react-dropdown-menu";

// ─── Re-export column helpers ─────────────────────────────────────────────────
export type { ColumnDef };
export { flexRender };

/** Sortable header button — use inside a column's `header` function */
export function SortableHeader({
  column, children,
}: {
  column: { toggleSorting: (asc?: boolean) => void; getIsSorted: () => false | "asc" | "desc" };
  children: React.ReactNode;
}) {
  return (
    <button
      className="flex items-center gap-1.5 text-left font-medium hover:text-foreground transition-colors group"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {children}
      <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
    </button>
  );
}

/** Checkbox column — add as the first column in any table that needs row selection */
export function selectionColumn<T>(): ColumnDef<T> {
  return {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
        aria-label="Select row"
        onClick={(e) => e.stopPropagation()}
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  };
}

// ─── Main DataTable ───────────────────────────────────────────────────────────
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /** Column id to run a text filter against (client-side) */
  searchColumn?: string;
  searchPlaceholder?: string;
  /** Extra toolbar content rendered alongside the search box */
  toolbar?: React.ReactNode;
  /** Shown when no rows match */
  emptyState?: React.ReactNode;
  /** Called when selection changes — receives selected row originals */
  onSelectionChange?: (rows: TData[]) => void;
  /** Page sizes to offer (default: [10, 20, 50]) */
  pageSizes?: number[];
  className?: string;
}

export function DataTable<TData, TValue>({
  columns, data, searchColumn, searchPlaceholder = "Search...",
  toolbar, emptyState, onSelectionChange, pageSizes = [10, 20, 50], className,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: (updater) => {
      setRowSelection(updater);
      if (onSelectionChange) {
        const next = (typeof updater === "function" ? updater(rowSelection) : updater) as Record<string, boolean>;
        const selected = Object.keys(next)
          .filter((k) => next[k])
          .map((k) => data[parseInt(k)]);
        onSelectionChange(selected);
      }
    },
    state: { sorting, columnFilters, columnVisibility, rowSelection },
    initialState: { pagination: { pageSize: pageSizes[0] } },
  });

  const selectedCount = Object.keys(rowSelection).filter((k) => rowSelection[k as keyof typeof rowSelection]).length;

  return (
    <div className={cn("space-y-3", className)}>
      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 flex-wrap">
          {searchColumn && (
            <Input
              placeholder={searchPlaceholder}
              value={(table.getColumn(searchColumn)?.getFilterValue() as string) ?? ""}
              onChange={(e) => table.getColumn(searchColumn)?.setFilterValue(e.target.value)}
              className="max-w-xs h-9 text-sm"
            />
          )}
          {toolbar}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {selectedCount > 0 && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
              {selectedCount} selected
            </span>
          )}
          {/* Column visibility toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5">
                Columns <ChevronDown className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {table.getAllColumns()
                .filter((col) => col.getCanHide())
                .map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    className="capitalize text-sm py-1.5"
                    checked={col.getIsVisible()}
                    onCheckedChange={(v) => col.toggleVisibility(!!v)}
                    
                  >
                    {col.id.replace(/_/g, " ")}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="bg-muted/40 hover:bg-muted/40">
                {hg.headers.map((h) => (
                  <TableHead
                    key={h.id}
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground py-3"
                    style={{ width: h.column.getSize() !== 150 ? h.column.getSize() : undefined }}
                  >
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/30 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3 text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center">
                  {emptyState ?? (
                    <p className="text-sm text-muted-foreground">No results found.</p>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Pagination ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-3">
          <p className="text-sm">
            {selectedCount > 0
              ? `${selectedCount} of ${table.getFilteredRowModel().rows.length} row(s) selected`
              : `${table.getFilteredRowModel().rows.length} row(s) total`}
          </p>
          <div className="flex items-center gap-1.5">
            <span className="text-xs">Rows per page</span>
            <Select
              value={String(table.getState().pagination.pageSize)}
              onValueChange={(v) => table.setPageSize(Number(v))}
            >
              <SelectTrigger className="h-8 w-16 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizes.map((s) => (
                  <SelectItem key={s} value={String(s)} className="text-xs">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8"
            onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
            <ChevronsLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8"
            onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm px-2 min-w-[5rem] text-center">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
          </span>
          <Button variant="outline" size="icon" className="h-8 w-8"
            onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
            <ChevronsRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
