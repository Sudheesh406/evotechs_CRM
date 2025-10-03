import { useEffect, useState } from "react";
import axios from "../../../instance/Axios";
import Swal from "sweetalert2";

const StaffWorklog = () => {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [staffId, setStaffId] = useState("");
  const [workDetails, setWorkDetails] = useState([]);
  const [staff, setStaff] = useState([]);

  // Fetch staff list
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
      console.log("Error fetching staff details:", error);
    }
  };

  // Fetch worklogs
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
      console.log("Error fetching work details:", error);
      setWorkDetails([]);
    }
  };

  useEffect(() => {
    getStaffDetails();
  }, []);

  useEffect(() => {
    getWork();
  }, [staffId, month, year, staff]);

  // Helper function to calculate total hours worked from attendance
  const calculateHoursWorked = (attendance) => {
    if (!attendance || attendance.length === 0) return "0h 0m";

    let totalMinutes = 0;
    let entryTime = null;

    attendance.forEach((a) => {
      const [hours, minutes, seconds] = a.time.split(":").map(Number);
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

  // Helper to calculate total task time
  const calculateTotalTaskTime = (tasks) => {
    if (!tasks || tasks.length === 0) return "0h 0m";

    let totalMinutes = 0;

    tasks.forEach((t) => {
      if (!t.time) return;
      const [hours, minutes] = t.time.split(":").map(Number); // assuming t.time format "h:m" or "hh:mm"
      totalMinutes += hours * 60 + minutes;
    });

    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}h ${m}m`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Work Log</h1>
          <p className="mt-2 text-sm text-gray-500">
            Viewing work logs for {year},{" "}
            {new Date(0, month - 1).toLocaleString("default", { month: "long" })}.
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <select
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
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
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
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
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
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
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
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
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {workDetails.length > 0 ? (
                workDetails.map((detail, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {detail.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {detail.staffName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {detail.staffEmail}
                    </td>
                    {/* Tasks */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {detail.tasks?.length > 0
                        ? detail.tasks.map((t, i) => <div key={i}>{t.taskName}</div>)
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {detail.tasks?.length > 0
                        ? detail.tasks.map((t, i) => <div key={i}>{t.comment}</div>)
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {detail.tasks?.length > 0 ? (
                        <>
                          {detail.tasks.map((t, i) => (
                            <div key={i}>{t.time}</div>
                          ))}
                          <div className="mt-1 font-semibold">
                            Total: {calculateTotalTaskTime(detail.tasks)}
                          </div>
                        </>
                      ) : (
                        "-"
                      )}
                    </td>
                    {/* Attendance */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {detail.attendance?.length > 0 ? (
                        <>
                          {detail.attendance.map((a, i) => (
                            <div key={i}>
                              {a.type}: {a.time}
                            </div>
                          ))}
                          <div className="mt-1 font-semibold">
                            Hours Worked: {calculateHoursWorked(detail.attendance)}
                          </div>
                        </>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    No work details available yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Showing {workDetails.length} entries
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffWorklog;
