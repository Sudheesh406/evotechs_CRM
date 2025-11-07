import React, { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import {
  Edit2,
  Trash2,
  X,
  Clock,
  Users,
  Zap,
  Tag,
  Calendar,
} from "lucide-react";
import axios from "../../../instance/Axios";

// --- Constants (Updated for Premium/Standard Look) ---
const statusStages = ["Pending", "Progress", "Completed"];
// Subtle priority classes
const priorities = {
  High: "bg-red-50 text-red-700 border-red-200", // Soft red
  Medium: "bg-amber-50 text-amber-700 border-amber-200", // Soft amber
  Low: "bg-green-50 text-green-700 border-green-200", // Soft green
};

// Map status to a professional color
const statusColors = {
  Pending: "border-l-4 border-gray-400",
  Progress: "border-l-4 border-blue-500",
  Completed: "border-l-4 border-green-500",
};

// --- Helper Components for Cleanliness (TaskCard Refactored) ---

const TaskCard = ({
  task,
  openModal,
  handleDeleteTask,
  showMoreMap,
  setShowMoreMap,
}) => {
  const isExpanded = showMoreMap[task.id] || false;
  const descriptionLimit = 90; // Slightly reduced for more compact cards

  const toggleDescription = () => {
    setShowMoreMap((prev) => ({ ...prev, [task.id]: !isExpanded }));
  };

  const formattedDate = new Date(task.dueDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <div
      key={task.id}
      // Use status color for left border accent, soft shadow for premium look
      className={`bg-white rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition duration-200 ease-in-out flex flex-col space-y-2 ${
        statusColors[task.status]
      }`}
    >
      <div className="flex justify-between items-start">
        <h3 className="text-base font-semibold text-gray-900 break-words pr-2 leading-snug">
          {task.title}
        </h3>
        <div className="flex gap-2 shrink-0">
          <Edit2
            className="w-4 h-4 cursor-pointer text-gray-500 hover:text-blue-600 transition"
            onClick={() => openModal(task)}
          />
          <Trash2
            className="w-4 h-4 cursor-pointer text-gray-500 hover:text-red-600 transition"
            onClick={() => handleDeleteTask(task.id)}
          />
        </div>
      </div>

      {/* Tags Section - More Subtle */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        {/* Priority Tag */}
        <span
          className={`px-2 py-0.5 rounded-full font-semibold border ${
            priorities[task.priority]
          }`}
        >
          <Zap className="inline w-3 h-3 mr-1" />
          {task.priority}
        </span>

        {/* Due Date Tag */}
        <span className="text-gray-600 flex items-center">
          <Calendar className="w-3 h-3 mr-1 text-indigo-500" />
          <span className="font-medium">{formattedDate}</span>
        </span>
      </div>

      {/* Assignment Details */}
      <div className="text-xs text-gray-500 space-y-0.5">
        <div className="flex items-center">
          <Users className="w-3 h-3 mr-1 text-gray-500" />
          <span className="font-medium text-gray-700">
            {task.assignedTo?.name === "Admin"
              ? "Admin"
              : task.assignedTo.name}
          </span>
        </div>
        {task.team && (
          <div className="flex items-center">
            <Tag className="w-3 h-3 mr-1 text-gray-500" />
            <span className="font-medium text-gray-700">
              {task.team.teamName}
            </span>
          </div>
        )}
      </div>

      {/* Description with Read More - Compacted */}
      <div className="text-xs text-gray-600 mt-1">
        <p>
          {task.description.length <= descriptionLimit
            ? task.description
            : isExpanded
            ? task.description
            : task.description.slice(0, descriptionLimit) + "..."}
        </p>
        {task.description.length > descriptionLimit && (
          <button
            onClick={toggleDescription}
            className="text-blue-600 text-xs mt-0.5 font-semibold hover:text-blue-800 transition focus:outline-none"
          >
            {isExpanded ? "Show Less" : "Read More"}
          </button>
        )}
      </div>
    </div>
  );
};

// --- Main Component ---
export default function AdvancedTodoCRM() {
  const [tasks, setTasks] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [allUsers, setAllUsers] = useState([
    { id: null, name: "Admin", email: "" },
  ]);
  const [teams, setTeams] = useState([]);
  const [formTask, setFormTask] = useState({
    title: "",
    description: "",
    assignedTo: { id: null, name: "Admin", email: "" },
    dueDate: "",
    priority: "Medium",
    team: null,
    status: "Pending",
  });
  const [errors, setErrors] = useState({});
  const [noChangeMessage, setNoChangeMessage] = useState("");
  const [showMoreMap, setShowMoreMap] = useState({});

  // Helper functions (omitted for brevity, assume they are the same)
  const showLoadingSwal = (title) => {
    Swal.fire({
      title,
      didOpen: () => Swal.showLoading(),
      allowOutsideClick: false,
    });
  };

  const fetchUserDetails = useCallback(async () => {
    try {
      showLoadingSwal("Loading details...");
      const response = await axios.get("/work/assign/user_details");
      const staff = response.data.data?.allUser || [];
      const allTeams = response.data.data?.teams || [];

      setAllUsers([
        { id: null, name: "Admin", email: "" },
        ...staff.map((u) => ({ id: u.id, name: u.name, email: u.email })),
      ]);
      setTeams(allTeams);

      Swal.close();
    } catch (error) {
      Swal.close();
      console.error("Error fetching work details:", error);
      Swal.fire("Error", "Failed to get user and team details", "error");
    }
  }, []);

  const fetchWorkDetails = useCallback(async () => {
    try {
      showLoadingSwal("Loading tasks...");

      const response = await axios.get("/work/assign/work_details");
      const apiData = response.data.data || [];

      const apiTasks = apiData.map((item) => {
        let assignedStaff = { id: null, name: "Admin", email: "" };
        if (item.assignedStaff) {
          assignedStaff = {
            id: item.staffId,
            name: item.assignedStaff.name,
            email: item.assignedStaff.email,
          };
        }

        const assignedTeam = item.team
          ? { id: item.teamId, teamName: item.team.teamName }
          : null;

        return {
          id: item.id,
          title: item.title,
          description: item.description,
          assignedTo: assignedStaff,
          dueDate: item.date?.split("T")[0] || "",
          priority:
            item.priority?.charAt(0).toUpperCase() +
              item.priority?.slice(1) || "Medium",
          status: item.workUpdate || "Pending",
          team: assignedTeam,
        };
      });

      setTasks(apiTasks);
      Swal.close();
    } catch (error) {
      Swal.close();
      console.error("Error fetching tasks:", error);
      Swal.fire("Error", "Failed to fetch tasks", "error");
    }
  }, []);

  useEffect(() => {
    (async () => {
      await fetchUserDetails();
      await fetchWorkDetails();
    })();
  }, [fetchUserDetails, fetchWorkDetails]);

  const openModal = (task = null) => {
    setNoChangeMessage("");
    setErrors({});
    setEditTask(task);

    if (task) {
      setFormTask({
        title: task.title,
        description: task.description,
        assignedTo: task.assignedTo || { id: null, name: "Admin", email: "" },
        dueDate: task.dueDate,
        priority: task.priority,
        team: task.team,
        status: task.status || "Pending",
      });
    } else {
      setFormTask({
        title: "",
        description: "",
        assignedTo: { id: null, name: "Admin", email: "" },
        dueDate: "",
        priority: "Medium",
        team: null,
        status: "Pending",
      });
    }

    setModalOpen(true);
  };

  const validateForm = () => {
    let tempErrors = {};
    if (!formTask.title.trim()) tempErrors.title = "Title is required";
    if (!formTask.description.trim())
      tempErrors.description = "Description is required";
    if (!formTask.assignedTo?.name)
      tempErrors.assignedTo = "Assigned user is required";
    if (!formTask.dueDate) tempErrors.dueDate = "Due date is required";
    if (!formTask.priority) tempErrors.priority = "Priority is required";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSaveTask = async () => {
    if (!validateForm()) return;

    if (editTask) {
      const hasChanged =
        formTask.title !== editTask.title ||
        formTask.description !== editTask.description ||
        formTask.assignedTo?.id !== editTask.assignedTo?.id ||
        formTask.dueDate !== editTask.dueDate ||
        formTask.priority !== editTask.priority ||
        formTask.status !== editTask.status ||
        (formTask.team?.id || null) !== (editTask.team?.id || null);

      if (!hasChanged) {
        setNoChangeMessage("No changes detected.");
        return;
      }
    }
    const payload = {
      ...formTask,
      assignedName: formTask.assignedTo.name,
      assignedEmail: formTask.assignedTo.email,
      teamId:
        formTask.assignedTo?.name === "Admin" ? formTask.team?.id || null : null,
    };

    try {
      showLoadingSwal(editTask ? "Updating..." : "Creating...");

      if (editTask) {
        await axios.put("/work/assign/update", {
          params: { id: editTask.id, ...payload },
        });
        setTasks(
          tasks.map((t) =>
            t.id === editTask.id ? { ...formTask, id: editTask.id } : t
          )
        );
        Swal.close();
        Swal.fire("Updated! 🎉", "Task has been updated.", "success");
      } else {
        const response = await axios.post("/work/assign/create", {
          params: payload,
        });
        const newTask = {
          ...formTask,
          id: response.data?.newId || Date.now().toString(),
        };
        setTasks((prev) => [...prev, newTask]);
        Swal.close();
        Swal.fire("Created! ✅", "Task has been created.", "success");
      }

      setModalOpen(false);
    } catch (error) {
      Swal.close();
      console.error("Error saving task:", error);
      Swal.fire("Error", "Failed to save task", "error");
    }
  };

  const handleDeleteTask = (id) => {
    Swal.fire({
      title: "Delete Task?",
      text: "Are you sure you want to delete this task? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          showLoadingSwal("Deleting...");
          await axios.delete(`/work/assign/delete/${id}`);
          setTasks((prev) => prev.filter((t) => t.id !== id));
          Swal.close();
          Swal.fire("Deleted! 🗑️", "Task has been deleted.", "success");
        } catch (error) {
          Swal.close();
          console.error("Error deleting task:", error);
          Swal.fire("Error", "Failed to delete task", "error");
        }
      }
    });
  };

  // Function to determine the column header color - Changed to Darker Blue for Premium Look
  const getStageHeaderClasses = (stage) => {
    switch (stage) {
      case "Pending":
        return "bg-gray-700"; // Dark Gray
      case "Progress":
        return "bg-indigo-700"; // Dark Blue/Indigo
      case "Completed":
        return "bg-green-700"; // Dark Green
      default:
        return "bg-gray-700";
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50">
      {/* Header - Cleaner Look */}
      <header className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-md border-b-2 border-indigo-500">
         <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
            <span className="text-indigo-600">Task</span> Management
          </h1>
        <button
          onClick={() => openModal()}
          className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-sm rounded-md font-semibold shadow-md transition duration-200 ease-in-out"
        >
          + New Task
        </button>
      </header>

      {/* Kanban Board - Subtle Design */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {statusStages.map((stage) => (
          <div key={stage} className="bg-white rounded-xl shadow-lg flex flex-col">
            {/* Stage Header */}
            <div className={`p-3 rounded-t-xl ${getStageHeaderClasses(stage)}`}>
              <h2 className="text-base font-semibold text-white uppercase tracking-wide">
                {stage}
              </h2>
              <span className="text-xs text-gray-200">
                ({tasks.filter((t) => t.status === stage).length} tasks)
              </span>
            </div>

            {/* Task List - subtle white background */}
            <div className="p-3 space-y-3 flex-grow min-h-[100px] overflow-y-auto">
              {tasks
                .filter((t) => t.status === stage)
                .sort((a, b) => {
                  const priorityOrder = { High: 3, Medium: 2, Low: 1 };
                  return priorityOrder[b.priority] - priorityOrder[a.priority];
                })
                .map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    openModal={openModal}
                    handleDeleteTask={handleDeleteTask}
                    showMoreMap={showMoreMap}
                    setShowMoreMap={setShowMoreMap}
                  />
                ))}

              {/* Placeholder if column is empty */}
              {tasks.filter((t) => t.status === stage).length === 0 && (
                <div className="text-center p-6 text-gray-400 italic bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  No tasks here.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal (Compacted Form & Standard Design) */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl transform transition-all overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header - Dark and Clean */}
            <div className="bg-gray-800 text-white px-5 py-3 flex justify-between items-center shrink-0">
              <h2 className="text-lg font-semibold">
                {editTask ? "Edit Task" : "Create New Task"}
              </h2>
              <X
                className="cursor-pointer w-5 h-5 hover:text-gray-300"
                onClick={() => setModalOpen(false)}
              />
            </div>

            {/* Scrollable Body (Form) - Compacted Padding/Spacing */}
            <div className="p-5 space-y-4 overflow-y-auto flex-grow">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  className={`border ${
                    errors.title ? "border-red-500" : "border-gray-300"
                  } p-2 rounded-md w-full text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition duration-150`}
                  placeholder="Task Title"
                  value={formTask.title}
                  onChange={(e) => {
                    setFormTask({ ...formTask, title: e.target.value });
                    setErrors({ ...errors, title: "" });
                  }}
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  className={`border ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  } p-2 h-[80px] rounded-md w-full text-sm resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500 transition duration-150`}
                  placeholder="Task Description"
                  value={formTask.description}
                  onChange={(e) => {
                    setFormTask({ ...formTask, description: e.target.value });
                    setErrors({ ...errors, description: "" });
                  }}
                  rows={3}
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.description}
                  </p>
                )}
              </div>

              {/* 2x2 Grid for smaller fields - Tighter Spacing */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {/* Assigned User */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assigned To
                  </label>
                  <select
                    className={`border ${
                      errors.assignedTo ? "border-red-500" : "border-gray-300"
                    } p-2 rounded-md w-full bg-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition duration-150`}
                    value={formTask.assignedTo?.name || ""}
                    onChange={(e) => {
                      const user = allUsers.find(
                        (u) => u.name === e.target.value
                      );
                      setFormTask({ ...formTask, assignedTo: user });
                      setErrors({ ...errors, assignedTo: "" });
                    }}
                  >
                    {allUsers.map((user) => (
                      <option key={user.name} value={user.name}>
                        {user.name} {user.email ? `(${user.email})` : ""}
                      </option>
                    ))}
                  </select>
                  {errors.assignedTo && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.assignedTo}
                    </p>
                  )}
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    className={`border ${
                      errors.dueDate ? "border-red-500" : "border-gray-300"
                    } p-2 rounded-md w-full bg-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition duration-150`}
                    value={formTask.dueDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => {
                      setFormTask({ ...formTask, dueDate: e.target.value });
                      setErrors({ ...errors, dueDate: "" });
                    }}
                  />
                  {errors.dueDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.dueDate}
                    </p>
                  )}
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    className={`border ${
                      errors.priority ? "border-red-500" : "border-gray-300"
                    } p-2 rounded-md w-full bg-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition duration-150`}
                    value={formTask.priority}
                    onChange={(e) => {
                      setFormTask({ ...formTask, priority: e.target.value });
                      setErrors({ ...errors, priority: "" });
                    }}
                  >
                    <option value="">Select Priority</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                  {errors.priority && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.priority}
                    </p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    className="border border-gray-300 p-2 rounded-md w-full bg-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition duration-150"
                    value={formTask.status}
                    onChange={(e) =>
                      setFormTask({ ...formTask, status: e.target.value })
                    }
                  >
                    <option value="Pending">Pending</option>
                    <option value="Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Team (Full width) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team (Optional)
                </label>
                <select
                  className="border border-gray-300 p-2 rounded-md w-full bg-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition duration-150"
                  value={formTask.team?.id || ""}
                  onChange={(e) => {
                    const selectedTeam = teams.find(
                      (t) => t.id === parseInt(e.target.value)
                    );
                    setFormTask({ ...formTask, team: selectedTeam });
                  }}
                >
                  <option value="">Select Team</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.teamName}
                    </option>
                  ))}
                </select>
              </div>

              {noChangeMessage && (
                <p className="text-amber-700 text-sm p-2 bg-amber-50 rounded-md border border-amber-300">
                  {noChangeMessage}
                </p>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  onClick={handleSaveTask}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base py-2.5 rounded-md shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                >
                  {editTask ? "Update Task" : "Create Task"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}