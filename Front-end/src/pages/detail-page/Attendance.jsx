import React, { useState, useEffect, useRef } from "react";
import { LogIn, LogOut, Menu } from "lucide-react";
import Sidebar from "../../components/SideBar";

const presetTimes = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00"
];

function isValidTime(value) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value.trim());
}

export default function AttendancePage() {
  const [attendanceList, setAttendanceList] = useState([]);
  const [entryTime, setEntryTime] = useState("");
  const [exitTime, setExitTime] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    <div className="flex min-h-screen bg-[#f5f5f5] overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-col md:w-64 fixed inset-y-0 left-0 z-30">
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform md:hidden transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar />
      </div>

      {/* Main Content */}
      <main
        className={`flex-1 min-w-0 p-4 sm:p-6 md:p-8 transition-all duration-300 md:ml-64 ${
          sidebarOpen ? "opacity-50 pointer-events-none" : "opacity-100"
        }`}
      >
        {/* Mobile Top Bar */}
        <div className="md:hidden mb-6 flex items-center">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md bg-gray-200 hover:bg-gray-300"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="ml-4 text-xl font-semibold">Attendance</h1>
        </div>

        {/* Form Card */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6 max-w-3xl mx-auto">
          <h2 className="text-lg font-semibold mb-4">Mark Attendance</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
            {/* Entry */}
            <div className="relative" ref={entryRef}>
              <label className="block text-sm mb-1">Entry Time</label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3">
                <LogIn className="text-gray-500 w-4 h-4 mr-2" />
                <input
                  type="text"
                  placeholder="HH:MM"
                  value={entryTime}
                  onChange={(e) => setEntryTime(e.target.value)}
                  onFocus={() => setShowEntryDropdown(true)}
                  className="w-full py-2 text-sm focus:outline-none"
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
                      className="px-3 py-1 hover:bg-red-100 cursor-pointer"
                    >
                      {time}
                    </li>
                  ))}
                </ul>
              )}
              <button
                onClick={markEntry}
                className="mt-2 w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Mark Entry
              </button>
            </div>

            {/* Exit */}
            <div className="relative" ref={exitRef}>
              <label className="block text-sm mb-1">Exit Time</label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3">
                <LogOut className="text-gray-500 w-4 h-4 mr-2" />
                <input
                  type="text"
                  placeholder="HH:MM"
                  value={exitTime}
                  onChange={(e) => setExitTime(e.target.value)}
                  onFocus={() => setShowExitDropdown(true)}
                  className="w-full py-2 text-sm focus:outline-none"
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
                      className="px-3 py-1 hover:bg-red-100 cursor-pointer"
                    >
                      {time}
                    </li>
                  ))}
                </ul>
              )}
              <button
                onClick={markExit}
                className="mt-2 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Mark Exit
              </button>
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-white shadow-md rounded-lg p-6 overflow-x-auto max-w-5xl mx-auto">
          <h2 className="text-lg font-semibold mb-4">Attendance Records</h2>
          <table className="w-full border-collapse text-sm min-w-[320px]">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3 border-b">Date</th>
                <th className="p-3 border-b">Entry Time</th>
                <th className="p-3 border-b">Exit Time</th>
              </tr>
            </thead>
            <tbody>
              {attendanceList.length > 0 ? (
                attendanceList.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="p-3 border-b">{record.date}</td>
                    <td className="p-3 border-b">{record.entry || "-"}</td>
                    <td className="p-3 border-b">{record.exit || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center p-4 text-gray-500">
                    No records yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
