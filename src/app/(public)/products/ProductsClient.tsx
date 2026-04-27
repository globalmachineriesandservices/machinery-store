"use client";

import { useState, useMemo } from "react";
import ProductCard from "@/components/shared/ProductCard";
import ProductsFilter from "./ProductsFilter";
import { Package, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 12;

interface Product {
  id: string; name: string; slug: string; description: string;
  images: string[]; featured: boolean; inStock: boolean;
  brand: string | null;
  category: { id: string; name: string; slug: string };
  _count: { reviews: number; inquiries: number };
}

interface Category {
  id: string; name: string; slug: string; _count: { products: number };
}

interface Props {
  allProducts: Product[];
  categories: Category[];
  brands: string[];
}

export interface FilterState {
  search: string;
  categoryIds: string[];
  brandNames: string[];
  inStock: boolean;
}

export default function ProductsClient({ allProducts, categories, brands }: Props) {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    categoryIds: [],
    brandNames: [],
    inStock: false,
  });
  const [page, setPage] = useState(1);

  // Client-side filter + search
  const filtered = useMemo(() => {
    const q = filters.search.toLowerCase().trim();
    return allProducts.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q) &&
          !p.description.toLowerCase().includes(q) &&
          !(p.brand?.toLowerCase().includes(q))) return false;
      if (filters.categoryIds.length && !filters.categoryIds.includes(p.category.id)) return false;
      if (filters.brandNames.length && !filters.brandNames.includes(p.brand ?? "")) return false;
      if (filters.inStock && !p.inStock) return false;
      return true;
    });
  }, [allProducts, filters]);

  // Reset to page 1 whenever filters change
  const setFiltersAndReset = (f: FilterState) => {
    setFilters(f);
    setPage(1);
  };

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Resolve selected category names for the header label
  const selectedCategoryNames = filters.categoryIds
    .map((id) => categories.find((c) => c.id === id)?.name)
    .filter(Boolean) as string[];

  return (
    <div className='min-h-screen bg-muted/20'>
      {/* Hero */}
      <div style={{ background: 'hsl(var(--primary))' }} className='py-12'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <h1
            className='text-4xl sm:text-5xl font-extrabold text-white'
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            ALL PRODUCTS
          </h1>
          <p className='text-white/60 mt-2 text-sm'>
            {filtered.length} of {allProducts.length} products
            {filters.search && (
              <span className='text-white/80 font-medium'>
                {' '}
                · &quot;{filters.search}&quot;
              </span>
            )}
            {selectedCategoryNames.length > 0 && (
              <span className='text-white/80 font-medium'>
                {' '}
                · {selectedCategoryNames.join(', ')}
              </span>
            )}
            {filters.brandNames.length > 0 && (
              <span className='text-white/80 font-medium'>
                {' '}
                · {filters.brandNames.join(', ')}
              </span>
            )}
            {filters.inStock && (
              <span className='text-white/80 font-medium'>
                {' '}
                · In Stock Only
              </span>
            )}
          </p>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10'>
        <div className='flex flex-col lg:flex-row gap-8'>
          {/* Filter sidebar */}
          <aside className='w-full lg:w-64 flex-shrink-0'>
            <ProductsFilter
              categories={categories}
              brands={brands}
              filters={filters}
              onChange={setFiltersAndReset}
            />
          </aside>

          {/* Product grid */}
          <div className='flex-1'>
            {paginated.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-24 text-muted-foreground'>
                <Package className='w-16 h-16 mb-4 opacity-20' />
                <p className='text-lg font-medium'>No products found</p>
                <p className='text-sm mt-1'>
                  Try adjusting your filters or search term.
                </p>
              </div>
            ) : (
              <>
                <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'>
                  {paginated.map((product, i) => (
                    <ProductCard key={product.id} product={product} index={i} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className='flex items-center justify-between mt-10'>
                    <p className='text-sm text-muted-foreground'>
                      Page {page} of {totalPages} · {filtered.length} products
                    </p>
                    <div className='flex items-center gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        disabled={page <= 1}
                        onClick={() => {
                          setPage(page - 1)
                          window.scrollTo(0, 0)
                        }}
                      >
                        <ChevronLeft className='w-4 h-4' />
                      </Button>
                      <div className='flex items-center gap-1'>
                        {Array.from(
                          { length: Math.min(totalPages, 7) },
                          (_, i) => {
                            // Show pages around current
                            let p = i + 1
                            if (totalPages > 7) {
                              if (page <= 4) p = i + 1
                              else if (page >= totalPages - 3)
                                p = totalPages - 6 + i
                              else p = page - 3 + i
                            }
                            return (
                              <button
                                key={p}
                                onClick={() => {
                                  setPage(p)
                                  window.scrollTo(0, 0)
                                }}
                                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                                  p === page
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-white border hover:bg-muted'
                                }`}
                              >
                                {p}
                              </button>
                            )
                          },
                        )}
                      </div>
                      <Button
                        variant='outline'
                        size='sm'
                        disabled={page >= totalPages}
                        onClick={() => {
                          setPage(page + 1)
                          window.scrollTo(0, 0)
                        }}
                      >
                        <ChevronRight className='w-4 h-4' />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
