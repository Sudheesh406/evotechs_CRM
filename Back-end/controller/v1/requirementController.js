const { httpSuccess, httpError } = require("../../utils/v1/httpResponse");
const requirement =  require('../../models/v1/Project/requirements')


const createRequirement = async (req, res) => {
  try {
    const user = req.user; 
    const { data ,project}  = req.body
    console.log(data ,project)

    // Validate required fields
    if (!project || !data.lenght <= 0) {
      return httpError(res, 400, "All fields are required");
    }

    // Optionally: check if email or phone already exists
     const existingRequirement = await requirement.findOne({
      where: { project, staffId: user.id }
    });

    if (existingRequirement) {
      return httpError(res, 409, "A requirement with this project already exists");
    }

    // Create the lead
    const result = await requirement.create({
      project,
      data,
      staffId: user?.id,
    });

    return httpSuccess(res, 201, "requirement created successfully", result);
  } catch (err) {
    console.error("Error in createRequirement:", err);
    return httpError(res, 500, "Server error", err.message);
  }
};

const getRequirement = async (req,res)=>{
    try {
        const user = req.user; 

    const existingRequirements = await requirement.findAll({
      where: { staffId: user.id , softDelete: false}
    });
    
    if (!existingRequirements) {
      return httpError(res, 409, "requirements is not exists");
    }

     return httpSuccess(res, 201, "requirements getted successfully", existingRequirements);

    } catch (error) {
    console.error("Error in getRequirement:", err);
    return httpError(res, 500, "Server error", err.message);  
   }
}

const editRequirement = async (req, res) => {
  try {
    const user = req.user; 
    const id = req.params.id;
    const data = req.body;

    if (!data || !id) {
      return httpError(res, 400, "Data and ID are required");
    }

    // findOne instead of findAll
    const existingRequirement = await requirement.findOne({
      where: { id: id, staffId: user.id }
    });

    if (!existingRequirement) {
      return httpError(res, 403, "Access denied or requirement not found");
    }

    const updatedRequirement = await existingRequirement.update(data);

    return httpSuccess(res, 200, "Requirement updated successfully", updatedRequirement);
        
  } catch (error) {
    console.error("Error in editRequirement:", error);
    return httpError(res, 500, "Server error", error.message); 
  }
};


const deleteRequirement = async (req, res) => {
  try {
    const user = req.user; 
    const id = req.params.id;

    if (!id) {
      return httpError(res, 400, "ID is required");
    }

    const existingRequirement = await requirement.findOne({
      where: { id: id, staffId: user.id }
    });

    if (!existingRequirement) {
      return httpError(res, 404, "Requirement not found");
    }

    const deletedRequirement = await existingRequirement.update({ softDelete: true });

    return httpSuccess(res, 200, "Requirement deleted successfully", deletedRequirement);
  } catch (error) {
    console.error("Error in deleteRequirement:", error);
    return httpError(res, 500, "Server error", error.message); 
  }
};



module.exports = {createRequirement, getRequirement , editRequirement, deleteRequirement}