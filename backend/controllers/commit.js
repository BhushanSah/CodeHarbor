const fs= require("fs").promises;
const path=require("path");
const {v4:uuid}=require("uuid");

async function commitRepo(message){
    const repoPath=path.resolve(process.cwd(),".CodeHarbor");
    const stagingPath=path.join(repoPath, "staging");
    const commitPath=path.join(repoPath, "commits");

    try{
        const files = await fs.readdir(stagingPath);

        if (files.length === 0) {
            console.log("Nothing staged to commit.");
            return;
        }
        const commitId=uuid();
        const commitDir=path.join(commitPath, commitId);
        await fs.mkdir(commitDir, {recursive: true});
        
        for(const file of files){
            await fs.rename(path.join(stagingPath, file), path.join(commitDir, file));
        }

        await fs.writeFile(
            path.join(commitDir, "commit.json"), JSON.stringify({message, date: new Date().toISOString()})
        )
        console.log(`Commit ${commitId} created with message: ${message}`);

    }catch(error){
        console.error("Error:", error);
    }
}

module.exports={commitRepo};