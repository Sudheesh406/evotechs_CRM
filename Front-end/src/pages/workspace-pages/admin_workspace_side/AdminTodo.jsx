import React, { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import { Edit2, Trash2, X, Clock, Users, Zap } from "lucide-react";
import axios from "../../../instance/Axios";

// --- Constants (No changes needed here) ---
const statusStages = ["Pending", "Progress", "Completed"];
const priorities = {
  High: "bg-red-100 text-red-700 border-red-300",
  Medium: "bg-yellow-100 text-yellow-700 border-yellow-300",
  Low: "bg-green-100 text-green-700 border-green-300",
};

// --- Helper Components for Cleanliness ---

const TaskCard = ({ task, openModal, handleDeleteTask, showMoreMap, setShowMoreMap }) => {
  const isExpanded = showMoreMap[task.id] || false;
  const descriptionLimit = 120; // Increased limit for better readability before cutting

  // Function to toggle the 'Read More' state
  const toggleDescription = () => {
    setShowMoreMap(prev => ({ ...prev, [task.id]: !isExpanded }));
  };

  return (
    <div
      key={task.id}
      className="bg-white rounded-xl p-4 mb-4 shadow-md border-t-4 border-blue-500 hover:shadow-lg transition duration-200 ease-in-out flex flex-col space-y-3"
    >
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold text-gray-800 break-words pr-2">{task.title}</h3>
        <div className="flex gap-2 shrink-0">
          <Edit2
            className="w-5 h-5 cursor-pointer text-blue-500 hover:text-blue-600 transition"
            onClick={() => openModal(task)}
          />
          <Trash2
            className="w-5 h-5 cursor-pointer text-red-500 hover:text-red-600 transition"
            onClick={() => handleDeleteTask(task.id)}
          />
        </div>
      </div>

      {/* Tags Section */}
      <div className="flex flex-wrap gap-2 text-sm">
        {/* Priority Tag */}
        <span
          className={`px-3 py-1 rounded-full font-medium border ${
            priorities[task.priority]
          }`}
        >
          <Zap className="inline w-3.5 h-3.5 mr-1" />
          {task.priority}
        </span>
        
        {/* Due Date Tag */}
        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium border border-gray-300">
          <Clock className="inline w-3.5 h-3.5 mr-1" />
          {task.dueDate}
        </span>
      </div>

      {/* Assignment Details */}
      <div className="text-sm text-gray-600 space-y-1">
        <div className="flex items-center">
          <Users className="w-4 h-4 mr-2 text-indigo-500" />
          <span className="font-medium">Assigned To: </span>
          <span className="ml-1">
            {task.assignedTo?.name === "Admin" ? "Admin" : `${task.assignedTo.name} (${task.assignedTo.email})`}
          </span>
        </div>
        {task.team && (
          <div className="flex items-center">
            <span className="w-4 h-4 mr-2"></span> {/* Placeholder for alignment */}
            <span className="font-medium">Team: </span>
            <span className="ml-1">{task.team.teamName}</span>
          </div>
        )}
      </div>

      {/* Description with Read More */}
      <div className="text-sm text-gray-700 mt-1">
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
            className="text-blue-600 text-sm mt-1 font-semibold hover:text-blue-800 transition focus:outline-none"
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
  const [allUsers, setAllUsers] = useState([{ id: null, name: "Admin", email: "" }]);
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

  // Helper function to show loading state
  const showLoadingSwal = (title) => {
    Swal.fire({
      title,
      didOpen: () => Swal.showLoading(),
      allowOutsideClick: false,
    });
  };

  // Fetch staff and teams
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

  
  // Fetch tasks
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

        const assignedTeam = item.team ? { id: item.teamId, teamName: item.team.teamName } : null;

        return {
          id: item.id,
          title: item.title,
          description: item.description,
          assignedTo: assignedStaff,
          dueDate: item.date?.split("T")[0] || "",
          priority: item.priority?.charAt(0).toUpperCase() + item.priority?.slice(1) || "Medium",
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
    if (!formTask.description.trim()) tempErrors.description = "Description is required";
    if (!formTask.assignedTo?.name) tempErrors.assignedTo = "Assigned user is required";
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
      // Logic for teamId is slightly complex based on your original code's interpretation.
      // Assuming if a user is 'Admin' they may be assigning to a team, but if it's a specific user, team is secondary/not needed in payload.
      // Retaining your original logic: If assignedTo is Admin, send teamId. Otherwise, your API might handle the assignment via assignedEmail/Name.
      teamId: formTask.assignedTo?.name === "Admin" ? formTask.team?.id || null : null,
    };

    try {
      showLoadingSwal(editTask ? "Updating..." : "Creating...");

      if (editTask) {
        await axios.put("/work/assign/update", { params: { id: editTask.id, ...payload } });
        setTasks(
          tasks.map((t) => (t.id === editTask.id ? { ...formTask, id: editTask.id } : t))
        );
        Swal.close();
        Swal.fire("Updated! 🎉", "Task has been updated.", "success");
      } else {
        // NOTE: The ID here is temporary. In a real-world scenario, you'd get the actual ID from the API response.
        const response = await axios.post("/work/assign/create", { params: payload });
        // The API response should ideally contain the full, newly created task object.
        // For demonstration, we'll construct a mock new task until the actual response structure is known.
        const newTask = { 
            ...formTask, 
            id: response.data?.newId || Date.now().toString(), // Use actual ID if available
            // Recalculate assignedTo and team for state consistency based on formTask
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

          // Using a simple template literal for the DELETE endpoint as per standard REST conventions
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

  // Function to determine the column header color
  const getStageHeaderClasses = (stage) => {
    switch (stage) {
      case "Pending":
        return "bg-gray-700";
      case "Progress":
        return "bg-blue-700";
      case "Completed":
        return "bg-green-700";
      default:
        return "bg-gray-700";
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-lg">
        <h3 className="text-3xl font-bold text-gray-900">Advanced Task Manager</h3>
        <button
          onClick={() => openModal()}
          className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold shadow-lg transition duration-200 ease-in-out transform hover:scale-[1.02]"
        >
          + New Task
        </button>
      </header>
      {/* --- */}

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {statusStages.map((stage) => (
          <div key={stage} className="bg-gray-50 rounded-xl shadow-xl flex flex-col">
            {/* Stage Header */}
            <div className={`p-4 rounded-t-xl ${getStageHeaderClasses(stage)}`}>
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">{stage}</h2>
              <span className="text-sm text-gray-200">
                ({tasks.filter((t) => t.status === stage).length} tasks)
              </span>
            </div>
            
            {/* Task List */}
            <div className="p-4 space-y-4 flex-grow min-h-[100px] overflow-y-auto">
              {tasks
                .filter((t) => t.status === stage)
                .sort((a, b) => {
                  // Optional: Sort by Priority (High > Medium > Low) or Due Date
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
                  <div className="text-center p-8 text-gray-500 italic bg-white rounded-lg border-2 border-dashed border-gray-300">
                      No tasks in this stage.
                  </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {/* --- */}

      {/* Modal (Improved Styling) */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-xl shadow-2xl transform transition-all overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold">{editTask ? "Edit Task" : "Create New Task"}</h2>
              <X className="cursor-pointer w-6 h-6 hover:text-indigo-200" onClick={() => setModalOpen(false)} />
            </div>

            {/* Scrollable Body (Form) */}
            <div className="p-6 space-y-5 overflow-y-auto flex-grow">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  className={`border ${errors.title ? 'border-red-500' : 'border-gray-300'} p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150`}
                  placeholder="Task Title"
                  value={formTask.title}
                  onChange={(e) => {
                    setFormTask({ ...formTask, title: e.target.value });
                    setErrors({ ...errors, title: "" });
                  }}
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className={`border ${errors.description ? 'border-red-500' : 'border-gray-300'} p-3 h-[100px] rounded-lg w-full resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150`}
                  placeholder="Task Description"
                  value={formTask.description}
                  onChange={(e) => {
                    setFormTask({ ...formTask, description: e.target.value });
                    setErrors({ ...errors, description: "" });
                  }}
                  rows={4}
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              {/* Grid for smaller fields (Assigned To, Due Date, Priority, Status, Team) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Assigned User */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                    <select
                        className={`border ${errors.assignedTo ? 'border-red-500' : 'border-gray-300'} p-3 rounded-lg w-full bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150`}
                        value={formTask.assignedTo?.name || ""}
                        onChange={(e) => {
                            const user = allUsers.find((u) => u.name === e.target.value);
                            setFormTask({ ...formTask, assignedTo: user });
                            setErrors({ ...errors, assignedTo: "" });
                        }}
                    >
                        {allUsers.map((user) => (
                            <option key={user.name} value={user.name}>
                                {user.name} {user.email ? `(${user.email})` : ''}
                            </option>
                        ))}
                    </select>
                    {errors.assignedTo && <p className="text-red-500 text-sm mt-1">{errors.assignedTo}</p>}
                </div>
                
                {/* Due Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <input
                        type="date"
                        className={`border ${errors.dueDate ? 'border-red-500' : 'border-gray-300'} p-3 rounded-lg w-full bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150`}
                        value={formTask.dueDate}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => {
                            setFormTask({ ...formTask, dueDate: e.target.value });
                            setErrors({ ...errors, dueDate: "" });
                        }}
                    />
                    {errors.dueDate && <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>}
                </div>

                {/* Priority */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                        className={`border ${errors.priority ? 'border-red-500' : 'border-gray-300'} p-3 rounded-lg w-full bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150`}
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
                    {errors.priority && <p className="text-red-500 text-sm mt-1">{errors.priority}</p>}
                </div>
                
                {/* Status */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                        className="border border-gray-300 p-3 rounded-lg w-full bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150"
                        value={formTask.status}
                        onChange={(e) => setFormTask({ ...formTask, status: e.target.value })}
                    >
                        <option value="Pending">Pending</option>
                        <option value="Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>
                
                {/* Team (Full width) */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Team (Optional)</label>
                    <select
                        className="border border-gray-300 p-3 rounded-lg w-full bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150"
                        value={formTask.team?.id || ""}
                        onChange={(e) => {
                            const selectedTeam = teams.find((t) => t.id === parseInt(e.target.value));
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
              </div>

              {noChangeMessage && <p className="text-amber-600 text-sm p-2 bg-amber-50 rounded-lg border border-amber-300">{noChangeMessage}</p>}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  onClick={handleSaveTask}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50"
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