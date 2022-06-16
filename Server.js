const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const path = require('path');
const mongoose = require('mongoose');
const Admin = require('./models/addAdmin');
const Teacher = require('./models/addTeacher');
const Student = require('./models/addStudent');
const Notice = require('./models/Notice');
const bcrypt = require('bcryptjs');
const Assignment = require('./models/assignments');
const fs = require('fs');
const multer = require('multer');
const favicon = require('serve-favicon');


const app = express();
const dbURI = process.env.URI;
const port = 3000 || process.env.PORT;



// Middlewares
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(favicon('public/icons/favicon.png'));

// Global Variables
let isAdmin = `false`;
let isTeacher = `false`;
let isStudent = `false`;
let adminName = 'Admin';
let teacherName = 'Teacher';
let studentName = 'Student';
let student = [];
let teacherSubject = 'none';
let teacherData = [];

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
    let parents = 0;
    let maleStudents = 0;
    let femaleStudents = 0;
    
    let notices = [];
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

    await Notice.find()
     .then((data)=>{
         notices = data.reverse();
     })
     .catch((err)=>{console.log(err)});

    
    res.render('admin/AdminDashboard',{
        adminName,
        studentCount,
        teacherCount,
        parents,
        maleStudents,
        femaleStudents,
        notices
    });
    
})
app.get('/admin/NoticeBoard',authAdmin,(req,res)=>{
    res.render('admin/adminNoticeBoard',{adminName});
})
app.post('/admin/createNotice',(req,res)=>{
    const data = req.body;
    let obj = {
        title:data.title,
        body:data.body,
        author:'Admin'
    };
    Notice.create(obj,(err,data)=>{
        if(err){
            console.log(err);
        }
        else{
            console.log('Notice Posted');
            res.redirect('/adminDashboard');
        }
    })
})
app.get('/admin/deleteNotice/:id',authAdmin,(req,res)=>{
    const id = req.params.id;
    Notice.deleteOne({_id:id},(err,result)=>{
        if(err){
            console.log(err);
        }
        else{
            res.redirect('/adminDashboard');
        }
    })
})
app.get('/admin/ManageStudents/:option',authAdmin,async(req,res)=>{
    let option = req.params;
    let studentData = [];
    
    if(option.option == 'allStudents'){
        await Student.find().sort({roll_no:1})
         .then((data)=>{
             studentData = data;
         })
         .catch((err)=>{console.log(err)})
    }
    if(option.option == 'btechCSE'){
        await Student.find({'branch':'CSE'})
         .then((data)=>{
             studentData = data;
         })
         .catch((err)=>{console.log(err)})
    }
    if(option.option == 'btechCSE6'){
        await Student.find({branch:'CSE',sem:'6'})
         .then((data)=>{
             studentData = data;
         })
         .catch((err)=>{console.log(err)})
    }
   
    res.render('admin/manageStudents',{studentData,adminName});
})
app.get('/admin/ManageFaculty',authAdmin,async(req,res)=>{
    let teacherData = [];
    await Teacher.find()
     .then((data)=>{
         teacherData = data;
     })
     .catch((err)=>{console.log(err)})
     res.render('admin/manageTeachers',{teacherData,adminName})
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
    res.render('teachers/AddTeacher',{adminName})
})
app.get('/admin/AddStudent', authAdmin, (req,res)=>{
    res.render('student/adminAddStudent',{adminName});
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
        subject:data.subject,
        address:data.address,
        role:data.role,
        assignedClass:data.assignedClass,
        assignSem:data.assignSem,
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
app.get('/teacherDashboard',authTeacher,async(req,res)=>{
    let maleStudents = 0;
    let femaleStudents = 0;
    let studentCount = 0;
    let teacherCount = 0;
    let parents = 0;
    let assignments = [];

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
    
    await Assignment.find({author:teacherName})
     .then((result)=>{assignments = result}).catch((err)=>{console.log(err)})

    res.render('teachers/TeacherDashboard',{
        teacherName,
        maleStudents,
        femaleStudents,
        studentCount,
        teacherCount,
        parents,
        assignments
    });
});

app.get('/teacher/uploadAssignment',authTeacher,(req,res)=>{
    res.render('teachers/uploadAssignment',{teacherName});
});

app.get('/viewAssignment/:id',authTeacher,async (req,res)=>{
    const id = req.params.id;
    await Assignment.findOne({_id:id})
     .then((result)=>{
        res.render('teachers/viewAssignment',{assignment:result});
     })
     .catch((err)=>{console.log(err)})
})

app.get('/teacher/NoticeBoard',authTeacher,async (req,res)=>{
    let notices = [];
    await Notice.find()
     .then((data)=>{
         notices = data.reverse();
     })
     .catch((err)=>{console.log(err)});
    res.render('teachers/noticeBoard',{teacherName,notices});
})
app.post('/teacher/createNotice',(req,res)=>{
    const data = req.body;
    let obj = {
        title:data.title,
        body:data.body,
        author:teacherName
    };
    Notice.create(obj,(err,data)=>{
        if(err){
            console.log(err);
        }
        else{
            console.log('Notice Posted');
            res.redirect('/teacher/NoticeBoard');
        }
    })
})

app.get('/teacher/deleteNotice/:id',authTeacher,(req,res)=>{
    const id = req.params.id;
    Notice.deleteOne({_id:id},(err,result)=>{
        if(err){
            console.log(err);
        }
        else{
            res.redirect('/teacher/NoticeBoard');
        }
    })
})

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
                    teacherName = `${result.first_name} `+`${result.last_name}`;
                    teacherSubject = `${result.subject}`;
                    teacherData = result;
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

const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'uploads/assignments')
    },
    filename:(req,file,cb)=>{
        cb(null, file.fieldname+Date.now()+path.extname(file.originalname))
    }
})

