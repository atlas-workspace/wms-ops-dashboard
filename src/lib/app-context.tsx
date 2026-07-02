"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { getStoredFacility, storeFacility } from "./auth";

export type BusinessModule = "ops-dashboard" | "equipment-hub";

interface AppContextType {
  facility: string;
  setFacility: (f: string) => void;
  refreshKey: number;
  triggerRefresh: () => void;
  activeModule: BusinessModule;
  setActiveModule: (m: BusinessModule) => void;
}

const AppContext = createContext<AppContextType>({
  facility: "LT_F1",
  setFacility: () => {},
  refreshKey: 0,
  triggerRefresh: () => {},
  activeModule: "ops-dashboard",
  setActiveModule: () => {},
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [facility, setFacilityState] = useState(() => getStoredFacility() || "LT_F1");
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeModule, setActiveModule] = useState<BusinessModule>("ops-dashboard");

  const setFacility = useCallback((f: string) => {
    storeFacility(f);
    setFacilityState(f);
    setRefreshKey((k) => k + 1);
  }, []);

  const triggerRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <AppContext.Provider value={{ facility, setFacility, refreshKey, triggerRefresh, activeModule, setActiveModule }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
