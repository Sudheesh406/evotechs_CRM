import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Menu } from "lucide-react";
import { useState } from "react";

import StaffDashboard from "./pages/dashboard/StaffDashboard";
import Leads from "./pages/sales-pages/Leads";
import Accounts from "./pages/sales-pages/Accounts";
import Contacts from "./pages/sales-pages/Contacts";
import Deals from "./pages/sales-pages/Deals";
import Documents from "./pages/sales-pages/Documents";
import Personalize from "./pages/sales-pages/Personalize";
import Calls from "./pages/activity-pages/Calls";
import Task from "./pages/activity-pages/Task";
import Meetings from "./pages/activity-pages/Meetings";
import Calendar from "./pages/workspace-pages/Calendar";
import Messages from "./pages/workspace-pages/Messages";

import Sidebar from "./components/Sidebar";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="flex bg-gray-100 h-screen">
        {/* Mobile overlay */}
        <div
          className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 md:hidden ${
            sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setSidebarOpen(false)}
        ></div>

        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 h-screen bg-white shadow-md transform transition-transform duration-300
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
            md:translate-x-0 md:static`}
        >
          <Sidebar closeSidebar={() => setSidebarOpen(false)} />
        </div>

        {/* Main content */}
        <div className="flex-1 p-6 overflow-auto">
          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center mb-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md bg-white shadow-md"
            >
              <Menu size={24} />
            </button>
          </div>

          <Routes>
            <Route path="/" element={<StaffDashboard />} />
            <Route path="/sales/leads" element={<Leads />} />
            <Route path="/sales/contacts" element={<Contacts />} />
            <Route path="/sales/accounts" element={<Accounts />} />
            <Route path="/sales/deals" element={<Deals />} />
            <Route path="/sales/personalize" element={<Personalize />} />
            <Route path="/sales/documents" element={<Documents />} />
            <Route path="/activities/tasks" element={<Task />} />
            <Route path="/activities/meetings" element={<Meetings />} />
            <Route path="/activities/calls" element={<Calls />} />
            <Route path="/workspace/calendar" element={<Calendar />} />
            <Route path="/workspace/messages" element={<Messages />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
