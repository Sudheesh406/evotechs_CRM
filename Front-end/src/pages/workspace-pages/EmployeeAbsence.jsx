import React, { useState, useCallback, useMemo, useEffect } from "react";
import axios from "../../instance/Axios";
import Swal from "sweetalert2";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const getMonthName = (monthString) => {
  // Expected format is 'YYYY-MM', e.g., '2025-11'
  const monthIndex = parseInt(monthString.split("-")[1], 10) - 1;
  return MONTHS[monthIndex];
};

const transformStaffData = (apiData) => {
  return apiData.map((staff) => {
    // 1. Convert the monthlySummary array into the required monthlyData object:
    // { Jan: { leave: 1, wfh: 0 }, Feb: { leave: 0, wfh: 0 }, ... }
    const monthlyData = staff.monthlySummary.reduce((acc, summary) => {
      const monthName = getMonthName(summary.month);
      acc[monthName] = {
        leave: summary.leave,
        wfh: summary.wfh,
      };
      return acc;
    }, {});

    // 2. Initialize missing months to 0 to ensure the table renders all 12 columns correctly
    const completeMonthlyData = MONTHS.reduce((acc, month) => {
      acc[month] = acc[month] || { leave: 0, wfh: 0 };
      return acc;
    }, monthlyData);

    return {
      id: staff.staffId,
      name: staff.staffName,
      monthlyData: completeMonthlyData,
      // Map API fields to component state fields
      totalAllocationLeave: staff.allocatedLeaves,
      totalAllocationWfh: staff.allocatedWFH,
    };
  });
};

// Utility function to calculate total taken and remaining balance (SPLIT)
const calculateTotals = (staff) => {
  const { totalAllocationLeave, totalAllocationWfh } = staff;

  const { totalTakenLeave, totalTakenWfh } = MONTHS.reduce(
    (acc, month) => {
      const monthData = staff.monthlyData[month] || { leave: 0, wfh: 0 };
      acc.totalTakenLeave += monthData.leave;
      acc.totalTakenWfh += monthData.wfh;
      return acc;
    },
    { totalTakenLeave: 0, totalTakenWfh: 0 }
  );

  const balanceLeave = totalAllocationLeave - totalTakenLeave;
  const balanceWfh = totalAllocationWfh - totalTakenWfh;

  return {
    totalTakenLeave,
    totalTakenWfh,
    balanceLeave,
    balanceWfh,
  };
};

// --- Editable Cell Component (Unchanged) ---
const EditableCell = ({ value, onChange, className = "" }) => {
  const [inputValue, setInputValue] = useState(String(value));

  React.useEffect(() => {
    setInputValue(String(value));
  }, [value]);

  const handleChange = (e) => {
    const rawValue = e.target.value;
    setInputValue(rawValue);

    let numValue = parseInt(rawValue, 10);
    if (isNaN(numValue) || numValue < 0) {
      numValue = 0;
    }
    onChange(numValue);
  };

  const handleBlur = () => {
    let numValue = parseInt(inputValue, 10);
    if (isNaN(numValue) || numValue < 0) {
      numValue = 0;
    }
    setInputValue(String(numValue));
  };

  return (
    <input
      type="text"
      value={inputValue}
      onChange={handleChange}
      onBlur={handleBlur}
      className={`w-full h-full text-center bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-lg p-1 transition-all ${className}`}
      style={{ minWidth: "1.5rem" }}
      aria-label="Editable data cell"
    />
  );
};

