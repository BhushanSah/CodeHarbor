const jwt=require("jsonwebtoken");
const bcrypt=require("bcryptjs");
const {MongoClient, ObjectId}=require("mongodb");
const dotenv=require("dotenv");

dotenv.config();
const uri=process.env.MONGODB_URI;

let client;

async function connectClient(){
    if(!client){
        client=new MongoClient(uri);
        await client.connect();
    }
}

const getAllUsers= async(req,res)=>{
    try{
        await connectClient();

        const db = client.db("CodeHarbor");
        const usersCollection = db.collection("users");

        const users=await usersCollection.find({}).toArray();
        res.json(users)

    }catch(err){
        console.error("Error during fetching:", err.message);
        return res.status(500).send("Server Error");
    }
};

const signup = async (req, res) => {
  const { username, password, email } = req.body;

  try {
    await connectClient();

    const db = client.db("CodeHarbor");
    const usersCollection = db.collection("users");

    const existingUser = await usersCollection.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Username or email already exists!",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      username,
      password: hashedPassword,
      email,
      repositories: [],
      followedUsers: [],
      starRepos: [],
    };

    const result = await usersCollection.insertOne(newUser);

    const token = jwt.sign(
      { id: result.insertedId },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    return res.status(201).json({ token, userId:result.insertedId });
  } catch (err) {
    console.error("Error during signup:", err.message);
    return res.status(500).send("Server Error");
  }
};

const login= async (req,res)=>{
    const {username, password}=req.body;
    try{
        await connectClient();
        const db = client.db("CodeHarbor");
        const usersCollection = db.collection("users");

        const existingUser = await usersCollection.findOne({ username });
        if (!existingUser) {
            return res.status(400).json({
             message: "Invalid Credentials!"
        });
        }
        const isMatch= await bcrypt.compare(password,existingUser.password );
        if(!isMatch){
            return res.status(400).json({message: "Invalid Credentials!"});
        }
        const token=jwt.sign({id:existingUser._id}, process.env.JWT_SECRET_KEY, {expiresIn:"1hr"});
        return res.json({
            token,
            userId: existingUser._id.toString(),
            username: existingUser.username,
            email: existingUser.email,
        });

    }catch(err){
        console.error("Error during login:", err.message);
        res.status(500).send("Server Error!");
    }
};

const getUserProfile=async(req,res)=>{
    const currID=req.params.id;
    try{
        await connectClient();
        const db = client.db("CodeHarbor");
        const usersCollection = db.collection("users");

        const user= await usersCollection.findOne(
            {
                _id: new ObjectId(currID),
            });
        if (!user) {
            return res.status(400).json({
             message: "User not Found"
        });
        }
        res.json(user);
       

    }catch(err){
        console.error("Error getting profile:", err.message);
        res.status(500).send("Server Error!");
    }
};

const updateUserProfile=async(req,res)=>{
    const currID=req.params.id;
    const{email,password}=req.body;

    try{
        if (!ObjectId.isValid(currID)) {
            return res.status(400).json({
            message: "Invalid user ID",
            });
        }
        await connectClient();
        const db = client.db("CodeHarbor");
        const usersCollection = db.collection("users");

        let updatedFields={};
        if(email){
            updatedFields.email=email;
        }
        if(password){
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            updatedFields.password=hashedPassword;
        }
        if (Object.keys(updatedFields).length === 0) {
            return res.status(400).json({
            message: "Provide an email or password to update.",
            });
        }
        const result=await usersCollection.findOneAndUpdate({
            _id: new ObjectId(currID),
            }, 
            {$set:updatedFields},
            {returnDocument:"after"}  
        );
        if(!result){
            return res.status(404).json({message:"User not found!!"});
        }
        const { password: _, ...safeUser } = result;
        return res.json(safeUser);
    }catch(err){
        console.error("Error Updating:", err.message);
        res.status(500).send("Server Error!");
    }
};

const deleteUserProfile=async(req,res)=>{
    const currID=req.params.id;
    try{
        if (!ObjectId.isValid(currID)) {
            return res.status(400).json({
            message: "Invalid user ID",
            });
        }
        await connectClient();
        const db = client.db("CodeHarbor");
        const usersCollection = db.collection("users");

        const result=await usersCollection.deleteOne({
            _id: new ObjectId(currID),
        });
        if(result.deletedCount==0){
            return res.status(404).json({message:"User not Found !!"});
        }
        res.json({message:"User Profile deleted!!"})
    }catch(err){
        console.error("Error Deleting Profile:", err.message);
        res.status(500).send("Server Error!");
    }
};

const getUserActivity = async (req, res) => {
  const currID = req.params.id;

  try {
    if (!ObjectId.isValid(currID)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    await connectClient();

    const db = client.db("CodeHarbor");
    const repositoriesCollection = db.collection("repositories");
    const issuesCollection = db.collection("issues");
    const commentsCollection = db.collection("comments");

    const userObjectId = new ObjectId(currID);

    const repositories = await repositoriesCollection
      .find({ owner: userObjectId })
      .toArray();

    const repositoryIds = repositories.map((repo) => repo._id);

    const issues =
      repositoryIds.length > 0
        ? await issuesCollection
            .find({
              repository: {
                $in: repositoryIds,
              },
            })
            .toArray()
        : [];

    const comments =
      repositoryIds.length > 0
        ? await commentsCollection
            .find({
              repository: {
                $in: repositoryIds,
              },
            })
            .toArray()
        : [];

    const activityMap = {};

    const addActivity = (dateValue) => {
      if (!dateValue) return;

      const date = new Date(dateValue);

      if (Number.isNaN(date.getTime())) return;

      const dateKey = date.toISOString().split("T")[0];

      activityMap[dateKey] = (activityMap[dateKey] || 0) + 1;
    };

    repositories.forEach((repo) => {
      addActivity(repo.createdAt || repo._id?.getTimestamp?.());
      addActivity(repo.updatedAt);
    });

    issues.forEach((issue) => {
      addActivity(issue.createdAt || issue._id?.getTimestamp?.());
      addActivity(issue.updatedAt);
    });

    comments.forEach((comment) => {
      addActivity(comment.createdAt || comment._id?.getTimestamp?.());
      addActivity(comment.updatedAt);
    });

    const activity = Object.entries(activityMap).map(([date, count]) => ({
      date,
      count,
    }));

    activity.sort((a, b) => a.date.localeCompare(b.date));

    return res.status(200).json({
      activity,
    });
  } catch (err) {
    console.error("Error fetching user activity:", err.message);

    return res.status(500).json({
      message: "Server error while fetching user activity.",
    });
  }
};

module.exports={
    getAllUsers,
    signup,
    login,
    getUserProfile,
    updateUserProfile,
    deleteUserProfile,
    getUserActivity,
};