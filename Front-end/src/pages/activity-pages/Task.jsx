import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../instance/Axios";
import Swal from "sweetalert2";

import TaskModal from "../../components/modals/TaskModal";
import StageModal from "../../components/modals/StageModal";
import TaskColumn from "../../components/TaskColumn";

const Task = () => {
  const navigate = useNavigate(); // State

  const [originalData, setOriginalData] = useState({});
  const [activeCardId, setActiveCardId] = useState(null);
  const [stage, setStage] = useState(1);
  const [taskById, setTaskById] = useState(null);
  const [tasksByStage, setTasksByStage] = useState({
    "Not Started": [],
    "In Progress": [],
    Review: [],
    Completed: [],
  });
  const [stageModal, setStageModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    requirement: "",
    phone: "",
    notes: "",
    description: "",
    finishBy: "",
    priority: "Normal",
  });
  const [errors, setErrors] = useState({});
  const [requirements, setRequirements] = useState([]);

  // --- New Invoice States ---
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState({
    link: "",
    amount: "",
    paid: false,
    taskId: null,
  });

  const fetchRequirements = async () => {
    try {
      Swal.fire({
        title: "Loading Requirements...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await axios.get("/requirement/get");
      setRequirements(res.data.data || []);
      Swal.close();
    } catch (err) {
      console.error(err);
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Failed!",
        text: "Could not fetch requirements.",
      });
    }
  };


  const fetchTasks = async () => {
    try {
      Swal.fire({
        title: "Loading Tasks...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await axios.get("/task/get");
      const fetchedTasks = res.data.data || [];

      const mappedTasks = {
        "Not Started": [],
        "In Progress": [],
        Review: [],
        Completed: [],
      };
      fetchedTasks.forEach((task) => {
        if (task.stage === "1") mappedTasks["Not Started"].push(task);
        else if (task.stage === "2") mappedTasks["In Progress"].push(task);
        else if (task.stage === "3") mappedTasks["Review"].push(task);
        else if (task.stage === "4") mappedTasks["Completed"].push(task);
      });

      setTasksByStage(mappedTasks);
      Swal.close();
    } catch (err) {
      console.error(err);
      Swal.close();
    }
  };


  const handleCardClick = (task, action) => {
    if (action === "view") {
      navigate(
        `/activities/tasks/person/${encodeURIComponent(
          JSON.stringify({
            data: { taskId: task.id, contactId: task.contactId },
          })
        )}`
      );
      setActiveCardId(null);
    } else if (action === "edit") {
      setFormData({ ...task, id: task.id });
      setIsEditing(true);
      setShowForm(true);
      setOriginalData({ ...task });
      setActiveCardId(null);
    } else if (action === "delete") {
      handleDelete(task.id);
      setActiveCardId(null);
    } else if (action === "taskUpdate") {
      setStage(task.stage);
      setTaskById(task.id);
      setStageModal(true);
      setActiveCardId(null);
    } else if (action === "subtask") {
      navigate(`/activities/tasks/subtask/${task.id}`);
      setActiveCardId(null);
    } else if (action === "Reveal") {
      navigate(`/activities/tasks/status/${task}`);
    } else if (action === "Invoice") {
      const existingInvoice = task.invoices && task.invoices.length > 0 ? task.invoices[0] : null;

      setInvoiceData({
        link: existingInvoice ? existingInvoice.link : "",
        amount: existingInvoice ? existingInvoice.amount : "",
        paid: existingInvoice ? existingInvoice.paid : false,
        taskId: task.id,
      });
      setInvoiceModal(true);
      setActiveCardId(null);
    }
  };

  const handleDelete = async (taskId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will move to Trash!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: "Deleting...",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        const response = await axios.delete(`/task/delete/${taskId}`);

        if (response.status === 200 || response.status === 204) {
          Swal.close();
          await Swal.fire({
            icon: "success",
            title: "Deleted!",
            showConfirmButton: false,
            timer: 1000,
          });

          fetchTasks();
        } else {
          throw new Error("Unexpected response from server");
        }
      } catch (err) {
        console.error("Delete error:", err);
        Swal.close();
        Swal.fire({
          icon: "error",
          title: "Failed!",
          text: "Could not delete task.",
        });
      }
    }
  };

  const handleTaskUpdate = async (data, difference) => {
    setStage(difference ? Number(stage) + 1 : Number(stage) - 1);
    try {
      await axios.patch(`/task/taskUpdate/${taskById}`, { data });
      fetchTasks();
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Failed!",
        text: "Could not update task.",
      });
    }
  };

  // --- Invoice Submission ---
  const handleInvoiceSubmit = async (e) => {
    e.preventDefault();
    try {
      Swal.fire({
        title: "Saving Invoice...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      // API Call for Invoice
      await axios.post(`/task/invoice/${invoiceData.taskId}`, invoiceData);

      Swal.close();
      await Swal.fire({
        icon: "success",
        title: "Invoice Saved!",
        timer: 1500,
        showConfirmButton: false,
      });
      setInvoiceModal(false);
      fetchTasks(); // Refresh to ensure UI reflects the latest invoice data
    } catch (err) {
      console.error(err);
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Failed!",
        text: "Could not save invoice.",
      });
    }
  };

  useEffect(() => {
    fetchRequirements();
    fetchTasks();
  }, []);

  const openForm = () => {
    setFormData({
      requirement: "",
      phone: "",
      notes: "",
      description: "",
      finishBy: "",
      priority: "Normal",
    });
    setErrors({});
    setIsEditing(false);
    setShowForm(true);
    setActiveCardId(null);
  };

  const closeForm = () => {
    setShowForm(false);
    setActiveCardId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.notes.trim()) newErrors.notes = "Notes are required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.finishBy) newErrors.finishBy = "Finish By date is required";
    if (!formData.requirement.trim())
      newErrors.requirement = "Requirement is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (isEditing) {
      const hasChanged = Object.keys(formData).some(
        (key) => formData[key] !== originalData[key]
      );
      if (!hasChanged) {
        await Swal.fire({
          icon: "warning",
          title: "No Changes Detected",
          confirmButtonText: "OK",
        });
        return;
      }
    }

    try {
      Swal.fire({
        title: isEditing ? "Updating Task..." : "Creating Task...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      if (isEditing && formData.id)
        await axios.put(`/task/edit/${formData.id}`, formData);
      else await axios.post("/task/create", formData);

      Swal.close();
      await Swal.fire({
        icon: "success",
        title: isEditing ? "Task Updated!" : "Task Created!",
        confirmButtonText: "OK",
      });
      closeForm();
      fetchTasks();
    } catch (err) {
      console.error(err);
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Failed!",
        text: "Could not save task.",
      });
    }
  };

  return (
    <div className="p-6 md:p-10 min-h-screen bg-gray-50">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Project <span className="text-indigo-600">Tasks</span>
        </h1>
        <button
          className="
              px-6 py-2 
              bg-indigo-600 text-white 
              font-semibold rounded-lg 
              shadow-md hover:bg-indigo-700 
              transition duration-300 ease-in-out
              transform hover:scale-[1.02] active:scale-[0.98]
            "
          onClick={openForm}
        >
          <span className="mr-2">➕</span> Create New Task
        </button>
      </div>
      <hr className="my-6 border-t border-gray-200" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Object.entries(tasksByStage).map(([status, cards]) => (
          <TaskColumn
            key={status}
            status={status}
            cards={cards}
            onCardClick={handleCardClick}
            activeCardId={activeCardId}
            toggleMenu={setActiveCardId}
          />
        ))}
      </div>

      {/* Task Form Modal */}
      <TaskModal
        showForm={showForm}
        closeForm={closeForm}
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        errors={errors}
        requirements={requirements}
        isEditing={isEditing}
      />

      {/* Stage Modal */}
      <StageModal
        stageModal={stageModal}
        setStageModal={setStageModal}
        stage={stage}
        handleTaskUpdate={handleTaskUpdate}
        fetchTasks={fetchTasks}
      />

      {/* --- Invoice Modal UI --- */}
      {invoiceModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Invoice Details
              </h2>
              <button
                onClick={() => setInvoiceModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInvoiceSubmit} className="space-y-5">
              {/* Link Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Invoice/Link
                </label>
                <input
                  type="text"
                  placeholder="Paste link here..."
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={invoiceData.link}
                  onChange={(e) =>
                    setInvoiceData({ ...invoiceData, link: e.target.value })
                  }
                  required
                />
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={invoiceData.amount}
                  onChange={(e) =>
                    setInvoiceData({ ...invoiceData, amount: e.target.value })
                  }
                  required
                />
              </div>

              {/* Paid Checkbox */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <input
                  type="checkbox"
                  id="paidStatus"
                  className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                  checked={invoiceData.paid}
                  onChange={(e) =>
                    setInvoiceData({ ...invoiceData, paid: e.target.checked })
                  }
                />
                <label
                  htmlFor="paidStatus"
                  className="text-sm font-medium text-gray-700 cursor-pointer"
                >
                  Mark as Paid
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setInvoiceModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-bold"
                >
                  Save Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Task;