const getAllUsers= (req,res)=>{
    res.send("Getting all users");
};

const signup=(req,res)=>{
    res.send("Signing Up");
};

const login=(req,res)=>{
    res.send("logining ");
};

const getUserProfile=(req,res)=>{
    res.send("Profile Fetched!!! ");
};

const updateUserProfile=(req,res)=>{
    res.send("profile Updated ");
};

const deleteUserProfile=(req,res)=>{
    res.send("Profile Deleted ");
};

module.exports={
    getAllUsers,
    signup,
    login,
    getUserProfile,
    updateUserProfile,
    deleteUserProfile,
};