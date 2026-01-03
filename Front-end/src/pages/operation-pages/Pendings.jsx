import React, { useEffect, useState } from "react";
import axios from "../../instance/Axios";
import Table2 from "../../components/Table2";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Phone, Download } from "lucide-react";


export default function Pendings() {
  const [pendingWorks, setPendingWorks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();

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
  ];

  const getPendingTask = async () => {
    try {
      const res = await axios.get(`/pending/task/get?page=${currentPage}`);
      const { tasks, totalPages } = res.data.data;
      const mapped = tasks.map((t) => ({
        id: t.id,
        contactId: t.customer?.id,
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
      }));
      setPendingWorks(mapped);
      setTotalPages(totalPages);
    } catch (error) {
      console.error("error found in pending task", error);
      Swal.fire("Error", "Failed to get pendings.", "error");
    }
  };

  // --- NEW DOWNLOAD FUNCTION ---
const handleDownload = () => {
    if (pendingWorks.length === 0) {
      Swal.fire({
        icon: "info",
        title: "No Data",
        text: "There are no pending tasks to download.",
      });
      return;
    }

    const doc = new jsPDF({ orientation: "landscape" });

    // Title and Metadata
    doc.setFontSize(18);
    doc.setTextColor(220, 38, 38); // Red color to match your "Pendings" theme
    doc.text("Pending Tasks Report", 14, 15);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

    // Define the columns for the PDF
    const tableColumn = columns.map(col => col.label);

    // Map the data for the PDF
    const tableRows = pendingWorks.map(row => [
      row.date,
      row.customerName,
      row.customerPhone,
      row.amount,
      row.stage,
      row.requirement,
      row.finishBy,
      row.staffName,
      row.priority,
      row.source
    ]);

    // Generate the table
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [220, 38, 38] }, // Red background for header
      alternateRowStyles: { fillColor: [250, 250, 250] },
      columnStyles: {
        5: { cellWidth: 40 }, // Give more width to 'Requirement'
      },
      // Highlight the "Finish By" date in red text if you want to mirror the UI
      didParseCell: (data) => {
        if (data.column.index === 6) { // finishBy column
           data.cell.styles.textColor = [220, 38, 38];
           data.cell.styles.fontStyle = 'bold';
        }
      }
    });

    const fileName = `Pending_Tasks_${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(fileName);
    
    Swal.fire({
      icon: "success",
      title: "Downloaded",
      text: "Pending list has been saved as PDF.",
      timer: 1500,
      showConfirmButton: false
    });
  };
  // ------------------------------

  useEffect(() => {
    getPendingTask();
  }, [currentPage]);

  const renderCell = (key, row) => {
    if (key === "finishBy") {
      return (
        <span className="px-1 py-1 rounded-full text-sm font-medium bg-red-500 text-white">
          {row.finishBy}
        </span>
      );
    }
    return row[key];
  };

  const handleRowClick = (row) => {
    const data = { taskId: row.id, contactId: row.contactId };
    const dataToSend = encodeURIComponent(JSON.stringify({ data }));
    navigate(`/activities/tasks/person/${dataToSend}`);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-red-500">Pendings</h1>
        
        {/* DOWNLOAD BUTTON */}
        <button
          onClick={handleDownload}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow w-full sm:w-auto transition-colors"
          >
            Download
          </button>
      </div>

      <Table2
        columns={columns}
        data={pendingWorks}
        renderCell={renderCell}
        onRowClick={handleRowClick}
      />

      <div className="flex justify-center items-center mt-6 gap-3">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded-lg font-medium text-white bg-gradient-to-r from-indigo-500 to-blue-500 shadow hover:opacity-90 disabled:opacity-40"
        >
          Prev
        </button>

        <span className="text-gray-700 font-medium">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 rounded-lg font-medium text-white bg-gradient-to-r from-indigo-500 to-blue-500 shadow hover:opacity-90 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}