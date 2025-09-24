import { useState, useEffect, useRef } from "react";
import axios from "../../instance/Axios";

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

    const generatedData = [];
    const initialAttendance = [];
    for (let row = 0; row < daysInMonth; row++) {
      generatedData.push(Array(numColumns).fill(""));
      initialAttendance.push("");
    }
    setTableData(generatedData);
    setAttendance(initialAttendance);

    const initialTasks = Array(numColumns)
      .fill("")
      .map((_, i) => `Task ${i + 1}`);
    setTasks(initialTasks);

    getWorklog(currentMonth,currentYear)

  }, [currentMonth, currentYear]);

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

  const handleCellChange = (rowIndex, colIndex, value) => {
    const updatedData = [...tableData];
    if (typeof updatedData[rowIndex][colIndex] === "object") {
      updatedData[rowIndex][colIndex] = {
        ...updatedData[rowIndex][colIndex],
        value,
      };
    } else {
      updatedData[rowIndex][colIndex] = value;
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

  
  const getWorklog = async (month,year)=>{
    try {
      const response = await axios.post('/worklog/get',{month,year})
      console.log('response',response)
      
    } catch (error) {
      console.log('error found in getWorklog',error)
    }
  }

  ///date sending is not correct.................................

  const handleSave = async () => {
  try {
    const payload = tableData
      .map((rowData, rowIndex) => {
        const typedTasks = rowData
          .map((cellData, colIndex) => {
            const value =
              typeof cellData === "object" ? cellData.value : cellData;
            if (value !== "") {
              return {
                taskIndex: colIndex + 1,
                taskName: tasks[colIndex],
                value,
                comment:
                  typeof cellData === "object" ? cellData.comment || "" : "",
              };
            }
            return null;
          })
          .filter(Boolean);

        if (typedTasks.length > 0 || attendance[rowIndex] !== "") {
          // Convert date to YYYY-MM-DD
          const dateString = `${dates[rowIndex]}, ${currentYear}`; // e.g., "Mon, Sep 01, 2025"
          const formattedDate = new Date(dateString)
            .toISOString()
            .split("T")[0]; // "2025-09-01"

          return {
            date: formattedDate, // <- formatted here
            attendance: attendance[rowIndex] || "",
            tasks: typedTasks,
            // rowTotal: rowTotals[rowIndex],
          };
        }
        return null;
      })
      .filter(Boolean);

    console.log("Filtered Data:", payload);
    await axios.post("/worklog/create", payload);
    triggerToast();
  } catch (error) {
    console.error(error);
    alert("Error saving data!");
  }
};


  const columnTotals = tasks.map((_, colIndex) =>
    tableData.reduce((sum, row) => {
      const val =
        typeof row[colIndex] === "object"
          ? parseFloat(row[colIndex].value)
          : parseFloat(row[colIndex]);
      return sum + (isNaN(val) ? 0 : val);
    }, 0)
  );

  const rowTotals = tableData.map((row) =>
    row.reduce((sum, val) => {
      const num =
        typeof val === "object" ? parseFloat(val.value) : parseFloat(val);
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

  // mock import tasks (from previous month or template)
  const importTaskSets = {
    "Template A": [
      "Coding",
      "Testing",
      "Documentation",
      "Meeting",
      "Support",
      ...Array(numColumns - 5).fill("Task"),
    ],
    "Template B": [
      "Design",
      "Review",
      "Deployment",
      "Bug Fixing",
      ...Array(numColumns - 4).fill("Task"),
    ],
  };

  const handleImportTasks = (templateName) => {
    if (!templateName) return;
    if (importTaskSets[templateName]) {
      const importedTasks = importTaskSets[templateName];
      const filledTasks = [
        ...importedTasks,
        ...Array(numColumns - importedTasks.length)
          .fill("")
          .map((_, i) => `Task ${i + importedTasks.length + 1}`),
      ].slice(0, numColumns);
      setTasks(filledTasks);
      triggerToast();
    }
  };

  // handle double-click to open comment modal
  const handleCellDoubleClick = (rowIndex, colIndex) => {
    setModalCell({ row: rowIndex, col: colIndex });
    const cell = tableData[rowIndex][colIndex];
    setModalComment(typeof cell === "object" ? cell.comment || "" : "");
    setModalOpen(true);
  };

  const handleSaveComment = () => {
    const updatedData = [...tableData];
    if (
      !updatedData[modalCell.row][modalCell.col] ||
      typeof updatedData[modalCell.row][modalCell.col] === "string"
    ) {
      updatedData[modalCell.row][modalCell.col] = {
        value: updatedData[modalCell.row][modalCell.col] || "",
        comment: modalComment,
      };
    } else {
      updatedData[modalCell.row][modalCell.col].comment = modalComment;
    }
    setTableData(updatedData);
    setModalOpen(false);
    triggerToast();
  };

  return (
    <div className="flex flex-col bg-gray-50 font-sans text-gray-800 relative">
      <header className="p-4 bg-white shadow-md flex justify-between items-center relative">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Activity and Progress View</h1>
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

                <div className="px-4 pt-3 pb-4 border-t border-gray-100">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Import tasks from
                  </label>
                  <select
                    value={importChoice}
                    onChange={(e) => {
                      setImportChoice(e.target.value);
                      handleImportTasks(e.target.value);
                    }}
                    className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                  >
                    <option value="">Select Template</option>
                    {Object.keys(importTaskSets).map((key) => (
                      <option key={key} value={key}>
                        {key}
                      </option>
                    ))}
                  </select>
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
                  const value =
                    typeof cellData === "object" ? cellData.value : cellData;
                  const comment =
                    typeof cellData === "object" ? cellData.comment : "";

                  return (
                    <td
                      key={cellIndex}
                      className={`relative group p-3 text-sm ... ${
                        comment ? "bg-yellow-100" : ""
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
                        placeholder="0"
                      />
                      {/* Tooltip */}
                      {comment && (
                        <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-full bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-pre-line">
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
