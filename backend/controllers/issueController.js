const createIssue= (req,res)=>{
    res.send("Issue Created");
};

const updateIssueById= (req,res)=>{
    res.send("Update issues");
};

const deleteIssueById= (req,res)=>{
    res.send("deleted issue");
};

const getAllIssues= (req,res)=>{
    res.send("fetched all issues");
};

const getIssueById= (req,res)=>{
    res.send("fetched issues");
};

module.exports={
    createIssue,
    updateIssueById,
    deleteIssueById,
    getAllIssues,
    getIssueById,

}


