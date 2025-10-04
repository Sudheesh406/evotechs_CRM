const leads = require("./Customer/leads");
const contacts = require("./Customer/contacts");
const signup = require("./Authentication/authModel");
const meetings = require("./Customer/meetings");
const calls = require("./Customer/calls");
const task = require("./Project/task");
const attendance = require("./Work_space/attendance");
const createTeam = require("./Team_work/team");
const teamHistory = require("./Team_work/teamManagementHistory");
const holiday = require("./Work_space/holiday");
const leaves = require('../../models/v1/Work_space/Leave')
const workAssign = require('../../models/v1/Work_space/workAssign')
const team = require('../../models/v1/Team_work/team')
const secreatCode = require('../../models/v1/Authentication/secreatCode');
const trash = require('../../models/v1/Trash/trash')

// Define associations

// Leads ↔ Staff
leads.belongsTo(signup, { foreignKey: "staffId", as: "assignedStaff" });
signup.hasMany(leads, { foreignKey: "staffId", as: "leads" });

// Contacts ↔ Staff
contacts.belongsTo(signup, { foreignKey: "staffId", as: "assignedStaff" });
signup.hasMany(contacts, { foreignKey: "staffId", as: "contacts" });

// Meetings ↔ Contacts
meetings.belongsTo(contacts, { foreignKey: "contactId", as: "customer" });
contacts.hasMany(meetings, { foreignKey: "contactId", as: "meetings" });

// Meetings ↔ Staff
meetings.belongsTo(signup, { foreignKey: "staffId", as: "staff" });
signup.hasMany(meetings, { foreignKey: "staffId", as: "meetings" });

// Meetings ↔ teamStaff
meetings.belongsTo(signup, { foreignKey: "TeamStaffId", as: "teamStaff" });
signup.hasMany(meetings, { foreignKey: "TeamStaffId", as: "teamMeetings" });

// Calls ↔ Contacts
calls.belongsTo(contacts, { foreignKey: "contactId", as: "customer" });
contacts.hasMany(calls, { foreignKey: "contactId", as: "calls" });

// Calls ↔ Staff
calls.belongsTo(signup, { foreignKey: "staffId", as: "staff" });
signup.hasMany(calls, { foreignKey: "staffId", as: "calls" });

// Calls ↔ teamStaff
calls.belongsTo(signup, { foreignKey: "TeamStaffId", as: "teamStaff" });
signup.hasMany(calls, { foreignKey: "TeamStaffId", as: "teamCalls" });

//task ↔ contacts
task.belongsTo(contacts, { foreignKey: "contactId", as: "customer" });
contacts.hasMany(task, { foreignKey: "contactId", as: "tasks" });

//task ↔ staff
task.belongsTo(signup, { foreignKey: "staffId", as: "staff" });
signup.hasMany(task, { foreignKey: "staffId", as: "tasks" });

//attendance ↔ staff
attendance.belongsTo(signup, { foreignKey: "staffId", as: "staff" });
signup.hasMany(attendance, { foreignKey: "staffId", as: "attendances" });

//team ↔ staff (leaderId and createdAdminId)
createTeam.belongsTo(signup, { foreignKey: "leaderId", as: "leader" });
signup.hasMany(createTeam, { foreignKey: "leaderId", as: "ledTeams" });

createTeam.belongsTo(signup, { foreignKey: "createdAdminId", as: "creator" });
signup.hasMany(createTeam, {
  foreignKey: "createdAdminId",
  as: "createdTeams",
});

//teamHistory ↔ staff
teamHistory.belongsTo(signup, { foreignKey: "staffId", as: "staff" });
signup.hasMany(teamHistory, { foreignKey: "staffId", as: "team" });

//holiday ↔ staff

holiday.belongsTo(signup, { foreignKey: "createdAdminId", as: "creator" });
signup.hasMany(holiday, {
  foreignKey: "createdAdminId",
  as: "createdholidays",
});

//leaves ↔ staff
leaves.belongsTo(signup, { foreignKey: "staffId", as: "staff" });
signup.hasMany(leaves, { foreignKey: "staffId", as: "leaves" });

leaves.belongsTo(signup, { foreignKey: "createdAdminId", as: "creator" });
signup.hasMany(leaves, {
  foreignKey: "createdAdminId",
  as: "createdLeaves",
});

//work ↔ staff
workAssign.belongsTo(signup, { foreignKey: "createrId", as: "creator" });
signup.hasMany(workAssign, { foreignKey: "createrId", as: "createdWorks" });

workAssign.belongsTo(signup, { foreignKey: "staffId", as: "assignedStaff" });
signup.hasMany(workAssign, { foreignKey: "staffId", as: "assignedWorks" });

workAssign.belongsTo(team, { foreignKey: "teamId", as: "team" });
team.hasMany(workAssign, { foreignKey: "teamId", as: "teamWorks" });

secreatCode.belongsTo(signup, {foreignKey: "staffId", as: "staff" })
signup.hasMany(secreatCode, { foreignKey: "staffId", as: "staffDetails" });

trash.belongsTo(signup, {foreignKey: "staffId", as: "staff" })
signup.hasMany(trash, { foreignKey: "staffId", as: "trashDetails" });

module.exports = {
  leads,
  signup,
  contacts,
  calls,
  meetings,
  task,
  attendance,
  createTeam,
  teamHistory,
  holiday,
  leaves
};
