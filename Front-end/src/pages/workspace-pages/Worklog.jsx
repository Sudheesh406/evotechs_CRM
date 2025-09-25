import { useState, useEffect, useRef } from "react";
import axios from "../../instance/Axios";
import Swal from "sweetalert2";

const Worklog = () => {
  const [tableData, setTableData] = useState([]);
  const [dates, setDates] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const saveButtonRef = useRef(null);

  const numColumns = 15;

  // month/year state
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // menu state
  const [showOptions, setShowOptions] = useState(false);
  const [importChoice, setImportChoice] = useState("");

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCell, setModalCell] = useState({ row: null, col: null });
  const [modalComment, setModalComment] = useState("");

  // ref for outside click
  const menuRef = useRef(null);

  const getDaysInMonth = (year, month) =>
    new Date(year, month + 1, 0).getDate();

  const generateInitialData = (daysInMonth, numCols) => {
    const generatedData = [];
    const initialAttendance = [];
    for (let row = 0; row < daysInMonth; row++) {
      // Initialize cells as an object with empty value and comment
      // This is crucial for consistently handling comments on empty cells
      generatedData.push(
        Array(numCols).fill({
          value: "",
          comment: "",
        })
      );
      initialAttendance.push("");
    }
    return { generatedData, initialAttendance };
  };

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

    // Initial load will use the default structure, then getWorklog will overwrite
    const { generatedData, initialAttendance } = generateInitialData(
      daysInMonth,
      numColumns
    );
    setTableData(generatedData);
    setAttendance(initialAttendance);

    // Only set default task names if 'tasks' is empty (to avoid overwriting imported tasks immediately)
    if (tasks.length === 0) {
      const initialTasks = Array(numColumns)
        .fill("")
        .map((_, i) => `Task ${i + 1}`);
      setTasks(initialTasks);
    }

    getWorklog(currentMonth + 1, currentYear);
  }, [currentMonth, currentYear]); // tasks is intentionally left out to avoid infinite loop

  // close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  // 🐛 FIX 1: Ensure cell data is always an object to hold the comment
  const handleCellChange = (rowIndex, colIndex, value) => {
    const updatedData = [...tableData];
    const currentCell = updatedData[rowIndex][colIndex];

    // Ensure we are working with an object structure
    if (typeof currentCell === "object") {
      updatedData[rowIndex][colIndex] = {
        ...currentCell,
        value: value,
      };
    } else {
      // This handles the case where the cell was unexpectedly a string (shouldn't happen with new init)
      updatedData[rowIndex][colIndex] = {
        value: value,
        comment: "", // Default empty comment
      };
    }

    setTableData(updatedData);
    triggerToast();
  };

  const handleTaskChange = (colIndex, value) => {
    const updatedTasks = [...tasks];
    updatedTasks[colIndex] = value;
    setTasks(updatedTasks);
    triggerToast();
  };

  const handleAttendanceChange = (rowIndex, value) => {
    const updatedAttendance = [...attendance];
    updatedAttendance[rowIndex] = value;
    setAttendance(updatedAttendance);
    triggerToast();
  };



const getWorklog = async (month, year) => {
  try {
    // Show loading popup
    Swal.fire({
      title: "Loading Worklogs...",
      text: "Please wait while we fetch your data",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const response = await axios.post("/worklog/get", { month, year });
    const worklogs = response.data.data; // your array of worklogs

    const daysInMonth = getDaysInMonth(year, month - 1);
    const { generatedData, initialAttendance } = generateInitialData(
      daysInMonth,
      numColumns
    );
    const newTableData = generatedData;
    const newAttendance = initialAttendance;

    // Temporary array to hold retrieved task names
    const retrievedTasks = Array(numColumns).fill(null);

    worklogs.forEach((log) => {
      const dateObj = new Date(log.date);
      const day = dateObj.getDate();
      const rowIndex = day - 1; // 1st day -> index 0

      if (rowIndex >= 0 && rowIndex < daysInMonth) {
        const taskMatch = log.taskNumber.match(/task(\d+)/i);
        const taskNum = taskMatch ? parseInt(taskMatch[1]) : null;
        const colIndex = taskNum ? taskNum - 1 : -1;

        if (colIndex >= 0 && colIndex < numColumns) {
          newTableData[rowIndex][colIndex] = {
            value: log.time || "",
            comment: log.comment || "",
          };

          if (log.taskName && !retrievedTasks[colIndex]) {
            retrievedTasks[colIndex] = log.taskName;
          }
        }

        if (log.attendance !== undefined) {
          newAttendance[rowIndex] = log.attendance;
        }
      }
    });

    setTableData(newTableData);
    setAttendance(newAttendance);

    const defaultTasks = Array(numColumns)
      .fill("")
      .map((_, i) => `Task ${i + 1}`);

    const finalTasks = defaultTasks.map((defaultName, i) => {
      return retrievedTasks[i] || tasks[i] || defaultName;
    });

    setTasks(finalTasks);

    // Close loading popup
    Swal.close();
  } catch (error) {
    // Close loading popup if still open
    Swal.close();

    console.error("Error found in getWorklog", error);

    // Show error popup
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Failed to fetch worklogs. Please try again.",
    });

    // Fallback for tasks if the API fails
    if (tasks.length === 0) {
      setTasks(
        Array(numColumns)
          .fill("")
          .map((_, i) => `Task ${i + 1}`)
      );
    }
  }
};


