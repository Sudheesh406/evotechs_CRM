import { useEffect, useState } from "react";
import axios from "../../instance/Axios";
import { useNavigate } from "react-router-dom";
// Assuming the file above is named PipelineView.js, this import is correct:
import PipelineDiagram from "../../components/PipelineView"; 
import MonthlyProfitGraph from "../../components/MonthlyProfitGraph";
import StaffList from "../../components/StaffList";

// Columns for Kanban
const columns = [
  { title: "To Do", status: "Pending", color: "bg-yellow-500" },
  { title: "In Progress", status: "Progress", color: "bg-blue-500" },
];

// Helper for deadline badge colors
const getDeadlineBadge = (deadline) => {
  const diffInDays =
    (new Date(deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
  if (diffInDays < 0) return "text-red-600 border-red-300";
  if (diffInDays < 2) return "text-yellow-600 border-yellow-300";
  return "text-gray-600 border-gray-300";
};

// Task Card Component
const TaskCard = ({ task }) => {
  const deadlineStyle = getDeadlineBadge(task.date);
  const navigate = useNavigate()

  return (
    <div className="bg-white p-4 mb-3 rounded-xl shadow hover:shadow-lg transition duration-200 border border-gray-200"
     onClick={() => navigate('/workspace/todo/')}>
      <h4 className="text-lg font-semibold text-gray-800 mb-1">{task.title}</h4>
      <p className="text-gray-600 text-sm mb-2">{task.description}</p>

      <div className="flex flex-wrap gap-2 text-xs mt-2">
        <span className="text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
          Priority: {task.priority}
        </span>
        <span
          className={`px-2 py-0.5 rounded-full border ${deadlineStyle} font-medium`}
        >
          Due: {task.date.split("T")[0]}
        </span>
      </div>
    </div>
  );
};

// Kanban Column Component
const KanbanColumn = ({ title, status, color, tasks }) => {
  const tasksInColumn = tasks.filter((task) => task.workUpdate === status);

  return (
    <div className="flex-1 min-w-[250px] p-2">
      <div className="p-3 rounded-t-xl shadow-sm bg-gray-100 sticky top-0 z-10">
        <div className="flex items-center space-x-2">
          <span className={`h-3 w-3 rounded-full ${color}`}></span>
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
            {title} ({tasksInColumn.length})
          </h3>
        </div>
      </div>

      <div className="pt-2 pb-4">
        {tasksInColumn.length > 0 ? (
          tasksInColumn.map((task) => <TaskCard key={task.id} task={task} />)
        ) : (
          <p className="text-center text-sm text-gray-400 mt-6">
            No tasks here!
          </p>
        )}
      </div>
    </div>
  );
};

// Main AdminDashboard Component
const AdminDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [name, setName] = useState()

  const fetchTasks = async () => {
    try {
      const response = await axios.get("/work/admin/dashboard");
      // Filter only Pending and Progress tasks
      const filteredTasks = response.data?.data?.existing.filter(
        (task) => task.workUpdate === "Pending" || task.workUpdate === "Progress"
      );
      setName(response.data?.data?.userName)
      setTasks(filteredTasks);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errorCode) {
            console.log('Error in token:', error.response.data.errorCode);
      }else{
      console.error("Error fetching tasks:", error);
      }
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    // Using min-h-screen ensures the page scrolls if content is taller than the viewport
    <div className="min-h-screen"> 
      {/* Header */}
      <header className="bg-white shadow">
        <div className="py-8 px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Hello <span> </span>
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              {name} 
            </span>
            !
          </h1>
          <p className="mt-3 text-gray-600 text-base md:text-lg max-w-2xl">
            Your tasks and updates are ready.
          </p>
        </div>
      </header>

        
      {/* ⭐ Fix: This is the container for the diagram. The diagram's 80vh height is contained here, and the dashboard scrolls below it. */}
      <div className="pt-4 px-4">
        <MonthlyProfitGraph/>
      </div>
      <div className="pt-4 px-4">
        <StaffList/>
      </div>
      {/* Kanban Board */}
      <main className="flex overflow-x-auto gap-4 p-4">
        {columns.map((column) => (
          <KanbanColumn
            key={column.status}
            title={column.title}
            status={column.status}
            color={column.color}
            tasks={tasks}
          />
        ))}
      </main>
      <div className="pt-4 px-4">
        <PipelineDiagram/>
      </div>
      {/* This content should now be visible by scrolling the main page */}
      <div className="p-4">
      </div>
    </div>
  );
};

export default AdminDashboard;