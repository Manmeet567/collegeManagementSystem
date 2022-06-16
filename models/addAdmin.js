const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const newAdmin = new Schema({
    first_name:{
        type:String,
        required:true
    },
    last_name:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    m_no:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    address:{
        type:String,
        required:true
    },
    dept:{
        type:String,
        requied:true
    }
},
{timestamps:true,collection:'adminData'});

const Admin = mongoose.model('Admin', newAdmin);
module.exports = Admin;