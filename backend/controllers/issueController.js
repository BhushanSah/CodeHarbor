const mongoose=require("mongoose");
const Repository=require("../models/repoModel");
const User=require("../models/userModel");
const Issue=require("../models/issueModel");

const createIssue= async(req,res)=>{
    const{ title,description}=req.body;
    try{
        if(!title){
            return res.status(400).json({error:"Issue Title is required!"})
        }
        if(!description){
            return res.status(400).json({error:"Issue description is required!"})
        }
        if (!mongoose.Types.ObjectId.isValid(repositoryId)) {
            return res.status(400).json({
            error: "Invalid repository ID!",
            });
        }

        const issue=new Issue({
            title,
            description, 
            repository: req.params.repositoryId,  
        });
        
        const result = await issue.save();
        res.status(201).json({
            message:"Issue created!",
            issueID:result._id,
        })

    }catch(err){
        console.error("Error during Repository creation:", err.message);
        return res.status(500).send("Server Error");
    }
};

const updateIssueById= async(req,res)=>{
    res.send("Update issues");
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


