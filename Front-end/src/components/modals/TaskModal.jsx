import React from "react";
import { X } from "lucide-react";

const TaskModal = ({
  showForm,
  closeForm,
  isEditing,
  formData,
  handleChange,
  handleSubmit,
  errors,
  requirements = [],
}) => {
  if (!showForm) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      {/* Outer scroll container */}
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl relative max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {/* Close button */}
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={closeForm}
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="p-6">
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
              <label className="block text-sm font-medium mb-1">Finish By</label>
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
              <label className="block text-sm font-medium mb-1">Priority</label>
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
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
              >
                {isEditing ? "Update" : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
