import { useEffect, useState } from "react";
import axios from "../../../instance/Axios";
import Swal from "sweetalert2";
import { Download } from "lucide-react";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const StaffWorklog = () => {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [staffId, setStaffId] = useState("");
  const [workDetails, setWorkDetails] = useState([]);
  const [staff, setStaff] = useState([]);

  const getStaffDetails = async () => {
    try {
      Swal.fire({
        title: "Loading staff...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const response = await axios.get("/team/staff/get");
      const staffList = response.data?.data?.staffList || [];
      setStaff(staffList);
      if (staffList.length > 0) setStaffId(staffList[0].id);

      Swal.close();
    } catch (error) {
      Swal.fire("Error", "Failed to fetch staff details", "error");
    }
  };

  const getWork = async () => {
    if (!staffId) return;
    try {
      Swal.fire({
        title: "Loading work logs...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const response = await axios.post("/worklog/admin/get", {
        staffId,
        month,
        year,
      });

      const worklogs = response.data?.worklogs || [];
      const selectedStaff = staff.find((s) => s.id === staffId);

      const enrichedWorklogs = worklogs.map((log) => ({
        ...log,
        staffName: selectedStaff?.name || "",
        staffEmail: selectedStaff?.email || "",
      }));

      setWorkDetails(enrichedWorklogs);
      Swal.close();
    } catch (error) {
      Swal.fire("Error", "Failed to fetch work details", "error");
      setWorkDetails([]);
    }
  };

  useEffect(() => {
    getStaffDetails();
  }, []);

  useEffect(() => {
    getWork();
  }, [staffId, month, year, staff]);

  const calculateHoursWorked = (attendance) => {
    if (!attendance || attendance.length === 0) return "0h 0m";
    let totalMinutes = 0;
    let entryTime = null;

    attendance.forEach((a) => {
      const [hours, minutes] = a.time.split(":").map(Number);
      const timeInMinutes = hours * 60 + minutes;

      if (a.type === "entry") entryTime = timeInMinutes;
      else if (a.type === "exit" && entryTime !== null) {
        totalMinutes += timeInMinutes - entryTime;
        entryTime = null;
      }
    });

    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}h ${m}m`;
  };

  const calculateTotalTaskTime = (tasks) => {
    if (!tasks || tasks.length === 0) return "0h 0m";
    let totalMinutes = 0;

    tasks.forEach((t) => {
      if (!t.time) return;
      const [hours, minutes] = t.time.split(":").map(Number);
      totalMinutes += hours * 60 + minutes;
    });

    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}h ${m}m`;
  };

  // --- PDF Export Function ---
  const handleDownload = () => {
    if (workDetails.length === 0) {
      toast.error("No work logs available to export");
      return;
    }

    const selectedStaffName =
      staff.find((s) => s.id === staffId)?.name || "Staff";
    const doc = new jsPDF("l", "mm", "a4");

    // Header Styling
    doc.setFontSize(18);
    doc.setTextColor(79, 70, 229);
    doc.text("Staff Work Log Report", 14, 15);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Staff: ${selectedStaffName}`, 14, 22);
    doc.text(
      `Period: ${new Date(0, month - 1).toLocaleString("default", { month: "long" })} ${year}`,
      14,
      28,
    );

    const tableColumn = [
      "Date",
      "Task Details",
      "Time Spent",
      "Total Task Time",
      "Attendance (In/Out)",
      "Logged",
    ];
    const tableRows = [];

    workDetails.forEach((detail) => {
      const tasksString =
        detail.tasks?.length > 0
          ? detail.tasks.map((t) => t.taskName).join("\n")
          : "No tasks recorded";

      const entry =
        detail.attendance?.find((a) => a.type === "entry")?.time || "--";
      const exit =
        detail.attendance
          ?.slice()
          .reverse()
          .find((a) => a.type === "exit")?.time || "--";

      const rowData = [
        detail.date,
        tasksString,
        detail.tasks?.map((t) => t.time).join("\n") || "-",
        calculateTotalTaskTime(detail.tasks),
        `IN: ${entry} / OUT: ${exit}`,
        calculateHoursWorked(detail.attendance),
      ];
      tableRows.push(rowData);
    });

    // Corrected plugin call
    autoTable(doc, {
      startY: 35,
      head: [tableColumn],
      body: tableRows,
      theme: "striped",
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 9 },
      columnStyles: { 1: { cellWidth: 70 } },
    });

    const fileName = `WorkLog_${selectedStaffName}_${month}_${year}.pdf`;
    doc.save(fileName);
    toast.success("Work log PDF report downloaded");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              <span className="text-indigo-600">Work</span> Log
            </h1>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500">
              Viewing work logs for {year},{" "}
              {new Date(0, month - 1).toLocaleString("default", {
                month: "long",
              })}
              .
            </p>
          </div>
          <button
            onClick={handleDownload}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <Download size={18} />
            Export PDF
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
          <select
            className="border border-gray-300 rounded-md px-2 py-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>

          <select
            className="border border-gray-300 rounded-md px-2 py-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {Array.from({ length: 3 }, (_, i) => {
              const y = today.getFullYear() - i;
              return (
                <option key={y} value={y}>
                  {y}
                </option>
              );
            })}
          </select>

          <select
            className="border border-gray-300 rounded-md px-2 py-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            value={staffId}
            onChange={(e) => setStaffId(Number(e.target.value))}
          >
            {staff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Date",
                    "Staff Name",
                    "Email",
                    "Task Name",
                    "Comment",
                    "Time Spent",
                    "Hour Calculation",
                    "Attendance",
                  ].map((head) => (
                    <th
                      key={head}
                      className="px-4 sm:px-6 py-3 text-left text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {workDetails.length > 0 ? (
                  workDetails.map((detail, index) => (
                    <tr
                      key={index}
                      className="hover:bg-indigo-50/30 transition-colors align-top"
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {detail.date}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap hidden sm:table-cell">
                        <div className="text-sm font-semibold text-gray-900">
                          {detail.staffName}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap hidden sm:table-cell">
                        <div className="text-xs text-gray-500">
                          {detail.staffEmail}
                        </div>
                      </td>

                      <td colSpan="3" className="px-0 py-0">
                        <div className="flex flex-col">
                          {detail.tasks?.length > 0 ? (
                            detail.tasks.map((t, i) => (
                              <div
                                key={i}
                                className={`flex items-start px-4 py-3 gap-4 ${i !== detail.tasks.length - 1 ? "border-b border-gray-100" : ""}`}
                              >
                                <div className="w-1/3">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                                    {t.taskName}
                                  </span>
                                </div>
                                <div className="w-1/2 text-xs text-gray-600 italic">
                                  <span className="text-gray-500">
                                    Heavy to download Please visit the Detail
                                    page
                                  </span>
                                </div>
                                <div className="w-1/6 text-right text-xs font-mono font-bold text-gray-700">
                                  {t.time}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-4 text-gray-400 italic text-center">
                              No tasks recorded
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-2">
                          <div className="bg-indigo-600 text-white p-2 rounded-md shadow-sm text-center">
                            <div className="text-[10px] uppercase opacity-80">
                              Task Total
                            </div>
                            <div className="text-sm font-bold">
                              {calculateTotalTaskTime(detail.tasks)}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        {detail.attendance?.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-[14px] text-gray-500 border-b border-dashed pb-1">
                              <span>
                                IN:{" "}
                                {detail.attendance.find(
                                  (a) => a.type === "entry",
                                )?.time || "--"}
                              </span>
                              <span>
                                OUT:{" "}
                                {detail.attendance
                                  .slice()
                                  .reverse()
                                  .find((a) => a.type === "exit")?.time || "--"}
                              </span>
                            </div>
                            <div className="text-center pt-1">
                              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                                Logged:{" "}
                                {calculateHoursWorked(detail.attendance)}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-12 text-center text-gray-400 text-base"
                    >
                      No work details found for this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
          <div className="text-xs sm:text-sm text-gray-500 font-medium">
            Total working days recorded: {workDetails.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffWorklog;
