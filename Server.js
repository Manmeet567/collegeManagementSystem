const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const path = require('path');
const mongoose = require('mongoose');
const Admin = require('./models/addAdmin');
const bcrypt = require('bcryptjs');
const { read } = require('fs');



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
function authAdmin(req,res,next){
    if(isAdmin === `${process.env.ADMIN_KEY}`){
        next();
    }else{
        res.redirect('/adminLogin');
    }
}

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
app.get('/adminDashboard',authAdmin,(req,res)=>{
    res.render('admin/AdminDashboard');
})


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
                    isAdmin = `${process.env.ADMIN_KEY}`
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
app.get('/adminAddStudent', authAdmin, (req,res)=>{
    res.render('student/AddStudent');
})

app.get('/Adminlogout',(req,res)=>{
    isAdmin = 'false';
    res.redirect('/');
})
// Admin Routes END

// ------------------------------------------------------------------------------------------

// Teacher Routes Start



app.use((req,res)=>{
    res.send('404 Page');
})