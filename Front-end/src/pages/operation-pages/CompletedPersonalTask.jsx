import React, { useEffect, useState } from "react";
import axios from "../../instance/Axios";
import Table2 from "../../components/Table2";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";


export default function CompletedPersonalTask() {
  const [reworks, setReworks] = useState([]);
  const navigate = useNavigate();

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

  const getCompletedTask = async () => {
    try {
      const res = await axios.get("/completed/staff/get");
      const tasks = res.data.data.map((t) => ({
        id: t.id,
        contactId: t.customer?.id, // or t.customer.id
        newUpdate : t.newUpdate,
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
        status: t.newUpdate ? "Completed" : "Pending"

      }));
      setReworks(tasks);
  
    } catch (error) {
       Swal.fire('Error', 'Failed to get reworks.', 'error');
      console.error("error found in get reworks", error);
    }
  };

  useEffect(() => {
    getCompletedTask();
  }, []);

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
    return row[key];
  };
const role = true
  const handleRowClick = (row) => {
    const payload = { taskId: row.id, contactId: row.contactId , role};
    const dataToSend = encodeURIComponent(JSON.stringify(payload));
    navigate(`/activities/tasks/team/${dataToSend}`);
  };

  return (
    <div className="p-6 bg-gray-50">
      <h1 className="text-xl font-semibold mb-6 text-gray-800">Completed Task</h1>
      <Table2
        columns={columns}
        data={reworks}
        renderCell={renderCell}
        onRowClick={handleRowClick} // Table2 should handle this
      />
    </div>
  );
}
