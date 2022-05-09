const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config()
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/adminSchema');

const app = express();
const dbURI = process.env.URI;
const port = 3000 || process.env.PORT;

mongoose.connect(dbURI,{ useNewUrlParser: true,useUnifiedTopology: true })
 .then(()=>{
    app.listen(port,()=>{
        console.log(`Listening to server at port ${port}`);
    })
    console.log('Connected to Mongodb');
 })
 .catch((err)=>{
     console.log(err);
 })

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// admin adding route
app.get('/add-admin-159',(req,res)=>{
    res.render('addAdmin');
})
app.post('/',async (req,res)=>{
    let data = req.body;
    let password = data.adpass;
    password =await bcrypt.hash(password,10);
    let obj = {
        first_name:data.first_name,
        last_name:data.last_name,
        adid:data.adid,
        password:password
    };
    console.log(obj);
    // try{
    //     const response = await Admin.create(obj)
    //     console.log('Admin Created Succesfully: ',response);
    //     res.redirect('/')
    // }
    // catch(error){
    //     console.log(error);
    // }
    Admin.create(obj,(err,data)=>{
        if(err){
            console.log(err);
        }
        else{
            console.log('Admin Created successfully',data);
            res.redirect('/');
        }
    })
})

app.get('/', (req, res) => {
    res.render('index',{title:'College Management System'});
})

// Admin Routes Start
app.get('/admin',(req,res)=>{
    res.render('adminLogin',{title:'Admin Login Page'});
})

app.post('/admin/DashBoard',(req,res)=>{
    const body = req.body;
    // if(body.adid == `${process.env.ADID}` && body.username == `${process.env.ADUSN}` && body.password == `${process.env.ADPASS}`){
    //     res.render('adminDash');
    // }else{
    //     res.send('Enter Correct Credentials');
    // }
    console.log('work in progress');
})

app.get('/admin/add-teacher',(req,res)=>{
    res.render('adminAddTeacher');
})
// app.post('/admin/add-teacher',(req,res)=>{
//     const teacher = new Teacher(req.body);

//     teacher.save()
//      .then((result)=>{
//          res.redirect('adminAddTeacher');
//          console.log('Teacher Added');
//      })
//      .catch((err)=>{
//          console.log(err);
//      })

// })
// Admin Routes End

// Teacher Routes Start


app.use((req,res)=>{
    res.send('404 Page');
})