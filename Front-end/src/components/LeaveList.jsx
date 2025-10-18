// src/components/LeaveList.jsx

import React from "react";

export default function LeaveList({ leaves, handleCreateLeave, handleEditLeave, handleDeleteLeave }) {
  return (
    <div className="mt-6 bg-white rounded-xl shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Leaves</h3>
        {/* CREATE LEAVE BUTTON */}
        <button
          onClick={handleCreateLeave}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium text-sm"
        >
          Create Leave Request
        </button>
      </div>

      {leaves.length === 0 ? (
        <p className="text-gray-500 text-sm">No leaves for this month.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Leave Type</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-left">Start Date</th>
                <th className="px-4 py-2 text-left">End Date</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Reason</th>
                <th className="px-4 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leaves.map((l) => {
                const isApproved = l.status === "Approve";
                return (
                  <tr key={l.id}>
                    <td className="px-4 py-2">{l.leaveType}</td>
                    <td className="px-4 py-2">{l.category}</td>
                    <td className="px-4 py-2">{l.startDate}</td>
                    <td className="px-4 py-2">{l.endDate}</td>
                    <td className="px-4 py-2 font-medium">
                      {/* Status badge for better visibility */}
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                          l.status === "Approve"
                            ? "bg-green-100 text-green-800"
                            : l.status === "Reject"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">{l.reason}</td>
                    <td className="px-4 py-2 flex gap-2">
                      {/* Edit Button */}
                      <button
                        onClick={() => handleEditLeave(l)}
                        disabled={isApproved}
                        className={`px-2 py-1 text-white rounded transition text-xs ${
                          isApproved
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-500 hover:bg-blue-600"
                        }`}
                        title={
                          isApproved
                            ? "Approved leaves cannot be edited"
                            : "Edit Leave"
                        }
                      >
                        Edit
                      </button>
                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteLeave(l)}
                        disabled={isApproved}
                        className={`px-2 py-1 text-white rounded transition text-xs ${
                          isApproved
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-red-500 hover:bg-red-600"
                        }`}
                        title={
                          isApproved
                            ? "Approved leaves cannot be deleted"
                            : "Delete Leave"
                        }
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}