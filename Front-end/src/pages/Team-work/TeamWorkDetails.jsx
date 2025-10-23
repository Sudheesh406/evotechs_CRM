import React, { useEffect, useState } from "react";
import Table2 from "../../components/Table2";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../instance/Axios";
import Swal from "sweetalert2";

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
  const navigate = useNavigate();
  const parsedData = JSON.parse(decodeURIComponent(data));
  const projectName = parsedData.projectName;
  const [role, setRole] = useState(false)

  const [works, setWorks] = useState([]);

  const getProject = async () => {
  // Show loading alert
  Swal.fire({
    title: "Getting Projects...",
    didOpen: () => {
      Swal.showLoading();
    },
    allowOutsideClick: false,
  });

  try {
    const response = await axios.post("/team/projects/post", { parsedData });

    if (response?.data?.tasks) {
      const tableData = response.data.tasks.map((task) => ({
        date: new Date(task.createdAt).toLocaleDateString(),
        id: task.id,
        contactId: task.customer?.id ?? "",
        customer: task.customer?.name ?? "",
        amount: task.customer?.amount ?? "",
        finishBy: task.finishBy,
        priority: task.priority,
        email: task.customer?.email ?? "",
        phone: task.phone ?? "",
        staff: task.staff?.name ?? "",
        staffEmail: task.staff?.email ?? "",
      }));

      if (response.data?.admin) {
        setRole(true);
      }

      setWorks(tableData);
    }

    // Close loading and optionally show success
    Swal.close();
    // Optional success toast
    // Swal.fire({ icon: 'success', title: 'Projects fetched successfully!', toast: true, timer: 1500, position: 'top-end', showConfirmButton: false });
  } catch (error) {
    console.error("error found in get project", error);
    Swal.fire('Error', 'Failed to get projects. Please try again.', 'error');
  }
};


  useEffect(() => {
    getProject();
  }, []);

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

  const handleRowClick = (row) => {
    const payload = { taskId: row.id, contactId: row.contactId , role};
    const dataToSend = encodeURIComponent(JSON.stringify(payload));
    navigate(`/activities/tasks/team/${dataToSend}`);
  };

  return (
    <div className="p-6 bg-gray-50">
      <h1 className="text-xl font-semibold mb-6 text-gray-800">{projectName}</h1>
      <Table2
        columns={columns}
        data={works}
        renderCell={renderCell}
        onRowClick={handleRowClick}
      />
    </div>
  );
}
