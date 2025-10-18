import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Menu } from "lucide-react";
import { useState } from "react";

import AdminDashboard from "./pages/dashboard/AdminDashboard";
import StaffPendingTask from "./pages/operation-pages/admin_operation_side/StaffPendingTask";
import CreateTeam from "./pages/Team-work/admin_team_work_side/CreateTeam";
import AdminCalendar from "./pages/workspace-pages/admin_workspace_side/AdminCalender";
import AdminAttendanceView from "./pages/workspace-pages/admin_workspace_side/AdminAttendanceView";
import AdminTodo from "./pages/workspace-pages/admin_workspace_side/AdminTodo";
import AdminPinGenerator from "./pages/workspace-pages/admin_workspace_side/AdminPinGenerator";
import StaffDashboard from "./pages/dashboard/StaffDashboard";
import Leads from "./pages/sales-pages/Leads";
import Accounts from "./pages/operation-pages/Accounts";
import Contacts from "./pages/operation-pages/Contacts";
import Deals from "./pages/sales-pages/Deals";
import Documents from "./pages/operation-pages/Documents";
import Personalize from "./pages/operation-pages/Personalize";
import Calls from "./pages/activity-pages/Calls";
import Task from "./pages/activity-pages/Task";
import Meetings from "./pages/activity-pages/Meetings";
import Calendar from "./pages/workspace-pages/Calendar";
import Messages from "./pages/workspace-pages/Messages";
import Attendance from "./pages/workspace-pages/Attendance";
import Auth from "./pages/Auth-pages/Auth";
import Trash from "./pages/Trash-page/Trash";
import TaskDetail from "./pages/staff-detail-page/TaskDetail";
import Pending from "./pages/operation-pages/Pendings";
import Rework from "./pages/operation-pages/Rework";
import TeamProfile from "./pages/Team-work/TeamView";
import TeamWork from "./pages/Team-work/TeamWorkView";
import TeamWorkDetails from "./pages/Team-work/TeamWorkDetails";
import TeamTaskDetails from "./pages/Team-work/TeamTaskDetail";
import StaffTaskDetails from "./pages/operation-pages/admin_operation_side/StaffTaskDetails";
import StaffTaskVerification from "./pages/operation-pages/admin_operation_side/StaffTaskVerification";
import CompletedTask from "./pages/operation-pages/admin_operation_side/CompletedTask";
import Completed from "./pages/sales-pages/Completed";
import ReworkTask from "./pages/operation-pages/admin_operation_side/ReworkTask";
import ProjectTeam from "./pages/Team-work/admin_team_work_side/ProjectTeam";
import Worklog from "./pages/workspace-pages/Worklog";
import TeamLeads from "./pages/Team-work/TeamLeads";
import TeamContacts from "./pages/Team-work/TeamContacts";
import TaskView from "./pages/activity-pages/admin_activity/TaskView";
import AdminWorklog from "./pages/workspace-pages/admin_workspace_side/AdminWorklog";
import AccessDenied from "./components/AcessDenined";
import UnAuthorised from "./components/UnAuthorised";
import HelperRoute from "./components/Routes/HelperRoute";
import SubTaskPage from "./pages/activity-pages/SubTaskPage";
import TaskStatusDisplay from "./pages/activity-pages/TaskStatusDisplay";
import TeamSubtask from "./pages/Team-work/TeamSubtask";
import LeadPending from "./pages/sales-pages/LeadPending";
import LeadRejected from "./pages/sales-pages/LeadReject";
import RemovedSubTask from "./pages/activity-pages/RemovedSubTask";
import TaskDetailsDisplay from "./pages/activity-pages/admin_activity/TaskDetailsDisplay";

