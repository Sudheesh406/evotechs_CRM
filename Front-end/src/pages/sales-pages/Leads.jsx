import React from "react";
import { ChevronDown, Phone } from "lucide-react";
import DataTable from "../../components/Table2";

const Leads = () => {
  const leads = [
    { name: "Christopher Maclead (Sample)", company: "Rangoni Of Florence", email: "christopher-maclead@noemail.invalid", phone: "555-555-5555", source: "Cold Call" },
    { name: "Carissa Kidman (Sample)", company: "Oh My Goodknits Inc", email: "carissa-kidman@noemail.invalid", phone: "555-555-5555", source: "Advertisement" },
    { name: "James Merced (Sample)", company: "Kwik Kopy Printing", email: "james-merced@noemail.invalid", phone: "555-555-5555", source: "Web Download" },
    { name: "Tresa Sweely (Sample)", company: "Morlong Associates", email: "tresa-sweely@noemail.invalid", phone: "555-555-5555", source: "Seminar Partner" },
    { name: "Felix Hirpara (Sample)", company: "Chapman", email: "felix-hirpara@noemail.invalid", phone: "555-555-5555", source: "Online Store" },
  ];

  const columns = [
    { label: "Lead Name", key: "name", className: "font-medium text-gray-800" },
    { label: "Company", key: "company" },
    { label: "Email", key: "email", className: "text-indigo-600 hover:underline cursor-pointer" },
    { label: "Phone", key: "phone" },
    { label: "Lead Source", key: "source" },
  ];

  return (
    <div className="bg-gray-50 min-h-[680px] p-4">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <button className="border rounded px-3 py-1 flex items-center gap-1 bg-white shadow-sm w-full sm:w-auto justify-between sm:justify-start">
            All Leads <ChevronDown size={16} />
          </button>
          <span className="text-gray-600 text-sm">
            Total Records {leads.length}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded shadow w-full sm:w-auto">
            Create Lead
          </button>
          <button className="border rounded px-3 py-2 flex items-center gap-1 bg-white shadow-sm w-full sm:w-auto justify-between sm:justify-start">
            Actions <ChevronDown size={16} />
          </button>
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
          return row[key];
        }}
      />

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
        <span>10 Records Per Page</span>
        <span>1 - {leads.length}</span>
      </div>
    </div>
  );
};

export default Leads;
