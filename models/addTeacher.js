const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const newTeacher = new Schema({
    first_name:{
        type:String,
        required:true
    },
    last_name:{
        type:String,
        required:true
    },
    t_id:{
        type:String,
        required:true,
        unique:true
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
    email:{
        type:String,
        required:true,
        unique:true
    },
    m_no:{
        type:String,
        required:true,
        unique:true
    },
    dob:{
        type:String,
        required:true
    },
    do_joining:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    gender:{
        type:String,
        required:true
    }
},{timestamps:true,collection:'teacherData'});

const Teacher = mongoose.model('Teacher', newTeacher);
module.exports = Teacher;