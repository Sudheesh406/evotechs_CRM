import React from "react";

const Table2 = ({
  columns,
  data,
  renderCell,
  onRowClick,
  currentStaffId,
  onActionClick,
  value,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
              {value && (
                <th className="p-3 border-b w-24 text-center font-semibold">
                  Action
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row, idx) => {
              const showAction = row.staffId !== currentStaffId;
              return (
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
                  <td className="p-3 text-center">
                    {showAction && value && (
                      <button
                        className="px-2 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                        onClick={(e) => {
                          e.stopPropagation(); // prevent row click
                          onActionClick && onActionClick(row); // <-- call parent handler
                        }}
                      >
                      Reassignment
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table2;
