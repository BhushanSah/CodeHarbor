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
    res.send("fetched repo by id");
};

const fetchRepositoryByName= async(req,res)=>{
    res.send("fetched repo");
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