const handleSave = async () => {
  try {
    // Show loading popup
    Swal.fire({
      title: "Saving Worklogs...",
      text: "Please wait while we save your data",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const payload = tableData
      .map((rowData, rowIndex) => {
        const typedTasks = rowData
          .map((cellData, colIndex) => {
            const value = cellData.value;
            const comment = cellData.comment;

            if (value !== "") {
              return {
                taskName: tasks[colIndex],
                time: value,
                comment: comment || "",
                taskNumber: `task${colIndex + 1}`,
              };
            }
            return null;
          })
          .filter(Boolean);

        if (typedTasks.length > 0 || attendance[rowIndex] !== "") {
          const dateString = `${dates[rowIndex]}, ${currentYear}`;
          const date = new Date(dateString);
          const formatted = date.toLocaleDateString("en-CA"); // YYYY-MM-DD

          return {
            date: formatted,
            attendance: attendance[rowIndex] || "",
            tasks: typedTasks,
          };
        }
        return null;
      })
      .filter(Boolean);

    console.log("Filtered Data:", payload);

    // Send payload to backend
    await axios.post("/worklog/create", { worklogs: payload });

    // Close loading popup
    Swal.close();

    // Show success popup
    Swal.fire({
      icon: "success",
      title: "Worklogs Saved!",
      text: "Your worklogs have been saved successfully.",
      timer: 2000,
      showConfirmButton: false,
    });

    triggerToast();
  } catch (error) {
    console.error("Error saving data:", error);
    Swal.close();

    // Show error popup
    Swal.fire({
      icon: "error",
      title: "Save Failed",
      text: "Failed to save worklogs. Please try again.",
    });
  }
};



  const columnTotals = tasks.map((_, colIndex) =>
    tableData.reduce((sum, row) => {
      const val = row[colIndex] ? parseFloat(row[colIndex].value) : 0;
      return sum + (isNaN(val) ? 0 : val);
    }, 0)
  );

  const rowTotals = tableData.map((row) =>
    row.reduce((sum, val) => {
      const num = val ? parseFloat(val.value) : 0;
      return sum + (isNaN(num) ? 0 : num);
    }, 0)
  );

  // month navigation
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };


  // handle double-click to open comment modal
  const handleCellDoubleClick = (rowIndex, colIndex) => {
    setModalCell({ row: rowIndex, col: colIndex });
    const cell = tableData[rowIndex][colIndex];
    // Cell is now guaranteed to be an object
    setModalComment(cell.comment || "");
    setModalOpen(true);
  };

  const handleSaveComment = () => {
    const updatedData = [...tableData];
    const { row, col } = modalCell;

    // Cell is guaranteed to be an object with 'value' and 'comment' keys
    updatedData[row][col] = {
      ...updatedData[row][col],
      comment: modalComment,
    };

    setTableData(updatedData);
    setModalOpen(false);
    triggerToast();
  };

  return (
    <div className="flex flex-col bg-gray-50 font-sans text-gray-800 relative">
      <header className="p-4 bg-white shadow-md flex justify-between items-center relative">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Performance</h1>
          <span className="text-sm font-semibold">
            {new Date(currentYear, currentMonth).toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>

        <div className="relative flex items-center gap-2">
          {/* Save Button */}
          <button
            ref={saveButtonRef}
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Save
          </button>

          {/* 3-dot Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowOptions((prev) => !prev)}
              className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              ⋮
            </button>

            {showOptions && (
              <div
                ref={menuRef}
                className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-200 shadow-lg rounded-xl z-50 animate-[fadeInScale_.15s_ease-out]"
              >
                <div className="px-4 py-3 border-b border-gray-100">
                  <h3 className="text-sm font-medium text-gray-700">
                    Quick Actions
                  </h3>
                </div>

                <div className="py-2 flex">
                  <button
                    onClick={() => goToPreviousMonth()}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={() => goToNextMonth()}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>

          {showToast && (
            <div className="absolute top-full mt-2 right-0 w-[170px] bg-green-500 text-white text-sm px-4 py-3 rounded shadow-md animate-slideDown z-50">
              Changes saved
            </div>
          )}
        </div>
      </header>

      {/* TABLE */}
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
                    onChange={(e) => handleTaskChange(colIndex, e.target.value)}
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
                          handleCellChange(rowIndex, cellIndex, e.target.value)
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
              <td className="p-3 text-sm text-gray-700 whitespace-nowrap border-r border-gray-300">
                {rowTotals.reduce((a, b) => a + b, 0)}
              </td>
              <td className="p-3 text-sm text-gray-700 whitespace-nowrap border-r border-gray-300"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* COMMENT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-2">Add Comment</h3>
            <textarea
              className="w-full h-24 border border-gray-300 rounded p-2 mb-4 focus:outline-none focus:ring-1 focus:ring-blue-400"
              value={modalComment}
              onChange={(e) => setModalComment(e.target.value)}
              placeholder="Type your comment..."
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveComment}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes slideDown {
            0% { transform: translateY(-10px); opacity: 0; }
            10% { transform: translateY(0); opacity: 1; }
            90% { transform: translateY(0); opacity: 1; }
            100% { transform: translateY(-10px); opacity: 0; }
          }
          .animate-slideDown {
            animation: slideDown 2s ease-in-out forwards;
          }
        `}
      </style>
    </div>
  );
};

export default Worklog;