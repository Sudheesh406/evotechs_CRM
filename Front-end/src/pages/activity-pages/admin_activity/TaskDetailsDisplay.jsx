import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../../../instance/Axios";
import {
  FileText,
  Phone,
  User,
  CheckSquare,
  ArrowLeft,
  Eye,
  Clock,
  DollarSign,
  Tag,
  Calendar,
  Mail,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// --- Helper Functions ---

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (e) {
    return dateString;
  }
};

const getStageInfo = (stage) => {
  switch (stage) {
    case "1":
      return {
        text: "Not Started",
        color: "bg-gray-100 text-gray-700",
        icon: <Clock className="w-3 h-3" />,
      };
    case "2":
      return {
        text: "In Progress",
        color: "bg-blue-50 text-blue-700",
        icon: <Clock className="w-3 h-3" />,
      };
    case "3":
      return {
        text: "Completed",
        color: "bg-green-50 text-green-700",
        icon: <CheckSquare className="w-3 h-3" />,
      };
    default:
      return {
        text: "Unknown",
        color: "bg-gray-50 text-gray-500",
        icon: <Clock className="w-3 h-3" />,
      };
  }
};

const getPriorityClasses = (priority) => {
  switch (priority) {
    case "High":
      return "text-red-700 bg-red-50 border-red-200";
    case "Medium":
      return "text-yellow-700 bg-yellow-50 border-yellow-200";
    case "Low":
    default:
      return "text-gray-700 bg-gray-50 border-gray-200";
  }
};

// --- Reusable Detail Component ---
const DetailItem = ({ icon, label, value }) => (
  <div className="flex justify-between items-start text-sm py-1">
    <dt className="flex items-center text-gray-500 font-medium flex-shrink-0 mr-3">
      <div className="mr-2 flex-shrink-0 text-gray-400">{icon}</div>
      {label}:
    </dt>
    <dd className="text-gray-900 font-semibold text-right whitespace-normal break-words">
      {value}
    </dd>
  </div>
);

