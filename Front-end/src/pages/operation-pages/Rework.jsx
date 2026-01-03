import React, { useEffect, useState } from "react";
import axios from "../../instance/Axios";
import Table2 from "../../components/Table2";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Phone, Download } from "lucide-react";

export default function Reworks() {
  const [reworks, setReworks] = useState([]);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const columns = [
    { key: "date", label: "Date" },
    { key: "customerName", label: "Customer Name" },
    { key: "customerPhone", label: "Customer Phone" },
    { key: "amount", label: "Amount" },
    { key: "stage", label: "Stage" },
    { key: "requirement", label: "Requirement" },
    { key: "finishBy", label: "Finish By" },
    { key: "staffName", label: "Staff Name" },
    { key: "priority", label: "Priority" },
    { key: "source", label: "Source" },
    { key: "status", label: "Status" },
  ];

  const getRework = async (page = 1) => {
    try {
      const res = await axios.get(`/completed/staff/rework/get?page=${page}&limit=20`);
      const { data, pagination } = res.data;

      const tasks = data.map((t) => ({
        id: t.id,
        contactId: t.customer?.id,
        newUpdate: t.newUpdate,
        date: new Date(t.createdAt).toLocaleDateString(),
        customerName: t.customer?.name || "",
        customerPhone: t.customer?.phone || "",
        amount: t.customer?.amount || "",
        stage: t.stage,
        requirement: t.requirement,
        finishBy: new Date(t.finishBy).toLocaleDateString(),
        staffName: t.staff?.name || "",
        priority: t.priority,
        source: t.customer?.source || "",
        status: t.newUpdate ? "Completed" : "Pending",
      }));

      setReworks(tasks);
      setTotalPages(pagination.totalPages);
    } catch (error) {
      Swal.fire("Error", "Failed to get reworks.", "error");
      console.error("error found in get reworks", error);
    }
  };

  // 2. Download Function
const handleDownload = () => {
    if (reworks.length === 0) {
      Swal.fire({
        icon: "info",
        title: "No Data",
        text: "There are no rework tasks to download.",
      });
      return;
    }

    // Initialize PDF in landscape to fit 11 columns
    const doc = new jsPDF({ orientation: "landscape" });

    // Header Details
    doc.setFontSize(18);
    doc.setTextColor(31, 41, 55); // Gray-800
    doc.text("Reworks Report", 14, 15);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Page ${currentPage} | Generated on: ${new Date().toLocaleString()}`, 14, 22);

    // Prepare Table Headers and Data
    const tableColumn = columns.map(col => col.label);
    const tableRows = reworks.map(row => [
      row.date,
      row.customerName,
      row.customerPhone,
      row.amount,
      row.stage,
      row.requirement,
      row.finishBy,
      row.staffName,
      row.priority,
      row.source,
      row.status
    ]);

    // Generate Table
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: 'grid',
      styles: { fontSize: 7.5, cellPadding: 2 }, // Smaller font to fit all columns
      headStyles: { 
        fillColor: [37, 99, 235], // Blue-600
        textColor: 255,
        halign: 'center' 
      },
      columnStyles: {
        5: { cellWidth: 40 }, // Requirement column gets more space
        10: { halign: 'center', fontStyle: 'bold' } // Status column
      },
      // Conditional Styling for Status
      didParseCell: (data) => {
        if (data.column.index === 10) { // Status Column
          if (data.cell.raw === "Completed") {
            data.cell.styles.textColor = [22, 163, 74]; // Green-600
          } else {
            data.cell.styles.textColor = [220, 38, 38]; // Red-600
          }
        }
      }
    });

    const fileName = `Reworks_Report_Page_${currentPage}_${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(fileName);
    
    Swal.fire({
      icon: "success",
      title: "Success",
      text: "PDF has been downloaded.",
      timer: 1500,
      showConfirmButton: false
    });
  };

  useEffect(() => {
    getRework(currentPage);
  }, [currentPage]);

  const renderCell = (key, row) => {
    if (key === "date") {
      return (
        <span className={`px-2 py-1 rounded-full text-sm font-medium ${row.dateColor}`}>
          {row.date}
        </span>
      );
    }

    if (key === "status") {
      return (
        <span className={`px-2 py-1 rounded-full text-sm font-medium ${row.newUpdate ? "text-green-600 bg-green-50" : "text-red-500 bg-red-50"}`}>
          {row.status}
        </span>
      );
    }
    return row[key];
  };

  const handleRowClick = (row) => {
    const data = { taskId: row.id, contactId: row.contactId, update: true, clear: row.newUpdate };
    const dataToSend = encodeURIComponent(JSON.stringify({ data }));
    navigate(`/activities/tasks/person/${dataToSend}`);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* 3. Header with Download Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Reworks</h1>
        <button
          onClick={handleDownload}
             className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow w-full sm:w-auto transition-colors"
          >
            Download
          </button>
      </div>

      <Table2
        columns={columns}
        data={reworks}
        renderCell={renderCell}
        onRowClick={handleRowClick}
      />

      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
          className={`px-4 py-2 rounded-lg font-medium shadow ${
            currentPage === 1
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Prev
        </button>

        <span className="text-gray-700 font-medium">
          Page {currentPage} of {totalPages || 1}
        </span>

        <button
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => setCurrentPage((prev) => prev + 1)}
          className={`px-4 py-2 rounded-lg font-medium shadow ${
            currentPage === totalPages || totalPages === 0
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}