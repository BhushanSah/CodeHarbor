const mongoose=require("mongoose");
const Repository=require("../models/repoModel");
const User=require("../models/userModel");
const Issue=require("../models/issueModel");
const dotenv=require("dotenv");

dotenv.config();
const uri=process.env.MONGODB_URI;

const createRepository= async(req,res)=>{
    const{ owner, name, issues, content, description, visibility}=req.body;
    try{
        if(!name){
            return res.status(400).json({error:"Repository name is required!"})
        }
        if(!owner || !mongoose.Types.ObjectId.isValid(owner)){
            return res.status(400).json({error:"Owner is required!"})
        }
        const newRepo=new Repository({
            name,description, visibility,owner,content,issues,
        });
        
        const result = await newRepo.save();
        res.status(201).json({
            message:"Repository created!",
            repoID:result._id,
        })

    }catch(err){
        console.error("Error during Repository creation:", err.message);
        return res.status(500).send("Server Error");
    }
};

const getAllRepositories= async(req,res)=>{
    try{
        const repositories= await Repository.find({}).populate("owner").populate("issues");
        return res.json(repositories);
    }catch(err){
        console.error("Error during fetching Repositories:", err.message);
        return res.status(500).send("Server Error");
    }
};

const fetchRepositoryById= async(req,res)=>{
    const repoID=req.params.id;
    
    try{
        if (!mongoose.Types.ObjectId.isValid(repoID)) {
            return res.status(400).json({
            message: "Invalid repository ID",
            });
        }
        const repository= await Repository.findById({_id:repoID}).populate("owner").populate("issues");
        if (!repository) {
            return res.status(404).json({
             message: "Repository not found",
             });
        }
        return res.json(repository);
    }catch(err){
        console.error("Error during fetching Repository:", err.message);
        return res.status(500).send("Server Error");
    }
};

const fetchRepositoryByName= async(req,res)=>{
    const repoName=req.params.name;
    
    try{
        if (!repoName) {
            return res.status(400).json({
            message: "Repository name is required",
            });
        }

        const repository= await Repository.findOne({name:repoName}).populate("owner").populate("issues");
        if (!repository) {
            return res.status(404).json({
             message: "Repository not found",
             });
        }
        return res.json(repository);
    }catch(err){
        console.error("Error during fetching Repository:", err.message);
        return res.status(500).send("Server Error");
    }
};

const fetchRepoForCurrUser= async(req,res)=>{
    res.send("fetched repo for current user");
};

const updateRepoById= async(req,res)=>{
    res.send("repo updated");
};

const toggleRepoById= async(req,res)=>{
    res.send("toggled");
};

const deleteRepoById= async(req,res)=>{
    res.send("repo deleted");
};

module.exports={
    createRepository,
    getAllRepositories,
    fetchRepoForCurrUser,
    fetchRepositoryById,
    fetchRepositoryByName,
    updateRepoById,
    toggleRepoById,
    deleteRepoById,
}



