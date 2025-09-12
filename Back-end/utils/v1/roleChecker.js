const signup = require('../../models/v1/Authentication/authModel')

const roleChecker = async (id)=>{
    try {
        const acess = await signup.findOne({where:{id}});
        if(acess && acess.role === 'admin'){
            return true
        }else{
            return false
        }

    } catch (error) {
        console.log('error found in role checker',error);
        return null
    }
}

module.exports = roleChecker;