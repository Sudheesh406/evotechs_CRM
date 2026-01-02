import React, { useEffect, useState } from "react";
import axios from "../../instance/Axios";
import Table2 from "../../components/Table2";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import * as XLSX from "xlsx"; 

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
    { key: "staffName", label: "Staff Name" },
    { key: "priority", label: "Priority" },
    { key: "source", label: "Source" },
    { key: "status", label: "Status" },
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

  const handleDownload = () => {
    if (reworks.length === 0) {
      return Swal.fire("Info", "No completed tasks to export.", "info");
    }

    // Define exactly what columns appear in the Excel file
    const exportData = reworks.map((row) => ({
      "Date": row.date,
      "Customer Name": row.customerName,
      "Customer Phone": row.customerPhone,
      "Amount": row.amount,
      "Stage": row.stage,
      "Requirement": row.requirement,
      "Finish By": row.finishBy,
      "Staff Name": row.staffName,
      "Priority": row.priority,
      "Source": row.source,
      "Status": row.reject ? "Rejected" : row.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Completed Tasks");
    XLSX.writeFile(workbook, `Completed_Tasks_Page_${currentPage}.xlsx`);
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Completed Task</h1>
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