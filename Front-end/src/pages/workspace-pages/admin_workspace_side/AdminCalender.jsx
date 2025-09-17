// AdminCalendarManager.jsx
import React, { useState, useEffect } from "react";
import { X, Trash2, Edit2 } from "lucide-react";
import axios from "../../../instance/Axios";

/**
 * Seed data (replace by API fetch in real app)
 */
const seedHolidays = [
  { id: 1, date: "01/01/2025", description: "New Year Celebration", type: "holiday" },
  { id: 2, date: "15/01/2025", description: "Pongal Festival", type: "holiday" },
  { id: 3, date: "16/08/2025", description: "Maintenance of company", type: "maintenance" },
  { id: 4, date: "28/08/2025", description: "Power cut", type: "maintenance" },
];

/* Helpers to convert between YYYY-MM-DD (input) and DD/MM/YYYY (display/storage) */
const formatDateObjToDDMMYYYY = (date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};
const formatInputToDDMMYYYY = (inputValue) => {
  // expects "yyyy-mm-dd"
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
  const [holidays, setHolidays] = useState([]);
  const [displayedMonth, setDisplayedMonth] = useState(now.getMonth());
  const [displayedYear, setDisplayedYear] = useState(now.getFullYear());

  // form state (right panel)
  const [dateInput, setDateInput] = useState(""); // yyyy-mm-dd
  const [description, setDescription] = useState("");
  const [type, setType] = useState("holiday"); // 'holiday' | 'maintenance'
  const [editingId, setEditingId] = useState(null);

  // load initial data (replace with API GET)
  useEffect(() => {
    // TODO: replace this with fetch('/api/admin/holidays')...
    // and set from response.
    setHolidays(seedHolidays.slice().sort((a, b) => (a.date > b.date ? 1 : -1)));
  }, []);

  // calendar helpers
  const monthStartDayIndex = new Date(displayedYear, displayedMonth, 1).getDay();
  const daysInMonth = new Date(displayedYear, displayedMonth + 1, 0).getDate();
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // build days with holiday lookup
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum = i + 1;
    const dateObj = new Date(displayedYear, displayedMonth, dayNum);
    const formatted = formatDateObjToDDMMYYYY(dateObj);
    const holidayItem = holidays.find((h) => h.date === formatted);
    return {
      day: dayNum,
      dateObj,
      formatted,
      holidayItem,
    };
  });

  // month navigation (supports year roll)
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

  // CRUD actions (client-side). Replace TODOs with API calls.
  const resetForm = () => {
    setDateInput("");
    setDescription("");
    setType("holiday");
    setEditingId(null);
  };

  const upsertHoliday = () => {
    if (!dateInput || !description.trim()) {
      alert("Please select a date and provide a description.");
      return;
    }
    const formatted = formatInputToDDMMYYYY(dateInput);

    if (editingId) {
      // Update existing
      setHolidays((prev) =>
        prev
          .map((h) => (h.id === editingId ? { ...h, date: formatted, description, type } : h))
          .sort((a, b) => (a.date > b.date ? 1 : -1))
      );
      // TODO: PUT /api/admin/holidays/:id
    } else {
      // Add new
      const newItem = {
        id: Date.now() + Math.floor(Math.random() * 9999),
        date: formatted,
        description,
        type,
      };
      createHoliday(newItem)
      setHolidays((prev) => [...prev, newItem].sort((a, b) => (a.date > b.date ? 1 : -1)));
      // TODO: POST /api/admin/holidays
    }
    resetForm();
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setDateInput(ddmmyyyyToInput(item.date));
    setDescription(item.description);
    setType(item.type || "holiday");
  };

  const deleteHoliday = (id) => {
    if (!confirm("Delete this holiday/maintenance entry?")) return;
    setHolidays((prev) => prev.filter((h) => h.id !== id));
    // TODO: DELETE /api/admin/holidays/:id
    if (editingId === id) resetForm();
  };

  // When clicking a day in the calendar, prefill the right form for quick add/edit
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




    const createHoliday = async (data)=>{
      try {
        const response = await axios.post('/calender/create',{data})
        console.log('response',response)
      } catch (error) {
        console.log('error found in createHoliday',error)
      }
    }





  return (
    <div className="p-6 bg-gray-50 min-h-[600px]">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LEFT: Calendar (2 / 3 columns) */}
        <div className="md:col-span-2 bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4 gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="px-3 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition"
              >
                Prev
              </button>
              <button
                onClick={handleNextMonth}
                className="px-3 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition"
              >
                Next
              </button>
            </div>

            <h2 className="text-lg font-semibold text-gray-800">
              {new Date(displayedYear, displayedMonth).toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </h2>

            <div className="text-sm text-gray-600">Admin view — left: calendar</div>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-500 uppercase mb-3">
            {weekDays.map((wd) => (
              <div key={wd}>{wd}</div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* empty slots before month start */}
            {Array.from({ length: monthStartDayIndex }).map((_, i) => (
              <div key={"empty-" + i} className="h-16" />
            ))}

            {daysArray.map((d) => {
              const isMaintenance = d.holidayItem && d.holidayItem.type === "maintenance";
              const isHoliday = !!d.holidayItem;
              return (
                <div
                  key={d.formatted}
                  onClick={() => onDayClick(d)}
                  className={`relative rounded-lg h-16 flex flex-col items-center justify-center text-sm cursor-pointer border shadow-sm transition
                    ${
                      isMaintenance
                        ? "bg-purple-50 border-purple-300 text-purple-700"
                        : isHoliday
                        ? "bg-red-50 border-red-300 text-red-700"
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    }
                  `}
                >
                  <div className="font-medium">{d.day}</div>
                  {d.holidayItem && (
                    <div className="text-[10px] px-1 text-center mt-1 w-full truncate">
                      {d.holidayItem.description}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap gap-4 items-center text-gray-600 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-50 border border-red-300" />
              <span>Holiday</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-purple-50 border border-purple-300" />
              <span>Maintenance</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-white border border-gray-200" />
              <span>Working day</span>
            </div>
            <div className="ml-auto text-xs text-gray-500">Tip: click a day to edit or prefill the form</div>
          </div>
        </div>

        {/* RIGHT: Create / Edit panel (1 / 3 columns) */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              {editingId ? "Edit Entry" : "Create Entry"}
            </h3>
            <button
              onClick={() => {
                resetForm();
              }}
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
              <option value="maintaince">Maintaince</option>
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
                editingId ? "bg-yellow-500 hover:bg-yellow-600 text-white" : "bg-green-500 hover:bg-green-600 text-white"
              }`}
            >
              {editingId ? "Update" : "Save"}
            </button>
            <button
              onClick={() => {
                resetForm();
              }}
              className="py-2 px-3 rounded-lg border border-gray-200"
            >
              Cancel
            </button>
          </div>

          <hr />

          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">All entries</h4>
            <div className="max-h-56 overflow-auto divide-y">
              {holidays.length === 0 && (
                <div className="text-sm text-gray-500 py-3">No entries yet.</div>
              )}
              {holidays.map((h) => (
                <div key={h.id} className="flex items-center justify-between py-2 gap-2">
                  <div>
                    <div className="text-sm font-medium">{h.date}</div>
                    <div className="text-xs text-gray-500 truncate w-48">{h.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(h)}
                      className="p-1 rounded hover:bg-gray-100 text-gray-600"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteHoliday(h.id)}
                      className="p-1 rounded hover:bg-gray-100 text-red-500"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-gray-500 mt-auto">
            Changes are local in this demo. Hook the add/update/delete handlers to your backend API to persist.
          </div>
        </div>
      </div>
    </div>
  );
}
