import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat); // enable parsing "h:mm A"
import axios from "../../../instance/Axios";

const AdminAttendanceView = () => {
  const [staffLogs, setStaffLogs] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null); // full staff object
  const [staffList, setStaffList] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(dayjs().startOf("month"));

  // Fetch staff list on mount
  useEffect(() => {
    const fetchStaffList = async () => {
      try {
        const res = await axios.get("/attendance/staff-list");
        console.log(res.data); // see structure in console

        // store full objects
        const staffArray = res.data?.data ?? [];
        setStaffList(staffArray);
        if (staffArray.length > 0) setSelectedStaff(staffArray[0]);
      } catch (error) {
        console.error("Error fetching staff list:", error);
        // Fallback to fake data
        const fake = [
          { id: 1, name: "Alice" },
          { id: 2, name: "Bob" },
          { id: 3, name: "Charlie" },
          { id: 4, name: "David" },
          { id: 5, name: "Eve" },
        ];
        setStaffList(fake);
        setSelectedStaff(fake[0]);
      }
    };
    fetchStaffList();
  }, []);

  // Fetch attendance logs whenever selected staff or current month changes
  useEffect(() => {
    if (!selectedStaff) return;

    const fetchAttendance = async () => {
      try {
        const month = currentMonth.month() + 1; // dayjs month is 0-based
        const year = currentMonth.year();
        const response = await axios.post("/attendance/staff-attendance/get", {
          staffName: selectedStaff.name,
          staffId: selectedStaff.id,
          month,
          year,
        });

        console.log(response);

        setStaffLogs(response.data?.data || []);
      } catch (error) {
        console.error("Error fetching staff attendance:", error);
        setStaffLogs([]); // clear logs on error
      }
    };

    fetchAttendance();
  }, [selectedStaff, currentMonth]);

  const filteredLogs = staffLogs; // already filtered by API

  // Calculate min and max work hours for the current staff/month
  const workHoursArray = filteredLogs.map((log) => {
    const entry = dayjs(log.entryTime, "h:mm A");
    const exit = dayjs(log.exitTime, "h:mm A");
    return exit.diff(entry, "hour", true);
  });
  const maxHours = workHoursArray.length ? Math.max(...workHoursArray) : 0;
  const minHours = workHoursArray.length ? Math.min(...workHoursArray) : 0;

  const goToPreviousMonth = () =>
    setCurrentMonth(currentMonth.subtract(1, "month"));
  const goToNextMonth = () => setCurrentMonth(currentMonth.add(1, "month"));

  return (
    <div className="p-6 flex gap-6">
      {/* Staff list */}
      <div className="w-1/4 bg-white shadow rounded-xl p-4 flex flex-col">
        <h3 className="text-lg font-bold mb-4">Staff</h3>
        <div className="flex-1 overflow-y-auto">
          <ul>
            {staffList.map((staff) => (
              <li
                key={staff.id}
                className={`cursor-pointer p-2 rounded hover:bg-gray-100 ${
                  selectedStaff?.id === staff.id
                    ? "bg-gray-200 font-semibold"
                    : ""
                }`}
                onClick={() => setSelectedStaff(staff)}
              >
                {staff.name}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Attendance logs */}
      <div className="flex-1 bg-white shadow rounded-xl p-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">
            {selectedStaff?.name} - Attendance Logs (
            {currentMonth.format("MMMM YYYY")})
          </h3>
          <div className="space-x-2">
            <button
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              onClick={goToPreviousMonth}
            >
              Previous
            </button>
            <button
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              onClick={goToNextMonth}
            >
              Next
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mb-4">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-red-300 border rounded"></div>
            <span className="text-sm text-gray-700">Least hours worked</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-blue-300 border rounded"></div>
            <span className="text-sm text-gray-700">Most hours worked</span>
          </div>
        </div>

        {/* Scrollable table container */}
        <div className="overflow-y-auto" style={{ maxHeight: "500px" }}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-600 uppercase">
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Entry Time</th>
                <th className="px-4 py-2">Exit Time</th>
                <th className="px-4 py-2">Hours Worked</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLogs.map((log, index) => {
                const entry = dayjs(log.entryTime, "h:mm A");
                const exit = dayjs(log.exitTime, "h:mm A");
                const workHours = exit.diff(entry, "hour", true);

                let rowClass = "";
                if (workHours === maxHours) rowClass = "bg-blue-300";
                else if (workHours === minHours) rowClass = "bg-red-300";

                return (
                  <tr
                    key={log.id ?? `${log.date}-${log.entryTime}-${index}`}
                    className={rowClass}
                  >
                    <td className="px-4 py-2">
                      {dayjs(log.date).format("DD/MM/YYYY")}
                    </td>
                    <td className="px-4 py-2">{entry.format("hh:mm A")}</td>
                    <td className="px-4 py-2">{exit.format("hh:mm A")}</td>
                    <td className="px-4 py-2">{workHours.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAttendanceView;
