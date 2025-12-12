import { useState, useEffect } from "react";
import axios from "../../instance/Axios";
import Swal from "sweetalert2";
import ContactModal from "../../components/modals/ContactModal";
import TaskModal from "../../components/modals/TaskModal";
import { MoreVertical } from "lucide-react";

import PipelineDiagram from "../../components/PipelineView"; 
import MonthlyProfitGraph from "../../components/MonthlyProfitGraph";
import StaffList from "../../components/StaffList";

const statuses = ["Pending", "Progress", "Completed"];
const statusColors = {
  Pending: "bg-blue-100",
  Progress: "bg-yellow-100",
  Completed: "bg-green-100",
};

const StaffDashboard = () => {
  const [workDetails, setWorkDetails] = useState([]);
  const [expandedTasks, setExpandedTasks] = useState({});
  const [userName, setUserName] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [requirements, setRequirements] = useState([]);
  const [role,setRole] = useState(false)
  const [id,setId] = useState()

  // ✅ Modal states
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // ✅ Separate form data states for each modal
  const [contactForm, setContactForm] = useState({
    name: "",
    description: "",
    email: "",
    phone: "",
    location: "",
    purpose: "",
    source: "",
    priority: "",
    amount: "",
  });

  const [taskForm, setTaskForm] = useState({
    requirement: "",
    phone: "",
    finishBy: "",
    priority: "Normal",
    notes: "",
    description: "",
  });

  // ✅ Error states
  const [contactErrors, setContactErrors] = useState({});
  const [taskErrors, setTaskErrors] = useState({});

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

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
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Failed!",
        text: "Could not fetch requirements.",
      });
    }
  };

  const getWorkAssign = async () => {
    try {
      Swal.fire({
        title: "Loading work assignments...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const { data } = await axios.get("/work/get");
      setWorkDetails(data?.data?.workAssigns || []);
      setUserName(data?.data?.userName || "");
      Swal.close();
    } catch (error) {
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.response?.data?.message ||
          "Something went wrong while fetching work assignments",
      });
    }
  };

  useEffect(() => {
    fetchRequirements();
    getWorkAssign();
  }, []);

  const handleUpdateClick = async (task) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to update the task "${task.title}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, update it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.put(`/work/stage/update/${task.id}`);
        if (response) {
          Swal.fire({
            title: "Updated!",
            text: "The task has been updated.",
            icon: "success",
          }).then(() => getWorkAssign());
        }
      } catch {
        Swal.fire("Error!", "Something went wrong.", "error");
      }
    }
  };

  const toggleExpand = (taskId) => {
    setExpandedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  // ✅ Modal control handlers
  const openContactModal = () => setIsContactModalOpen(true);
  const closeContactModal = () => setIsContactModalOpen(false);
  const openTaskModal = () => setIsTaskModalOpen(true);
  const closeTaskModal = () => setIsTaskModalOpen(false);

  // ✅ Handle form changes
  const handleContactChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === "phone" || name === "amount") {
      newValue = value.replace(/[^0-9]/g, "");
    }
    setContactForm((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleTaskChange = (e) => {
    const { name, value } = e.target;
    setTaskForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Submit handlers
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!contactForm.name) errors.name = "Name is required";
    if (!contactForm.phone) errors.phone = "Phone is required";
    if (!contactForm.location) errors.location = "Location is required";
    if (!contactForm.purpose) errors.purpose = "Purpose is required";

    if (Object.keys(errors).length > 0) {
      setContactErrors(errors);
      return;
    }

    try {
      await axios.post("/customer/contact/create", contactForm);
      Swal.fire({
        icon: "success",
        title: "Contact Created",
        timer: 1500,
        showConfirmButton: false,
      });
      closeContactModal();
      setContactForm({
        name: "",
        description: "",
        email: "",
        phone: "",
        location: "",
        purpose: "",
        source: "",
        priority: "",
        amount: "",
      });
      setContactErrors({});
    } catch {
      Swal.fire({
        icon: "error",
        title: "Failed!",
        text: "Could not create contact.",
      });
    }
  };

  const handleAssign = async(id)=>{
    setId(id)
  }

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!taskForm.requirement) errors.requirement = "Requirement is required";
    if (!taskForm.finishBy) errors.finishBy = "Finish date is required";
    if (!taskForm.notes) errors.notes = "Notes are required";
    if (!taskForm.description) errors.description = "Description is required";
    if (!taskForm.phone) errors.phone = "phone number is required";

    if (Object.keys(errors).length > 0) {
      setTaskErrors(errors);
      return;
    }
    taskForm.assignId = id

    try {
      await axios.post("/task/create", taskForm);
      Swal.fire({
        icon: "success",
        title: "Task Created",
        timer: 1500,
        showConfirmButton: false,
      });
      closeTaskModal();
      setTaskForm({
        requirement: "",
        phone: "",
        finishBy: "",
        priority: "Normal",
        notes: "",
        description: "",
      });
      setTaskErrors({});
    } catch {
      Swal.fire({
        icon: "error",
        title: "Failed!",
        text: "Could not create task.",
      });
    }
  };


