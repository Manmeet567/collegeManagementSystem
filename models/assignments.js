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
        type:String,
        default:'No Description Added'
    },
    author:{
        type:String,
        required:true
    },
    forBranch:{
        type:String,
        required:true
    },
    forSem:{
        type:String,
        required:true
    }
},{timestamps:true,collection:'assignments'});

const Assignment = mongoose.model('Assignment', newAssignment);
module.exports = Assignment;