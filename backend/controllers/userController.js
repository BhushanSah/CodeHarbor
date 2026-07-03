const jwt=require("jsonwebtoken");
const bcrypt=require("bcryptjs");
const {MongoClient, ObjectId, ReturnDocument  }=require("mongodb");
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

    return res.status(201).json({ token });
  } catch (err) {
    console.error("Error during signup:", err.message);
    return res.status(500).send("Server Error");
  }
};

const login= async (req,res)=>{
    const {email, password}=req.body;
    try{
        await connectClient();
        const db = client.db("CodeHarbor");
        const usersCollection = db.collection("users");

        const existingUser = await usersCollection.findOne({ email });
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
        res.json({token, userId:existingUser._id});

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
        console.error("Error during login:", err.message);
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
        console.error("Error during login:", err.message);
        res.status(500).send("Server Error!");
    }
};

const deleteUserProfile=async(req,res)=>{
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