import React, { useEffect, useState } from "react";
import axios from "../../instance/Axios";
import Table2 from "../../components/Table2";
import Swal from "sweetalert2";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Phone, Download } from "lucide-react";

export default function TeamLeads() {
  const [teamLeads, setTeamLeads] = useState([]);
  const [user, setUser] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 50; // per page

  const getTeamLeads = async (page = 1) => {
    try {
      const response = await axios.get(
        `/team/leads/get?page=${page}&limit=${limit}`
      );
      const leads = response.data?.leads || [];
      const userId = response.data?.userId;
      setUser(userId);
      setTotalPages(response.data?.totalPages || 1);
      setCurrentPage(response.data?.currentPage || 1);

      const transformedLeads = leads.map((lead) => ({
        staffId: lead.assignedStaff?.id,
        date: new Date(lead.createdAt).toLocaleDateString(),
        customerName: lead.name,
        amount: lead.amount,
        priority: lead.priority || "Normal",
        email: lead.email,
        phone: lead.phone,
        location: lead.location,
        purpose: lead.purpose,
        followerName: lead.assignedStaff?.name || "-",
        followerEmail: lead.assignedStaff?.email || "-",
      }));

      setTeamLeads(transformedLeads);
    } catch (error) {
      console.log("Error fetching team leads:", error);
    }
  };

  useEffect(() => {
    getTeamLeads(currentPage);
  }, [currentPage]);

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

  const handleDownload = () => {
    if (teamLeads.length === 0) {
      Swal.fire({
        icon: "info",
        title: "No Data",
        text: "There are no team leads to download.",
      });
      return;
    }

    const doc = new jsPDF({ orientation: "landscape" });

    // Document Styling
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text("Team Leads Report", 14, 15);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(
      `Page ${currentPage} of ${totalPages} | Generated: ${new Date().toLocaleString()}`,
      14,
      22
    );

    // Prepare table headers and data
    const tableColumn = columns.map((col) => col.label);
    const tableRows = teamLeads.map((row) => [
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
      theme: "grid",
      styles: { fontSize: 7, cellPadding: 2 }, // Small font for 10 columns
      headStyles: {
        fillColor: [59, 130, 246], // Blue-500
        textColor: 255,
        halign: "center",
      },
      columnStyles: {
        1: { cellWidth: 30 }, // Customer Name
        7: { cellWidth: 35 }, // Purpose
        9: { cellWidth: 35 }, // Follower Email
      },
      // Highlight Priority
      didParseCell: (data) => {
        if (data.column.index === 3 && data.cell.raw === "High") {
          data.cell.styles.textColor = [220, 38, 38]; // Red for High priority
          data.cell.styles.fontStyle = "bold";
        }
      },
    });

    doc.save(`Team_Leads_Page_${currentPage}.pdf`);

    Swal.fire({
      icon: "success",
      title: "Success",
      text: "PDF downloaded successfully",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-black">Team Leads</h1>
        <button
          onClick={handleDownload}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow flex items-center gap-2 transition-colors font-medium"
        >
          <Download size={18} />
          Download
        </button>
      </div>
      <Table2 columns={columns} data={teamLeads} currentStaffId={user} />

      {/* Pagination Controls */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-lg ${
            currentPage === 1 ? "bg-gray-300" : "bg-blue-500 hover:bg-blue-600"
          } text-white`}
        >
          Prev
        </button>
        <span className="text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-lg ${
            currentPage === totalPages
              ? "bg-gray-300"
              : "bg-blue-500 hover:bg-blue-600"
          } text-white`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
