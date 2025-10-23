import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
// Import icons for a better UI experience (assuming you have a library like react-icons)
// import { ChevronLeft, ChevronRight, Users, Clock } from 'lucide-react'; // Example imports

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
    // Note: The original code uses entryTime and exitTime which are "h:mm A" strings.
    // The diff calculation is correct for determining the duration.
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
    <div className="p-8 bg-gray-50 min-h-screen"> {/* Added background color for contrast */}
      <div className="flex gap-8 max-w-7xl mx-auto">
        {/* Staff list Card */}
        <div className="w-72 bg-white shadow-xl rounded-2xl p-6 flex flex-col border border-gray-100"> {/* Enhanced shadow and border-radius */}
          <h3 className="text-xl font-extrabold mb-4 text-indigo-700 flex items-center gap-2">
            {/* {<Users className="w-5 h-5" />} */}
            Staff Directory
          </h3>
          <div className="flex-1 overflow-y-auto -mx-2"> {/* Negative margin to align list items better */}
            <ul>
              {staffList.map((staff) => (
                <li
                  key={staff.id}
                  className={`cursor-pointer p-3 my-1 rounded-lg transition-all duration-200 ease-in-out ${
                    selectedStaff?.id === staff.id
                      ? "bg-indigo-50 text-indigo-700 font-bold border-l-4 border-indigo-500" // Highlight selected
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

        {/* Attendance logs Card */}
        <div className="flex-1 bg-white shadow-xl rounded-2xl p-6 flex flex-col border border-gray-100"> {/* Enhanced shadow and border-radius */}
          
          {/* Header and Controls */}
          <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-4">
            <h3 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
              {/* {<Clock className="w-6 h-6 text-indigo-500" />} */}
              {selectedStaff?.name || 'Select Staff'} - Attendance
              <span className="text-indigo-600 font-semibold ml-2 text-xl">
                ({currentMonth.format("MMMM YYYY")})
              </span>
            </h3>
            <div className="space-x-3 flex items-center">
              <button
                className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition duration-150 shadow-sm"
                onClick={goToPreviousMonth}
                aria-label="Previous Month"
              >
                {/* {<ChevronLeft className="w-5 h-5" />} */}
                &lt;
              </button>
              <button
                className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition duration-150 shadow-sm"
                onClick={goToNextMonth}
                aria-label="Next Month"
              >
                {/* {<ChevronRight className="w-5 h-5" />} */}
                &gt;
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="flex gap-6 mb-6">
            <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg border border-red-200">
              <div className="w-4 h-4 bg-red-400 rounded-full shadow-md"></div>
              <span className="text-sm text-red-700 font-medium">Least hours worked</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
              <div className="w-4 h-4 bg-blue-400 rounded-full shadow-md"></div>
              <span className="text-sm text-blue-700 font-medium">Most hours worked</span>
            </div>
          </div>

          {/* Scrollable table container */}
          <div className="overflow-y-auto border border-gray-200 rounded-lg" style={{ maxHeight: "600px" }}> {/* Added border to container */}
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="sticky top-0 bg-indigo-50 z-10 shadow-sm"> {/* Sticky header and indigo background */}
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Entry Time</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Exit Time</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Hours Worked</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredLogs.map((log, index) => {
                  const entry = dayjs(log.entryTime, "h:mm A");
                  const exit = dayjs(log.exitTime, "h:mm A");
                  const workHours = exit.diff(entry, "hour", true);

                  let rowClass = "hover:bg-gray-50 transition duration-100"; // Default row class
                  let textClass = "text-gray-900";

                  if (workHours === maxHours && maxHours > 0) {
                    rowClass = "bg-blue-100 hover:bg-blue-200 transition duration-100 shadow-inner border-l-4 border-blue-400";
                    textClass = "font-semibold text-blue-800";
                  } else if (workHours === minHours && minHours > 0) {
                    rowClass = "bg-red-100 hover:bg-red-200 transition duration-100 shadow-inner border-l-4 border-red-400";
                    textClass = "font-semibold text-red-800";
                  } else if (index % 2 !== 0) {
                    rowClass = "bg-gray-50 hover:bg-gray-100 transition duration-100"; // Zebra striping
                  }


                  return (
                    <tr
                      key={log.id ?? `${log.date}-${log.entryTime}-${index}`}
                      className={rowClass}
                    >
                      <td className={`px-6 py-3 whitespace-nowrap text-sm ${textClass}`}>
                        {dayjs(log.date).format("ddd, DD MMM YYYY")} {/* Better date format */}
                      </td>
                      <td className={`px-6 py-3 whitespace-nowrap text-sm ${textClass}`}>{entry.format("hh:mm A")}</td>
                      <td className={`px-6 py-3 whitespace-nowrap text-sm ${textClass}`}>{exit.format("hh:mm A")}</td>
                      <td className={`px-6 py-3 whitespace-nowrap text-sm ${textClass}`}>
                        <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium ${
                            workHours === maxHours && maxHours > 0 ? 'bg-blue-200 text-blue-800' :
                            workHours === minHours && minHours > 0 ? 'bg-red-200 text-red-800' :
                            'bg-gray-200 text-gray-800'
                        }`}>
                            {workHours.toFixed(2)} hrs
                        </span>
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