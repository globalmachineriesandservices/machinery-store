import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { Product, ProductFilters, PaginatedResponse } from "@/types";

interface ProductsState {
  items: Product[];
  currentProduct: Product | null;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filters: ProductFilters;
  loading: boolean;
  error: string | null;
}

const initialState: ProductsState = {
  items: [],
  currentProduct: null,
  total: 0,
  page: 1,
  limit: 12,
  totalPages: 0,
  filters: {},
  loading: false,
  error: null,
};

export const fetchProducts = createAsyncThunk(
  "products/fetchAll",
  async (filters: ProductFilters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.page) params.set("page", String(filters.page));
      if (filters.limit) params.set("limit", String(filters.limit));
      if (filters.categoryId) params.set("categoryId", filters.categoryId);
      if (filters.search) params.set("search", filters.search);
      if (filters.featured) params.set("featured", "true");
      if (filters.inStock) params.set("inStock", "true");

      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      return data as PaginatedResponse<Product> & { success: boolean };
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to fetch products");
    }
  }
);

export const fetchProductBySlug = createAsyncThunk(
  "products/fetchOne",
  async (slug: string, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/products/${slug}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      return data.data as Product;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to fetch product");
    }
  }
);

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<ProductFilters>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters(state) {
      state.filters = {};
    },
    clearCurrentProduct(state) {
      state.currentProduct = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchProductBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilters, clearFilters, clearCurrentProduct } = productsSlice.actions;
export default productsSlice.reducer;
