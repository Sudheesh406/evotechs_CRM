import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "../../components/SideBar";

const holidayData = [
  { date: "01/01/2025", description: "New Year Celebration" },
  { date: "15/01/2025", description: "Pongal Festival" },
  { date: "14/02/2025", description: "Valentine's Day" },
  { date: "08/03/2025", description: "Women's Day" },
  { date: "14/04/2025", description: "Ambedkar Jayanti" },
  { date: "01/05/2025", description: "Labour Day" },
  { date: "05/06/2025", description: "World Environment Day" },
  { date: "16/07/2025", description: "Company Day" },
  { date: "16/08/2025", description: "Maintenance of company" },
  { date: "28/08/2025", description: "Power cut" },
];

const getHolidayDescription = (date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const formatted = `${day}/${month}/${year}`;
  const holiday = holidayData.find((h) => h.date === formatted);
  return holiday ? holiday.description : null;
};

export default function HolidayCalendar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [displayedMonth, setDisplayedMonth] = useState(new Date().getMonth());
  const [displayedYear] = useState(2025);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveDate, setLeaveDate] = useState("");
  const [leaveReason, setLeaveReason] = useState("");

  const currentMonth = new Date().getMonth();
  const daysInMonth = new Date(displayedYear, displayedMonth + 1, 0).getDate();
  const firstDayIndex = new Date(displayedYear, displayedMonth, 1).getDay();
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const daysArray = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const dateObj = new Date(displayedYear, displayedMonth, day);
    const isSunday = dateObj.getDay() === 0;
    const description = getHolidayDescription(dateObj);
    const isMaintenance =
      description && description.toLowerCase().includes("maintenance");
    const isHoliday = isSunday || description !== null;
    daysArray.push({ day, isHoliday, isSunday, isMaintenance, description });
  }

  const handlePrevMonth = () => {
    if (displayedMonth > 0) setDisplayedMonth(displayedMonth - 1);
  };

  const handleNextMonth = () => {
    if (displayedMonth < currentMonth) setDisplayedMonth(displayedMonth + 1);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-col md:w-64 fixed inset-y-0 left-0 z-30">
        <Sidebar />
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform md:hidden transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar />
      </div>

      <main className="flex-1 p-4 sm:p-6 md:p-8 md:ml-64">
        {/* Mobile top bar */}
        <div className="md:hidden mb-6 flex items-center">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md bg-gray-200 hover:bg-gray-300"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="ml-4 text-xl font-semibold">Holiday Calendar</h1>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
          {/* Header with Leave Button */}
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={handlePrevMonth}
              disabled={displayedMonth === 0}
              className={`px-3 py-1 rounded ${
                displayedMonth === 0
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              Previous
            </button>

            <h2 className="text-xl font-bold text-gray-800">
              {new Date(displayedYear, displayedMonth).toLocaleString(
                "default",
                {
                  month: "long",
                  year: "numeric",
                }
              )}
            </h2>

            <div className="flex gap-2">
              {/* Show Request Leave button only if on current month */}
              {displayedMonth === currentMonth && (
                <button
                  onClick={() => setShowLeaveModal(true)}
                  className="px-3 py-1 rounded bg-green-500 text-white hover:bg-green-600"
                >
                  Request Leave
                </button>
              )}
              <button
                onClick={handleNextMonth}
                disabled={displayedMonth === currentMonth}
                className={`px-3 py-1 rounded ${
                  displayedMonth === currentMonth
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                Next
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 text-center text-sm font-semibold text-gray-500 uppercase mb-2">
            {weekDays.map((wd) => (
              <div key={wd}>{wd}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2 auto-rows-fr">
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={"empty-" + i} />
            ))}
            {daysArray.map(
              (
                { day, isHoliday, isSunday, isMaintenance, description },
                idx
              ) => (
                <div
                  key={idx}
                  onClick={() =>
                    setActiveTooltip(activeTooltip === idx ? null : idx)
                  }
                  className={`relative cursor-pointer rounded-lg flex items-center justify-center h-16 transition group ${
                    isMaintenance
                      ? "bg-blue-500 text-white shadow-md"
                      : isHoliday
                      ? "bg-red-500 text-white shadow-md"
                      : "bg-gray-50 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  <span className="font-medium">{day}</span>
                  {isSunday && (
                    <span className="absolute top-1 left-1 bg-red-600 text-xs text-white px-1 rounded">
                      Sun
                    </span>
                  )}
                  {isHoliday && description && (
                    <div
                      className={`absolute bottom-full mb-2 hidden group-hover:block bg-black text-white text-xs rounded-lg px-2 py-1 shadow-lg whitespace-nowrap z-10
                      ${activeTooltip === idx ? "block" : ""}`}
                    >
                      {description}
                    </div>
                  )}
                </div>
              )
            )}
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4 text-gray-600 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-lg bg-red-500 shadow"></div>
              <span>Holiday (Sunday & other holidays)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-lg bg-blue-500 shadow"></div>
              <span>Leave</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-lg bg-gray-50 border border-gray-300"></div>
              <span>Working Day</span>
            </div>
          </div>
        </div>
      </main>

      {/* Leave Request Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Request Leave</h3>
              <button onClick={() => setShowLeaveModal(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700">Date</span>
              <input
                type="date"
                value={leaveDate}
                onChange={(e) => setLeaveDate(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded p-2"
              />
            </label>

            <label className="block mb-4">
              <span className="text-sm font-medium text-gray-700">Reason</span>
              <textarea
                rows="3"
                value={leaveReason}
                onChange={(e) => setLeaveReason(e.target.value)}
                placeholder="Enter your reason"
                className="mt-1 w-full border border-gray-300 rounded p-2"
              />
            </label>

            <button
              className="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600"
              onClick={() => {
                setShowLeaveModal(false);
                setLeaveDate("");
                setLeaveReason("");
              }}
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
