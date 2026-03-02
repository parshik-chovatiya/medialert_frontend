"use client";

import { Provider } from "react-redux";
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from "./store";

// Shown for the brief moment redux-persist rehydrates from localStorage.
// Using a translucent overlay instead of null prevents the blank-page flash.
function HydrationLoader() {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'transparent', zIndex: 9999 }} />
  );
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={<HydrationLoader />} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
