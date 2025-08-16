import { useState } from "react";
import { Menu, Eye, RotateCcw } from "lucide-react";
import Sidebar from "../../components/SideBar";

import { useNavigate } from "react-router-dom";

const tasks = [
  {
    id: 1,
    title: "Prepare monthly report",
    description: "Compile and submit the monthly performance report.",
    dueDate: "2025-08-20",
    status: "Pending",
  },
  {
    id: 2,
    title: "Update client database",
    description: "Add new leads from last week's campaign.",
    dueDate: "2025-08-15",
    status: "In Progress",
  },
  {
    id: 3,
    title: "Team meeting preparation",
    description: "Create slides and agenda for Monday's meeting.",
    dueDate: "2025-08-14",
    status: "Completed",
  },
];

export default function Review() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();

  const handleView = (task) => {
    navigate("/review/details");
  };

  const handleSubmit = (task) => {
    console.log("Submitting task:", task);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <div className="hidden md:flex md:flex-col md:w-64 fixed inset-y-0 left-0 z-30">
        <Sidebar />
      </div>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Drawer - Mobile */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform md:hidden transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 md:ml-64">
        {/* Mobile Top Bar */}
        <div className="md:hidden mb-6 flex items-center">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md bg-gray-200 hover:bg-gray-300"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="ml-4 text-xl font-semibold">Reviews</h1>
        </div>

        {/* Tasks Card */}
        <div className="max-w-full mx-auto bg-white rounded-lg shadow-lg p-4 sm:p-6 overflow-x-auto">
          <div className="flex items-center justify-between mb-4 flex-wrap">
            <h2 className="text-xl font-bold text-gray-800">Your Review List</h2>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-600">
                  <th className="p-3 text-left">Title</th>
                  <th className="p-3 text-left">Description</th>
                  <th className="p-3 text-left">Due Date</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, index) => (
                  <tr
                    key={task.id}
                    className={`border-b hover:bg-gray-50 ${
                      index === tasks.length - 1 ? "border-b-0" : ""
                    }`}
                  >
                    <td className="p-3 font-medium">{task.title}</td>
                    <td className="p-3 text-gray-600">{task.description}</td>
                    <td className="p-3">{task.dueDate}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleView(task)}
                          className="flex items-center gap-1 px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded shadow text-sm"
                        >
                          <Eye size={16} /> View
                        </button>
                        <button
                          onClick={() => handleSubmit(task)}
                          className="flex items-center gap-1 px-2 py-1 bg-gray-500 hover:bg-green-600 text-white rounded shadow text-sm"
                        >
                          <RotateCcw size={16} /> Return
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