useEffect(()=>{
  if(!isTaskModalOpen){
     setTaskForm({
        requirement: "",
        phone: "",
        finishBy: "",
        priority: "Normal",
        notes: "",
        description: "",
      });
  }

  if(!isContactModalOpen){
       setContactForm({
        name: "",
        description: "",
        email: "",
        phone: "",
        location: "",
        purpose: "",
        source: "",
        priority: "",
        amount: "",
      });
  }
},[isTaskModalOpen, isContactModalOpen])


  return (
    <div className="bg-[#f5f5f5] min-h-[680px] text-gray-800 p-4">
      <h1 className="text-2xl font-bold mb-4">
        Hello{" "}
        <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          {userName}!
        </span>
      </h1>

      <div className="pt-4 px-4">
              <MonthlyProfitGraph/>
            </div>
            <div className="pt-4 px-4 mb-10">
              <StaffList role={role}/>
            </div>

      <div className="flex gap-4 flex-wrap">
        {statuses.map((status) => {
          const filteredTasks = workDetails.filter(
            (t) => t.workUpdate === status
          );

          return (
            <div key={status} className="flex-1 min-w-[250px]">
              <div
                className={`rounded-t-lg p-3 text-black font-semibold ${
                  statusColors[status] || "bg-gray-200"
                }`}
              >
                {status}
                <span className="ml-2 bg-white text-gray-800 px-2 py-0.5 rounded-full text-sm">
                  {filteredTasks.length}
                </span>
              </div>

              <div className="bg-gray-50 rounded-b-lg p-2 flex flex-col gap-3 max-h-[70vh] overflow-y-auto">
                {filteredTasks.map((task) => {
                  const isExpanded = expandedTasks[task.id] || false;
                  const shortDesc =
                    task.description.length > 100
                      ? task.description.slice(0, 100) + "..."
                      : task.description;

                  return (
                    <div
                      key={task.id}
                      className="bg-white p-3 rounded-lg shadow hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-start relative">
                        <h4 className="mb-1 font-bold">{task.title}</h4>

                        <div className="flex items-center gap-2">
                          {(status === "Pending" || status === "Progress") && (
                            <button
                              onClick={() => handleUpdateClick(task)}
                              className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                            >
                              Update
                            </button>
                          )}

                          {/* 3-dot dropdown */}
                          <div className="relative mt-2">
                            <button
                              onClick={() => toggleMenu(task.id)}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition"
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>

                            {openMenuId === task.id && (
                              <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md border border-gray-200 z-50">
                                <button
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    openContactModal();
                                  }}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
                                >
                                  Create Contact
                                </button>
                                <button
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    openTaskModal();
                                    handleAssign(task.id)
                                  }}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
                                >
                                  Create Task
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between pt-2">
                          <p className="text-sm text-gray-500 font-bold">
                            {new Date(task.date).toLocaleDateString("en-GB")}
                          </p>
                          {task.team?.teamName && (
                            <p className="text-sm text-indigo-600 font-bold">
                              {task.team.teamName}
                            </p>
                          )}
                        </div>
                        <p
                          className="inline-flex items-center px-3 py-1 text-sm font-bold rounded-full 
                          bg-gradient-to-r from-red-400 to-pink-500 text-white shadow-md max-w-[150px]"
                        >
                          Priority: {task.priority}
                        </p>

                        <p className="text-sm text-gray-500 font-bold">
                          Description:{" "}
                          {isExpanded ? task.description : shortDesc}
                          {task.description.length > 100 && (
                            <span
                              onClick={() => toggleExpand(task.id)}
                              className="text-indigo-600 cursor-pointer ml-1 font-semibold"
                            >
                              {isExpanded ? "Show Less" : "Read More"}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {filteredTasks.length === 0 && (
                  <div className="text-center text-gray-400 mt-2 p-4">
                    No {status} assignment found.
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
      </div>

      {/* ✅ Contact Modal */}
      {isContactModalOpen && (
        <ContactModal
          isOpen={isContactModalOpen}
          onClose={closeContactModal}
          onSubmit={handleContactSubmit}
          formData={contactForm}
          errors={contactErrors}
          handleChange={handleContactChange}
          position="right"
        />
      )}

      {/* ✅ Task Modal */}
      {isTaskModalOpen && (
        <TaskModal
          showForm={isTaskModalOpen}
          closeForm={closeTaskModal}
          handleSubmit={handleTaskSubmit}
          formData={taskForm}
          errors={taskErrors}
          handleChange={handleTaskChange}
          requirements={requirements}
          position="right"
        />
      )}
      <div className="pt-4 px-4">
              <PipelineDiagram/>
            </div>
    </div>
  );
};

export default StaffDashboard;
