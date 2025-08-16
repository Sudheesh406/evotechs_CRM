import React, { useState, useEffect, useRef } from "react";
import { LogIn, LogOut } from "lucide-react";

const presetTimes = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00"
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

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (entryRef.current && !entryRef.current.contains(event.target)) {
        setShowEntryDropdown(false);
      }
      if (exitRef.current && !exitRef.current.contains(event.target)) {
        setShowExitDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function markEntry() {
    if (!entryTime || !isValidTime(entryTime)) {
      alert("Please enter a valid entry time in HH:MM format");
      return;
    }
    const today = new Date().toLocaleDateString();
    setAttendanceList(prev => {
      const existing = prev.find(r => r.date === today);
      if (existing) {
        return prev.map(r =>
          r.date === today ? { ...r, entry: entryTime } : r
        );
      }
      return [{ id: Date.now(), date: today, entry: entryTime, exit: "" }, ...prev];
    });
    setEntryTime("");
    setShowEntryDropdown(false);
  }

  function markExit() {
    if (!exitTime || !isValidTime(exitTime)) {
      alert("Please enter a valid exit time in HH:MM format");
      return;
    }
    const today = new Date().toLocaleDateString();
    setAttendanceList(prev => {
      const existing = prev.find(r => r.date === today);
      if (existing) {
        return prev.map(r =>
          r.date === today ? { ...r, exit: exitTime } : r
        );
      }
      return [{ id: Date.now(), date: today, entry: "", exit: exitTime }, ...prev];
    });
    setExitTime("");
    setShowExitDropdown(false);
  }

  return (
    <div className=" min-h-[680px] bg-gray-50 p-6 space-y-8">
      {/* Attendance Form Card */}
      <div className="bg-white rounded-xl shadow-md p-6 max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Mark Attendance
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {/* Entry Time */}
          <div className="relative" ref={entryRef}>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Entry Time
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

          {/* Exit Time */}
          <div className="relative" ref={exitRef}>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Exit Time
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

      {/* Attendance Records Table */}
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
            </tr>
          </thead>
          <tbody>
            {attendanceList.length > 0 ? (
              attendanceList.map((record) => (
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
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center p-6 text-gray-500 italic">
                  No records yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
