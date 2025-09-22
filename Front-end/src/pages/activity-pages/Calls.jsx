import React, { useEffect, useState, useRef } from "react";
import { ChevronDown, Phone, X } from "lucide-react";
import DataTable from "../../components/Table2";
import axios from "../../instance/Axios";
import Swal from "sweetalert2";

const calls = () => {
  const [filter, setFilter] = useState("Today's");
  const [open, setOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [loading, setLoading] = useState(false);

  const dropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    date: "",
    time: "",
    phoneNumber: "",
    description: "",
    status: "pending", // ✅ default status
  });

  const [errors, setErrors] = useState({});
  const [calls, setCalls] = useState([]);

  const filterOptions = [
    "Today's",
    "Upcoming",
    "Completed",
    "Cancelled",
    "Pending",
    "This Week",
  ];

  const columns = [
    { label: "Subject", key: "subject" },
    { label: "Name", key: "name" },
    { label: "Host", key: "host" },
    { label: "Team", key: "team" },
    { label: "Date", key: "date" },
    { label: "time", key: "time" },
    { label: "Phone Number", key: "phoneNumber" },
    { label: "Status", key: "status" },
    { label: "Actions", key: "actions" },
  ];

  const timeOptions = ["7:00 AM", "7:30 AM", "8:00 AM"];

  // helpers
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "-";
    const [h, m] = timeStr.split(":");
    const d = new Date();
    d.setHours(h, m);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTo12Hour = (time) => {
    if (!time) return "";
    const [h, m] = time.split(":");
    const d = new Date();
    d.setHours(h, m);
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (key === "status" && !isEditing) return; // skip status in create
      const value = formData[key]?.trim?.() ?? formData[key];
      if (!value) {
        newErrors[key] = "This field is required";
      }
    });

    // ✅ Phone validation
    if (formData.phoneNumber && !/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Enter a valid 10-digit number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormChanged = () => {
    if (!originalData) return true;
    return Object.keys(formData).some(
      (key) => formData[key] !== originalData[key]
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (isEditing) {
      if (!isFormChanged()) {
        Swal.fire({
          title: "No changes!",
          text: "You didn't modify any fields.",
          icon: "info",
          confirmButtonColor: "#3085d6",
        });
        return;
      }
      UpdateCall(editingId, formData);
    } else {
      CreateCall(formData);
    }
  };

  const CreateCall = async (data) => {
    setLoading(true); // start loading
    try {
      const response = await axios.post("/calls/create", { data });
      if (response?.data?.success) {
        closeForm();
        getCalls(filter);

        Swal.fire({
          icon: "success",
          title: "Call Created!",
          text: "The call has been created successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.log("error found in CreateCalls", error);
      Swal.fire({
        icon: "error",
        title: "Failed to Create Call",
        text: error.response?.data?.message || "Please try again later.",
      });
    } finally {
      setLoading(false); // stop loading
    }
  };

  const UpdateCall = async (id, data) => {
    setLoading(true);
    try {
      const response = await axios.put(`/calls/edit/${id}`, { data });
      if (response?.data?.success) {
        closeForm();
        getCalls(filter);

        Swal.fire({
          icon: "success",
          title: "Call Updated!",
          text: "The call has been updated successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.log("error found in UpdateCalls", error);
      Swal.fire({
        icon: "error",
        title: "Failed to Update Call",
        text: error.response?.data?.message || "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setFormData({
      name: "",
      subject: "",
      date: "",
      time: "",
      phoneNumber: "",
      description: "",
      status: "pending",
    });
    setIsEditing(false);
    setEditingId(null);
    setOriginalData(null);
  };

  const handleEdit = (row) => {
    const editData = {
      name: row.name || "",
      subject: row.subject || "",
      date: row.date ? row.date.split("T")[0] : "",
      time: formatTo12Hour(row.time),
      phoneNumber: row.phoneNumber || "",
      description: row.description || "",
      status: row.status || "pending",
    };
    setFormData(editData);
    setOriginalData(editData);
    setEditingId(row.id);
    setIsEditing(true);
    setShowForm(true);
  };

  const getCalls = async (selectedFilter) => {
    try {
      // Show loading alert
      Swal.fire({
        title: "Getting calls...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await axios.post("/calls/get", {
        filter: selectedFilter,
      });

      const data = Array.isArray(response.data.data) ? response.data.data : [];
      setCalls(data);

      Swal.close(); // Close loading on success
    } catch (error) {
      Swal.close(); // Close loading if error occurs

      Swal.fire({
        icon: "error",
        title: "Failed to get calls",
        text:
          error.response?.data?.message ||
          "Something went wrong. Please try again.",
      });

      setCalls([]);
      console.log("error", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      // Show confirmation dialog
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "This call will be deleted permanently!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        // Show loading while deleting
        Swal.fire({
          title: "Deleting...",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        await axios.delete(`/calls/delete/${id}`);

        Swal.close(); // close loading

        // Show success message
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "The call has been deleted successfully.",
          confirmButtonText: "OK",
          showConfirmButton: false,
        }).then(() => {
          getCalls(filter);
        });
      }
    } catch (error) {
      Swal.close(); // close loading if error

      Swal.fire({
        icon: "error",
        title: "Failed to delete",
        text:
          error.response?.data?.message ||
          "Something went wrong. Please try again.",
      });

      console.log("error found delete", error);
    }
  };

  useEffect(() => {
    getCalls(filter);
  }, [filter]);

  // ✅ close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-gray-50 min-h-[680px] p-4">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
        <div
          className="flex flex-wrap items-center gap-2 relative"
          ref={dropdownRef}
        >
          <button
            onClick={() => setOpen(!open)}
            className="border rounded px-3 py-1 flex items-center gap-1 bg-white shadow-sm w-full sm:w-auto"
          >
            {filter} <ChevronDown size={16} />
          </button>

          {open && (
            <div className="absolute top-full mt-1 w-40 bg-white border rounded shadow-lg z-10">
              {filterOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setFilter(option);
                    setOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                >
                  {option}
                </button>
              ))}
            </div>
          )}
          <span className="text-gray-600 text-sm">
            Total Records {calls.length}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow"
          >
            Create Calls
          </button>
        </div>
      </div>

      {/* DataTable */}
      {calls.length > 0 ? (
        <DataTable
          columns={columns}
          data={calls}
          renderCell={(key, row) => {
            if (key === "host") {
              return row.staff?.name ?? "-";
            }
            if (key === "team") {
              return row.teamStaff?.name ?? "-";
            }
            if (key === "phoneNumber") {
              return (
                <div className="flex items-center gap-2 text-gray-600">
                  {row.phoneNumber ?? "-"}
                  <Phone size={14} className="text-gray-400" />
                </div>
              );
            }
            if (key === "status") {
              return (
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    row.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : row.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : row.status === "cancelled"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {row.status}
                </span>
              );
            }
            if (key === "date") {
              return formatDate(row.date);
            }
            if (key === "time") {
              return formatTime(row.time);
            }
            if (key === "actions") {
              return (
                <div className="flex gap-2">
                  <button
                    className="bg-blue-500 text-white px-2 py-1 text-sm rounded hover:bg-blue-600"
                    onClick={() => handleEdit(row)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-500 text-white px-2 py-1 text-sm rounded hover:bg-red-600"
                    onClick={() => handleDelete(row.id)}
                  >
                    Delete
                  </button>
                </div>
              );
            }
            return row[key] ?? "-";
          }}
        />
      ) : (
        <div className="text-center text-gray-500 py-8">No calls found</div>
      )}

      {/* Modal form */}
      {showForm && (
        <div className="fixed inset-0 bg-opacity-40 flex justify-center items-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={closeForm}
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-semibold mb-4">
              {isEditing ? "Edit call" : "Create call"}
            </h2>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {/* Name */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full border rounded px-3 py-2 ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name}</p>
                )}
              </div>

              {/* Subject */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className={`w-full border rounded px-3 py-2 ${
                    errors.subject ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.subject && (
                  <p className="text-red-500 text-sm">{errors.subject}</p>
                )}
              </div>

              {/* Call Date */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1">
                  Call Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]} // Prevent past dates
                  className={`w-full border rounded px-3 py-2 ${
                    errors.date ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.date && (
                  <p className="text-red-500 text-sm">{errors.date}</p>
                )}
              </div>

              {/* Time */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1">Time</label>
                <input
                  list="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  placeholder="HH:MM AM/PM"
                  className={`w-full border rounded px-3 py-2 ${
                    errors.time ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <datalist id="time">
                  {timeOptions.map((time) => (
                    <option key={time} value={time} />
                  ))}
                </datalist>
                {errors.time && (
                  <p className="text-red-500 text-sm">{errors.time}</p>
                )}
              </div>

              {/* Phone Number */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={`w-full border rounded px-3 py-2 ${
                    errors.phoneNumber ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-sm">{errors.phoneNumber}</p>
                )}
              </div>

              {/* Status (only in Edit mode) */}
              {isEditing && (
                <div className="flex flex-col">
                  <label className="block text-sm font-medium mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className={`w-full border rounded px-3 py-2 ${
                      errors.status ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select Status</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  {errors.status && (
                    <p className="text-red-500 text-sm">{errors.status}</p>
                  )}
                </div>
              )}

              {/* Description */}
              <div className="flex flex-col md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full border rounded px-3 py-2 resize-none ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm">{errors.description}</p>
                )}
              </div>

              <div className="md:col-span-2 w-full flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default calls;
