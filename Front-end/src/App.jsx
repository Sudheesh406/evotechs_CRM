import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Menu } from "lucide-react";
import { useState } from "react";


import AdminDashboard from "./pages/dashboard/AdminDashboard";
import StaffPendingTask from "./pages/sales-pages/admin_sales_side/StaffPendingTask";
import CreateTeam from "./pages/Team-work/admin_team_work_side/CreateTeam";
import AdminCalendar from "./pages/workspace-pages/admin_workspace_side/AdminCalender";
import AdminAttendanceView from "./pages/workspace-pages/admin_workspace_side/AdminAttendanceView";
import AdminMessagePortal from "./pages/workspace-pages/admin_workspace_side/AdminMessagePortal";
import AdminTodo from './pages/workspace-pages/admin_workspace_side/AdminTodo';

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
import Attendance from "./pages/workspace-pages/Attendance";
import Auth from "./pages/Auth-pages/Auth";
import Trash from "./pages/Trash-page/Trash";
import TaskDetail from "./pages/staff-detail-page/TaskDetail";
import Pending from "./pages/sales-pages/Pendings";
import Rework from "./pages/sales-pages/Rework";
import TeamProfile from "./pages/Team-work/TeamView";
import TeamWork from "./pages/Team-work/TeamWorkView";
import TeamWorkDetails from "./pages/Team-work/TeamWorkDetails";
import TeamTaskDetails from "./pages/Team-work/TeamTaskDetail";
import StaffTaskDetails from "./pages/sales-pages/admin_sales_side/StaffTaskDetails";
import StaffTaskVerification from "./pages/sales-pages/admin_sales_side/StaffTaskVerification";
import CompletedTask from "./pages/sales-pages/admin_sales_side/CompletedTask";
import ReworkTask from "./pages/sales-pages/admin_sales_side/ReworkTask";
import ProjectTeam from "./pages/Team-work/admin_team_work_side/ProjectTeam";
import Worklog from "./pages/workspace-pages/Worklog";

import Sidebar from "./components/SideBar";

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Hide sidebar for auth routes
  const hideSidebar = location.pathname.startsWith("/login");

  return (
    <div className="flex bg-gray-100 h-screen">
      {!hideSidebar && (
        <>
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
        </>
      )}

      {/* Main content */}
      <div className="flex-1 p-6 overflow-auto">
        {!hideSidebar && (
          <div className="md:hidden flex items-center mb-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md bg-white shadow-md"
            >
              <Menu size={24} />
            </button>
          </div>
        )}

        <Routes>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/sales/pending/task" element={<StaffPendingTask />} />
          <Route path="/team/customise" element={<CreateTeam />} />
          <Route path="/workspace/calendar/customise" element={<AdminCalendar />} />
          <Route path="/workspace/attendance/view" element={<AdminAttendanceView />} />
          <Route path="/workspace/message/port" element={<AdminMessagePortal />} />
          <Route path="/activities/task/port/:data" element={<StaffTaskDetails />} />
          <Route path="/sales/resolved" element={<StaffTaskVerification />} />
          <Route path="/sales/completed" element={<CompletedTask />} />
          <Route path="/sales/rework/port" element={<ReworkTask />} />
          <Route path="/team/work/port/:id" element={<ProjectTeam />} />
          <Route path="/workspace/todo/" element={<AdminTodo />} />



          <Route path="/" element={<StaffDashboard />} />
          <Route path="/sales/leads" element={<Leads />} />
          <Route path="/sales/contacts" element={<Contacts />} />
          <Route path="/sales/accounts" element={<Accounts />} />
          <Route path="/sales/deals" element={<Deals />} />
          <Route path="/sales/pendings" element={<Pending />} />
          <Route path="/sales/personalize" element={<Personalize />} />
          <Route path="/sales/documents" element={<Documents />} />
          <Route path="/sales/reworks" element={<Rework />} />
          <Route path="/activities/tasks" element={<Task />} />
          <Route path="/activities/tasks/person/:data"element={<TaskDetail />}/>
          <Route path="/activities/tasks/team/:data"element={<TeamTaskDetails />}/>
          <Route path="/activities/meetings" element={<Meetings />} />
          <Route path="/activities/calls" element={<Calls />} />
          <Route path="/workspace/calendar" element={<Calendar />} />
          <Route path="/workspace/messages" element={<Messages />} />
          <Route path="/workspace/attendance" element={<Attendance />} />
          <Route path="/team/profile" element={<TeamProfile />} />
          <Route path="/team/work/:id" element={<TeamWork />} />
          <Route path="/team/work/manage/:data" element={<TeamWorkDetails />} />
          <Route path="/workspace/work/assign" element={<Worklog />} />

          <Route path="/trash" element={<Trash />} />
          <Route path="/login" element={<Auth />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
