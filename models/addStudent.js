const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const newStudent = new Schema({
    first_name:{
        type:String,
        required:true
    },
    last_name:{
        type:String,
        required:true
    },
    enroll_id:{
        type:String,
        required:true,
        unique:true
    },
    father_name:{
        type:String
    },
    mother_name:{
        type:String
    },
    course:{
        type:String,
        required:true
    },
    branch:{
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
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    ad_date:{
        type:String,
        required:true
    },
    m_no:{
        type:String,
        required:true
    },
    sem:{
        type:String,
        required:true
    },
    dob:{
        type:String,
        required:true
    },
    pm_no:{
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
},{timestamps:true,collection:'studentData'});

const Student = mongoose.model('Student', newStudent);
module.exports = Student;