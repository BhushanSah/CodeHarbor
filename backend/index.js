const yargs= require("yargs");
const {hideBin}= require('yargs/helpers');

const {initRepo}= require("./controllers/init");
const {addRepo}= require("./controllers/add");
const {commitRepo}= require("./controllers/commit");
const {pullRepo}= require("./controllers/pull");
const {revertRepo}= require("./controllers/revert");
const {pushRepo} =require("./controllers/push");


yargs(hideBin(process.argv))
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
}, commitRepo )
.command("push", "(push commits)", {}, pushRepo)
.command("pull", "(pull commits)", {}, pullRepo)
.command("revert <commitID>", "(revert to Specific commitID)", (yargs)=>{
    yargs.positional("commitID",{
        describe: "commitID to revert to",
        type:"string",
    });
}, revertRepo )
.demandCommand(1, "You need at least one command")
.help()
.argv;
