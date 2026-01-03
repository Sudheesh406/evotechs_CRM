import React, { useEffect, useState } from "react";
import Table2 from "../../components/Table2";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../instance/Axios";
import Swal from "sweetalert2";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Phone, Download } from "lucide-react";

const columns = [
  { key: "date", label: "Date" },
  { key: "customer", label: "Customer Name" },
  { key: "amount", label: "Amount" },
  { key: "finishBy", label: "Target Date" },
  { key: "priority", label: "Priority" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "staff", label: "Follower Name" },
  { key: "staffEmail", label: "Follower Email" },
];

export default function TeamWorkDetails() {
  const { data } = useParams();
  const navigate = useNavigate();
  const parsedData = JSON.parse(decodeURIComponent(data));
  const projectName = parsedData.projectName;
  const [role, setRole] = useState(false)

  const [works, setWorks] = useState([]);

  const getProject = async () => {
  // Show loading alert
  Swal.fire({
    title: "Getting Projects...",
    didOpen: () => {
      Swal.showLoading();
    },
    allowOutsideClick: false,
  });

  try {
    const response = await axios.post("/team/projects/post", { parsedData });

    if (response?.data?.tasks) {
      const tableData = response.data.tasks.map((task) => ({
        date: new Date(task.createdAt).toLocaleDateString(),
        id: task.id,
        contactId: task.customer?.id ?? "",
        customer: task.customer?.name ?? "",
        amount: task.customer?.amount ?? "",
        finishBy: task.finishBy,
        priority: task.priority,
        email: task.customer?.email ?? "",
        phone: task.phone ?? "",
        staff: task.staff?.name ?? "",
        staffEmail: task.staff?.email ?? "",
      }));

      if (response.data?.admin) {
        setRole(true);
      }

      setWorks(tableData);
    }

    // Close loading and optionally show success
    Swal.close();
    // Optional success toast
    // Swal.fire({ icon: 'success', title: 'Projects fetched successfully!', toast: true, timer: 1500, position: 'top-end', showConfirmButton: false });
  } catch (error) {
    console.error("error found in get project", error);
    Swal.fire('Error', 'Failed to get projects. Please try again.', 'error');
  }
};


const handleDownload = () => {
    if (works.length === 0) {
      Swal.fire({
        icon: "info",
        title: "No Data",
        text: "There are no tasks in this project to download.",
      });
      return;
    }

    const doc = new jsPDF({ orientation: "landscape" });

    // Document Header
    doc.setFontSize(18);
    doc.setTextColor(31, 41, 55); // Gray-800
    doc.text(`Project: ${projectName}`, 14, 15);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Report Generated: ${new Date().toLocaleString()}`, 14, 22);
    doc.text(`Total Tasks: ${works.length}`, 14, 27);

    // Map the columns and data
    const tableColumn = columns.map(col => col.label);
    const tableRows = works.map(row => [
      row.date,
      row.customer,
      row.amount,
      row.finishBy,
      row.priority,
      row.email,
      row.phone,
      row.staff,
      row.staffEmail,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { 
        fillColor: [79, 70, 229], // Indigo-600 to match a professional "Project" feel
        textColor: 255,
        halign: 'center' 
      },
      columnStyles: {
        1: { cellWidth: 40 }, // Customer Name
        5: { cellWidth: 40 }, // Email
        8: { cellWidth: 40 }, // Staff Email
      },
      // Conditional formatting for Priority
      didParseCell: (data) => {
        if (data.column.index === 4) { // Priority column
          const val = data.cell.raw;
          if (val === "High") data.cell.styles.textColor = [220, 38, 38]; // Red
          if (val === "Normal") data.cell.styles.textColor = [37, 99, 235]; // Blue
        }
      }
    });

    doc.save(`Project_${projectName.replace(/\s+/g, '_')}_Report.pdf`);
    
    Swal.fire({
      icon: "success",
      title: "Generated",
      text: "The project report has been downloaded.",
      timer: 1500,
      showConfirmButton: false
    });
  };

  useEffect(() => {
    getProject();
  }, []);

  const renderCell = (key, row) => {
    if (key === "date") {
      return (
        <span className="px-2 py-1 rounded-full text-sm font-medium">
          {row.date}
        </span>
      );
    }
    return row[key];
  };

  const handleRowClick = (row) => {
    const payload = { taskId: row.id, contactId: row.contactId , role};
    const dataToSend = encodeURIComponent(JSON.stringify(payload));
    navigate(`/activities/tasks/team/${dataToSend}`);
  };

  return (
   <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-gray-800">{projectName}</h1>
        <button
          onClick={handleDownload}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow flex items-center gap-2 transition-colors font-medium"
        >
          <Download size={18} />
          Download
        </button>
      </div>

      <Table2
        columns={columns}
        data={works}
        renderCell={renderCell}
        onRowClick={handleRowClick}
      />
    </div>
  );
}
