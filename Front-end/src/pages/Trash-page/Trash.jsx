import React, { useState } from 'react';

const fakeTrashData = [
  // ... (Paste the fake data from section 2 here)
  {
    id: 101,
    name: 'Acme Corp - New Opportunity',
    type: 'Lead',
    deletedBy: 'Alice Johnson',
    deletionDate: '2025-09-28T10:30:00Z',
  },
  {
    id: 205,
    name: 'John Smith',
    type: 'Contact',
    deletedBy: 'Bob Williams',
    deletionDate: '2025-09-29T14:45:00Z',
  },
  {
    id: 312,
    name: 'Q4 Budget Planning',
    type: 'Meeting',
    deletedBy: 'Alice Johnson',
    deletionDate: '2025-09-27T09:00:00Z',
  },
  {
    id: 408,
    name: 'Follow-up with VP of Sales',
    type: 'Task',
    deletedBy: 'Bob Williams',
    deletionDate: '2025-09-30T08:15:00Z',
  },
  {
    id: 501,
    name: 'Project Phoenix Migration',
    type: 'Project',
    deletedBy: 'Charlie Davis',
    deletionDate: '2025-09-25T11:20:00Z',
  },
  {
    id: 602,
    name: 'Outgoing call to Jane Doe',
    type: 'Call',
    deletedBy: 'Charlie Davis',
    deletionDate: '2025-09-26T16:50:00Z',
  },
];

// Helper function to format the date nicely
const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function Trash() {
  const [data, setData] = useState(fakeTrashData);
  const [filterType, setFilterType] = useState('All');

  // Renders the list of unique types for the filter dropdown
  const uniqueTypes = ['All', ...new Set(fakeTrashData.map(item => item.type))];

  // Logic to filter the data based on the selected type
  const filteredData = data.filter(item => {
    if (filterType === 'All') return true;
    return item.type === filterType;
  });

  const handleRestore = (id) => {
    // In a real app, you would make an API call here to restore the item
    alert(`Restoring item ID: ${id}`);
    setData(data.filter(item => item.id !== id)); // Remove from the local trash view
  };

  const handlePermanentDelete = (id) => {
    // In a real app, you would make an API call here to permanently delete the item
    if (window.confirm('Are you sure you want to PERMANENTLY delete this item?')) {
        alert(`Permanently deleting item ID: ${id}`);
        setData(data.filter(item => item.id !== id)); // Remove from the local trash view
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>System Trash Can</h1>
      <p>Items are automatically deleted permanently after **30 days**.</p>
      
      {/* FILTER AND ACTIONS BAR */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <label htmlFor="type-filter">Filter by Type:</label>
        <select
          id="type-filter"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{ padding: '8px' }}
        >
          {uniqueTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        {/* Bulk delete/restore buttons can go here */}
      </div>
      
      {/* TRASH TABLE */}
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: '#f4f4f4' }}>
            <th style={tableHeaderStyle}>Name / Subject</th>
            <th style={tableHeaderStyle}>Type</th>
            <th style={tableHeaderStyle}>Deleted By</th>
            <th style={tableHeaderStyle}>Deletion Date</th>
            <th style={tableHeaderStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length === 0 ? (
            <tr>
                <td colSpan="5" style={{ padding: '15px', textAlign: 'center' }}>
                    The trash can is empty for the selected filter.
                </td>
            </tr>
          ) : (
            filteredData.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={tableCellStyle}><strong>{item.name}</strong></td>
                <td style={tableCellStyle}>
                  <span style={getTypeBadgeStyle(item.type)}>
                    {item.type}
                  </span>
                </td>
                <td style={tableCellStyle}>{item.deletedBy}</td>
                <td style={tableCellStyle}>{formatDate(item.deletionDate)}</td>
                <td style={tableCellStyle}>
                  <button onClick={() => handleRestore(item.id)} style={actionButtonStyle.restore}>
                    Restore
                  </button>
                  <button onClick={() => handlePermanentDelete(item.id)} style={actionButtonStyle.delete}>
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// Basic Inline Styles (You'd use CSS or a UI library in a real app)
const tableHeaderStyle = { padding: '10px', borderBottom: '2px solid #ccc' };
const tableCellStyle = { padding: '10px' };
const actionButtonStyle = {
    restore: { marginRight: '5px', padding: '5px 10px', cursor: 'pointer', border: '1px solid #2ecc71', backgroundColor: '#2ecc71', color: 'white' },
    delete: { padding: '5px 10px', cursor: 'pointer', border: '1px solid #e74c3c', backgroundColor: '#e74c3c', color: 'white' },
};

const typeColors = {
  'Lead': '#3498db', 'Contact': '#27ae60', 'Meeting': '#f39c12', 
  'Call': '#9b59b6', 'Task': '#c0392b', 'Project': '#1abc9c' 
};

const getTypeBadgeStyle = (type) => ({
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '4px',
    backgroundColor: typeColors[type] || '#7f8c8d',
    color: 'white',
    fontSize: '0.8em',
    fontWeight: 'bold',
});

export default Trash;