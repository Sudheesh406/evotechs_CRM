import React from "react";
import { LogIn, LogOut, Edit, Trash2, Calendar, Download, ClipboardList } from "lucide-react";

const AttendanceTable = ({
  attendanceList,
  handleDownload,
  handleAttendanceEdit,
  handleAttendanceDelete,
  handleRequestClick, // New prop
}) => {
  const today = new Date().toISOString().split("T")[0];
  

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-200 overflow-x-auto">
      <div className="flex justify-between items-center mb-6 border-b pb-3">
        <h2 className="text-xl font-semibold text-gray-700">Recent Records</h2>
        <div className="flex gap-2">
          <button
            onClick={handleRequestClick} // Trigger modal
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow flex items-center gap-2 transition-all text-sm font-medium"
          >
            <ClipboardList className="w-4 h-4" />
            Attendance Request
          </button>
          <button
            onClick={handleDownload}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow flex items-center gap-2 transition-all text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Download Report
          </button>
        </div>
      </div>
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                <Calendar className="inline w-4 h-4 mr-2" /> Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                <LogIn className="inline w-4 h-4 mr-2 text-blue-500" /> Entry Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                <LogOut className="inline w-4 h-4 mr-2 text-red-500" /> Exit Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {attendanceList.length > 0 ? (
              attendanceList.map((record, index) => {
                const isToday = record.date === today;
                const rowBgClass = isToday
                  ? "bg-blue-50/50"
                  : index % 2 === 1
                  ? "bg-gray-50 hover:bg-gray-100"
                  : "bg-white hover:bg-gray-100";

                return (
                  <tr key={record.id} className={`transition-colors duration-150 ${rowBgClass}`}>
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
                        <button
                          className={`p-2 rounded-md transition-colors duration-150 ${
                            isToday ? "bg-gray-200 text-gray-600 hover:bg-gray-300" : "bg-gray-100 text-gray-400 cursor-not-allowed opacity-70"
                          }`}
                          disabled={!isToday}
                          onClick={() => handleAttendanceEdit(record)}
                          title={isToday ? "Edit Record" : "Cannot Edit"}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className={`p-2 rounded-md transition-colors duration-150 ${
                            isToday ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-gray-100 text-gray-400 cursor-not-allowed opacity-70"
                          }`}
                          disabled={!isToday}
                          onClick={() => handleAttendanceDelete(record)}
                          title={isToday ? "Delete Record" : "Cannot Delete"}
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
                <td colSpan="4" className="text-center p-10 text-sm text-gray-500 italic bg-gray-50">
                  <p className="font-medium">No attendance records found.</p>
                  <p className="text-xs mt-1">Mark your entry above to start tracking.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceTable;