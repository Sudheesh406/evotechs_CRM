// src/layouts/AppLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/SideBar";

const AppLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar stays here, never unmounts */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 p-6 ml-64"> 
        {/* ml-64 to offset sidebar width */}
        <Outlet />
      </div>
    </div>
  );
};

export default AppLayout;
