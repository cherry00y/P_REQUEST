const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const async = require('async');
const secretKey = process.env.SECRET_KEY;
const Operator = require('../models/worker');

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

router.get('/RepairRequest', (req, res) => {
    Operator.getAcceptRepair((err, results) => {
        if (err) {
            console.error('Error fetching request:', err);
            return res.status(500).send('Error retrieving data');
        }

        const modifiedResults = results.map(row => {
            return {
                request_id: `Doc No.24-${row['Doc No.']}`,
                subject: row.Subject,
                duedate: new Date(row.DueDate).toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok' }),
                request_type: row.Type,
                status: row.Status
            };
        });

        res.json(modifiedResults);
    });
});

router.get('/NewRequest', (req, res) => {
    Operator.getAcceptNew((err, results) => {
        if (err) {
            console.error('Error fetching request:', err);
            return res.status(500).send('Error retrieving data');
        }

        const modifiedResults = results.map(row => {
            return {
                request_id: `Doc No.24-${row['Doc No.']}`,
                subject: row.Subject,
                duedate: new Date(row.DueDate).toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok' }),
                request_type: row.Type,
                status: row.Status
            };
        });

        res.json(modifiedResults);
    });
});

router.get('/TypeScrewdriver', (req, res) => {
    Operator.getTypeScrewdriver((err, results) => {
        if (err) {
            console.error('Error fetching request:', err);
            return res.status(500).send('Error retrieving data');
        }
        res.json(results);
    })
});

router.post('/Implement', authenticateToken, (req, res) => {
    const {
        cause,
        solution,
        comment,
        torque_label,
        torque_check1,
        torque_check2,
        torque_check3,
        typesd,
        serial_no,
        speed,
        has_document,
        numberdoc,
        implement_start,
        implement_end,
        request_id
    } = req.body;

    console.log('Received data:', {
        cause,
        solution,
        comment,
        torque_label,
        torque_check1,
        torque_check2,
        torque_check3,
        typesd,
        serial_no,
        speed,
        has_document,
        numberdoc,
        implement_start,
        implement_end,
        request_id
    });


    const getFormattedTimeForDatabase = (timeString) => {
        const date = new Date();
        const [hours, minutes, seconds] = timeString.split(':');
        
        // ตั้งเวลาตามชั่วโมง, นาที, และวินาทีที่ได้รับมา
        date.setHours(Number(hours), Number(minutes), Number(seconds), 0);

        // แปลงเวลาเป็นโซนประเทศไทย (UTC+7)
        const utcTimestamp = date.getTime();
        const thaiTime = new Date(utcTimestamp + (7 * 60 * 60 * 1000));

        // คืนค่าตามรูปแบบ ISO ที่ตัดวันที่ออก
        return thaiTime.toISOString().slice(0, 19).replace('T', ' ');
    };

    const formattedImplementStart = implement_start ? getFormattedTimeForDatabase(implement_start) : null;
    const formattedImplementEnd = implement_end ? getFormattedTimeForDatabase(implement_end) : null;

    const operator_id = req.user.id;
    const operator_name = `${req.user.firstname} ${req.user.lastname}`;
    const hasdocument = has_document ? 1 : 0;

    const implementData = {
        operator_id,
        cause,
        solution,
        comment,
        implement_start: formattedImplementStart,
        implement_end: formattedImplementEnd,
        operator_name
    };

    Operator.insertImplement(request_id, implementData, (err, repairlogId) => {
        if (err) {
            console.error('Error inserting implement:', err);
            return res.status(500).send('Error inserting implement');
        }

        const tasks = [];

        if (torque_label && torque_check1 && torque_check2 && torque_check3) {
            const torqueData = {
                torque_label,
                torque_check1,
                torque_check2,
                torque_check3,
                repairlog_id: repairlogId
            };
            tasks.push(callback => Operator.insertValueTorque(torqueData, callback));
        }

        if (typesd && speed && serial_no) {
            const screwdriverData = {
                typesd,
                speed,
                serial_no,
                repairlog_id: repairlogId
            };
            tasks.push(callback => Operator.insertScrewdriver(screwdriverData, callback));
        }

        if (has_document || numberdoc) {
            const documentData = {
                has_document: hasdocument,
                numberdoc,
                repairlog_id: repairlogId
            };
            tasks.push(callback => Operator.insertDocument(documentData, callback));
        }

        if (tasks.length > 0) {
            async.parallel(tasks, (err, results) => {
                if (err) {
                    console.error('Error inserting additional data:', err);
                    return res.status(500).send('Error inserting additional data')
                }
                res.status(200).send('Data inserted successfully')
            });
        } else {
            res.status(200).send('Implement inserted successfully without additional data');
        }

    });

});

module.exports = router;