import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../instance/Axios";
import { MoreVertical, Plus, X } from "lucide-react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

// --- TASK CARD COMPONENT ---
const TaskCard = ({ task, onEdit, onDelete, onSubTask}) => {
  const { id, taskName, amount, phone, priority, description, status } = task;
  const [showDropdown, setShowDropdown] = useState(false);

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "High":
        return "text-red-600 font-semibold";
      case "Medium":
        return "text-amber-500";
      case "Low":
        return "text-gray-400";
      default:
        return "text-gray-500";
    }
  };

  const formattedAmount =
    amount !== null
      ? new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          minimumFractionDigits: 2,
        }).format(amount)
      : "-";

  const fields = [
    { label: "Amount", value: formattedAmount, className: "font-mono text-sm" },
    { label: "Phone", value: phone || "-" },
    { label: "Priority", value: priority, className: getPriorityClass(priority) },
  ];

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-md p-4 mb-4 transition hover:shadow-lg duration-300 relative">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <p className="font-semibold text-gray-800 text-sm">{taskName}</p>
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full"
          >
            <MoreVertical size={16} />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-6 w-32 bg-white border rounded-md shadow-lg z-10">
              <button
                onClick={() => {
                  onEdit(task);
                  setShowDropdown(false);
                }}
                className="flex items-center w-full px-3 py-2 text-left hover:bg-gray-100 text-sm text-gray-700"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  onDelete(task.id);
                  setShowDropdown(false);
                }}
                className="flex items-center w-full px-3 py-2 text-left hover:bg-gray-100 text-sm text-red-600"
              >
                Delete
              </button>
              <button
                onClick={() => {
                  onSubTask(task.id);
                  setShowDropdown(false);
                }}
                className="flex items-center w-full px-3 py-2 text-left hover:bg-gray-100 text-sm text-red-600"
              >
                SubTask
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-1 text-sm text-gray-700">
        {fields.map((field, index) => (
          <div key={index} className="flex justify-between border-b border-gray-50/50 pb-1">
            <span className="text-gray-500 text-xs font-medium">{field.label}</span>
            <span className={`text-right text-xs ${field.className || ""}`}>{field.value}</span>
          </div>
        ))}
      </div>

      {/* Description */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-gray-500 text-xs font-medium mb-1">Description:</p>
        <p className="text-gray-700 text-sm leading-snug">{description || "-"}</p>
      </div>
    </div>
  );
};

// --- TASK COLUMN COMPONENT ---
const TaskColumn = ({ title, color, tasks, onEdit, onDelete, onSubTask }) => {
  const navigate = useNavigate();

  const handleViewClick = () => {
    navigate(`/tasks/${encodeURIComponent(title)}`);
  };

  return (
    <div className="flex-1 min-w-[280px] max-w-full md:max-w-[340px] p-2">
      <div className={`flex justify-between items-center mb-4 p-3 rounded-xl shadow-sm border ${color.bg} ${color.text}`}>
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm opacity-80">Total: {tasks.length}</span>
          <button
            onClick={handleViewClick}
            className="text-white bg-blue-600 hover:bg-blue-700 text-xs font-semibold py-1 px-3 rounded-lg"
          >
            View
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} onSubTask={onSubTask} />
          ))
        ) : (
          <div className="text-center p-8 text-gray-400 text-sm bg-gray-50 rounded-xl border border-gray-100">
            No tasks found.
          </div>
        )}
      </div>
    </div>
  );
};


