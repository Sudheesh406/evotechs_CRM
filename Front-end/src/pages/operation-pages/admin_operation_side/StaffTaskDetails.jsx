import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FileText,
  Phone,
  Users,
  CheckSquare,
  Paperclip,
  ArrowLeft,
  XCircle, // Added XCircle for Rework/Restore visual
} from "lucide-react";
import axios from "../../../instance/Axios";
import Swal from "sweetalert2";

import CustomTable from "../../../components/CustomeTable";
import { button } from "framer-motion/client";
/* --- Main Component --- */
export default function TaskDetailDemo() {
  const [taskData, setTaskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStage, setCurrentStage] = useState(0);
  const [update, setUpdate] = useState(false);
  const [completeSubmition, setCompleteSubmition] = useState(true);
  const [completeUpdate, setCompleteUpdate] = useState(true);
  const [invoiceDetails, setInvoiceDetails] = useState(true);

  const { data } = useParams();
  const navigate = useNavigate();

  let parsed = null;
  if (data) {
    try {
      parsed = JSON.parse(decodeURIComponent(data));
    } catch (e) {
      console.error("Could not parse data:", e);
    }
  }

  // Use optional chaining for safer access
  const isPending = parsed?.data?.pending;
  const isCompleted = parsed?.data?.completed;
  const isResolve = parsed?.data?.resolve;

  const getTaskDetails = async () => {
    if (!parsed) return;
    setLoading(true);
    try {
      const response = await axios.post("task/admin/details/get", { parsed });
      // console.log('response',response?.data?.data.taskDetails[0]?.invoices)
      setInvoiceDetails(response?.data?.data.taskDetails[0]?.invoices);

      if (response.data.success) {
        setTaskData(response.data.data);
        if (response?.data?.data?.taskDetails[0]?.stage == "4") {
          setCompleteSubmition(false);
        } else {
          setCompleteSubmition(true);
        }
        setUpdate(response?.data?.data?.taskDetails[0]?.newUpdate);
        if (response?.data?.data?.taskDetails[0]?.newUpdate) {
          setCompleteUpdate(false);
        }
        // Ensure stage is parsed as a number, defaulting to 0
        setCurrentStage(
          parseInt(response.data.data.taskDetails?.[0]?.stage, 10) || 0
        );
      }
      if (isResolve) {
        setCompleteUpdate(false);
      }
    } catch (error) {
      console.error("Error in get task details", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTaskDetails();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 text-lg font-medium text-indigo-600">
        Loading task details…
      </div>
    );
  if (!taskData)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 text-lg font-medium text-gray-500">
        No data found
      </div>
    );

    console.log('invoiceDetails',invoiceDetails)

  const customer = taskData.customerDetails || {};
  const taskDetails = taskData.taskDetails?.[0] || {};
  const attachments = taskData.attachments || [];
  const calls = taskData.callDetails || [];
  const meetings = taskData.meetingDetails || [];

  const handleStageChange = async (stageNum) => {
    // Only allow manual change for the "Completed" stage (stage 4)
    if (stageNum !== 4) return;

    // Toggle logic for stage 4: 4 -> 3, or non-4 -> 4
    const newStage = currentStage === 4 ? 3 : 4;
    const oldStage = currentStage;

    // Optimistically update the UI
    setCurrentStage(newStage);

    try {
      const response = await axios.post("/task/stage/update", {
        taskId: taskDetails.id,
        stage: newStage,
      });

      if (response?.data?.success) {
        // Successful update, re-fetch data to sync all component state (like isCompleted)
        getTaskDetails();
        Swal.fire({
          icon: "success",
          title: "Stage Updated!",
          text: "Task stage updated successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        throw new Error(response?.data?.message || "Failed to update stage");
      }
    } catch (err) {
      console.error("Failed to update stage:", err);
      Swal.fire({
        icon: "error",
        title: "Failed to update stage",
        text: err.message,
      });
      // Revert UI change on failure
      setCurrentStage(oldStage);
    }
  };

  const reworkUpdate = async () => {
    try {
      const id = taskDetails.id;
      if (!id) {
        Swal.fire({
          icon: "warning",
          title: "Task ID not found",
        });
        return;
      }

      const actionText = isPending ? "Restore" : "Rework";

      // Call the API to toggle rework
      const response = await axios.patch("/task/rework/update", { id });

      if (response?.data?.success) {
        Swal.fire({
          icon: "success",
          title: `${actionText} Updated!`,
          text: `${actionText} updated successfully!`,
          confirmButtonText: "OK",
        }).then(() => navigate(-1));
      } else {
        console.warn(
          `Failed to update ${actionText}:`,
          response?.data?.message
        );
        Swal.fire({
          icon: "error",
          title: `Failed to update ${actionText}`,
          text: response?.data?.message || "Unknown error",
        });
      }
    } catch (error) {
      console.error("Failed to process rework/restore:", error);
      Swal.fire({
        icon: "error",
        title: "Unexpected Error",
        text: "An unexpected error occurred while updating rework status.",
      });
    }
  };

  const reworkAgain = async () => {
    try {
      const id = taskDetails.id;
      const response = await axios.patch("/task/rework/update/direct", { id });
      if (response) {
        Swal.fire({
          icon: "success",
          title: "Rework Updated!",
          text: "Rework status updated successfully.",
          confirmButtonText: "OK",
        }).then(() => navigate(-1));
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed!",
          text: "Failed to update.",
        });
      }
    } catch (error) {
      console.error("Failed to process rework/restore:", error);
      Swal.fire({
        icon: "error",
        title: "Unexpected Error",
        text: "An unexpected error occurred while updating rework status.",
      });
    }
  };

  // Helper to determine Rework button styling/text
  const reworkButton = (() => {
    if (!isCompleted) return null; // Only show if task is completed

    if (isPending) {
      return (
        <div className="flex gap-2">
          {/* {completeSubmition && update && (
            <button
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-full shadow-md hover:bg-orange-600 transition transform hover:scale-[1.02]"
              onClick={reworkUpdate}
            >
              Restore
            </button>
          )} */}
          {update && completeSubmition && (
            <button
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-full shadow-md hover:bg-red-600 transition transform hover:scale-[1.02]"
              onClick={reworkAgain}
            >
              <XCircle className="w-4 h-4" />
              Rework Again
            </button>
          )}
        </div>
      );
    } else {
      return (
        <div>
          {completeSubmition && (
            <button
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-full shadow-md hover:bg-red-700 transition transform hover:scale-[1.02]"
              onClick={reworkUpdate}
            >
              <XCircle className="w-4 h-4" />
              Set to Rework
            </button>
          )}
        </div>
      );
    }
  })();

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="max-w-6xl mx-auto">
        {/* --- Header & Action Buttons --- */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            <span className="text-indigo-600">Task</span> Administration
          </h1>
          <button
            className="flex items-center gap-2 text-sm text-gray-700 bg-white border border-gray-300 px-4 py-2 rounded-full hover:bg-gray-50 transition shadow-md"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to List
          </button>
        </div>

        {/* --- Main Content Layout --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Customer Overview (Spans 2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-xl p-6 border-t-4 border-indigo-600">
              {/* Header with Rework/Restore Button */}
              <div className="flex items-center justify-between mb-6 border-b pb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Customer & Task Summary
                </h2>
                {reworkButton}
              </div>

              {/* Personal Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Detail label="Customer Name" value={customer.name} />
                <Detail label="Email Address" value={customer.email} />
                <Detail label="Phone Number" value={customer.phone} />
                <Detail label="Lead Source" value={customer.source} />
                <Detail label="Budgeted Amount" value={customer.amount} />
                <Detail label="Priority Level" value={taskDetails.priority} />
                <Detail label="Project Type" value={taskDetails.requirement} />
                {invoiceDetails?.length > 0 && (
                  <>
                    {/* FIXED LINK COMPONENT CALL BELOW */}
                    <DetailUpdate
                      label="Link"
                      value={invoiceDetails[0]?.link}
                      isLink={true}
                    />

                    <Detail
                      label="Payment"
                      value={invoiceDetails[0]?.paid ? "Paid" : "Unpaid"}
                    />

                    <Detail
                      label="Paid Amount"
                      value={invoiceDetails[0]?.amount || "N/A"}
                    />
                  </>
                )}
              </div>

              {/* Work Description */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Work Description
                </h3>
                <div className="border border-gray-200 rounded-lg bg-gray-50 p-4 text-sm text-gray-700 leading-relaxed shadow-inner">
                  {customer.description || "No description provided."}
                </div>
              </div>

              {/* Work Stages and Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {/* Work Stages */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-green-600" /> Current
                    Stages
                  </h3>
                  <div className="border border-gray-200 rounded-lg bg-white p-4 text-sm shadow-inner min-h-[160px]">
                    <div className="flex flex-col gap-3">
                      {[
                        { num: 1, label: "Not Started" },
                        { num: 2, label: "Ongoing" },
                        { num: 3, label: "Review" },
                        { num: 4, label: "Completed" },
                      ].map((stage) => (
                        <label
                          key={stage.num}
                          className={`flex items-center gap-3 text-sm font-medium p-2 rounded-md transition-all duration-200 ${
                            currentStage >= stage.num
                              ? "bg-green-100 text-green-800 border border-green-300 shadow-sm"
                              : "bg-white text-gray-700 hover:bg-gray-50"
                          } ${
                            stage.num !== 4 || completeUpdate
                              ? "opacity-70 cursor-default"
                              : "cursor-pointer"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 accent-green-600"
                            checked={currentStage >= stage.num}
                            // Only stage 4 is manually clickable by the admin, unless pending is true (in which case, it's blocked)
                            disabled={stage.num !== 4 || completeUpdate}
                            onChange={() => handleStageChange(stage.num)}
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
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50 text-gray-700 shadow-inner resize-none focus:outline-none"
                    value={taskDetails.notes || "No team notes added."}
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Records (Spans 1/3) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-xl p-6 space-y-8">
              {/* Attachments */}
              <section className="border-b pb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Paperclip className="w-5 h-5 text-blue-600" /> Documents
                </h3>
                <CustomTable
                  columns={[
                    { key: "name", label: "File" },
                    {
                      key: "action",
                      label: "Action",
                      className: "w-24 text-right",
                    },
                  ]}
                  data={
                    attachments.length
                      ? attachments.map((a) => ({
                          ...a,
                          action: (
                            <button className="px-3 py-1 text-xs rounded-full bg-blue-500 text-white hover:bg-blue-600 transition font-medium">
                              Download
                            </button>
                          ),
                        }))
                      : [{ name: "No records found", action: "-" }]
                  }
                  renderCell={(key, row) => {
                    if (key === "name") {
                      return (
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-blue-500" />
                          <span className="font-medium text-gray-700 truncate">
                            {row.name}
                          </span>
                        </div>
                      );
                    }
                    return row[key];
                  }}
                />
              </section>

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
          </div>
        </div>
      </div>
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
      <span className="text-sm font-bold text-gray-800 truncate">
        {value || "N/A"}
      </span>
    </div>
  );
}

function DetailUpdate({ label, value, isLink = false }) {
  // Check if link is valid
  const hasValue = value && value !== "N/A";

  return (
    <div className="flex flex-col bg-gray-50 p-3 rounded-lg border border-gray-200">
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
        {label}
      </span>

      {isLink && hasValue ? (
        <a
          href={value.startsWith("http") ? value : `https://${value}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-blue-600 underline truncate hover:text-blue-800"
        >
          {value}
        </a>
      ) : (
        <span className="text-sm font-semibold text-gray-800 truncate">
          {value || "N/A"}
        </span>
      )}
    </div>
  );
}
