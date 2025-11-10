import { useEffect, useState } from "react";
import { X } from "lucide-react";
import axios from "../../instance/Axios";
import Swal from "sweetalert2";

const ContactAssignModal = ({ modalOpen, setModalOpen }) => {
  const [formData, setFormData] = useState({
    assignedUser: "",
    name: "",
    description: "",
    email: "",
    phone: "",
    location: "",
    purpose: "",
    source: "",
    priority: "",
    amount: "",
  });

  const [allUsers, setAllUsers] = useState([]);
  const [errors, setErrors] = useState({});

  const fields = [
    { label: "Name", key: "name" },
    { label: "Description", key: "description" },
    { label: "Email", key: "email", type: "email" },
    { label: "Phone", key: "phone", type: "tel" },
    { label: "Location", key: "location" },
    { label: "Purpose", key: "purpose" },
    { label: "Source", key: "source" },
    { label: "Priority", key: "priority" },
    { label: "Amount", key: "amount", type: "number" },
  ];

  const fetchAllUsers = async () => {
    try {
      const response = await axios.get("/company/get");
      console.log("Fetched users:", response);
      setAllUsers(response?.data?.data?.staffDetails || []); // ✅ Store data safely
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    if (modalOpen) {
      fetchAllUsers();
    }
  }, [modalOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };


const validate = () => {
  const newErrors = {};
  if (!formData.assignedUser) newErrors.assignedUser = "Please select a user.";
  
  fields.forEach((field) => {
    // ✅ Skip email validation
    if (field.key !== "email" && !formData[field.key]?.trim()) {
      newErrors[field.key] = `${field.label} is required.`;
    }
  });

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};


const onSubmit = async (e) => {
  e.preventDefault();
  if (!validate()) return;

  try {
    await axios.post("/customer/contact/assign", formData);

    // ✅ Show success alert
    await Swal.fire({
      title: "Success!",
      text: "Contact assigned successfully.",
      icon: "success",
      confirmButtonColor: "#2563eb", // Tailwind blue-600
    });

    setModalOpen(false);
  } catch (err) {
    console.error("Error saving contact:", err);

    // ❌ Show error alert if something goes wrong
    Swal.fire({
      title: "Error",
      text: "Failed to assign contact. Please try again.",
      icon: "error",
      confirmButtonColor: "#dc2626", // Tailwind red-600
    });
  }
};


  // ✅ Conditional rendering happens here, AFTER all hooks
  if (!modalOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/40 backdrop-blur-sm z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl p-6 relative overflow-y-auto max-h-[90vh] shadow-xl">
        <button
          onClick={() => setModalOpen(false)}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X />
        </button>

        <h2 className="text-xl font-semibold mb-5 text-gray-800">
          Create New Contact
        </h2>

        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col col-span-1 md:col-span-2">
            <label className="text-gray-700 font-medium mb-1">Assign To User</label>
            <select
              name="assignedUser"
              value={formData.assignedUser}
              onChange={handleChange}
              className={`border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.assignedUser ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select User</option>
              {allUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
            {errors.assignedUser && (
              <span className="text-red-500 text-sm mt-1">{errors.assignedUser}</span>
            )}
          </div>

          {fields.map((field) => (
            <div key={field.key} className="flex flex-col">
              <label className="text-gray-700 font-medium mb-1">{field.label}</label>
              {field.key === "priority" ? (
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className={`border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.priority ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select Priority</option>
                  <option value="High">High</option>
                  <option value="Normal">Normal</option>
                  <option value="Low">Low</option>
                </select>
              ) : (
                <input
                  type={field.type || "text"}
                  name={field.key}
                  value={formData[field.key]}
                  onChange={handleChange}
                  className={`border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors[field.key] ? "border-red-500" : "border-gray-300"
                  }`}
                />
              )}
              {errors[field.key] && (
                <span className="text-red-500 text-sm mt-1">{errors[field.key]}</span>
              )}
            </div>
          ))}

          <div className="col-span-1 md:col-span-2 flex justify-end mt-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
>
              Save Contact
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactAssignModal;
