import React, { useState, useEffect } from "react";
import { Phone, Edit, Trash } from "lucide-react";
import DataTable from "../../components/Table2";
import axios from "../../instance/Axios";
import Swal from "sweetalert2";
import ContactModal from "../../components/modals/ContactModal";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast"; // Ensure toast is imported

const Contacts = () => {
  const [leads, setLeads] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [formData, setFormData] = useState({
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
  const [errors, setErrors] = useState({});

  const columns = [
    {
      label: "Contact Name",
      key: "name",
      className: "font-medium text-gray-800",
    },
    { label: "Created Date", key: "displayDate" }, // 👈 Added Date column
    { label: "Description", key: "description" },
    {
      label: "Email",
      key: "email",
      className: "text-indigo-600 hover:underline cursor-pointer",
    },
    { label: "Phone", key: "phone" },
    { label: "Location", key: "location" },
    { label: "Purpose", key: "purpose" },
    { label: "Contact Source", key: "source" },
    { label: "Priority", key: "priority" },
    { label: "Amount", key: "amount" },
    { label: "Actions", key: "actions" },
  ];

  // ✅ Fetch contacts
  const getLeads = async (pageNo = 1, search = "") => {
    try {
      const response = await axios.get(
        `/customer/contact/get?page=${pageNo}&limit=${limit}&search=${search}`,
      );
      if (response.data && response.data.data) {
        const { leads, total } = response.data.data;

        // 👉 Format date for each lead
        leads.forEach((lead) => {
          lead.displayDate = lead.createdAt
            ? new Date(lead.createdAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "N/A";
        });

        setLeads(leads || []);
        setTotalCount(total || 0);
      }
    } catch (error) {
      console.log("Error fetching contacts", error);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      getLeads(page, searchTerm);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [page, searchTerm]);

  // ✅ Handle Download PDF
  const handleDownload = () => {
    if (leads.length === 0) {
      toast.error("No data available to download");
      return;
    }

    const doc = new jsPDF({ orientation: "landscape" });

    doc.setFontSize(16);
    doc.text("Contacts List", 14, 15);
    doc.setFontSize(10);
    doc.text(
      `Total Records: ${totalCount} | Generated on: ${new Date().toLocaleDateString()}`,
      14,
      22,
    );

    // Added Date to PDF columns
    const tableColumn = [
      "Name",
      "Created Date",
      "Description",
      "Email",
      "Phone",
      "Location",
      "Purpose",
      "Source",
      "Priority",
      "Amount",
    ];
    const tableRows = leads.map((lead) => [
      lead.name,
      lead.displayDate, // 👈 Added to PDF rows
      lead.description,
      lead.email,
      lead.phone,
      lead.location,
      lead.purpose,
      lead.source,
      lead.priority,
      lead.amount,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [79, 70, 229] },
    });

    const fileName = `Contact_List_${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(fileName);
    toast.success("Downloading PDF list...");
  };

  // ✅ Open modal (edit or create)
  const openModal = (contact = null) => {
    if (contact) {
      setEditingId(contact.id);
      const leadData = {
        name: contact.name || "",
        description: contact.description || "",
        email: contact.email || "",
        phone: contact.phone || "",
        location: contact.location || "",
        purpose: contact.purpose || "",
        source: contact.source || "",
        priority: contact.priority || "",
        amount: contact.amount || "",
      };
      setFormData(leadData);
      setOriginalData(leadData);
    } else {
      setEditingId(null);
      setFormData({
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
      setOriginalData(null);
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setErrors({});
  };

  // ✅ Create or Update
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (key !== "email" && !formData[key].trim()) {
        newErrors[key] = "This field is required";
      }
    });
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (
      editingId &&
      JSON.stringify(formData) === JSON.stringify(originalData)
    ) {
      Swal.fire({
        title: "No changes!",
        text: "You didn't modify any fields.",
        icon: "info",
      });
      return;
    }

    try {
      if (editingId) {
        await axios.put(`/customer/contact/update/${editingId}`, formData);
        Swal.fire("Updated!", "Contact updated successfully.", "success");
      } else {
        await axios.post("/customer/contact/create", formData);
        Swal.fire("Created!", "Contact created successfully.", "success");
      }

      closeModal();
      getLeads(page);
    } catch (error) {
      if (error.response?.status === 409) {
        Swal.fire(
          "Error!",
          "This contact already exists. Please check contacts and trash.",
          "error",
        );
      } else {
        Swal.fire("Error!", "Something went wrong while saving.", "error");
      }
    }
  };

  // ✅ Delete contact
  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This contact will be moved to Trash!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`/customer/contact/delete/${id}`);
          Swal.fire(
            "Deleted!",
            "The contact has been moved to Trash.",
            "success",
          );
          getLeads(page);
        } catch (error) {
          if (error.response?.status === 406) {
            Swal.fire(
              "Error!",
              "A Task is created in this contact. Please delete that permanently first.",
              "error",
            );
          } else {
            Swal.fire(
              "Error!",
              "Something went wrong while deleting.",
              "error",
            );
          }
        }
      }
    });
  };

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="bg-gray-50 min-h-[680px] p-4">
      {/* 🔍 Search + Create bar */}
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
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleDownload}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow w-full sm:w-auto transition-colors"
          >
            Download
          </button>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition-colors"
          >
            Create Contact
          </button>
        </div>
      </div>

      {/* 📊 Data Table */}
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
      <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-800">{limit}</span>
          <span>Records Per Page</span>
        </div>

        <div className="flex items-center gap-1">
          {/* Previous Button */}
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 transition-colors"
          >
            Prev
          </button>

          {/* Dynamic Page Number Buttons */}
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-1 border rounded min-w-[32px] transition-all ${
                    page === pageNum
                      ? "bg-indigo-600 text-white border-indigo-600 font-bold shadow-sm"
                      : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                  }`}
                >
                  {pageNum}
                </button>
              ),
            )}
          </div>

          {/* Next Button */}
          <button
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 transition-colors"
          >
            Next
          </button>
        </div>
      </div>

      {/* 🧱 Modal Component */}
      {isModalOpen && (
        <ContactModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSubmit={handleSubmit}
          formData={formData}
          errors={errors}
          handleChange={(e) => {
            const { name, value } = e.target;
            let newValue = value;
            if (name === "phone" || name === "amount") {
              newValue = value.replace(/[^0-9]/g, "");
            }
            setFormData((prev) => ({ ...prev, [name]: newValue }));
            setErrors((prev) => ({
              ...prev,
              [name]: newValue.trim() === "" ? "This field is required" : "",
            }));
          }}
          editingId={editingId}
        />
      )}
    </div>
  );
};

export default Contacts;
