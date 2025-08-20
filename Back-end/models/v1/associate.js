const Leads = require('../../models/v1/Customer/leads');
const contacts = require('../../models/v1/Customer/contacts');
const authModel = require('../../models/v1/Authentication/authModel');

// Define associations
Leads.belongsTo(authModel, { foreignKey: 'staffId', as: 'assignedStaff' });
authModel.hasMany(Leads, { foreignKey: 'staffId', as: 'leads' });
contacts.belongsTo(authModel, { foreignKey: 'staffId', as: 'assignedStaff' });
authModel.hasMany(contacts, { foreignKey: 'staffId', as: 'contacts' });

module.exports = { Leads, authModel, contacts };
