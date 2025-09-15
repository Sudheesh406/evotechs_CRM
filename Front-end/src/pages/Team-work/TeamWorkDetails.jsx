import React, { useEffect, useState } from "react";
import Table2 from "../../components/Table2";
import { useParams } from "react-router-dom";
import axios from "../../instance/Axios";

const columns = [
  { key: "date", label: "Date" },
  { key: "customer", label: "Customer Name" },
  { key: "amount", label: "Amount" },
  { key: "finishBy", label: "Target Date" },
  { key: "priority", label: "Priority" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "staff", label: "Follower Name" },
  { key: "staffEmail", label: "Follower Email" },
];

export default function TeamWorkDetails() {
  const { data } = useParams();
  const parsedData = JSON.parse(decodeURIComponent(data));
  const projectName = parsedData.projectName;

  // state for real data
  const [works, setWorks] = useState([]);

  const getProject = async () => {
    try {
      const response = await axios.post("/team/projects/post", { parsedData });
      if (response?.data?.tasks) {
        // transform API tasks into table rows
        const tableData = response.data.tasks.map((task) => ({
          date: new Date(task.createdAt).toLocaleDateString(),
          customer: task.customer?.name ?? "",        // safe check
          amount: task.customer?.amount ?? "",
          finishBy: task.finishBy,
          priority: task.priority,
          email: task.customer?.email ?? "",
          phone: task.phone,
          staff: task.staff?.name ?? "",
          staffEmail: task.staff?.email ?? "",
        }));
        setWorks(tableData);
      }
    } catch (error) {
      console.log("error found in get project", error);
    }
  };

  useEffect(() => {
    getProject();
  }, []); // run once

  const renderCell = (key, row) => {
    if (key === "date") {
      return (
        <span className="px-2 py-1 rounded-full text-sm font-medium">
          {row.date}
        </span>
      );
    }
    return row[key];
  };

  return (
    <div className="p-6 bg-gray-50" onClick={()=>navigate('/activities/tasks/person')}>
      <h1 className="text-xl font-semibold mb-6 text-gray-800">{projectName}</h1>
      <Table2 columns={columns} data={works} renderCell={renderCell} />
    </div>
  );
}
