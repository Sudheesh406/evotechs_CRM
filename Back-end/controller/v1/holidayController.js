const {httpSuccess, httpError} = require('../../utils/v1/httpResponse');
const holiday = require('../../models/v1/Work_space/holiday');

const addHoliday = async (req, res) => {
    try {
        
    } catch (error) {
        console.error('Error adding holiday:', error);
        return httpError(res, 500, 'Failed to add holiday');
    }
}

