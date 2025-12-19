// SidebarContext.jsx
import { createContext, useContext, useState } from "react";

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const [refreshSignal, setRefreshSignal] = useState(false);

  // Calling this will "ping" the sidebar to update
  const triggerSidebarRefresh = () => setRefreshSignal((prev) => !prev);

  return (
    <SidebarContext.Provider value={{ refreshSignal, triggerSidebarRefresh }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => useContext(SidebarContext);