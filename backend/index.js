const express=require('express');
const dotenv=require('dotenv');
const cors=require("cors");
const mongoose=require("mongoose");
const bodyParser=require('body-parser');
const http=require("http");
const {Server}=require("socket.io");
const mainRouter=require("./routes/main.router")

const yargs= require("yargs");
const {hideBin}= require('yargs/helpers');

const {initRepo}= require("./controllers/init");
const {addRepo}= require("./controllers/add");
const {commitRepo}= require("./controllers/commit");
const {pullRepo}= require("./controllers/pull");
const {revertRepo}= require("./controllers/revert");
const {pushRepo} =require("./controllers/push");
const { remoteCommand } = require("./controllers/remote");

dotenv.config();

yargs(hideBin(process.argv))
.command("start", "(Starts a new Server)", {}, startServer )
.command("init", "(Initialise a new repository)", {}, initRepo )
.command("add <file>", "(to add file)", (yargs)=>{
    yargs.positional("file",{
        describe: "File to add",
        type:"string",
    });
}, (argv)=>{
    addRepo(argv.file)
} )
.command("commit <message>", "(commit the staged files)", (yargs)=>{
    yargs.positional("message",{
        describe: "commit message",
        type:"string",
    });
}, (argv)=>{
    commitRepo(argv.message) 
})
.command("push", "(push commits)", {}, pushRepo)
.command("pull", "(pull commits)", {}, pullRepo)
.command(
  "remote add <name> <repoId>",
  "Connect this local project to an online CodeHarbor repository",
  (yargs) => {
    return yargs
      .positional("name", {
        type: "string",
        describe: 'Remote name, usually "origin"',
      })
      .positional("repoId", {
        type: "string",
        describe: "MongoDB repository ID from CodeHarbor",
      })
      .option("api-url", {
        type: "string",
        describe: "CodeHarbor backend URL",
      })
      .option("force", {
        type: "boolean",
        default: false,
        describe: "Replace an existing remote with the same name",
      });
  },
  remoteCommand
)
.command("revert <commitID>", "(revert to Specific commitID)", (yargs)=>{
    yargs.positional("commitID",{
        describe: "commitID to revert to",
        type:"string",
    });
}, (argv)=>{
    revertRepo(argv.commitID) 
} )
.demandCommand(1, "You need at least one command")
.help()
.argv;

function startServer(){
    const app=express();
    const port=process.env.PORT || 3000;

    app.use(bodyParser.json());
    app.use(express.json());

    const mongoURI=process.env.MONGODB_URI;
    mongoose.connect(mongoURI)
    .then(()=>console.log("MongoDB connected"))
    .catch((err)=>console.error("Error while connecting database", err));

    app.use(cors({origin: "*"}));
    app.use("/", mainRouter);

    let user="test";
    const httpServer=http.createServer(app);
    const io=new Server(httpServer, {cors:{ origin:"*", methods:["GET", "POST"]},});
    io.on("connection", (socket)=>{
        socket.on("joinRoom", (userID)=>{
            user=userID;
            console.log("----------");
            console.log(user);
            console.log("----------");
            socket.join(userID);
        });
    });

    const db= mongoose.connection;
    db.once("open", async()=>{
        console.log("CRUD operations called");
        //CRUD operations

    });
    httpServer.listen(port, ()=>{
        console.log(`Server is running on ${port}`);
    })
}