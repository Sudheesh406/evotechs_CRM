import React, { useEffect, useState } from "react";
import axios from "../../instance/Axios";
import Swal from "sweetalert2";

function RemovedSubTask() {
  const [removedTasks, setRemovedTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const getRemovedSubTask = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/sub-task/removed");
      const data = response?.data?.enrichedData || [];
      setRemovedTasks(data);
    } catch (error) {
      console.log("Error fetching removed sub tasks:", error);
      Swal.fire("Error", "Failed to load removed sub-tasks", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRemovedSubTask();
  }, []);

  // Group by customer + requirement
  const groupedData = removedTasks.reduce((acc, item) => {
    const customer = item.customerName || "Unknown Customer";
    const req = item.requirement || "No Requirement";
    const groupKey = `${customer} — ${req}`;
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(item);
    return acc;
  }, {});

  // ✅ Restore handler with confirmation + alerts
  const handleRestore = async (id) => {
    const confirm = await Swal.fire({
      title: "Restore this sub-task?",
      text: "This sub-task will be moved back to the active list.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Restore",
    });

    if (confirm.isConfirmed) {
      Swal.fire({
        title: "Restoring...",
        text: "Please wait a moment",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      try {
        await axios.patch(`/sub-task/restore/${id}`);
        Swal.close();
        Swal.fire("Restored!", "Sub-task has been restored.", "success");
        getRemovedSubTask();
      } catch (error) {
        Swal.close();
        Swal.fire("Error", "Failed to restore sub-task.", "error");
      }
    }
  };

  // ✅ Permanent delete handler with confirmation + alerts
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete permanently?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, Delete",
    });

    if (confirm.isConfirmed) {
      Swal.fire({
        title: "Deleting...",
        text: "Please wait a moment",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      try {
        await axios.patch(`/sub-task/permenante/delete/${id}`);
        Swal.close();
        Swal.fire("Deleted!", "Sub-task permanently removed.", "success");
        getRemovedSubTask();
      } catch (error) {
        Swal.close();
        Swal.fire("Error", "Failed to delete sub-task.", "error");
      }
    }
  };

  return (
    <div className="h-[100%] flex flex-col bg-white font-sans">
      {/* Header */}
      <header className="flex-shrink-0 mb-4 mt-4 p-6 border-b border-gray-200 bg-white z-10">
        <h1 className="text-2xl font-semibold text-gray-800 flex items-center">
          Removed Sub-Tasks
        </h1>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        {loading ? (
          <div className="text-center py-10 text-gray-500">
            Loading removed tasks...
          </div>
        ) : Object.keys(groupedData).length > 0 ? (
          Object.entries(groupedData).map(([taskName, items]) => (
            <div
              key={taskName}
              className="mb-8 border border-gray-200 rounded-lg overflow-hidden shadow-sm"
            >
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-700 flex items-center flex-wrap">
                  <span className="inline-block w-2.5 h-2.5 bg-blue-500 rounded-full mr-2"></span>
                  <span className="font-semibold text-gray-800">Customer:</span>
                  <span className="ml-1 mr-4">
                    {items[0]?.customerName || "Unknown"}
                  </span>
                  <span className="font-semibold text-gray-800">
                    Requirement:
                  </span>
                  <span className="ml-1">
                    {items[0]?.requirement || "No Requirement"}
                  </span>
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-blue-600">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white">
                        Title
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white">
                        Details / Steps
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-white">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {items.map((item, index) => (
                      <tr
                        key={index}
                        className="hover:bg-blue-50 transition duration-150 ease-in-out"
                      >
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">
                          {item.title}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <div className="flex flex-wrap gap-2">
                            {item.notChecked?.length > 0 ? (
                              item.notChecked.map((step, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {step}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-400 text-xs italic">
                                No details
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            onClick={() => handleRestore(item.id)}
                            className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200 transition"
                          >
                            Restore
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200 transition"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center p-8 bg-gray-50 rounded-lg text-gray-500 border border-gray-200 shadow-sm">
            <p className="font-medium text-lg">
              No removed sub-tasks to display.
            </p>
            {/* <p className="text-sm mt-1">
              Once tasks are removed, they will appear here grouped by their
              original project task.
            </p> */}
          </div>
        )}
      </div>
    </div>
  );
}

export default RemovedSubTask;
