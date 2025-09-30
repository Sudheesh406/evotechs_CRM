import React, { useEffect, useState } from "react";
import axios from "../../instance/Axios";
import CallModal from "../../components/modals/CallModal";
import MeetingModal from "../../components/modals/MeetingModal";
import Swal from "sweetalert2";

import {
  FileText,
  Phone,
  Users,
  CheckSquare,
  Paperclip,
  ArrowLeft,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

/* --- Main Component --- */
export default function TaskDetail() {
  const state = true;
  const navigate = useNavigate();
  const { data } = useParams();

  // UI state
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);

  // Parse URL data
  let parsed = null;
  if (data) {
    try {
      parsed = JSON.parse(decodeURIComponent(data));
    } catch (e) {
      console.error("Could not parse data:", e);
    }
  }
  if (!parsed) return <div>Loading or invalid data…</div>;

  const action = parsed?.role; // ← read-only flag
  console.log(action);

  // API state
  const [customer, setCustomer] = useState(null);
  const [calls, setCalls] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [taskDetails, setTaskDetails] = useState([]);
  const [teamWorkDetails, setTeamWorkDetails] = useState();

  // Stage state
  const [workStages, setWorkStages] = useState({
    pending1: false,
    pending2: false,
    pending3: false,
    pending4: false,
  });
  const toggleStage = (k) => {
    if (action) return; // block if read-only
    setWorkStages((s) => ({ ...s, [k]: !s[k] }));
  };

  // Notes state
  const [notes, setNotes] = useState("");

  // Fetch customer details
  const fetchCustomerDetails = async () => {
    // Show loading alert
    Swal.fire({
      title: "Getting Customer Details...",
      didOpen: () => {
        Swal.showLoading();
      },
      allowOutsideClick: false,
    });

    try {
      const response = await axios.post("task/team/details/get", { parsed });
      const apiData = response.data?.data || {};

      setCustomer(apiData.customerDetails || null);
      setCalls(apiData.callDetails || []);
      setMeetings(apiData.meetingDetails || []);
      setTaskDetails(apiData.taskDetails || []);
      setAttachments([]);
      setNotes(apiData.taskDetails?.[0]?.notes || "");
      setTeamWorkDetails(apiData.taskDetails?.[0]?.teamWork || "");

      // Close loading and show success (optional)
      Swal.close();
    } catch (error) {
      console.log("error found in fetching customer details", error);
      Swal.fire(
        "Error",
        "Failed to get customer details. Please try again.",
        "error"
      );
    }
  };

  useEffect(() => {
    fetchCustomerDetails();
  }, []); // only once on mount

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
    const taskId = taskDetails[0].id;
    updateStagesAndNotes(checkedStagesCount, notes, taskId);
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
    });

    try {
      const response = await axios.post("/task/team/stages_notest", { data });

      if (response?.data?.success || response) {
        fetchCustomerDetails();
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
      console.log("error found in update stage and notes", error);
      Swal.fire(
        "Error",
        "Failed to update stages and notes. Please try again.",
        "error"
      );
    }
  };

  return (
    <div className="min-h-[680px] bg-gray-50 p-6 space-y-8">
      {/* --- Back Button --- */}
      <div className="max-w-6xl mx-auto flex items-center mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-700 bg-gray-200 px-3 py-2 rounded-lg hover:bg-gray-300 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* ---- Overview Card ---- */}
      <div className="bg-white rounded-xl shadow-md p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Customer Details
          </h2>
        </div>

        {/* Personal Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-lg p-4 bg-gray-50">
          <Detail label="Name" value={customer?.name || ""} />
          <Detail label="Email" value={customer?.email || ""} />
          <Detail label="Phone" value={customer?.phone || ""} />
          <Detail label="Source" value={customer?.source || ""} />
          <Detail label="Amount" value={customer?.amount || ""} />
          <Detail label="Priority" value={taskDetails[0]?.priority || ""} />
          <Detail label="Project" value={taskDetails[0]?.requirement || ""} />
        </div>

        {/* Work Description */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Work Description
          </h3>
          <div className="border border-gray-300 rounded-lg bg-gray-50 p-3 text-sm text-gray-700 leading-relaxed">
            {customer?.description || ""}
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
                { label: "Not Started", key: "pending1", disabled: true },
                { label: "Ongoing", key: "pending2", disabled: false },
                { label: "Review", key: "pending3", disabled: false },
                { label: "Completed", key: "pending4", disabled: true },
              ].map((stage, i) => (
                <label
                  key={stage.key}
                  className="flex items-center gap-2 text-gray-700"
                >
                  <input
                    type="checkbox"
                    className="accent-blue-600"
                    checked={workStages[stage.key]}
                    disabled={stage.disabled}
                    onChange={() => toggleStage(stage.key)}
                  />
                  {stage.label}
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
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Type a description or note..."
            disabled={action}
          />
        </div>

        {/* Save Button */}
        {!action && hasChanges() && (
          <div className="mt-4 w-full flex justify-end">
            <button
              onClick={handleSave}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
            >
              Save
            </button>
          </div>
        )}
      </div>

      {/* ---- Records Card ---- */}
      <div className="bg-white rounded-xl shadow-md p-6 max-w-6xl mx-auto space-y-8">
        {/* Attachments */}
        <section>
          <div className="flex justify-between">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-600" /> Attachments
            </h3>
            {!action && (
              <div className="relative">
                <button
                  onClick={() => setAddMenuOpen((o) => !o)}
                  className=" bg-blue-500 text-white px-3 py-1 mb-2 rounded-lg hover:bg-blue-600 transition"
                >
                  Add New ▾
                </button>

                {addMenuOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <button
                      onClick={() => {
                        setAddMenuOpen(false);
                        console.log("Attach new document clicked");
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      📎 Attach document
                    </button>
                    <button
                      onClick={() => {
                        setAddMenuOpen(false);
                        setShowCallModal(true);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      📞 Add new call
                    </button>
                    <button
                      onClick={() => {
                        setAddMenuOpen(false);
                        setShowMeetingModal(true);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      💻 Add new Meeting
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <CustomTable
            columns={[
              { key: "name", label: "File" },
              { key: "size", label: "Size" },
              { key: "action", label: "Action" },
            ]}
            data={attachments.map((a) => ({
              ...a,
              action: (
                <button className="px-3 py-1 text-xs rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition">
                  Download
                </button>
              ),
            }))}
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
            data={calls.map((c) => ({
              date: c.date,
              time: c.time,
              subject: c.subject,
              status: c.status,
              attended: c.name || "",
            }))}
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
            data={meetings.map((m) => ({
              date: m.meetingDate,
              from: m.startTime,
              to: m.endTime,
              subject: m.subject,
              host: m.name || "",
              status: m.status,
            }))}
          />
        </section>

        {/* Connected Records */}
        <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Connected Records
          </h3>
          {teamWorkDetails?.length <= 0 ? (
            <div className="border border-gray-200 rounded-lg p-6 text-center text-gray-500 italic">
              No records found
            </div>
          ) : (
            teamWorkDetails
              ?.slice()
              .reverse()
              .map((item, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 mb-2"
                >
                  <p>{item}</p>
                </div>
              ))
          )}
        </section>
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
    </div>
  );
}

/* --- Detail Row --- */
function Detail({ label, value }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm text-gray-800">{value}</span>
    </div>
  );
}

/* --- Inline Custom Table --- */
function CustomTable({ columns, data, renderCell }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Mobile Cards */}
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
                  {renderCell ? renderCell(col.key, row) : row[col.key]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Desktop Table */}
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
                    {renderCell ? renderCell(col.key, row) : row[col.key]}
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
