import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../instance/Axios";
import Swal from "sweetalert2";

import TaskModal from "../../components/modals/TaskModal";
import StageModal from "../../components/modals/StageModal";
import TaskColumn from "../../components/TaskColumn";

const Task = () => {
  const navigate = useNavigate();

  // State
  const [originalData, setOriginalData] = useState({});
  const [activeCardId, setActiveCardId] = useState(null);
  const [stage, setStage] = useState(1);
  const [taskById, setTaskById] = useState(null);
  const [tasksByStage, setTasksByStage] = useState({
    "Not Started": [],
    "In Progress": [],
    Completed: [],
  });
  const [stageModal, setStageModal] = useState(false);
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
  const [errors, setErrors] = useState({});
  const [requirements, setRequirements] = useState([]);

  // -------------------- Fetch & Handlers --------------------
  const fetchRequirements = async () => {
    try {
      Swal.fire({
        title: "Loading Requirements...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await axios.get("/requirement/get");
      setRequirements(res.data.data || []);
      Swal.close();
    } catch (err) {
      console.error(err);
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Failed!",
        text: "Could not fetch requirements.",
      });
    }
  };

  const fetchTasks = async () => {
    try {
      Swal.fire({
        title: "Loading Tasks...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await axios.get("/task/get");
      const fetchedTasks = res.data.data || [];

      const mappedTasks = { "Not Started": [], "In Progress": [], Completed: [] };
      fetchedTasks.forEach((task) => {
        if (task.stage === "1") mappedTasks["Not Started"].push(task);
        else if (task.stage === "2" || task.stage === "3") mappedTasks["In Progress"].push(task);
        else if (task.stage === "4") mappedTasks["Completed"].push(task);
      });

      setTasksByStage(mappedTasks);
      Swal.close();
    } catch (err) {
      console.error(err);
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Failed!",
        text: "Could not fetch tasks.",
      });
    }
  };

  const handleCardClick = (task, action) => {
    if (action === "view") {
      navigate(`/activities/tasks/person/${encodeURIComponent(JSON.stringify({ data: { taskId: task.id, contactId: task.contactId } }))}`);
      setActiveCardId(null);
    } else if (action === "edit") {
      setFormData({ ...task, id: task.id });
      setIsEditing(true);
      setShowForm(true);
      setOriginalData({ ...task });
      setActiveCardId(null);
    } else if (action === "delete") {
      handleDelete(task.id);
      setActiveCardId(null);
    } else if (action === "taskUpdate") {
      setStage(task.stage);
      setTaskById(task.id);
      setStageModal(true);
      setActiveCardId(null);
    }else if(action==="subtask"){
      navigate(`/activities/tasks/subtask/${task.id}`);
      setActiveCardId(null);
    }else if(action==="Reveal"){
      navigate(`/activities/tasks/status/${task}`);
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
        Swal.fire({ title: "Deleting...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        await axios.delete(`/task/delete/${taskId}`);
        Swal.close();
        Swal.fire({ icon: "success", title: "Deleted!", showConfirmButton: false });
        fetchTasks();
      } catch (err) {
        console.error(err);
        Swal.close();
        Swal.fire({ icon: "error", title: "Failed!", text: "Could not delete task." });
      }
    }
  };

  const handleTaskUpdate = async (data, difference) => {
    setStage(difference ? Number(stage) + 1 : Number(stage) - 1);
    try {
      await axios.patch(`/task/taskUpdate/${taskById}`, { data });
      fetchTasks();
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Failed!", text: "Could not update task." });
    }
  };

  useEffect(() => {
    fetchRequirements();
    fetchTasks();
  }, []);

  // -------------------- Form Handlers --------------------
  const openForm = () => {
    setFormData({ requirement: "", phone: "", notes: "", description: "", finishBy: "", priority: "Normal" });
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
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.finishBy) newErrors.finishBy = "Finish By date is required";
    if (!formData.requirement.trim()) newErrors.requirement = "Requirement is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (isEditing) {
      const hasChanged = Object.keys(formData).some((key) => formData[key] !== originalData[key]);
      if (!hasChanged) {
        await Swal.fire({ icon: "warning", title: "No Changes Detected", confirmButtonText: "OK" });
        return;
      }
    }

    try {
      Swal.fire({ title: isEditing ? "Updating Task..." : "Creating Task...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });

      if (isEditing && formData.id) await axios.put(`/task/edit/${formData.id}`, formData);
      else await axios.post("/task/create", formData);

      Swal.close();
      await Swal.fire({ icon: "success", title: isEditing ? "Task Updated!" : "Task Created!", confirmButtonText: "OK" });
      closeForm();
      fetchTasks();
    } catch (err) {
      console.error(err);
      Swal.close();
      Swal.fire({ icon: "error", title: "Failed!", text: "Could not save task." });
    }
  };

  return (
    <div className="p-6 bg-gray-100 ">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">Tasks</h1>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-md" onClick={openForm}>
          Create Task
        </button>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(tasksByStage).map(([status, cards]) => (
          <TaskColumn
            key={status}
            status={status}
            cards={cards}
            onCardClick={handleCardClick}
            activeCardId={activeCardId}
            toggleMenu={setActiveCardId}
          />
        ))}
      </div>

      {/* Task Form Modal */}
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

      {/* Stage Modal */}
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

export default Task;
