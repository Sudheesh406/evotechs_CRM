import React, { useState, useCallback, useEffect } from "react";
import axios from "../../instance/Axios";
import { v4 as uuidv4 } from "uuid";
import Swal from "sweetalert2";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Phone, Download } from "lucide-react";

// Define the column headers with nesting structure
const columnStructure = [
  { key: "invoiceNo", header: "INVOICE NO", rowspan: 2, isDataCol: true },
  { key: "date", header: "DATE", rowspan: 2, isDataCol: true },
  { key: "transactionId", header: "TRANSACTION_ID", rowspan: 2, isDataCol: true },
  { key: "paymentMethod", header: "PAYMENT METHOD", rowspan: 2, isDataCol: true }, // Added
  { key: "name", header: "NAME OF PERSON/FIRM", rowspan: 2, isDataCol: true },
  { key: "totalAmount", header: "TOTAL AMOUNT", rowspan: 2, isDataCol: true },
  { key: "received", header: "RECEIVED", rowspan: 2, isDataCol: true },
  { key: "credit", header: "CREDIT", rowspan: 2, isDataCol: true },
  { key: "balance", header: "BALANCE", rowspan: 2, isDataCol: true },
  { key: "purpose", header: "PURPOSE", rowspan: 2, isDataCol: true },
];

const createEmptyRow = (id = uuidv4()) => ({
  coloumnId: id,
  invoiceNo: "",
  date: "",
  name: "",
  totalAmount: null,
  received: null,
  credit: null,
  balance: null,
  transactionId: "",
  paymentMethod: "", // Added
  purpose: "",
});

const getDataColumnKeys = (structure) => {
  return structure.map((col) => ({
    key: col.key,
    align: "center", // Forced center alignment
    dataType:
      col.key === "invoiceNo" || col.key === "date" || col.key === "name" || col.key === "transactionId" || col.key === "purpose" || col.key === "paymentMethod"
        ? "text"
        : "number",
  }));
};

const dataColumnKeys = getDataColumnKeys(columnStructure);

