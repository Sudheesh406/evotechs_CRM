const Leads = require('../../models/v1/Customer/Leads');
const authModel = require('../../models/v1/Authentication/authModel');

// Define associations
Leads.belongsTo(authModel, { foreignKey: 'staffId', as: 'assignedStaff' });
authModel.hasMany(Leads, { foreignKey: 'staffId', as: 'leads' });

module.exports = { Leads, authModel };
