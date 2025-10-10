import React, { useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { X, Plus, Trash, Edit, CheckSquare, List } from "lucide-react";
import axios from "../../instance/Axios";

// --- TaskFormModal Component ---
/**
 */
function TaskFormModal({ show, onClose, onSubmit, initialTask ,taskId}) {
  const isEditing = !!initialTask;
  const [title, setTitle] = useState(initialTask?.title || "");
  const [details, setDetails] = useState(
    initialTask?.details.length > 0 ? initialTask.details : [""]
  );

  const handleDetailChange = (index, value) => {
    const updated = [...details];
    updated[index] = value;
    setDetails(updated);
  };

  const addDetail = () => {
    setDetails((prev) => [...prev, ""]);
  };

  const removeDetail = (index) => {
    setDetails((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    // Filter out empty detail strings before submitting

    const newId = initialTask?.id || Date.now();
    const cleanedTitle = title.trim();
    const cleanedDetails = details.filter((d) => d.trim() !== "");

    const newTask = {
      title: cleanedTitle,
      details: cleanedDetails,
      taskId: taskId,
    };

    createSubTask(newTask);
    onClose();
  };

  const createSubTask = async (data) => {
    console.log("createSubTask called with:",  data );
    try {
      const response = await axios.post("/sub-task/create", {data});
      console.log('response :',response)
    } catch (error) {
      console.log("error found in create sub task", error);
    }
  };

  // Reset state when the modal closes
  const handleClose = () => {
    setTitle("");
    setDetails([""]);
    onClose();
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-lg p-6 relative shadow-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 opacity-100"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
          onClick={handleClose}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
          {isEditing ? "Edit Sub-Task" : "New Sub-Task"}
        </h2>

        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Finalize Report"
          className="w-full border border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg p-3 mb-4 transition"
        />

        <label className="block text-sm font-medium text-gray-700 mb-2">
          Details / Steps
        </label>
        <div className="space-y-3">
          {details.map((d, i) => (
            <div key={i} className="flex items-start gap-2">
              <textarea
                value={d}
                placeholder={`Detail or step #${i + 1}`}
                onChange={(e) => handleDetailChange(i, e.target.value)}
                rows={1}
                className="flex-grow border border-gray-300 focus:border-blue-500 rounded-lg p-2 min-h-[40px] resize-none transition"
              />
              {details.length > 1 && (
                <button
                  className="mt-1 text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                  onClick={() => removeDetail(i)}
                  aria-label={`Remove detail ${i + 1}`}
                >
                  <Trash size={16} />
                </button>
              )}
            </div>
          ))}
          <button
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium py-1 transition-colors"
            onClick={addDetail}
          >
            <Plus size={16} /> Add Another Detail
          </button>
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
          <button
            className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 font-medium transition"
            onClick={handleClose}
          >
            Cancel
          </button>
          <button
            className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium disabled:opacity-50 transition"
            onClick={handleSubmit}
            disabled={!title.trim()}
          >
            {isEditing ? "Save Changes" : "Create Task"}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- SubTaskPage Component ---
const initialTasks = [
  {
    id: 1,
    title: "Project Scope Document",
    details: [
      "Outline key objectives",
      "Define deliverables and exclusions",
      "Get sign-off from stakeholders",
    ],
  },
  {
    id: 2,
    title: "Mockup Design",
    details: [
      "Create low-fidelity wireframes",
      "Develop high-fidelity UI designs",
    ],
  },
];

export default function SubTaskPage() {
  const [tasks, setTasks] = useState(initialTasks);
  const [showModal, setShowModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null); // Holds the task object being edited

  const navigate = useNavigate();

  const id = useParams().id;
  console.log(id);

  const handleTaskSubmit = useCallback(
    (taskData) => {
      setTasks((prev) => {
        if (taskToEdit) {
          // Edit existing task
          return prev.map((t) => (t.id === taskData.id ? taskData : t));
        } else {
          // Add new task
          return [...prev, taskData];
        }
      });
      setTaskToEdit(null); // Clear editing state
    },
    [taskToEdit]
  );

  const handleEdit = (task) => {
    setTaskToEdit(task);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setTaskToEdit(null); // Ensure we're in "Add" mode
    setShowModal(true);
  };

  const handleDelete = (id) => {
    // A simple confirmation for better UX
    if (window.confirm("Are you sure you want to delete this task?")) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setTaskToEdit(null);
  };

  return (
    <div className="min-h-screen p-6 sm:p-10 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header and Actions */}
        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-10 border-b pb-4">
          <h1 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0 flex items-center gap-3">
            Sub-Tasks Management
          </h1>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition-colors text-sm font-medium"
            >
              {/* Using a Lucide-React icon for consistency and simpler styling */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-arrow-left"
              >
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>
              Go Back
            </button>
            <button
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-colors text-sm font-medium"
              onClick={handleAddNew}
            >
              <Plus size={18} /> New Sub-Task
            </button>
          </div>
        </header>

        {/* Task Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300 border-t-4 border-blue-500 flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3 break-words">
                    {task.title}
                  </h3>
                  <ul className="list-none space-y-2 text-gray-700 mb-4">
                    {task.details.map((d, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckSquare
                          size={16}
                          className="text-green-500 flex-shrink-0 mt-1"
                        />
                        <span className="break-words">{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Task Actions */}
                <div className="flex justify-end gap-3 pt-3 border-t mt-4">
                  <button
                    className="p-2 rounded-full text-blue-500 hover:bg-blue-50 transition-colors"
                    onClick={() => handleEdit(task)}
                    aria-label={`Edit task: ${task.title}`}
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    className="p-2 rounded-full text-red-500 hover:bg-red-50 transition-colors"
                    onClick={() => handleDelete(task.id)}
                    aria-label={`Delete task: ${task.title}`}
                  >
                    <Trash size={18} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center p-10 bg-white rounded-xl shadow-inner text-gray-500">
              <p className="text-lg">
                You don't have any sub-tasks yet. Click "New Sub-Task" to get
                started! 🚀
              </p>
            </div>
          )}
        </div>

        {/* Reusable Task Modal */}
        <TaskFormModal
          show={showModal}
          onClose={handleModalClose}
          onSubmit={handleTaskSubmit}
          initialTask={taskToEdit}
          taskId={id}
        />
      </div>
    </div>
  );
}
