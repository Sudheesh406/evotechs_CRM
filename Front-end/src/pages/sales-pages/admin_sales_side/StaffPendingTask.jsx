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
  const navigate = useNavigate()

  const getPendingWork = async () => {
    try {
      const response = await axios.get("/pending/admin/task/get");
      console.log("raw response", response);

      // Map API data to your table keys:
      const mapped = response.data.data.map((item) => ({
         id: item.id,
         staffId : item.staff?.id,
        contactId: item.customer?.id, 
        date: new Date(item.createdAt).toLocaleDateString(), // or item.finishBy if needed
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
    const data = { taskId: row.id, contactId: row.contactId, staffId : row.staffId, pending: true, completed: false};
    console.log(data);
    
    const dataToSend = encodeURIComponent(JSON.stringify({ data }));
    navigate(`/activities/task/port/${dataToSend}`);
  };

  return (
    <div className="p-6 bg-gray-50">
      <h1 className="text-xl font-semibold mb-6 text-red-500">Pendings</h1>
      <Table2 columns={columns} data={pendingWorks} renderCell={renderCell} onRowClick={handleRowClick} />
    </div>
  );
}
