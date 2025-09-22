import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import axios from "../../instance/Axios";
import Swal from "sweetalert2";

const TaskColumn = ({
  status,
  cards,
  onCardClick,
  activeCardId,
  toggleMenu,
}) => {
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !e.target.closest(".three-dot-btn")
      ) {
        toggleMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [toggleMenu]);

  return (
    <div className="bg-[#e9f5f7] rounded-md p-3 flex flex-col">
      <h2 className="text-md font-semibold mb-3 flex justify-between">
        {status} <span className="text-gray-600">{cards.length}</span>
      </h2>

      <div className="space-y-3 overflow-y-auto flex-1 pr-2 max-h-[70vh]">
        {cards.length > 0 ? (
          cards.map((task) => (
            <div
              key={task.id}
              className="bg-white shadow rounded-md p-3 text-sm hover:shadow-md transition cursor-pointer"
            >
              <div className="w-full flex justify-between relative">
                <h3 className="text-lg font-semibold truncate text-gray-800">
                  {task?.customer?.name}
                </h3>

                {/* Toggle dropdown */}
                <button
                  className="three-dot-btn px-3"
                  onClick={() =>
                    toggleMenu(activeCardId === task.id ? null : task.id)
                  }
                >
                  &#8942;
                </button>

                {activeCardId === task.id && (
                  <div
                    ref={dropdownRef} // 👈 fixed: ref only on dropdown
                    className="absolute right-3 top-8 bg-white shadow-md rounded-md border z-10 w-32"
                  >
                    <button
                      className="w-full text-left px-3 py-2 hover:bg-gray-100"
                      onClick={() => onCardClick(task, "taskUpdate")}
                    >
                      Stage
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 hover:bg-gray-100"
                      onClick={() => onCardClick(task, "view")}
                    >
                      View
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 hover:bg-gray-100"
                      onClick={() => onCardClick(task, "edit")}
                    >
                      Edit
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 text-red-600"
                      onClick={() => onCardClick(task, "delete")}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {task.requirement && (
                <p className="text-gray-700 text-sm">
                  <span className="font-medium">Requirement:</span>{" "}
                  {task.requirement}
                </p>
              )}
              {task.description && (
                <p className="text-gray-500 text-sm line-clamp-2">
                  <span className="font-medium">Description:</span>{" "}
                  {task.description}
                </p>
              )}

              {task?.customer?.amount && (
                <p className="text-gray-600 text-sm">
                  <span className="font-medium">Amount:</span> $
                  {task?.customer?.amount}
                </p>
              )}

              <p className="text-gray-700 text-sm">
                <span className="font-medium">Stage:</span> {task.stage}
              </p>

              {task.finishBy && (
                <p className="text-gray-700 text-sm">
                  <span className="font-medium">Finish By:</span>{" "}
                  {task.finishBy}
                </p>
              )}

              <p
                className={`text-sm font-semibold ${
                  task.priority === "High"
                    ? "text-red-600"
                    : task.priority === "Normal"
                    ? "text-blue-600"
                    : "text-green-600"
                }`}
              >
                Priority: {task.priority}
              </p>

              {task.phone && (
                <p className="text-gray-600 text-sm">
                  <span className="font-medium">Phone:</span> {task.phone}
                </p>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-10">No Tasks found.</p>
        )}
      </div>
    </div>
  );
};

const Task = () => {
  const navigate = useNavigate();
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

  const handleCardClick = (task, execute) => {
    if (execute === "view") {
      const data = { taskId: task.id, contactId: task.contactId };
      const dataToSend = encodeURIComponent(JSON.stringify({ data }));
      navigate(`/activities/tasks/person/${dataToSend}`);
      setActiveCardId(null);
    } else if (execute === "edit") {
      setFormData({ ...task, id: task.id });
      setIsEditing(true);
      setShowForm(true);
      setOriginalData({ ...task });
      setActiveCardId(null); // close dropdown on edit
    } else if (execute === "delete") {
      handleDelete(task.id);
      setActiveCardId(null);
    } else if ((execute === "taskUpdate", task)) {
      setStage(task.stage);
      setTaskById(task.id);
      setActiveCardId(null);
      setStageModal(true);
    }
  };

  const handleDelete = async (taskId) => {
    // ask for confirmation first
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the task!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        // show loading while deleting
        Swal.fire({
          title: "Deleting...",
          text: "Please wait while we delete the task.",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        // API call
        await axios.delete(`/task/delete/${taskId}`);

        // close loading and show success
        Swal.close();
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "The task has been deleted successfully.",
          confirmButtonText: "OK",
          showConfirmButton: false,
        }).then(() => {
          fetchTasks();
        });

        // refresh tasks
      } catch (error) {
        console.error("Error deleting task:", error);

        // close loading and show error
        Swal.close();
        Swal.fire({
          icon: "error",
          title: "Failed!",
          text: "Could not delete the task. Please try again later.",
        });
      }
    }
  };

  const handleTaskUpdate = async (data, difference) => {
    if (difference == true) {
      setStage(Number(stage) + 1);
    } else if (difference == false) {
      setStage(Number(stage) - 1);
    }
    try {
      // Send only the fields you want to update
      const response = await axios.patch(`/task/taskUpdate/${taskById}`, {
        data,
      });
      console.log("Task updated:", response.data);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed!",
        text: "Could not update the task. Please try again later.",
        confirmButtonText: "OK",
      });
      console.error("Error updating task:", error);
    }
  };

  const fetchRequirements = async () => {
    try {
      // show loading alert
      Swal.fire({
        title: "Loading...",
        text: "Getting requirements, please wait.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      const response = await axios.get("/requirement/get");

      setRequirements(response.data.data || []);
      // close loading & show success
      Swal.close();
    } catch (error) {
      console.error("Error getting requirements:", error);
      // close loading & show error
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Failed to Fetch",
        text: "There was an error getting the requirements. Please try again later.",
      });
    }
  };


const fetchTasks = async () => {
  try {
    // show loading alert
    Swal.fire({
      title: 'Loading Tasks...',
      text: 'Please wait while we getting the tasks.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const response = await axios.get('/task/get');
    const fetchedTasks = response.data.data || [];
    console.log('Fetched Tasks:', fetchedTasks);

    const mappedTasks = {
      'Not Started': [],
      'In Progress': [],
      Completed: [],
    };

    fetchedTasks.forEach((task) => {
      if (task.stage === '1') mappedTasks['Not Started'].push(task);
      else if (task.stage === '2' || task.stage === '3')
        mappedTasks['In Progress'].push(task);
      else if (task.stage === '4') mappedTasks['Completed'].push(task);
    });

    setTasksByStage(mappedTasks);

    // close loading and show success with OK button
    Swal.close();
   
  } catch (error) {
    console.error('Error fetching tasks:', error);

    // close loading and show error
    Swal.close();
    Swal.fire({
      icon: 'error',
      title: 'Failed!',
      text: 'Could not get tasks. Please try again later.',
      confirmButtonText: 'OK',
    });
  }
};


  useEffect(() => {
    fetchRequirements();
    fetchTasks();
  }, []);

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
    let newErrors = {};
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
      // SweetAlert instead of alert
      await Swal.fire({
        icon: 'warning',
        title: 'No Changes Detected',
        text: 'You have not made any changes to the form.',
        confirmButtonText: 'OK',
      });
      return;
    }
  }

  try {
    // Show loading spinner while saving
    Swal.fire({
      title: isEditing ? 'Updating Task...' : 'Creating Task...',
      text: 'Please wait while we save the task.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    if (isEditing && formData.id) {
      await axios.put(`/task/edit/${formData.id}`, formData);
    } else {
      await axios.post('/task/create', formData);
    }

    // Close loading and show success with OK button
    Swal.close();
    await Swal.fire({
      icon: 'success',
      title: isEditing ? 'Task Updated!' : 'Task Created!',
      text: isEditing
        ? 'The task has been updated successfully.'
        : 'The task has been created successfully.',
      confirmButtonText: 'OK',
    });

    closeForm();
    setActiveCardId(null); // ensure dropdown closed
    fetchTasks();
  } catch (error) {
    console.error('Error saving task:', error);

    // Close loading and show error
    Swal.close();
    Swal.fire({
      icon: 'error',
      title: 'Failed!',
      text: 'Could not save the task. Please try again later.',
      confirmButtonText: 'OK',
    });
  }
};


  return (
    <div className="p-6 bg-gray-100 min-h-[680px]">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">Tasks</h1>
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded-md"
          onClick={openForm}
        >
          Create Task
        </button>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Modal form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={closeForm}
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-semibold mb-4">
              {isEditing ? "Edit Task" : "Create Task"}
            </h2>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {/* Requirement */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1">
                  Requirement
                </label>
                <select
                  name="requirement"
                  value={formData.requirement}
                  onChange={handleChange}
                  className={`w-full border rounded px-3 py-2 ${
                    errors.requirement ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">-- Select Requirement --</option>
                  {requirements.map((req) => (
                    <option key={req.id} value={req.project}>
                      {req.project}
                    </option>
                  ))}
                </select>
                {errors.requirement && (
                  <p className="text-red-500 text-sm">{errors.requirement}</p>
                )}
              </div>

              {/* Phone */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full border rounded px-3 py-2 ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm">{errors.phone}</p>
                )}
              </div>

              {/* Finish By */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1">
                  Finish By
                </label>
                <input
                  type="date"
                  name="finishBy"
                  value={formData.finishBy}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  className={`w-full border rounded px-3 py-2 ${
                    errors.finishBy ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.finishBy && (
                  <p className="text-red-500 text-sm">{errors.finishBy}</p>
                )}
              </div>

              {/* Priority */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 border-gray-300"
                >
                  <option value="High">High</option>
                  <option value="Normal">Normal</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              {/* Notes */}
              <div className="flex flex-col md:col-span-2">
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full border rounded px-3 py-2 resize-none ${
                    errors.notes ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.notes && (
                  <p className="text-red-500 text-sm">{errors.notes}</p>
                )}
              </div>

              {/* Description */}
              <div className="flex flex-col md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full border rounded px-3 py-2 resize-none ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm">{errors.description}</p>
                )}
              </div>

              {/* Submit */}
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  {isEditing ? "Update" : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Stage Modal */}
      {stageModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
            {/* Close Button */}
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => fetchTasks() && setStageModal(false)}
            >
              <X size={20} />
            </button>

            {/* Title */}
            <h2 className="text-xl font-semibold mb-6">Update Stage</h2>

            {/* Stage Circles */}
            <div className="mt-4 mb-6 flex justify-between">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`w-10 h-10 flex items-center justify-center rounded-full font-bold ${
                    Number(stage) === s
                      ? "bg-blue-500 text-white" // current stage
                      : s < Number(stage)
                      ? "bg-gray-300 text-gray-600" // previous stages
                      : "bg-gray-100 text-gray-400" // future stages
                  }`}
                >
                  {s}
                </div>
              ))}
            </div>

            {/* Current Stage */}
            <p className="text-gray-700 text-xl mb-4">
              Current stage: <span className="font-bold">{stage}</span>
            </p>

            {/* Stage Controls */}
            <div className="flex justify-between">
              {/* Previous Stage Button */}
              {stage > 1 ? (
                <button
                  className="px-6 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
                  onClick={() => handleTaskUpdate(Number(stage) - 1, false)}
                >
                  Move to Stage {Number(stage) - 1}
                </button>
              ) : (
                <div></div>
              )}

              {/* Next Stage Button */}
              {stage < 4 ? (
                <button
                  className="px-6 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
                  onClick={() => handleTaskUpdate(Number(stage) + 1, true)}
                >
                  Move to Stage {Number(stage) + 1}
                </button>
              ) : (
                <p className="text-green-600 font-semibold">
                  This is the final stage.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Task;
