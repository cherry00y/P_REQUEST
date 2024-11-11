const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const jwt = require('jsonwebtoken');
const async = require('async');
const secretKey = process.env.SECRET_KEY;
const connection = require('../config/config');


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


const Operator = {
    getAcceptRepair: function(callback) {
        connection.query(`
            SELECT 
            r.request_id AS 'Doc No.', 
            it.issuetype_name AS 'Subject', 
            r.duedate AS 'DueDate', 
            r.request_type AS 'Type', 
            
        FROM 
            Request r 
        LEFT JOIN 
            RepairRequest rr ON rr.request_id = r.request_id 
        LEFT JOIN 
            IssueType it ON rr.subjectrr = it.issuetype_id 
        WHERE 
            r.status IN ('Accept', 'Waiting for goods', 'Out of stock') 
            AND r.request_type = 'Repair Request'`, callback)
    },

    getAcceptNew: function(callback) {
        connection.query(`
            SELECT 
            r.request_id AS 'Doc No.', 
            nr.subject AS 'Subject', 
            r.duedate AS 'DueDate', 
            r.request_type AS 'Type', 
            r.status AS 'Status' 
        FROM 
            Request r 
        LEFT JOIN 
            NewRequest nr ON nr.request_id = r.request_id
        WHERE 
            r.status IN ('Accept', 'Waiting for goods', 'Out of stock') 
            AND r.request_type = 'New Request'`,callback)
    },

    getTypeScrewdriver: function(callback) {
        connection.query(`
            SELECT * FROM TypeScrewdriver`, callback)
    },

    insertImplement: function(request_id, implementData, callback) {
        const status = 'Completed';
        const insertQuery = `INSERT INTO Repairlog (cause, solution, comment, operator_id, operator_name, implement_start, implement_end, request_id) VALUES(?, ?, ?, ?, ?, ?, ?, ?)`;
        const updateQuery = `UPDATE Request SET status = ? WHERE request_id = ?`;
    
        // Start transaction
        connection.beginTransaction((err) => {
            if (err) return callback(err);
    
            // Insert into Repairlog
            connection.query(insertQuery, [
                implementData.cause,
                implementData.solution,
                implementData.comment,
                implementData.operator_id,
                implementData.operator_name,
                implementData.implement_start,
                implementData.implement_end,
                request_id
            ], (insertErr, result) => {
                if (insertErr) {
                    // Rollback if there's an error in the insert
                    return db.rollback(() => {
                        callback(insertErr);
                    });
                }

                const repairlogId = result.insertId;
    
                // Update status in Request table
                connection.query(updateQuery, [status, request_id], (updateErr, result) => {
                    if (updateErr) {
                        // Rollback if there's an error in the update
                        return db.rollback(() => {
                            callback(updateErr);
                        });
                    }
    
                    // Commit transaction if both queries succeeded
                    connection.commit((commitErr) => {
                        if (commitErr) {
                            return db.rollback(() => {
                                callback(commitErr);
                            });
                        }
                        callback(null, repairlogId);
                    });
                });
            });
        });
    },

    insertValueTorque: function(torquedata, callback) {
        const inserttorque = `INSERT INTO Torque(torque_label, torque_check1, torque_check2, torque_check3, repairlog_id)
            VALUES(?, ?, ?, ?, ?)`;

        connection.query(inserttorque, [
            torquedata.torque_label,
            torquedata.torque_check1,
            torquedata.torque_check2,
            torquedata.torque_check3,
            torquedata.repairlog_id
        ], callback)
    },

    insertScrewdriver: function(screwdriver, callback) {
        const insesrtscrewdriver = `INSERT INTO Screwdriver(typesd, speed, serial_no, repairlog_id)
            VALUES(?, ?, ?, ?)`;

        connection.query(insesrtscrewdriver, [
            screwdriver.typesd,
            screwdriver.speed,
            screwdriver.serial_no,
            screwdriver.repairlog_id
        ], callback)
    },

    insertDocument: function(document, callback) {
        const insertdoc = `INSERT INTO Document(has_document, numberdoc, repairlog_id)
            VALUES(?, ?, ?)`;

        connection.query(insertdoc, [
            document.has_document ? 1:0,
            document.numberdoc,
            document.repairlog_id
        ], callback)
    }

};

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


    const formattedImplementStart = new Date(implement_start).toISOString().slice(0, 19).replace('T', ' ');
    const formattedImplementEnd = new Date(implement_end).toISOString().slice(0, 19).replace('T', ' ');

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