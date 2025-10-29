import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../instance/Axios";
import Swal from "sweetalert2";
import {
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Layers,
  RefreshCw,
  UserCircle,
} from "lucide-react";

import TaskModal from "../../components/modals/TaskModal";
import StageModal from "../../components/modals/StageModal";

const TaskStatusDetail = () => {
  const { data } = useParams();
  const navigate = useNavigate();

  // States
  const [tasks, setTasks] = useState([]);
  const [activeCardId, setActiveCardId] = useState(null);
  const [stageModal, setStageModal] = useState(false);
  const [stage, setStage] = useState(null);
  const [taskById, setTaskById] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    requirement: "",
    phone: "",
    notes: "",
    description: "",
    finishBy: "",
    priority: "Normal",
  });
  const [originalData, setOriginalData] = useState({});
  const [errors, setErrors] = useState({});
  const [requirements, setRequirements] = useState([]);

  // -------------------- Fetch --------------------
  const fetchRequirements = async () => {
    try {
      const res = await axios.get("/requirement/get");
      setRequirements(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTasks = async () => {
    try {
      Swal.fire({
        title: "Loading Tasks...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await axios.get(`/task/get/${data}`);
      console.log("res", res);
      const fetchedTasks = res.data.data || [];
      setTasks(fetchedTasks);

      Swal.close();
    } catch (err) {
      console.error(err);

      // If 404 (No Data Found)
      if (err.response && err.response.status === 404) {
        Swal.fire({
          icon: "info",
          title: "No Data Found",
          text: "No tasks available right now.",
          confirmButtonText: "Go to Tasks",
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/activities/tasks");
          }
        });
      } else {
        // Other errors
        Swal.fire({
          icon: "error",
          title: "Failed!",
          text: "Could not fetch tasks.",
          confirmButtonText: "Retry",
        });
      }
    }
  };

  useEffect(() => {
    fetchRequirements();
    fetchTasks();
  }, [data]);

  // -------------------- Handlers --------------------
  const handleCardClick = (task, action) => {
    if (action === "edit") {
      setFormData({ ...task, id: task.id });
      setOriginalData({ ...task });
      setIsEditing(true);
      setShowForm(true);
      setActiveCardId(null);
    } else if (action === "delete") {
      handleDelete(task.id);
      setActiveCardId(null);
    } else if (action === "taskUpdate") {
      setTaskById(task.id);
      setStage(task.stage);
      setStageModal(true);
      setActiveCardId(null);
    } else if (action === "subtask") {
      navigate(`/activities/tasks/subtask/${task.id}`);
      setActiveCardId(null);
    } else if (action === "view") {
      navigate(
        `/activities/tasks/person/${encodeURIComponent(
          JSON.stringify({
            data: { taskId: task.id, contactId: task.contactId },
          })
        )}`
      );
      setActiveCardId(null);
    }
  };

  const handleDelete = async (taskId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the task!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/task/delete/${taskId}`);
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "The task has been deleted successfully.",
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          fetchTasks();
        });
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Failed!",
          text: "Could not delete task.",
        });
      }
    }
  };

  const handleTaskUpdate = async (data, difference) => {
    setStage(difference ? Number(stage) + 1 : Number(stage) - 1);
    try {
      await axios.patch(`/task/taskUpdate/${taskById}`, { data });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Failed!",
        text: "Could not update task.",
      });
    }
  };

  const openForm = () => {
    setFormData({
      requirement: "",
      phone: "",
      notes: "",
      description: "",
      finishBy: "",
      priority: "Normal",
    });
    setErrors({});
    setIsEditing(false);
    setShowForm(true);
    setActiveCardId(null);
  };

  const closeForm = () => {
    setShowForm(false);
    setActiveCardId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.notes.trim()) newErrors.notes = "Notes are required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.finishBy) newErrors.finishBy = "Finish By date is required";
    if (!formData.requirement.trim())
      newErrors.requirement = "Requirement is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (isEditing) {
      const hasChanged = Object.keys(formData).some(
        (key) => formData[key] !== originalData[key]
      );
      if (!hasChanged) {
        await Swal.fire({ icon: "warning", title: "No Changes Detected" });
        return;
      }
    }

    try {
      if (isEditing && formData.id)
        await axios.put(`/task/edit/${formData.id}`, formData);
      else await axios.post("/task/create", formData);

      Swal.fire({
        icon: "success",
        title: isEditing ? "Task Updated!" : "Task Created!",
      });
      closeForm();
      fetchTasks();
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Failed!",
        text: "Could not save task.",
      });
    }
  };

  // --- Helper component for a single detail row ---
  const DetailRow = ({
    label,
    value,
    valueClass = "font-medium text-gray-900",
  }) => (
    <div className="flex justify-between py-2 border-b border-gray-100">
      <span className="text-gray-500">{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-indigo-600 text-xl font-bold">{data}</h1>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors flex items-center gap-2"
        >
          {/* Optional: Back Arrow Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M7.707 14.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L4.414 9H18a1 1 0 110 2H4.414l3.293 3.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back
        </button>
      </div>

      {/* Task Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => {
          // Determine the display name
          const displayName = task.customer?.name || "Unnamed Task";
          // Get first letter for avatar
          const firstLetter = displayName.charAt(0).toUpperCase();

          return (
            <div
              key={task.id}
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 relative"
            >
              {/* Three-dot menu */}
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={() =>
                    setActiveCardId(activeCardId === task.id ? null : task.id)
                  }
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  aria-expanded={activeCardId === task.id}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
                {activeCardId === task.id && (
                  <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 overflow-hidden animate-fadeIn">
                    <button
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 transition"
                      onClick={() => handleCardClick(task, "edit")}
                    >
                      <Edit size={16} className="text-gray-700" /> Edit
                    </button>

                    <button
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 transition"
                      onClick={() => handleCardClick(task, "taskUpdate")}
                    >
                      <RefreshCw size={16} className="text-gray-700" /> Stage
                      Update
                    </button>
                    <button
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 transition"
                      onClick={() => handleCardClick(task, "view")}
                    >
                      <Eye size={16} className="text-gray-700" /> View Details
                    </button>

                    <button
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 transition"
                      onClick={() => handleCardClick(task, "subtask")}
                    >
                      <Layers size={16} className="text-yellow-600" /> Subtask
                    </button>

                    <button
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition rounded-b-2xl"
                      onClick={() => handleCardClick(task, "delete")}
                    >
                      <Trash2 size={16} className="text-red-600" /> Delete
                    </button>
                  </div>
                )}
              </div>

              {/* Header/Customer Info */}
              <div className="flex items-center pb-4 mb-4 border-b border-gray-200">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xl mr-4 border border-green-300">
                  {firstLetter}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 leading-tight">
                    {displayName}
                  </h3>
                  <p className="text-gray-500 text-sm mt-0.5">
                    {task.notes || "No notes"}
                  </p>
                </div>
              </div>

              {/* Task Details */}
              <div className="text-sm space-y-2">
                {/* <DetailRow label="Stage" value={task.stage} /> */}
                <DetailRow label="Finish By" value={task.finishBy} />
                <DetailRow
                  label="Amount"
                  value={task.customer?.amount || "-"}
                />
                <DetailRow label="Phone" value={task.phone || "-"} />

                {/* Priority Row with dynamic styling */}
                <DetailRow
                  label="Priority"
                  value={task.priority || "-"}
                  valueClass={`font-medium ${
                    task.priority === "High"
                      ? "text-red-600"
                      : task.priority === "Medium"
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                />
              </div>

              {/* Description Section */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <span className="block text-gray-500 mb-1">Description:</span>
                <p className="text-gray-700 text-sm">
                  {task.description || "N/A"}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      <TaskModal
        showForm={showForm}
        closeForm={closeForm}
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        errors={errors}
        requirements={requirements}
        isEditing={isEditing}
      />
      <StageModal
        stageModal={stageModal}
        setStageModal={setStageModal}
        stage={stage}
        handleTaskUpdate={handleTaskUpdate}
        fetchTasks={fetchTasks}
      />
    </div>
  );
};

export default TaskStatusDetail;
