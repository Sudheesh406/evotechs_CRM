// src/components/LeaveModal.jsx

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

// Helper to convert DD/MM/YYYY (display) → YYYY-MM-DD (input)
const ddmmyyyyToInput = (ddmmyyyy) => {
  if (!ddmmyyyy) return "";
  const parts = ddmmyyyy.split("/");
  if (parts.length !== 3) return "";
  const [d, m, y] = parts;
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
};

// Helper to convert YYYY-MM-DD (input) → DD/MM/YYYY (display/storage)
const formatInputToDDMMYYYY = (inputValue) => {
  if (!inputValue) return "";
  const [y, m, d] = inputValue.split("-");
  return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
};

const initialFormData = {
  leaveType: "Full Day",
  category: "",
  startDate: "",
  endDate: "",
  reason: "",
  status: "Pending",
  HalfTime: "", // ⭐ NEW FIELD
};

export default function LeaveModal({
  showModal,
  setShowModal,
  editingLeave,
  formData,
  setFormData,
  handleSubmitLeave,
}) {
  const [errors, setErrors] = useState({});
  const [noChangeMessage, setNoChangeMessage] = useState("");
  const todayDateString = new Date().toISOString().split("T")[0];

  // ⭐ Pre-fill data in edit mode
  useEffect(() => {
    if (editingLeave) {
      setFormData({
        leaveType: editingLeave.leaveType || "",
        category: editingLeave.category || "",
        startDate: ddmmyyyyToInput(editingLeave.startDate) || "",
        endDate: ddmmyyyyToInput(editingLeave.endDate) || "",
        reason: editingLeave.reason || "",
        status: editingLeave.status || "Pending",
        HalfTime: editingLeave.HalfTime || "",
      });
    } else {
      setFormData(initialFormData);
    }
  }, [editingLeave, setFormData]);

  useEffect(() => {
    setErrors({});
    setNoChangeMessage("");
  }, [showModal]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.leaveType) newErrors.leaveType = "Leave type is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.endDate) newErrors.endDate = "End date is required";
    if (!formData.reason) newErrors.reason = "Reason is required";

    const needsHalfTime =
      (formData.leaveType === "morning" ||
        formData.leaveType === "afternoon") &&
      formData.category === "WFH";

    if (needsHalfTime && !formData.HalfTime) {
      newErrors.HalfTime = "Half selection is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLocalSubmit = (e) => {
    e.preventDefault();
    setNoChangeMessage("");

    if (!validateForm()) return;

    // ⭐ No-change detection for edit mode
    if (editingLeave) {
      const isUnchanged =
        editingLeave.leaveType === formData.leaveType &&
        editingLeave.category === formData.category &&
        editingLeave.startDate === formatInputToDDMMYYYY(formData.startDate) &&
        editingLeave.endDate === formatInputToDDMMYYYY(formData.endDate) &&
        editingLeave.reason === formData.reason &&
        editingLeave.status === formData.status &&
        (editingLeave.HalfTime || "") === (formData.HalfTime || "");

      if (isUnchanged) {
        setNoChangeMessage("No changes made to update.");
        return;
      }
    }

    handleSubmitLeave(formData, editingLeave);
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md relative shadow-xl max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={() => setShowModal(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
        >
          <X size={20} />
        </button>

        <h3 className="text-xl font-semibold mb-5 text-gray-800">
          {editingLeave ? "Edit" : "Create"}
        </h3>

        <form className="space-y-4" onSubmit={handleLocalSubmit}>

          {/* Leave Type */}
          <div>
            <label className="block text-gray-700 text-sm mb-1">Type</label>
            <select
              value={formData.leaveType}
              onChange={(e) =>
                setFormData({ ...formData, leaveType: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="">Select Type</option>
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="fullday">Full Day</option>
            </select>
            {errors.leaveType && (
              <p className="text-red-500 text-xs mt-1">{errors.leaveType}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-gray-700 text-sm mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="">Select Category</option>
              <option value="leave">Leave</option>
              <option value="WFH">WFH</option>
            </select>
            {errors.category && (
              <p className="text-red-500 text-xs mt-1">{errors.category}</p>
            )}
          </div>

          {/* Start & End Dates */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-gray-700 text-sm mb-1">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                min={todayDateString}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                required
              />
              {errors.startDate && (
                <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>
              )}
            </div>

            <div className="flex-1">
              <label className="block text-gray-700 text-sm mb-1">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                min={todayDateString}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                required
              />
              {errors.endDate && (
                <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-gray-700 text-sm mb-1">Reason</label>
            <select
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="">Select Reason</option>
              <option value="Personal">Personal</option>
              <option value="Family">Family</option>
              <option value="Medical">Medical</option>
              <option value="Emergency">Emergency</option>
            </select>
            {errors.reason && (
              <p className="text-red-500 text-xs mt-1">{errors.reason}</p>
            )}
          </div>

          {/* ⭐ Conditional HalfTime Selection */}
          {(formData.category === "WFH" &&
            (formData.leaveType === "morning" ||
              formData.leaveType === "afternoon")) && (
            <div>
              <label className="block text-gray-700 text-sm mb-1">
                Selection
              </label>
              <select
                value={formData.HalfTime}
                onChange={(e) =>
                  setFormData({ ...formData, HalfTime: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                required
              >
                <option value="">Select Half</option>
                <option value="Offline">Offline Work</option>
                <option value="Leave">Leave</option>
              </select>

              {errors.HalfTime && (
                <p className="text-red-500 text-xs mt-1">{errors.HalfTime}</p>
              )}
            </div>
          )}

          {noChangeMessage && (
            <p className="text-yellow-600 text-sm">{noChangeMessage}</p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            {editingLeave ? "Update" : "Create"}
          </button>
        </form>
      </div>
    </div>
  );
}
