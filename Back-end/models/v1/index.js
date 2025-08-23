const Leads = require('./Customer/leads');
const contacts = require('./Customer/contacts');
const signup = require('./Authentication/authModel');
const meetings = require('./Customer/meetings')

// Define associations
Leads.belongsTo(signup, { foreignKey: 'staffId', as: 'assignedStaff' });
signup.hasMany(Leads, { foreignKey: 'staffId', as: 'leads' });

contacts.belongsTo(signup, { foreignKey: 'staffId', as: 'assignedStaff' });
signup.hasMany(contacts, { foreignKey: 'staffId', as: 'contacts' });

meetings.belongsTo(contacts, { foreignKey: 'contactId', as: 'assignedCustomer' })
contacts.hasMany(meetings, { foreignKey: 'contactId', as: 'contacts' });

meetings.belongsTo(signup, { foreignKey: 'staffId', as: 'staff' })
signup.hasMany(meetings, { foreignKey: 'staffId', as: 'meetings' });

module.exports = { Leads, signup, contacts };