// --- Task Card Component ---
const TaskCard = ({ task, role, navigate }) => {
  const stageInfo = getStageInfo(task.stage);
  const priorityClasses = getPriorityClasses(task.priority);
  const finishDate = formatDate(task.finishBy);

  const handleViewDetails = () => {
    const payload = {
      taskId: task.id,
      contactId: task.contactId,
      role,
    };
    const dataToSend = encodeURIComponent(JSON.stringify(payload));
    if (task.stage < 3) {
      navigate(`/activities/tasks/team/${dataToSend}`);
    } else if (task.stage >= 3) {
      const data = {
        taskId: task.id,
        contactId: task.contactId,
        staffId: task.staffId,
        pending: false,
        completed: true,
        resolve: true,
      };
      const dataToSend = encodeURIComponent(JSON.stringify({ data }));
      navigate(`/activities/task/port/${dataToSend}`);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col hover:shadow-2xl transition duration-300">
      <div className="p-5 border-b border-gray-100 flex flex-col space-y-3">
        <div className="flex justify-between items-center pb-2">
          <span className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${priorityClasses} border`}>
            <Zap className="w-3 h-3" />
            {task.priority || "N/A"} Priority
          </span>
          <span className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${stageInfo.color} border border-transparent`}>
            {stageInfo.icon}
            {stageInfo.text}
          </span>
        </div>

        <div className="flex items-start">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white text-xl font-bold mr-4 flex-shrink-0 shadow-md">
            {task.customer?.name ? task.customer.name[0].toUpperCase() : "C"}
          </div>
          <div>
            <div className="text-lg text-gray-900 font-bold leading-snug capitalize">
              {task.customer?.name || "Unknown Customer"}
            </div>
            <div className="text-sm text-gray-600 font-medium mt-0.5">
              {task.requirement || "No Task Title"}
            </div>
          </div>
        </div>
      </div>

      <dl className="p-5 flex-grow space-y-2 border-b border-gray-100">
        <DetailItem icon={<Calendar className="w-4 h-4" />} label="Finish By" value={finishDate} />
        <DetailItem
          icon={<Phone className="w-4 h-4 text-blue-500" />}
          label="Phone"
          value={
            <a href={`tel:${task.customer?.phone || task.phone}`} className="hover:text-blue-600 transition">
              {task.customer?.phone || task.phone || "N/A"}
            </a>
          }
        />
        <DetailItem
          icon={<DollarSign className="w-4 h-4 text-green-600" />}
          label="Amount"
          value={
            task.customer?.amount
              ? `₹ ${parseFloat(task.customer.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
              : "N/A"
          }
        />
        <DetailItem icon={<User className="w-4 h-4 text-blue-500" />} label="Assigned Staff" value={task.staff?.name || "N/A"} />
        <DetailItem icon={<Mail className="w-4 h-4 text-blue-500" />} label="Email" value={task.staff?.email || "N/A"} />
      </dl>

      <div className="p-5">
        <div className="flex items-center text-gray-700 mb-2 font-semibold text-sm">
          <FileText className="w-4 h-4 mr-2 text-gray-400" />
          Description:
        </div>
        <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg max-h-20 overflow-y-auto whitespace-pre-line border border-gray-200 shadow-inner">
          {task.description || "No description provided."}
        </p>
      </div>

      <div className="p-5 pt-0">
        <button
          className="w-full flex items-center justify-center gap-1 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-md"
          onClick={handleViewDetails}
        >
          <Eye className="w-4 h-4" />
          View Full Details
        </button>
      </div>
    </div>
  );
};

// --- Main Component ---

const TaskDetailsDisplay = () => {
  const [taskData, setTaskData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);

  const navigate = useNavigate();
  const { data } = useParams();

  let parsed = null;
  if (data) {
    try {
      parsed = JSON.parse(decodeURIComponent(data));
    } catch (e) {
      console.error("Could not parse data:", e);
    }
  }

  const getTaskDetails = async (page = 1) => {
    if (!parsed) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Sending page and limit (6) to the backend
      const response = await axios.post("task/status/get", { 
        parsed, 
        page, 
        limit: 16
      });
      
      if (response.data.success) {
        // According to your backend: response.data.data contains { tasks, totalPages, currentPage, totalTasks }
        const { tasks, totalPages, currentPage, totalTasks } = response.data.data;
        setTaskData(tasks || []);
        setTotalPages(totalPages || 1);
        setCurrentPage(currentPage || 1);
        setTotalTasks(totalTasks || 0);
      } else {
        setTaskData([]);
      }
    } catch (error) {
      console.error("Error fetching task details", error);
      setTaskData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTaskDetails(1);
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      getTaskDetails(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const role = true;

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 p-8">
        <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        <p className="mt-4 text-xl font-medium text-gray-700">Fetching task details...</p>
      </div>
    );
  }

  if (taskData.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-white shadow-xl rounded-xl m-8 p-12 border border-gray-200">
        <FileText className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-3xl font-bold text-gray-900">Task Data Unavailable</h2>
        <p className="text-gray-600 mt-3 text-lg text-center">We couldn't find any tasks matching the criteria.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-8 flex items-center gap-2 text-base text-white bg-blue-600 px-6 py-3 rounded-xl hover:bg-blue-700 transition shadow-lg font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          Return to Previous Page
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8 pb-4 border-b-2 border-gray-200">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            <span className="text-indigo-600">Task</span> Overview ({totalTasks})
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-gray-700 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition shadow-md font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Tasks
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {taskData.map((task) => (
            <TaskCard key={task.id} task={task} role={role} navigate={navigate} />
          ))}
        </div>

        {/* --- Pagination Controls --- */}
        <div className="mt-12 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-gray-700 font-medium"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  className={`w-10 h-10 rounded-lg border transition font-medium ${
                    currentPage === index + 1
                      ? "bg-blue-600 text-white border-blue-600 shadow-md"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-gray-700 font-medium"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-gray-500 font-medium">
            Showing page {currentPage} of {totalPages}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsDisplay;