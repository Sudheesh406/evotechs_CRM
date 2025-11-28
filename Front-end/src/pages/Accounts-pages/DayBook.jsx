import React, { useState, useCallback } from 'react';

// --- INITIAL DATA & STRUCTURE (Kept the same for consistency) ---

// Example Data Structure
const initialData = [
  { id: 1, date: 'Jan 01', particulars: 'Opening Balance: Initial cash and bank deposit from owner for business operations.', payments_cash: null, payments_bank: null, receipts_cash: 50000, receipts_bank: 100000, balance_cash: 50000, balance_bank: 100000 },
  { id: 2, date: 'Jan 05', particulars: 'Goods Purchase: Bought inventory from ABC Suppliers via cash payment for immediate resale.', payments_cash: 15000, payments_bank: 0, receipts_cash: null, receipts_bank: null, balance_cash: 35000, balance_bank: 100000 },
  { id: 3, date: 'Jan 10', particulars: 'Service Fee: Received payment for consulting services rendered to Client X. This was a direct deposit.', payments_cash: null, payments_bank: null, receipts_cash: 8500, receipts_bank: 0, balance_cash: 43500, balance_bank: 100000 },
];

// Define the column headers with nesting structure
const columnStructure = [
  { key: 'date', header: 'Date', rowspan: 2, isDataCol: true },
  { key: 'particulars', header: 'PARTICULARS', rowspan: 2, isDataCol: true },
  {
    key: 'payments',
    header: 'PAYMENTS',
    colspan: 2,
    children: [
      { key: 'payments_cash', header: 'Cash Book', isDataCol: true, dataType: 'number' },
      { key: 'payments_bank', header: 'Bank Book', isDataCol: true, dataType: 'number' },
    ],
  },
  {
    key: 'receipts',
    header: 'RECEIPTS',
    colspan: 2,
    children: [
      { key: 'receipts_cash', header: 'Cash Book', isDataCol: true, dataType: 'number' },
      { key: 'receipts_bank', header: 'Bank Book', isDataCol: true, dataType: 'number' },
    ],
  },
  {
    key: 'balance',
    header: 'BALANCE',
    colspan: 2,
    children: [
      { key: 'balance_cash', header: 'Cash Book', isDataCol: true, dataType: 'number' },
      { key: 'balance_bank', header: 'Bank Book', isDataCol: true, dataType: 'number' },
    ],
  },
];

// Utility function to flatten the column keys for the data rows
const getDataColumnKeys = (structure) => {
  return structure.flatMap(col => 
    col.children 
      ? col.children.map(child => ({ 
          key: child.key, 
          align: 'right', 
          dataType: child.dataType || 'text' 
        })) 
      : [{ 
          key: col.key, 
          align: col.key === 'particulars' ? 'left' : 'right', // Particulars is text, others are amounts/dates
          dataType: col.key === 'date' || col.key === 'particulars' ? 'text' : 'number'
        }]
  );
};

const dataColumnKeys = getDataColumnKeys(columnStructure);

// Utility function to create an empty row object
const createEmptyRow = (id) => {
  const newRow = { id };
  dataColumnKeys.forEach(col => {
    // Set numerical columns to null/0 and text columns to empty string
    newRow[col.key] = col.dataType === 'number' ? null : '';
  });
  // You might want to pre-calculate the initial balance row here if it's not the 'Opening Balance'
  return newRow;
};

// Function to ensure a minimum of 50 rows in the initial data
const ensureMinRows = (data, minCount) => {
  const newRows = [...data];
  let currentMaxId = newRows.length > 0 ? Math.max(...newRows.map(r => r.id)) : 0;

  while (newRows.length < minCount) {
    currentMaxId++;
    newRows.push(createEmptyRow(currentMaxId));
  }
  return newRows;
};

// --- REACT COMPONENT ---

