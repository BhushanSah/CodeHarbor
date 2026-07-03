const mongoose=require("mongoose");
const Repository=require("../models/repoModel");
const User=require("../models/userModel");
const Issue=require("../models/issueModel");

const createIssue= async(req,res)=>{
    const{ title,description}=req.body;
    const repoID=req.params.repositoryId
    try{
        if(!title){
            return res.status(400).json({error:"Issue Title is required!"})
        }
        if(!description){
            return res.status(400).json({error:"Issue description is required!"})
        }
        if (!mongoose.Types.ObjectId.isValid(repoID)) {
            return res.status(400).json({
            error: "Invalid repository ID!",
            });
        }

        const issue=new Issue({
            title,
            description, 
            repository: repoID,  
        });
        
        const result = await issue.save();
        res.status(201).json({
            message:"Issue created!",
            issueID:result._id,
        })

    }catch(err){
        console.error("Error during Issue creation:", err.message);
        return res.status(500).send("Server Error");
    }
};

const updateIssueById= async(req,res)=>{
    const id=req.params.id;
    const{title, description, status}=req.body;
    try{
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
            error: "Invalid issue ID!",
            });
        }    
        
       const issue=await Issue.findById(id);
       if(!issue){
        return res.status(400).json({error:"Issue not found!"});
       }
       if (title) {
        issue.title = title;
       }

       if (description) {
        issue.description = description;
       }

       if (status) {
            if (status !== "open" && status !== "closed") {
                return res.status(400).json({
                error: "Status must be open or closed!",
                 });
            }
            issue.status = status;
        }


       const updatedIssue=await issue.save();
        res.status(201).json({
            message:"Issue updated!",
            issue: updatedIssue,

        })

    }catch(err){
        console.error("Error during Issue updation:", err.message);
        return res.status(500).send("Server Error");
    }
};

const deleteIssueById= async(req,res)=>{
    res.send("deleted issue");
};

const getAllIssues= async(req,res)=>{
    res.send("fetched all issues");
};

const getIssueById= async(req,res)=>{
    res.send("fetched issues");
};

module.exports={
    createIssue,
    updateIssueById,
    deleteIssueById,
    getAllIssues,
    getIssueById,

}


