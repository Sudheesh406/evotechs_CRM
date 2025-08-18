import React, { useState } from "react";
import { ChevronDown, Phone, X } from "lucide-react";
import DataTable from "../../components/Table2";
import axios from "../../instance/Axios";

const Leads = () => {
  const [leads, setLeads] = useState([
    {
      name: "Christopher Maclead (Sample)",
      company: "Rangoni Of Florence",
      email: "christopher-maclead@noemail.invalid",
      phone: "555-555-5555",
      source: "Cold Call",
    },
    {
      name: "Carissa Kidman (Sample)",
      company: "Oh My Goodknits Inc",
      email: "carissa-kidman@noemail.invalid",
      phone: "555-555-5555",
      source: "Advertisement",
    },
    {
      name: "James Merced (Sample)",
      company: "Kwik Kopy Printing",
      email: "james-merced@noemail.invalid",
      phone: "555-555-5555",
      source: "Web Download",
    },
    {
      name: "Tresa Sweely (Sample)",
      company: "Morlong Associates",
      email: "tresa-sweely@noemail.invalid",
      phone: "555-555-5555",
      source: "Seminar Partner",
    },
    {
      name: "Felix Hirpara (Sample)",
      company: "Chapman",
      email: "felix-hirpara@noemail.invalid",
      phone: "555-555-5555",
      source: "Online Store",
    },
  ]);

  const columns = [
    { label: "Lead Name", key: "name", className: "font-medium text-gray-800" },
    { label: "Company", key: "company" },
    {
      label: "Email",
      key: "email",
      className: "text-indigo-600 hover:underline cursor-pointer",
    },
    { label: "Phone", key: "phone" },
    { label: "Lead Source", key: "source" },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    email: "",
    phone: "",
    source: "",
    priority: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Real-time validation
    setErrors((prev) => ({
      ...prev,
      [name]: value.trim() === "" ? "This field is required" : "",
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (!formData[key].trim()) {
        newErrors[key] = "This field is required";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    // Add new lead
    createNew(formData);
  };

  const createNew = async (data) => {
    try {
      const response = await axios.post("/customer/lead/create", data);
      console.log(response);
      if (response) {
        setLeads((prev) => [...prev, formData]);
        setFormData({
          name: "",
          description: "",
          email: "",
          phone: "",
          source: "",
          priority: "",
        });
        setErrors({});
        setIsModalOpen(false);
      }
    } catch (error) {
      console.log("error found in createNew", error);
    }
  };

  return (
    <div className="bg-gray-50 min-h-[680px] p-4">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <button className="border rounded px-3 py-1 flex items-center gap-1 bg-white shadow-sm w-full sm:w-auto justify-between sm:justify-start">
            All Leads <ChevronDown size={16} />
          </button>
          <span className="text-gray-600 text-sm">
            Total Records {leads.length}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow w-full sm:w-auto"
          >
            Create Lead
          </button>
          <button className="border rounded px-3 py-2 flex items-center gap-1 bg-white shadow-sm w-full sm:w-auto justify-between sm:justify-start">
            Actions <ChevronDown size={16} />
          </button>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={leads}
        renderCell={(key, row) => {
          if (key === "phone") {
            return (
              <div className="flex items-center gap-2 text-gray-600">
                {row.phone}
                <Phone size={14} className="text-gray-400" />
              </div>
            );
          }
          if (key === "source") {
            return (
              <span className="inline-block px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">
                {row.source}
              </span>
            );
          }
          return row[key];
        }}
      />

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
        <span>10 Records Per Page</span>
        <span>1 - {leads.length}</span>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X />
            </button>
            <h2 className="text-xl font-semibold mb-4">Create New Lead</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {[
                { label: "Name", key: "name" },
                { label: "Description", key: "description" },
                { label: "Email", key: "email", type: "email" },
                { label: "Phone", key: "phone", type: "tel" },
                { label: "Source", key: "source" },
                { label: "Priority", key: "priority" },
              ].map((field) => (
                <div key={field.key} className="flex flex-col">
                  <label className="text-gray-700">{field.label}</label>

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
                    <span className="text-red-500 text-sm mt-1">
                      {errors[field.key]}
                    </span>
                  )}
                </div>
              ))}

              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded mt-2"
              >
                Save Lead
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