const upload = multer({storage:storage});

let folderName = './uploads/assignments';
    
if(!fs.existsSync(folderName)){
    fs.mkdirSync(folderName, {recursive: true});
}

app.post('/teacher/uploadAssignment',authTeacher,upload.single('img'), (req,res)=>{

    const filename = `./uploads/assignments/${req.file.filename}`;
    let obj = {
        title:req.body.title,
        img:{
            data:fs.readFileSync('.' + '/uploads/assignments/' + req.file.filename),
            contentType:`image/${path.extname(req.file.originalname)}`
        },
        desc:req.body.desc,
        author:teacherName,
        forBranch:req.body.forBranch,
        forSem:req.body.forSem
    };
    Assignment.create(obj,(err,data)=>{
        if(err){
            console.log(err);
        }
        else{
            try {
                fs.unlinkSync(filename)
                //file removed
              } catch(err) {
                console.error(err)
              }
            res.redirect('/teacherDashboard');
        }
    });
})
app.get('/teacher/deleteAssignment/:id',authTeacher,(req,res)=>{
    const id = req.params.id;
    Assignment.deleteOne({_id:id},(err,result)=>{
        if(err){
            console.log(err);
        }
        else{
            res.redirect('/teacherDashboard');
        }
    })
})
app.get('/teacher/uploadMSTmarks',authTeacher,(req,res)=>{
    res.render('teachers/uploadMSTbranch',{teacherName})
})

app.get('/teacher/uploadMSTmarks/:branch',authTeacher,(req,res)=>{
    const branch = req.params.branch;
    res.render('teachers/uploadMSTmarks',{teacherName,branch})
})

app.get('/teacher/uploadMSTmarks/:branch/:mst',authTeacher,(req,res)=>{
    const mst = req.params.mst;
    const branch = req.params.branch;
    res.render('teachers/uploadMSTmarks2',{teacherName,mst,branch})
})

app.get('/teacher/uploadMSTmarks/:branch/:mst/:sem',authTeacher, async (req,res)=>{
    const sem = req.params.sem;
    const branch = req.params.branch;
    const mst = req.params.mst;
    let studentData = [];

    if(mst == 'mst1'){
        await Student.find({
            branch:`${branch}`,
            sem:`${sem}`
        }).sort({roll_no:1})
         .then((result)=>{ 
            if(result.length!=0){
                studentData = result;
            }else{
                studentData = null;
            }
         })
         .catch((err)=>{console.log(err)})
    }
    else if(mst == 'mst2'){
        await Student.find({
            branch:`${branch}`,
            sem:`${sem}`
        }).sort({roll_no:1})
         .then((result)=>{ 
            if(result.length!=0){
                studentData = result;
            }else{
                studentData = null;
            }
         })
         .catch((err)=>{console.log(err)})
    }
     res.render('teachers/uploadMsem',{teacherName,studentData,mst,teacherSubject});
})

app.post('/update/:mst/:branch/:sem/:id',(req,res)=>{
    const data = req.body;
    const p = req.params;

    if(p.mst == 'mst1'){
        Student.updateOne({_id:p.id},{$set:{mst1:data.mst1}},{new:true})
         .then((result) => {
            res.redirect(`/teacher/uploadMSTmarks/${p.branch}/${p.mst}/${p.sem}`);
         })
         .catch(err => {console.log(err)})
    }
    else if (p.mst == 'mst2'){
        Student.updateOne({_id:p.id},{$set:{mst2:data.mst1}},{new:true})
         .then((result) => {
            res.redirect(`/teacher/uploadMSTmarks/${p.branch}/${p.mst}/${p.sem}`);
         })
         .catch(err => {console.log(err)})
    }
})

