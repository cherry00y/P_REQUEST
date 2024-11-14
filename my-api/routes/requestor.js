const express = require('express');
const router = express.Router();
const formidable = require('formidable');
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY; 
const Requestor = require('../models/requestor');


// Middleware สำหรับตรวจสอบ Token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    console.log('Authorization Header:', authHeader);

    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(403);

    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}


router.get('/issuetype', (req, res) => {
    Requestor.getIssueType((err, results) => {
        if (err) {
            res.status(500).send('Error querying the database.');
            return;
        }
        console.log('Database results: ', results);
        res.json(results);
    });
});

router.get('/rank', (req,res) => {
    Requestor.getRank((err, results) => {
        if(err) {
            res.status(500).send('Error querying the database');
            return;
        }
        res.json(results);
    })
})
router.get('/jobtype', (req, res) => {
    Requestor.getJobType((err, results) => {
        if (err) {
            res.status(500).send('Error querying the database.');
            return;
        }
        res.json(results);
    });
});

router.get('/lineprocess', (req,res) => {
    Requestor.getLineProcess((err,results) => {
        if(err){
            res.status(500).send('Error querying the database.');
            return;
        }
        res.json(results)
    });
});


// สร้าง route สำหรับการอัปโหลดคำร้อง
app.post('/request', authenticateToken, (req, res) => {
    const form = new formidable.IncomingForm();

    // ตั้งค่าจุดที่ต้องการเก็บไฟล์
    form.uploadDir = path.join(__dirname, 'uploads'); // กำหนดที่เก็บไฟล์
    form.keepExtensions = true;  // เก็บนามสกุลไฟล์เดิม
    form.parse(req, (err, fields, files) => {
        if (err) {
            console.error('Error parsing the form:', err);
            return res.status(500).send('Error parsing the form');
        }

        console.log('Fields:', fields);  // ข้อมูลที่ได้จาก body (ไม่รวมไฟล์)
        console.log('Files:', files);    // ข้อมูลไฟล์ที่อัปโหลด

        const {
            request_type,
            rank,
            lineprocess,
            duedate,
            station,
            subjectrr,
            linestop,
            problem,
            subject,
            cause,
            detail,
            job_type
        } = fields;

        const user_id = req.user.id;
        const requestor = `${req.user.firstname} ${req.user.lastname}`;
        const lineStopValue = linestop ? 1 : 0;

        const requestData = {
            user_id,
            request_type,
            requestor,
            duedate: duedate || null
        };

        // บันทึกข้อมูลคำร้องในตาราง Request
        Requestor.insertRequest(requestData, (err, requestId) => {
            if (err) {
                console.error('Error inserting request:', err);
                return res.status(500).send('Error inserting request');
            }

            // ตรวจสอบประเภทคำร้องว่าเป็น Repair Request หรือ New Request
            if (requestData.request_type === 'Repair Request') {
                const repairData = {
                    request_id: requestId,
                    rank: rank,
                    lineprocess: lineprocess,
                    station,
                    subjectrr: subjectrr,
                    linestop: lineStopValue,
                    problem: problem
                };

                Requestor.insertRepairRequest(repairData, (err) => {
                    if (err) {
                        console.error('Error inserting repair request:', err.message);
                        return res.status(500).send('Error inserting repair request');
                    }
                    res.json({ message: 'Repair Request saved successfully' });
                });
            } else if (requestData.request_type === 'New Request') {
                const imagePath = files.pic ? files.pic[0].filepath : null; // ถ้ามีไฟล์ให้ดึง path
                console.log('Image path:', imagePath);

                const newRequestData = {
                    request_id: requestId,
                    lineprocess,
                    station,
                    subject,
                    cause,
                    detail,
                    job_type,
                    image: imagePath // บันทึก path ของไฟล์
                };

                Requestor.insertNewRequest(newRequestData, (err) => {
                    if (err) {
                        console.error('Error inserting new request:', err);
                        return res.status(500).send('Error inserting new request');
                    }
                    res.json({ message: 'New Request saved successfully' });
                });
            } else {
                res.status(400).send('Invalid request type');
            }
        });
    });
});


module.exports = router;