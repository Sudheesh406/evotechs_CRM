import React, { useEffect, useState } from "react";
import axios from "../../instance/Axios";
import Table2 from "../../components/Table2";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function RejectedWorks() {
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

  const getRejectedTask = async () => {
    try {
      const res = await axios.get(
        `/rejected/staff/get?page=${currentPage}&limit=20`
      );
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
        reject: t.reject,
      }));

      setReworks(tasks);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (error) {
      Swal.fire("Error", "Failed to get rejected tasks.", "error");
      console.error("Error found in get rejected tasks", error);
    }
  };

  const handleBankRejection = async (data) => {
    try {
      const id = data.id;
      const response = await axios.patch("/rejected/remove/reject", { id });
      if (response) {
        getRejectedTask();
      }
    } catch (error) {
      console.error("error in removing rejection", error);
    }
  };

  useEffect(() => {
    getRejectedTask();
  }, [currentPage]);

  const renderCell = (key, row) => {
    if (key === "date") {
      return (
        <span
          className={`px-2 py-1 rounded-full text-sm font-medium ${row.dateColor}`}
        >
          {row.date}
        </span>
      );
    }

    if (key === "status") {
      return (
        <span
          className={`px-2 py-1 rounded-full text-sm text-red-500 font-medium ${row.status}`}
        >
          {row.status}
        </span>
      );
    }

    if (key === "action") {
      // Show button only if reject = true
      if (row.reject) {
        return (
          <button
            onClick={(e) => {
              e.stopPropagation(); // prevent triggering row click
              handleBankRejection(row);
            }}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Remove
          </button>
        );
      }

      // Otherwise show text if not rejected
      return <span className="text-gray-500 font-semibold">Not Rejected</span>;
    }

    return row[key];
  };
  const role = true;
  const handleRowClick = (row) => {};

  return (
    <div className="p-6 bg-gray-50">
      <h1 className="text-xl font-semibold mb-6 text-gray-800">
        Rejected Task
      </h1>
      <Table2
        columns={columns}
        data={reworks}
        renderCell={renderCell}
        onRowClick={handleRowClick} // Table2 should handle this
      />
      {/* Pagination Controls */}
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
