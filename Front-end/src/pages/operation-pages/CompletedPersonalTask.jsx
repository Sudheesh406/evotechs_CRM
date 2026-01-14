import React, { useEffect, useState } from "react";
import axios from "../../instance/Axios";
import Table2 from "../../components/Table2";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Phone, Download } from "lucide-react";

export default function CompletedPersonalTask() {
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
    // { key: "staffName", label: "Staff Name" },
    { key: "priority", label: "Priority" },
    { key: "source", label: "Source" },
    // { key: "status", label: "Status" },
    { key: "action", label: "Action" }, 
  ];

  const getCompletedTask = async () => {
    try {
      const res = await axios.get(`/completed/staff/get?page=${currentPage}&limit=20`);
      const tasks = res.data.data.map((t) => ({
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
        reject: t.reject
      }));

      setReworks(tasks);
      setTotalPages(res.data.pagination?.totalPages || 1);

    } catch (error) {
      Swal.fire("Error", "Failed to get completed tasks.", "error");
      console.error("Error found in get completed tasks", error);
    }
  };



  const handleBankRejection = async(data)=>{
    try {
      const id = data.id
      const response = await axios.patch('/Completed/reject',{id})
      if(response){
          getCompletedTask();
      }
    } catch (error) {
      console.error('error',error)
    }
  }

  useEffect(() => {
    getCompletedTask();
  }, [currentPage]);

  const renderCell = (key, row) => {
    if (key === "date") {
      return (
        <span className={`px-2 py-1 rounded-full text-sm font-medium ${row.dateColor}`}>
          {row.date}
        </span>
      );
    }

    if(key === "status"){
      return (
        <span className={`px-2 py-1 rounded-full text-sm text-red-500 font-medium ${row.status}`}>
          {row.status}
        </span>
      );
    }

    if (key === "action") {
      if (row.reject) {
        return (
          <span className="text-red-500 font-semibold">Rejected</span>
        );
      }

      return (
        <button
          onClick={(e) => {
            e.stopPropagation(); 
            handleBankRejection(row);
          }}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Reject
        </button>
      );
    }

    return row[key];
  };

  const role = true
  const handleRowClick = (row) => {
    const payload = { taskId: row.id, contactId: row.contactId , role};
    const dataToSend = encodeURIComponent(JSON.stringify(payload));
    navigate(`/activities/tasks/team/${dataToSend}`);
  };

  const handleDownload = () => {
    if (reworks.length === 0) {
      Swal.fire({
        icon: "info",
        title: "No Data",
        text: "There are no completed tasks to download.",
      });
      return;
    }

    // Set orientation to landscape to fit 11 columns
    const doc = new jsPDF({ orientation: "landscape" });

    // Document Title and Info
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text("Completed Personal Tasks Report", 14, 15);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Page ${currentPage} | Total Pages: ${totalPages}`, 14, 22);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 27);

    // Prepare headers (excluding 'Action' column)
    const tableColumn = columns
      .filter(col => col.key !== "action")
      .map(col => col.label);

    // Prepare body data (matching the filtered columns)
    const tableRows = reworks.map(row => [
      row.date,
      row.customerName,
      row.customerPhone,
      row.amount,
      row.stage,
      row.requirement,
      row.finishBy,
      // row.staffName,
      row.priority,
      row.source,
      // row.status
    ]);

    // Create the table
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'striped',
      styles: { fontSize: 7.5, cellPadding: 2 },
      headStyles: { 
        fillColor: [22, 163, 74], // Green-600 to match 'Completed' theme
        textColor: 255,
        halign: 'center' 
      },
      columnStyles: {
        5: { cellWidth: 45 }, // Requirement column gets more room
        10: { halign: 'center' } // Status column
      },
      // Styling logic for the PDF cells
      didParseCell: (data) => {
        // Highlight Status column
        if (data.column.index === 10) { 
           data.cell.styles.fontStyle = 'bold';
           data.cell.styles.textColor = [22, 163, 74]; // Green text
        }
      }
    });

    const fileName = `Completed_Tasks_Page_${currentPage}_${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(fileName);
    
    Swal.fire({
      icon: "success",
      title: "Download Started",
      text: "Your PDF is being generated.",
      timer: 1500,
      showConfirmButton: false
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Completed Task</h1>
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