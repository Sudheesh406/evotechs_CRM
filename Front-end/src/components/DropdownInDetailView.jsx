import React from "react";

import {
  Phone,
  Users,
  Paperclip, 
  Plus,
} from "lucide-react";
import CustomTable from "./CustomeTable";


function DropdownInDetailView({
  action,
  addMenuOpen,
  setAddMenuOpen,
  setDocumentTaskId,
  setShowDocumentModal,
  setShowCallModal,
  setShowMeetingModal,
  taskDetails,
  attachments,
  calls,
  meetings,
  teamWorkDetails,
}) {
  return (
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
                      <Paperclip className="w-4 h-4 text-indigo-500" /> Attach
                      Document
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
              {(Array.isArray(attachments) ? attachments : [attachments]).map(
                (item, index) => (
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
                      <span className="font-semibold text-gray-900">URL:</span>{" "}
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
                )
              )}
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
          {calls.filter((c) => c.status.toLowerCase() === "pending").length ===
          0 ? (
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
                  ["completed", "cancelled"].includes(c.status.toLowerCase())
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
                  ["completed", "cancelled"].includes(m.status?.toLowerCase())
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
  );
}

export default DropdownInDetailView;
