import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'
import multer from 'multer'
const app = express()
dotenv.config()

/* CORS */

app.use(cors({
    origin: ["http://localhost:5173","https://global-server-ten.vercel.app"],
    credentials: true
}))
app.options("*",cors())
app.use(express.json())
const storage=multer.memoryStorage()
const upload= multer({storage}).single('file')
app.get('/home', (req, res) => {
    res.status(200).send({ message: "backend" })
})

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    },
    debug: true
})

// Load HTML Template
const templatePath = path.join("src/template.html")
const htmlTemplate = fs.readFileSync(templatePath, 'utf-8')
app.post('/service/form',async(req,res)=> {

    try{
        const data=req.body
        await transporter.sendMail({
            from:data.email,
            to:process.env.HOSTEMAIL,
            subject:`message from service form from ${data.name}`,
            text:`
            Full Name:${data.name}
            Email:${data.email}
            Phone Number:${data.phone}
            Faq:${data.faq}
            `
        })
        res.status(200).json({data:data})
    }catch(err){
        return res.status(400).json({message:err})
    }
})
app.get("/",(req,res)=> {
    console.log("server is running")
    res.json("server is running")
})
app.post('/form',upload, async (req, res) => {
    const data = req.body
    const files= req.file
    console.log(files.buffer)
    // console.log(req.file)
    // Dynamically build only non-empty fields
    let content = ""
    const fields = {
        "Full Name": data.fullName,
        "Email Address": data.emailAddress,
        "Contact Number": data.contactNumber,
        "Current Address": data.currentAddress,
        "Purpose": data.purpose,
        "Company Name": data.companyName,
        "Location": data.Companylocation,
        "Position": data.position,
        "EU Work Destination": data.EUworkDestination,
        "GCC Work Destination": data.GCCworkDestination,
        "Occupation": data.occupation,
        "Education": data.education,
        "Visit Country": data.visitCountry,
        "Visit Occupation": data.visitOccupation,
        "Visit Education": data.visitEducation,
        "Travel History": data.travelHistory,
        "Student Destination": data.studentDestination,
        "Student Education": data.studentEducation,
        "Language Test": data.languageTest,
        "Job Destination": data.jobDestination,
        "Job Profession": data.jobProfession,
        "Job Visa Status": data.jobVisaStatus,
        "Message": data.message,
       
       
    }

    // Loop through the fields and only include non-empty ones
    for (const [key, value] of Object.entries(fields)) {
        if (value) {
            content += `<p><strong>${key}:</strong> ${value}</p>\n`
        }
    }

    // Insert content into the HTML template
    const htmlContent = htmlTemplate.replace('{{content}}', content)

    try {
        await transporter.sendMail({
            from: data.emailAddress,
            to: process.env.HOSTEMAIL,
            subject: `(Contact Us)Message from globalconnect user: ${data.fullName}`,
            html: htmlContent,
            attachments:[
                {
                    filename:files?.originalname,
                    content:files?.buffer
                }
            ]
        })
        res.status(200).json({ message: "Success", data: {data,file:files.buffer}})
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

app.listen(5000, () => {
    console.log("Server started at localhost:5000")
})
