/* --- Call Modal with time suggestions, SweetAlert2, and Loading --- */
import { useState } from "react";
import axios from "../../instance/Axios";
import Swal from "sweetalert2";

export default function CallModal({
  onClose,
  customer,
  taskDetails,
  onSubmitSuccess,
  state
}) {
  const [formData, setFormData] = useState({
    subject: "",
    date: "",
    time: "",
    description: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // ✅ Loading state

  const timeOptions = [
    "09:00 AM","09:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM",
    "12:00 PM","12:30 PM","01:00 PM","01:30 PM","02:00 PM","02:30 PM",
    "03:00 PM","03:30 PM","04:00 PM","04:30 PM","05:00 PM","05:30 PM",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    ["subject", "date", "time", "description"].forEach((field) => {
      if (!formData[field]) newErrors[field] = "This field is required";
    });
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }
    addNewCall(formData);
  };

  const addNewCall = async (data) => {
    setLoading(true); // ✅ Start loading
    data.contactId = customer.id;
    data.name = customer.name;
    data.phoneNumber = customer.phone;

    try {
      let response;
      if (!state) {
        response = await axios.post("/calls/create/from_task", { data });
      } else {
        data.staffId = taskDetails.staffId;
        response = await axios.post("/calls/create/from_task_team", { data });
      }

      Swal.fire({
        title: "Success!",
        text: "Call has been created successfully.",
        icon: "success",
        confirmButtonColor: "#3085d6",
      });

      if (onSubmitSuccess) await onSubmitSuccess();
      onClose();
      console.log("response", response);
    } catch (error) {
      console.log("error in adding new Call", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to create the call. Please try again.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false); // ✅ Stop loading
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          disabled={loading} // disable close during loading
        >
          ✕
        </button>
        <h2 className="text-lg font-semibold mb-4">Create call</h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Subject */}
          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-1">Subject</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className={`w-full border rounded px-3 py-2 ${
                errors.subject ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter subject"
              disabled={loading}
            />
            {errors.subject && (
              <p className="text-red-500 text-sm">{errors.subject}</p>
            )}
          </div>

          {/* Date */}
          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-1">Call Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={`w-full border rounded px-3 py-2 ${
                errors.date ? "border-red-500" : "border-gray-300"
              }`}
              min={new Date().toISOString().split("T")[0]}
              disabled={loading}
            />
            {errors.date && (
              <p className="text-red-500 text-sm">{errors.date}</p>
            )}
          </div>

          {/* Time */}
          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-1">Time</label>
            <input
              list="timeOptions"
              name="time"
              value={formData.time}
              onChange={handleChange}
              placeholder="HH:MM AM/PM"
              className={`w-full border rounded px-3 py-2 ${
                errors.time ? "border-red-500" : "border-gray-300"
              }`}
              disabled={loading}
            />
            <datalist id="timeOptions">
              {timeOptions.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
            {errors.time && (
              <p className="text-red-500 text-sm">{errors.time}</p>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col md:col-span-2">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={`w-full border rounded px-3 py-2 ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter description"
              disabled={loading}
            />
            {errors.description && (
              <p className="text-red-500 text-sm">{errors.description}</p>
            )}
          </div>

          {/* Submit */}
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"} {/* ✅ Show loading text */}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
