import React, { useState, useEffect } from "react";
import axios from "../../instance/Axios";
import Swal from "sweetalert2";

const typeColors = {
  leads: "bg-blue-500",
  contacts: "bg-green-600",
  meetings: "bg-yellow-500",
  calls: "bg-purple-500",
  task: "bg-red-500",
  project: "bg-teal-500",
  workassign: "bg-pink-500",
  teams: "bg-orange-500",
};

function Trash() {
  const [data, setData] = useState([]);
  const [filterType, setFilterType] = useState("All");
  const [filterDate, setFilterDate] = useState("All");

  const uniqueTypes = [
    "All",
    "Leads",
    "Contacts",
    "Calls",
    "Meetings",
    "Task",
    "Projects",
    "Assignment",
    "Teams",
  ];

  // Fetch trash data
  const getTrash = async (type = "All", date = "All") => {
    try {
      Swal.fire({
        title: "Loading...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const response = await axios.post("/trash/get", { type, date });
      setData(response.data?.data || []);

      Swal.close();
    } catch (error) {
      Swal.close();
      Swal.fire("Error", "Failed to fetch trash data", "error");
      console.log("Error fetching trash:", error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      getTrash(filterType, filterDate);
    }, 500);
    return () => clearTimeout(timer);
  }, [filterType, filterDate]);

  // Restore item
  const handleRestore = async (id, data) => {
    Swal.fire({
      title: "Restoring...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });
    try {
      await axios.post("/trash/restore", { id, data });
      setData((prev) => prev.filter((item) => item.id !== id));
      Swal.fire("Success", "Item restored successfully!", "success");
    } catch (error) {
      Swal.fire("Error", "Failed to restore item", "error");
      console.log("Error restoring item:", error);
    }
  };

  // Permanent delete
  const handlePermanentDelete = async (id, data) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This item will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    Swal.fire({
      title: "Deleting...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      await axios.post("/trash/delete", { id, data });
      setData((prev) => prev.filter((item) => item.id !== id));
      Swal.fire("Deleted!", "Item has been deleted permanently.", "success");
    } catch (error) {
      Swal.fire("Error", "Failed to delete item", "error");
      console.log("Error deleting item:", error);
    }
  };

  const getItemName = (item) => {
    console.log(item)
    if (!item.details) return "-";
    switch (item.data.toLowerCase()) {
      case "projects":
        return item.details.project || "-";
      case "task":
        return item.details.name || "-";
      case "teams":
        return item.details.teamName || "-";
      case "Assignment":
        return item.details.title || "-";
      default:
        return item.details.name || item.details.title || "-";
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-6 text-gray-800">Trash</h1>

      {/* FILTERS */}
      <div className="flex items-center gap-6 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label htmlFor="type-filter" className="font-medium text-gray-700">
            Filter by Type:
          </label>
          <select
            id="type-filter"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-400"
          >
            {uniqueTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="date-filter" className="font-medium text-gray-700">
            Filter by Date:
          </label>
          <select
            id="date-filter"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
          >
            {[
              "All",
              "Today",
              "Yesterday",
              "This Week",
              "This Month",
              "Last Month",
              "This Year",
            ].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-lg shadow bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-blue-200 to-purple-200 text-gray-800 text-sm">
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-6 text-gray-500 italic"
                >
                  The trash can is empty for the selected filter.
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr
                  key={item.id}
                  className="border-t hover:bg-blue-50 transition"
                >
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${
                        typeColors[item.data.toLowerCase()] || "bg-gray-500"
                      }`}
                    >
                      {item.data.charAt(0).toUpperCase() + item.data.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">{getItemName(item)}</td>
                  <td className="px-4 py-3">{item.date}</td>
                  <td className="px-4 py-3">{item.time}</td>
                  <td className="px-4 py-3 space-x-2">
                    <button
                      onClick={() => handleRestore(item.id, item.data)}
                      className="px-3 py-1 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm shadow"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => handlePermanentDelete(item.id, item.data)}
                      className="px-3 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm shadow"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Trash;
