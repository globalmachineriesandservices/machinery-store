"use client";

import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, X, SlidersHorizontal, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { FilterState } from "./ProductsClient";

interface Category {
  id: string; name: string; slug: string; _count: { products: number };
}

interface Props {
  categories: Category[];
  brands: string[];
  filters: FilterState;
  onChange: (f: FilterState) => void;
}

// ── Multi-select popover ───────────────────────────────────────────────────────
// Uses <div> rows (NOT <button>) to avoid button-in-button hydration error
// because the Checkbox itself renders a <button>.
function MultiSelect({
  options,
  value,
  onChange,
  placeholder,
  className,
}: {
  options: { label: string; value: string; count?: number }[];
  value: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  const toggle = (v: string) => {
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  };

  const label =
    value.length === 0
      ? placeholder
      : value.length === 1
      ? options.find((o) => o.value === value[0])?.label ?? value[0]
      : `${value.length} selected`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between font-normal text-sm h-9", className)}
        >
          <span className="truncate">{label}</span>
          <ChevronDown className="ml-2 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-56" align="start">
        <div className="p-1 max-h-64 overflow-y-auto">
          {options.map((opt) => {
            const selected = value.includes(opt.value);
            return (
              // ── Use <div role="option"> NOT <button> — Checkbox is already a button ──
              <div
                key={opt.value}
                role="option"
                aria-selected={selected}
                onClick={() => toggle(opt.value)}
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors select-none"
              >
                <Checkbox
                  checked={selected}
                  // Stop click bubbling — the parent div handles the toggle
                  onClick={(e) => e.stopPropagation()}
                  onCheckedChange={() => toggle(opt.value)}
                  className="pointer-events-none"
                />
                <span className="flex-1 truncate">{opt.label}</span>
                {opt.count !== undefined && (
                  <span className="text-xs text-muted-foreground tabular-nums">{opt.count}</span>
                )}
              </div>
            );
          })}
        </div>
        {value.length > 0 && (
          <>
            <Separator />
            <div className="p-1">
              {/* Also a div, not a button */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => onChange([])}
                onKeyDown={(e) => e.key === "Enter" && onChange([])}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" /> Clear selection
              </div>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

// ── Main filter panel ──────────────────────────────────────────────────────────
export default function ProductsFilter({ categories, brands, filters, onChange }: Props) {
  const update = (patch: Partial<FilterState>) => onChange({ ...filters, ...patch });

  const totalActive =
    (filters.search ? 1 : 0) +
    filters.categoryIds.length +
    filters.brandNames.length +
    (filters.inStock ? 1 : 0);

  return (
    <div className="bg-white rounded-2xl border p-5 sticky top-24 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-sm">
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {totalActive > 0 && (
            <Badge className="text-xs h-5 px-1.5 bg-primary text-primary-foreground">{totalActive}</Badge>
          )}
        </div>
        {totalActive > 0 && (
          <Button
            variant="ghost" size="sm"
            className="h-7 text-xs text-muted-foreground"
            onClick={() => onChange({ search: "", categoryIds: [], brandNames: [], inStock: false })}
          >
            <X className="w-3 h-3 mr-1" />Clear all
          </Button>
        )}
      </div>

      {/* Search */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
          Search
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            className="pl-9 text-sm h-9"
          />
          {filters.search && (
            <button
              onClick={() => update({ search: "" })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <Separator />

      {/* Category multi-select */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
          Category
          {filters.categoryIds.length > 0 && (
            <span className="ml-1 text-primary">({filters.categoryIds.length})</span>
          )}
        </Label>
        <MultiSelect
          options={categories.map((c) => ({ label: c.name, value: c.id, count: c._count.products }))}
          value={filters.categoryIds}
          onChange={(ids) => update({ categoryIds: ids })}
          placeholder="All Categories"
          className="w-full"
        />
        {/* Selected pills */}
        {filters.categoryIds.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {filters.categoryIds.map((id) => {
              const cat = categories.find((c) => c.id === id);
              return cat ? (
                <Badge key={id} variant="secondary" className="text-xs gap-1 pr-1">
                  {cat.name}
                  <button
                    onClick={() => update({ categoryIds: filters.categoryIds.filter((x) => x !== id) })}
                    className="hover:text-destructive ml-0.5"
                    aria-label={`Remove ${cat.name}`}
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </Badge>
              ) : null;
            })}
          </div>
        )}
      </div>

      {/* Brand multi-select */}
      {brands.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
              Brand
              {filters.brandNames.length > 0 && (
                <span className="ml-1 text-primary">({filters.brandNames.length})</span>
              )}
            </Label>
            <MultiSelect
              options={brands.map((b) => ({ label: b, value: b }))}
              value={filters.brandNames}
              onChange={(bs) => update({ brandNames: bs })}
              placeholder="All Brands"
              className="w-full"
            />
            {filters.brandNames.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {filters.brandNames.map((b) => (
                  <Badge key={b} variant="secondary" className="text-xs gap-1 pr-1">
                    {b}
                    <button
                      onClick={() => update({ brandNames: filters.brandNames.filter((x) => x !== b) })}
                      className="hover:text-destructive ml-0.5"
                      aria-label={`Remove ${b}`}
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <Separator />

      {/* In Stock */}
      <div className="flex items-center justify-between">
        <Label htmlFor="instock-toggle" className="text-sm cursor-pointer">In Stock Only</Label>
        <Switch
          id="instock-toggle"
          checked={filters.inStock}
          onCheckedChange={(v) => update({ inStock: v })}
        />
      </div>
    </div>
  );
}
