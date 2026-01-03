import React, { useState } from "react";
import axios from "../instance/Axios";
import Swal from "sweetalert2";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Phone, Download } from "lucide-react";

// --- Excel-style Summary Modal Component ---
const YearlySummaryModal = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  const record = data[0]; // Accessing the record from your API response

  const handleDownloadYearlyPDF = () => {
    const doc = new jsPDF();
    const record = data[0];

    // --- Header ---
    doc.setFontSize(22);
    doc.setTextColor(79, 70, 229); // Indigo-600
    doc.text("Yearly Leave & WFH Report", 14, 20);

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Staff Name: ${record.staffName}`, 14, 30);
    doc.text(`Academic/Fiscal Year: ${record.allocationYear}`, 14, 37);

    // --- Summary Stats Boxes ---
    // Leave Box
    doc.setDrawColor(200);
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(14, 45, 85, 20, 3, 3, "FD");
    doc.setFontSize(10);
    doc.setTextColor(30, 64, 175); // Blue
    doc.text("LEAVE UTILIZATION", 18, 52);
    doc.setFontSize(14);
    doc.text(`${record.totalLeave} / ${record.allocatedLeaves} Days`, 18, 60);

    // WFH Box
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(110, 45, 85, 20, 3, 3, "FD");
    doc.setTextColor(21, 128, 61); // Green
    doc.setFontSize(10);
    doc.text("WFH UTILIZATION", 114, 52);
    doc.setFontSize(14);
    doc.text(`${record.totalWFH} / ${record.allocatedWFH} Days`, 114, 60);

    // --- Monthly Breakdown Table ---
    const tableColumn = ["Month", "Leave Days Used", "WFH Days Used"];
    const tableRows = record.monthlySummary.map((item) => [
      new Date(item.month).toLocaleString("default", {
        month: "long",
        year: "numeric",
      }),
      item.leave,
      item.wfh,
    ]);

    autoTable(doc, {
      startY: 75,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: [79, 70, 229], halign: "center" },
      columnStyles: {
        1: { halign: "center" },
        2: { halign: "center" },
      },
      styles: { fontSize: 10, cellPadding: 5 },
    });

    // --- Footer ---
    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text("This is a system-generated report.", 14, finalY);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, finalY + 5);

    doc.save(`${record.staffName}_Yearly_Leave_${record.allocationYear}.pdf`);
  };

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
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadYearlyPDF}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow flex items-center gap-2 transition-all text-sm font-medium"
            >
              <Download size={16} className="text-indigo-600" />
              Download
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
            >
              &times;
            </button>
          </div>
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
      // 🔵 Show Loading Alert
      Swal.fire({
        title: "Loading...",
        text: "Fetching yearly leave & WFH records",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // 🔵 Fetch API data
      const { data } = await axios.get("/calendar/leave-WFH-record");

      // 🟢 Success: Close loading and show success popup
      Swal.close();

      // 🔵 Set data & open modal
      setSummaryData(data.data);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching records:", error);

      // 🔴 Error Alert
      Swal.fire({
        icon: "error",
        title: "Failed to Load",
        text: "Unable to fetch yearly leave/WFH records.",
        confirmButtonColor: "#d33",
      });
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
