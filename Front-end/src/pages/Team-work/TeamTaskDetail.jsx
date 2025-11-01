import { useEffect, useState } from "react";
import axios from "../../instance/Axios";
import CallModal from "../../components/modals/CallModal";
import MeetingModal from "../../components/modals/MeetingModal";
import DocumentModal from "../../components/modals/DocumentModal";
import CustomTable from "../../components/CustomeTable";
import Swal from "sweetalert2";

import {
  FileText,
  Phone,
  Users,
  CheckSquare,
  Paperclip,
  ArrowLeft,
  Eye,
  Save,
  Plus, // Added Plus for the Add New button
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

/* --- Main Component --- */
export default function TaskDetail() {
  const state = true;
  const navigate = useNavigate();
  const { data } = useParams();

  const [rework, setRework] = useState(false)
  const [newupdate, setNewUpdate] = useState(true)

  // Safety check for URL data parsing
  let parsed = null;
  let taskId = null;
  if (data) {
    try {
      parsed = JSON.parse(decodeURIComponent(data));
      // Assuming taskId is part of the parsed object or derived from it
      taskId = parsed?.taskId || JSON.parse(data)?.taskId;
    } catch (e) {
      console.error("Could not parse URL data:", e);
    }
  }

  if (!parsed)
    return (
      <div className="p-10 text-center text-xl font-medium text-gray-500 min-h-screen bg-gray-100">
        Loading or invalid data…
      </div>
    );

  const id = taskId; // Use the parsed ID
  const action = parsed?.role; // ← read-only flag (e.g., if 'role' is present, it's read-only)

  // UI state
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);

  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentTaskId, setDocumentTaskId] = useState(null);
  const [refresh, setRefresh] = useState(false);

  // API state
  const [customer, setCustomer] = useState(null);
  const [calls, setCalls] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [attachments, setAttachments] = useState();
  const [taskDetails, setTaskDetails] = useState([]);
  const [teamWorkDetails, setTeamWorkDetails] = useState();

  // Stage state
  const [workStages, setWorkStages] = useState({
    pending1: false,
    pending2: false,
    pending3: false,
    pending4: false,
  });

  // Toggle logic updated for better UX: checking a stage checks all previous stages
  const toggleStage = (k) => {
    if (action) return; // block if read-only

    const stageKeyNumber = parseInt(k.replace("pending", ""), 10);
    setWorkStages((s) => {
      const newState = { ...s };
      const isCurrentlyChecked = s[k];

      if (isCurrentlyChecked) {
        // If unchecking, uncheck all subsequent stages as well
        for (let i = stageKeyNumber; i <= 4; i++) {
          newState[`pending${i}`] = false;
        }
      } else {
        // If checking, check all previous and current stages
        for (let i = 1; i <= stageKeyNumber; i++) {
          newState[`pending${i}`] = true;
        }
      }
      return newState;
    });
  };

  // Notes state
  const [notes, setNotes] = useState("");

  // Fetch customer details
  const fetchCustomerDetails = async () => {
    // Show loading alert
    Swal.fire({
      title: "Fetching Task Details...",
      didOpen: () => {
        Swal.showLoading();
      },
      allowOutsideClick: false,
      background: "#ffffff",
    });

    try {
      // NOTE: The parsed object is sent directly here as per the original code.
      const response = await axios.post("task/team/details/get", { parsed });
      const apiData = response.data?.data || {};
      console.log(apiData?.taskDetails[0])

      setRework(apiData?.taskDetails[0]?.rework)
      setNewUpdate(apiData?.taskDetails[0]?.newUpdate)
  
      setCustomer(apiData.customerDetails || null);
      setCalls(apiData.callDetails || []);
      setMeetings(apiData.meetingDetails || []);
      setTaskDetails(apiData.taskDetails || []);
      setAttachments(apiData.documents[0] || '');
      setNotes(apiData.taskDetails?.[0]?.notes || "");
      setTeamWorkDetails(apiData.taskDetails?.[0]?.teamWork || "");

      // Close loading and show success (optional)
      Swal.close();
    } catch (error) {
      console.error("Error found in fetching customer details", error);
      Swal.fire(
        "Error",
        "Failed to get customer details. Please try again.",
        "error"
      );
    }
  };
  

  useEffect(() => {
    fetchCustomerDetails();
  }, [refresh]); // only once on mount

  // When taskDetails change, update stage checkboxes
  useEffect(() => {
    if (taskDetails.length > 0) {
      const stage = parseInt(taskDetails[0].stage, 10) || 0;
      const newStages = {};
      for (let i = 1; i <= 4; i++) {
        newStages[`pending${i}`] = i <= stage;
      }
      setWorkStages(newStages);
      setNotes(taskDetails[0].notes || "");
    }
  }, [taskDetails]);

  // Check if notes or stages have changed
  const hasChanges = () => {
    if (!taskDetails[0]) return false;
    const originalNotes = taskDetails[0].notes || "";
    const originalStagesCount = parseInt(taskDetails[0].stage, 10) || 0;
    const checkedStagesCount = Object.values(workStages).filter(Boolean).length;

    return (
      notes !== originalNotes || checkedStagesCount !== originalStagesCount
    );
  };

  // Save handler
  const handleSave = () => {
    if (action) return; // block if read-only
    const checkedStagesCount = Object.values(workStages).filter(Boolean).length;
    const taskId = taskDetails[0]?.id;
    if (!taskId) {
      Swal.fire("Error", "Task ID not found. Cannot save.", "error");
      return;
    }
    updateStagesAndNotes(checkedStagesCount, notes, taskId);
    // Optimistically update taskDetails state so the save button disappears
    setTaskDetails((prev) => {
      if (!prev[0]) return prev;
      return [
        { ...prev[0], notes, stage: checkedStagesCount.toString() },
        ...prev.slice(1),
      ];
    });
  };

  const updateStagesAndNotes = async (stages, notes, id) => {
    const data = { stages, notes, id };

    // Show loading alert
    Swal.fire({
      title: "Updating Stages and Notes...",
      didOpen: () => {
        Swal.showLoading();
      },
      allowOutsideClick: false,
      background: "#ffffff",
    });

    try {
      const response = await axios.post("/task/team/stages_notest", { data });

      if (response?.data?.success || response) {
        // You may opt not to refetch on success if you optimistically updated the state
        // fetchCustomerDetails(); // Keeping this commented for a snappier UI, but available if needed for full refresh
        Swal.fire({
          icon: "success",
          title: "Updated successfully!",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        Swal.fire("Error", "Failed to update stages and notes.", "error");
      }
    } catch (error) {
      console.error("Error found in update stage and notes", error);
      Swal.fire(
        "Error",
        "Failed to update stages and notes. Please try again.",
        "error"
      );
      fetchCustomerDetails(); // Re-fetch on failure to sync state
    }
  };


  const updateWork = async ()=>{
    try {
    const taskId = taskDetails[0]?.id;
    if (!taskId) {
      Swal.fire("Error", "Task ID not found. Cannot save.", "error");
      return;
    }
     const response = await axios.patch("/task/rework/finish", { id });
     if(response){
       fetchCustomerDetails()
     }

    } catch (error) {
      console.error("Error found in update stage and notes", error);
      Swal.fire(
        "Error",
        "Failed to update stages and notes. Please try again.",
        "error"
      );
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="max-w-7xl mx-auto">
        {/* --- Header & Action Buttons --- */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6 justify-between gap-3">
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/team/task/subtask/${id}`)}
              className="flex items-center gap-2 text-sm font-medium text-white bg-indigo-600
                                 px-4 py-2 rounded-full shadow-lg hover:bg-indigo-700 hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
            >
              <Eye size={16} />
              View SubTasks
            </button>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-gray-700 bg-white border border-gray-300 px-4 py-2 rounded-full hover:bg-gray-50 transition shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>

        {/* ---- Main Content Area ---- */}
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Column 1: Task Details (Spans 2/3 of the width) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-xl shadow-xl p-6 border-t-4 border-indigo-600">
              <div className="flex items-center justify-between mb-6 border-b pb-4">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                  <span className="text-indigo-600">Task</span> Details
                </h1>
                {rework && !newupdate && !action && <button
                  className="px-5 py-2 text-white text-sm font-semibold rounded-lg shadow-lg hover:shadow-xl transition duration-150 bg-blue-600 hover:bg-blue-700"
                    onClick={updateWork}                  >
                  Mark as Complete
                </button>
              }
              </div>

              {/* Personal Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Detail label="Customer Name" value={customer?.name || "N/A"} />
                <Detail
                  label="Email Address"
                  value={customer?.email || "N/A"}
                />
                <Detail label="Phone Number" value={customer?.phone || "N/A"} />
                <Detail label="Lead Source" value={customer?.source || "N/A"} />
                <Detail
                  label="Budgeted Amount"
                  value={customer?.amount || "N/A"}
                />
                <Detail
                  label="Priority Level"
                  value={taskDetails[0]?.priority || "N/A"}
                />
                <Detail
                  label="Project Type"
                  value={taskDetails[0]?.requirement || "N/A"}
                />
              </div>

              {/* Work Description */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Work Description
                </h3>
                <div className="border border-gray-200 rounded-lg bg-gray-50 p-4 text-sm text-gray-700 leading-relaxed shadow-inner">
                  {customer?.description || "No description provided."}
                </div>
              </div>

              {/* Work Stages and Notes in a Two-Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                {/* Work Stages */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-green-600" /> Current
                    Stages
                  </h3>
                  <div
                    className={`border border-gray-200 rounded-lg p-4 text-sm shadow-inner ${
                      action ? "bg-gray-100" : "bg-white"
                    }`}
                  >
                    <div className="flex flex-col gap-3">
                      {[
                        {
                          label: "Not Started",
                          key: "pending1",
                          disabled: true,
                        },
                        { label: "Ongoing", key: "pending2", disabled: false },
                        { label: "Review", key: "pending3", disabled: false },
                        { label: "Completed", key: "pending4", disabled: true },
                      ].map((stage) => (
                        <label
                          key={stage.key}
                          className={`flex items-center gap-3 text-sm font-medium p-2 rounded-md transition-all duration-200 ${
                            workStages[stage.key]
                              ? "bg-green-100 text-green-800 border border-green-300 shadow-sm"
                              : "bg-white text-gray-700 hover:bg-gray-50"
                          } ${
                            stage.disabled || action
                              ? "opacity-70 cursor-default"
                              : "cursor-pointer"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 accent-green-600"
                            checked={workStages[stage.key]}
                            disabled={stage.disabled || action}
                            onChange={() => toggleStage(stage.key)}
                          />
                          {stage.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Team Notes
                  </h3>
                  <textarea
                    rows={7}
                    className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 shadow-inner resize-none ${
                      action
                        ? "bg-gray-100 border-gray-200 text-gray-600"
                        : "bg-white border-gray-300"
                    }`}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Type any relevant notes or updates here..."
                    disabled={action}
                  />
                </div>
              </div>

              {/* Save Button */}
              {!action && hasChanges() && (
                <div className="mt-8 w-full flex justify-end">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-green-700 transition shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    <Save size={18} />
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Records & Activity (Spans 1/3 of the width) */}
          <div className="lg:col-span-1 space-y-6 mt-8 lg:mt-0">
            <div className="bg-white rounded-xl shadow-xl p-6 space-y-10">
              {/* Attachments */}
              <section className="border-b pb-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Paperclip className="w-5 h-5 text-blue-600" /> Documents
                  </h3>
                  {!action && (
                    <div className="relative">
                      <button
                        onClick={() => setAddMenuOpen((o) => !o)}
                        className="flex items-center gap-1 bg-indigo-500 text-white px-3 py-1.5 rounded-full hover:bg-indigo-600 transition text-sm font-medium shadow-md"
                      >
                        <Plus size={16} /> Add New
                      </button>

                      {/* Dropdown menu (Styled with shadow and transition) */}
                      {addMenuOpen && (
                        <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-2xl z-10 overflow-hidden transform origin-top-right animate-fade-in">
                          <button
                            onClick={() => {
                              setAddMenuOpen(false);
                              setDocumentTaskId(taskDetails[0]?.id); // Set the current task ID
                              setShowDocumentModal(true); // Open the modal
                            }}
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 flex items-center gap-2"
                          >
                            <Paperclip className="w-4 h-4 text-indigo-500" />{" "}
                            Attach Document
                          </button>
                          <button
                            onClick={() => {
                              setAddMenuOpen(false);
                              setShowCallModal(true);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 flex items-center gap-2"
                          >
                            📞 Add new call
                          </button>
                          <button
                            onClick={() => {
                              setAddMenuOpen(false);
                              setShowMeetingModal(true);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 flex items-center gap-2"
                          >
                            💻 Add new Meeting
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                 {!attachments ||
              (Array.isArray(attachments)
                ? attachments.length === 0
                : Object.keys(attachments).length === 0) ? (
                <div className="p-4 text-center text-sm text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  No attachments found.
                </div>
              ) : (
                <div className="p-4 bg-white rounded-lg shadow">
                  {(Array.isArray(attachments)
                    ? attachments
                    : [attachments]
                  ).map((item, index) => (
                    <div
                      key={index}
                      className="border-b border-gray-200 pb-3 mb-3 last:border-none last:pb-0 last:mb-0"
                    >
                      <p className="text-sm font-medium text-gray-700">
                        <span className="font-semibold text-gray-900">
                          Description:
                        </span>{" "}
                        {item.description || "—"}
                      </p>

                      <div className="text-sm text-gray-700 mt-1">
                        <span className="font-semibold text-gray-900">
                          Requirements:
                        </span>
                        {item.requirements && item.requirements.length > 0 ? (
                          <div className="mt-1 space-y-1">
                            {item.requirements.map((req, i) => (
                              <label
                                key={i}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type="checkbox"
                                  checked
                                  readOnly
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                                />
                                <span>{req}</span>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <span> — </span>
                        )}
                      </div>

                      <p className="text-sm font-medium text-gray-700">
                        <span className="font-semibold text-gray-900">
                          URL:
                        </span>{" "}
                        {item.url ? (
                          <a
                            href={item.url} // external URL
                            target="_blank" // open in new tab
                            rel="noopener noreferrer" // security
                            className="text-blue-600 hover:underline"
                            onClick={(e) => e.stopPropagation()} // important!
                          >
                            Open File
                          </a>
                        ) : (
                          "—"
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              </section>

              {/* Calls Section */}
            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2 border-b pb-3">
                <Phone className="w-5 h-5 text-purple-600" /> Call Logs
              </h3>

              {/* 🔹 Pending Calls */}
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 border-b pb-3">
                Pending
              </h3>
              {calls.filter((c) => c.status.toLowerCase() === "pending")
                .length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  No pending calls.
                </div>
              ) : (
                <CustomTable
                  columns={[
                    { key: "date", label: "Date" },
                    { key: "subject", label: "Subject" },
                    { key: "status", label: "Status" },
                  ]}
                  data={calls
                    .filter((c) => c.status.toLowerCase() === "pending")
                    .map((c) => ({
                      date: `${c.date} ${c.time}`,
                      subject: c.subject,
                      status: (
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            c.status === "Completed"
                              ? "bg-green-100 text-green-800"
                              : c.status === "Cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {c.status}
                        </span>
                      ),
                    }))}
                />
              )}

              {/* 🔹 History Calls (Completed or Cancelled) */}
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 border-b pb-3">
                History
              </h3>
              {calls.filter((c) =>
                ["completed", "cancelled"].includes(c.status.toLowerCase())
              ).length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  No completed or cancelled calls.
                </div>
              ) : (
                <CustomTable
                  columns={[
                    { key: "date", label: "Date" },
                    { key: "subject", label: "Subject" },
                    { key: "status", label: "Status" },
                  ]}
                  data={calls
                    .filter((c) =>
                      ["completed", "cancelled"].includes(
                        c.status.toLowerCase()
                      )
                    )
                    .map((c) => ({
                      date: `${c.date} ${c.time}`,
                      subject: c.subject,
                      status: (
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            c.status === "Completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {c.status}
                        </span>
                      ),
                    }))}
                />
              )}
            </section>

            {/* Meetings Section */}
            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2 border-b pb-3">
                <Users className="w-5 h-5 text-orange-600" /> Meetings
              </h3>

              {/* 🔹 Pending Meetings */}
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 border-b pb-3">
                Pending
              </h3>
              {meetings.filter((m) => m.status?.toLowerCase() === "pending")
                .length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  No pending meetings.
                </div>
              ) : (
                <CustomTable
                  columns={[
                    { key: "date", label: "Date" },
                    { key: "subject", label: "Subject" },
                    { key: "host", label: "Host" },
                    { key: "status", label: "Status" },
                  ]}
                  data={meetings
                    .filter((m) => m.status?.toLowerCase() === "pending")
                    .map((m) => ({
                      date: `${m.meetingDate} ${m.startTime} - ${m.endTime}`,
                      subject: m.subject,
                      host: m.name || "N/A",
                      status: (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                          {m.status}
                        </span>
                      ),
                    }))}
                />
              )}

              {/* 🔹 History Meetings */}
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 border-b pb-3">
                History
              </h3>
              {meetings.filter((m) =>
                ["completed", "cancelled"].includes(m.status?.toLowerCase())
              ).length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  No completed or cancelled meetings.
                </div>
              ) : (
                <CustomTable
                  columns={[
                    { key: "date", label: "Date" },
                    { key: "subject", label: "Subject" },
                    { key: "host", label: "Host" },
                    { key: "status", label: "Status" },
                  ]}
                  data={meetings
                    .filter((m) =>
                      ["completed", "cancelled"].includes(
                        m.status?.toLowerCase()
                      )
                    )
                    .map((m) => ({
                      date: `${m.meetingDate} ${m.startTime} - ${m.endTime}`,
                      subject: m.subject,
                      host: m.name || "N/A",
                      status: (
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            m.status?.toLowerCase() === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {m.status}
                        </span>
                      ),
                    }))}
                />
              )}
            </section>

              {/* Connected Records / Team Work */}
              <section>
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Connected Records / Team Work
                </h3>
                <div className="space-y-3">
                  {teamWorkDetails && teamWorkDetails.length > 0 ? (
                    teamWorkDetails
                      ?.slice()
                      .reverse()
                      .map((item, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4 bg-gray-50 text-gray-700 shadow-sm transition duration-150 border-l-4 border-l-indigo-400"
                        >
                          <p className="text-sm font-medium">{item}</p>
                        </div>
                      ))
                  ) : (
                    <div className="border border-gray-300 border-dashed rounded-lg p-6 text-center text-gray-500 italic bg-gray-50">
                      No team work records found.
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* 👇 Modals only if not read-only */}
      {!action && showCallModal && (
        <CallModal
          onClose={() => setShowCallModal(false)}
          taskDetails={taskDetails[0]}
          customer={customer}
          state={state}
          onSubmitSuccess={fetchCustomerDetails}
        />
      )}
      {!action && showMeetingModal && (
        <MeetingModal
          onClose={() => setShowMeetingModal(false)}
          taskDetails={taskDetails[0]}
          customer={customer}
          state={state}
          onSubmitSuccess={fetchCustomerDetails}
        />
      )}
       {showDocumentModal && (
        <DocumentModal
          onClose={() => setShowDocumentModal(false)}
          taskId={documentTaskId} 
          setRefresh={setRefresh}
          refresh={refresh}
        />
      )}
    </div>
  );
}

/* --- Detail Row (Improved Design) --- */
function Detail({ label, value }) {
  return (
    <div className="flex flex-col p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:border-indigo-400 transition-colors">
      <span className="text-xs font-medium uppercase text-gray-500 tracking-wider mb-0.5">
        {label}
      </span>
      <span className="text-sm font-bold text-gray-800 truncate">{value}</span>
    </div>
  );
}
