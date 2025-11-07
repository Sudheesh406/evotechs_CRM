import React, { useState, useEffect, useRef } from "react";
import { LogIn, LogOut, X, Edit, Trash2, Clock, Calendar } from "lucide-react";
import axios from "../../instance/Axios";
import Swal from "sweetalert2";

const presetTimes = [
  "08:00 AM",
  "08:30 AM",
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "01:00 PM",
  "01:30 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
  "05:30 PM",
  "06:00 PM",
  "06:30 PM",
  "07:00 PM",
  "07:30 PM",
  "08:00 PM",
  "08:30 PM",
  "09:00 PM",
  "09:30 PM",
  "10:00 PM",
  "10:30 PM",
];

function isValidTime(value) {
  return /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i.test(value.trim());
}

// Converts 12-hour time (e.g., "09:30 AM") to minutes since midnight
function timeToMinutes(timeStr) {
  const [time, modifier] = timeStr.trim().split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  if (modifier.toUpperCase() === "PM" && hours !== 12) hours += 12;
  if (modifier.toUpperCase() === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

// ====================================================================================
// TIME DROPDOWN COMPONENT (Monochromatic Styling)
// ====================================================================================
const TimeDropdown = ({
  isVisible,
  times,
  setTime,
  closeDropdown,
  iconColor, // Still used for subtle hover/text coloring
}) => {
  if (!isVisible) return null;

  const colorClass =
    iconColor === "indigo"
      ? { text: "text-blue-700", hoverBg: "hover:bg-blue-50" }
      : { text: "text-red-700", hoverBg: "hover:bg-red-50" };

  return (
    <ul className="absolute z-30 bg-white border border-gray-300 rounded-lg shadow-lg mt-2 w-full max-h-56 overflow-y-auto text-sm opacity-100 transform translate-y-0 transition-all duration-300 ease-in-out">
      {times.map((time) => (
        <li
          key={time}
          onClick={() => {
            setTime(time);
            closeDropdown(false);
          }}
          className={`px-4 py-2 ${colorClass.hoverBg} cursor-pointer text-gray-700 transition-colors duration-150`}
        >
          <span className={`font-medium ${colorClass.text}`}>{time}</span>
        </li>
      ))}
    </ul>
  );
};

// ====================================================================================
// MAIN ATTENDANCE COMPONENT (CRM Standard Styling)
// ====================================================================================
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

  // Improved useEffect for closing dropdowns
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
    // Show loading alert
    Swal.fire({
      title: "Fetching records...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

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

      // Sort by date descending
      const sortedList = Object.values(grouped).sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      setAttendanceList(sortedList);

      // Close loading alert
      Swal.close();
    } catch (error) {
      console.error("Error getting attendance:", error);

      // Show error alert
      Swal.fire({
        icon: "error",
        title: "Failed to load attendance",
        text: "Please check your connection and try again.",
      });
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleAttendance = async (data) => {
    // Show loading alert
    Swal.fire({
      title: "Saving attendance...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      await axios.post("/attendance/register", data);
      // Close loading
      Swal.close();

      // Show success message
      Swal.fire({
        icon: "success",
        title: "Attendance saved!",
        timer: 1500,
        showConfirmButton: false,
      });

      // Refresh attendance list
      fetchAttendance();
    } catch (error) {
      console.error("Error saving attendance:", error);

      // Close loading in case of error
      Swal.close();
      // Show error alert
      Swal.fire({
        icon: "error",
        title: "Failed to save attendance",
        text: error.response?.data?.message || "Please try again later.",
      });
    }
  };

  const markEntry = () => {
    if (!entryTime || !isValidTime(entryTime)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Entry Time",
        text: "Please enter a valid entry time (e.g., 09:00 AM).",
      });
      return;
    }
    const today = new Date().toISOString().split("T")[0];
    handleAttendance({ date: today, entryTime, shedule: "entry" });
    setEntryTime("");
    setShowEntryDropdown(false);
  };

  const markExit = () => {
    if (!exitTime || !isValidTime(exitTime)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Exit Time",
        text: "Please enter a valid exit time (e.g., 05:00 PM).",
      });
      return;
    }

    // Get today's entry if it exists
    const today = new Date().toISOString().split("T")[0];
    const todayRecord = attendanceList.find((r) => r.date === today);
    if (todayRecord?.entry) {
      const entryMins = timeToMinutes(todayRecord.entry);
      const exitMins = timeToMinutes(exitTime);
      if (exitMins <= entryMins) {
        Swal.fire({
          icon: "error",
          title: "Invalid Exit Time",
          text: "Exit time must be later than entry time.",
        });
        return;
      }
    }

    handleAttendance({ date: today, exitTime, shedule: "exit" });
    setExitTime("");
    setShowExitDropdown(false);
  };

  const handleAttendanceEdit = (record) => {
    setEditRecord(record);
    setEditEntry(record.entry);
    setEditExit(record.exit);
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const handleAttendanceDelete = async (record) => {
    // Show confirmation before deleting
    const result = await Swal.fire({
      title: "Confirm Deletion",
      text: `Are you sure you want to delete the attendance for ${record.date}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1d4ed8", // Tailwind blue-700
      cancelButtonColor: "#dc2626", // Tailwind red-600
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        // Show loading while deleting
        Swal.fire({
          title: "Deleting...",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        await axios.delete(`/attendance/delete/${record.id}`);

        Swal.close(); // Close the loading modal

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Attendance record has been deleted.",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          // Refresh attendance list
          fetchAttendance();
        });
      } catch (error) {
        Swal.close(); // Ensure loading is closed
        const errorText =
          error.response?.data?.message || "Please try again later.";
        const title =
          error.response?.status === 403
            ? "Permission Denied"
            : "Failed to Delete";
        Swal.fire({
          icon: "error",
          title: title,
          text: errorText,
        });
        console.error("Error deleting attendance:", error);
      }
    }
  };

  const handleModalSubmit = async () => {
    setErrorMessage("");
    const hasEntryChanged = editRecord.entry !== editEntry && editEntry !== "";
    const hasExitChanged = editRecord.exit !== editExit && editExit !== "";

    if (!hasEntryChanged && !hasExitChanged) {
      setErrorMessage("No changes were made.");
      return;
    }

    if (hasEntryChanged && !isValidTime(editEntry)) {
      setErrorMessage("Invalid new entry time format (e.g., 09:00 AM).");
      return;
    }
    if (hasExitChanged && !isValidTime(editExit)) {
      setErrorMessage("Invalid new exit time format (e.g., 05:00 PM).");
      return;
    }

    const entryMins = editEntry
      ? timeToMinutes(editEntry)
      : timeToMinutes(editRecord.entry);
    const exitMins = editExit
      ? timeToMinutes(editExit)
      : timeToMinutes(editRecord.exit);
    if (editExit && editEntry && exitMins <= entryMins) {
      setErrorMessage("Exit time must be later than entry time.");
      return;
    }

    // Show loading alert for update
    Swal.fire({
      title: "Updating attendance...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      if (hasEntryChanged) {
        await axios.put(`/attendance/edit/${editRecord.date}`, {
          date: editRecord.date,
          entryTime: editEntry,
          shedule: "entry",
        });
      }
      if (hasExitChanged) {
        await axios.put(`/attendance/edit/${editRecord.date}`, {
          date: editRecord.date,
          exitTime: editExit,
          shedule: "exit",
        });
      }

      Swal.close(); // Close loading
      Swal.fire({
        icon: "success",
        title: "Update Successful!",
        timer: 1500,
        showConfirmButton: false,
      });

      setIsModalOpen(false);
      fetchAttendance();
    } catch (error) {
      Swal.close(); // Close loading
      console.error("Error updating attendance:", error);
      setErrorMessage(
        error.response?.data?.message || "Failed to update attendance."
      );
    }
  };
  

  return (
    // Clean, light gray background
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 space-y-12">
      <h1 className="text-3xl font-bold text-gray-800 text-center mb-10 mt-4 tracking-wide border-b pb-4">
        Attendance <span className="text-blue-600">Management</span>
      </h1>

      <div className="max-w-5xl mx-auto space-y-12">
        {/* Attendance Form Card (Clean white card with subtle shadow) */}
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-700 mb-6 border-b pb-3">
            Daily Check In/Out
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Entry */}
            <div className="relative" ref={entryRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Entry Time
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg px-4 py-2 bg-white transition duration-300 focus-within:border-blue-500">
                <LogIn className="text-blue-600 w-5 h-5 mr-3" />
                <input
                  type="text"
                  placeholder="e.g., 09:00 AM"
                  value={entryTime}
                  onChange={(e) => setEntryTime(e.target.value)}
                  onFocus={() => setShowEntryDropdown(true)}
                  className="w-full text-base bg-transparent text-gray-800 focus:outline-none placeholder-gray-500"
                />
              </div>
              <TimeDropdown
                isVisible={showEntryDropdown}
                times={presetTimes}
                setTime={setEntryTime}
                closeDropdown={setShowEntryDropdown}
                iconColor="indigo" // Uses blue for consistency
              />
              <button
                onClick={markEntry}
                className="mt-4 w-full bg-blue-600 text-white font-semibold px-4 py-2.5 rounded-lg shadow-md hover:bg-blue-700 transition duration-300 flex items-center justify-center space-x-2"
              >
                <span>Mark Check In</span>
                <LogIn className="w-4 h-4" />
              </button>
            </div>

            {/* Exit */}
            <div className="relative" ref={exitRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exit Time
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg px-4 py-2 bg-white transition duration-300 focus-within:border-red-500">
                <LogOut className="text-red-600 w-5 h-5 mr-3" />
                <input
                  type="text"
                  placeholder="e.g., 05:30 PM"
                  value={exitTime}
                  onChange={(e) => setExitTime(e.target.value)}
                  onFocus={() => setShowExitDropdown(true)}
                  className="w-full text-base bg-transparent text-gray-800 focus:outline-none placeholder-gray-500"
                />
              </div>
              <TimeDropdown
                isVisible={showExitDropdown}
                times={presetTimes}
                setTime={setExitTime}
                closeDropdown={setShowExitDropdown}
                iconColor="red" // Uses red for exit/stop
              />
              <button
                onClick={markExit}
                className="mt-4 w-full bg-red-600 text-white font-semibold px-4 py-2.5 rounded-lg shadow-md hover:bg-red-700 transition duration-300 flex items-center justify-center space-x-2"
              >
                <span>Mark Check Out</span>
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Attendance Records Table */}
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-200 overflow-x-auto">
          <h2 className="text-xl font-semibold text-gray-700 mb-6 border-b pb-3">
            Recent Records
          </h2>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    <Calendar className="inline w-4 h-4 mr-2" /> Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    <LogIn className="inline w-4 h-4 mr-2 text-blue-500" />{" "}
                    Entry Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    <LogOut className="inline w-4 h-4 mr-2 text-red-500" /> Exit
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {attendanceList.length > 0 ? (
                  attendanceList.map((record, index) => {
                    const today = new Date().toISOString().split("T")[0];
                    const isToday = record.date === today;
                    const rowBgClass = isToday
                      ? "bg-blue-50/50"
                      : index % 2 === 1
                      ? "bg-gray-50 hover:bg-gray-100"
                      : "bg-white hover:bg-gray-100";

                    return (
                      <tr
                        key={record.id}
                        className={`transition-colors duration-150 ${rowBgClass}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {new Date(record.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                          {isToday && (
                            <span className="ml-2 px-2 py-0.5 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
                              TODAY
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {record.entry ? (
                            <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded min-w-[100px] justify-center">
                              {record.entry}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">--</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {record.exit ? (
                            <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded min-w-[100px] justify-center">
                              {record.exit}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">--</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            {/* Edit Button */}
                            <button
                              className={`p-2 rounded-md transition-colors duration-150 ${
                                isToday
                                  ? "bg-gray-200 text-gray-600 hover:bg-gray-300"
                                  : "bg-gray-100 text-gray-400 cursor-not-allowed opacity-70"
                              }`}
                              disabled={!isToday}
                              onClick={() => handleAttendanceEdit(record)}
                              title={isToday ? "Edit Record" : "Cannot Edit"}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {/* Delete Button */}
                            <button
                              className={`p-2 rounded-md transition-colors duration-150 ${
                                isToday
                                  ? "bg-red-50 text-red-600 hover:bg-red-100"
                                  : "bg-gray-100 text-gray-400 cursor-not-allowed opacity-70"
                              }`}
                              disabled={!isToday}
                              onClick={() => handleAttendanceDelete(record)}
                              title={
                                isToday ? "Delete Record" : "Cannot Delete"
                              }
                            >
                              <Trash2 className="w-4 h-4" />
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
                      className="text-center p-10 text-sm text-gray-500 italic bg-gray-50"
                    >
                      <p className="font-medium">
                        No attendance records found.
                      </p>
                      <p className="text-xs mt-1">
                        Mark your entry above to start tracking.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal (Clean, high-contrast modal) */}
      {isModalOpen && editRecord && (
        <div className="fixed inset-0  bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-[1px]">
          <div className="bg-white rounded-xl p-8 w-full max-w-lg relative shadow-2xl border border-gray-100">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition duration-150 p-2 rounded-full hover:bg-gray-50"
              onClick={() => setIsModalOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-gray-800 mb-2 border-b pb-2">
              Edit Attendance
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Date:{" "}
              <span className="font-semibold text-gray-700">
                {editRecord.date}
              </span>
            </p>

            <div className="space-y-5">
              {/* Entry */}
              {editRecord.entry !== "" && (
                <div className="relative" ref={modalEntryRef}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Entry Time
                  </label>
                  <div className="flex items-center border border-gray-300 focus-within:border-blue-500 rounded-lg px-4 py-2 bg-white transition duration-150">
                    <LogIn className="text-blue-500 w-5 h-5 mr-3" />
                    <input
                      type="text"
                      value={editEntry}
                      onChange={(e) => setEditEntry(e.target.value)}
                      onFocus={() => setShowModalEntryDropdown(true)}
                      className="w-full text-base text-gray-800 bg-transparent focus:outline-none"
                    />
                  </div>
                  <TimeDropdown
                    isVisible={showModalEntryDropdown}
                    times={presetTimes}
                    setTime={setEditEntry}
                    closeDropdown={setShowModalEntryDropdown}
                    iconColor="indigo"
                  />
                </div>
              )}

              {/* Exit */}
              {editRecord.exit !== "" && (
                <div className="relative" ref={modalExitRef}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exit Time
                  </label>
                  <div className="flex items-center border border-gray-300 focus-within:border-red-500 rounded-lg px-4 py-2 bg-white transition duration-150">
                    <LogOut className="text-red-500 w-5 h-5 mr-3" />
                    <input
                      type="text"
                      value={editExit}
                      onChange={(e) => setEditExit(e.target.value)}
                      onFocus={() => setShowModalExitDropdown(true)}
                      className="w-full text-base text-gray-800 bg-transparent focus:outline-none"
                    />
                  </div>
                  <TimeDropdown
                    isVisible={showModalExitDropdown}
                    times={presetTimes}
                    setTime={setEditExit}
                    closeDropdown={setShowModalExitDropdown}
                    iconColor="red"
                  />
                </div>
              )}
            </div>

            {errorMessage && (
              <p className="text-red-600 text-sm mt-6 p-3 bg-red-50 rounded-lg border border-red-300 font-medium">
                {errorMessage}
              </p>
            )}

            <button
              onClick={handleModalSubmit}
              className="mt-8 w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition duration-300 shadow-md flex items-center justify-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