app.get('/teacher/uploadMSTmarks/:branch/:mst/:sem',authTeacher, async (req,res)=>{
    const sem = req.params.sem;
    const branch = req.params.branch;
    const mst = req.params.mst;
    let studentData = [];

    await Student.find({
        branch:`${branch}`,
        sem:`${sem}`,
    })
     .then((result)=>{ 
        if(result!=null){
            studentData = result;
        }else{
            studentData = null;
        }
     })
     .catch((err)=>{console.log(err)})
     res.render('teachers/uploadMsem',{teacherName,studentData,mst});
})

app.get('/teacher/uploadAttendence',authTeacher,(req,res)=>{
    res.render('teachers/uploadAttendenceBranch',{teacherName})
})
app.get('/teacher/uploadAttendence/:branch',authTeacher,(req,res)=>{
    const branch = req.params.branch;
    res.render('teachers/uploadAttendenceSemester',{teacherName,branch})
})

app.get('/teacher/uploadAttendence/:branch/:sem',authTeacher, async (req,res)=>{
    const sem = req.params.sem;
    const branch = req.params.branch;
    let studentData = [];

    await Student.find({sem:`${sem}`,branch:`${branch}`}).sort({roll_no:1})
     .then((result)=>{
        studentData = result;
     })
     .catch((err)=>{console.log(err)})
    
    res.render('teachers/uploadAttendence',{teacherName,studentData,teacherData});
})

app.post('/teacher/uploadingAttendence/:branch/:sem/:id',authTeacher, async (req,res)=>{
    const p = req.params;
    const data = req.body;
    Student.updateOne({_id:p.id},{$set:{attendence:`${data.attendence}`}},{new:true})
     .then((result)=>{
        res.redirect(`/teacher/uploadAttendence/${p.branch}/${p.sem}`);
     })
     .catch((err)=>{console.log(err)})
})


// app.get('/teacher/uploadAttendence',authTeacher,(req,res)=>{
//     res.render('teachers/uploadAttendence',{teacherName});
// })


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
        roll_no:data.rollNo,
        father_name:data.fatherName,
        mother_name:data.motherName,
        course:data.course.toUpperCase(),
        branch:data.branch.toUpperCase(),
        username:data.username,
        password:spassword,
        email:data.email,
        ad_date:data.admission_date,
        m_no:data.m_no,
        sem:data.sem,
        dob:data.dob,
        pm_no:data.pm_no,
        address:data.address,
        gender:data.gender,
        mst1:'null',
        mst2:'null',
        attendence: '0'
    };
    Student.create(obj,(err,data)=>{
        if(err){
            console.log(err)
        }
        else{
            console.log('Student added');
            res.redirect('/addingStudentSuccess');
        }
    })
});
app.get('/addingStudentSuccess',authAdmin,(req,res)=>{
    res.send('New Student Successfully');
})
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
                    studentName = [`${result.first_name} `+`${result.last_name}`,result.sem,result.gender,result.branch ,result.username];
                    student = result;
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
app.get('/studentDashboard',authStudent,async(req,res)=>{
    let currentStudent = [];
    let notices = [];

    await Notice.find()
     .then((data)=>{
         notices = data.reverse();
     })
     .catch((err)=>{console.log(err)});

    await Student.findOne({username:studentName[4]})
     .then((result)=>{ currentStudent = result})
     .catch((err)=>{console.log(err)})

    res.render('student/StudentDashboard',{studentName:studentName[0],gender:studentName[2],currentStudent, notices});
});

app.get('/student/NoticeBoard',authStudent,async(req,res)=>{
    let notices = [];
    await Notice.find()
     .then((data)=>{
         notices = data.reverse();
     })
     .catch((err)=>{console.log(err)});

     res.render('student/studentNoticeBoard',{studentName:studentName[0],gender:studentName[2],notices})
})

app.get('/student/checkAttendence',authStudent,async (req,res)=>{
    res.render('student/checkAttendence',{studentName:studentName[0],gender:studentName[2],student})
})


app.get('/student/checkAssignments',authStudent,async (req,res)=>{
    let assignments = [];

    await Assignment.find()
     .then((result)=>{assignments = result})
     .catch((err)=>{console.log(err)})

    res.render('student/checkAssignments',{studentName:studentName[0],gender:studentName[2], assignments,student})
})

app.get('/student/viewAssignment/:id',authStudent,async (req,res)=>{
    const id = req.params.id;
    await Assignment.findOne({_id:id})
     .then((result)=>{
        res.render('student/viewAssignment',{assignment:result})
     })
})

app.get('/student/checkMSTmarks',authStudent,(req,res)=>{
    res.render('student/checkMSTmarks',{studentName:studentName[0],gender:studentName[2],student})
})

app.get('/StudentLogout',(req,res)=>{
    isStudent = 'false';
    studentName = 'Student';
    student = [];
    res.redirect('/');
})

// 404 Page
app.use((req,res)=>{
    res.send('404 Page');
})