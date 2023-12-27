// src/store.js
import { configureStore } from '@reduxjs/toolkit';
import productReducer from './reducer';

export const store = configureStore({
  reducer: {
    products: productReducer,
  },
});
