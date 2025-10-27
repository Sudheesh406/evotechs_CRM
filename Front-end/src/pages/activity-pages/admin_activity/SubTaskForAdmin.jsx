import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { X, Plus, Edit, Trash } from "lucide-react";
import axios from "../../../instance/Axios";
import TaskFormModal from "../../../components/modals/SubTaskModal";
import Swal from "sweetalert2";

export default function SubTaskPage() {
  const [subTasks, setSubTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams(); // main task ID

  // --- Fetch Sub Tasks ---
  const getSubTask = async () => {
    let loading = Swal.fire({
      title: "Loading Sub-Tasks...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const response = await axios.get(`/sub-task/get/${id}`);
      if (response.data?.success && Array.isArray(response.data.data)) {
        setSubTasks(response.data.data);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch sub-tasks.",
      });
      console.log("error found in getting sub task", error);
    } finally {
      Swal.close();
    }
  };

  useEffect(() => {
    getSubTask();
  }, []);

  // --- Handle Checkbox Toggle + Update Backend ---
  const toggleCheck = async (taskId, item) => {
    // Optimistically update the UI first
    setSubTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;

        const isCurrentlyChecked = task.checked.includes(item);
        return {
          ...task,
          checked: isCurrentlyChecked
            ? task.checked.filter((i) => i !== item)
            : [...task.checked, item],
          notChecked: isCurrentlyChecked
            ? [...task.notChecked, item]
            : task.notChecked.filter((i) => i !== item),
        };
      })
    );

    try {
      // Send update to backend
      await handleUpdateCheckIn(taskId, item);
    } catch (error) {
      console.log("Error updating backend, reverting change", error);
      // Optionally, revert UI if backend fails
      setSubTasks((prev) =>
        prev.map((task) => {
          if (task.id !== taskId) return task;

          const isCurrentlyChecked = task.checked.includes(item);
          return {
            ...task,
            checked: isCurrentlyChecked
              ? task.checked.filter((i) => i !== item)
              : [...task.checked, item],
            notChecked: isCurrentlyChecked
              ? [...task.notChecked, item]
              : task.notChecked.filter((i) => i !== item),
          };
        })
      );
    }
  };

  // --- Handle Update CheckIn (Backend) ---
  const handleUpdateCheckIn = async (subjectId, name) => {
    try {
      const response = await axios.patch(`/sub-task/update-checkin/${subjectId}`, { name });
      return response; // response.data.checked = true/false
    } catch (error) {
      console.log("error found in update checkIn", error);
      return { data: { checked: false } }; // fallback
    }
  };

  // --- Handle Edit Click ---
  const handleEdit = (task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  // --- Handle Delete Sub Task ---
  const handleDelete = async (taskId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will move to removed sub task!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`/sub-task/delete/${taskId}`);
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Sub-task has been deleted.",
        timer: 1500,
        showConfirmButton: false,
      });
      getSubTask(); // refresh list
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to delete sub-task.",
      });
      console.log("error deleting sub task:", error);
    }
  };

  return (
    <div className="p-6 sm:p-10 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* ------------------------------------- */}
        {/* --- Header --- */}
        {/* ------------------------------------- */}
        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 pb-4 border-b border-gray-200">
           <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            <span className="text-indigo-600">Sub-Tasks</span> Management
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-white text-gray-700 font-medium rounded-xl border border-gray-300 shadow-sm hover:bg-gray-50 transition duration-150 ease-in-out"
            >
              Go Back
            </button>
            <button
              onClick={() => {
                setEditingTask(null);
                setShowModal(true);
              }}
              className="flex items-center gap-2 bg-blue-600 text-white font-medium px-4 py-2 rounded-xl shadow-md hover:bg-blue-700 transition duration-150 ease-in-out transform hover:scale-[1.02]"
            >
              <Plus size={20} /> New Sub-Task
            </button>
          </div>
        </header>

        {/* ------------------------------------- */}
        {/* --- Sub Task Cards --- */}
        {/* ------------------------------------- */}
        {subTasks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {subTasks.map((task) => {
              const totalItems = task.checked.length + task.notChecked.length;
              const completedItems = task.checked.length;
              const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
              const isComplete = progressPercentage === 100 && totalItems > 0;

              return (
                <div
                  key={task.id}
                  className={`bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 ease-in-out border-b-4 ${isComplete ? 'border-green-500' : 'border-blue-500'}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-800 break-words pr-4">
                      {task.title}
                    </h3>
                    <span className={`text-sm font-semibold px-3 py-1 rounded-full ${isComplete ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {progressPercentage}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${isComplete ? 'bg-green-500' : 'bg-blue-500'}`}
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>

                  <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {/* Loop over combined checked + notChecked items */}
                    {[...task.checked, ...task.notChecked].map((item, idx) => {
                      const isChecked = task.checked.includes(item);
                      return (
                        <li key={idx} className="flex items-center gap-3 text-gray-700">
                          <input
                            id={`item-${task.id}-${idx}`}
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleCheck(task.id, item)}
                            className="w-5 h-5 accent-blue-600 cursor-pointer rounded border-gray-300 focus:ring-blue-500"
                          />
                          <label
                            htmlFor={`item-${task.id}-${idx}`}
                            className={`flex-1 text-base cursor-pointer ${isChecked ? 'line-through text-gray-400' : 'text-gray-700'}`}
                          >
                            {item}
                          </label>
                        </li>
                      );
                    })}
                  </ul>

                  {/* --- Actions --- */}
                  <div className="flex justify-end gap-2  pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleEdit(task)}
                      className="p-2 rounded-full text-blue-500 hover:bg-blue-100 transition duration-150 ease-in-out"
                      aria-label="Edit Sub-Task"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="p-2 rounded-full text-red-500 hover:bg-red-100 transition duration-150 ease-in-out"
                      aria-label="Delete Sub-Task"
                    >
                      <Trash size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center bg-white  rounded-2xl shadow-lg border border-gray-200 text-gray-500">
            <X size={48} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-gray-700">No Sub-Tasks Yet</h2>
            <p>It looks a little empty here. Click the "New Sub-Task" button to get started!</p>
          </div>
        )}
      </div>

      {/* ------------------------------------- */}
      {/* --- Modal --- */}
      {/* ------------------------------------- */}
      {showModal && (
        <TaskFormModal
          show={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingTask(null);
          }}
          onSubmit={getSubTask}
          initialTask={editingTask}
          taskId={id}
        />
      )}
    </div>
  );
}