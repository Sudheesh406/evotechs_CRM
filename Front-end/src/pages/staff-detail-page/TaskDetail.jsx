import React, { useState } from "react";
import { FileText, Phone, Users, CheckSquare, Paperclip, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom"; // 👈 import useNavigate

export default function TaskDetail() {
  const navigate = useNavigate(); // 👈 initialize navigate

  const [workStages, setWorkStages] = useState({
    stage1: true,
    stage2: false,
    stage3: false,
    stage4: false,
  });

  const toggleStage = (k) =>
    setWorkStages((s) => ({ ...s, [k]: !s[k] }));

  const calls = [
    { date: "12/08/2025", time:"8:00 AM", subject: "more detail requirement",attended:"Malu" ,status:"Not Taken" },
    { date: "14/08/2025", time:"8:00 AM", subject: "more detail requirement" ,attended:"Malu",status:"Not Taken"  },
    { date: "15/08/2025", time:"8:00 AM", subject: "more detail requirement",attended:"Malu" ,status:"Not Taken"  },
  ];

  const meetings = [
    { date: "16/08/2025",from:"8:00AM",to:"9:00AM", subject: "Zoom: Project planning",host:"abhishek", status:"Not Taken"},
    { date: "18/08/2025",from:"8:00AM",to:"9:00AM", subject: "Office: Final approval",host:"abhishek",status:"Not Taken" },
  ];

  const attachments = [
    { name: "Contract.pdf", size: "1.2 MB" },
    { name: "Proposal.docx", size: "320 KB" },
    { name: "Wireframe.png", size: "680 KB" },
  ];

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
          <h2 className="text-xl font-semibold text-gray-800">Customer Details</h2>
          <p className="text-xs text-gray-500">Last Update: 2 day(s) ago</p>
        </div>
      

        {/* Personal Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-lg p-4 bg-gray-50">
          <Detail label="Name" value="John Doe" />
          <Detail label="Email" value="john@example.com" />
          <Detail label="Phone" value="+1 234 567 890" />
          <Detail label="Country" value="United States" />
          <Detail label="Company" value="Acme Corp" />
          <Detail label="Position" value="Project Manager" />
        </div>

        {/* Work Description */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Work Description</h3>
          <div className="border border-gray-300 rounded-lg bg-gray-50 p-3 text-sm text-gray-700 leading-relaxed">
            John is managing multiple software projects, focusing on frontend development,
            UI/UX design, and client communications. His role involves coordinating with
            developers, designers, and clients to deliver quality software solutions.
          </div>
        </div>

        {/* Work Stages */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-blue-600" /> Work Stages
          </h3>
          <div className="border border-gray-300 rounded-lg bg-gray-50 p-3 text-sm">
            <div className="flex flex-col gap-2">
              {Object.keys(workStages).map((k, i) => (
                <label key={k} className="flex items-center gap-2 text-gray-700">
                  <input
                    type="checkbox"
                    className="accent-blue-600"
                    checked={workStages[k]}
                    onChange={() => toggleStage(k)}
                  />
                  Stage {i + 1}
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
            defaultValue="Discussed UI changes with client. Next step: update wireframes."
            placeholder="Type a description or note..."
          />
        </div>
      </div>

      {/* ---- Records Card ---- */}
      <div className="bg-white rounded-xl shadow-md p-6 max-w-6xl mx-auto space-y-8">
        {/* Attachments */}
        <section>
            <div className="flex justify-between">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-600" /> Attachments
          </h3>
          <button className=" bg-blue-500 text-white px-2  mb-2 rounded-lg hover:bg-blue-600 transition">Add New</button>
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
            data={calls}
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
              {key: 'status', label:'Status'}
            ]}
            data={meetings}
          />
        </section>

        {/* Connected Records (empty state) */}
        <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Connected Records</h3>
          <div className="border border-gray-200 rounded-lg p-6 text-center text-gray-500 italic">
            No records found
          </div>
        </section>
      </div>
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

/* --- Inline Custom Table (without checkboxes) --- */
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
