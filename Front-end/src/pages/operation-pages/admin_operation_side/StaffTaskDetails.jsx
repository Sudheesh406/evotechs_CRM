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

/* --- Main Component --- */
export default function TaskDetailDemo() {
  const [taskData, setTaskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStage, setCurrentStage] = useState(0);

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

  const getTaskDetails = async () => {
    if (!parsed) return;
    setLoading(true);
    try {
      const response = await axios.post("task/admin/details/get", { parsed });
      if (response.data.success) {
        setTaskData(response.data.data);
        // Ensure stage is parsed as a number, defaulting to 0
        setCurrentStage(parseInt(response.data.data.taskDetails?.[0]?.stage, 10) || 0);
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
      } else {
        throw new Error(response?.data?.message || "Failed to update stage");
      }
    } catch (err) {
      console.error("Failed to update stage:", err);
      alert(`Failed to update stage: ${err.message}`);
      // Revert UI change on failure
      setCurrentStage(oldStage); 
    }
  };

  const reworkUpdate = async () => {
    try {
      const id = taskDetails.id;
      if (!id) return alert("Task ID not found.");

      const actionText = isPending ? 'Restore' : 'Rework';
      console.log(`Attempting ${actionText} for Task ID: ${id}`);

      // Call the API to toggle rework
      const response = await axios.patch("/task/rework/update", { id });

      if (response?.data?.success) {
        console.log(`${actionText} updated successfully:`, response.data);
        // Show success message before navigating
        alert(`${actionText} updated successfully!`);
        navigate(-1); // Go back one page
      } else {
        console.warn(`Failed to update ${actionText}:`, response?.data?.message);
        alert(`Failed to update ${actionText}: ${response?.data?.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Failed to process rework/restore:", error);
      alert("An unexpected error occurred while updating rework status.");
    }
  };

  // Helper to determine Rework button styling/text
  const reworkButton = (() => {
    if (!isCompleted) return null; // Only show if task is completed
    
    if (isPending) {
        return (
            <button
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-full shadow-md hover:bg-orange-600 transition transform hover:scale-[1.02]"
                onClick={reworkUpdate}
            >
                <XCircle className="w-4 h-4" />
                Restore
            </button>
        );
    } else {
        return (
            <button
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-full shadow-md hover:bg-red-700 transition transform hover:scale-[1.02]"
                onClick={reworkUpdate}
            >
                <XCircle className="w-4 h-4" />
                Set to Rework
            </button>
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
                    <CheckSquare className="w-5 h-5 text-green-600" /> Current Stages
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
                          } ${stage.num !== 4 || isPending ? 'opacity-70 cursor-default' : 'cursor-pointer'}`}
                        >
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 accent-green-600"
                            checked={currentStage >= stage.num}
                            // Only stage 4 is manually clickable by the admin, unless pending is true (in which case, it's blocked)
                            disabled={stage.num !== 4 || isPending}
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
                    { key: "action", label: "Action", className: "w-24 text-right" },
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
                          <span className="font-medium text-gray-700 truncate">{row.name}</span>
                        </div>
                      );
                    }
                    return row[key];
                  }}
                />
              </section>

              {/* Calls */}
              <section className="border-b pb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-purple-600" /> Calls History
                </h3>
                <CustomTable
                  columns={[
                    { key: "date", label: "Date" },
                    { key: "status", label: "Status" },
                  ]}
                  data={
                    calls.length
                      ? calls.map((c) => ({
                          date: c.date,
                          status: (
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              c.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {c.status}
                            </span>
                          ),
                        }))
                      : [{ date: "No data found", status: "-" }]
                  }
                />
              </section>

              {/* Meetings */}
              <section className="border-b pb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-orange-600" /> Meetings Log
                </h3>
                <CustomTable
                  columns={[
                    { key: "date", label: "Date" },
                    { key: "host", label: "Host" },
                  ]}
                  data={
                    meetings.length
                      ? meetings.map((m) => ({
                          date: m.meetingDate,
                          host: m.name || "N/A",
                        }))
                      : [{ date: "No data found", host: "-" }]
                  }
                />
              </section>

              {/* Connected Records */}
              <section>
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Connected Records
                </h3>
                <div className="border border-gray-300 border-dashed rounded-lg p-6 text-center text-gray-500 italic bg-gray-50">
                  No connected records found.
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// --- Helper Components ---
// ------------------------------------------------------------------

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

/* --- Inline Custom Table (Refined Design) --- */
function CustomTable({ columns, data, renderCell }) {
  const isNoData = !data || data.length === 0 || (data.length === 1 && data[0].name === "No records found");
  
  if (isNoData) {
    return (
      <div className="border border-gray-300 border-dashed rounded-lg p-6 text-center text-gray-500 italic bg-gray-50 shadow-inner">
        No records found.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Mobile Cards */}
      <div className="space-y-3 p-4 lg:hidden">
        {data.map((row, idx) => (
          <div
            key={idx}
            className="border border-gray-300 rounded-lg p-4 shadow-sm bg-white hover:shadow-lg transition-all duration-200"
          >
            {columns.map((col) => (
              <div
                key={col.key}
                className="flex justify-between items-center py-1 border-b border-gray-100 last:border-b-0"
              >
                <span className="font-medium text-gray-500 text-sm">
                  {col.label}
                </span>
                <span className="text-gray-700 text-sm font-semibold">
                  {renderCell ? renderCell(col.key, row) : row[col.key] || "N/A"}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-indigo-50 border-b border-gray-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="p-3 text-left font-bold text-indigo-700 uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row, idx) => (
              <tr
                key={idx}
                className="hover:bg-indigo-50 transition-colors duration-200"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`p-3 align-top ${col.className || "text-gray-700"}`}
                  >
                    {renderCell ? renderCell(col.key, row) : row[col.key] || "N/A"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}