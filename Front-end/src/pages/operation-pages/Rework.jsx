import React, { useEffect, useState } from "react";
import axios from "../../instance/Axios";
import Table2 from "../../components/Table2";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import * as XLSX from "xlsx"; // 1. Import xlsx

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
      return Swal.fire("Info", "No rework data to export.", "info");
    }
    // Remove internal IDs or unnecessary keys for the Excel file
    const exportData = reworks.map(({ id, contactId, newUpdate, ...rest }) => rest);
    
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reworks");
    XLSX.writeFile(workbook, `Reworks_Page_${currentPage}.xlsx`);
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
            Download List
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