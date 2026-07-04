const mongoose=require("mongoose");
const Repository=require("../models/repoModel");
const User=require("../models/userModel");
const Issue=require("../models/issueModel");
const { s3, S3_BUCKET } = require("../config/aws-config");

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
    const userID=req.params.userID;
    try{
        if (!mongoose.Types.ObjectId.isValid(userID)) {
            return res.status(400).json({
            message: "Invalid user ID",
            });
        }

        const repositories= await Repository.find({owner:userID});
        if (repositories.length==0) {
            return res.status(404).json({
             message: "No repositories found for this user",
             });
        }
        return res.json(repositories);
    }catch(err){
        console.error("Error during fetching user Repositories:", err.message);
        return res.status(500).send("Server Error");
    }
};

const updateRepoById= async(req,res)=>{
    const ID=req.params.id;
    const{content, description}=req.body;
    try{
        if (!mongoose.Types.ObjectId.isValid(ID)) {
            return res.status(400).json({
                message: "Invalid repository ID",
            });
        }

        const repository= await Repository.findById(ID);
        if (!repository) {
            return res.status(404).json({
             message: "Repository not found",
             });
        }
        
        if (content) {
            repository.content.push(content);
        }
        
        if (description) {
            repository.description = description;
        }
        const updatedRepo=await repository.save();
        return res.json(updatedRepo);
    }catch(err){
        console.error("Error updating Repository:", err.message);
        return res.status(500).send("Server Error");
    }   
};

const updateRepoVisibility= async(req,res)=>{
    const ID=req.params.id;
    const{visibility}=req.body;
    try{
        if (!mongoose.Types.ObjectId.isValid(ID)) {
            return res.status(400).json({
                message: "Invalid repository ID",
            });
        }

        const repository= await Repository.findById(ID);
        if (!repository) {
            return res.status(404).json({
             message: "Repository not found",
             });
        }
        
        if (visibility) {
            if (visibility !== "public" && visibility !== "private") {
                return res.status(400).json({
                message: "Visibility must be public or private",
                });
            }
            repository.visibility = visibility;
        }
        
        const updatedRepo=await repository.save();
        return res.json(updatedRepo);
    }catch(err){
        console.error("Error updating visibility:", err.message);
        return res.status(500).send("Server Error");
    }   
};

const deleteRepoById= async(req,res)=>{
    const ID=req.params.id;
    try{
        if (!mongoose.Types.ObjectId.isValid(ID)) {
            return res.status(400).json({
                message: "Invalid repository ID",
            });
        }

        const repository= await Repository.findByIdAndDelete(ID);
        if (!repository) {
            return res.status(404).json({
             message: "Repository not found",
             });
        }
        return res.json({message:"Repository Deleted Succesfully"});
    }catch(err){
        console.error("Error deleting Repository:", err.message);
        return res.status(500).send("Server Error");
    } 
};

    const getPublicRepositories = async (req, res) => {
    try {
        const repositories = await Repository.find({
        visibility: "public",
        }).populate("owner", "username");

        return res.status(200).json(repositories);
    } catch (err) {
        console.error("Error fetching public repositories:", err.message);

        return res.status(500).json({
        message: "Could not fetch public repositories.",
        });
    }
    };

const listRepositoryFiles = async (req, res) => {
  const repoId = req.params.id;

  try {
    if (!mongoose.Types.ObjectId.isValid(repoId)) {
      return res.status(400).json({
        message: "Invalid repository ID.",
      });
    }

    const repository = await Repository.findById(repoId);

    if (!repository) {
      return res.status(404).json({
        message: "Repository not found.",
      });
    }

    const prefix = `repos/${repoId}/commits/`;

    let continuationToken;
    const allObjects = [];

    do {
      const result = await s3
        .listObjectsV2({
          Bucket: S3_BUCKET,
          Prefix: prefix,
          ContinuationToken: continuationToken,
        })
        .promise();

      allObjects.push(...(result.Contents || []));

      continuationToken = result.IsTruncated
        ? result.NextContinuationToken
        : undefined;
    } while (continuationToken);

    const latestFiles = new Map();

    for (const item of allObjects) {
      if (!item.Key || item.Key.endsWith("/")) {
        continue;
      }

      const relativeKey = item.Key.replace(prefix, "");
      const parts = relativeKey.split("/");

      const commitId = parts.shift();
      const filePath = parts.join("/");

      if (!filePath || filePath === "commit.json") {
        continue;
      }

      const currentFile = latestFiles.get(filePath);

      if (
        !currentFile ||
        new Date(item.LastModified) > new Date(currentFile.lastModified)
      ) {
        latestFiles.set(filePath, {
          key: item.Key,
          path: filePath,
          commitId,
          size: item.Size || 0,
          lastModified: item.LastModified || null,
        });
      }
    }

    const files = [...latestFiles.values()].sort((a, b) =>
      a.path.localeCompare(b.path)
    );

    return res.status(200).json({ files });
  } catch (err) {
    console.error("Error loading S3 files:", err);

    return res.status(500).json({
      message: "Could not load files from AWS S3.",
    });
  }
};

module.exports = {
  createRepository,
  getAllRepositories,
  fetchRepositoryById,
  fetchRepositoryByName,
  fetchRepoForCurrUser,
  updateRepoById,
  deleteRepoById,
  updateRepoVisibility,
  getPublicRepositories,
  listRepositoryFiles,
};



