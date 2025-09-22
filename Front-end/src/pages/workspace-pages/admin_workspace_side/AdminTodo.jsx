import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Swal from "sweetalert2";
import { Edit2, Trash2, X } from "lucide-react";

const initialTasks = [
  {
    id: "1",
    title: "Follow up with client ABC",
    description: "Send proposal and follow up on pricing",
    assignedTo: "Sudheesh",
    dueDate: "2025-09-25",
    priority: "High",
    status: "Pending",
  },
  {
    id: "2",
    title: "Prepare sales report",
    description: "Monthly sales report for management",
    assignedTo: "Alice",
    dueDate: "2025-09-24",
    priority: "Medium",
    status: "In Progress",
  },
];

const teamMembers = ["Sudheesh", "Alice", "Bob", "Clara"];

const priorities = {
  High: "bg-red-200 text-red-800",
  Medium: "bg-yellow-200 text-yellow-800",
  Low: "bg-green-200 text-green-800",
};

const statusStages = ["Pending", "In Progress", "Completed"];

export default function AdvancedTodoCRM() {
  const [tasks, setTasks] = useState(initialTasks);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);

  const [formTask, setFormTask] = useState({
    title: "",
    description: "",
    assignedTo: teamMembers[0],
    dueDate: "",
    priority: "Medium",
    status: "Pending",
  });

  const openModal = (task = null) => {
    setEditTask(task);
    setFormTask(
      task || {
        title: "",
        description: "",
        assignedTo: teamMembers[0],
        dueDate: "",
        priority: "Medium",
        status: "Pending",
      }
    );
    setModalOpen(true);
  };

  const handleSaveTask = () => {
    if (!formTask.title || !formTask.assignedTo || !formTask.dueDate) {
      Swal.fire("Error", "Please fill all required fields", "error");
      return;
    }

    if (editTask) {
      setTasks(
        tasks.map((t) => (t.id === editTask.id ? { ...formTask, id: editTask.id } : t))
      );
      Swal.fire("Updated!", "Task has been updated.", "success");
    } else {
      setTasks([...tasks, { ...formTask, id: Date.now().toString() }]);
      Swal.fire("Created!", "Task has been created.", "success");
    }
    setModalOpen(false);
  };

  const handleDeleteTask = (id) => {
    Swal.fire({
      title: "Delete Task?",
      text: "Are you sure you want to delete this task?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
    }).then((result) => {
      if (result.isConfirmed) {
        setTasks(tasks.filter((t) => t.id !== id));
        Swal.fire("Deleted!", "Task has been deleted.", "success");
      }
    });
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const updatedTasks = [...tasks];
    const [movedTask] = updatedTasks.splice(result.source.index, 1);
    movedTask.status = result.destination.droppableId;
    updatedTasks.splice(result.destination.index, 0, movedTask);
    setTasks(updatedTasks);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-semibold text-gray-800">Team Tasks</h3>
        <button
          onClick={() => openModal()}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-semibold"
        >
          + New Task
        </button>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statusStages.map((stage) => (
            <Droppable droppableId={stage} key={stage}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-white rounded-xl p-4 shadow-md min-h-[300px]"
                >
                  <h2 className="text-xl font-semibold mb-4">{stage}</h2>
                  {tasks
                    .filter((t) => t.status === stage)
                    .map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-gray-50 rounded-lg p-4 mb-3 shadow hover:shadow-lg transition relative"
                          >
                            <div className="flex justify-between items-start">
                              <h3 className="font-semibold text-gray-700">{task.title}</h3>
                              <div className="flex gap-2">
                                <Edit2
                                  className="cursor-pointer text-blue-500 hover:scale-110 transition"
                                  onClick={() => openModal(task)}
                                />
                                <Trash2
                                  className="cursor-pointer text-red-500 hover:scale-110 transition"
                                  onClick={() => handleDeleteTask(task.id)}
                                />
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {task.description.length > 100
                                ? task.description.slice(0, 100) + "..."
                                : task.description}
                            </p>
                            <div className="flex justify-between items-center mt-2">
                              <span
                                className={`px-2 py-1 rounded text-sm font-semibold ${priorities[task.priority]}`}
                              >
                                {task.priority}
                              </span>
                              <span className="text-sm text-gray-500">Due: {task.dueDate}</span>
                            </div>
                            <div className="mt-1 text-sm text-gray-500">
                              Assigned to: {task.assignedTo}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 relative shadow-lg">
            <X
              className="absolute top-4 right-4 cursor-pointer text-gray-500 hover:text-gray-700"
              onClick={() => setModalOpen(false)}
            />
            <h2 className="text-xl font-semibold mb-4">{editTask ? "Edit Task" : "New Task"}</h2>
            <input
              className="border p-2 rounded w-full mb-3"
              placeholder="Task Title"
              value={formTask.title}
              onChange={(e) => setFormTask({ ...formTask, title: e.target.value })}
            />
            <textarea
              className="border p-2 rounded w-full mb-3 resize-none overflow-hidden"
              placeholder="Task Description"
              value={formTask.description}
              onChange={(e) => {
                setFormTask({ ...formTask, description: e.target.value });
                e.target.style.height = "auto"; // reset height
                e.target.style.height = e.target.scrollHeight + "px"; // auto-grow
              }}
              rows={1}
            />
            <select
              className="border p-2 rounded w-full mb-3"
              value={formTask.assignedTo}
              onChange={(e) => setFormTask({ ...formTask, assignedTo: e.target.value })}
            >
              {teamMembers.map((member) => (
                <option key={member} value={member}>
                  {member}
                </option>
              ))}
            </select>
            <input
              type="date"
              className="border p-2 rounded w-full mb-3"
              value={formTask.dueDate}
              onChange={(e) => setFormTask({ ...formTask, dueDate: e.target.value })}
            />
            <select
              className="border p-2 rounded w-full mb-3"
              value={formTask.priority}
              onChange={(e) => setFormTask({ ...formTask, priority: e.target.value })}
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <select
              className="border p-2 rounded w-full mb-3"
              value={formTask.status}
              onChange={(e) => setFormTask({ ...formTask, status: e.target.value })}
            >
              {statusStages.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
            <button
              onClick={handleSaveTask}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-semibold w-full"
            >
              {editTask ? "Update Task" : "Create Task"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
