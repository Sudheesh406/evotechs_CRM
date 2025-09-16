import React from "react";
import { MoreVertical } from "lucide-react";

const Table2 = ({ columns, data, renderCell, onRowClick }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Mobile Cards */}
      <div className="space-y-3 p-3 lg:hidden">
        {data.map((row, idx) => (
          <div
            key={idx}
            className="border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow duration-200"
            onClick={() => onRowClick && onRowClick(row)}
          >
            <div className="flex justify-end items-center mb-2">
              <MoreVertical size={16} className="text-gray-400" />
            </div>
            {columns.map((col) => (
              <div key={col.key} className="flex justify-between py-1">
                <span className="font-semibold text-gray-700">{col.label}</span>
                <span className="text-gray-600">
                  {renderCell ? renderCell(col.key, row) : row[col.key]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="p-3 border-b text-left font-semibold"
                >
                  {col.label}
                </th>
              ))}
              <th className="p-3 border-b w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row, idx) => (
              <tr
                key={idx}
                className="hover:bg-indigo-50 transition-colors duration-200 cursor-pointer"
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`p-3 ${col.className || "text-gray-600"}`}
                  >
                    {renderCell ? renderCell(col.key, row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table2;
