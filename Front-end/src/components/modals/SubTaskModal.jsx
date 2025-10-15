import React, { useState, useEffect } from "react";
import axios from "../../instance/Axios";
import { X, Plus, Trash } from "lucide-react";
import Swal from "sweetalert2";

export default function TaskFormModal({
  show,
  onClose,
  onSubmit,
  initialTask,
  taskId,
}) {
  const isEditing = !!initialTask;
  const [title, setTitle] = useState(initialTask?.title || "");
  const [details, setDetails] = useState([""]);

  // --- Initialize values when editing ---
  useEffect(() => {
    if (isEditing && initialTask) {
      const notCheckedDetails = initialTask.notChecked || [];
      setTitle(initialTask.title || "");
      setDetails(notCheckedDetails.length > 0 ? notCheckedDetails : [""]);
    } else {
      setTitle("");
      setDetails([""]);
    }
  }, [initialTask, isEditing, show]);

  const handleDetailChange = (index, value) => {
    const updated = [...details];
    updated[index] = value;
    setDetails(updated);
  };

  const addDetail = () => setDetails((prev) => [...prev, ""]);
  const removeDetail = (index) =>
    setDetails((prev) => prev.filter((_, i) => i !== index));

  // --- CREATE or UPDATE ---
  const handleSubmit = async () => {
    if (!title.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Title is required",
        text: "Please enter a title before submitting.",
      });
      return;
    }

    const cleanedDetails = details.filter((d) => d.trim() !== "");
    const newTask = {
      title: title.trim(),
      details: cleanedDetails,
      taskId,
    };

    try {
      if (isEditing) {
        await axios.put(`/sub-task/update/${initialTask.id}`, newTask);
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Sub-task updated successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await axios.post("/sub-task/create", newTask);
        Swal.fire({
          icon: "success",
          title: "Created!",
          text: "Sub-task created successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
      }

      onSubmit?.();
      handleClose();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong while submitting the sub-task.",
      });
      console.log("Error while submitting sub-task:", err);
    }
  };
  

  // --- DELETE single detail ---
const handleDelete = async (detailIndex) => {
  if (!isEditing || detailIndex == null) return;

  const result = await Swal.fire({
    title: "Are you sure?",
    text: "This will delete the selected detail!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
  });

  if (!result.isConfirmed) return;

  try {
    const detailToDelete = details[detailIndex];

    await axios.delete(`/sub-task/delete/sub/${initialTask.id}`, {
      data: { detail: detailToDelete },
    });

    setDetails((prev) => prev.filter((_, i) => i !== detailIndex));

    Swal.fire({
      icon: "success",
      title: "Deleted!",
      text: "Detail deleted successfully.",
      timer: 1200,
      showConfirmButton: false,
    });
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Could not delete the detail.",
    });
    console.log("Error deleting detail:", error);
  }
};


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
        onClick={(e) => e.stopPropagation()}
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

        {/* --- Title --- */}
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

        {/* --- Details --- */}
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
                  onClick={() => handleDelete(i)}
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

        {/* --- Footer --- */}
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
