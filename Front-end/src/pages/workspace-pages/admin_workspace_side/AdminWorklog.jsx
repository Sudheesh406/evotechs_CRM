import { useEffect, useState } from "react";
import axios from "../../../instance/Axios";
import Swal from "sweetalert2";
import { Download } from "lucide-react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";

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

  // --- Export Function ---
  const handleDownload = () => {
    if (workDetails.length === 0) {
      toast.error("No work logs available to export");
      return;
    }

    const selectedStaffName = staff.find(s => s.id === staffId)?.name || "Staff";

    const dataToExport = workDetails.map((detail) => ({
      "Date": detail.date,
      "Staff Name": detail.staffName,
      "Email": detail.staffEmail,
      "Tasks": detail.tasks?.map(t => t.taskName).join(", ") || "-",
      "Comments": detail.tasks?.map(t => t.comment).join(" | ") || "-",
      "Task Time Total": calculateTotalTaskTime(detail.tasks),
      "Actual Hours Worked": calculateHoursWorked(detail.attendance)
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "WorkLog");

    const fileName = `WorkLog_${selectedStaffName}_${month}_${year}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    toast.success("Work log report downloaded");
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
              {new Date(0, month - 1).toLocaleString("default", { month: "long" })}.
            </p>
          </div>
          <button
            onClick={handleDownload}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <Download size={18} />
            Export Excel
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
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                        {detail.date}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-semibold text-gray-900">
                        {detail.staffName}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600">
                        {detail.staffEmail}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-900">
                        {detail.tasks?.length > 0
                          ? detail.tasks.map((t, i) => (
                              <div key={i} className="mb-1">• {t.taskName}</div>
                            ))
                          : "-"}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-500 italic">
                        {detail.tasks?.length > 0
                          ? detail.tasks.map((t, i) => (
                              <div key={i} className="mb-1">{t.comment}</div>
                            ))
                          : "-"}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-900">
                        {detail.tasks?.length > 0 ? (
                          <div className="bg-indigo-50 p-2 rounded">
                            {detail.tasks.map((t, i) => (
                              <div key={i} className="text-[11px] text-indigo-700">{t.time}</div>
                            ))}
                            <div className="mt-1 font-bold border-t border-indigo-200 pt-1">
                              Total: {calculateTotalTaskTime(detail.tasks)}
                            </div>
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-900">
                        {detail.attendance?.length > 0 ? (
                          <div className="bg-gray-50 p-2 rounded">
                            {detail.attendance.map((a, i) => (
                              <div key={i} className="text-[11px] uppercase">
                                {a.type}: {a.time}
                              </div>
                            ))}
                            <div className="mt-1 font-bold border-t border-gray-200 pt-1 text-green-700">
                              Logged: {calculateHoursWorked(detail.attendance)}
                            </div>
                          </div>
                        ) : (
                          "-"
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