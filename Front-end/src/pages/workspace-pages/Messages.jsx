import React, { useState } from "react";
import { Calendar, MessageSquare } from "lucide-react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

const Messages = () => {
  const [filter, setFilter] = useState("All");

  const messages = [
    {
      id: 1,
      admin: "Super Admin",
      subject: "System Maintenance",
      message: "We will be performing scheduled maintenance tonight at 11 PM.",
      date: "16/08/2025",
      time: "9:30 AM",
    },
    {
      id: 2,
      admin: "Super Admin",
      subject: "New Policy Update",
      message: "Please review the new attendance and leave policy shared.",
      date: "15/08/2025",
      time: "10:15 AM",
    },
    {
      id: 3,
      admin: "System Admin",
      subject: "Exam Reminder",
      message: "Exams for class 10 and 12 start from next Monday.",
      date: "14/08/2025",
      time: "2:45 PM",
    },
    {
      id: 4,
      admin: "Super Admin",
      subject: "Sports Day",
      message: "Sports day will be held this Friday in the school ground.",
      date: "12/08/2025",
      time: "11:00 AM",
    },
    {
      id: 5,
      admin: "Super Admin",
      subject: "Library Notice",
      message: "Please return pending books before 20th Aug.",
      date: "05/08/2025",
      time: "5:15 PM",
    },
  ];

  const today = dayjs();
  const yesterday = today.subtract(1, "day");
  const dayBeforeYesterday = today.subtract(2, "day");
  const startOfWeek = today.startOf("week"); // Sunday as start

  const getDateBadge = (dateStr) => {
    const date = dayjs(dateStr, "DD/MM/YYYY");

    if (date.isSame(today, "day"))
      return "bg-red-100 text-red-600 border border-red-300";

    if (date.isSame(yesterday, "day") || date.isSame(dayBeforeYesterday, "day"))
      return "bg-orange-100 text-orange-600 border border-orange-300";

    if (date.isAfter(startOfWeek.subtract(1, "day")) && date.isBefore(today.add(1, "day")))
      return "bg-blue-100 text-blue-600 border border-blue-300";

    return "bg-white text-black border border-green-300";
  };

  const filteredMessages = messages.filter((msg) => {
    const date = dayjs(msg.date, "DD/MM/YYYY");

    if (filter === "Today") return date.isSame(today, "day");

    if (filter === "Last 2 Days")
      return date.isSame(yesterday, "day") || date.isSame(dayBeforeYesterday, "day");

    if (filter === "This Week")
      return date.isSame(today, "week"); // ✅ Sunday → Today

    return true;
  });

  return (
    <div className="bg-gray-50 min-h-[680px] p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <MessageSquare className="text-blue-600" size={22} /> Admin Messages
        </h1>
        <span className="text-gray-600 text-sm">
          Total Messages: {filteredMessages.length}
        </span>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-4">
        {["All", "Today", "Last 2 Days", "This Week"].map((option) => (
          <button
            key={option}
            onClick={() => setFilter(option)}
            className={`px-4 py-2 rounded text-sm font-medium transition ${
              filter === option
                ? "bg-blue-600 text-white shadow"
                : "bg-white border text-gray-700 hover:bg-gray-100"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-indigo-50 text-gray-700 text-sm font-medium">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Subject</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Admin</th>
            </tr>
          </thead>
          <tbody>
            {filteredMessages.map((msg) => (
              <tr key={msg.id} className="border-t hover:bg-gray-50 transition">
                {/* Date with Badge */}
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getDateBadge(
                      msg.date
                    )}`}
                  >
                    <Calendar size={14} /> {msg.date}
                  </span>
                </td>

                {/* Subject */}
                <td className="px-4 py-3 font-medium text-gray-800">
                  {msg.subject}
                </td>

                {/* Message */}
                <td className="px-4 py-3 text-gray-600 text-sm">{msg.message}</td>

                {/* Time */}
                <td className="px-4 py-3 text-gray-500 text-sm">{msg.time}</td>

                {/* Admin */}
                <td className="px-4 py-3 text-gray-700 text-sm">{msg.admin}</td>
              </tr>
            ))}
            {filteredMessages.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="px-4 py-6 text-center text-gray-500 text-sm"
                >
                  No messages found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Messages;