import ProtectedRoute from "./components/Routes/ProtectedRoute";
import Sidebar from "./components/SideBar";

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const hideSidebar = location.pathname.startsWith("/login");

  return (
    <div className="flex bg-gray-100 h-screen">
      {!hideSidebar && (
        <>
          <div
            className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 md:hidden ${
              sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            onClick={() => setSidebarOpen(false)}
          ></div>

          <div
            className={`fixed inset-y-0 left-0 z-50 w-64 h-screen bg-white shadow-md transform transition-transform duration-300
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
            md:translate-x-0 md:static`}
          >
            <Sidebar closeSidebar={() => setSidebarOpen(false)} />
          </div>
        </>
      )}

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
          {/* Unauthorized / Access Denied */}
          <Route
            path="/access-denied"
            element={
               < AccessDenied />
            }
          />

          {/* Not found */}
          <Route path="*" element={ <  UnAuthorised />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/operations/pending/task"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <StaffPendingTask />
              </ProtectedRoute>
            }
          />
          <Route
            path="/team/customise"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <CreateTeam />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workspace/calendar/customise"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminCalendar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workspace/attendance/view"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminAttendanceView />
              </ProtectedRoute>
            }
          />
  
          <Route
            path="/activities/task/port/:data"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <StaffTaskDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/operations/resolved"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <StaffTaskVerification />
              </ProtectedRoute>
            }
          />
          <Route
            path="/operations/completed"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <CompletedTask />
              </ProtectedRoute>
            }
          />
          <Route
            path="/operations/rework/port"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ReworkTask />
              </ProtectedRoute>
            }
          />
          <Route
            path="/team/work/port/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ProjectTeam />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workspace/todo/"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminTodo />
              </ProtectedRoute>
            }
          />
          <Route
            path="/activities/task/port"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <TaskView />
              </ProtectedRoute>
            }
          />


          <Route
            path="/activities/task/details/port/:data"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <TaskDetailsDisplay/>
              </ProtectedRoute>
            }
          />


          <Route
            path="/workspace/auth/pin/generator"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminPinGenerator />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workspace/AdminWorklog"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminWorklog />
              </ProtectedRoute>
            }
          />

          {/* Staff Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={["staff"]}>
                <StaffDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/operations/leads"
            element={
              <ProtectedRoute allowedRoles={["staff"]}>
                <Leads />
              </ProtectedRoute>
            }
          />
          <Route
            path="/operations/contacts"
            element={
              <ProtectedRoute allowedRoles={["staff"]}>
                <Contacts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/operations/accounts"
            element={
              <ProtectedRoute allowedRoles={["staff"]}>
                <Accounts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/operations/deals"
            element={
              <ProtectedRoute allowedRoles={["staff", "admin"]}>
                <Deals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/operations/pendings"
            element={
              <ProtectedRoute allowedRoles={["staff"]}>
                <Pending />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales/pendings"
            element={
              <ProtectedRoute allowedRoles={["staff"]}>
                <LeadPending />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales/rejected"
            element={
              <ProtectedRoute allowedRoles={["staff"]}>
                <LeadRejected />
              </ProtectedRoute>
            }
          />
       




          <Route
            path="/sales/completed"
            element={
              <ProtectedRoute allowedRoles={["staff"]}>
                <Completed />
              </ProtectedRoute>
            }
          />

          <Route
            path="/operations/personalize"
            element={
              <ProtectedRoute allowedRoles={["staff"]}>
                <Personalize />
              </ProtectedRoute>
            }
          />
          <Route
            path="/operations/documents"
            element={
              <ProtectedRoute allowedRoles={["staff", "admin"]}>
                <Documents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/operations/reworks"
            element={
              <ProtectedRoute allowedRoles={["staff"]}>
                <Rework />
              </ProtectedRoute>
            }
          />
          <Route
            path="/activities/tasks"
            element={
              <ProtectedRoute allowedRoles={["staff"]}>
                <Task />
              </ProtectedRoute>
            }
          />
          <Route
            path="/activities/tasks/person/:data"
            element={
              <ProtectedRoute allowedRoles={["staff"]}>
                <TaskDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/activities/tasks/subtask/:id"
            element={
              <ProtectedRoute allowedRoles={["staff"]}>
                <SubTaskPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/activities/tasks/status/:data"
            element={
              <ProtectedRoute allowedRoles={["staff"]}>
                <TaskStatusDisplay />
              </ProtectedRoute>
            }
          />
           <Route
            path="/activities/tasks/subtask/removed"
            element={
              <ProtectedRoute allowedRoles={["staff"]}>
                <RemovedSubTask />
              </ProtectedRoute>
            }
          />

          
          <Route
            path="/activities/tasks/team/:data"
            element={
              <ProtectedRoute allowedRoles={["staff","admin"]}>
                <TeamTaskDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/activities/meetings"
            element={
              <ProtectedRoute allowedRoles={["staff"]}>
                <Meetings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/activities/calls"
            element={
              <ProtectedRoute allowedRoles={["staff"]}>
                <Calls />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workspace/calendar"
            element={
              <ProtectedRoute allowedRoles={["staff"]}>
                <Calendar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workspace/messages"
            element={
              <ProtectedRoute allowedRoles={["staff", "admin"]}>
                <Messages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workspace/attendance"
            element={
              <ProtectedRoute allowedRoles={["staff"]}>
                <Attendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/team/profile"
            element={
              <ProtectedRoute allowedRoles={["staff"]}>
                <TeamProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/team/work/:id"
            element={
              <ProtectedRoute allowedRoles={["staff", "admin"]}>
                <TeamWork />
              </ProtectedRoute>
            }
          />
          <Route
            path="/team/work/manage/:data"
            element={
              <ProtectedRoute allowedRoles={["staff","admin"]}>
                <TeamWorkDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workspace/work/assign"
            element={
              <ProtectedRoute allowedRoles={["staff"]}>
                <Worklog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/team/leads"
            element={
              <ProtectedRoute allowedRoles={["staff"]}>
                <TeamLeads />
              </ProtectedRoute>
            }
          />
          <Route
            path="/team/contacts"
            element={
              <ProtectedRoute allowedRoles={["staff"]}>
                <TeamContacts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/team/task/subtask/:id"
            element={
              <ProtectedRoute allowedRoles={["staff","admin"]}>
                <TeamSubtask />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trash"
            element={
              <ProtectedRoute allowedRoles={["staff", "admin"]}>
                <Trash />
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={
              <HelperRoute >
                <Auth />
              </HelperRoute>
            }
          />

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
