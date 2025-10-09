import React, { useRef, useEffect } from "react";
import { MoreVertical, Eye, Edit, Trash2, Layers, RefreshCw, UserCircle } from "lucide-react";

// Helper function to get initials for the placeholder profile
const getInitials = (name) => {
  if (!name) return "NT"; // No Task
  const parts = name.split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
};

const TaskColumn = ({
  status,
  cards,
  onCardClick,
  activeCardId,
  toggleMenu,
}) => {
  const dropdownRef = useRef(null);

  // --- Close dropdown when clicking outside ---
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !e.target.closest(".three-dot-btn")
      ) {
        toggleMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [toggleMenu]);

  // --- Helper Component for details ---
  const DetailRow = ({ label, value, className = "" }) => {
    if (!value) return null;
    return (
      <div className={`flex justify-between text-sm py-1 border-b border-gray-100 last:border-b-0 ${className}`}>
        <span className="font-medium text-gray-500">{label}</span>
        <span className="font-semibold text-gray-800">{value}</span>
      </div>
    );
  };

  return (
    <div className="bg-[#f5f6f6] rounded-2xl p-5 flex flex-col shadow-inner border border-gray-200 max-h-[75vh]">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <span className="text-green-600">●</span> {status}
        </h2>
        <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
         Total : {cards.length}
        </span>
         <button className="px-2 py-1 bg-indigo-600  text-sm text-white rounded-md" onClick={()=>onCardClick(status, "Reveal")}>
         Reveal
        </button>
      </div>

      {/* Tasks */} 
      <div className="space-y-4 overflow-y-auto max-h-[70vh] pr-1 custom-scrollbar">
         {cards.length > 0 ? (
          cards.map((task) => {
            const taskName = task?.customer?.name || "Untitled Task";
            const finishByDate = task.finishBy
              ? new Date(task.finishBy).toLocaleDateString()
              : null;

            const formattedAmount = task?.customer?.amount
              ? `$${parseFloat(task.customer.amount).toFixed(2)}`
              : null;

            const priorityColors = {
              High: "text-red-600 font-semibold",
              Normal: "text-blue-600 font-medium",
              Low: "text-gray-500",
            };
            const priorityClass = priorityColors[task.priority] || "";
            const initials = getInitials(taskName);

            return (
              <div
                key={task.id}
                className="relative w-full bg-white shadow-md hover:shadow-xl transition-all duration-300 rounded-xl p-4 border border-gray-100"
              >
                {/* Profile-style Header Section */}
                <div className="flex justify-between items-center mb-3">
                  <div 
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => onCardClick(task, "view")}
                  >
                    {/* Profile Icon / Initials Circle */}
                    <div className="w-10 h-10 bg-green-500/20 text-green-700 font-bold rounded-full flex items-center justify-center text-sm ring-2 ring-green-400">
                      {initials}
                    </div>

                    <div>
                      {/* Name (The main title, like "Your Name" in the image) */}
                      <h3 className="text-base font-bold text-gray-900 line-clamp-1">
                        {taskName}
                      </h3>
                      {/* Sub-detail (Like the email in the image) */}
                      <p className="text-xs text-gray-500 line-clamp-1">
                        {task.requirement || "General Requirement"}
                      </p>
                    </div>
                  </div>

                  {/* Dropdown Toggle */}
                  <button
                    className="three-dot-btn p-1 text-gray-500 hover:text-green-600 transition ml-4"
                    onClick={() =>
                      toggleMenu(activeCardId === task.id ? null : task.id)
                    }
                  >
                    <MoreVertical size={18} />
                  </button>
                </div>

                {/* Dropdown Menu (Positioned relative to the card) */}
                {activeCardId === task.id && (
                  <div
                    ref={dropdownRef}
                    className="absolute right-2 top-10 w-48 bg-white/95 backdrop-blur-md border border-gray-200 shadow-xl rounded-2xl overflow-hidden animate-fadeIn z-50"
                  >
                    {/* Dropdown Buttons (kept the same) */}
                    <button
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 transition"
                      onClick={() => onCardClick(task, "subtask")}
                    >
                      <Layers size={16} className="text-green-600" /> Sub Task
                    </button>
                    <button
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 transition"
                      onClick={() => onCardClick(task, "taskUpdate")}
                    >
                      <RefreshCw size={16} className="text-blue-600" /> Stage Update
                    </button>
                    <button
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 transition"
                      onClick={() => onCardClick(task, "view")}
                    >
                      <Eye size={16} className="text-gray-700" /> View Details
                    </button>
                    <button
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 transition"
                      onClick={() => onCardClick(task, "edit")}
                    >
                      <Edit size={16} className="text-yellow-600" /> Edit
                    </button>
                    <button
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                      onClick={() => onCardClick(task, "delete")}
                    >
                      <Trash2 size={16} className="text-red-600" /> Delete
                    </button>
                  </div>
                )}

                {/* Details Section (Formatted to match the two-column style of the image) */}
                <div className="mt-3 pt-3 border-t border-gray-200 space-y-1">
                  {/* Using the two-column DetailRow for a cleaner, profile-like look */}
                  <DetailRow label="Stage" value={task.stage} />
                  <DetailRow label="Finish By" value={finishByDate} />
                  <DetailRow label="Amount" value={formattedAmount} />
                  <DetailRow label="Phone" value={task.phone} />
                  
                  {/* Priority and Description are styled slightly differently */}
                  {task.priority && (
                    <div className="flex justify-between text-sm py-1">
                      <span className="font-medium text-gray-500">Priority</span>
                      <span className={priorityClass}>{task.priority}</span>
                    </div>
                  )}

                  {task.description && (
                      <div className="text-sm pt-2">
                        <p className="font-medium text-gray-500 mb-1">Description:</p>
                        <p className="text-gray-700 line-clamp-2">{task.description}</p>
                      </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-gray-500 text-center py-10">
            No tasks found in this column.
          </p>
        )}
      </div>
    </div>
  );
};

export default TaskColumn;