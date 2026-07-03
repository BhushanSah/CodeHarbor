const createRepository= (req,res)=>{
    res.send("Repo created");
};

const getAllRepositories= (req,res)=>{
    res.send("Getting all repos");
};

const fetchRepositoryById= (req,res)=>{
    res.send("fetched repo by id");
};

const fetchRepositoryByName= (req,res)=>{
    res.send("fetched repo");
};

const fetchRepoForCurrUser= (req,res)=>{
    res.send("fetched repo for current user");
};

const updateRepoById= (req,res)=>{
    res.send("repo updated");
};

const toggleRepoById= (req,res)=>{
    res.send("toggled");
};

const deleteRepoById= (req,res)=>{
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



