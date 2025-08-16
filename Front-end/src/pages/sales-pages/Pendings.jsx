import React from "react";
import Table2 from "../../components/Table2"; // import your reusable Table2 component

const pendingWorks = [
  { id: 1, date: "Aug 13", dateColor: "bg-red-100 text-red-600", contact: "Kris Marrier (Sample)", account: "King (Sample)", email: "krismarrier@noemail.invalid", phone: "555-555-5555", owner: "Sudheesh kumar" },
  { id: 2, date: "Aug 15", dateColor: "bg-green-100 text-green-600", contact: "Sage Wieser (Sample)", account: "Truhlar And Truhlar (Sample)", email: "sage-wieser@noemail.invalid", phone: "555-555-5555", owner: "Sudheesh kumar" },
  { id: 3, date: "Today", dateColor: "bg-orange-100 text-orange-600", contact: "Leota Dilliard (Sample)", account: "Commercial Press (Sample)", email: "leota-dilliard@noemail.invalid", phone: "555-555-5555", owner: "Sudheesh kumar" },
  { id: 4, date: "Aug 15", dateColor: "bg-green-100 text-green-600", contact: "Mitsue Tollner (Sample)", account: "Morlong Associates (Sample)", email: "tollner-morlong@noemail.invalid", phone: "555-555-5555", owner: "Sudheesh kumar" },
];

const columns = [
  { key: "date", label: "Date" },
  { key: "contact", label: "Contact Name" },
  { key: "account", label: "Account Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "owner", label: "Contact Owner" },
];

export default function Pendings() {
  const renderCell = (key, row) => {
    if (key === "date") {
      return (
        <span className={`px-2 py-1 rounded-full text-sm font-medium ${row.dateColor}`}>
          {row.date}
        </span>
      );
    }
    return row[key];
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-xl font-semibold mb-6 text-gray-800">Pendings</h1>
      <Table2 columns={columns} data={pendingWorks} renderCell={renderCell} />
    </div>
  );
}
