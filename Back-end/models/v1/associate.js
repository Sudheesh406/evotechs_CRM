const Leads = require('../../models/v1/Customer/leads');
const contacts = require('../../models/v1/Customer/contacts');
const authModel = require('../../models/v1/Authentication/authModel');
const meetings = require('../../models/v1/Customer/meetings')

// Define associations
Leads.belongsTo(authModel, { foreignKey: 'staffId', as: 'assignedStaff' });
authModel.hasMany(Leads, { foreignKey: 'staffId', as: 'leads' });

contacts.belongsTo(authModel, { foreignKey: 'staffId', as: 'assignedStaff' });
authModel.hasMany(contacts, { foreignKey: 'staffId', as: 'contacts' });

meetings.belongsTo(contacts, { foreignKey: 'contactId', as: 'assignedCustomer' })
contacts.hasMany(meetings, { foreignKey: 'contactId', as: 'contacts' });

module.exports = { Leads, authModel, contacts };