const ExcelGrid = () => {
  // Initialize data with minimum 50 rows
  const [data, setData] = useState(() => ensureMinRows(initialData, 50));
  const [nextId, setNextId] = useState(() => data.length > 0 ? Math.max(...data.map(r => r.id)) + 1 : 1);

  // --- HANDLERS ---

  // Handle cell data change
  const handleCellChange = useCallback((rowId, key, value) => {
    setData(prevData =>
      prevData.map(row => {
        if (row.id === rowId) {
          // Type coercion for number fields
          const columnInfo = dataColumnKeys.find(col => col.key === key);
          const formattedValue = columnInfo.dataType === 'number' 
            ? (value === '' ? null : Number(value.replace(/[^0-9.]/g, ''))) 
            : value;
            
          return { ...row, [key]: formattedValue };
        }
        return row;
      })
    );
    // Note: Re-calculating balances is a complex accounting task that should happen here.
    // For this example, we focus on the UI and data entry.
  }, []);

  // Handle adding 50 new rows
  const handleAddRows = () => {
    setData(prevData => {
      const newRows = [];
      let currentId = nextId;
      for (let i = 0; i < 50; i++) {
        newRows.push(createEmptyRow(currentId++));
      }
      setNextId(currentId);
      return [...prevData, ...newRows];
    });
  };
  
  // Handle Save Changes action
  const handleSaveChanges = () => {
  
    console.log("Saving changes...", data.filter(row => row.particulars !== ''));

  };


  // --- RENDER HELPERS ---

  // Format number for display in the input field
  const formatValue = (value, isNumeric) => {
    if (value === null || value === undefined) return '';
    
    // For number fields, convert back to string for the input 'value' prop
    if (isNumeric && typeof value === 'number') {
        return value.toString();
    }
    return value;
  };
  
  // Format data for display (e.g., currency)
  const displayFormattedValue = (value, isNumeric) => {
    if (isNumeric && typeof value === 'number' && value !== null) {
        // Use an appropriate currency format (e.g., Indian Rupees, but using $ for generic look)
        return `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    }
    return value;
  };
  
  // --- RENDER COMPONENT ---

  return (
    <div className="p-4 overflow-x-auto ">
      
      {/* HEADER and BUTTONS ROW */}
      <div className="flex justify-between items-center mb-6 border-b pb-3 border-gray-300">
         <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            <span className="text-indigo-600">Day</span> Book
          </h1>
        
        <div className="flex space-x-6">
            
            {/* Add Rows Button */}
            <button 
                onClick={handleAddRows} 
                className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition duration-150"
            >
                Add 50 Rows (Current Rows: {data.length})
            </button>

            {/* Save Changes Button */}
            <button 
                onClick={handleSaveChanges} 
                className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition duration-150"
            >
                Save Changes
            </button>
        </div>
      </div>

      <div className="overflow-x-auto w-full">
        <div className="shadow-lg rounded-lg min-w-max border border-gray-300">
          
          {/* The Table Structure (Header is unchanged) */}
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
                  col.children ? (
                    col.children.map((child) => (
                      <th
                        key={child.key}
                        className="px-4 py-2 text-center text-xs font-medium text-gray-600 border border-gray-300 border-t-0"
                      >
                        {child.header}
                      </th>
                    ))
                  ) : null
                )}
              </tr>
            </thead>
            
            {/* Table Body (The Data Cells) - **CHANGE HERE** */}
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row) => {
                // NEW: Check if this is the Opening Balance row (ID 1)
                const isOpeningBalanceRow = row.id === 1;

                return (
                <tr key={row.id} className="hover:bg-yellow-50"> 
                  {dataColumnKeys.map((col, index) => {
                    const isNumeric = col.dataType === 'number';
                    const isParticulars = col.key === 'particulars';
                    // The cell is read-only if it's a balance column OR if it's the Opening Balance row
                    const isReadOnly = col.key.startsWith('balance') || isOpeningBalanceRow;
                    
                    return (
                      <td
                        key={col.key}
                        // Adjust padding on the TD and align text
                        className={`p-0 text-sm border border-gray-200 align-top ${col.align === 'right' ? 'text-right' : 'text-left'} ${isReadOnly}`}
                      >
                        
                        {isParticulars ? (
                          /* Use TEXTAREA for Particulars to allow row height to grow */
                          <textarea
                            value={formatValue(row[col.key], isNumeric)}
                            onChange={(e) => handleCellChange(row.id, col.key, e.target.value)}
                            rows={1} // Start with one row
                            className={`w-full min-w-[200px] px-2 py-1 resize-none overflow-y-hidden focus:outline-none focus:border-blue-500 border-none bg-transparent text-left ${isReadOnly ? 'cursor-not-allowed text-gray-700' : ''}`}
                            readOnly={isReadOnly} // **APPLIED HERE**
                            onInput={(e) => {
                              // Auto-resize logic: set height to scrollHeight
                              e.target.style.height = 'auto'; // Reset height
                              e.target.style.height = e.target.scrollHeight + 'px'; // Set to scroll height
                            }}
                          />
                        ) : (
                          /* Use standard INPUT for all other cells */
                          <input
                            type="text"
                            value={formatValue(row[col.key], isNumeric)}
                            onChange={(e) => handleCellChange(row.id, col.key, e.target.value)}
                            className={`w-full h-full min-w-[75px] px-2 py-1 focus:outline-none focus:border-blue-500 border-none bg-transparent 
                              ${isNumeric ? 'text-right font-medium' : 'text-left'} ${isReadOnly ? 'cursor-not-allowed text-gray-700' : ''}`}
                            readOnly={isReadOnly} // **MODIFIED TO INCLUDE isOpeningBalanceRow**
                            placeholder={isReadOnly ? displayFormattedValue(row[col.key], isNumeric) : ''}
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              );})}
            </tbody>
          </table>
          
        </div>
      </div>
      
    </div>
  );
};

export default ExcelGrid;