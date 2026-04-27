import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import storage from "redux-persist/lib/storage";
import productsReducer from "./slices/productsSlice";
import categoriesReducer from "./slices/categoriesSlice";
import uiReducer from "./slices/uiSlice";
import companyReducer from "./slices/companySlice";

const rootReducer = combineReducers({
  products: productsReducer,
  categories: categoriesReducer,
  ui: uiReducer,
  company: companyReducer,
});

// Only persist UI preferences (sidebar state, search query)
// Don't persist fetched data — always re-fetch from API
const persistConfig = {
  key: "machinery-store",
  storage,
  whitelist: ["ui"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
