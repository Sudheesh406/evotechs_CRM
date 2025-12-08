import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);
import axios from "../../../instance/Axios";
import { ChevronLeft, ChevronRight } from "lucide-react";

const TARGET_HOURS_MIN = 7.5; // 7h 30m  → 450 minutes
const TARGET_HOURS_MAX = 7.75; // 7h 45m  → 465 minutes

const AdminAttendanceView = () => {
  const [staffLogs, setStaffLogs] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(dayjs().startOf("month"));

  // Convert difference to HH:MM format
  const formatHoursWorked = (start, end) => {
    if (!start || !end || !start.isValid() || !end.isValid()) return null;

    const diffMinutes = end.diff(start, "minute");
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    return `${hours} hours ${minutes} min`;
  };

  // Fetch staff list
  useEffect(() => {
    const fetchStaffList = async () => {
      try {
        const res = await axios.get("/attendance/staff-list");
        const staffArray = res.data?.data ?? [];
        setStaffList(staffArray);
        if (staffArray.length > 0) setSelectedStaff(staffArray[0]);
      } catch (error) {
        console.error("Error fetching staff list:", error);
        const fake = [
          { id: 1, name: "Alice Johnson" },
          { id: 2, name: "Bob Williams" },
          { id: 3, name: "Charlie Brown" },
          { id: 4, name: "David Lee" },
          { id: 5, name: "Eve Davis" },
        ];
        setStaffList(fake);
        setSelectedStaff(fake[0]);
      }
    };
    fetchStaffList();
  }, []);

  // Fetch attendance
  useEffect(() => {
    if (!selectedStaff) return;

    const fetchAttendance = async () => {
      try {
        const month = currentMonth.month() + 1;
        const year = currentMonth.year();
        const response = await axios.post("/attendance/staff-attendance/get", {
          staffName: selectedStaff.name,
          staffId: selectedStaff.id,
          month,
          year,
        });

        setStaffLogs(response.data?.data || []);
      } catch (error) {
        console.error("Error fetching staff attendance:", error);
        setStaffLogs([]);
      }
    };

    fetchAttendance();
  }, [selectedStaff, currentMonth]);

  const filteredLogs = staffLogs;

  const goToPreviousMonth = () =>
    setCurrentMonth(currentMonth.subtract(1, "month"));
  const goToNextMonth = () => setCurrentMonth(currentMonth.add(1, "month"));

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex gap-8 max-w-7xl mx-auto">
        {/* Staff List */}
        <div className="w-72 bg-white shadow-xl rounded-2xl p-6 flex flex-col border border-gray-100">
          <h3 className="text-xl font-extrabold mb-4 text-indigo-700">
            Staff Directory
          </h3>
          <div className="flex-1 overflow-y-auto -mx-2">
            <ul>
              {staffList.map((staff) => (
                <li
                  key={staff.id}
                  className={`cursor-pointer p-3 my-1 rounded-lg transition-all duration-200 ${
                    selectedStaff?.id === staff.id
                      ? "bg-indigo-50 text-indigo-700 font-bold border-l-4 border-indigo-500"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                  onClick={() => setSelectedStaff(staff)}
                >
                  {staff.name}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="flex-1 bg-white shadow-xl rounded-2xl p-6 flex flex-col border border-gray-100">
          {/* Header */}
          <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-4">
            <h3 className="text-2xl font-extrabold text-gray-800">
              {selectedStaff?.name || "Select Staff"} - Attendance
              <span className="text-indigo-600 font-semibold ml-2 text-xl">
                ({currentMonth.format("MMMM YYYY")})
              </span>
            </h3>

<div className="flex items-center space-x-3">
  <button
    onClick={goToPreviousMonth}
    className="p-2 rounded-xl bg-indigo-100 text-indigo-600 hover:bg-indigo-200 shadow-sm hover:shadow-md transition-all duration-200"
  >
    <ChevronLeft size={20} />
  </button>

  <button
    onClick={goToNextMonth}
    className="p-2 rounded-xl bg-indigo-100 text-indigo-600 hover:bg-indigo-200 shadow-sm hover:shadow-md transition-all duration-200"
  >
    <ChevronRight size={20} />
  </button>
</div>

          </div>

          {/* Legend */}
          <div className="flex gap-6 mb-6">
            <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg border border-red-200">
              <div className="w-4 h-4 bg-red-400 rounded-full"></div>
              <span className="text-sm text-red-700">Less Than 7:30</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
              <div className="w-4 h-4 bg-blue-400 rounded-full"></div>
              <span className="text-sm text-blue-700">More Than 7:45</span>
            </div>
          </div>

          {/* Table */}
          <div
            className="overflow-y-auto border border-gray-200 rounded-lg"
            style={{ maxHeight: "600px" }}
          >
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="sticky top-0 bg-indigo-50 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase">
                    Entry Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase">
                    Exit Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase">
                    Hours Worked
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-100">
                {filteredLogs.map((log, index) => {
                  const entry =
                    log.entryTime && log.entryTime !== "null"
                      ? dayjs(log.entryTime, "h:mm A")
                      : null;

                  const exit =
                    log.exitTime && log.exitTime !== "null"
                      ? dayjs(log.exitTime, "h:mm A")
                      : null;

                  const workHoursText = formatHoursWorked(entry, exit);

                  const workMinutes =
                    entry && exit ? exit.diff(entry, "minute") : null;

                  let rowClass = "hover:bg-gray-50";
                  let textClass = "text-gray-900";

                  if (workMinutes > TARGET_HOURS_MAX * 60) {
                    rowClass =
                      "bg-blue-100 hover:bg-blue-200 border-l-4 border-blue-400";
                    textClass = "text-blue-800 font-semibold";
                  } else if (
                    workMinutes < TARGET_HOURS_MIN * 60 &&
                    workMinutes !== null
                  ) {
                    rowClass =
                      "bg-red-100 hover:bg-red-200 border-l-4 border-red-400";
                    textClass = "text-red-800 font-semibold";
                  } else if (index % 2 !== 0) {
                    rowClass = "bg-gray-50 hover:bg-gray-100";
                  }

                  return (
                    <tr key={index} className={rowClass}>
                      <td className={`px-6 py-3 text-sm ${textClass}`}>
                        {dayjs(log.date).format("ddd, DD MMM YYYY")}
                      </td>

                      <td className={`px-6 py-3 text-sm ${textClass}`}>
                        {entry ? entry.format("hh:mm A") : "Nil"}
                      </td>

                      <td className={`px-6 py-3 text-sm ${textClass}`}>
                        {exit ? exit.format("hh:mm A") : "Nil"}
                      </td>

                      <td className={`px-6 py-3 text-sm ${textClass}`}>
                        {workHoursText ? (
                          <span
                            className={`inline-flex px-3 py-0.5 rounded-full text-xs font-medium ${
                              workMinutes > TARGET_HOURS_MAX * 60
                                ? "bg-blue-200 text-blue-800"
                                : workMinutes < TARGET_HOURS_MIN * 60
                                ? "bg-red-200 text-red-800"
                                : "bg-gray-200 text-gray-800"
                            }`}
                          >
                            {workHoursText}
                          </span>
                        ) : (
                          <span className="inline-flex px-3 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                            Nil
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredLogs.length === 0 && selectedStaff && (
              <div className="text-center p-8 text-gray-500 text-lg">
                No attendance logs found for {currentMonth.format("MMMM YYYY")}.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAttendanceView;
