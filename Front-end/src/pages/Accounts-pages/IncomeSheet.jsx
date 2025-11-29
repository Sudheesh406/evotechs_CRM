import React, { useState, useCallback, useEffect } from "react";
import axios from "../../instance/Axios";
import { v4 as uuidv4 } from "uuid";
import Swal from "sweetalert2";

// Define the column headers with nesting structure
const columnStructure = [
  { key: "invoiceNo", header: "INVOICE NO", rowspan: 2, isDataCol: true },
  { key: "date", header: "DATE", rowspan: 2, isDataCol: true },
  { key: "name", header: "NAME OF PERSON/FIRM", rowspan: 2, isDataCol: true },
  { key: "totalAmount", header: "TOTAL AMOUNT", rowspan: 2, isDataCol: true },
  { key: "received", header: "RECEIVED", rowspan: 2, isDataCol: true },
  { key: "credit", header: "CREDIT", rowspan: 2, isDataCol: true },
  { key: "balance", header: "BALANCE", rowspan: 2, isDataCol: true },
];

// --- UPDATED: Create empty row with stable UUID ---
const createEmptyRow = (id = uuidv4()) => ({
  coloumnId: id,
  invoiceNo: "",
  date: "",
  name: "",
  totalAmount: null,
  received: null,
  credit: null,
  balance: null,
});

// --- Update getDataColumnKeys for new headers ---
const getDataColumnKeys = (structure) => {
  return structure.map((col) => ({
    key: col.key,
    align: col.key === "name" ? "left" : "right",
    dataType:
      col.key === "invoiceNo" || col.key === "date" || col.key === "name"
        ? "text"
        : "number",
  }));
};

const dataColumnKeys = getDataColumnKeys(columnStructure);

// Ensure minimum rows (UPDATED to use new createEmptyRow)
const ensureMinRows = (data, minCount) => {
  const newRows = [...data];
  while (newRows.length < minCount) {
    newRows.push(createEmptyRow()); // auto UUID
  }
  return newRows;
};

