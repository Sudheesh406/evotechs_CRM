/* --- Meeting Modal with start/end time, SweetAlert2, and Loading --- */
import { useState } from "react";
import axios from "../../instance/Axios";
import Swal from "sweetalert2";

export default function MeetingModal({
  onClose,
  customer,
  taskDetails,
  onSubmitSuccess,
  state
}) {
  const [formData, setFormData] = useState({
    subject: "",
    date: "",
    startTime: "",
    endTime: "",
    description: "",
    type: "offline", 
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // ✅ Loading state

  const timeOptions = [
    "09:00 AM","09:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM",
    "12:00 PM","12:30 PM",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const convertTo24H = (time) => {
    const [hourMin, modifier] = time.split(" ");
    let [hours, minutes] = hourMin.split(":").map(Number);
    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    ["subject", "date", "startTime", "endTime", "description"].forEach(
      (field) => {
        if (!formData[field]) newErrors[field] = "This field is required";
      }
    );

    // Check endTime > startTime
    if (formData.startTime && formData.endTime) {
      const start = new Date(`1970-01-01T${convertTo24H(formData.startTime)}`);
      const end = new Date(`1970-01-01T${convertTo24H(formData.endTime)}`);
      if (end <= start) newErrors.endTime = "End time must be after start time";
    }

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    addNewMeeting(formData);
  };

  const addNewMeeting = async (data) => {
    setLoading(true); // ✅ start loading
    data.contactId = customer.id;
    data.name = customer.name;
    data.phoneNumber = customer.phone;

    try {
      let response;
      if (!state) {
        response = await axios.post("/meetings/create/from_task", { data });
      } else {
        data.staffId = taskDetails.staffId;
        response = await axios.post("/meetings/create/from_task_team", { data });
      }

      Swal.fire({
        title: "Success!",
        text: "Meeting has been created successfully.",
        icon: "success",
        confirmButtonColor: "#3085d6",
      });

      if (onSubmitSuccess) await onSubmitSuccess();
      onClose();
      console.log("response", response);
    } catch (error) {
      console.log("error in adding new Meeting", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to create the meeting. Please try again.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false); // ✅ stop loading
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
        <h2 className="text-lg font-semibold mb-4">Create Meeting</h2>

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
              className={`w-full border rounded px-3 py-2 ${errors.subject ? "border-red-500" : "border-gray-300"}`}
              placeholder="Enter subject"
              disabled={loading}
            />
            {errors.subject && <p className="text-red-500 text-sm">{errors.subject}</p>}
          </div>

          {/* Date */}
          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-1">Meeting Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={`w-full border rounded px-3 py-2 ${errors.date ? "border-red-500" : "border-gray-300"}`}
              min={new Date().toISOString().split("T")[0]}
              disabled={loading}
            />
            {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
          </div>

          {/* Start Time */}
          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-1">Start Time</label>
            <input
              list="timeOptions"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              placeholder="HH:MM AM/PM"
              className={`w-full border rounded px-3 py-2 ${errors.startTime ? "border-red-500" : "border-gray-300"}`}
              disabled={loading}
            />
            <datalist id="timeOptions">
              {timeOptions.map((t) => <option key={t} value={t} />)}
            </datalist>
            {errors.startTime && <p className="text-red-500 text-sm">{errors.startTime}</p>}
          </div>

          {/* End Time */}
          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-1">End Time</label>
            <input
              list="timeOptions"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              placeholder="HH:MM AM/PM"
              className={`w-full border rounded px-3 py-2 ${errors.endTime ? "border-red-500" : "border-gray-300"}`}
              disabled={loading}
            />
            <datalist id="timeOptions">
              {timeOptions.map((t) => <option key={t} value={t} />)}
            </datalist>
            {errors.endTime && <p className="text-red-500 text-sm">{errors.endTime}</p>}
          </div>

            <div className="flex flex-col md:col-span-2">
            <label className="block text-sm font-medium mb-1">Meeting Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={`w-full border rounded px-3 py-2 ${errors.type ? "border-red-500" : "border-gray-300"}`}
              disabled={loading}
            >
              <option value="">Select Type</option>
              <option value="offline">Offline</option>
              <option value="online">Online</option>
            </select>
            {errors.type && <p className="text-red-500 text-sm">{errors.type}</p>}
          </div>

          {/* Description */}
          <div className="flex flex-col md:col-span-2">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={`w-full border rounded px-3 py-2 ${errors.description ? "border-red-500" : "border-gray-300"}`}
              placeholder="Enter description"
              disabled={loading}
            />
            {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
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