// --- Main App Component (MODIFIED) ---
const EmployeeAbsence = () => {
  // Initialize with an empty array.
  const [staffData, setStaffData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // State to track *ONLY* the changes made via the EditableCell inputs
  const [updatedAllocations, setUpdatedAllocations] = useState({});

  // Combine current staffData with uncommitted updatedAllocations for the UI display
  const displayStaffData = useMemo(() => {
    if (staffData.length === 0) return [];

    return staffData.map((staff) => {
      const uncommittedUpdates = updatedAllocations[staff.id] || {};

      // Apply uncommitted updates for display
      const staffWithUpdates = {
        ...staff,
        ...uncommittedUpdates,
      };

      // Recalculate totals based on the uncommitted values
      const totals = calculateTotals(staffWithUpdates);

      return {
        ...staffWithUpdates,
        ...totals,
      };
    });
  }, [staffData, updatedAllocations]);

  // Handler for changing Total Annual Allocation
  const handleAllocationChange = useCallback((staffId, type, value) => {
    setUpdatedAllocations((prevUpdates) => ({
      ...prevUpdates,
      [staffId]: {
        ...prevUpdates[staffId],
        [type]: value,
      },
    }));
  }, []);

  // Handler for changing monthly leave/wfh data (Kept but not used in UI)
  const handleMonthlyChange = useCallback((staffId, month, type, value) => {
    setStaffData((prevData) =>
      prevData.map((staff) => {
        if (staff.id === staffId) {
          const monthData = staff.monthlyData[month] || { leave: 0, wfh: 0 };
          return {
            ...staff,
            monthlyData: {
              ...staff.monthlyData,
              [month]: {
                ...monthData,
                [type]: value,
              },
            },
          };
        }
        return staff;
      })
    );
  }, []);

  // Save function (UNCHANGED logic for saving allocations)
  const saveDataToServer = async () => {
    const currentYear = new Date().getFullYear();

    const allocationChangesPayload = Object.entries(updatedAllocations).map(
      ([staffId, changes]) => ({
        staffId: parseInt(staffId, 10),
        year: currentYear,
        changes: changes,
      })
    );

    if (allocationChangesPayload.length === 0) {
      Swal.fire({
        icon: "info",
        title: "No Changes",
        text: "There are no updates to save.",
      });
      return;
    }

    try {
      await axios.post("/calendar/leave-WFH-record", allocationChangesPayload);


      // Commit changes to staffData
      setStaffData((prevData) => {
        let newData = [...prevData];

        allocationChangesPayload.forEach((item) => {
          newData = newData.map((staff) => {
            if (staff.id === item.staffId) {
              return {
                ...staff,
                ...item.changes,
              };
            }
            return staff;
          });
        });

        return newData;
      });

      // Clear pending updates
      setUpdatedAllocations({});

      // 🟢 SweetAlert Success Notification
      Swal.fire({
        icon: "success",
        title: "Saved Successfully!",
        text: "Leave and WFH allocations updated.",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error saving data:", error);

      // 🔴 SweetAlert Error Notification
      Swal.fire({
        icon: "error",
        title: "Save Failed!",
        text: "Something went wrong while saving.",
      });
    }
  };

  const fetchDataFromServer = async () => {
    setIsLoading(true);

    try {
      const { data } = await axios.get("/calendar/leave-WFH-record");


      if (data.data && Array.isArray(data.data)) {
        const transformedData = transformStaffData(data.data);
        setStaffData(transformedData);
      }
    } catch (error) {
      console.error("Error fetching data from server:", error);
      setStaffData([]);

      // 🔴 Error Alert
      Swal.fire({
        icon: "error",
        title: "Unable to Load Data",
        text: "Something went wrong while fetching records.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchDataFromServer();
  }, []);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-lg font-semibold text-indigo-600">
        Loading Absence Data...
      </div>
    );
  }

  if (displayStaffData.length === 0) {
    return (
      <div className="p-8 text-center text-lg font-semibold text-gray-500">
        No staff data available for tracking.
      </div>
    );
  }

  const handleDownload = () => {
    if (displayStaffData.length === 0) {
      Swal.fire("Error", "No data available to download", "error");
      return;
    }

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a3",
    }); // Using A3 landscape for the many columns

    const currentYear = new Date().getFullYear();
    doc.setFontSize(16);
    doc.text(`Annual Leave & WFH Report - ${currentYear}`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

    // 1. Define Columns
    // First Column: Name
    const tableColumn = ["Staff Name"];

    // Add 2 columns for every month
    MONTHS.forEach((month) => {
      tableColumn.push(`${month} (WFH)`, `${month} (Leave)`);
    });

    // Add Summary Columns
    tableColumn.push(
      "Total WFH",
      "Total Leave",
      "Bal WFH",
      "Bal Leave",
      "Alloc WFH",
      "Alloc Leave"
    );

    // 2. Map Data to Rows
    const tableRows = displayStaffData.map((staff) => {
      const row = [staff.name];

      // Add monthly data
      MONTHS.forEach((month) => {
        const mData = staff.monthlyData[month] || { wfh: 0, leave: 0 };
        row.push(mData.wfh, mData.leave);
      });

      // Add Summary totals
      row.push(
        staff.totalTakenWfh,
        staff.totalTakenLeave,
        staff.balanceWfh,
        staff.balanceLeave,
        staff.totalAllocationWfh,
        staff.totalAllocationLeave
      );

      return row;
    });

    // 3. Render Table
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: "grid",
      styles: { fontSize: 7, cellPadding: 1 },
      headStyles: {
        fillColor: [79, 70, 229], // Indigo-600 to match your UI
        textColor: 255,
        halign: "center",
      },
      columnStyles: {
        0: { fontStyle: "bold", fontSize: 8, minCellWidth: 30 }, // Staff Name column
      },
      // Conditional styling for balances
      didParseCell: (data) => {
        // If it's the Balance WFH or Balance Leave column and value is negative
        if (
          (data.column.index === 27 || data.column.index === 28) &&
          parseFloat(data.cell.raw) < 0
        ) {
          data.cell.styles.textColor = [220, 38, 38]; // Red text
          data.cell.styles.fontStyle = "bold";
        }
      },
    });

    const fileName = `Absence_Report_${currentYear}_${
      new Date().toISOString().split("T")[0]
    }.pdf`;
    doc.save(fileName);

    Swal.fire({
      icon: "success",
      title: "Success",
      text: "PDF Downloaded Successfully",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  return (
    <div className="bg-white p-4 sm:p-8 font-sans">
      <header className="mb-6 pb-2 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            <span className="text-indigo-600">Annual Leave</span> & WFH Tracking
          </h1>
          <div>
            <button
              onClick={handleDownload}
              className="mr-2 px-4 py-2 bg-gray-800 text-white font-semibold rounded-lg shadow-md hover:bg-gray-900 transition-colors"
            >
              Download
            </button>
            <button
              onClick={saveDataToServer}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Save Changes
            </button>
          </div>
        </div>
        <p className="text-gray-500 mt-2">
          Annual Consolidated Report of Staff Leave Allocations, Usage Patterns,
          and Work-From-Home History.
        </p>
      </header>

      <div className="overflow-x-auto shadow-lg rounded-xl border border-gray-100">
        <table className="w-full text-sm text-gray-700 divide-y divide-gray-200">
          {/* Table Header (Unchanged) */}
          <thead className="bg-white sticky top-0 z-10 border-b-2 border-blue-500">
            <tr>
              <th
                rowSpan="3"
                className="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider bg-white sticky left-0 z-20 rounded-tl-xl border-r border-gray-200 text-blue-700"
                style={{ minWidth: "130px" }}
              >
                Staff Name
              </th>
              <th
                colSpan="24"
                className="px-2 py-2 text-center font-bold text-sm uppercase tracking-wider border-b border-gray-200 bg-gray-50 text-gray-800"
              >
                Monthly Breakdown
              </th>
              <th
                colSpan="2"
                rowSpan="2"
                className="px-4 py-3 text-center font-bold text-xs uppercase tracking-wider bg-blue-50 border-l border-r border-blue-200 text-blue-700"
              >
                Total (Taken)
              </th>
              <th
                colSpan="2"
                rowSpan="2"
                className="px-4 py-3 text-center font-bold text-xs uppercase tracking-wider bg-blue-50 border-r border-blue-200 text-blue-700"
              >
                Balance (Year)
              </th>
              <th
                colSpan="2"
                rowSpan="2"
                className="px-4 py-3 text-center font-bold text-xs uppercase tracking-wider bg-green-100 rounded-tr-xl text-green-700"
              >
                Total Allocation (Year)
              </th>
            </tr>

            {/* 2. Month Names & Summary Sub-Headers */}
            <tr>
              {MONTHS.map((month) => (
                <th
                  key={month}
                  colSpan="2"
                  className="px-1 py-1 text-center font-bold text-xs text-gray-700 border-r border-gray-200 bg-gray-100"
                >
                  {month}
                </th>
              ))}
            </tr>

            {/* 3. WFH / Leave Labels (Granular Row for all columns) */}
            <tr>
              {MONTHS.map((month) => (
                <React.Fragment key={month}>
                  <th
                    className="px-1 py-1 text-center font-medium text-xs text-blue-600 border-r border-gray-100 bg-gray-50/70"
                    style={{ minWidth: "35px" }}
                  >
                    WFH
                  </th>
                  <th
                    className="px-1 py-1 text-center font-medium text-xs text-red-600 border-r border-gray-100 bg-gray-50/70"
                    style={{ minWidth: "35px" }}
                  >
                    Leave
                  </th>
                </React.Fragment>
              ))}

              <th
                className="px-1 py-1 text-center font-medium text-xs text-blue-600 border-r border-blue-200 bg-blue-50"
                style={{ minWidth: "35px" }}
              >
                WFH
              </th>
              <th
                className="px-1 py-1 text-center font-medium text-xs text-red-600 border-r border-blue-200 bg-blue-50"
                style={{ minWidth: "35px" }}
              >
                Leave
              </th>

              <th
                className="px-1 py-1 text-center font-medium text-xs text-blue-600 border-r border-blue-200 bg-blue-50"
                style={{ minWidth: "35px" }}
              >
                WFH
              </th>
              <th
                className="px-1 py-1 text-center font-medium text-xs text-red-600 border-r border-blue-200 bg-blue-50"
                style={{ minWidth: "35px" }}
              >
                Leave
              </th>

              <th
                className="px-1 py-1 text-center font-medium text-xs text-blue-600 border-r border-green-200 bg-green-100"
                style={{ minWidth: "35px" }}
              >
                WFH
              </th>
              <th
                className="px-1 py-1 text-center font-medium text-xs text-red-600 border-r border-green-200 bg-green-100"
                style={{ minWidth: "35px" }}
              >
                Leave
              </th>
            </tr>
          </thead>

          {/* Table Body (Uses displayStaffData) */}
          <tbody className="bg-white divide-y divide-gray-100">
            {displayStaffData.map((staff) => (
              <tr
                key={staff.id}
                className="hover:bg-blue-50/50 transition-colors"
              >
                {/* Staff Name */}
                <td className="px-4 py-3 font-semibold text-gray-900 sticky left-0 bg-white hover:bg-blue-50/50 z-10 border-r border-gray-200">
                  {staff.name}
                </td>

                {/* Monthly Cells (Read-Only) */}
                {MONTHS.map((month) => {
                  const data = staff.monthlyData[month] || { leave: 0, wfh: 0 };
                  return (
                    <React.Fragment key={month}>
                      <td className="p-1 text-center border-r border-gray-100">
                        <div className="text-blue-600 font-medium text-center py-2">
                          {data.wfh}
                        </div>
                      </td>
                      <td className="p-1 text-center border-r border-gray-100">
                        <div className="text-red-600 font-medium text-center py-2">
                          {data.leave}
                        </div>
                      </td>
                    </React.Fragment>
                  );
                })}

                {/* Total Taken (WFH) */}
                <td className="px-2 py-3 text-center font-bold bg-blue-50 border-x border-blue-200 text-blue-700">
                  {staff.totalTakenWfh}
                </td>

                {/* Total Taken (Leave) */}
                <td className="px-2 py-3 text-center font-bold bg-blue-50 border-r border-blue-200 text-red-700">
                  {staff.totalTakenLeave}
                </td>

                {/* Balance (WFH) */}
                <td
                  className={`px-2 py-3 text-center font-bold border-r border-blue-200 ${
                    staff.balanceWfh < 0
                      ? "bg-red-500 text-white"
                      : "bg-teal-50 text-blue-700"
                  }`}
                >
                  {staff.balanceWfh}
                </td>

                {/* Balance (Leave) */}
                <td
                  className={`px-2 py-3 text-center font-bold border-r border-blue-200 ${
                    staff.balanceLeave < 0
                      ? "bg-red-500 text-white"
                      : "bg-teal-50 text-red-700"
                  }`}
                >
                  {staff.balanceLeave}
                </td>

                {/* Total Annual Allocation (WFH - Editable) */}
                <td className="p-1 text-center bg-green-100 border-r border-green-200">
                  <EditableCell
                    value={staff.totalAllocationWfh}
                    onChange={(value) =>
                      handleAllocationChange(
                        staff.id,
                        "totalAllocationWfh",
                        value
                      )
                    }
                    className="text-blue-700 font-bold bg-green-100 focus:ring-green-300"
                  />
                </td>

                {/* Total Annual Allocation (Leave - Editable) */}
                <td className="p-1 text-center bg-green-100">
                  <EditableCell
                    value={staff.totalAllocationLeave}
                    onChange={(value) =>
                      handleAllocationChange(
                        staff.id,
                        "totalAllocationLeave",
                        value
                      )
                    }
                    className="text-red-700 font-bold bg-green-100 focus:ring-green-300"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeAbsence;
