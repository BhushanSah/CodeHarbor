const mongoose=require("mongoose");
const {Schema}=mongoose;

const IssueSchema= new Schema({
    title:{
        type:String,
        required:true,
        trim: true,
        maxlength: 140,
        
    },
    description:{
        type:String,
        required:true,
        trim: true,
        maxlength: 10000,
    },
    status:{
        type:String,
        enum:["open", "closed"],
        default:"open",
    },
    repository:{
        type:Schema.Types.ObjectId,
        ref:"Repository",
        required:true,
    },
},
    {
    timestamps: true,
  }
);

const Issue = mongoose.model("Issue", IssueSchema);
module.exports = Issue;