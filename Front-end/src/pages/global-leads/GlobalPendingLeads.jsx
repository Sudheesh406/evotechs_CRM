import React, { useState, useEffect } from "react";
import { Phone, Download } from "lucide-react";
import DataTable from "../../components/Table2";
import axios from "../../instance/Axios";
import toast from "react-hot-toast";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const GlobalPendingLeads = () => {
  const [leads, setLeads] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState([]); // Array of unique staff
  const [selectedStaffId, setSelectedStaffId] = useState(""); // State for selection
  const limit = 10;

  const columns = [
    { label: "Lead Name", key: "name", className: "font-medium text-gray-800" },
    { label: "Created Date", key: "displayDate" },
    { label: "Description", key: "description" },
    { label: "Email", key: "email", className: "text-indigo-600" },
    { label: "Phone", key: "phone" },
    { label: "Location", key: "location" },
    { label: "Purpose", key: "purpose" },
    { label: "Lead Source", key: "source" },
    { label: "Priority", key: "priority" },
    { label: "Amount", key: "amount" },
    { label: "Follower Name", key: "followerName" },
    { label: "Role", key: "staffRole" },
  ];

  const getLeads = async (pageNo = 1, search = "", staffId = "") => {
    try {
      const response = await axios.post(
        `/customer/pending/global/lead/get?page=${pageNo}&limit=${limit}&search=${search}`,
        { staffId: staffId } // 👈 Corrected key name to use the parameter
      );

      if (response.data?.data) {
        const { leads, total, filterList } = response.data.data;

        if (filterList) setFilter(filterList);
        
        const formattedLeads = leads.map((lead) => {
          let priority = lead.priority;
          if (priority === "WaitingPeriod") priority = "Waiting Period";
          else if (priority === "NoUpdates") priority = "No Updates";
          else if (priority === "NotAnClient") priority = "Not a Client";

          const displayDate = lead.createdAt
            ? new Date(lead.createdAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "-";

          return {
            ...lead,
            priority,
            displayDate,
            followerName: lead.assignedStaff?.name || "-",
            staffRole: lead.assignedStaff?.role || "-",
          };
        });

        setLeads(formattedLeads);
        setTotalCount(total || 0);
      }
    } catch (error) {
      console.error("Error fetching leads", error);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      // 👈 Added selectedStaffId to the function call
      getLeads(page, searchTerm, selectedStaffId); 
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [page, searchTerm, selectedStaffId]); // 👈 Added selectedStaffId to dependencies

  // Download Function
  const handleDownload = () => {
    if (leads.length === 0) {
      toast.error("No data available to download");
      return;
    }

    const doc = new jsPDF({ orientation: "landscape" });

    doc.setFontSize(16);
    doc.text("Rejected Leads List", 14, 15);
    doc.setFontSize(10);
    doc.text(
      `Total Records: ${totalCount} | Generated on: ${new Date().toLocaleDateString()}`,
      14,
      22,
    );

    const tableColumn = [
      "Name",
      "Created Date",
      "Description",
      "Email",
      "Phone",
      "Location",
      "Purpose",
      "Source",
      "Priority",
      "Amount",
    ];

    const tableRows = leads.map((lead) => [
      lead.name,
      lead.displayDate,
      lead.description,
      lead.email,
      lead.phone,
      lead.location,
      lead.purpose,
      lead.source,
      lead.priority,
      lead.amount,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [220, 38, 38] },
    });

    const fileName = `Rejected_Leads_${
      new Date().toISOString().split("T")[0]
    }.pdf`;
    doc.save(fileName);
    toast.success("Downloading PDF list...");
  };

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="bg-gray-50 min-h-[680px] p-4">
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
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedStaffId}
            onChange={(e) => {
              setSelectedStaffId(e.target.value);
              setPage(1); // Reset to first page on filter change
            }}
            className="border rounded px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm min-w-[150px]"
          >
            <option value="">All Members</option>
            {filter.map((staff) => (
              <option key={staff.id} value={staff.id}>
                {staff.name} ({staff.role})
              </option>
            ))}
          </select>

          <button
            onClick={handleDownload}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow w-full sm:w-auto flex items-center justify-center gap-2 transition-colors"
          >
            <Download size={16} />
            Download
          </button>
        </div>
      </div>

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
            const roleClass =
              row.staffRole === "admin" ? "bg-red-300" : "bg-blue-300";
            return (
              <span
                className={`inline-block px-2 py-1 text-xs font-medium ${roleClass} text-indigo-700 rounded-full`}
              >
                {row.staffRole || "-"}
              </span>
            );
          }

          return row[key];
        }}
      />

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-800">{limit}</span>
          <span>Records Per Page</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 transition-colors"
          >
            Prev
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-1 border rounded min-w-[35px] transition-all ${
                    page === pageNum
                      ? "bg-indigo-600 text-white border-indigo-600 font-bold"
                      : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
                  }`}
                >
                  {pageNum}
                </button>
              ),
            )}
          </div>

          <button
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalPendingLeads;