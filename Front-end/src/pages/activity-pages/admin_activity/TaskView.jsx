import { useState, useEffect } from "react";
import axios from "../../../instance/Axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

// SweetAlert instance
const MySwal = withReactContent(Swal);

// Task Column Component
const TaskColumn = ({ status, cards }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Normal":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-green-100 text-green-800";
    }
  };

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 rounded-xl p-4 flex flex-col shadow-md hover:shadow-xl transition-all">
      <h2 className="text-lg font-bold mb-4 flex justify-between items-center">
        {status} <span className="text-gray-500 font-medium">{cards.length}</span>
      </h2>

      <div className="space-y-4 overflow-y-auto flex-1 pr-2 max-h-[75vh]">
        {cards.length > 0 ? (
          cards.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition cursor-pointer border border-gray-100"
            >
              {/* Customer Details */}
              {task.customer && (
                <div className="mb-2">
                  <h3 className="text-lg font-semibold text-gray-800 truncate">{task.customer.name}</h3>
                  {task.customer.email && <p className="text-gray-500 text-sm">Email: {task.customer.email}</p>}
                  {task.customer.phone && <p className="text-gray-500 text-sm">Phone: {task.customer.phone}</p>}
                  {task.customer.amount && (
                    <p className="text-gray-700 text-sm font-medium">Amount: ${task.customer.amount}</p>
                  )}
                </div>
              )}

              {/* Task Details */}
              {task.requirement && (
                <p className="text-gray-700 text-sm mb-1">
                  <span className="font-medium">Requirement:</span> {task.requirement}
                </p>
              )}
              {task.description && (
                <p className="text-gray-500 text-sm mb-2 line-clamp-3">
                  <span className="font-medium">Description:</span> {task.description}
                </p>
              )}

              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 text-sm font-medium">Stage: {task.stage}</span>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}
                >
                  {task.priority}
                </span>
              </div>

              {/* Staff Details */}
              {task.staff && (
                <p className="text-gray-600 text-sm">
                  <span className="font-medium">Assigned To:</span> {task.staff.name}{" "}
                  {task.staff.email && `(${task.staff.email})`}
                </p>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-center py-10 italic">No tasks found.</p>
        )}
      </div>
    </div>
  );
};

// Main Task View Component
const TaskView = () => {
  const [tasks, setTasks] = useState([]);

  const getTaskDetails = async () => {
    // Show loading popup
    MySwal.fire({
      title: "Loading tasks...",
      allowOutsideClick: false,
      didOpen: () => {
        MySwal.showLoading();
      },
    });

    try {
      const response = await axios.get("/task/admin/get");
      const fetchedTasks = Array.isArray(response.data.data) ? response.data.data : [];
      setTasks(fetchedTasks);

      // Close loading popup
      MySwal.close();
    } catch (error) {
      // Close loading popup
      MySwal.close();

      // Show error popup
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch tasks. Please try again.",
      });

      setTasks([]);
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    getTaskDetails();
  }, []);

  const tasksArray = Array.isArray(tasks) ? tasks : [];

  const tasksByStage = {
    "Not Started": tasksArray.filter((t) => t.stage === "To Do" || t.stage === "1"),
    "In Progress": tasksArray.filter((t) => t.stage === "In Progress" || t.stage === "2"),
    Review: tasksArray.filter((t) => t.stage === "3"),
    Completed: tasksArray.filter((t) => t.stage === "4"),
  };

  return (
    <div className="p-6 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold mb-6 text-gray-800">Tasks</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(tasksByStage).map(([status, cards]) => (
          <TaskColumn key={status} status={status} cards={cards} />
        ))}
      </div>
    </div>
  );
};

export default TaskView;
