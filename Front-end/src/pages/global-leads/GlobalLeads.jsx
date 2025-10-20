import React, { useState, useEffect } from "react";
import { Phone } from "lucide-react";
import DataTable from "../../components/Table2";
import axios from "../../instance/Axios";

const GlobalLeads = () => {
  const [leads, setLeads] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const limit = 10;

  const columns = [
    { label: "Lead Name", key: "name", className: "font-medium text-gray-800" },
    { label: "Description", key: "description" },
    { label: "Email", key: "email", className: "text-indigo-600" },
    { label: "Phone", key: "phone" },
    { label: "Location", key: "location" },
    { label: "Lead Source", key: "source" },
    { label: "Priority", key: "priority" },
    { label: "Amount", key: "amount" },
    { label: "Follower Name", key: "followerName" }, // mapped field
    { label: "Role", key: "staffRole" }, // mapped field
  ];

  // Fetch leads
  const getLeads = async (pageNo = 1, search = "") => {
    try {
      const response = await axios.get(
        `/customer/lead/global/get?page=${pageNo}&limit=${limit}&search=${search}`
      );

      console.log("response", response);

      if (response.data && response.data.data) {
        const { leads, total } = response.data.data;

        // Format priority values for readability
        const formattedLeads = leads.map((lead) => {
          // Format priority
          let priority = lead.priority;
          if (priority === "WaitingPeriod") priority = "Waiting Period";
          else if (priority === "NoUpdates") priority = "No Updates";
          else if (priority === "NotAnClient") priority = "Not a Client";

          return {
            ...lead,
            priority,
            followerName: lead.assignedStaff?.name || "-", // Use assignedStaff name
            staffRole: lead.assignedStaff?.role || "-", // Use assignedStaff role
          };
        });

        setLeads(formattedLeads);
        setTotalCount(total || 0);
      }
    } catch (error) {
      console.error("Error fetching leads", error);
    }
  };

  // Fetch on load and search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      getLeads(page, searchTerm);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [page, searchTerm]);

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="bg-gray-50 min-h-[680px] p-4">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded px-3 py-1 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
          />
          <span className="text-gray-600 text-sm">
            Total Records: {totalCount}
          </span>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={leads}
        renderCell={(key, row) => {
          if (key === "phone") {
            return (
              <div className="flex items-center gap-2 text-gray-600">
                {row.phone}
                <Phone size={14} className="text-gray-400" />
              </div>
            );
          }

          if (key === "source") {
            return (
              <span className="inline-block px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">
                {row.source}
              </span>
            );
          }

          if (key === "followerName") {
            return (
              <span className="text-gray-700 font-medium">
                {row.followerName || "-"}
              </span>
            );
          }

          if (key === "staffRole") {
            if(row.staffRole === 'admin'){
                return (
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-red-300 text-indigo-700 rounded-full">
                    {row.staffRole || "-"}
                  </span>
                );
            }else{
                return (
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-300 text-indigo-700 rounded-full">
                    {row.staffRole || "-"}
                  </span>
                ); 
            }
          }

          return row[key];
        }}
      />

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
        <span>{limit} Records Per Page</span>
        <div className="flex items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalLeads;
