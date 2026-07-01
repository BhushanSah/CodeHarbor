const AWS= require('aws-sdk')

AWS.config.update({ region: "us-east-2" }); 
const s3= new AWS.S3();

const S3_BUCKET="bhushansah";

module.exports={s3, S3_BUCKET}