// --- REACT COMPONENT ---
const IncomeSheet = () => {
  const [data, setData] = useState([]);
  const [nextId, setNextId] = useState(1);

  const [selectedType, setSelectedType] = useState("Pathanamthitta");
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toLocaleString("en-US", { month: "long" })
  );

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [lastSavedData, setLastSavedData] = useState([]);
  const [showToast, setShowToast] = useState(false);

  // --- FETCH Income Sheet DATA ---
  const fetchIncomeSheet = async () => {
    try {
      const response = await axios.post("/account/income-sheet/get", {
        selectedYear,
        selectedMonth,
        selectedType,
      });

      const res = response.data;
      console.log(res);

      if (res.success && res.data) {
        const entries = res.data.entries.map((row) => ({ ...row }));

        const updated = ensureMinRows(entries, 50);
        setData(updated);

        setLastSavedData(JSON.stringify(entries));

        const maxId =
          entries.length > 0
            ? Math.max(...entries.map((r) => r.coloumnId)) + 1
            : 1;

        setNextId(maxId);
      } else {
        setData(ensureMinRows([], 50));
        setNextId(1);
      }
    } catch (error) {
      console.log("Error fetching IncomeSheet details", error);
      setData(ensureMinRows([], 50));
      setNextId(1);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchIncomeSheet();
    }, 500);

    return () => clearTimeout(delay);
  }, [selectedYear, selectedMonth, selectedType]);

  // --- HANDLE CELL CHANGE ---
  const handleCellChange = useCallback((rowId, key, value) => {
    triggerToast();

    setData((prevData) => {
      const newData = prevData.map((row) => {
        if (row.coloumnId === rowId) {
          const columnInfo = dataColumnKeys.find((col) => col.key === key);
          const formattedValue =
            columnInfo.dataType === "number"
              ? value === ""
                ? null
                : Number(value.replace(/[^0-9.]/g, ""))
              : value;

          return { ...row, [key]: formattedValue };
        }
        return row;
      });

      return newData;
    });
  }, []);

  // --- HANDLE ADD ROWS ---
  const handleAddRows = () => {
    setData((prevData) => {
      const newRows = Array.from({ length: 50 }, () => createEmptyRow());
      return [...prevData, ...newRows];
    });
  };

  // --- HANDLE SAVE CHANGES ---
  const handleSaveChanges = async () => {
    const filledRows = data.filter((row) =>
      Object.keys(row).some(
        (key) => key !== "coloumnId" && row[key] !== null && row[key] !== ""
      )
    );

    const cleanRows = filledRows.map((row) => ({ ...row })); // UUID stays!

    if (JSON.stringify(cleanRows) === lastSavedData) {
      Swal.fire({
        icon: "info",
        title: "No changes detected",
        text: "You haven’t made any changes to save.",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    const payload = {
      month: selectedMonth,
      year: selectedYear,
      type: selectedType,
      entries: cleanRows, // UUID INCLUDED
    };

    try {
      const res = await axios.post("/account/income-sheet/create", payload);
      console.log("Saved successfully", res.data);

      setLastSavedData(JSON.stringify(cleanRows));

      Swal.fire({
        icon: "success",
        title: "Saved!",
        text: "Income sheet entries have been saved successfully.",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.log("Error saving Income sheet", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save Income sheet entries. Please try again.",
        confirmButtonColor: "#d33",
      });
    }
  };

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  // --- CALCULATE TOTALS ---
  const totals = {
    totalAmount: data.reduce((sum, row) => sum + (row.totalAmount || 0), 0),
    received: data.reduce((sum, row) => sum + (row.received || 0), 0),
    credit: data.reduce((sum, row) => sum + (row.credit || 0), 0),
    balance: data.reduce((sum, row) => sum + (row.balance || 0), 0),
  };

  // --- RENDER ---
  return (
    <div className="p-4 overflow-x-auto ">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 border-b pb-3 border-gray-300">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          <span className="text-indigo-600">Income</span> Sheet
        </h1>

        <div className="flex space-x-6">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-md font-semibold text-gray-700 hover:border-gray-400 transition"
          >
            {[
              "January",
              "February",
              "March",
              "April",
              "May",
              "June",
              "July",
              "August",
              "September",
              "October",
              "November",
              "December",
            ].map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-md font-semibold text-gray-700 hover:border-gray-400 transition"
          >
            {Array.from(
              { length: 5 },
              (_, i) => new Date().getFullYear() - i
            ).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-md font-semibold text-gray-700 hover:border-gray-400 transition"
          >
            <option value="Pathanamthitta">Pathanamthitta</option>
            <option value="Thiruvananthapuram">Thiruvananthapuram</option>
          </select>

          <button
            onClick={handleAddRows}
            className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition"
          >
            Add Rows (Current Rows: {data.length})
          </button>

          <div className="relative">
            <button
              onClick={handleSaveChanges}
              className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition"
            >
              Save Changes
            </button>

            {showToast && (
              <div className="absolute top-full mt-2 right-0 w-[200px] bg-red-500 text-black font-bold text-sm px-4 py-3 rounded shadow-md animate-slideDown z-50">
                ⚠️ Don’t forget to click the Save button after making changes.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto w-full">
        <div className="shadow-lg rounded-lg min-w-max border border-gray-300">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-200 sticky top-0 z-10">
              <tr>
                {columnStructure.map((col) => (
                  <th
                    key={col.key}
                    rowSpan={col.rowspan || 1}
                    colSpan={col.colspan || 1}
                    className={`px-4 py-2 text-center text-sm font-semibold text-gray-700 border border-gray-300 ${
                      col.key === "name" ? "min-w-[300px]" : ""
                    }`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row) => (
                <tr key={row.coloumnId} className="hover:bg-yellow-50">
                  {columnStructure.map((col) => {
                    const isNumeric =
                      col.key === "totalAmount" ||
                      col.key === "received" ||
                      col.key === "credit" ||
                      col.key === "balance";

                    return (
                      <td
                        key={col.key}
                        className={`p-0 text-sm border border-gray-200 align-top ${
                          isNumeric ? "text-right" : "text-left"
                        }`}
                      >
                        {col.key === "name" ? (
                          <textarea
                            value={row[col.key] ?? ""}
                            onChange={(e) =>
                              handleCellChange(
                                row.coloumnId,
                                col.key,
                                e.target.value
                              )
                            }
                            className="w-full px-1 py-0.5 border-none focus:outline-none resize-none overflow-hidden bg-transparent text-left font-medium"
                            rows={1}
                            style={{ minHeight: "24px" }}
                            onInput={(e) => {
                              e.target.style.height = "auto";
                              e.target.style.height =
                                e.target.scrollHeight + "px";
                            }}
                          />
                        ) : (
                          <input
                            type="text"
                            value={row[col.key] ?? ""}
                            onChange={(e) =>
                              handleCellChange(
                                row.coloumnId,
                                col.key,
                                e.target.value
                              )
                            }
                            className={`w-full h-full px-1 py-0.5 focus:outline-none border-none bg-transparent ${
                              isNumeric ? "text-right font-medium" : "text-left"
                            }`}
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* TOTALS ROW */}
              <tr className="bg-gray-100 font-bold text-black">
                <td className="border px-2 py-1 text-center" colSpan={3}>
                  TOTAL
                </td>

                <td className="border px-2 py-1 text-right">
                  {totals.totalAmount.toFixed(2)}
                </td>

                <td className="border px-2 py-1 text-right">
                  {totals.received.toFixed(2)}
                </td>

                <td className="border px-2 py-1 text-right">
                  {totals.credit.toFixed(2)}
                </td>

                <td className="border px-2 py-1 text-right">
                  {totals.balance.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default IncomeSheet;
