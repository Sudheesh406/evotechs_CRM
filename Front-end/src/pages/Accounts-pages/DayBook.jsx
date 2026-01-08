import React, { useState, useCallback, useEffect } from "react";
import axios from "../../instance/Axios";
import { v4 as uuidv4 } from "uuid";
import Swal from "sweetalert2";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Phone, Download } from "lucide-react";


// Define the column headers with nesting structure (Transaction ID removed)
const columnStructure = [
  { key: "date", header: "DATE", rowspan: 2, isDataCol: true },
  { key: "particulars", header: "PARTICULARS", rowspan: 2, isDataCol: true },
  {
    key: "payments",
    header: "PAYMENTS",
    colspan: 2,
    children: [
      {
        key: "payments_cash",
        header: "Cash Book",
        isDataCol: true,
        dataType: "number",
      },
      {
        key: "payments_bank",
        header: "Bank Book",
        isDataCol: true,
        dataType: "number",
      },
    ],
  },
  {
    key: "receipts",
    header: "RECEIPTS",
    colspan: 2,
    children: [
      {
        key: "receipts_cash",
        header: "Cash Book",
        isDataCol: true,
        dataType: "number",
      },
      {
        key: "receipts_bank",
        header: "Bank Book",
        isDataCol: true,
        dataType: "number",
      },
    ],
  },
  {
    key: "balance",
    header: "BALANCE",
    colspan: 2,
    children: [
      {
        key: "balance_cash",
        header: "Cash Book",
        isDataCol: true,
        dataType: "number",
      },
      {
        key: "balance_bank",
        header: "Bank Book",
        isDataCol: true,
        dataType: "number",
      },
    ],
  },
];

// Flatten the column keys for the data rows
const getDataColumnKeys = (structure) => {
  return structure.flatMap((col) =>
    col.children
      ? col.children.map((child) => ({
          key: child.key,
          align: "right",
          dataType: child.dataType || "text",
        }))
      : [
          {
            key: col.key,
            align: col.key === "particulars" ? "left" : "right",
            dataType:
              col.key === "date" || col.key === "particulars"
                ? "text"
                : "number",
          },
        ]
  );
};

const dataColumnKeys = getDataColumnKeys(columnStructure);

// Create empty row object
const createEmptyRow = (coloumnId) => {
  const newRow = { coloumnId };
  dataColumnKeys.forEach((col) => {
    newRow[col.key] = col.dataType === "number" ? null : "";
  });
  return newRow;
};

// Ensure minimum rows
const ensureMinRows = (data, minCount) => {
  const newRows = [...data];
  while (newRows.length < minCount) {
    newRows.push(createEmptyRow(uuidv4()));
  }
  return newRows;
};

// --- Recalculate balances dynamically ---
const recalculateBalances = (rows) => {
  let lastCash = 0;
  let lastBank = 0;
  let started = false;

  return rows.map((row) => {
    const hasData = Object.keys(row).some(
      (key) =>
        key !== "coloumnId" &&
        row[key] !== null &&
        row[key] !== "" &&
        key !== "balance_cash" &&
        key !== "balance_bank"
    );

    if (hasData) {
      started = true;
      const rc = Number(row.receipts_cash || 0);
      const pc = Number(row.payments_cash || 0);
      const rb = Number(row.receipts_bank || 0);
      const pb = Number(row.payments_bank || 0);

      lastCash = lastCash + rc - pc;
      lastBank = lastBank + rb - pb;

      return { ...row, balance_cash: lastCash, balance_bank: lastBank };
    }

    return { ...row, balance_cash: "", balance_bank: "" };
  });
};

