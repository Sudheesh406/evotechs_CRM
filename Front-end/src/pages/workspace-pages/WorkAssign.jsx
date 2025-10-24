import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Edit2, Trash2, X } from "lucide-react";
import axios from "../../instance/Axios";

const statusStages = ["Pending", "Progress", "Completed"];
const priorities = {
  High: "bg-red-200 text-red-800",
  Medium: "bg-yellow-200 text-yellow-800",
  Low: "bg-green-200 text-green-800",
};

export default function WorkAssign() {
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

  // State to track Read More per task
  const [showMoreMap, setShowMoreMap] = useState({});

  // Fetch staff and teams
  const fetchUserDetails = async () => {
    try {
      Swal.fire({
        title: "Loading details...",
        didOpen: () => Swal.showLoading(),
        allowOutsideClick: false,
      });

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
      console.log("Error fetching work details:", error);
      Swal.fire("Error", "Failed to get work details", "error");
    }
  };


      console.log('testing')


  // Fetch tasks
  const fetchWorkDetails = async () => {
    try {
      Swal.fire({
        title: "Loading tasks...",
        didOpen: () => Swal.showLoading(),
        allowOutsideClick: false,
      });

      const response = await axios.get("/work/assign/work_details");
      console.log('response',response)
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
            item.priority?.charAt(0).toUpperCase() + item.priority?.slice(1) ||
            "Medium",
          status: item.workUpdate || "Pending",
          team: assignedTeam,
        };
      });

      setTasks(apiTasks);
      Swal.close();
    } catch (error) {
      Swal.close();
      console.log("Error fetching tasks:", error);
      Swal.fire("Error", "Failed to fetch tasks", "error");
    }
  };

  useEffect(() => {
    (async () => {
      await fetchUserDetails();
      await fetchWorkDetails();
    })();
  }, []);

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
        formTask.assignedTo?.name === "Admin"
          ? null
          : formTask.team?.id || null,
    };

    try {
      Swal.fire({
        title: editTask ? "Updating..." : "Creating...",
        didOpen: () => Swal.showLoading(),
        allowOutsideClick: false,
      });

      if (editTask) {
        await axios.put("/work/assign/update", {
          params: { id: editTask.id, ...payload },
        });

        setTasks(
          tasks.map((t) =>
            t.id === editTask.id
              ? { ...formTask, id: editTask.id } // Keep the same id
              : t
          )
        );

        Swal.close();
        Swal.fire("Updated!", "Task has been updated.", "success");
      } else {
        await axios.post("/work/assign/create", { params: payload });
        const newTask = { ...formTask, id: Date.now().toString() }; // Only for new tasks
        setTasks([...tasks, newTask]);
        Swal.close();
        Swal.fire("Created!", "Task has been created.", "success");
      }

      setModalOpen(false);
    } catch (error) {
      Swal.close();
      console.log("Error saving task:", error);
      Swal.fire("Error", "Failed to save task", "error");
    }
  };

  return (
    <div className="p-6 bg-gray-50 ">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-semibold text-gray-800">Team Tasks</h3>
        <button
          onClick={() => openModal()}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-semibold"
        >
          + New Task
        </button>
      </div>

      {/* Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statusStages.map((stage) => (
          <div
            key={stage}
            className="bg-white rounded-xl p-4 shadow-md min-h-[300px]"
          >
            <h2 className="text-xl font-semibold mb-4">{stage}</h2>
            {tasks
              .filter((t) => t.status === stage)
              .map((task) => {
                const isExpanded = showMoreMap[task.id] || false;

                return (
                  <div
                    key={task.id}
                    className="bg-gray-50 rounded-lg p-4 mb-3 shadow hover:shadow-lg transition relative"
                  >
                    <div className="flex flex-wrap gap-2 mt-2">
                      {task.assignedTo?.name === "Admin" && (
                        <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-sm font-semibold">
                          Admin
                        </span>
                      )}
                      {task.team && task.assignedTo?.name === "Admin" && (
                        <span className="bg-orange-200 text-orange-800 px-2 py-1 rounded text-sm font-semibold">
                          Team: {task.team.teamName}
                        </span>
                      )}
                      {task.assignedTo?.name &&
                        task.assignedTo?.name !== "Admin" && (
                          <span className="bg-red-200 text-red-800 px-2 py-1 rounded text-sm font-semibold">
                            Assigned to: {task.assignedTo.name} (
                            {task.assignedTo.email})
                          </span>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                      <span
                        className={`px-2 py-1 rounded text-sm font-semibold ${
                          priorities[task.priority]
                        }`}
                      >
                        {task.priority}
                      </span>
                      <span className="text-sm text-gray-500">
                        Due: {task.dueDate}
                      </span>
                    </div>

                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-gray-700">
                        {task.title}
                      </h3>
                      <div className="flex gap-2"></div>
                    </div>

                    {/* Description with Read More */}
                    <p className="text-sm text-gray-600 mt-1">
                      {task.description.length <= 100
                        ? task.description
                        : isExpanded
                        ? task.description
                        : task.description.slice(0, 100) + "..."}
                    </p>
                    {task.description.length > 100 && (
                      <button
                        onClick={() =>
                          setShowMoreMap({
                            ...showMoreMap,
                            [task.id]: !isExpanded,
                          })
                        }
                        className="text-blue-500 text-sm mt-1 font-semibold hover:underline"
                      >
                        {isExpanded ? "Show Less" : "Read More"}
                      </button>
                    )}
                  </div>
                );
              })}
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 backdrop-blur-[1px] bg-black/30 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                {editTask ? "Edit Task" : "New Task"}
              </h2>
              <X
                className="cursor-pointer w-5 h-5 hover:text-gray-200"
                onClick={() => setModalOpen(false)}
              />
            </div>

            {/* Scrollable Body */}
            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Title */}
              <div>
                <input
                  className="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Task Title"
                  value={formTask.title}
                  onChange={(e) => {
                    setFormTask({ ...formTask, title: e.target.value });
                    setErrors({ ...errors, title: "" });
                  }}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <textarea
                  className="border border-gray-300 p-3 h-[130px] rounded-lg w-full resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Task Description"
                  value={formTask.description}
                  onChange={(e) => {
                    setFormTask({ ...formTask, description: e.target.value });
                    setErrors({ ...errors, description: "" });
                  }}
                  rows={4}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Assigned User */}
              <div>
                <select
                  className="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
                {errors.assignedTo && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.assignedTo}
                  </p>
                )}
              </div>

              {/* Team */}
              <div>
                <select
                  className="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
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

              {/* Due Date */}
              <div>
                <input
                  type="date"
                  className="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={formTask.dueDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    setFormTask({ ...formTask, dueDate: e.target.value });
                    setErrors({ ...errors, dueDate: "" });
                  }}
                />
                {errors.dueDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <select
                  className="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
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

              {/* Priority */}
              <div>
                <select
                  className="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                  <p className="text-red-500 text-sm mt-1">{errors.priority}</p>
                )}
              </div>

              {noChangeMessage && (
                <p className="text-yellow-600 text-sm">{noChangeMessage}</p>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSaveTask}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-200"
              >
                {editTask ? "Update Task" : "Create Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
