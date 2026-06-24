const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const path = require("path");

const User = require("./models/User");
const Leave = require("./models/Leave");
const Admin = require("./models/Admin");

const app = express();

/* Middleware */

app.use(express.json());
app.use(cors());

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);

/* MongoDB Connection */

mongoose.connect(
    "mongodb://127.0.0.1:27017/leave_management"
)
.then(() => {
    console.log("MongoDB Connected");
})
.catch((err) => {
    console.log(err);
});

/* REGISTER */

app.post("/register", async (req, res) => {

    try {

        const {
            employeeId,
            fullName,
            email,
            password
        } = req.body;

        const existingUser =
        await User.findOne({ email });

        if(existingUser){

            return res.json({
                message: "User Already Exists"
            });

        }

        const hashedPassword =
        await bcrypt.hash(
            password,
            10
        );

        const user = new User({

            employeeId,
            fullName,
            email,
            password: hashedPassword

        });

        await user.save();

        res.json({
            message:
            "Registration Successful"
        });

    } catch(error){

        res.status(500).json({
            message:error.message
        });

    }

});

/* LOGIN */

app.post("/login", async (req,res)=>{

    try{

        const {
            email,
            password
        } = req.body;

        const user =
        await User.findOne({
            email
        });

        if(!user){

            return res.json({

                success:false,

                message:
                "User Not Found"

            });

        }

        const match =
        await bcrypt.compare(
            password,
            user.password
        );

        if(!match){

            return res.json({

                success:false,

                message:
                "Invalid Password"

            });

        }

        res.json({

            success:true,

            user:{

                employeeId:
                user.employeeId,

                fullName:
                user.fullName,

                email:
                user.email

            }

        });

    }catch(error){

        res.status(500).json({
            message:error.message
        });

    }

});

/* ==========================
   ADMIN LOGIN
========================== */

app.post(
"/adminLogin",
async(req,res)=>{

    try{

        const{
            email,
            password
        } = req.body;

        const admin =
        await Admin.findOne({
            email
        });

        if(!admin){

            return res.json({

                success:false,

                message:
                "Admin Not Found"

            });

        }

        const match =
        await bcrypt.compare(

            password,

            admin.password

        );

        if(!match){

            return res.json({

                success:false,

                message:
                "Invalid Password"

            });

        }

        res.json({

            success:true,

            admin:{

                fullName:
                admin.fullName,

                email:
                admin.email

            }

        });

    }catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

});

/* APPLY LEAVE */

app.post(
"/applyLeave",
async(req,res)=>{

    try{

        const leave =
        new Leave({

            employeeId:
            req.body.employeeId,

            fullName:
            req.body.fullName,

            leaveType:
            req.body.leaveType,

            fromDate:
            req.body.fromDate,

            toDate:
            req.body.toDate,

            reason:
            req.body.reason

        });

        await leave.save();

        res.json({

            success:true,

            message:
            "Leave Applied Successfully"

        });

    }catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

});

/* DASHBOARD STATS */

app.get(
"/leaveStats/:employeeId",
async(req,res)=>{

    try{

        const employeeId =
        req.params.employeeId;

        const totalLeaves =
        await Leave.countDocuments({
            employeeId
        });

        const approvedLeaves =
        await Leave.countDocuments({
            employeeId,
            status:"Approved"
        });

        const pendingLeaves =
        await Leave.countDocuments({
            employeeId,
            status:"Pending"
        });

        const rejectedLeaves =
        await Leave.countDocuments({
            employeeId,
            status:"Rejected"
        });

        const leaveBalance =
        15 - approvedLeaves;

        res.json({

            totalLeaves,
            approvedLeaves,
            pendingLeaves,
            rejectedLeaves,
            leaveBalance

        });

    }catch(error){

        res.status(500).json({
            message:error.message
        });

    }

});

/* LEAVE HISTORY */

