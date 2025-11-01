import { useEffect, useState } from "react";
import axios from "../../../instance/Axios";
import Table2 from "../../../components/Table2";
import { useNavigate } from "react-router-dom";

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
      console.log("raw response", response);

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
      <h1 className="text-xl font-semibold mb-6 text-red-500">Pendings</h1>

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
