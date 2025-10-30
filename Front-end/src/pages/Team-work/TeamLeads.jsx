import React, { useEffect, useState } from "react";
import axios from "../../instance/Axios";
import Table2 from "../../components/Table2";
import Swal from "sweetalert2";

export default function TeamLeads() {
  const [teamLeads, setTeamLeads] = useState([]);
  const [user, setUser] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 50; // per page

  const getTeamLeads = async (page = 1) => {
    try {
      const response = await axios.get(`/team/leads/get?page=${page}&limit=${limit}`);
      const leads = response.data?.leads || [];
      const userId = response.data?.userId;
      setUser(userId);
      setTotalPages(response.data?.totalPages || 1);
      setCurrentPage(response.data?.currentPage || 1);

      const transformedLeads = leads.map((lead) => ({
        staffId: lead.assignedStaff?.id,
        date: new Date(lead.createdAt).toLocaleDateString(),
        customerName: lead.name,
        amount: lead.amount,
        priority: lead.priority || "Normal",
        email: lead.email,
        phone: lead.phone,
        location: lead.location,
        purpose: lead.purpose,
        followerName: lead.assignedStaff?.name || "-",
        followerEmail: lead.assignedStaff?.email || "-",
      }));

      setTeamLeads(transformedLeads);
    } catch (error) {
      console.log("Error fetching team leads:", error);
    }
  };

  useEffect(() => {
    getTeamLeads(currentPage);
  }, [currentPage]);

  const columns = [
    { key: "date", label: "Date" },
    { key: "customerName", label: "Customer Name" },
    { key: "amount", label: "Amount" },
    { key: "priority", label: "Priority" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "location", label: "Location" },
    { key: "purpose", label: "Purpose" },
    { key: "followerName", label: "Follower Name" },
    { key: "followerEmail", label: "Follower Email" },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-xl font-semibold mb-6 text-black">Team Leads</h1>

      <Table2
        columns={columns}
        data={teamLeads}
        currentStaffId={user}
      />

      {/* Pagination Controls */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-lg ${
            currentPage === 1 ? "bg-gray-300" : "bg-blue-500 hover:bg-blue-600"
          } text-white`}
        >
          Prev
        </button>
        <span className="text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-lg ${
            currentPage === totalPages
              ? "bg-gray-300"
              : "bg-blue-500 hover:bg-blue-600"
          } text-white`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
