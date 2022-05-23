const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const path = require('path');
const mongoose = require('mongoose');
const Admin = require('./models/addAdmin');
const Teacher = require('./models/addTeacher');
const Student = require('./models/addStudent');
const bcrypt = require('bcryptjs');


const app = express();
const dbURI = process.env.URI;
const port = 3000 || process.env.PORT;



// Middlewares
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Global Variables
let isAdmin = `false`;
let isTeacher = `false`;
let isStudent = `false`;
let adminName = 'Admin';

function authAdmin(req,res,next){
    if(isAdmin === `${process.env.ADMIN_KEY}`){
        next();
    }else{
        res.redirect('/adminLogin');
    }
};

function authTeacher(req,res,next){
    if(isTeacher === `${process.env.TEACHER_KEY}`){
        next();
    }else{
        res.redirect('/teacherLogin');
    }
};

function authStudent(req,res,next){
    if(isStudent === `${process.env.STUDENT_KEY}`){
        next();
    }else{
        res.redirect('/studentLogin');
    }
};

// Connecting to database
mongoose.connect(dbURI,{ useNewUrlParser: true,useUnifiedTopology: true })
 .then(()=>{
     app.listen(port,()=>{
         console.log('Listening on port ' + port);
     })
     console.log("Connected to MongoDB");
 })
 .catch((err)=>{
     console.log(err);
 })


app.get('/',(req,res)=>{
     res.render('Home/homePage');
})
app.get('/adminLogin',(req,res)=>{
    res.render('admin/AdminLoginForm');
})
app.get('/teacherLogin',(req,res)=>{
    res.render('teachers/TeacherLoginForm');
})
app.get('/studentLogin',(req,res)=>{
   res.render('student/StudentLoginForm');
})

// Admin Routes
app.get('/add-admin',(req,res)=>{
     res.render('admin/add-admin',{title:'Add-Admin'});
})
app.post('/adminAdded',async (req,res)=>{
    let data = req.body;
    let adPassword = data.password;
    adPassword = await bcrypt.hash(adPassword,10);
    let obj = {
        first_name:data.firstName,
        last_name:data.lastName,
        username:data.username,
        password:adPassword,
        m_no:data.phno,
        email:data.email,
        address:data.address,
        dept:data.dept
    }
    console.log(obj);
    Admin.create(obj,(err,data)=>{
        if(err){
            console.log(err);
        }
        else{
            console.log('Admin Created Successfully');
            res.render('admin/adminAdded',{dept:data.dept});
        }
    })
})

app.get('/adminDashboard',authAdmin,async(req,res)=>{
    let studentCount = 0;
    let teacherCount = 0;
    let maleStudents = 0;
    let femaleStudents = 0;
    let parents = 0;
    await Student.countDocuments()
     .then((count)=>{studentCount=count})
     .catch((err)=>{console.log(err)})

    await Teacher.countDocuments()
     .then((count)=>{teacherCount=count})
     .catch((err)=>{console.log(err)})

    await Student.countDocuments({'type':'father_name'})
     .then((count)=>{parents = parents+count;}).catch(err=>console.log(err))
    
    await Student.countDocuments({'type':'mother_name'})
    .then((count)=>{parents = parents+count}).catch(err=>console.log(err))
    
    await Student.countDocuments({'gender':'male'})
    .then((count)=>{maleStudents = count}).catch((err)=>{console.log(err)})

    await Student.countDocuments({'gender':'female'})
    .then((count)=>{femaleStudents = count}).catch((err)=>{console.log(err)})

    res.render('admin/AdminDashboard',{
        adminName,
        studentCount,
        teacherCount,
        parents,
        maleStudents,
        femaleStudents
    });
    
})
app.get('/admin/ManageStudents/:option',authAdmin,async(req,res)=>{
    let option = req.params
    let studentData = [];
    
    if(option.option == 'allStudents'){
        await Student.find()
         .then((data)=>{
             studentData = data;
         })
         .catch((err)=>{console.log(err)})
    }
    if(option.option == 'manageByCourse'){
        await Student.find({'course':'B.Tech'})
         .then((data)=>{
             studentData = data;
         })
         .catch((err)=>{console.log(err)})
    }
    if(option.option == 'manageByBranch'){
        await Student.find({'branch':'CSE'})
         .then((data)=>{
             studentData = data;
         })
         .catch((err)=>{console.log(err)})
    }
   
    res.render('admin/manageStudents',{studentData});
})
app.get('/admin/ManageFaculty',authAdmin,async(req,res)=>{
    let teacherData = [];
    await Teacher.find()
     .then((data)=>{
         teacherData = data;
     })
     .catch((err)=>{console.log(err)})
     res.render('admin/manageTeachers',{teacherData})
});