// --- MAIN COMPONENT ---
const AdminTask = () => {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);

    const navigate = useNavigate();


  const [newTask, setNewTask] = useState({
    taskName: "",
    amount: "",
    phone: "",
    priority: "Medium",
    status: "Not Started",
    description: "",
  });

  // --- Fetch tasks ---
  const getTasks = async () => {
    try {
      const response = await axios.get("/adminTask/get");
      if (response.data.success) setTasks(response.data.result);
    } catch (error) {
      console.log("Error fetching tasks:", error);
      MySwal.fire("Error", "Failed to fetch tasks.", "error");
    }
  };

  useEffect(() => {
    getTasks();
  }, []);

  // --- Handle Add/Edit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const taskData = { ...newTask, amount: newTask.amount ? parseFloat(newTask.amount) : null };

    try {
      if (currentTask) {
        const response = await axios.put(`/adminTask/edit/${currentTask.id}`, taskData);
        setTasks(tasks.map((t) => (t.id === currentTask.id ? response.data.result : t)));
        MySwal.fire("Updated!", "Task has been updated successfully.", "success");
      } else {
        const response = await axios.post("/adminTask/create", taskData);
        setTasks([...tasks, response.data.result]);
        MySwal.fire("Created!", "New task has been added successfully.", "success");
      }

      setShowForm(false);
      setCurrentTask(null);
      setNewTask({
        taskName: "",
        amount: "",
        phone: "",
        priority: "Medium",
        status: "Not Started",
        description: "",
      });
    } catch (error) {
      console.error("Error saving task:", error);
      MySwal.fire("Error!", "Failed to save task.", "error");
    }
  };

  // --- Handle Delete ---
  const handleDelete = async (id) => {
    const result = await MySwal.fire({
      title: "Are you sure?",
      text: "Move to trash!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/adminTask/delete/${id}`);
        setTasks(tasks.filter((t) => t.id !== id));
        MySwal.fire("Deleted!", "Task has been moved to trash.", "success");
      } catch (error) {
        console.error("Delete failed:", error);
        MySwal.fire("Error!", "Failed to delete task.", "error");
      }
    }
  };


  // --- Handle Edit click ---
  const handleEditClick = (task) => {
    setCurrentTask(task);
    setNewTask({
      taskName: task.taskName || "",
      amount: task.amount || "",
      phone: task.phone || "",
      priority: task.priority || "Medium",
      status: task.status || "Not Started",
      description: task.description || "",
    });
    setShowForm(true);
  };


  const handleSubtask = (id)=>{
      navigate(`/activities/tasks/subtask/${id}`);
  }

  // --- Group tasks ---
  const notStartedTasks = tasks.filter((t) => t.status === "Not Started");
  const inProgressTasks = tasks.filter((t) => t.status === "In Progress");
  const finalStageTasks = tasks.filter((t) => t.status === "Final Stage");
  const completedTasks = tasks.filter((t) => t.status === "Completed");

  return (
    <div className="bg-gray-50 p-4 md:p-8 font-sans">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            <span className="text-indigo-600">Activity</span> Tasks
          </h1>
        <button
          onClick={() => {
            setCurrentTask(null);
            setNewTask({ taskName: "", amount: "", phone: "", priority: "Medium", status: "Not Started", description: "" });
            setShowForm(true);
          }}
          className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition duration-300"
        >
          <Plus size={18} className="mr-2" /> Create New Task
        </button>
      </header>

      {/* Kanban Board */}
      <div className="flex flex-col lg:flex-row lg:justify-between gap-2 overflow-x-auto pb-4">
        <TaskColumn title="Not Started" color={{ bg: "bg-green-100", text: "text-green-800" }} tasks={notStartedTasks} onEdit={handleEditClick} onDelete={handleDelete} onSubTask={handleSubtask}/>
        <TaskColumn title="In Progress" color={{ bg: "bg-amber-100", text: "text-amber-800" }} tasks={inProgressTasks} onEdit={handleEditClick} onDelete={handleDelete} onSubTask={handleSubtask} />
        <TaskColumn title="Final Stage" color={{ bg: "bg-purple-100", text: "text-purple-800" }} tasks={finalStageTasks} onEdit={handleEditClick} onDelete={handleDelete} onSubTask={handleSubtask} />
        <TaskColumn title="Completed" color={{ bg: "bg-blue-100", text: "text-blue-800" }} tasks={completedTasks} onEdit={handleEditClick} onDelete={handleDelete} onSubTask={handleSubtask} />
      </div>

      {/* --- ADD/EDIT TASK MODAL --- */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex justify-center items-center z-50 p-4">
          <div className="bg-white p-8 rounded-xl shadow-3xl w-full max-w-lg relative transform transition-all duration-500 scale-100 opacity-100 ease-out">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-teal-600 bg-gray-100 hover:bg-teal-50 transition-colors duration-200 p-2 rounded-full ring-1 ring-gray-200"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-extrabold mb-6 text-gray-800 border-b-2 border-teal-100 pb-3">
              {currentTask ? "📝 Edit Task Details" : "✨ Create New Task"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <input
                type="text"
                placeholder="Task Name (e.g., Finish Q3 Report)"
                value={newTask.taskName}
                onChange={(e) => setNewTask({ ...newTask, taskName: e.target.value })}
                required
                className="w-full border border-gray-300 bg-gray-50 rounded-lg p-3 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-150"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Amount (optional)"
                  value={newTask.amount}
                  onChange={(e) => setNewTask({ ...newTask, amount: e.target.value })}
                  className="w-full border border-gray-300 bg-gray-50 rounded-lg p-3 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-150"
                />
                <input
                  type="text"
                  placeholder="Phone (optional)"
                  value={newTask.phone}
                  onChange={(e) => setNewTask({ ...newTask, phone: e.target.value })}
                  className="w-full border border-gray-300 bg-gray-50 rounded-lg p-3 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-150"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className="w-full border border-gray-300 bg-gray-50 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-150 appearance-none"
                >
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>

                <select
                  value={newTask.status}
                  onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                  className="w-full border border-gray-300 bg-gray-50 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-150 appearance-none"
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Final Stage">Final Stage</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <textarea
                placeholder="Add a detailed description..."
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                rows={4}
                className="w-full border border-gray-300 bg-gray-50 rounded-lg p-3 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-150 resize-y"
              />

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.005]"
              >
                {currentTask ? "💾 Update Task" : "➕ Create Task"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTask;
