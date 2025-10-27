
/* --- Inline Custom Table (Refreshed) --- */
function CustomTable({ columns, data, renderCell }) {
  if (data.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        No data available.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
      {/* Mobile Cards */}
      <div className="space-y-3 p-3 lg:hidden">
        {data.map((row, idx) => (
          <div
            key={idx}
            className="border border-gray-200 rounded-lg p-3 shadow-sm bg-white hover:bg-gray-50 transition-shadow duration-200"
          >
            {columns.map((col) => (
              <div
                key={col.key}
                className="flex justify-between items-center py-1 border-b last:border-b-0"
              >
                <span className="font-medium text-sm text-gray-600 mr-2">
                  {col.label}:
                </span>
                <span className="text-sm text-gray-800 text-right font-normal flex-shrink-0">
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
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="p-3 text-left font-semibold text-gray-600 uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row, idx) => (
              <tr
                key={idx}
                className="hover:bg-indigo-50 transition-colors duration-150"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`p-3 align-top ${
                      col.className || "text-gray-700"
                    }`}
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
}


export default CustomTable;
