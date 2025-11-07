import React, { useEffect, useState } from "react";
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
  ChevronsRight,
  Plus,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

/* --- Main Component --- */
export default function TaskDetail() {
  const state = false; // Kept for modal props
  const navigate = useNavigate();
  const { data } = useParams();

  // UI state
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);

  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentTaskId, setDocumentTaskId] = useState(null);
  const [refresh, setRefresh] = useState(false);

  // Parse URL data
  let parsed = null;
  if (data) {
    try {
      parsed = JSON.parse(decodeURIComponent(data));
    } catch (e) {
      console.error("Could not parse data:", e);
    }
  }
  // Simplified check: If data is not parsed, show loading
  if (!parsed)
    return (
      <div className="p-10 text-center text-xl font-medium text-gray-500">
        Loading or invalid data…
      </div>
    );

  const isUpdate = parsed?.data.update;
  const newUpdate = parsed?.data.clear;

  // API state
  const [customer, setCustomer] = useState(null);
  const [calls, setCalls] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [attachments, setAttachments] = useState(); // API not providing attachments
  const [taskDetails, setTaskDetails] = useState([]);

  // Stage state
  const [workStages, setWorkStages] = useState({
    pending1: false,
    pending2: false,
    pending3: false,
    pending4: false,
  });
  // Toggling a stage also checks all previous stages
  const toggleStage = (k) => {
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
    try {
      const response = await axios.post("task/details/get", { parsed });

      const apiData = response.data?.data || {};
      setCustomer(apiData.customerDetails || null);
      setCalls(apiData.callDetails || []);
      setMeetings(apiData.meetingDetails || []);
      setTaskDetails(apiData.taskDetails || []);
      setAttachments(apiData.documents[0]); // Still empty as per your comment
      setNotes(apiData.taskDetails?.[0]?.notes || "");
    } catch (error) {
      Swal.fire("Error", "Failed to get customer details.", "error");
      console.log("error found in fetching customer details", error);
    }
  };

  useEffect(() => {
    fetchCustomerDetails();
  }, []); // only once on mount

  // When taskDetails change, update stage checkboxes and notes
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
    const checkedStagesCount = Object.values(workStages).filter(Boolean).length;
    // Log the current state of workStages for debugging before calculating count
    const stagesToSubmit = checkedStagesCount;
    const taskId = taskDetails[0]?.id;

    if (!taskId) {
      Swal.fire("Error", "Task ID not found. Cannot save.", "error");
      return;
    }

    updateStagesAndNotes(stagesToSubmit, notes, taskId);

    // Optimistically update taskDetails state so the save button disappears
    setTaskDetails((prev) => {
      if (!prev[0]) return prev;
      return [
        { ...prev[0], notes, stage: stagesToSubmit.toString() },
        ...prev.slice(1),
      ];
    });
  };

  const updateStagesAndNotes = async (stages, notes, id) => {
    const data = { stages, notes, id };

    try {
      Swal.fire({
        title: "Updating...",
        text: "Please wait while we update stages and notes",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await axios.post("/task/stages_notes", { data });

      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Stages and notes have been successfully updated.",
        timer: 2000,
        showConfirmButton: false,
      });

      console.log("response", response);
      return response.data;
    } catch (error) {
      console.error("Error updating stages and notes", error);

      Swal.fire({
        icon: "error",
        title: "Failed!",
        text: "Failed to update stages and notes. Please try again later.",
      });
      fetchCustomerDetails(); // Re-fetch to revert local state to actual state
    }
  };

  const updateWork = async () => {
    try {
      // Safely get the task ID
      const id = taskDetails[0]?.id;

      if (!id) {
        Swal.fire({
          icon: "warning",
          title: "Task not found",
          text: "No task ID available to update.",
        });
        return;
      }

      // Show loading while API request is in progress
      Swal.fire({
        title: isUpdate && newUpdate ? "Rejecting..." : "Updating rework...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await axios.patch("/task/rework/finish", { id });

      Swal.close(); // Close the loading alert

      if (response?.data?.success) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text:
            isUpdate && newUpdate
              ? "Rework rejected successfully."
              : "Rework updated successfully.",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          navigate(-1); // Go back one page
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text:
            response?.data?.message ||
            `Failed to ${isUpdate && newUpdate ? "reject" : "update"} rework.`,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to process rework. Please try again later.",
      });
      console.error("Failed to set rework:", error);
    }
  };

  // Helper component to display work stage labels with an icon
  const workStageLabels = [
    { label: "Not Started", key: "pending1", color: "text-red-500" },
    { label: "Ongoing", key: "pending2", color: "text-yellow-500" },
    { label: "Review", key: "pending3", color: "text-indigo-500" },
    { label: "Completed", key: "pending4", color: "text-green-500" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* --- Header/Back Button --- */}
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium text-indigo-600 bg-indigo-100 px-4 py-2 rounded-full hover:bg-indigo-200 transition duration-150 shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tasks
        </button>
      </div>

      {/* ---- Main Content Grid ---- */}
      <div className="max-w-7xl mx-auto lg:grid lg:grid-cols-3 lg:gap-8">
        {/* Column 1: Task & Customer Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-xl p-6 border-t-4 border-indigo-600">
            <div className="flex items-center justify-between mb-6 border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <ChevronsRight className="w-6 h-6 text-indigo-600" />
                Task Overview
              </h2>
              {/* Conditional Update/Reject Button */}
              {isUpdate && (
                <button
                  className={`px-5 py-2 text-white text-sm font-semibold rounded-lg shadow-lg hover:shadow-xl transition duration-150 ${
                    newUpdate
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                  onClick={() => updateWork()}
                >
                  {newUpdate ? "Reject Rework" : "Mark as Complete"}
                </button>
              )}
            </div>

            {/* Customer Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
              <Detail label="Customer Name" value={customer?.name || "N/A"} />
              <Detail label="Email Address" value={customer?.email || "N/A"} />
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
              <div className="border border-gray-200 bg-gray-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed shadow-inner">
                {customer?.description || "No description provided."}
              </div>
            </div>

            {/* Work Stages */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-indigo-600" /> Progress
                Stages
              </h3>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {workStageLabels.map((stage, i) => (
                    <label
                      key={stage.key}
                      className={`flex items-center gap-2 text-sm font-medium p-2 rounded-md transition-all duration-200 cursor-pointer ${
                        workStages[stage.key]
                          ? "bg-indigo-100 border border-indigo-300 shadow-sm"
                          : "bg-white hover:bg-gray-100"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 accent-indigo-600"
                        checked={workStages[stage.key]}
                        disabled={i === 0 || i === 3} // Not Started and Completed are disabled
                        onChange={() => toggleStage(stage.key)}
                      />
                      <span
                        className={
                          workStages[stage.key]
                            ? "text-indigo-800"
                            : "text-gray-700"
                        }
                      >
                        {stage.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Internal Notes
              </h3>
              <textarea
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm bg-white shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 resize-none"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add detailed notes about the task status and progress..."
              />
            </div>

            {/* Save Button */}
            {hasChanges() && (
              <div className="mt-6 w-full flex justify-end">
                <button
                  onClick={handleSave}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold shadow-md hover:bg-green-700 transition duration-150 transform hover:scale-[1.02]"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Records & Activity */}
        <div className="lg:col-span-1 space-y-6 mt-6 lg:mt-0">
          <div className="bg-white rounded-xl shadow-xl p-6 space-y-8">
            {/* Attachments Section */}
            <section>
              <div className="flex justify-between items-center border-b pb-3 mb-4">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-600" /> Documents
                </h3>
                {/* Add New Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setAddMenuOpen((o) => !o)}
                    className="flex items-center gap-1 bg-indigo-500 text-white px-4 py-2 text-sm font-medium rounded-full hover:bg-indigo-600 transition duration-150 shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    Add New
                  </button>

                  {/* Dropdown menu */}
                  {addMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-2xl z-20 overflow-hidden transform origin-top-right animate-fade-in">
                      <button
                        onClick={() => {
                          setAddMenuOpen(false);
                          setDocumentTaskId(taskDetails[0]?.id); // Set the current task ID
                          setShowDocumentModal(true); // Open the modal
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 flex items-center gap-2"
                      >
                        <Paperclip className="w-4 h-4 text-indigo-500" /> Attach
                        Document
                      </button>
                      <button
                        onClick={() => {
                          setAddMenuOpen(false);
                          setShowCallModal(true); // open modal
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 flex items-center gap-2"
                      >
                        <Phone className="w-4 h-4 text-purple-500" /> Log New
                        Call
                      </button>
                      <button
                        onClick={() => {
                          setAddMenuOpen(false);
                          setShowMeetingModal(true); // open modal
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 flex items-center gap-2"
                      >
                        <Users className="w-4 h-4 text-orange-500" /> Schedule
                        Meeting
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Using a simplified list for design since data is empty */}
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
                    { key: "type", label: "Type" },
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
                      type: m.type || "N/A",
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
                    { key: "type", label: "Type" },
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
                      type: m.type || "N/A",
                    }))}
                />
              )}
            </section>
          </div>

          {/* Connected Records (Empty State) */}
          {/* <div className="bg-white rounded-xl shadow-xl p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Connected Records
            </h3>
            <div className="border border-gray-300 border-dashed rounded-lg p-6 text-center text-gray-500 italic bg-gray-50">
              No additional connected records found.
            </div>
          </div> */}
        </div>
      </div>

      {/* 👇 Modal at the end */}
      {showCallModal && (
        <CallModal
          onClose={() => setShowCallModal(false)}
          taskDetails={taskDetails[0]}
          customer={customer}
          state={state}
          onSubmitSuccess={fetchCustomerDetails}
        />
      )}
      {showMeetingModal && (
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
          taskId={documentTaskId} // Pass the task ID
          setRefresh={setRefresh}
          refresh={refresh}
        />
      )}
    </div>
  );
}

/* --- Detail Row (Styled) --- */
function Detail({ label, value }) {
  return (
    <div className="flex flex-col bg-gray-50 p-3 rounded-lg border border-gray-200">
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
        {label}
      </span>
      <span className="text-sm font-semibold text-gray-800 truncate">
        {value || "N/A"}
      </span>
    </div>
  );
}