app.post('/authenticatingAdmin',(req,res)=>{
    const data = req.body;

    Admin.findOne({username:data.username})
     .then((result)=>{
        if(result === null){
            res.send('not Found');
        }
        else{
            const password = data.password;
            bcrypt.compare(password,result.password,(err,data)=>{
                if(err){res.send('Invalid Password')}
                if(data){
                    console.log(data);
                    isAdmin = `${process.env.ADMIN_KEY}`;
                    adminName = `${result.first_name} `+`${result.last_name}`;
                    res.redirect('/adminDashboard');
                }
            })
        }
     })
     .catch((err)=>{
         console.log(err);
         res.send('An Error Occured');
     })    
})
app.get('/AddFaculty', authAdmin, (req,res)=>{
    res.render('teachers/AddTeacher')
})
app.get('/admin/AddStudent', authAdmin, (req,res)=>{
    res.render('student/adminAddStudent');
})

app.get('/Adminlogout',(req,res)=>{
    isAdmin = 'false';
    res.redirect('/');
})
// Admin Routes END

// ------------------------------------------------------------------------------------------

// Teacher Routes Start

app.post('/addingTeacher',async (req,res)=>{
    const data = req.body;
    let tPassword = data.password;
    tPassword = await bcrypt.hash(tPassword,10);
    const obj ={
        first_name:data.firstName,
        last_name:data.lastName,
        t_id:data.t_id,
        username:data.username,
        password:tPassword,
        email:data.email,
        m_no:data.m_no,
        dob:data.dob,
        do_joining:data.do_joining,
        address:data.address,
        gender:data.gender
    }
    Teacher.create(obj,(err,data)=>{
        if(err){
            console.log(err);
        }
        else{
            console.log('Teacher added Successfully');
            res.redirect('/AddFaculty');
        }
    })
});
app.get('/teacherDashboard',authTeacher,(req,res)=>{
    res.render('teachers/TeacherDashboard');
});
app.post('/authenticatingTeacher',(req,res)=>{
    const data = req.body;
    Teacher.findOne({username:data.username})
     .then((result)=>{
        if(result === null){
            res.send('not Found');
        }
        else{
            const password = data.password;
            bcrypt.compare(password,result.password,(err,data)=>{
                if(err){
                    console.log(err);
                    res.send('Invalid Password');
                }
                if(data){
                    console.log(data);
                    isTeacher = `${process.env.TEACHER_KEY}`;
                    res.redirect('/teacherDashboard');
                }
            })
        }
     })
     .catch((err)=>{
         console.log(err);
         res.send('An Error Occured');
     })
});
app.get('/teacher/AddStudent',authTeacher, (req,res)=>{
    res.render('student/teacherAddStudent');
})
app.get('/TeacherLogout',(req,res)=>{
    isTeacher = 'false';
    res.redirect('/');
})

// End of Teacher Routes

// ------------------------------------------------------------------------------------------

// Student routes Start
app.post('/addingStudent',async (req,res)=>{
    const data = req.body;
    let spassword = data.password;
    spassword = await bcrypt.hash(spassword,10);
    const obj = {
        first_name:data.firstName,
        last_name:data.lastName,
        enroll_id:data.enroll_id,
        father_name:data.fatherName,
        mother_name:data.motherName,
        course:data.course,
        branch:data.branch,
        username:data.username,
        password:spassword,
        email:data.email,
        ad_date:data.admission_date,
        m_no:data.m_no,
        sem:data.sem,
        dob:data.dob,
        pm_no:data.pm_no,
        address:data.address,
        gender:data.gender
    };
    Student.create(obj,(err,data)=>{
        if(err){
            console.log(err)
        }
        else{
            console.log('Student added');
            res.redirect('/');
        }
    })
});
app.post('/authenticatingStudent',(req,res)=>{
    const data = req.body;
    Student.findOne({username:data.username})
     .then((result)=>{
        if(result === null){
            res.send('not Found');
        }
        else{
            const password = data.password;
            bcrypt.compare(password,result.password,(err,data)=>{
                if(err){
                    console.log(err);
                    res.send('Invalid Password');
                }
                if(data){
                    console.log(data);
                    isStudent = `${process.env.STUDENT_KEY}`;
                    res.redirect('/studentDashboard');
                }
            })
        }
     })
     .catch((err)=>{
         console.log(err);
         res.send('An Error Occured');
     })
})
app.get('/studentDashboard',authStudent,(req,res)=>{
    res.render('student/StudentDashboard');
});
app.get('/StudentLogout',(req,res)=>{
    isTeacher = 'false';
    res.redirect('/');
})

// 404 Page
app.use((req,res)=>{
    res.send('404 Page');
})