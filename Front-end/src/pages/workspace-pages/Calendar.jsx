import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import axios from "../../instance/Axios";
import Swal from "sweetalert2";

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

// Define a default/initial state for the form data
const initialFormData = {
  leaveType: "Full Day",
  category: "",
  startDate: "",
  endDate: "",
  reason: "",
  status: "Pending",
};

export default function Calendar() {
  const now = new Date();
  const [displayedMonth, setDisplayedMonth] = useState(now.getMonth());
  const [displayedYear, setDisplayedYear] = useState(now.getFullYear());

  const [holidays, setHolidays] = useState([]);
  const [leaves, setLeaves] = useState([]);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingLeave, setEditingLeave] = useState(null);
  const [formData, setFormData] = useState(initialFormData);

  const [errors, setErrors] = useState({});
  const [noChangeMessage, setNoChangeMessage] = useState("");

  // Set the default dates for the modal to the currently displayed month
  useEffect(() => {
    const todayInput = ddmmyyyyToInput(formatDateObjToDDMMYYYY(now));
    setFormData((prev) => ({
      ...prev,
      startDate: todayInput,
      endDate: todayInput,
    }));
  }, []);

  useEffect(() => {
    fetchHolidays(displayedYear, displayedMonth + 1);
    fetchLeaves(displayedYear, displayedMonth + 1);
  }, [displayedMonth, displayedYear]);

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

  const fetchLeaves = async (year, month) => {
    try {
      const response = await axios.post("/calendar/get/staff/leave", {
        year,
        month,
      });
      const leavesArray = (response.data || []).map((item) => ({
        id: item.id,
        leaveType: item.leaveType,
        startDate: formatInputToDDMMYYYY(item.leaveDate),
        endDate: formatInputToDDMMYYYY(item.endDate),
        reason: item.description,
        category: item.category,
        status: item.status || "Pending",
      }));
      setLeaves(leavesArray);
      console.log(response);
    } catch (error) {
      console.error("Failed to load leaves", error);
    }
  };

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

  const daysInMonth = new Date(displayedYear, displayedMonth + 1, 0).getDate();
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum = i + 1;
    const dateObj = new Date(displayedYear, displayedMonth, dayNum);
    const formatted = formatDateObjToDDMMYYYY(dateObj);

    const holidayItem = holidays.find((h) => h.date === formatted);

    const approvedLeaves = leaves.filter((l) => {
      if (l.status !== "Approve") return false;
      const start = ddmmyyyyToInput(l.startDate);
      const end = ddmmyyyyToInput(l.endDate);
      const current = ddmmyyyyToInput(formatted);
      return current >= start && current <= end;
    });

    return { day: dayNum, dateObj, formatted, holidayItem, approvedLeaves };
  });

  // Function to handle opening the modal for creating a leave from the calendar day click
  const onDayClick = (day) => {
    setEditingLeave(null);
    setFormData({
      ...initialFormData,
      startDate: ddmmyyyyToInput(day.formatted),
      endDate: ddmmyyyyToInput(day.formatted),
    });
    setShowModal(true);
  };

  // Function to handle opening the modal for creating a leave from the main "Create Leave" button
  const handleCreateLeave = () => {
    setNoChangeMessage("");
    setEditingLeave(null); // Ensure we are in create mode
    // Set default dates to the current displayed month's start/end for range selection
    const firstDayFormatted = formatDateObjToDDMMYYYY(
      new Date(displayedYear, displayedMonth, 1)
    );
    setFormData({
      ...initialFormData,
      startDate: ddmmyyyyToInput(firstDayFormatted),
      endDate: ddmmyyyyToInput(firstDayFormatted),
    });
    setShowModal(true);
  };

  const handleEditLeave = (leave) => {
    if (leave.status === "Approve") {
      Swal.fire({
        icon: "info",
        title: "Cannot Edit",
        text: "Approved leaves cannot be edited.",
      });
      return;
    }

    setEditingLeave(leave);
    setFormData({
      leaveType: leave.leaveType,
      category: leave.category,
      startDate: ddmmyyyyToInput(leave.startDate),
      endDate: ddmmyyyyToInput(leave.endDate),
      reason: leave.reason,
      status: leave.status,
    });
    setShowModal(true);
  };

  const handleDeleteLeave = async (leave) => {
    // Prevent deleting if the leave is approved
    if (leave.status === "Approve") {
      Swal.fire({
        icon: "warning",
        title: "Cannot Delete",
        text: "Approved leaves cannot be deleted.",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this leave?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/calendar/delete/leave/${leave.id}`);
        setLeaves((prev) => prev.filter((l) => l.id !== leave.id));

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Leave deleted successfully!",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (err) {
        console.error("Failed to delete leave", err);
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Failed to delete leave",
        });
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.leaveType) newErrors.leaveType = "Leave type is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.endDate) newErrors.endDate = "End date is required";
    if (!formData.reason) newErrors.reason = "Reason is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    setNoChangeMessage(""); // Validate fields first

    if (!validateForm()) return; // Check if no change happened in edit mode

    if (editingLeave) {
      const isUnchanged =
        editingLeave.leaveType === formData.leaveType &&
        editingLeave.category === formData.category && // Use the helper function for accurate date comparison
        editingLeave.startDate === formatInputToDDMMYYYY(formData.startDate) &&
        editingLeave.endDate === formatInputToDDMMYYYY(formData.endDate) &&
        editingLeave.reason === formData.reason &&
        editingLeave.status === formData.status;

      if (isUnchanged) {
        setNoChangeMessage("No changes made to update."); // 🛑 CRITICAL FIX: Stop execution here if no changes were made
        return;
      }
    }

    try {
      const payload = {
        leaveType: formData.leaveType,
        category: formData.category,
        leaveDate: formData.startDate, // YYYY-MM-DD format for API
        endDate: formData.endDate, // YYYY-MM-DD format for API
        description: formData.reason,
        status: formData.status,
      };

      let res;
      if (editingLeave) {
        res = await axios.put(
          `/calendar/update/leave/${editingLeave.id}`,
          payload
        );
      } else {
        res = await axios.post("/calendar/create/leave", payload);
      }

      const newOrUpdatedLeave = {
        id: res.data.id || editingLeave?.id,
        leaveType: res.data.leaveType || formData.leaveType,
        startDate: formatInputToDDMMYYYY(
          res.data.leaveDate || formData.startDate
        ),
        endDate: formatInputToDDMMYYYY(res.data.endDate || formData.endDate),
        reason: res.data.description || formData.reason,
        category: res.data.category || formData.category,
        status: res.data.status || formData.status,
      };

      setLeaves((prev) => {
        if (editingLeave) {
          return prev.map((l) =>
            l.id === editingLeave.id ? newOrUpdatedLeave : l
          );
        } else {
          return [...prev, newOrUpdatedLeave];
        }
      });

      setShowModal(false);
      setEditingLeave(null);
      setErrors({});
      setNoChangeMessage("");

      Swal.fire({
        icon: "success",
        title: `Leave ${editingLeave ? "updated" : "created"} successfully!`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      if(err.status === 406){
        console.error("Failed to save leave", err);
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "End date cannot be before start date",
        });
      }else{
        console.error("Failed to save leave", err);
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Server Error please check after some times",
        });
      }
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-[600px]">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Calendar */}
        <div className="md:col-span-12 bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4 gap-3">
            <button
              onClick={handlePrevMonth}
              className="px-3 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition"
            >
              Prev
            </button>
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
            {Array.from({
              length: new Date(displayedYear, displayedMonth, 1).getDay(),
            }).map((_, i) => (
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
                  (l) => l.leaveType === "fullday"
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

                  {/* holiday label */}
                  {d.holidayItem && (
                    <div className="text-[10px] px-1 text-center mt-1 w-full truncate">
                      {d.holidayItem.description}
                    </div>
                  )}

                  {/* leave type label */}
                  {d.approvedLeaves.length > 0 &&
                    !isSunday &&
                    !isHoliday &&
                    !isMaintenance && (
                      <div className="text-[10px] px-1 text-center mt-1 w-full truncate">
                        {d.approvedLeaves.map((l) => l.leaveType).join(", ")}
                      </div>
                    )}
                </div>
              );
            })}
          </div>

          {/* Color Legend */}
          <div className="mt-4 flex flex-wrap gap-4 items-center text-sm">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-red-500 rounded-sm border"></span>
              Holiday / Sunday
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-purple-500 rounded-sm border"></span>
              Maintenance
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-blue-800 rounded-sm border"></span>
              Full Day Leave
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-orange-500 rounded-sm border"></span>
              Half Day Leave
            </div>
          </div>
        </div>
      </div>

      {/* Leave List */}
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
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md relative shadow-xl max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
            >
              <X size={20} />
            </button>

            {/* Modal Title */}
            <h3 className="text-xl font-semibold mb-5 text-gray-800">
              {editingLeave ? "Edit Leave" : "Create Leave"}
            </h3>

            {/* Form */}
            <form className="space-y-4" onSubmit={handleSubmitLeave}>
              {/* Leave Type */}
              <div>
                <label className="block text-gray-700 text-sm mb-1">
                  Leave Type
                </label>
                <select
                  value={formData.leaveType}
                  onChange={(e) =>
                    setFormData({ ...formData, leaveType: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="morning">Morning</option>
                  <option value="fullday">Full Day</option>
                </select>
                {errors.leaveType && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.leaveType}
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-gray-700 text-sm mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Casual">Casual</option>
                  <option value="Medical">Medical</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
                {errors.category && (
                  <p className="text-red-500 text-xs mt-1">{errors.category}</p>
                )}
              </div>

              {/* Start & End Date */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-gray-700 text-sm mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    min={new Date().toISOString().split("T")[0]} 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                  {errors.startDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.startDate}
                    </p>
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-gray-700 text-sm mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    min={new Date().toISOString().split("T")[0]} // ⬅️ this restricts past dates
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                  {errors.endDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.endDate}
                    </p>
                  )}
                </div>
              </div>

              {/* Reason (changed to textarea for better input for a reason) */}
              <div>
                <label className="block text-gray-700 text-sm mb-1">
                  Reason
                </label>
                <select
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                >
                  <option value="">Select Reason</option>
                  <option value="Personal">Personal</option>
                  <option value="Family">Family</option>
                  <option value="Medical">Medical</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Vacation">Vacation</option>
                </select>
                {errors.reason && (
                  <p className="text-red-500 text-xs mt-1">{errors.reason}</p>
                )}
              </div>
              {noChangeMessage && (
                <p className="text-yellow-600 text-sm mt-2">
                  {noChangeMessage}
                </p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                {editingLeave ? "Update Leave" : "Create Leave"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
