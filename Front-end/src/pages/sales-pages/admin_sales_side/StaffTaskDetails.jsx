import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FileText,
  Phone,
  Users,
  CheckSquare,
  Paperclip,
  ArrowLeft,
} from "lucide-react";
import axios from "../../../instance/Axios";

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

  const isPending = parsed?.data?.pending;
  const isCompleted = parsed?.data.completed;

  const getTaskDetails = async () => {
    if (!parsed) return;
    try {
      const response = await axios.post("task/admin/details/get", { parsed });
      if (response.data.success) {
        setTaskData(response.data.data);
        setCurrentStage(response.data.data.taskDetails?.[0]?.stage || 0);
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

  if (loading) return <div>Loading task details…</div>;
  if (!taskData) return <div>No data found</div>;

  const customer = taskData.customerDetails || {};
  const taskDetails = taskData.taskDetails?.[0] || {};
  const attachments = taskData.attachments || [];
  const calls = taskData.callDetails || [];
  const meetings = taskData.meetingDetails || [];

  const handleStageChange = async (stageNum) => {
    if (stageNum !== 4) return;
    const newStage = currentStage === 4 ? 3 : 4;
    const oldStage = currentStage;
    setCurrentStage(newStage);
    try {
      const response = await axios.post("/task/stage/update", {
        taskId: taskData?.taskDetails?.[0].id,
        stage: newStage,
      });
      if (response) {
        getTaskDetails();
      }
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update stage");
      }
    } catch (err) {
      console.error("Failed to update stage:", err);
      alert("Failed to update stage");
      setCurrentStage(oldStage);
    }
  };

  const reworkUpdate = async () => {
    try {
      // Safely get the task ID
      const id = taskData?.taskDetails?.[0]?.id;
      console.log("Task data:", id);

      // Call the API to toggle rework
      if (id) {
        const response = await axios.patch("/task/rework/update", { id });

        if (response?.data?.success) {
          console.log("Rework updated successfully:", response.data);
          navigate(-1); // Go back one page
        } else {
          console.warn("Failed to update rework:", response?.data?.message);
        }
      }
    } catch (error) {
      console.error("Failed to set rework:", error);
      alert("Failed to set rework"); // optional user feedback
    }
  };

  return (
    <div className="min-h-[680px] bg-gray-50 p-6 space-y-8">
      {/* Back Button */}
      <div className="max-w-6xl mx-auto flex items-center mb-4">
        <button
          className="flex items-center gap-2 text-sm text-gray-700 bg-gray-200 px-3 py-2 rounded-lg hover:bg-gray-300 transition"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* Customer Overview */}
      <div className="bg-white rounded-xl shadow-md p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Customer Details
          </h2>

          {!isPending && isCompleted && (
            <button
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
              onClick={() => reworkUpdate()}
            >
              Rework
            </button>
          )}
          {isPending && isCompleted && (
            <button
              className="px-4 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-blue-700 transition"
              onClick={() => reworkUpdate()}
            >
              Restore
            </button>
          )}
        </div>

        {/* Personal Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-lg p-4 bg-gray-50">
          <Detail label="Name" value={customer.name} />
          <Detail label="Email" value={customer.email} />
          <Detail label="Phone" value={customer.phone} />
          <Detail label="Source" value={customer.source} />
          <Detail label="Amount" value={customer.amount} />
          <Detail label="Priority" value={taskDetails.priority} />
          <Detail label="Project" value={taskDetails.requirement} />
        </div>

        {/* Work Description */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Work Description
          </h3>
          <div className="border border-gray-300 rounded-lg bg-gray-50 p-3 text-sm text-gray-700 leading-relaxed">
            {customer.description || "No data found"}
          </div>
        </div>

        {/* Work Stages */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-blue-600" /> Work Stages
          </h3>
          <div className="border border-gray-300 rounded-lg bg-gray-50 p-3 text-sm">
            <div className="flex flex-col gap-2">
              {[
                { num: 1, label: "Not Started" },
                { num: 2, label: "Ongoing" },
                { num: 3, label: "Review" },
                { num: 4, label: "Completed" },
              ].map((stage) => (
                <label
                  key={stage.num}
                  className="flex items-center gap-2 text-gray-700"
                >
                  <input
                    type="checkbox"
                    className="accent-blue-600"
                    checked={currentStage >= stage.num}
                    disabled={stage.num !== 4 || isPending}
                    onChange={() => handleStageChange(stage.num)}
                  />
                  {stage.num} {stage.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Notes</h3>
          <textarea
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-400"
            value={taskDetails.notes || "No data found"}
            readOnly
          />
        </div>
      </div>

      {/* Records */}
      <div className="bg-white rounded-xl shadow-md p-6 max-w-6xl mx-auto space-y-8">
        {/* Attachments */}
        <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-600" /> Attachments
          </h3>
          <CustomTable
            columns={[
              { key: "name", label: "File" },
              { key: "size", label: "Size" },
              { key: "action", label: "Action" },
            ]}
            data={
              attachments.length
                ? attachments.map((a) => ({
                    ...a,
                    size: a.size || "No data found",
                    action: (
                      <button className="px-3 py-1 text-xs rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition">
                        Download
                      </button>
                    ),
                  }))
                : [{ name: "No data found", size: "-", action: "-" }]
            }
            renderCell={(key, row) => {
              if (key === "name") {
                return (
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-gray-500" />
                    <span>{row.name}</span>
                  </div>
                );
              }
              return row[key];
            }}
          />
        </section>

        {/* Calls */}
        <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5 text-purple-500" /> Calls
          </h3>
          <CustomTable
            columns={[
              { key: "date", label: "Date" },
              { key: "time", label: "Time" },
              { key: "subject", label: "Subject" },
              { key: "status", label: "Status" },
              { key: "attended", label: "Attended" },
            ]}
            data={
              calls.length
                ? calls.map((c) => ({
                    date: c.date || "No data found",
                    time: c.time || "No data found",
                    subject: c.subject || "No data found",
                    status: c.status || "No data found",
                    attended: c.name || "No data found",
                  }))
                : [
                    {
                      date: "-",
                      time: "-",
                      subject: "No data found",
                      status: "-",
                      attended: "-",
                    },
                  ]
            }
          />
        </section>

        {/* Meetings */}
        <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-500" /> Meetings
          </h3>
          <CustomTable
            columns={[
              { key: "date", label: "Date" },
              { key: "from", label: "From" },
              { key: "to", label: "To" },
              { key: "subject", label: "Subject" },
              { key: "host", label: "Host" },
              { key: "status", label: "Status" },
            ]}
            data={
              meetings.length
                ? meetings.map((m) => ({
                    date: m.meetingDate || "No data found",
                    from: m.startTime || "No data found",
                    to: m.endTime || "No data found",
                    subject: m.subject || "No data found",
                    host: m.name || "No data found",
                    status: m.status || "No data found",
                  }))
                : [
                    {
                      date: "-",
                      from: "-",
                      to: "-",
                      subject: "No data found",
                      host: "-",
                      status: "-",
                    },
                  ]
            }
          />
        </section>

        {/* Connected Records */}
        <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Connected Records
          </h3>
          <div className="border border-gray-200 rounded-lg p-6 text-center text-gray-500 italic">
            No records found
          </div>
        </section>
      </div>
    </div>
  );
}

/* Detail Component */
function Detail({ label, value }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm text-gray-800">{value || "No data found"}</span>
    </div>
  );
}

/* Custom Table */
function CustomTable({ columns, data, renderCell }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Mobile */}
      <div className="space-y-3 p-3 lg:hidden">
        {data.map((row, idx) => (
          <div
            key={idx}
            className="border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            {columns.map((col) => (
              <div key={col.key} className="flex justify-between py-1">
                <span className="font-semibold text-gray-700">{col.label}</span>
                <span className="text-gray-600">
                  {renderCell
                    ? renderCell(col.key, row)
                    : row[col.key] || "No data found"}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Desktop */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="p-3 border-b text-left font-semibold"
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
                    className={`p-3 ${col.className || "text-gray-600"}`}
                  >
                    {renderCell
                      ? renderCell(col.key, row)
                      : row[col.key] || "No data found"}
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
