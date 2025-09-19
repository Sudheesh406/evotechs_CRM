import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import axios from "../../../instance/Axios";

/* Helpers to convert between YYYY-MM-DD (input) and DD/MM/YYYY (display/storage) */
const formatDateObjToDDMMYYYY = (date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatInputToDDMMYYYY = (inputValue) => {
  if (!inputValue) return "";
  const [y, m, d] = inputValue.split("-");
  if (!y || !m || !d) return "";
  return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
};

const ddmmyyyyToInput = (ddmmyyyy) => {
  if (!ddmmyyyy) return "";
  const parts = ddmmyyyy.split("/");
  if (parts.length !== 3) return "";
  const [d, m, y] = parts;
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
};

export default function AdminCalendarManager() {
  const now = new Date();
  const [displayedMonth, setDisplayedMonth] = useState(now.getMonth());
  const [displayedYear, setDisplayedYear] = useState(now.getFullYear());

  const [holidays, setHolidays] = useState([]);
  const [leaves, setLeaves] = useState([]); // ✅ state for leave requests

  // form state
  const [dateInput, setDateInput] = useState(""); // yyyy-mm-dd
  const [description, setDescription] = useState("");
  const [type, setType] = useState("holiday");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchHolidays(displayedYear, displayedMonth + 1);
    fetchLeaves(displayedYear, displayedMonth + 1); // month is 1-based
  }, [displayedMonth, displayedYear]);

  // Fetch holidays
  const fetchHolidays = async (year, month) => {
    try {
      const res = await axios.post("/calendar/get", { year, month });
      const holidaysArray = (res.data?.data || []).map((item) => ({
        id: item.id,
        date: formatInputToDDMMYYYY(item.holidayDate),
        description: item.description,
        type: item.holidayName || "holiday",
      }));
      setHolidays(holidaysArray.sort((a, b) => (a.date > b.date ? 1 : -1)));
    } catch (err) {
      console.error("Failed to load holidays", err);
    }
  };

  // Fetch leave requests
  const fetchLeaves = async (year, month) => {
    try {
      const response = await axios.post("/calendar/get/leave", { year, month });
      const leavesArray = (response.data || []).map((item) => ({
        id: item.id,
        employee: item?.staff?.name,
        leaveType: item.leaveType,
        startDate: formatInputToDDMMYYYY(item.leaveDate),
        endDate: formatInputToDDMMYYYY(item.endDate),
        reason: item.description,
        category: item.category,
        status: item.status || "Pending",
      }));
      setLeaves(leavesArray);
    } catch (error) {
      console.error("Failed to load leaves", error);
    }
  };

  const monthStartDayIndex = new Date(
    displayedYear,
    displayedMonth,
    1
  ).getDay();
  const daysInMonth = new Date(displayedYear, displayedMonth + 1, 0).getDate();
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum = i + 1;
    const dateObj = new Date(displayedYear, displayedMonth, dayNum);
    const formatted = formatDateObjToDDMMYYYY(dateObj);

    const holidayItem = holidays.find((h) => h.date === formatted);

    // Get approved leaves for this day
    const approvedLeaves = leaves.filter((l) => {
      if (l.status !== "Approve") return false;
      const start = ddmmyyyyToInput(l.startDate);
      const end = ddmmyyyyToInput(l.endDate);
      const current = ddmmyyyyToInput(formatted);
      return current >= start && current <= end;
    });

    return { day: dayNum, dateObj, formatted, holidayItem, approvedLeaves };
  });

  const handlePrevMonth = () => {
    if (displayedMonth === 0) {
      setDisplayedMonth(11);
      setDisplayedYear((y) => y - 1);
    } else setDisplayedMonth((m) => m - 1);
  };
  const handleNextMonth = () => {
    if (displayedMonth === 11) {
      setDisplayedMonth(0);
      setDisplayedYear((y) => y + 1);
    } else setDisplayedMonth((m) => m + 1);
  };

  const resetForm = () => {
    setDateInput("");
    setDescription("");
    setType("holiday");
    setEditingId(null);
  };

  /** Create or Update */
  const upsertHoliday = async () => {
    if (!dateInput || !description.trim()) {
      alert("Please select a date and provide a description.");
      return;
    }
    const formatted = formatInputToDDMMYYYY(dateInput);

    if (editingId) {
      try {
        const payload = { date: formatted, description, type };
        await axios.put(`/calendar/update/${editingId}`, payload);
        setHolidays((prev) =>
          prev.map((h) => (h.id === editingId ? { ...h, ...payload } : h))
        );
        resetForm();
      } catch (err) {
        console.error("Update failed", err);
      }
    } else {
      try {
        const payload = { date: formatted, description, type };
        const {data} = await axios.post("/calendar/create", payload);
        console.log(data)
        const createdHoliday = {
          id: data.id,
          date: formatInputToDDMMYYYY(data.holidayDate || dateInput),
          description: data.description || description,
          type: data.holidayName || type,
        };

        setHolidays((prev) =>
          [...prev, createdHoliday].sort((a, b) => (a.date > b.date ? 1 : -1))
        );
        resetForm();
      } catch (err) {
        console.error("Create failed", err);
      }
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setDateInput(ddmmyyyyToInput(item.date));
    setDescription(item.description);
    setType(item.type || "holiday");
  };

  const deleteHoliday = async (id) => {
    if (!window.confirm("Delete this holiday/maintenance entry?")) return;
    try {
      await axios.delete(`/calendar/delete/${id}`);
      setHolidays((prev) => prev.filter((h) => h.id !== id));
      if (editingId === id) resetForm();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const onDayClick = (day) => {
    if (day.holidayItem) {
      startEdit(day.holidayItem);
    } else {
      setEditingId(null);
      setDateInput(ddmmyyyyToInput(day.formatted));
      setDescription("");
      setType("holiday");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`/calendar/leave/status/${id}`, { status: newStatus });
      setLeaves((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
      );
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to update status");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-[600px]">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Calendar */}
        <div className="md:col-span-12 bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4 gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="px-3 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition"
              >
                Prev
              </button>
            </div>
            <h2 className="text-lg font-semibold text-gray-800">
              {new Date(displayedYear, displayedMonth).toLocaleString(
                "default",
                {
                  month: "long",
                  year: "numeric",
                }
              )}
            </h2>
            <button
              onClick={handleNextMonth}
              className="px-3 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition"
            >
              Next
            </button>
          </div>

          <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-500 uppercase mb-3">
            {weekDays.map((wd) => (
              <div key={wd}>{wd}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: monthStartDayIndex }).map((_, i) => (
              <div key={"empty-" + i} className="h-16" />
            ))}

            {daysArray.map((d) => {
              const isSunday = d.dateObj.getDay() === 0;
              const isMaintenance =
                d.holidayItem && d.holidayItem.type === "maintenance";
              const isHoliday = !!d.holidayItem;

              let cellClass = "bg-white border-gray-200 hover:bg-gray-50";
              if (isSunday || isHoliday)
                cellClass = "bg-red-500 border-red-300 text-white";
              if (isMaintenance)
                cellClass = "bg-purple-500 border-purple-300 text-white";

              if (
                d.approvedLeaves.length > 0 &&
                !isSunday &&
                !isHoliday &&
                !isMaintenance
              ) {
                const hasFullDay = d.approvedLeaves.some(
                  (l) => l.leaveType === "Full Day"
                );
                cellClass = hasFullDay
                  ? "bg-blue-800 border-blue-500 text-white"
                  : "bg-orange-500 border-orange-300 text-white";
              }

              return (
                <div
                  key={d.formatted}
                  onClick={() => onDayClick(d)}
                  className={`relative rounded-lg h-16 flex flex-col items-center justify-center text-sm cursor-pointer border shadow-sm transition ${cellClass}`}
                >
                  <div className="font-medium">{d.day}</div>
                  {d.holidayItem && (
                    <div className="text-[10px] px-1 text-center mt-1 w-full truncate">
                      {d.holidayItem.description}
                    </div>
                  )}
                  {d.approvedLeaves.map((l, idx) => (
                    <div
                      key={idx}
                      className="text-[10px] px-1 text-center mt-1 w-full truncate"
                    >
                      <div className="flex flex-col">
                        <span>{l.employee}</span>
                        <span>
                          ({l.category} - {l.leaveType})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Leave Requests Table */}
        <div className="md:col-span-8 bg-white rounded-xl shadow p-6 overflow-x-auto">
          <h3 className="text-lg font-semibold mb-4">Leave Requests List</h3>
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase">
                <th className="px-3 py-2">Employee</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Start</th>
                <th className="px-3 py-2">End</th>
                <th className="px-3 py-2">Reason</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leaves.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-gray-500">
                    No leave requests found.
                  </td>
                </tr>
              )}
              {leaves.map((leave) => (
                <tr key={leave.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">{leave.employee}</td>
                  <td className="px-3 py-2">{leave.leaveType}</td>
                  <td className="px-3 py-2">{leave.startDate}</td>
                  <td className="px-3 py-2">{leave.endDate}</td>
                  <td className="px-3 py-2">{leave.reason}</td>
                  <td className="px-3 py-2">{leave.category}</td>
                  <td className="px-3 py-2 flex flex-col gap-2">
                    <select
                      value={leave.status}
                      onChange={(e) =>
                        handleStatusChange(leave.id, e.target.value)
                      }
                      className="border border-gray-300 rounded-lg p-1 text-sm"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approve">Approve</option>
                      <option value="Reject">Reject</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Create / Edit panel */}
        <div className="md:col-span-4 bg-white rounded-xl shadow p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              {editingId ? "Edit Entry" : "Create Entry"}
            </h3>
            <button
              onClick={resetForm}
              className="p-1 rounded hover:bg-gray-100 text-gray-500"
              title="Clear"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <label className="block">
            <span className="text-sm text-gray-700">Date</span>
            <input
              type="date"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-200 focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">Type</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-200 focus:outline-none"
            >
              <option value="holiday">Holiday</option>
              <option value="publicHoliday">Public Holiday</option>
              <option value="companyHoliday">Company Holiday</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">Description</span>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Holiday or maintenance description"
              className="mt-1 w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-200 focus:outline-none"
            />
          </label>

          <div className="flex gap-2">
            <button
              onClick={upsertHoliday}
              className={`flex-1 py-2 rounded-lg font-medium transition ${
                editingId
                  ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                  : "bg-green-500 hover:bg-green-600 text-white"
              }`}
            >
              {editingId ? "Update" : "Save"}
            </button>

            <button
              onClick={resetForm}
              className="py-2 px-3 rounded-lg border border-gray-200"
            >
              Cancel
            </button>
          </div>

          {editingId && type && type !== "workingDay" && (
            <button
              onClick={() => deleteHoliday(editingId)}
              className="py-2 px-3 rounded-lg bg-red-500 text-white hover:bg-red-600"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
