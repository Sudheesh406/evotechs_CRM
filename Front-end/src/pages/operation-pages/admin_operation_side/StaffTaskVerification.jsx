import { useEffect, useState } from "react";
import axios from "../../../instance/Axios";
import Table2 from "../../../components/Table2";
import { useNavigate } from "react-router-dom";
import { Download } from "lucide-react"; // Added
import { jsPDF } from "jspdf"; // Added
import autoTable from "jspdf-autotable"; // Added
import toast from "react-hot-toast"; // Added

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

function StaffTaskVerification() {
  const [completedWorks, setCompletedWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const getCompletedWork = async (page = 1) => {
    try {
      const response = await axios.get(`/completed/resolved/get?page=${page}&limit=20`);

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

      setCompletedWorks(mapped);
      setTotalPages(response.data.data.totalPages);
      setCurrentPage(response.data.data.currentPage);
    } catch (error) {
      console.log("error found in getCompletedWork", error);
    } finally {
      setLoading(false);
    }
  };

  // --- PDF DOWNLOAD LOGIC ---
  const handleDownload = () => {
    if (completedWorks.length === 0) {
      toast.error("No data available to download");
      return;
    }

    const doc = new jsPDF({ orientation: "landscape" });

    doc.setFontSize(16);
    doc.text("Resolved Works Verification Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Page ${currentPage} | Date: ${new Date().toLocaleDateString()}`, 14, 22);

    const tableColumn = columns.map(col => col.label);
    const tableRows = completedWorks.map((row) => [
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
      headStyles: { fillColor: [13, 148, 136] }, // Teal theme for Resolved tasks
    });

    doc.save(`Resolved_Works_Page_${currentPage}.pdf`);
    toast.success("Downloading PDF...");
  };

  useEffect(() => {
    getCompletedWork();
  }, []);

  const renderCell = (key, row) => {
    if (key === "date") {
      return (
        <span className={`px-2 py-1 rounded-full text-sm font-medium ${row.dateColor}`}>
          {row.date}
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
      pending: false,
      completed: true,
      resolve: true,
    };
    const dataToSend = encodeURIComponent(JSON.stringify({ data }));
    navigate(`/activities/task/port/${dataToSend}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 ">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Resolved Works</h1>
        <button
          onClick={handleDownload}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow flex items-center gap-2 transition-colors"
        >
          <Download size={16} />
          Download
        </button>
      </div>

      {completedWorks.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-400 text-lg font-medium">No Data Found</p>
        </div>
      ) : (
        <>
          <Table2
            columns={columns}
            data={completedWorks}
            renderCell={renderCell}
            onRowClick={handleRowClick}
          />

          {/* Pagination Controls */}
          <div className="flex justify-center items-center gap-3 mt-6">
            <button
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              onClick={() => getCompletedWork(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <span className="text-gray-700 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              onClick={() => getCompletedWork(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default StaffTaskVerification;