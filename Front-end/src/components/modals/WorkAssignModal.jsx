import React, { useEffect } from "react";
import { X } from "lucide-react";

const WorkAssignModal = ({
  modalOpen,
  editTask,
  formTask,
  setFormTask,
  errors,
  noChangeMessage,
  allUsers,
  teams,
  handleSaveTask,
  setModalOpen,
}) => {
  if (!modalOpen) return null;

  const isEditing = !!editTask;

  // Effect to handle initial form population when opening for edit
  useEffect(() => {
 
  }, [editTask, formTask]);

  const handleInputChange = (field, value) => {
    setFormTask((prev) => {
      let newFormTask = { ...prev, [field]: value };

      // Special handling for nested objects like 'assignedTo' and 'team'
      if (field === 'assignedTo') {
        // Assuming value here is the found user object
        newFormTask.assignedTo = value;
      }
      if (field === 'team') {
        // Assuming value here is the found team object
        newFormTask.team = value;
      }
      
      // Clear specific errors on change (handled in parent logic generally, but good to keep in mind)
      return newFormTask;
    });
  };

  const handleUserChange = (userName) => {
    const user = allUsers.find((u) => u.name === userName);
    setFormTask((prev) => ({ ...prev, assignedTo: user }));
    // Errors need to be cleared externally or by relying on handleSaveTask's validation
  };

  const handleTeamChange = (teamId) => {
    const teamIdNum = teamId ? parseInt(teamId) : null;
    const team = teams.find((t) => t.id === teamIdNum);
    setFormTask((prev) => ({ ...prev, team: team }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl transform transition-all overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header - Dark and Clean */}
        <div className="bg-gray-800 text-white px-5 py-3 flex justify-between items-center shrink-0">
          <h2 className="text-lg font-semibold">
            {isEditing ? "Edit Task" : "Create New Task"}
          </h2>
          <X
            className="cursor-pointer w-5 h-5 hover:text-gray-300"
            onClick={() => setModalOpen(false)}
          />
        </div>

        {/* Scrollable Body (Form) - Compacted Padding/Spacing */}
        <div className="p-5 space-y-4 overflow-y-auto flex-grow">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              className={`border ${
                errors.title ? "border-red-500" : "border-gray-300"
              } p-2 rounded-md w-full text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition duration-150`}
              placeholder="Task Title"
              value={formTask.title}
              onChange={(e) => {
                handleInputChange("title", e.target.value);
                // Clear error on change
                if (errors.title) setErrors(prev => ({ ...prev, title: "" }));
              }}
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className={`border ${
                errors.description ? "border-red-500" : "border-gray-300"
              } p-2 h-[80px] rounded-md w-full text-sm resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500 transition duration-150`}
              placeholder="Task Description"
              value={formTask.description}
              onChange={(e) => {
                handleInputChange("description", e.target.value);
                if (errors.description) setErrors(prev => ({ ...prev, description: "" }));
              }}
              rows={3}
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">
                {errors.description}
              </p>
            )}
          </div>

          {/* 2x2 Grid for smaller fields - Tighter Spacing */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {/* Assigned User */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned To
              </label>
              <select
                className={`border ${
                  errors.assignedTo ? "border-red-500" : "border-gray-300"
                } p-2 rounded-md w-full bg-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition duration-150`}
                value={formTask.assignedTo?.name || ""}
                onChange={(e) => {
                  handleUserChange(e.target.value);
                  if (errors.assignedTo) setErrors(prev => ({ ...prev, assignedTo: "" }));
                }}
              >
                {allUsers.map((user) => (
                  <option key={user.name} value={user.name}>
                    {user.name} {user.email ? `(${user.email})` : ""}
                  </option>
                ))}
              </select>
              {errors.assignedTo && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.assignedTo}
                </p>
              )}
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                className={`border ${
                  errors.dueDate ? "border-red-500" : "border-gray-300"
                } p-2 rounded-md w-full bg-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition duration-150`}
                value={formTask.dueDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => {
                  handleInputChange("dueDate", e.target.value);
                  if (errors.dueDate) setErrors(prev => ({ ...prev, dueDate: "" }));
                }}
              />
              {errors.dueDate && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.dueDate}
                </p>
              )}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                className={`border ${
                  errors.priority ? "border-red-500" : "border-gray-300"
                } p-2 rounded-md w-full bg-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition duration-150`}
                value={formTask.priority}
                onChange={(e) => {
                  handleInputChange("priority", e.target.value);
                  if (errors.priority) setErrors(prev => ({ ...prev, priority: "" }));
                }}
              >
                <option value="">Select Priority</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              {errors.priority && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.priority}
                </p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                className="border border-gray-300 p-2 rounded-md w-full bg-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition duration-150"
                value={formTask.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
              >
                <option value="Pending">Pending</option>
                <option value="Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Team (Full width) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team (Optional)
            </label>
            <select
              className="border border-gray-300 p-2 rounded-md w-full bg-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition duration-150"
              value={formTask.team?.id || ""}
              onChange={(e) => handleTeamChange(e.target.value)}
            >
              <option value="">Select Team</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.teamName}
                </option>
              ))}
            </select>
          </div>

          {noChangeMessage && (
            <p className="text-amber-700 text-sm p-2 bg-amber-50 rounded-md border border-amber-300">
              {noChangeMessage}
            </p>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              onClick={handleSaveTask}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base py-2.5 rounded-md shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
            >
              {isEditing ? "Update Task" : "Create Task"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkAssignModal;