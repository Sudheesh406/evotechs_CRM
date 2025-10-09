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
      {/* Desktop / Large Screens */}
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
                  {value && (
                    <td className="p-3 text-center">
                      {showAction && (
                        <button
                          className="px-2 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            onActionClick && onActionClick(row);
                          }}
                        >
                          Reassignment
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile / Tablet Layout */}
      <div className="block lg:hidden space-y-4 p-2">
        {data.map((row, idx) => {
          const showAction = row.staffId !== currentStaffId;
          return (
            <div
              key={idx}
              className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 shadow-sm hover:shadow-md transition cursor-pointer"
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((col) => (
                <div
                  key={col.key}
                  className="flex justify-between py-1 border-b last:border-b-0"
                >
                  <span className="font-medium text-indigo-700">
                    {col.label}:
                  </span>
                  <span className="text-gray-700 text-right">
                    {renderCell ? renderCell(col.key, row) : row[col.key]}
                  </span>
                </div>
              ))}

              {value && showAction && (
                <div className="mt-3 text-right">
                  <button
                    className="px-3 py-1 bg-indigo-500 text-white text-sm rounded hover:bg-indigo-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      onActionClick && onActionClick(row);
                    }}
                  >
                    Reassignment
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Table2;
