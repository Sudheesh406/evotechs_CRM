import { useState, useEffect } from "react";
import axios from "../../../instance/Axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useNavigate } from "react-router-dom";

// SweetAlert instance
const MySwal = withReactContent(Swal);

// Task Column Component
const TaskColumn = ({ status, cards }) => {
  const navigate = useNavigate();

  // Function to determine priority color and text style
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-500 text-white shadow-lg shadow-red-500/50";
      case "Normal":
        return "bg-blue-400 text-white shadow-lg shadow-blue-400/50";
      default:
        return "bg-green-400 text-white shadow-lg shadow-green-400/50";
    }
  };

  // Function to handle the column action
  const handleColumnAction = (status) => {
    const dataToSend = encodeURIComponent(JSON.stringify({ status }));
    navigate(`/activities/task/details/port/${dataToSend}`);
  };

  return (
    <div className="bg-white rounded-xl p-5 flex flex-col shadow-2xl hover:shadow-3xl transition-all duration-300 border border-gray-100 h-[calc(100vh-180px)]">
      <h2 className="text-xl font-extrabold text-gray-800 mb-4 pb-2 border-b-2 border-indigo-500/50 flex justify-between items-center sticky top-0 bg-white z-10">
        <span className="capitalize tracking-wider">{status}</span>

        <div className="flex items-center space-x-3">
          <span className="text-sm font-bold bg-indigo-500 text-white px-3 py-1 rounded-full shadow-md">
            {cards.length}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleColumnAction(status);
            }}
            className="flex items-center justify-center text-indigo-600 hover:text-white hover:bg-indigo-500 w-8 h-8 rounded-full transition duration-150"
            aria-label={`View details for ${status}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </button>
        </div>
      </h2>

      {/* Scrollable cards area */}
      <div className="space-y-4 overflow-y-auto flex-1 pr-1">
        {cards.length > 0 ? (
          cards.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-xl p-4 shadow-lg hover:shadow-2xl transition duration-300 cursor-pointer border-l-4 border-indigo-400/80 transform hover:scale-[1.01]"
            >
              {/* Customer Details */}
              {task.customer && (
                <div className="mb-3 pb-2 border-b border-gray-100">
                  <h3 className="text-base font-bold text-gray-900 truncate flex items-center">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-10 h-10 rounded-full bg-gray-200 p-1"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle cx="12" cy="8" r="4" fill="#9ca3af" />
                        <path d="M4 20c0-4 4-6 8-6s8 2 8 6" fill="#9ca3af" />
                      </svg>
                      <span className="text-gray-800 font-medium">
                        {task.customer.name || "John Doe"}
                      </span>
                    </div>
                  </h3>
                  {task.customer.amount && (
                    <p className="text-sm font-extrabold text-green-600 mt-1">
                      Amount: ${task.customer.amount}
                    </p>
                  )}
                  {(task.customer.email || task.customer.phone) && (
                    <p className="text-gray-500 text-xs mt-1">
                      {task.customer.email && (
                        <span className="mr-3">{task.customer.email}</span>
                      )}
                      {task.customer.phone && (
                        <span>{task.customer.phone}</span>
                      )}
                    </p>
                  )}
                </div>
              )}

              {/* Task Details */}
              {task.requirement && (
                <p className="text-gray-800 text-sm font-semibold mb-1">
                  <span className="text-indigo-600">Req:</span>{" "}
                  {task.requirement}
                </p>
              )}
              {task.description && (
                <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                  <span className="font-medium">Desc:</span> {task.description}
                </p>
              )}

              {/* Priority and Stage */}
              <div className="flex items-center justify-between mb-3 pt-2 border-t border-gray-100">
                <span className="text-gray-700 text-xs font-medium bg-gray-100 px-2 py-0.5 rounded-md">
                  Stage:{" "}
                  <span className="font-semibold text-gray-800">{task.stage}</span>
                </span>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${getPriorityColor(
                    task.priority
                  )}`}
                >
                  {task.priority}
                </span>
              </div>

              {/* Staff Details */}
              {task.staff && (
                <p className="text-gray-700 text-xs mt-2">
                  <span className="font-bold text-gray-800">Assigned To:</span>{" "}
                  <span className="text-indigo-600">{task.staff.name}</span>
                  {task.staff.email && (
                    <span className="text-gray-500"> ({task.staff.email})</span>
                  )}
                </p>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-center py-10 italic">
            No tasks found in this stage.
          </p>
        )}
      </div>
    </div>
  );
};

// Main Task View Component
const TaskView = () => {
  const [tasks, setTasks] = useState([]);

  const getTaskDetails = async () => {
    MySwal.fire({
      title: "Loading tasks...",
      allowOutsideClick: false,
      didOpen: () => MySwal.showLoading(),
    });

    try {
      const response = await axios.get("/task/admin/get");
      const fetchedTasks = Array.isArray(response.data.data)
        ? response.data.data
        : [];
      setTasks(fetchedTasks);
      MySwal.close();
    } catch (error) {
      MySwal.close();
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
    "Not Started": tasksArray.filter(
      (t) => t.stage === "To Do" || t.stage === "1"
    ),
    "In Progress": tasksArray.filter(
      (t) => t.stage === "In Progress" || t.stage === "2"
    ),
    Review: tasksArray.filter((t) => t.stage === "3"),
    Completed: tasksArray.filter((t) => t.stage === "4"),
  };

  const totalTasks = tasksArray.length;

  return (
    <div className="p-8 bg-gray-50 max-h-[600px] flex flex-col">
      {/* Header */}
      <div className="mb-8 border-b-2 border-indigo-200 pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            <span className="text-indigo-600">Task</span> Board
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Overview of all customer requirements and project stages.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-semibold text-gray-600">
            Total Tasks:
          </span>
          <span className="bg-indigo-500 text-white text-lg font-bold px-4 py-1 rounded-full shadow-md">
            {totalTasks}
          </span>
        </div>
      </div>

      {/* Columns Grid */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
        {Object.entries(tasksByStage).map(([status, cards]) => (
          <TaskColumn key={status} status={status} cards={cards} />
        ))}
      </div>
    </div>
  );
};

export default TaskView;
