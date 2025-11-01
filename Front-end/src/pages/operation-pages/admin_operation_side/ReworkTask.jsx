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
  { key: "status", label: "Status" },
];

function ReworkTask() {
  const [completedWorks, setCompletedWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1); // ✅ current page
  const [totalPages, setTotalPages] = useState(1); // ✅ backend pagination
  const navigate = useNavigate();

  const getRework = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/completed/rework/get?page=${page}&limit=20`);
      console.log("raw response", response);

      const mapped = response.data.data.map((item) => ({
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
        status: item.newUpdate ? "Completed" : "Pending",
      }));

      setCompletedWorks(mapped);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.log("error found in getCompletedWork", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRework();
  }, [page]); // ✅ runs when page changes

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
        <span className={`px-2 py-1 rounded-full text-sm text-red-500 font-medium ${row.status}`}>
          {row.status}
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
      completed: true,
      resolve: false,
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
    <div className="p-6 bg-gray-50">
      <h1 className="text-xl font-semibold mb-6 text-gray-800">Reworks</h1>

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

          {/* ✅ Pagination Controls */}
          <div className="flex justify-center items-center mt-6 gap-3">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className={`px-4 py-2 rounded-lg ${
                page === 1
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              Prev
            </button>

            <span className="text-gray-700 font-medium">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className={`px-4 py-2 rounded-lg ${
                page === totalPages
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ReworkTask;
