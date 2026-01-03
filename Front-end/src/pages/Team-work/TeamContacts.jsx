import React, { useEffect, useState } from "react";
import Table2 from "../../components/Table2";
import Swal from "sweetalert2";
import axios from "../../instance/Axios";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Phone, Download } from "lucide-react";

export default function TeamContacts() {
  const [teamContacts, setTeamContacts] = useState([]);
  const [user, setUser] = useState();
  const [value, setValue] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [searchName, setSearchName] = useState("");
  const [searchPhone, setSearchPhone] = useState("");

  const getTeamContacts = async (pageNumber = 1, name = "", phone = "") => {
    try {
      let response;

      // If search is applied, send a POST with body data
      if (name || phone) {
        response = await axios.post(`/team/contacts/get/search`, {
          name,
          phone,
        });
      } else {
        // Normal paginated GET
        response = await axios.get(`/team/contacts/get?page=${pageNumber}&limit=50`);
      }

      const contacts = response.data?.contacts || [];
      const userId = response.data?.userId;
      setUser(userId);
      setTotalPages(response.data?.totalPages || 1);

      const transformedContacts = contacts.map((contact) => ({
        staffId: contact.assignedStaff?.id,
        date: new Date(contact.createdAt).toLocaleDateString(),
        customerName: contact.name,
        amount: contact.amount,
        priority: contact.priority || "Normal",
        email: contact.email,
        phone: contact.phone,
        location: contact.location,
        purpose: contact.purpose,
        followerName: contact.assignedStaff?.name || "-",
        followerEmail: contact.assignedStaff?.email || "-",
      }));

      setTeamContacts(transformedContacts);
    } catch (error) {
      console.log("Error fetching team contacts:", error);
    }
  };

  useEffect(() => {
    getTeamContacts(page);
  }, [page]);

  const columns = [
    { key: "date", label: "Date" },
    { key: "customerName", label: "Customer Name" },
    { key: "amount", label: "Amount" },
    { key: "priority", label: "Priority" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "location", label: "Location" },
    { key: "purpose", label: "Purpose" },
    { key: "followerName", label: "Follower Name" },
    { key: "followerEmail", label: "Follower Email" },
  ];

  const handleActionClick = (row) => {
    Swal.fire({
      title: "Confirm Transfer",
      text: "Do you want to reassign this customer to yourself?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, reassign",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.patch("/team/contact/reassign", {
            phone: row.phone,
            email: row.email,
            staffId: row.staffId,
          });
          Swal.fire("Reassigned!", "This customer has been reassigned to you.", "success");
          getTeamContacts(page);
        } catch (error) {
          Swal.fire("Error", "Failed to reassign the customer.", "error");
        }
      }
    });
  };

  const handleSearch = () => {
    if (searchName || searchPhone) {
      getTeamContacts(1, searchName, searchPhone);
    } else {
      getTeamContacts(1); // fallback to normal pagination
    }
  };

  const handleClearSearch = () => {
    setSearchName("");
    setSearchPhone("");
    getTeamContacts(1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };
  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleDownload = () => {
    if (teamContacts.length === 0) {
      Swal.fire({
        icon: "info",
        title: "No Data",
        text: "There are no contacts to download.",
      });
      return;
    }

    const doc = new jsPDF({ orientation: "landscape" });

    // Document Header
    doc.setFontSize(18);
    doc.setTextColor(33, 33, 33);
    doc.text("Team Contacts Report", 14, 15);
    
    // Add subtitle if search is active
    doc.setFontSize(10);
    doc.setTextColor(100);
    let subtitle = `Page ${page} of ${totalPages} | Generated: ${new Date().toLocaleString()}`;
    if (searchName || searchPhone) {
      subtitle += ` | Filtered by: ${searchName} ${searchPhone}`;
    }
    doc.text(subtitle, 14, 22);

    // Prepare table headers and body
    const tableColumn = columns.map(col => col.label);
    const tableRows = teamContacts.map(row => [
      row.date,
      row.customerName,
      row.amount,
      row.priority,
      row.email,
      row.phone,
      row.location,
      row.purpose,
      row.followerName,
      row.followerEmail,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { 
        fillColor: [75, 85, 99], // Gray-600 for a neutral contact list feel
        textColor: 255,
        halign: 'center' 
      },
      columnStyles: {
        1: { cellWidth: 30 }, // Name
        4: { cellWidth: 35 }, // Email
        7: { cellWidth: 35 }, // Purpose
        9: { cellWidth: 35 }, // Follower Email
      },
      // Color-coded priority for management review
      didParseCell: (data) => {
        if (data.column.index === 3) {
          if (data.cell.raw === "High") data.cell.styles.textColor = [220, 38, 38];
          if (data.cell.raw === "Normal") data.cell.styles.textColor = [37, 99, 235];
        }
      }
    });

    const fileName = searchName || searchPhone 
      ? `Filtered_Contacts_${new Date().getTime()}.pdf` 
      : `Team_Contacts_Page_${page}.pdf`;
      
    doc.save(fileName);
    
    Swal.fire({
      icon: "success",
      title: "Exported",
      text: "Contacts list has been saved as PDF",
      timer: 1500,
      showConfirmButton: false
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
<div className="flex justify-between items-center mb-6">
  <h1 className="text-xl font-semibold text-black">Team Contacts</h1>
  <button
    onClick={handleDownload}
    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow flex items-center gap-2 transition-colors"
  >
    <Download size={18} />
    Download
  </button>
</div>
      {/* 🔍 Search Bar */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by Name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="border rounded px-3 py-2 w-60"
        />
        <input
          type="text"
          placeholder="Search by Phone"
          value={searchPhone}
          onChange={(e) => setSearchPhone(e.target.value)}
          className="border rounded px-3 py-2 w-60"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Search
        </button>
        <button
          onClick={handleClearSearch}
          className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
        >
          Clear
        </button>
      </div>

      {/* Table */}
      <Table2
        columns={columns}
        data={teamContacts}
        currentStaffId={user}
        onActionClick={handleActionClick}
        value={value}
      />

      {/* Pagination */}
      <div className="flex justify-center items-center mt-6 space-x-4">
        <button
          onClick={handlePrev}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-300 text-black rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-gray-700">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={page === totalPages}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
