// src/features/products/productSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async () => {
    const response = await fetch('http://localhost:3000'); // Adjust this to your API endpoint
    const data = await response.json();
    return data;
  }
);

const productSlice = createSlice({
    name: 'products',
    initialState: {
      items: [],
      status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
      error: null,
    },
    reducers: {},
    extraReducers(builder) {
      builder
        .addCase(fetchProducts.pending, (state, action) => {
          state.status = 'loading';
        })
        .addCase(fetchProducts.fulfilled, (state, action) => {
          state.status = 'succeeded';
          state.items = action.payload;
        })
        .addCase(fetchProducts.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.error.message;
        });
    },
  });
  
  export default productSlice.reducer;
  