app.get(
"/myLeaves/:employeeId",
async(req,res)=>{

    try{

        const leaves =
        await Leave.find({

            employeeId:
            req.params.employeeId

        });

        res.json(leaves);

    }catch(error){

        res.status(500).json({
            message:error.message
        });

    }

});

/* ==========================
   ADMIN REGISTER
========================== */

app.post(
"/adminRegister",
async(req,res)=>{

    try{

        const{
            fullName,
            email,
            password
        } = req.body;

        const existingAdmin =
        await Admin.findOne({
            email
        });

        if(existingAdmin){

            return res.json({

                success:false,

                message:
                "Admin Already Exists"

            });

        }

        const hashedPassword =
        await bcrypt.hash(
            password,
            10
        );

        const admin =
        new Admin({

            fullName,
            email,
            password:
            hashedPassword

        });

        await admin.save();

        res.json({

            success:true,

            message:
            "Admin Registered Successfully"

        });

    }catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

});

/* ==========================
   ADMIN LOGIN
========================== */

app.post(
"/adminLogin",
async(req,res)=>{

    try{

        const{
            email,
            password
        } = req.body;

        const admin =
        await Admin.findOne({
            email
        });

        if(!admin){

            return res.json({

                success:false,

                message:
                "Admin Not Found"

            });

        }

        const match =
        await bcrypt.compare(
            password,
            admin.password
        );

        if(!match){

            return res.json({

                success:false,

                message:
                "Invalid Password"

            });

        }

        res.json({

            success:true,

            admin:{

                fullName:
                admin.fullName,

                email:
                admin.email

            }

        });

    }catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

});

/* ==========================
   GET ALL LEAVES
========================== */

app.get(
"/allLeaves",
async(req,res)=>{

    try{

        const leaves =
        await Leave.find();

        res.json(leaves);

    }catch(error){

        res.status(500).json({

            message:error.message

        });

    }

});

/* ==========================
   APPROVE LEAVE
========================== */

app.put(
"/approveLeave/:id",
async(req,res)=>{

    try{

        await Leave.findByIdAndUpdate(

            req.params.id,

            {
                status:"Approved"
            }

        );

        res.json({

            success:true,

            message:
            "Leave Approved"

        });

    }catch(error){

        res.status(500).json({

            message:error.message

        });

    }

});

/* ==========================
   REJECT LEAVE
========================== */

app.put(
"/rejectLeave/:id",
async(req,res)=>{

    try{

        await Leave.findByIdAndUpdate(

            req.params.id,

            {
                status:"Rejected"
            }

        );

        res.json({

            success:true,

            message:
            "Leave Rejected"

        });

    }catch(error){

        res.status(500).json({

            message:error.message

        });

    }

});

/* ==========================
   TOTAL EMPLOYEES
========================== */

app.get(
"/employeeCount",
async(req,res)=>{

    try{

        const count =
        await User.countDocuments();

        res.json({

            count

        });

    }catch(error){

        res.status(500).json({

            message:error.message

        });

    }

});

/* ==========================
   ADMIN STATS
========================== */

app.get(
"/adminStats",
async(req,res)=>{

    try{

        const employees =
        await User.countDocuments();

        const requests =
        await Leave.countDocuments();

        const approved =
        await Leave.countDocuments({
            status:"Approved"
        });

        const pending =
        await Leave.countDocuments({
            status:"Pending"
        });

        const rejected =
        await Leave.countDocuments({
            status:"Rejected"
        });

        res.json({

            employees,
            requests,
            approved,
            pending,
            rejected

        });

    }catch(error){

        res.status(500).json({
            message:error.message
        });

    }

});

app.get("/allEmployees", async(req,res)=>{

    try{

        const employees =
        await User.find();

        res.json(employees);

    }catch(error){

        res.status(500).json({
            message:error.message
        });

    }

});

/* SERVER */

app.listen(5000, ()=>{

    console.log(
        "Server Running on Port 5000"
    );

});