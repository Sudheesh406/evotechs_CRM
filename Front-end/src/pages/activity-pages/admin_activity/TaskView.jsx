import { useState, useEffect } from "react";
import axios from "../../../instance/Axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
// NOTE: If using react-router-dom, you would import 'useNavigate' here
// import { useNavigate } from "react-router-dom"; 

// SweetAlert instance
const MySwal = withReactContent(Swal);

// Task Column Component
const TaskColumn = ({ status, cards }) => {
  // If you were using react-router-dom, you'd uncomment this:
  // const navigate = useNavigate();

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

  // Function to handle navigation to the details page
  const handleViewDetails = (taskId) => {
    // 💡 IMPORTANT: In a real app, replace the console.log/MySwal with actual routing:
    // e.g., navigate(`/tasks/${taskId}`); 
    
    console.log(`Navigating to details for task ID: ${taskId}`);
    MySwal.fire({
      icon: "info",
      title: "Navigation Placeholder",
      text: `Task ID ${taskId} details page would open here.`,
    });
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
              // Added 'relative' positioning for the '...' button
              className="bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition cursor-pointer border border-gray-100 relative"
              // OPTIONAL: Uncomment to make clicking the card open details too
              // onClick={() => handleViewDetails(task.id)}
            >
              
              {/* Ellipsis/Kebab Menu Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevents a general card click handler from firing
                  handleViewDetails(task.id);
                }}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
                aria-label={`View details for task ${task.id}`}
              >
                {/* SVG for the three-dot icon */}
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 12h.01M12 12h.01M19 12h.01"
                  ></path>
                </svg>
              </button>

              {/* Customer Details - Added pr-6 for spacing */}
              {task.customer && (
                <div className="mb-2 pr-6">
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