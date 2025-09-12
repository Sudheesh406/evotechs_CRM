import React, { useState, useEffect, useRef } from "react";
import { LogIn, LogOut, X } from "lucide-react";
import axios from "../../instance/Axios";

const presetTimes = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];

function isValidTime(value) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value.trim());
}

export default function Attendance() {
  const [attendanceList, setAttendanceList] = useState([]);
  const [entryTime, setEntryTime] = useState("");
  const [exitTime, setExitTime] = useState("");
  const [showEntryDropdown, setShowEntryDropdown] = useState(false);
  const [showExitDropdown, setShowExitDropdown] = useState(false);
  const entryRef = useRef(null);
  const exitRef = useRef(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [editEntry, setEditEntry] = useState("");
  const [editExit, setEditExit] = useState("");
  const [showModalEntryDropdown, setShowModalEntryDropdown] = useState(false);
  const [showModalExitDropdown, setShowModalExitDropdown] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const modalEntryRef = useRef(null);
  const modalExitRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (entryRef.current && !entryRef.current.contains(event.target))
        setShowEntryDropdown(false);
      if (exitRef.current && !exitRef.current.contains(event.target))
        setShowExitDropdown(false);
      if (
        modalEntryRef.current &&
        !modalEntryRef.current.contains(event.target)
      )
        setShowModalEntryDropdown(false);
      if (modalExitRef.current && !modalExitRef.current.contains(event.target))
        setShowModalExitDropdown(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await axios.get("/attendance/get");
      const grouped = {};
      response.data.data.forEach((record) => {
        const date = record.attendanceDate;
        if (!grouped[date])
          grouped[date] = { id: date, date, entry: "", exit: "" };
        if (record.type === "entry") grouped[date].entry = record.time;
        if (record.type === "exit") grouped[date].exit = record.time;
      });
      setAttendanceList(Object.values(grouped));
    } catch (error) {
      console.error("Error fetching attendance:", error);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleAttendance = async (data) => {
    try {
      await axios.post("/attendance/register", data);
      fetchAttendance();
    } catch (error) {
      console.error("Error saving attendance:", error);
    }
  };

  const markEntry = () => {
    if (!entryTime || !isValidTime(entryTime))
      return alert("Please enter a valid entry time in HH:MM format");
    const today = new Date().toISOString().split("T")[0];
    handleAttendance({ date: today, entryTime, shedule: "entry" });
    setEntryTime("");
    setShowEntryDropdown(false);
  };

  const markExit = () => {
    if (!exitTime || !isValidTime(exitTime))
    return alert("Please enter a valid exit time in HH:MM format");
    const today = new Date().toISOString().split("T")[0];
    handleAttendance({ date: today, exitTime, shedule: "exit" });
    setExitTime("");
    setShowExitDropdown(false);
  };

  // Open modal
  const handleAttendanceEdit = (record) => {
    setEditRecord(record);
    setEditEntry(record.entry);
    setEditExit(record.exit);
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const handleAttendanceDelete = async (record) => {
    try {
      const response = await axios.delete(`/attendance/delete/${record.id}`)
      console.log(response)
      fetchAttendance();
    } catch (error) {
      console.error("Error deleting attendance:", error);
      setErrorMessage("Failed to delete");
    }
  }
  
const handleModalSubmit = async () => {
  setErrorMessage("");

  // Only validate if the user actually changed a field
  const hasEntryChanged = editRecord.entry !== editEntry && editEntry !== "";
  const hasExitChanged = editRecord.exit !== editExit && editExit !== "";

  if (!hasEntryChanged && !hasExitChanged) {
    setErrorMessage("No changes made");
    return;
  }

  // Validate time formats if fields changed
  if (hasEntryChanged && !isValidTime(editEntry)) {
    setErrorMessage("Invalid entry time");
    return;
  }
  if (hasExitChanged && !isValidTime(editExit)) {
    setErrorMessage("Invalid exit time");
    return;
  }
  console.log(editRecord)
  try {
    if (hasEntryChanged) {
      await axios.put(`/attendance/edit/${editRecord.id}`, {
        date: editRecord.date,
        entryTime: editEntry,
        shedule: "entry",
      });
    }
    if (hasExitChanged) {
      await axios.put(`/attendance/edit/${editRecord.id}`, {
        date: editRecord.date,
        exitTime: editExit,
        shedule: "exit",
      });
    }
    setIsModalOpen(false);
    fetchAttendance();
  } catch (error) {
    console.error("Error updating attendance:", error);
    setErrorMessage("Failed to update");
  }
};

  return (
    <div className="min-h-[680px] bg-gray-50 p-6 space-y-8">
      {/* Attendance Form Card */}
      <div className="bg-white rounded-xl shadow-md p-6 max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Mark Attendance
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {/* Entry */}
          <div className="relative" ref={entryRef}>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Entry Time (Railway / 24-Hour Clock)
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 bg-gray-50">
              <LogIn className="text-orange-500 w-4 h-4 mr-2" />
              <input
                type="text"
                placeholder="HH:MM"
                value={entryTime}
                onChange={(e) => setEntryTime(e.target.value)}
                onFocus={() => setShowEntryDropdown(true)}
                className="w-full py-2 text-sm bg-transparent focus:outline-none"
              />
            </div>
            {showEntryDropdown && (
              <ul className="absolute z-10 bg-white border border-gray-300 rounded shadow mt-1 w-full max-h-48 overflow-auto text-sm">
                {presetTimes.map((time) => (
                  <li
                    key={time}
                    onClick={() => {
                      setEntryTime(time);
                      setShowEntryDropdown(false);
                    }}
                    className="px-3 py-1 hover:bg-orange-100 cursor-pointer"
                  >
                    {time}
                  </li>
                ))}
              </ul>
            )}
            <button
              onClick={markEntry}
              className="mt-3 w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
            >
              Mark Entry
            </button>
          </div>

          {/* Exit */}
          <div className="relative" ref={exitRef}>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Exit Time (Railway / 24-Hour Clock)
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 bg-gray-50">
              <LogOut className="text-purple-500 w-4 h-4 mr-2" />
              <input
                type="text"
                placeholder="HH:MM"
                value={exitTime}
                onChange={(e) => setExitTime(e.target.value)}
                onFocus={() => setShowExitDropdown(true)}
                className="w-full py-2 text-sm bg-transparent focus:outline-none"
              />
            </div>
            {showExitDropdown && (
              <ul className="absolute z-10 bg-white border border-gray-300 rounded shadow mt-1 w-full max-h-48 overflow-auto text-sm">
                {presetTimes.map((time) => (
                  <li
                    key={time}
                    onClick={() => {
                      setExitTime(time);
                      setShowExitDropdown(false);
                    }}
                    className="px-3 py-1 hover:bg-purple-100 cursor-pointer"
                  >
                    {time}
                  </li>
                ))}
              </ul>
            )}
            <button
              onClick={markExit}
              className="mt-3 w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Mark Exit
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Records */}
      <div className="bg-white rounded-xl shadow-md p-6 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Attendance Records
        </h2>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-700">
              <th className="p-3 border-b">Date</th>
              <th className="p-3 border-b">Entry Time</th>
              <th className="p-3 border-b">Exit Time</th>
              <th className="p-3 border-b">Action</th>
            </tr>
          </thead>
          <tbody>
            {attendanceList.length > 0 ? (
              attendanceList.map((record) => {
                const today = new Date().toISOString().split("T")[0];
                const isToday = record.date === today;
                return (
                  <tr key={record.id} className="hover:bg-gray-50 transition">
                    <td className="p-3 border-b">{record.date}</td>
                    <td className="p-3 border-b">
                      {record.entry ? (
                        <span className="px-2 py-1 rounded bg-orange-100 text-orange-700">
                          {record.entry}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-3 border-b">
                      {record.exit ? (
                        <span className="px-2 py-1 rounded bg-purple-100 text-purple-700">
                          {record.exit}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-3 border-b">
                      <div className="flex gap-2 text-sm">
                        <button
                          className="px-2 py-1 rounded border border-gray-400 text-gray-700 hover:underline"
                          disabled={!isToday}
                          onClick={() => handleAttendanceEdit(record)}
                        >
                          Edit
                        </button>
                        <button
                          className="px-2 py-1 rounded border border-gray-400 text-gray-700 hover:underline"
                          disabled={!isToday}
                          onClick={() => handleAttendanceDelete(record)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="text-center p-6 text-gray-500 italic"
                >
                  No records yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    
      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-[1px] bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 relative shadow-lg">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={() => setIsModalOpen(false)}
            >
              <X />
            </button>
            <h3 className="text-lg font-semibold mb-4">
              Edit Attendance ({editRecord.date})
            </h3>

            {/* Conditionally render Entry Time */}
            {editRecord.entry !== "" && (
              <div className="relative" ref={modalEntryRef}>
                <label className="block text-sm text-gray-600 mt-2">
                  Entry Time
                </label>
                <input
                  type="text"
                  value={editEntry}
                  onChange={(e) => setEditEntry(e.target.value)}
                  onFocus={() => setShowModalEntryDropdown(true)}
                  className="w-full border px-2 py-1 rounded mt-1"
                />
                {showModalEntryDropdown && (
                  <ul className="absolute z-10 bg-white border border-gray-300 rounded shadow mt-1 w-full max-h-48 overflow-auto text-sm">
                    {presetTimes.map((time) => (
                      <li
                        key={time}
                        onClick={() => {
                          setEditEntry(time);
                          setShowModalEntryDropdown(false);
                        }}
                        className="px-3 py-1 hover:bg-orange-100 cursor-pointer"
                      >
                        {time}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Conditionally render Exit Time */}
            {editRecord.exit !== "" && (
              <div className="relative" ref={modalExitRef}>
                <label className="block text-sm text-gray-600 mt-2">
                  Exit Time
                </label>
                <input
                  type="text"
                  value={editExit}
                  onChange={(e) => setEditExit(e.target.value)}
                  onFocus={() => setShowModalExitDropdown(true)}
                  className="w-full border px-2 py-1 rounded mt-1"
                />
                {showModalExitDropdown && (
                  <ul className="absolute z-10 bg-white border border-gray-300 rounded shadow mt-1 w-full max-h-48 overflow-auto text-sm">
                    {presetTimes.map((time) => (
                      <li
                        key={time}
                        onClick={() => {
                          setEditExit(time);
                          setShowModalExitDropdown(false);
                        }}
                        className="px-3 py-1 hover:bg-purple-100 cursor-pointer"
                      >
                        {time}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {errorMessage && (
              <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
            )}

            <button
              onClick={handleModalSubmit}
              className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
