import React, { useState } from "react";
import axios from "../instance/Axios";

// --- Excel-style Summary Modal Component ---
const YearlySummaryModal = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  const record = data[0]; // Accessing the record from your API response

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

        {/* Modal Header */}
        <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              Yearly Record Summary
            </h3>
            <p className="text-sm text-gray-500">
              Staff: {record.staffName} | Year: {record.allocationYear}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl"
          >
            &times;
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">

          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">
                Leave Balance
              </p>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-2xl font-black ${
                    record.totalLeave > record.allocatedLeaves
                      ? "text-red-600"
                      : "text-blue-900"
                  }`}
                >
                  {record.totalLeave}
                </span>
                <span className="text-sm font-bold text-blue-400">
                  used / {record.allocatedLeaves} total
                </span>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
              <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">
                WFH Balance
              </p>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-2xl font-black ${
                    record.totalWFH > record.allocatedWFH
                      ? "text-red-600"
                      : "text-emerald-900"
                  }`}
                >
                  {record.totalWFH}
                </span>
                <span className="text-sm font-bold text-emerald-600">
                  used / {record.allocatedWFH} total
                </span>
              </div>
            </div>
          </div>

          {/* Excel-like Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">

            {/* Header Table */}
            <table className="min-w-full divide-y divide-gray-200 table-fixed">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase w-1/3">
                    Month
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase w-1/3">
                    Leave Days
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase w-1/3">
                    WFH Days
                  </th>
                </tr>
              </thead>
            </table>

            {/* Scrollable Body */}
            <div className="max-h-60 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200 table-fixed">
                <tbody className="bg-white divide-y divide-gray-200">
                  {record.monthlySummary.map((item, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 transition-colors font-mono"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 w-1/3">
                        {new Date(item.month).toLocaleString("default", {
                          month: "long",
                          year: "numeric",
                        })}
                      </td>

                      <td className="px-4 py-3 text-center text-sm text-blue-700 font-semibold bg-blue-50/20 w-1/3">
                        {item.leave}
                      </td>

                      <td className="px-4 py-3 text-center text-sm text-emerald-700 font-semibold bg-emerald-50/20 w-1/3">
                        {item.wfh}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};


// --- Main LeaveList Component ---
export default function LeaveList({
  leaves,
  handleCreateLeave,
  handleEditLeave,
  handleDeleteLeave,
}) {
  const [summaryData, setSummaryData] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const viewLeaveAndWFH = async () => {
    try {
      const { data } = await axios.get("/calendar/leave-WFH-record");
      setSummaryData(data.data);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching records:", error);
      alert("Failed to fetch yearly records.");
    }
  };

  return (
    <div className="mt-6 bg-white rounded-xl shadow p-6">
      {/* Yearly Modal */}
      <YearlySummaryModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        data={summaryData}
      />

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Leaves & Work from home
        </h3>

        <div className="flex gap-4">
          <button
            onClick={viewLeaveAndWFH}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm shadow-sm"
          >
            📊 View Yearly Record
          </button>
          <button
            onClick={handleCreateLeave}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium text-sm shadow-sm"
          >
            Create Request
          </button>
        </div>
      </div>

      {leaves.length === 0 ? (
        <p className="text-gray-500 text-sm">
          No leaves and work from home for this month.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-left">Half Time</th>
                <th className="px-4 py-2 text-left">Start Date</th>
                <th className="px-4 py-2 text-left">End Date</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Reason</th>
                <th className="px-4 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leaves.map((l) => {
                const isLocked =
                  l.status === "Approve" || l.status === "Reject";

                return (
                  <tr key={l.id}>
                    <td className="px-4 py-2">{l.leaveType}</td>
                    <td className="px-4 py-2">{l.category}</td>
                    <td className="px-4 py-2">
                      {!l.HalfTime
                        ? "Nill"
                        : l.HalfTime == "Offline"
                        ? "Offline work"
                        : l.HalfTime}
                    </td>
                    <td className="px-4 py-2">{l.startDate}</td>
                    <td className="px-4 py-2">{l.endDate}</td>
                    <td className="px-4 py-2 font-medium">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                          l.status === "Approve"
                            ? "bg-green-100 text-green-800"
                            : l.status === "Reject"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">{l.reason}</td>
                    <td className="px-4 py-2 flex gap-2">
                      <button
                        onClick={() => handleEditLeave(l)}
                        disabled={isLocked}
                        className={`px-2 py-1 text-white rounded transition text-xs ${
                          isLocked
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-500 hover:bg-blue-600"
                        }`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteLeave(l)}
                        disabled={isLocked}
                        className={`px-2 py-1 text-white rounded transition text-xs ${
                          isLocked
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-red-500 hover:bg-red-600"
                        }`}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
