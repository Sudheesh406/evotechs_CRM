const Leads = require('./Customer/leads');
const contacts = require('./Customer/contacts');
const signup = require('./Authentication/authModel');
const meetings = require('./Customer/meetings')
const calls = require('./Customer/calls')
const task = require('./Project/task')
const attendance = require('./Work_space/attendance')
const createTeam = require('./Team_work/team')
const teamHistory = require('./Team_work/teamManagementHistory')

// Define associations

// Leads ↔ Staff
Leads.belongsTo(signup, { foreignKey: 'staffId', as: 'assignedStaff' });
signup.hasMany(Leads, { foreignKey: 'staffId', as: 'leads' });

// Contacts ↔ Staff
contacts.belongsTo(signup, { foreignKey: 'staffId', as: 'assignedStaff' });
signup.hasMany(contacts, { foreignKey: 'staffId', as: 'contacts' });

// Meetings ↔ Contacts
meetings.belongsTo(contacts, { foreignKey: 'contactId', as: 'customer' });
contacts.hasMany(meetings, { foreignKey: 'contactId', as: 'meetings' });

// Meetings ↔ Staff
meetings.belongsTo(signup, { foreignKey: 'staffId', as: 'staff' });
signup.hasMany(meetings, { foreignKey: 'staffId', as: 'meetings' });

// Calls ↔ Contacts
calls.belongsTo(contacts, { foreignKey: 'contactId', as: 'customer' });
contacts.hasMany(calls, { foreignKey: 'contactId', as: 'calls' });

// Calls ↔ Staff
calls.belongsTo(signup, { foreignKey: 'staffId', as: 'staff' });
signup.hasMany(calls, { foreignKey: 'staffId', as: 'calls' });

//task ↔ contacts
task.belongsTo(contacts, { foreignKey: 'contactId', as: 'customer' });
contacts.hasMany(task, { foreignKey: 'contactId', as: 'tasks' });

//task ↔ staff
task.belongsTo(signup, { foreignKey: 'staffId', as: 'staff' });
signup.hasMany(task, { foreignKey: 'staffId', as: 'tasks' });

//attendance ↔ staff
attendance.belongsTo(signup, { foreignKey: 'staffId', as: 'staff' });
signup.hasMany(attendance, { foreignKey: 'staffId', as: 'attendances' });

//team ↔ staff (leaderId and createdAdminId)
createTeam.belongsTo(signup, { foreignKey: 'leaderId', as: 'leader' });
signup.hasMany(createTeam, { foreignKey: 'leaderId', as: 'ledTeams' });

createTeam.belongsTo(signup, { foreignKey: 'createdAdminId', as: 'creator' });
signup.hasMany(createTeam, { foreignKey: 'createdAdminId', as: 'createdTeams' });


teamHistory.belongsTo(signup, { foreignKey: 'staffId', as: 'staff' });
signup.hasMany(teamHistory, { foreignKey: 'staffId', as: 'team' });


module.exports = { Leads, signup, contacts, calls, meetings, task, attendance, createTeam, teamHistory };