const ensureMinRows = (data, minCount) => {
  const newRows = [...data];
  while (newRows.length < minCount) {
    newRows.push(createEmptyRow());
  }
  return newRows;
};

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

  // --- NEW: Effect to handle auto-resize on load and data changes ---
  useEffect(() => {
    const adjustHeights = () => {
      const textareas = document.querySelectorAll("textarea");
      textareas.forEach((textarea) => {
        textarea.style.height = "auto";
        textarea.style.height = textarea.scrollHeight + "px";
      });
    };
    
    // Small timeout to ensure the DOM has rendered the new data
    const timeoutId = setTimeout(adjustHeights, 50);
    return () => clearTimeout(timeoutId);
  }, [data]);

  const fetchIncomeSheet = async () => {
    try {
      const response = await axios.post("/account/income-sheet/get", {
        selectedYear,
        selectedMonth,
        selectedType,
      });

      const res = response.data;

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

const handleCellChange = useCallback((rowId, key, value) => {
  triggerToast();

  setData((prevData) => {
    return prevData.map((row) => {
      if (row.coloumnId === rowId) {
        const columnInfo = dataColumnKeys.find((col) => col.key === key);
        
        if (columnInfo.dataType === "number") {
          // 1. Allow empty string
          if (value === "") return { ...row, [key]: null };
          
          // 2. Allow lone minus sign or decimal point while typing
          if (value === "-" || value === ".") return { ...row, [key]: value };

          // 3. Clean the input but keep minus and dot
          const sanitized = value.replace(/[^0-9.-]/g, "");
          
          // 4. If it's a valid number, store it; otherwise store the sanitized string
          const parsed = parseFloat(sanitized);
          const finalValue = isNaN(parsed) ? sanitized : parsed;
          
          return { ...row, [key]: finalValue };
        }

        return { ...row, [key]: value };
      }
      return row;
    });
  });
}, []);

  const handleAddRows = () => {
    setData((prevData) => {
      const newRows = Array.from({ length: 50 }, () => createEmptyRow());
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
      const res = await axios.post("/account/income-sheet/create", payload);
      setLastSavedData(JSON.stringify(cleanRows));

      Swal.fire({
        icon: "success",
        title: "Saved!",
        text: "Income sheet entries have been saved successfully.",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
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

  const totals = {
  totalAmount: data.reduce((sum, row) => sum + (parseFloat(row.totalAmount) || 0), 0),
  received: data.reduce((sum, row) => sum + (parseFloat(row.received) || 0), 0),
  credit: data.reduce((sum, row) => sum + (parseFloat(row.credit) || 0), 0),
  balance: data.reduce((sum, row) => sum + (parseFloat(row.balance) || 0), 0),
};

  const handleDownload = () => {
    const doc = new jsPDF("l", "mm", "a4");

    doc.setFontSize(18);
    doc.text(`Income Sheet - ${selectedType}`, 14, 15);
    doc.setFontSize(11);
    doc.text(`Period: ${selectedMonth} ${selectedYear}`, 14, 22);

    const filledRows = data.filter((row) =>
      Object.keys(row).some(
        (key) => key !== "coloumnId" && row[key] !== null && row[key] !== ""
      )
    );

    const tableBody = filledRows.map((row) => [
      row.invoiceNo || "",
      row.date || "",
      row.transactionId || "",
      row.paymentMethod || "", // Added
      row.name || "",
      row.totalAmount?.toFixed(2) || "0.00",
      row.received?.toFixed(2) || "0.00",
      row.credit?.toFixed(2) || "0.00",
      row.balance?.toFixed(2) || "0.00",
      row.purpose || "",
    ]);

    tableBody.push([
      { content: "TOTAL", colSpan: 5, styles: { halign: "center", fontStyle: "bold", fillGray: 200 } }, // colSpan updated to 5
      totals.totalAmount.toFixed(2),
      totals.received.toFixed(2),
      totals.credit.toFixed(2),
      totals.balance.toFixed(2),
      "",
    ]);

    autoTable(doc, {
      startY: 30,
      head: [
        ["INVOICE NO", "DATE", "TRANSACTION ID", "METHOD", "NAME OF PERSON/FIRM", "TOTAL", "RECEIVED", "CREDIT", "BALANCE", "PURPOSE"]
      ],
      body: tableBody,
      theme: "grid",
      headStyles: { fillColor: [79, 70, 229], textColor: 255, halign: "center" },
      columnStyles: {
        0: { halign: "center", cellWidth: 18 },
        1: { halign: "center", cellWidth: 18 },
        2: { halign: "center", cellWidth: 30 },
        3: { halign: "center", cellWidth: 20 }, // Method width
        4: { halign: "center", cellWidth: "auto" },
        5: { halign: "center", cellWidth: 20 },
        6: { halign: "center", cellWidth: 20 },
        7: { halign: "center", cellWidth: 20 },
        8: { halign: "center", cellWidth: 20 },
        9: { halign: "center", cellWidth: 25 },
      },
      styles: { fontSize: 8, cellPadding: 2 },
      didParseCell: function (data) {
        if (data.row.index === tableBody.length - 1) {
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });

    doc.save(`Income_Sheet_${selectedType}_${selectedMonth}_${selectedYear}.pdf`);
  };

  return (
    <div className="p-4 overflow-x-auto ">
      <div className="flex justify-between items-center mb-6 border-b pb-3 border-gray-300">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          <span className="text-indigo-600">Finance</span> Income Sheet
        </h1>

        <div className="flex space-x-6">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-md font-semibold text-gray-700 hover:border-gray-400 transition"
          >
            {[
              "January", "February", "March", "April", "May", "June",
              "July", "August", "September", "October", "November", "December",
            ].map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-2 py-2 bg-white border border-gray-300 rounded-lg shadow-md font-semibold text-gray-700 hover:border-gray-400 transition"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-2 py-2 bg-white border border-gray-300 rounded-lg shadow-md font-semibold text-gray-700 hover:border-gray-400 transition"
          >
            <option value="Pathanamthitta">Pathanamthitta</option>
            <option value="Thiruvananthapuram">Thiruvananthapuram</option>
          </select>

          <button
            onClick={handleAddRows}
            className="px-2 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition"
          >
            Add Rows (Current Rows: {data.length})
          </button>

          <div className="relative flex gap-2">
            <button
              onClick={handleDownload}
              className="px-4 py-2   bg-gray-800 text-white font-bold rounded-lg shadow-md hover:bg-gray-900 transition duration-150"
            >
            <Download size={16} />
            </button>
            <button
              onClick={handleSaveChanges}
              className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition"
            >
              Save
            </button>

            {showToast && (
              <div className="absolute top-full mt-2 right-0 w-[200px] bg-red-500 text-black font-bold text-sm px-4 py-3 rounded shadow-md animate-slideDown z-50">
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
                    className={`px-4 py-2 text-center text-sm font-semibold text-gray-700 border border-gray-300 ${
                      col.key === "name" ? "min-w-[300px]" : 
                      col.key === "transactionId" ? "min-w-[200px]" : 
                      col.key === "paymentMethod" ? "min-w-[150px]" : // Added width for new col
                      col.key === "purpose" ? "min-w-[200px]" : ""
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
                    const isTextArea = col.key === "name" || col.key === "transactionId" || col.key === "purpose" || col.key === "paymentMethod";

                    return (
                      <td
                        key={col.key}
                        className="p-0 text-sm border border-gray-200 align-middle text-center"
                      >
                        {isTextArea ? (
                          <textarea
                            value={row[col.key] ?? ""}
                            onChange={(e) =>
                              handleCellChange(row.coloumnId, col.key, e.target.value)
                            }
                            className="w-full px-1 py-1 border-none focus:outline-none resize-none overflow-hidden bg-transparent text-center font-medium block"
                            rows={1}
                            style={{ minHeight: "24px", height: "auto" }}
                            onInput={(e) => {
                              e.target.style.height = "auto";
                              e.target.style.height = e.target.scrollHeight + "px";
                            }}
                          />
                        ) : (
                          <input
                            type="text"
                            value={row[col.key] ?? ""}
                            onChange={(e) =>
                              handleCellChange(row.coloumnId, col.key, e.target.value)
                            }
                            className="w-full h-full px-1 py-1 focus:outline-none border-none bg-transparent text-center font-medium"
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}

              <tr className="bg-gray-100 font-bold text-black">
                <td className="border px-2 py-2 text-center" colSpan={5}>
                  TOTAL
                </td>
                <td className="border px-2 py-2 text-center">{totals.totalAmount.toFixed(2)}</td>
                <td className="border px-2 py-2 text-center">{totals.received.toFixed(2)}</td>
                <td className="border px-2 py-2 text-center">{totals.credit.toFixed(2)}</td>
                <td className="border px-2 py-2 text-center">{totals.balance.toFixed(2)}</td>
                <td className="border px-2 py-2"></td> 
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default IncomeSheet;