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

function StaffTaskVerification() {
  const [completedWorks, setCompletedWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getCompletedWork = async () => {
    try {
      const response = await axios.get("/completed/resolved/get");
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
      }));

      setCompletedWorks(mapped);
    } catch (error) {
      console.log("error found in getCompletedWork", error);
    } finally {
      setLoading(false);
    }
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
    const data = { taskId: row.id, contactId: row.contactId, staffId: row.staffId , pending: false, completed : true, resolve:true};
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
      <h1 className="text-xl font-semibold mb-6 text-gray-800">Resolved Works</h1>

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
    </div>
  );
}

export default StaffTaskVerification;
