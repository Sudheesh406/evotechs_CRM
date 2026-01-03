import { useEffect, useState } from "react";
import axios from "../../../instance/Axios";
import Table2 from "../../../components/Table2";
import { useNavigate } from "react-router-dom";
import { Download } from "lucide-react"; // Import icon
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";

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

export default function StaffPendingTask() {
  const [pendingWorks, setPendingWorks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const getPendingWork = async (page = 1) => {
    try {
      const response = await axios.get(`/pending/admin/task/get?page=${page}&limit=20`);
      const mapped = response.data.data.data.map((item) => ({
        id: item.id,
        staffId: item.staff?.id,
        contactId: item.customer?.id,
        date: new Date(item.createdAt).toLocaleDateString(),
        customerName: item.name ?? item.customer?.name,
        customerPhone: item.phone ?? item.customer?.phone,
        amount: item.amount ?? item.customer?.amount,
        stage: item.stage,
        requirement: item.requirement,
        finishBy: new Date(item.finishBy).toLocaleDateString(),
        staffName: item.staff?.name,
        priority: item.priority,
        source: item?.customer?.source,
      }));

      setPendingWorks(mapped);
      setTotalPages(response.data.data.totalPages);
      setCurrentPage(response.data.data.currentPage);
    } catch (error) {
      console.log("error found in getPendingWork", error);
    }
  };

  useEffect(() => {
    getPendingWork();
  }, []);

  // --- PDF DOWNLOAD LOGIC ---
  const handleDownload = () => {
    if (pendingWorks.length === 0) {
      toast.error("No data available to download");
      return;
    }

    const doc = new jsPDF({ orientation: "landscape" });

    doc.setFontSize(16);
    doc.text("Pending Tasks Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

    const tableColumn = columns.map(col => col.label);
    const tableRows = pendingWorks.map((row) => [
      row.date || "-",
      row.customerName || "-",
      row.customerPhone || "-",
      row.amount || "-",
      row.stage || "-",
      row.requirement || "-",
      row.finishBy || "-",
      row.staffName || "-",
      row.priority || "-",
      row.source || "-",
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [239, 68, 68] }, // Red theme to match your page heading
    });

    doc.save(`Pending_Tasks_${new Date().toISOString().split("T")[0]}.pdf`);
    toast.success("Downloading PDF...");
  };

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
    const data = {
      taskId: row.id,
      contactId: row.contactId,
      staffId: row.staffId,
      pending: true,
      completed: false,
    };
    const dataToSend = encodeURIComponent(JSON.stringify({ data }));
    navigate(`/activities/task/port/${dataToSend}`);
  };

  return (
    <div className="p-6 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-red-500">Pendings</h1>
        <button
          onClick={handleDownload}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow flex items-center gap-2 transition-colors"
        >
          <Download size={16} />
          Download
        </button>
      </div>

      <Table2
        columns={columns}
        data={pendingWorks}
        renderCell={renderCell}
        onRowClick={handleRowClick}
      />

      {/* Pagination Controls */}
      <div className="flex justify-center items-center gap-3 mt-6">
        <button
          className="px-4 py-2 rounded-lg font-medium text-white bg-gradient-to-r from-indigo-500 to-blue-500 shadow hover:opacity-90 disabled:opacity-40"
          onClick={() => getPendingWork(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Prev
        </button>
        <span className="text-gray-700 font-medium">
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="px-4 py-2 rounded-lg font-medium text-white bg-gradient-to-r from-indigo-500 to-blue-500 shadow hover:opacity-90 disabled:opacity-40"
          onClick={() => getPendingWork(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}