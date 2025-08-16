import { useState } from "react";
import { useNavigate } from "react-router-dom";

const tasks = {
  "Not Started": new Array(20).fill(null).map((_, i) => ({
    id: i + 1, // ✅ give each task an ID
    title: `Not Started Task ${i + 1}`,
    date: "13/08/2025",
    priority: ["Low", "Normal", "High"][i % 3],
    assignees: ["Sudheesh kumar", "Sample User"],
  })),
  "In Progress": new Array(15).fill(null).map((_, i) => ({
    id: i + 101,
    title: `In Progress Task ${i + 1}`,
    date: "14/08/2025",
    priority: ["Low", "Normal", "High"][i % 3],
    assignees: ["Sudheesh kumar"],
  })),
  Completed: [
    {
      id: 201,
      title: "Complete CRM Getting Started steps",
      date: "16/08/2025",
      priority: "Normal",
      assignees: ["Sudheesh kumar", "Theola Frey (Sample)"],
    },
  ],
  Canceled: [],
};

const TaskColumn = ({ status, cards, onCardClick }) => {
  return (
    <div className="bg-[#e9f5f7] rounded-md p-3 flex flex-col">
      {/* Column Header */}
      <h2 className="text-md font-semibold mb-3 flex justify-between">
        {status} <span className="text-gray-600">{cards.length}</span>
      </h2>

      {/* Scrollable task list */}
      <div className="space-y-3 overflow-y-auto flex-1 pr-2 max-h-[70vh]">
        {cards.length > 0 ? (
          cards.map((task) => (
            <div
              key={task.id}
              onClick={() => onCardClick(task)} // ✅ navigate on click
              className="bg-white shadow rounded-md p-3 text-sm hover:shadow-md transition cursor-pointer"
            >
              <h3 className="font-semibold truncate">{task.title}</h3>
              <p className="text-gray-500 text-xs">{task.date}</p>
              <p
                className={`text-xs font-medium ${
                  task.priority === "High"
                    ? "text-red-600"
                    : task.priority === "Normal"
                    ? "text-blue-600"
                    : "text-green-600"
                }`}
              >
                {task.priority}
              </p>
              <div className="mt-1 text-xs text-gray-700 truncate">
                {task.assignees.join(", ")}
              </div>
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

  const handleCardClick = (task) => {
    // ✅ Navigate to a detail page
    // navigate(`/tasks/${task.id}`, { state: { task } });
  navigate("/activities/tasks/person")
  };

  return (
    <div className="p-6 bg-gray-100 min-h-[680px]">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">Tasks</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-md">
            Create Tasks
          </button>
          <button className="px-4 py-2 bg-gray-200 rounded-md">Actions</button>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(tasks).map(([status, cards]) => (
          <TaskColumn
            key={status}
            status={status}
            cards={cards}
            onCardClick={handleCardClick}
          />
        ))}
      </div>
    </div>
  );
};

export default Task;
