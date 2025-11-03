import { useState, useEffect, useRef } from "react";
import axios from "../../../instance/Axios";
import Swal from "sweetalert2";

const WorklogDetail = () => {
  const [tableData, setTableData] = useState([]);
  const [dates, setDates] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [staffId, setStaffId] = useState(""); // changed to string (single id)

  const numColumns = 30;
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showOptions, setShowOptions] = useState(false);
  const menuRef = useRef(null);

  const getDaysInMonth = (year, month) =>
    new Date(year, month + 1, 0).getDate();

  // -----------------------------
  // Fetch Staff List
  // -----------------------------
  const fetchStaffs = async () => {
    try {
      const { data } = await axios.get("/team/staff/get");
      setStaffs(data.data?.staffList || []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed to fetch staff",
        text: error.response?.data?.message || error.message,
      });
      console.error(error);
    }
  };

  useEffect(() => {
    fetchStaffs();
  }, []);

  // -----------------------------
  // Generate Date Headers
  // -----------------------------
  useEffect(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const generatedDates = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(currentYear, currentMonth, day);
      generatedDates.push(
        dateObj.toLocaleDateString(undefined, {
          weekday: "short",
          day: "2-digit",
          month: "short",
        })
      );
    }
    setDates(generatedDates);

    // Fetch worklog if staff is selected
    if (staffId) getWorklog(currentMonth + 1, currentYear, staffId);
  }, [currentMonth, currentYear, staffId]);

  // -----------------------------
  // Fetch Worklogs
  // -----------------------------
  const getWorklog = async (month, year, selectedStaffId) => {
    try {
      Swal.fire({
        title: "Loading Worklogs...",
        text: "Please wait while we fetch your data",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const response = await axios.post("/worklog/get/staff", {
        month,
        year,
        staffId: selectedStaffId,
      });

      console.log(response);

      const worklogs = response.data.data.worklogs;
      const dailyWorkHours = response.data.data.dailyWorkHours || [];

      const daysInMonth = getDaysInMonth(year, month - 1);
      const emptyTable = Array(daysInMonth)
        .fill(null)
        .map(() =>
          Array(numColumns).fill({
            value: "",
            comment: "",
          })
        );
      const newAttendance = Array(daysInMonth).fill("");

      const retrievedTasks = Array(numColumns).fill(null);

      worklogs.forEach((log) => {
        const dateObj = new Date(log.date);
        const day = dateObj.getDate();
        const rowIndex = day - 1;

        const taskMatch = log.taskNumber.match(/task(\d+)/i);
        const colIndex = taskMatch ? parseInt(taskMatch[1]) - 1 : -1;

        if (rowIndex >= 0 && rowIndex < daysInMonth && colIndex >= 0) {
          emptyTable[rowIndex][colIndex] = {
            value: log.time || "",
            comment: log.comment || "",
          };
          if (log.taskName && !retrievedTasks[colIndex]) {
            retrievedTasks[colIndex] = log.taskName;
          }
        }
      });

      dailyWorkHours.forEach((att) => {
        const dateObj = new Date(att.date);
        const day = dateObj.getDate();
        const rowIndex = day - 1;
        if (rowIndex >= 0 && rowIndex < daysInMonth) {
          newAttendance[
            rowIndex
          ] = `${att.totalHours}h ${att.totalMinutes}m (${att.workTime})`;
        }
      });

      const defaultTasks = Array(numColumns)
        .fill("")
        .map((_, i) => `Task ${i + 1}`);

      const finalTasks = defaultTasks.map((t, i) => retrievedTasks[i] || t);

      setTableData(emptyTable);
      setTasks(finalTasks);
      setAttendance(newAttendance);

      Swal.close();
    } catch (err) {
      Swal.close();
      console.error("Error fetching worklogs", err);
      Swal.fire("Error", "Failed to load worklogs", "error");
    }
  };

  // -----------------------------
  // Helpers
  // -----------------------------
  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m, s] = timeStr.split(":").map(Number);
    return (h || 0) * 60 + (m || 0) + Math.floor((s || 0) / 60);
  };

  const formatMinutes = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const columnTotals = tasks.map((_, colIndex) => {
    const totalMinutes = tableData.reduce((sum, row) => {
      const val = row[colIndex]?.value || "";
      return sum + parseTimeToMinutes(val);
    }, 0);
    return formatMinutes(totalMinutes);
  });

  const rowTotals = tableData.map((row) => {
    const totalMinutes = row.reduce((sum, cell) => {
      const val = cell?.value || "";
      return sum + parseTimeToMinutes(val);
    }, 0);
    return formatMinutes(totalMinutes);
  });

  const grandTotal = (() => {
    const totalMinutes = tableData.flat().reduce((sum, cell) => {
      const val = cell?.value || "";
      return sum + parseTimeToMinutes(val);
    }, 0);
    return formatMinutes(totalMinutes);
  })();

  const totalAttendanceMinutes = attendance.reduce((sum, entry) => {
    if (!entry) return sum;
    const match = entry.match(/(\d+)h\s*(\d+)m/);
    if (match) {
      const hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      return sum + hours * 60 + minutes;
    }
    return sum;
  }, 0);

  const attendanceTotal = formatMinutes(totalAttendanceMinutes);

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else setCurrentMonth((prev) => prev - 1);
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else setCurrentMonth((prev) => prev + 1);
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="flex flex-col bg-gray-50 font-sans text-gray-800">
      {/* Header */}
      <header className="p-4 bg-white shadow-md flex justify-between items-center relative">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
            <span className="text-indigo-600">Work Log </span> Detail
          </h1>
          <span className="text-sm font-semibold">
            {new Date(currentYear, currentMonth).toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Staff Selector */}
          <select
            value={staffId}
            onChange={(e) => setStaffId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select Staff</option>
            {staffs.map((staff) => (
              <option key={staff.id} value={staff.id}>
                {staff.name}
              </option>
            ))}
          </select>

          {/* Menu Button */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowOptions((prev) => !prev)}
              className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              ⋮
            </button>

            {showOptions && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-200 shadow-lg rounded-xl z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h3 className="text-sm font-medium text-gray-700">
                    Month Navigation
                  </h3>
                </div>
                <div className="py-2 flex">
                  <button
                    onClick={goToPreviousMonth}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={goToNextMonth}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Table Section */}
      {staffId ? (
        <div className="flex-1 overflow-auto">
          <table className="min-w-[3000px] divide-y divide-gray-200 border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="sticky left-0 bg-gray-100 p-3 text-left text-sm font-semibold text-gray-600 border-r border-gray-200 z-20">
                  Date
                </th>
                {tasks.map((task, colIndex) => (
                  <th
                    key={colIndex}
                    className="p-3 text-left text-sm font-semibold text-gray-600 whitespace-nowrap border-r border-gray-200"
                  >
                    <input
                      type="text"
                      value={task}
                      onChange={(e) =>
                        handleTaskChange(colIndex, e.target.value)
                      }
                      className="w-full p-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                      placeholder={`Task ${colIndex + 1}`}
                    />
                  </th>
                ))}
                <th className="p-3 text-left text-sm font-semibold text-gray-600 border-r border-gray-200 whitespace-nowrap">
                  Total
                </th>
                <th className="p-3 text-left text-sm font-semibold text-gray-600 border-r border-gray-200 whitespace-nowrap">
                  Attendance
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-100">
              {tableData.map((rowData, rowIndex) => (
                <tr key={rowIndex}>
                  <td className="sticky left-0 bg-white p-3 text-sm font-medium text-gray-700 whitespace-nowrap border-r border-gray-200 z-10">
                    {dates[rowIndex]}
                  </td>
                  {rowData.map((cellData, cellIndex) => {
                    // CellData is always an object: {value, comment}
                    const value = cellData.value || "";
                    const comment = cellData.comment || "";

                    return (
                      <td
                        key={cellIndex}
                        className={`relative group p-3 text-sm border-r border-gray-200 ${
                          comment ? "bg-yellow-100" : "" // Highlight cells with a comment
                        }`}
                        onDoubleClick={() =>
                          handleCellDoubleClick(rowIndex, cellIndex)
                        }
                      >
                        <input
                          type="text"
                          value={value}
                          onChange={(e) =>
                            handleCellChange(
                              rowIndex,
                              cellIndex,
                              e.target.value
                            )
                          }
                          className="w-full p-1 text-sm text-black font-bold focus:outline-none focus:ring-1 focus:ring-blue-400"
                          placeholder="00:00:00"
                        />
                        {/* Tooltip */}
                        {comment && (
                          <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-full bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-pre-line pointer-events-none">
                            {comment}
                          </span>
                        )}
                      </td>
                    );
                  })}

                  <td className="p-3 text-sm text-gray-700 whitespace-nowrap border-r border-gray-300 font-semibold">
                    {rowTotals[rowIndex]}
                  </td>
                  <td className="p-3 text-sm text-gray-700 whitespace-nowrap border-r border-gray-300">
                    <input
                      type="text"
                      value={attendance[rowIndex]}
                      onChange={(e) =>
                        handleAttendanceChange(rowIndex, e.target.value)
                      }
                      className="w-full p-1 text-sm font-bold text-black focus:outline-none focus:ring-1 focus:ring-blue-400"
                      placeholder="0"
                    />
                  </td>
                </tr>
              ))}

              <tr className="bg-gray-200 font-bold">
                <td className="sticky left-0 bg-gray-200 p-3 text-sm border-r border-gray-300 z-10">
                  Total
                </td>
                {columnTotals.map((total, colIndex) => (
                  <td
                    key={colIndex}
                    className="p-3 text-sm text-gray-700 whitespace-nowrap border-r border-gray-300"
                  >
                    {total}
                  </td>
                ))}
                <td className="p-3 text-sm text-blue-700 whitespace-nowrap border-r border-gray-300">
                  {grandTotal}
                </td>
                <td className="p-3 text-sm text-blue-700 whitespace-nowrap border-r border-gray-300">
                  {attendanceTotal}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500 text-lg font-medium py-10">
          Please select a staff to view worklogs.
        </div>
      )}
    </div>
  );
};

export default WorklogDetail;
