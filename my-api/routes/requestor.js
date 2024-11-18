const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY; 
const Requestor = require('../models/requestor');


// Middleware สำหรับตรวจสอบ Token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(403).send('Forbidden: No token provided');
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).send('Forbidden: Invalid token');
        }
        req.user = user;
        next();
    });
};


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
router.post('/request', authenticateToken, (req, res) => {

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
        } = req.body;

        console.log('Received data:', req.body);

        const user_id = req.user.id;
        const requestor = `${req.user.firstname} ${req.user.lastname}`;
        const lineStopValue = linestop ? 1 : 0;

        if (!['Repair Request', 'New Request'].includes(request_type)) {
            return res.status(400).send('Invalid request type');
        }

        const requestData = {
            user_id,
            request_type, // ใช้ค่าจากอาร์เรย์
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
                const newRequestData = {
                    request_id: requestId,
                    lineprocess: lineprocess,
                    station,
                    subject,
                    cause,
                    detail,
                    job_type: job_type,
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



module.exports = router;