import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { X, Plus, Edit, Trash  } from "lucide-react";
import axios from "../../instance/Axios";
import TaskFormModal from "../../components/modals/SubTaskModal";
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
    <div className=" p-6 sm:p-10 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* --- Header --- */}
        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-10 border-b pb-4">
          <h1 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">
            Sub-Tasks Management
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Go Back
            </button>
            <button
              onClick={() => {
                setEditingTask(null);
                setShowModal(true);
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
            >
              <Plus size={18} /> New Sub-Task
            </button>
          </div>
        </header>

        {/* --- Sub Task Cards --- */}
        {subTasks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {subTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-blue-500"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  {task.title}
                </h3>

                <ul className="space-y-2">
                  {/* Loop over combined checked + notChecked items */}
                  {[...task.checked, ...task.notChecked].map((item, idx) => {
                    const isChecked = task.checked.includes(item);
                    return (
                      <li key={idx} className="flex items-center gap-2 text-gray-700">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCheck(task.id, item)}
                          className="w-4 h-4 accent-blue-600 cursor-pointer"
                        />
                        <span>
                          {item}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                {/* --- Actions --- */}
                <div className="flex justify-end gap-3 mt-4 border-t pt-3">
                  <button
                    onClick={() => handleEdit(task)}
                    className="p-2 rounded-full text-blue-500 hover:bg-blue-50"
                    aria-label="Edit"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-2 rounded-full text-red-500 hover:bg-red-50"
                    aria-label="Delete"
                  >
                    <Trash size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center bg-white p-10 rounded-xl shadow-inner text-gray-500">
            <p>No sub-tasks found. Click “New Sub-Task” to add one!</p>
          </div>
        )}
      </div>

      {/* --- Modal --- */}
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
