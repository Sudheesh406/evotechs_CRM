import React from "react";

const tasks = [
  {
    id: 1,
    title: "Register for upcoming CRM Webinar",
    date: "13/08/2025",
    priority: "Low",
    assignees: ["Sudheesh Kumar", "Kris Marrier (Sample)", "King (Sample)"],
    status: "Not Started",
  },
  {
    id: 2,
    title: "Competitor Comparison Document",
    date: "11/08/2025",
    priority: "Highest",
    assignees: ["Sudheesh Kumar", "Capla Paprocki (Sample)", "Feltz Printing Service"],
    status: "Not Started",
  },
  {
    id: 3,
    title: "Get Approval from Manager",
    date: "14/08/2025",
    priority: "Normal",
    assignees: ["Sudheesh Kumar", "Leota Dilliard (Sample)", "Commercial Press"],
    status: "In Progress",
  },
  {
    id: 4,
    title: "Register for upcoming CRM Webinar",
    date: "16/08/2025",
    priority: "Normal",
    assignees: ["Sudheesh Kumar"],
    status: "In Progress",
  },
  {
    id: 5,
    title: "Deferred Task Example",
    date: "20/08/2025",
    priority: "Low",
    assignees: ["Sudheesh Kumar"],
    status: "Deferred",
  },
];

const statuses = ["Not Started", "Deferred", "In Progress", "Completed"];

const statusColors = {
  "Not Started": "bg-blue-100",
  Deferred: "bg-gray-100",
  "In Progress": "bg-yellow-100",
  Completed: "bg-green-100",
};

const StaffDashboard = () => {
  return (
    <div className="bg-[#f5f5f5] min-h-[680px] text-gray-800">
      <h1 className="text-2xl font-bold mb-4">Welcome Back</h1>

      <div className="flex gap-4 flex-wrap">
        {statuses.map((status) => (
          <div key={status} className="flex-1 min-w-[250px]">
            {/* Status Header */}
            <div
              className={`rounded-t-lg p-3 text-black font-semibold ${statusColors[status]}`}
            >
              {status}
              <span className="ml-2 bg-white text-gray-800 px-2 py-0.5 rounded-full text-sm">
                {tasks.filter((t) => t.status === status).length}
              </span>
            </div>

            {/* Task List */}
            <div className="bg-gray-50 rounded-b-lg p-2 flex flex-col gap-3 max-h-[70vh] overflow-y-auto">
              {tasks
                .filter((task) => task.status === status)
                .map((task) => (
                  <div
                    key={task.id}
                    className="bg-white p-3 rounded-lg shadow hover:shadow-md transition cursor-pointer"
                  >
                    <h4 className="font-semibold mb-1">{task.title}</h4>
                    <p className="text-sm text-gray-500">{task.date}</p>
                    <p className="text-sm text-gray-500">
                      Priority: {task.priority}
                    </p>
                    <div className="text-sm text-gray-600 mt-1">
                      {task.assignees.join(", ")}
                    </div>
                  </div>
                ))}

              {/* Empty State */}
              {tasks.filter((task) => task.status === status).length === 0 && (
                <div className="text-center text-gray-400 mt-2">
                  No Tasks found.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StaffDashboard;
