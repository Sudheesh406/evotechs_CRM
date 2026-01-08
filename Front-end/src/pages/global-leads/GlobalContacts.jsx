import React, { useState, useEffect } from "react";
import { Phone, Download } from "lucide-react";
import DataTable from "../../components/Table2";
import axios from "../../instance/Axios";
import toast from "react-hot-toast";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const GlobalContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const limit = 10;

  const columns = [
    {
      label: "Contact Name",
      key: "name",
      className: "font-medium text-gray-800",
    },
    { label: "Created Date", key: "displayDate" }, // 👈 Added Date column
    { label: "Description", key: "description" },
    { label: "Email", key: "email", className: "text-indigo-600" },
    { label: "Phone", key: "phone" },
    { label: "Location", key: "location" },
    { label: "Purpose", key: "purpose" },
    { label: "Contact Source", key: "source" },
    { label: "Follower Name", key: "followerName" },
    { label: "Role", key: "role" },
    { label: "Priority", key: "priority" },
    { label: "Amount", key: "amount" },
  ];

  const getContacts = async (pageNo = 1, search = "") => {
    try {
      const response = await axios.get(
        `/customer/contact/global/get?page=${pageNo}&limit=${limit}&search=${search}`
      );

      if (response.data?.data) {
        const { contacts: apiContacts, total } = response.data.data;

        // Map contacts and extract followerName, role, and formatted displayDate
        const formattedContacts = apiContacts.map((contact) => {
          // 👉 Format Date to "30 Oct 2025"
          const displayDate = contact.createdAt
            ? new Date(contact.createdAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "-";

          return {
            ...contact,
            displayDate, // 👈 Added formatted date
            followerName: contact.assignedStaff?.name || "-",
            role: contact.assignedStaff?.role || "-",
            priority: contact.priority || "-",
          };
        });

        setContacts(formattedContacts);
        setTotalCount(total || 0);
      }
    } catch (error) {
      console.error("Error fetching contacts", error);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      getContacts(page, searchTerm);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [page, searchTerm]);

  const handleDownload = () => {
    if (contacts.length === 0) {
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
      22
    );

    // Added "Date" to tableColumn
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

    const tableRows = contacts.map((contact) => [
      contact.name || "-",
      contact.displayDate || "-", // 👈 Added formatted date to rows
      contact.description || "-",
      contact.email || "-",
      contact.phone || "-",
      contact.location || "-",
      contact.purpose || "-",
      contact.source || "-",
      contact.priority || "-",
      contact.amount || "-",
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [79, 70, 229] },
    });

    const fileName = `Contacts_List_${
      new Date().toISOString().split("T")[0]
    }.pdf`;
    doc.save(fileName);
    toast.success("Downloading PDF list...");
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
            Total Records: {totalCount}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownload}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow w-full sm:w-auto flex items-center justify-center gap-2 transition-colors"
          >
            <Download size={16} />
            Download
          </button>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={contacts}
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

          if (key === "followerName") {
            return (
              <span className="text-gray-700 font-medium">
                {row.followerName || "-"}
              </span>
            );
          }

          if (key === "role") {
            const roleColor = row.role === "admin" ? "bg-red-300" : "bg-blue-300";
            return (
              <span className={`inline-block px-2 py-1 text-xs font-medium ${roleColor} text-indigo-700 rounded-full`}>
                {row.role || "-"}
              </span>
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
    </div>
  );
};

export default GlobalContacts;