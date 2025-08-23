import React, { useEffect, useState } from "react";
import { ChevronDown, Phone, X } from "lucide-react";
import DataTable from "../../components/Table2";
import axios from "../../instance/Axios";

const Meetings = () => {
  const [filter, setFilter] = useState("Today's");
  const [open, setOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    meetingDate: "",
    startTime: "",
    endTime: "",
    phoneNumber: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [meetings, setMeetings] = useState([]);

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
    { label: "Contact Name", key: "name" },
    { label: "Host", key: "host" },
    { label: "Date", key: "meetingDate" },
    { label: "From", key: "startTime" },
    { label: "To", key: "endTime" },
    { label: "Phone Number", key: "phoneNumber" },
    { label: "Status", key: "status" },
    { label: "Actions", key: "actions" },
  ];

  const timeOptions = [
    "6:00 AM","6:30 AM","7:00 AM","7:30 AM","8:00 AM",
    "8:30 AM","9:00 AM","9:30 AM","10:00 AM","10:30 AM",
    "11:00 AM","11:30 AM","12:00 PM","12:30 PM","1:00 PM",
    "1:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM",
    "4:00 PM","4:30 PM","5:00 PM","5:30 PM","6:00 PM",
    "6:30 PM","7:00 PM","7:30 PM","8:00 PM",
  ];

  // format helpers
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

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const value = formData[key].trim();
      if (!value) {
        newErrors[key] = "This field is required";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      CreateMeeting(formData);
    }
  };

  const CreateMeeting = async (data) => {
    try {
      const response = await axios.post("/meetings/create", { data });
      if (response) {
        setShowForm(false);
        setFormData({
          name: "",
          subject: "",
          meetingDate: "",
          startTime: "",
          endTime: "",
          phoneNumber: "",
          description: "",
        });
        getMeetings(filter);
      }
    } catch (error) {
      console.log("error found in CreateMeeting", error);
    }
  };

  const getMeetings = async (selectedFilter) => {
    try {
      const response = await axios.post("/meetings/get", {
        filter: selectedFilter,
      });
      console.log(response);

      const data = Array.isArray(response.data.data)
        ? response.data.data
        : [];
      setMeetings(data);
    } catch (error) {
      console.log("error", error);
      setMeetings([]);
    }
  };

  const handleEdit = async (id)=>{
    console.log(id)
    try {
      const response = await axios.put('/meetings/')
      console.log(response)
    } catch (error) {
      console.log('error found in handleEdit',error)
    }
  }

  useEffect(() => {
    getMeetings(filter);
  }, [filter]);

  return (
    <div className="bg-gray-50 min-h-[680px] p-4">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-2 relative">
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
            Total Records {meetings.length}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow"
          >
            Create Meetings
          </button>
        </div>
      </div>

      {/* DataTable */}
      {meetings.length > 0 ? (
        <DataTable
          columns={columns}
          data={meetings}
          renderCell={(key, row) => {
            if (key === "host") {
              return row.staff?.name ?? "-";
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
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {row.status}
                </span>
              );
            }
            if (key === "meetingDate") {
              return formatDate(row.meetingDate);
            }
            if (key === "startTime") {
              return formatTime(row.startTime);
            }
            if (key === "endTime") {
              return formatTime(row.endTime);
            }
            if (key === "actions") {
              return (
                <div className="flex gap-2">
                  <button className="bg-blue-500 text-white px-2 py-1 text-sm rounded hover:bg-blue-600"
                  onClick={()=>handleEdit(row.id)}>
                    Edit
                  </button>
                  <button className="bg-red-500 text-white px-2 py-1 text-sm rounded hover:bg-red-600">
                    Delete
                  </button>
                </div>
              );
            }
            return row[key] ?? "-";
          }}
        />
      ) : (
        <div className="text-center text-gray-500 py-8">
          No meetings found
        </div>
      )}

      {/* Modal form */}
      {showForm && (
        <div className="fixed inset-0 bg-opacity-40 flex justify-center items-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowForm(false)}
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-semibold mb-4">Create Meeting</h2>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {Object.keys(formData).map((field) => {
                if (field === "description") {
                  return (
                    <div key={field} className="flex flex-col md:col-span-2">
                      <label className="block text-sm font-medium mb-1 capitalize">
                        {field}
                      </label>
                      <textarea
                        name={field}
                        value={formData[field]}
                        onChange={handleChange}
                        rows={4}
                        className={`w-full border rounded px-3 py-2 resize-none ${
                          errors[field] ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors[field] && (
                        <p className="text-red-500 text-sm">{errors[field]}</p>
                      )}
                    </div>
                  );
                }

                if (field.includes("Time")) {
                  return (
                    <div key={field} className="flex flex-col">
                      <label className="block text-sm font-medium mb-1 capitalize">
                        {field}
                      </label>
                      <input
                        list={`${field}-options`}
                        name={field}
                        value={formData[field]}
                        onChange={handleChange}
                        placeholder="HH:MM AM/PM"
                        className={`w-full border rounded px-3 py-2 ${
                          errors[field] ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      <datalist id={`${field}-options`}>
                        {timeOptions.map((time) => (
                          <option key={time} value={time} />
                        ))}
                      </datalist>
                      {errors[field] && (
                        <p className="text-red-500 text-sm">{errors[field]}</p>
                      )}
                    </div>
                  );
                }

                return (
                  <div key={field} className="flex flex-col">
                    <label className="block text-sm font-medium mb-1 capitalize">
                      {field}
                    </label>
                    <input
                      type={field.includes("Date") ? "date" : "text"}
                      name={field}
                      value={formData[field]}
                      onChange={handleChange}
                      className={`w-full border rounded px-3 py-2 ${
                        errors[field] ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors[field] && (
                      <p className="text-red-500 text-sm">{errors[field]}</p>
                    )}
                  </div>
                );
              })}

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Meetings;
