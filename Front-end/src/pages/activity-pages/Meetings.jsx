import React, { useState } from "react";
import { ChevronDown, Phone } from "lucide-react";
import DataTable from "../../components/Table2";

const Meetings = () => {
  const [filter, setFilter] = useState("Meetings");
  const [open, setOpen] = useState(false);

  const filterOptions = [
    "Today's",
    "Upcoming",
    "Completed",
    "Cancelled",
    "This Week",
  ];

  const leads = [
    { subject: "Mudra", contact: "Rangoni Of Florence", host: "Malu", date:"12/12/2025", from:'8:00 AM',to:'9:00AM', phone: "555-555-5555", source: "Cold Call" },
    { subject: "Mudra", contact: "Oh My Goodknits Inc", host: "Malu",date:"12/12/2025", from:'8:00 AM',to:'9:00AM', phone: "555-555-5555", source: "Advertisement" },
    { subject: "Mudra", contact: "Kwik Kopy Printing", host: "Malu",date:"12/12/2025", from:'8:00 AM',to:'9:00AM', phone: "555-555-5555", source: "Web Download" },
    { subject: "Mudra", contact: "Morlong Associates", host: "Malu",date:"12/12/2025", from:'8:00 AM',to:'9:00AM', phone: "555-555-5555", source: "Seminar Partner" },
    { subject: "Mudra", contact: "Chapman", host: "Malu",date:"12/12/2025", from:'8:00 AM',to:'9:00AM', phone: "555-555-5555", source: "Online Store" },
  ];

  const columns = [
    { label: "Subject", key: "subject", className: "font-medium text-gray-800" },
    { label: "Contact Name", key: "contact" },
    { label: "Host", key: "host", className: "text-indigo-600 hover:underline cursor-pointer" },
    { label: "Date", key: "date", className: "text-indigo-600 hover:underline cursor-pointer" },
    { label: "From", key: "from", className: "text-indigo-600 hover:underline cursor-pointer" },
    { label: "To", key: "to", className: "text-indigo-600 hover:underline cursor-pointer" },
    { label: "Phone Number", key: "phone" },
    { label: "Source", key: "source" },
    { label: "Actions", key: "actions" }, // new column

  ];

  return (
    <div className="bg-gray-50 min-h-[680px] p-4">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-2 relative">
          {/* Dropdown button */}
          <button
            onClick={() => setOpen(!open)}
            className="border rounded px-3 py-1 flex items-center gap-1 bg-white shadow-sm w-full sm:w-auto justify-between sm:justify-start"
          >
            {filter} <ChevronDown size={16} />
          </button>

          {/* Dropdown menu */}
          {open && (
            <div className="absolute top-full mt-1 w-40 bg-white border rounded shadow-lg z-10">
              {filterOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setFilter(option);
                    setOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          <span className="text-gray-600 text-sm">
            Total Records {leads.length}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded shadow w-full sm:w-auto">
            Create Meetings
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
          if (key === "actions") {
            return (
              <div className="relative">
                  <div className="flex gap-2">
                  <button className="bg-blue-500 text-white px-2 py-1 text-sm rounded-lg hover:bg-blue-600" onClick={()=>console.log('hello')}>Edit</button>
                  <button className="bg-red-500 text-white px-2 py-1 text-sm rounded-lg hover:bg-red-600">Delete</button>
                  </div>
              </div>
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

export default Meetings;
