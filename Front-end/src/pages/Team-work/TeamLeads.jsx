import React, { useEffect, useState } from "react";
import axios from "../../instance/Axios";
import Table2 from "../../components/Table2";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function TeamLeads() {
  const [teamLeads, setTeamLeads] = useState([]);
  // const navigate = useNavigate();
  const [user, setUser] = useState()

  const [value, setValue] = useState(true)


  ////--------------------------------------send staff id to table to work ------------------------//

  const getTeamLeads = async () => {
    try {
      const response = await axios.get("/team/leads/get");
      const leads = response.data?.leads || [];
      const userId = response.data?.userId
      setUser(userId)

      // Transform data into table-friendly format
      const transformedLeads = leads.map((lead) => ({
        staffId: lead.assignedStaff?.id,
        date: new Date(lead.createdAt).toLocaleDateString(),
        customerName: lead.name,
        amount: lead.amount,
        priority: lead.priority || "Normal",
        email: lead.email,
        phone: lead.phone,
        location : lead.location,
        followerName: lead.assignedStaff?.name || "-",
        followerEmail: lead.assignedStaff?.email || "-",
      }));

      setTeamLeads(transformedLeads);
    } catch (error) {
      console.log("Error fetching team leads:", error);
    }
  };

  useEffect(() => {
    getTeamLeads();
  }, []);

  // Columns need key + label
  const columns = [
    { key: "date", label: "Date" },
    { key: "customerName", label: "Customer Name" },
    { key: "amount", label: "Amount" },
    { key: "priority", label: "Priority" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "location", label: "Location" },
    { key: "followerName", label: "Follower Name" },
    { key: "followerEmail", label: "Follower Email" },
  ];

  const handleRowClick = (lead) => {
    // console.log("Row clicked:", lead);
  };


const handleActionClick = (row) => {
 
};

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-xl font-semibold mb-6 text-black">Team Leads</h1>
      <Table2
        columns={columns}
        data={teamLeads}
        currentStaffId= {user}
        onRowClick={handleRowClick}
        onActionClick={handleActionClick}   // <-- new prop
      
      />
    </div>
  );
}
