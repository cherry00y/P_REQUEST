const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY; 
const connection = require('../config/config');




// กำหนดที่เก็บไฟล์และประเภทไฟล์ที่อนุญาต
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads'); // โฟลเดอร์ที่ใช้เก็บไฟล์
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // ตั้งชื่อไฟล์ด้วยเวลาและนามสกุลไฟล์
    }
});

const upload = multer({ storage: storage });


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



const Requestor = {

    getIssueType: function(callback) {
        connection.query('SELECT * FROM `IssueType`', callback);
    },

    getJobType: function(callback){
        connection.query('SELECT * FROM `JobType`', callback);
    },

    getLineProcess: function(callback){
        connection.query('SELECT * FROM `Lineprocess`', callback)
    },

    getRank: function(callback){
        connection.query('SELECT * FROM `Ranks`', callback)
    },

    insertRequest: function(requestData, callback) {
        const status = 'Request';
        const query = 'INSERT INTO `Request`(`user_id`, `date`, `request_type`, `status`, `requestor`, `sup_requestor`, `sup_ke`, `duedate`) VALUES(?, NOW(), ?, ?, ?, ?, ?, ?)';
        connection.query(query, [
            requestData.user_id, 
            requestData.request_type, 
            status, 
            requestData.requestor, 
            null, null], 
            (err, results) => {
            if (err) {
                console.error('Error executing query:', err);
                return callback(err, null);
            }
            return callback(null, results.insertId);
        });
    },
        

    insertRepairRequest: function(repairData, callback) {
        const query = 
        `INSERT INTO RepairRequest (request_id, rank, lineprocess, station, subjectrr, linestop, problem)
            VALUES (?, ?, ?, ?, ?, ?, ?)`;
        connection.query(query, [
            repairData.request_id, 
            repairData.rank, 
            repairData.lineprocess, 
            repairData.station, 
            repairData.subjectrr, 
            repairData.linestop ? 1:0, 
            repairData.problem
        ], callback);
    },

    insertNewRequest: function(newRequestData, callback) {
        const query = `
            INSERT INTO NewRequest (request_id, job_type,lineprocess, station, subject, cause, detail,image)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        connection.query(query, [
            newRequestData.request_id, 
            newRequestData.job_type,
            newRequestData.lineprocess, 
            newRequestData.station, 
            newRequestData.subject, 
            newRequestData.cause, 
            newRequestData.detail, 
            newRequestData.image
            
        ], callback);
    },
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


router.post('/request', authenticateToken, upload.single('image'), (req, res) => {
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

    console.log('Received data:', {
        request_type,
        rank,
        lineprocess,
        duedate,
        station,
        subjectrr,
        linestop,
        problem,
        job_type,
        subject,
        cause,
        detail,
        image: req.file
    });

    const user_id = req.user.id; // ดึง user_id จาก token
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
            const imagePath = req.file ? req.file.path : null; // ดึง path ของไฟล์

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

module.exports = router; // ส่งออกเป็น router เท่านั้น
