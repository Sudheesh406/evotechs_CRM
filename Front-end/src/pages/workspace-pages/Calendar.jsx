import React, { useState } from "react";
import { X } from "lucide-react";

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
    <div className="max-h-[600px] bg-gray-50 py-6 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
          <button
            onClick={handlePrevMonth}
            disabled={displayedMonth === 0}
            className={`px-4 py-2 rounded-lg font-medium text-sm ${
              displayedMonth === 0
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-orange-500 text-white hover:bg-orange-600"
            } transition`}
          >
            Previous
          </button>

          <h2 className="text-2xl font-semibold text-gray-800">
            {new Date(displayedYear, displayedMonth).toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </h2>

          <div className="flex gap-2">
            {displayedMonth === currentMonth && (
              <button
                onClick={() => setShowLeaveModal(true)}
                className="px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 font-medium text-sm transition"
              >
                Request Leave
              </button>
            )}
            <button
              onClick={handleNextMonth}
              disabled={displayedMonth === currentMonth}
              className={`px-4 py-2 rounded-lg font-medium text-sm ${
                displayedMonth === currentMonth
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-orange-500 text-white hover:bg-orange-600"
              } transition`}
            >
              Next
            </button>
          </div>
        </div>

        {/* Weekday Labels */}
        <div className="grid grid-cols-7 text-center text-sm font-semibold text-gray-500 uppercase mb-3">
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
            ({ day, isHoliday, isSunday, isMaintenance, description }, idx) => (
              <div
                key={idx}
                onClick={() =>
                  setActiveTooltip(activeTooltip === idx ? null : idx)
                }
                className={`relative cursor-pointer rounded-lg flex items-center justify-center h-12 transition group border ${
                  isMaintenance
                    ? "bg-purple-100 border-purple-400 text-purple-700"
                    : isHoliday
                    ? "bg-red-100 border-red-400 text-red-700"
                    : "bg-white border-gray-200 text-gray-800 hover:bg-gray-50"
                } shadow-sm`}
              >
                <span className="font-medium">{day}</span>
                {isSunday && (
                  <span className="absolute top-1 left-1 bg-red-500 text-xs text-white px-1 rounded">
                    Sun
                  </span>
                )}
                {isHoliday && description && (
                  <div
                    className={`absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded-lg px-2 py-1 shadow-lg whitespace-nowrap z-10
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
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-6 text-gray-600 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-red-100 border border-red-400"></div>
            <span>Holiday</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-purple-100 border border-purple-400"></div>
            <span>Maintenance / Leave</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-white border border-gray-200"></div>
            <span>Working Day</span>
          </div>
        </div>
      </div>

      {/* Leave Request Modal */}
      {showLeaveModal && (
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/20 backdrop-blur-[2px]">
    <div className="bg-white rounded-xl shadow-lg w-96 p-6">
      {/* Modal Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Request Leave</h3>
        <button
          onClick={() => setShowLeaveModal(false)}
          className="text-gray-500 hover:text-gray-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Date Input */}
      <label className="block mb-3">
        <span className="text-sm font-medium text-gray-700">Date</span>
        <input
          type="date"
          value={leaveDate}
          onChange={(e) => setLeaveDate(e.target.value)}
          className="mt-1 w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-200 focus:outline-none"
        />
      </label>

      {/* Reason Input */}
      <label className="block mb-4">
        <span className="text-sm font-medium text-gray-700">Reason</span>
        <textarea
          rows="3"
          value={leaveReason}
          onChange={(e) => setLeaveReason(e.target.value)}
          placeholder="Enter your reason"
          className="mt-1 w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-200 focus:outline-none"
        />
      </label>

      {/* Submit Button */}
      <button
        className="w-full py-2 bg-blue-100 text-gray-800 rounded-lg hover:bg-blue-200 font-medium transition"
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
