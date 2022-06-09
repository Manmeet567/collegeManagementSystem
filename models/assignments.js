const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const newAssignment = new Schema({
    title:{
        type:String,
        required:true
    },
    img:{
        data:Buffer,
        contentType:String
    },
    desc:{
        data:String
    },
    author:{
        type:String,
        required:true
    }
},{timestamps:true,collection:'assignments'});

const Assignment = mongoose.model('Assignment', newAssignment);
module.exports = Assignment;