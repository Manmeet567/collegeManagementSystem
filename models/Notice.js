const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const newNotice = new Schema({
    title:{
        type:String,
        required:true
    },
    body:{
        type:String,
        required:true
    },
    author:{
        type:String,
        required:true
    }
},{timestamps:true,collection:'noticeData'});

const Notice = mongoose.model('Notice', newNotice);
module.exports = Notice;