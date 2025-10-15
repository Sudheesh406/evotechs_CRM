import React, { useState, useEffect } from "react";
import { ChevronDown, Phone, X, Edit, Trash, CheckCircle } from "lucide-react";
import DataTable from "../../components/Table2";
import axios from "../../instance/Axios";
import Swal from "sweetalert2";

const LeadRejected = () => {
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
    location: "",
    source: "",
    priority: "",
    amount: "",
  });
  const [errors, setErrors] = useState({});

  const columns = [
    { label: "Lead Name", key: "name", className: "font-medium text-gray-800" },
    { label: "Description", key: "description" },
    {
      label: "Email",
      key: "email",
      className: "text-indigo-600 hover:underline cursor-pointer",
    },
    { label: "Phone", key: "phone" },
    { label: "Location", key: "location" },
    { label: "Lead Source", key: "source" },
    { label: "Priority", key: "priority" },
    { label: "Amount", key: "amount" },
    { label: "Actions", key: "actions" },
  ];

  // Fetch leads
  const getLeads = async (pageNo = 1, search = "") => {
    try {
      const response = await axios.get(
        `/customer/reject/lead/get?page=${pageNo}&limit=${limit}&search=${search}`
      );
      if (response.data && response.data.data) {
        const { leads, total } = response.data.data;
        leads.forEach((lead) => {
          if (lead.priority === "WaitingPeriod")
            lead.priority = "Waiting Period";
          else if (lead.priority === "NoUpdates") lead.priority = "No Updates";
          else if (lead.priority === "NotAnClient")
            lead.priority = "Not a Client";
        });
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
  const openModal = (lead = null) => {
    if (lead) {
      setEditingId(lead.id);
      const leadData = {
        name: lead.name || "",
        description: lead.description || "",
        email: lead.email || "",
        phone: lead.phone || "",
        location: lead.location || "",
        source: lead.source || "",
        priority: lead.priority || "",
        amount: lead.amount || "",
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
        location: "",
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

    if (name !== "email" && name !== "priority") {
      setErrors((prev) => ({
        ...prev,
        [name]: newValue.trim() === "" ? "This field is required" : "",
      }));
    } else {
      // Clear error if previously set
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      // Skip validation for email and priority
      if (key !== "email" && key !== "priority" && !formData[key].trim()) {
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
      Swal.fire({
        title: "No changes!",
        text: "You didn't modify any fields.",
        icon: "info",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    try {
      if (editingId) {
        await axios.put(`/customer/lead/update/${editingId}`, formData);
        // ✅ SweetAlert after successful edit
        Swal.fire({
          title: "Updated!",
          text: "Lead has been successfully updated.",
          icon: "success",
          confirmButtonColor: "#3085d6",
        });
      } else {
        await axios.post("/customer/lead/create", formData);

        Swal.fire({
          title: "Created!",
          text: "Lead has been successfully created.",
          icon: "success",
          confirmButtonColor: "#3085d6",
        });
      }

      // Reset form & close modal
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({
        name: "",
        description: "",
        email: "",
        phone: "",
        location: "",
        source: "",
        priority: "",
        amount: "",
      });
      setOriginalData(null);
      getLeads(page);
    } catch (error) {
      console.log("error found in save", error);

      // Check for specific status
      if (error.response?.status === 409) {
        // use error.response.status for axios
        Swal.fire({
          title: "Error!",
          text: "This record already exists. Please check leads and trash.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
        return; // exit so the generic alert doesn't show
      }

      // Generic error
      Swal.fire({
        title: "Error!",
        text: "Something went wrong while saving.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  };

  // Delete Lead
  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This lead will be moved to Trash!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`/customer/lead/delete/${id}`);

          Swal.fire({
            title: "Deleted!",
            text: "The lead has been moved to Trash.",
            icon: "success",
            confirmButtonColor: "#3085d6",
          });

          getLeads(page); // refresh the list
        } catch (error) {
          console.log("Error deleting lead", error);

          Swal.fire({
            title: "Error!",
            text: "Something went wrong while deleting.",
            icon: "error",
            confirmButtonColor: "#d33",
          });
        }
      }
    });
  };

  const handleApprove = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Approve this lead?",
        text: "This will convert the lead into a contact.",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, approve it!",
      });

      if (result.isConfirmed) {
        // Wait for the API to finish so errors can be caught
        await axios.patch(`/customer/lead/confirm/${id}`);
        // Refresh your list
        getLeads(page);

        // Optional success message
        Swal.fire(
          "Approved!",
          "The lead has been converted into a contact.",
          "success"
        );
      }
    } catch (error) {
      if (error?.response?.status === 400) {
        Swal.fire({
          title: "Already Exists",
          text: "This record already exists. Please check contacts and trash.",
          icon: "error",
          confirmButtonText: "OK",
        });
      } else {
        console.error("error found in handleApprove", error);
        Swal.fire("Error", "Something went wrong.", "error");
      }
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
          {/* <button
            onClick={() => openModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow w-full sm:w-auto"
          >
            Create Lead
          </button> */}
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
                {/* <button
                  onClick={() => handleApprove(row.id)}
                  className=" p-1 text-green-600 rounded hover:bg-green-200"
                >
                  <CheckCircle size={16} />
                </button> */}
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
      {/* Modal */}{" "}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 overflow-y-auto">
          {" "}
          <div className="bg-white rounded-lg w-[95%] sm:w-full max-w-3xl p-6 mt-10 mb-10 relative overflow-y-auto max-h-[90vh]">
            {" "}
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              {" "}
              <X />{" "}
            </button>{" "}
            <h2 className="text-xl font-semibold mb-4">
              {" "}
              {editingId ? "Edit Lead" : "Create New Lead"}{" "}
            </h2>{" "}
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {" "}
              {[
                { label: "Name", key: "name" },
                { label: "Description", key: "description" },
                { label: "Email", key: "email", type: "email" },
                { label: "Phone", key: "phone", type: "tel" },
                { label: "Location", key: "location" },
                { label: "Source", key: "source" },
                { label: "Priority", key: "priority" },
                { label: "Amount", key: "amount" },
              ].map((field) => (
                <div key={field.key} className="flex flex-col">
                  {" "}
                  <label className="text-gray-700">{field.label}</label>{" "}
                  {field.key === "priority" ? (
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className={`border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.priority ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      {" "}
                      <option value="">Select Priority</option>{" "}
                      <option value="WaitingPeriod">Waiting Period</option>{" "}
                      <option value="NoUpdates">No Updates</option>{" "}
                      <option value="Client">Client</option>{" "}
                      <option value="NotAnClient">Not a Client</option>{" "}
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
                  )}{" "}
                  {errors[field.key] && (
                    <span className="text-red-500 text-sm mt-1">
                      {" "}
                      {errors[field.key]}{" "}
                    </span>
                  )}{" "}
                </div>
              ))}{" "}
              <div className="col-span-1 md:col-span-2 flex justify-end mt-4">
                {" "}
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  {" "}
                  {editingId ? "Update Lead" : "Save Lead"}{" "}
                </button>{" "}
              </div>{" "}
            </form>{" "}
          </div>{" "}
        </div>
      )}
    </div>
  );
};

export default LeadRejected;
