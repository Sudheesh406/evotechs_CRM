import React from "react";
import { Phone } from "lucide-react";
import Table from "../../components/Table";

const Contacts = () => {
  const columns = [
    { label: "", key: "date" },
    { label: "Contact Name", key: "contactName" },
    { label: "Account Name", key: "accountName" },
    { label: "Email", key: "email" },
    { label: "Phone", key: "phone" },
    { label: "Contact Owner", key: "owner" },
  ];

  const data = [
    {
      date: { text: "Aug 13", color: "bg-red-100 text-red-600" },
      contactName: "Kris Marrier (Sample)",
      accountName: "King (Sample)",
      email: "krismarrier@noemail.invalid",
      phone: "555-555-5555",
      owner: "Sudheesh kumar",
    },
    {
      date: { text: "Aug 15", color: "bg-green-100 text-green-600" },
      contactName: "Sage Wieser (Sample)",
      accountName: "Truhlar And Truhlar (Sample)",
      email: "sage-wieser@noemail.invalid",
      phone: "555-555-5555",
      owner: "Sudheesh kumar",
    },
    {
      date: { text: "Today", color: "bg-orange-100 text-orange-600" },
      contactName: "Leota Dilliard (Sample)",
      accountName: "Commercial Press (Sample)",
      email: "leota-dilliard@noemail.invalid",
      phone: "555-555-5555",
      owner: "Sudheesh kumar",
    },
    {
      date: { text: "Aug 15", color: "bg-green-100 text-green-600" },
      contactName: "Mitsue Tollner (Sample)",
      accountName: "Morlong Associates (Sample)",
      email: "tollner-morlong@noemail.invalid",
      phone: "555-555-5555",
      owner: "Sudheesh kumar",
    },
  ];

  const renderCell = (colKey, row) => {
    if (colKey === "date") {
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${row.date.color}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 7V3m8 4V3m-9 8h10m-11 4h12m-13 4h14M4 6h16M4 6v14a2 2 0 002 2h12a2 2 0 002-2V6"
            />
          </svg>
          {row.date.text}
        </span>
      );
    }
    if (colKey === "phone") {
      return (
        <div className="flex items-center gap-1">
          {row.phone}
          <Phone size={14} className="text-gray-500" />
        </div>
      );
    }
    return row[colKey];
  };

  return (
    <div className="p-4 space-y-4 bg-gray-50 min-h-[680px]">
      {/* Top bar */}
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
        {/* Left section */}
        <div className="flex flex-wrap items-center gap-2">
          <button className="border rounded px-3 py-1 flex items-center gap-1 bg-white shadow-sm w-full sm:w-auto justify-between sm:justify-start">
            All Contacts
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <span className="text-gray-600 text-sm">
            Total Records {data.length}
          </span>
        </div>

        {/* Right section */}
        <div className="flex flex-wrap items-center gap-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded shadow w-full sm:w-auto">
            Create Contact
          </button>
          <button className="border rounded px-3 py-2 flex items-center gap-1 bg-white shadow-sm w-full sm:w-auto justify-between sm:justify-start">
            Actions
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Table */}
      <Table columns={columns} data={data} renderCell={renderCell} />
    </div>
  );
};

export default Contacts;
