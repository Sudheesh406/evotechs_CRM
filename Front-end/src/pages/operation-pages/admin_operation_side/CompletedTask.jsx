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
  { key: "action", label: "Action" }, 
];

function CompletedTask() {
  const [completedWorks, setCompletedWorks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getCompletedWork = async (page = 1) => {
    try {
      const response = await axios.get(`/Completed/get?page=${page}&limit=20`);

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
        reject: item.reject,
      }));

      setCompletedWorks(mapped);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.log("error found in getCompletedWork", error);
    } finally {
      setLoading(false);
    }
  };


  const handleBankRejection = async(data)=>{
    try {
      const id = data.id
      const response = await axios.patch('/Completed/reject',{id})
      if(response){
            getCompletedWork(currentPage);
      }

    } catch (error) {
      console.error('error',error)
    }
  }


  useEffect(() => {
    getCompletedWork(currentPage);
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

    if (key === "action") {
    // Hide button if reject = true
    if (row.reject) {
      return (
        <span className="text-red-500 font-semibold">Rejected</span>
      );
    }

    return (
      <button
        onClick={(e) => {
          e.stopPropagation(); // prevent triggering row click
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


  const handleRowClick = (row) => {
    const data = {
      taskId: row.id,
      contactId: row.contactId,
      staffId: row.staffId,
      pending: false,
      completed: false,
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
      <h1 className="text-xl font-semibold mb-6 text-gray-800">
        Completed Works
      </h1>

      {completedWorks.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-400 text-lg font-medium">No Data Found</p>
        </div>
      ) : (
        <Table2
          columns={columns}
          data={completedWorks}
          renderCell={renderCell}
          onRowClick={handleRowClick}
        />
      )}
      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-gray-700 font-medium">
          Page {currentPage} of {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default CompletedTask;
