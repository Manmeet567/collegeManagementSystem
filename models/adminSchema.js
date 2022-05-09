const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminData = new Schema({
    first_name:{
        type: String,
        required: true
    },
    last_name:{
        type:String,
        required: true
    },
    adid:{
        type:String,
        required: true,
        unique: true
    },
    password:{
        type:String,
        required: true
    }
},{collection:'adminData'});

const Admin = mongoose.model('Admin', adminData);
module.exports = Admin;