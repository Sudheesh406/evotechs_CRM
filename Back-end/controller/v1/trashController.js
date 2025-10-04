const { httpError, httpSuccess } = require("../../utils/v1/httpResponse");
const trash = require('../../models/v1/Trash/trash');
const calls = require('../../models/v1/Customer/calls');
const contacts = require('../../models/v1/Customer/contacts');
const leads = []
const meetings = require('../../models/v1/Customer/meetings');
const requires = require('../../models/v1/Project/requirements');
const task = require('../../models/v1/Project/task');
const team = require('../../models/v1/Team_work/team');
const workAssign = require('../../models/v1/Work_space/workAssign');

const { Op } = require("sequelize");

const getTrash = async (req, res) => {
  try {
    let { type, date } = req.body;
    const user = req.user;

    if (!type || !date) {
      return httpError(res, 400, "type and date is required");
    }

    const where = { staffId: user.id };

    // Type filter (only if not "All")
    if (type !== "All") {
      where.data = type;
    }

    // Date filter
    if (date !== "All") {
      const now = new Date();
      let start, end;

      switch (date) {
        case "Today":
          start = new Date(now.setHours(0, 0, 0, 0));
          end = new Date(now.setHours(23, 59, 59, 999));
          break;
        case "Yesterday":
          const yesterday = new Date();
          yesterday.setDate(now.getDate() - 1);
          start = new Date(yesterday.setHours(0, 0, 0, 0));
          end = new Date(yesterday.setHours(23, 59, 59, 999));
          break;
        case "This Week":
          const firstDay = new Date(now.setDate(now.getDate() - now.getDay()));
          start = new Date(firstDay.setHours(0, 0, 0, 0));
          end = new Date();
          break;
        case "This Month":
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          end = new Date();
          break;
        case "Last Month":
          start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
          break;
        case "This Year":
          start = new Date(now.getFullYear(), 0, 1);
          end = new Date();
          break;
        default:
          start = null;
          end = null;
      }

      if (start && end) {
        where.date = { [Op.between]: [start, end] };
      }
    }

    // Fetch trash entries
    const trashEntries = await trash.findAll({ where, order: [['date', 'DESC']] });

    // Enrich each entry with actual details
    const enriched = await Promise.all(
      trashEntries.map(async (entry) => {
        let details = null;

        switch (entry.data) {
          case "calls":
            details = await calls.findByPk(entry.dataId);
            break;
          case "leads":
            details = await leads.findByPk(entry.dataId);
            break;
          case "meetings":
            details = await meetings.findByPk(entry.dataId);
            break;
          case "contacts":
            details = await contacts.findByPk(entry.dataId);
            break;
          case "projects":
            details = await requires.findByPk(entry.dataId);
            break;
          case "task":
            details = await task.findByPk(entry.dataId);
            break;
          case "teams":
            details = await team.findByPk(entry.dataId);
            break;
          case "Assignment":
            details = await workAssign.findByPk(entry.dataId);
            break;
          default:
            details = null;
        }

        return {
          ...entry.toJSON(),
          details,
        };
      })
    );

    return httpSuccess(res, 200, "Trash fetched successfully", enriched);
  } catch (error) {
    console.error("Error fetching trash:", error);
    return httpError(res, 500, "Server error", error.message);
  }
};

const modelMap = {
  calls,
  leads,
  meetings,
  contacts,
  projects: requires, // if requires is actually the project model
  task,
  teams: team,
  Assignment: workAssign
};


const restore = async (req, res) => {
  try {
    const user = req.user;
    const { id, data } = req.body;
    console.log(id, data)

    if (!id || !data) {
      return httpError(res, 400, "id and data type is required");
    }

    const existing = await trash.findOne({ where: { data, id, staffId: user.id } });
    if (!existing) return httpError(res, 404, "No data found for this ID");

    const Model = modelMap[data];
    if (!Model) return httpError(res, 400, "Invalid data type");

    const value = await Model.findOne({ where: { id: existing.dataId } });
    if (!value) return httpError(res, 500, "Server error");

    await existing.destroy();
    await value.update({ softDelete: false });

    return httpSuccess(res, 200, "Trash restored successfully");

  } catch (error) {
    console.error("Error restoring trash:", error);
    return httpError(res, 500, "Server error", error.message);
  }
};


const permenantDelete = async (req, res) => {
  try {
    const user = req.user;
    const { id, data } = req.body;
    console.log(id, data)

    if (!id || !data) {
      return httpError(res, 400, "id and data type is required");
    }

    const existing = await trash.findOne({ where: { data, id, staffId: user.id } });
    if (!existing) return httpError(res, 404, "No data found for this ID");
    

    const Model = modelMap[data];
    if (!Model) return httpError(res, 400, "Invalid data type");

    const value = await Model.findOne({ where: { id: existing.dataId } });
    if (!value) return httpError(res, 500, "Server error");

    await existing.destroy();
    await value.destroy();

    return httpSuccess(res, 200, "Trash deleted successfully");

  } catch (error) {
    console.error("Error deleting trash:", error);
    return httpError(res, 500, "Server error", error.message);
  }
};

module.exports = { getTrash, restore, permenantDelete };
