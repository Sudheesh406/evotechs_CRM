import React from "react";
import Table2 from "../../components/Table2"; // import your reusable Table2 component
import { Download } from "lucide-react";

const documents = [
  { title: "PNGP Project Report", date: "13/08/2025", dept: "Dept. A", file: "/docs/pngp-report.pdf" },
  { title: "MUDRA Guidelines", date: "10/08/2025", dept: "Dept. B", file: "/docs/mudra-guidelines.pdf" },
  { title: "Annual Progress Report", date: "01/08/2025", dept: "Dept. C", file: "/docs/annual-progress.pdf" },
];

const columns = [
  { key: "title", label: "Title" },
  { key: "dept", label: "Department" },
  { key: "date", label: "Date" },
  { key: "action", label: "Action" },
];

export default function DocumentsPage() {
  const renderCell = (key, row) => {
    if (key === "action") {
      return (
        <a
          href={row.file}
          download
          className="flex items-center gap-2 text-blue-700 hover:underline"
        >
          <Download size={16} /> Download
        </a>
      );
    }
    return row[key];
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-xl font-semibold mb-4"> Documents</h1>
      <Table2 columns={columns} data={documents} renderCell={renderCell} />
    </div>
  );
}