const DayBook = () => {
  const [data, setData] = useState([]);
  const [nextId, setNextId] = useState(1);
  const [selectedType, setSelectedType] = useState("Pathanamthitta");
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toLocaleString("en-US", { month: "long" })
  );
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [lastSavedData, setLastSavedData] = useState([]);
  const [showToast, setShowToast] = useState(false);

  const fetchDaybook = async () => {
    try {
      const response = await axios.post("/account/day-book/get", {
        selectedYear,
        selectedMonth,
        selectedType,
      });

      const res = response.data;

      if (res.success && res.data) {
        const entries = res.data.entries.map((row) => ({ ...row }));
        const calculatedEntries = recalculateBalances(entries);
        const updated = ensureMinRows(calculatedEntries, 50);
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
      console.log("Error fetching DayBook details", error);
      setData(ensureMinRows([], 50));
      setNextId(1);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchDaybook();
    }, 500);
    return () => clearTimeout(delay);
  }, [selectedYear, selectedMonth, selectedType]);

  // --- ADDED: Auto-resize Effect for Textareas on Data Load ---
  useEffect(() => {
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach((textarea) => {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    });
  }, [data]);

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

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
      return recalculateBalances(newData);
    });
  }, []);

  const handleAddRows = () => {
    setData((prevData) => {
      const newRows = Array.from({ length: 50 }, () =>
        createEmptyRow(uuidv4())
      );
      return [...prevData, ...newRows];
    });
  };

  const handleSaveChanges = async () => {
    const filledRows = data.filter((row) =>
      Object.keys(row).some(
        (key) => key !== "coloumnId" && row[key] !== null && row[key] !== ""
      )
    );

    const cleanRows = filledRows.map((row) => ({ ...row }));

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
      entries: cleanRows,
    };

    try {
      const res = await axios.post("/account/day-book/create", payload);
      setLastSavedData(JSON.stringify(cleanRows));
      Swal.fire({
        icon: "success",
        title: "Saved!",
        text: "Day Book entries have been saved successfully.",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save Day Book entries. Please try again.",
        confirmButtonColor: "#d33",
      });
    }
  };

  const formatValue = (value, isNumeric) => {
    if (value === null || value === undefined) return "";
    return isNumeric && typeof value === "number" ? value.toString() : value;
  };

  const displayFormattedValue = (value, isNumeric) => {
    if (isNumeric && typeof value === "number" && value !== null) {
      return `$${value.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })}`;
    }
    return value;
  };

  const handleDownload = () => {
    const rowsToExport = data.filter((row) =>
      Object.keys(row).some(
        (key) => key !== "coloumnId" && row[key] !== null && row[key] !== ""
      )
    );

    if (rowsToExport.length === 0) {
      Swal.fire("Info", "No data to export", "info");
      return;
    }

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    doc.setFontSize(16);
    doc.text(`Day Book - ${selectedType}`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Period: ${selectedMonth} ${selectedYear}`, 14, 22);

    const head = [
      [
        {
          content: "DATE",
          rowSpan: 2,
          styles: { halign: "center", valign: "middle" },
        },
        {
          content: "PARTICULARS",
          rowSpan: 2,
          styles: { halign: "center", valign: "middle" },
        },
        { content: "PAYMENTS", colSpan: 2, styles: { halign: "center" } },
        { content: "RECEIPTS", colSpan: 2, styles: { halign: "center" } },
        { content: "BALANCE", colSpan: 2, styles: { halign: "center" } },
      ],
      [
        "Cash Book",
        "Bank Book",
        "Cash Book",
        "Bank Book",
        "Cash Book",
        "Bank Book",
      ],
    ];

    const body = rowsToExport.map((row) => [
      row.date || "",
      row.particulars || "",
      row.payments_cash !== null ? row.payments_cash.toLocaleString() : "",
      row.payments_bank !== null ? row.payments_bank.toLocaleString() : "",
      row.receipts_cash !== null ? row.receipts_cash.toLocaleString() : "",
      row.receipts_bank !== null ? row.receipts_bank.toLocaleString() : "",
      row.balance_cash !== "" ? row.balance_cash.toLocaleString() : "",
      row.balance_bank !== "" ? row.balance_bank.toLocaleString() : "",
    ]);

    autoTable(doc, {
      head: head,
      body: body,
      startY: 30,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [79, 70, 229], textColor: 255 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: "auto" },
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "right" },
        5: { halign: "right" },
        6: { halign: "right", fontStyle: "bold" },
        7: { halign: "right", fontStyle: "bold" },
      },
    });

    doc.save(`DayBook_${selectedType}_${selectedMonth}_${selectedYear}.pdf`);
  };

  return (
    <div className="p-4 overflow-x-auto ">
      <div className="flex justify-between items-center mb-6 border-b pb-3 border-gray-300">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          <span className="text-indigo-600">Day</span> Book
        </h1>
        <div className="flex space-x-6">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-md font-semibold text-gray-700 hover:border-gray-400 transition duration-150"
          >
            {[
              "January", "February", "March", "April", "May", "June",
              "July", "August", "September", "October", "November", "December",
            ].map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-md font-semibold text-gray-700 hover:border-gray-400 transition duration-150"
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
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-md font-semibold text-gray-700 hover:border-gray-400 transition duration-150"
          >
            <option value="Pathanamthitta">Pathanamthitta</option>
            <option value="Thiruvananthapuram">Thiruvananthapuram</option>
          </select>
          <button
            onClick={handleAddRows}
            className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition duration-150"
          >
            Add Rows (Current Rows: {data.length})
          </button>
          <div className="relative flex gap-2">
            <button
              onClick={handleDownload}
              className="px-4 py-2  bg-gray-800 text-white font-bold rounded-lg shadow-md hover:bg-gray-900 transition duration-150"
            >
            <Download size={16} />
            </button>
            <button
              onClick={handleSaveChanges}
              className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition duration-150"
            >
              Save Changes
            </button>
            {showToast && (
              <div className="absolute top-full mt-2 right-0 w-[170px] bg-red-500 text-black font-bold text-sm px-4 py-3 rounded shadow-md animate-slideDown z-50">
                ⚠️ Don’t forget to click the Save button after making changes.
              </div>
            )}
          </div>
        </div>
      </div>

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
                    className="px-4 py-2 text-center text-sm font-semibold text-gray-700 border border-gray-300"
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
              <tr>
                {columnStructure.map((col) =>
                  col.children
                    ? col.children.map((child) => (
                        <th
                          key={child.key}
                          className="px-4 py-2 text-center text-xs font-medium text-gray-600 border border-gray-300 border-t-0"
                        >
                          {child.header}
                        </th>
                      ))
                    : null
                )}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row) => (
                <tr key={row.coloumnId} className="hover:bg-yellow-50">
                  {dataColumnKeys.map((col) => {
                    const isNumeric = col.dataType === "number";
                    const isTextArea = col.key === "particulars";
                    const isReadOnly = col.key.startsWith("balance");

                    return (
                      <td
                        key={col.key}
                        className="p-0 text-sm border border-gray-200 align-middle text-center font-medium" 
                      >
                        {isTextArea ? (
                          <textarea
                            value={formatValue(row[col.key], isNumeric)}
                            onChange={(e) =>
                              handleCellChange(
                                row.coloumnId,
                                col.key,
                                e.target.value
                              )
                            }
                            rows={1}
                            className={`w-full px-2 py-1 resize-none overflow-y-hidden focus:outline-none border-none bg-transparent text-center min-w-[300px] ${
                              isReadOnly ? "cursor-not-allowed text-gray-700" : ""
                            }`}
                            readOnly={isReadOnly}
                            onInput={(e) => {
                              e.target.style.height = "auto";
                              e.target.style.height = e.target.scrollHeight + "px";
                            }}
                          />
                        ) : (
                          <input
                            type="text"
                            value={formatValue(row[col.key], isNumeric)}
                            onChange={(e) =>
                              handleCellChange(
                                row.coloumnId,
                                col.key,
                                e.target.value
                              )
                            }
                            className={`w-full h-full min-w-[100px] px-2 py-2 focus:outline-none border-none bg-transparent text-center ${
                              isNumeric ? "font-medium" : ""
                            } ${
                              isReadOnly ? "cursor-not-allowed text-gray-700" : ""
                            }`}
                            readOnly={isReadOnly}
                            placeholder={
                              isReadOnly
                                ? displayFormattedValue(row[col.key], isNumeric)
                                : ""
                            }
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DayBook;