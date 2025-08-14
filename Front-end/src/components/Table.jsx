import React from "react";
import { MoreVertical } from "lucide-react";

const Table = ({ columns, data, renderCell }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Mobile Cards (shown below lg: 1024px) */}
      <div className="space-y-3 p-3 lg:hidden">
        {data.map((row, idx) => (
          <div
            key={idx}
            className="border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex justify-between items-center mb-2">
              <input type="checkbox" className="accent-indigo-500" />
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

      {/* Desktop Table (shown from lg: 1024px) */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700">
            <tr>
              <th className="p-3 text-center border-b w-12">
                <input type="checkbox" className="accent-indigo-500" />
              </th>
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
                className="hover:bg-indigo-50 transition-colors duration-200"
              >
                <td className="p-3 text-center">
                  <input type="checkbox" className="accent-indigo-500" />
                </td>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`p-3 ${col.className || "text-gray-600"}`}
                  >
                    {renderCell ? renderCell(col.key, row) : row[col.key]}
                  </td>
                ))}
                <td className="p-3 text-gray-400 hover:text-gray-600 cursor-pointer">
                  <MoreVertical size={16} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
