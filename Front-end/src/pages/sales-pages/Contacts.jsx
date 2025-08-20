import React, { useState, useEffect } from "react";
import { ChevronDown, Phone, X, Edit, Trash, CheckCircle } from "lucide-react";
import DataTable from "../../components/Table2";
import axios from "../../instance/Axios";

const contacts = () => {
  const [leads, setLeads] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [searchTerm, setSearchTerm] = useState(""); // 🔍 search input

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [originalData, setOriginalData] = useState(null); // store original row for edit validation
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    email: "",
    phone: "",
    source: "",
    priority: "",
    amount: "",
  });
  const [errors, setErrors] = useState({});

  const columns = [
    { label: "contact Name", key: "name", className: "font-medium text-gray-800" },
    { label: "Description", key: "description" },
    {
      label: "Email",
      key: "email",
      className: "text-indigo-600 hover:underline cursor-pointer",
    },
    { label: "Phone", key: "phone" },
    { label: "Contact Source", key: "source" },
    { label: "Priority", key: "priority" },
    { label: "Amount", key: "amount" },
    { label: "Actions", key: "actions" },
  ];

  // Fetch leads
  const getLeads = async (pageNo = 1, search = "") => {
    try {
      const response = await axios.get(
        `/customer/contact/get?page=${pageNo}&limit=${limit}&search=${search}`
      );
      if (response.data && response.data.data) {
        const { leads, total } = response.data.data;
        setLeads(leads || []);
        setTotalCount(total || 0);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      getLeads(page, searchTerm);
    }, 500); // debounce search

    return () => clearTimeout(delayDebounce);
  }, [page, searchTerm]);

  // Open modal for create or edit
  const openModal = (contact = null) => {
    if (contact) {
      setEditingId(contact.id);
      const leadData = {
        name: contact.name || "",
        description: contact.description || "",
        email: contact.email || "",
        phone: contact.phone || "",
        source: contact.source || "",
        priority: contact.priority || "",
        amount: contact.amount || "",
      };
      setFormData(leadData);
      setOriginalData(leadData); // store original
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        description: "",
        email: "",
        phone: "",
        source: "",
        priority: "",
        amount: "",
      });
      setOriginalData(null);
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setErrors({});
  };

  // Handle form input
const handleChange = (e) => {
  const { name, value } = e.target;
  let newValue = value;

  // Strictly allow only numbers for phone & amount
  if (name === "phone" || name === "amount") {
    newValue = value.replace(/[^0-9]/g, ""); // remove anything that's not a digit
  }
  setFormData((prev) => ({ ...prev, [name]: newValue }));
  setErrors((prev) => ({
    ...prev,
    [name]: newValue.trim() === "" ? "This field is required" : "",
  }));
};


  // Create or Update
  const handleSubmit = async (e) => {
    e.preventDefault();

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

    // 🔍 Validate no changes when editing
    if (
      editingId &&
      JSON.stringify(formData) === JSON.stringify(originalData)
    ) {
      alert("No changes were made.");
      return;
    }

    try {
      if (editingId) {
        await axios.put(`/customer/contact/update/${editingId}`, formData);
      } else {
        await axios.post("/customer/contact/create", formData);
      }

      setIsModalOpen(false);
      setEditingId(null);
      setFormData({
        name: "",
        description: "",
        email: "",
        phone: "",
        source: "",
        priority: "",
        amount: "",
      });
      setOriginalData(null);
      getLeads(page);
    } catch (error) {
      console.log("error found in save", error);
    }
  };

  // Delete contact
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this contact?")) return;
    try {
      await axios.delete(`/customer/contact/delete/${id}`);
      alert("Moved to Trash");
      getLeads(page);
    } catch (error) {
      console.log("Error deleting contact", error);
    }
  };


  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="bg-gray-50 min-h-[680px] p-4">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded px-3 py-1 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
          />
          <span className="text-gray-600 text-sm">
            Total Records {totalCount}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => openModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow w-full sm:w-auto"
          >
            Create contact
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
          if (key === "actions") {
            return (
              <div className="flex gap-2">
                <button
                  onClick={() => openModal(row)}
                  className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(row.id)}
                  className="p-1 text-red-600 hover:bg-red-100 rounded"
                >
                  <Trash size={16} />
                </button>
             
              </div>
            );
          }

          return row[key];
        }}
      />

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
        <span>{limit} Records Per Page</span>
        <div className="flex items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
            <button
              onClick={() => closeModal()}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X />
            </button>
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? "Edit contact" : "Create New contact"}
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {[
                { label: "Name", key: "name" },
                { label: "Description", key: "description" },
                { label: "Email", key: "email", type: "email" },
                { label: "Phone", key: "phone", type: "tel" },
                { label: "Source", key: "source" },
                { label: "Priority", key: "priority" },
                { label: "Amount", key: "amount" },
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
                {editingId ? "Update contact" : "Save contact"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default contacts;
