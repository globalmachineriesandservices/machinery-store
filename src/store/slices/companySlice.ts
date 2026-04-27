import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { CompanyDetails } from "@/types";

interface CompanyState {
  details: CompanyDetails | null;
  loading: boolean;
  error: string | null;
}

const initialState: CompanyState = {
  details: null,
  loading: false,
  error: null,
};

export const fetchCompany = createAsyncThunk(
  "company/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/company");
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      return data.data as CompanyDetails | null;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to fetch company details");
    }
  }
);

const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.details = action.payload;
      })
      .addCase(fetchCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default companySlice.reducer;
