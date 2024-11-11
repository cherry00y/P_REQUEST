const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const connection = require('../config/config');
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY;

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

const Admin = {
    getRequest: function(callback) {
        connection.query(`
            SELECT 
            r.request_id AS 'Doc No.', 
            CASE 
                WHEN r.request_type = 'Repair Request' THEN it.issuetype_name
                WHEN r.request_type = 'New Request' THEN nr.subject
                ELSE NULL 
            END AS 'Subject',
            r.date AS 'Date',
            r.request_type AS 'Type',
            r.requestor AS 'Requester',
            r.status AS 'Status',
            rr.rank AS 'Rank'
        FROM 
            Request r
        LEFT JOIN 
            RepairRequest rr ON rr.request_id = r.request_id
        LEFT JOIN 
            NewRequest nr ON nr.request_id = r.request_id
        LEFT JOIN 
            IssueType it ON rr.subjectrr = it.issuetype_id
        LEFT JOIN 
            Ranks rk ON rr.rank = rk.rank_id 
        WHERE 
            r.status = 'Request'`,callback)
    },

    getDetailRepair: function(request_id,callback) {
        connection.query(`
            SELECT 
            r.request_id AS 'Doc No.', 
            r.requestor AS 'Requestor',
            r.date AS 'Date',
            rk.description AS 'Rank',
            it.issuetype_name AS 'Subject', 
            lp.lineprocess_name AS 'Line Process', 
            rr.station AS 'Station',
            CASE 
                WHEN rr.linestop = 0 THEN NULL
                ELSE 'เกิด Line Stop'
            END AS 'Line Stop', 
            rr.problem AS 'Detail'
        FROM 
            Request r
        LEFT JOIN 
            RepairRequest rr ON rr.request_id = r.request_id
        LEFT JOIN 
            IssueType it ON rr.subjectrr = it.issuetype_id 
        LEFT JOIN 
            LineProcess lp ON rr.lineprocess = lp.lineprocess_id 
        LEFT JOIN 
            Ranks rk ON rr.rank = rk.rank_id  -- Join with RankDescriptions table
        WHERE 
            r.request_type = 'Repair Request' 
        AND 
            r.request_id = ?`,[request_id], callback)
    },

    getDetailNewRequest: function(request_id,callback) {
        connection.query(`
            SELECT 
            r.request_id AS 'Doc No.', 
            r.requestor AS 'Requestor', 
            r.date AS 'Date', 
            jb.jobtype_name AS 'JobType', 
            nr.subject As 'Subject', 
            lp.lineprocess_name AS 'Line Process', 
            nr.station AS 'Station', 
            nr.cause As 'Cause', 
            nr.detail AS 'Detail', 
            nr.image As 'Image' ,
            nr.newrequest_id As 'NewRequestID'
        FROM 
            Request r 
        LEFT JOIN
            NewRequest nr ON nr.request_id = r.request_id 
        LEFT JOIN 
            JobType jb ON nr.job_type = jb.jobtype_id 
        LEFT JOIN 
            LineProcess lp ON nr.lineprocess = lp.lineprocess_id 
        WHERE 
            r.request_type = 'New Request' 
        AND 
            r.request_id = ?`, [request_id], callback)
    },

    rejectRequest: function (request_id, callback) {
        const uploadsDir = path.join('/Users/dawan/Desktop/intern/P_Request/my-api', 'uploads');

        connection.beginTransaction((err) => {
            if (err) {
                return callback(err);
            }
    
            // Retrieve the image path for the request from NewRequest table
            db.query('SELECT image FROM NewRequest WHERE request_id = ?', [request_id], (err, results) => {
                if (err) {
                    return db.rollback(() => callback(err));
                }
    
                const imagePath = results[0]?.image;
    
                // Delete the image if it exists
                if (imagePath) {
                    const fullImagePath = path.join(uploadsDir, path.basename(imagePath));
    
                    fs.unlink(fullImagePath, (err) => {
                        if (err) {
                            console.error('Error deleting image:', err);
                            // Log error but proceed with the transaction (optional)
                        }
                    });
                }
    
                // Delete request_id from RepairRequest table
                db.query('DELETE FROM RepairRequest WHERE request_id = ?', [request_id], (err, results) => {
                    if (err) {
                        return db.rollback(() => callback(err));
                    }
    
                    // Delete request_id from NewRequest table
                    db.query('DELETE FROM NewRequest WHERE request_id = ?', [request_id], (err, results) => {
                        if (err) {
                            return db.rollback(() => callback(err));
                        }
    
                        // Delete request_id from Request table
                        db.query('DELETE FROM Request WHERE request_id = ?', [request_id], (err, results) => {
                            if (err) {
                                return db.rollback(() => callback(err));
                            }
    
                            // Commit the transaction
                            db.commit((err) => {
                                if (err) {
                                    return db.rollback(() => callback(err));
                                }
                                callback(null); // Request and image deleted successfully
                            });
                        });
                    });
                });
            });
        });
    },

    acceptRequest: function(request_id, data, callback){
        const { status, sup_ke, duedate } = data;

        const updateQuery = `
        UPDATE Request 
        SET  
            status = ?,
            sup_ke = ?,
            duedate = ? 
        WHERE 
            request_id = ?`;

        const values = [status, sup_ke, duedate, request_id];

        connection.query(updateQuery, values, callback);
     },


    getProduct: function(callback) {
        connection.query(`SELECT * FROM Product;`, callback)
     },


    cost: function(newrequest_id, repairlog_id, costdata, callback) {

        if (!newrequest_id && !repairlog_id) {
            return callback(new Error('Either newrequest_id or repairlog_id is required'), null);
        }
        
        const type = newrequest_id ? 'New Request' : 'Repair Request';
        
        const query = `
            INSERT INTO Cost (newrequest_id, repairlog_id, type, productname, price, quantity) 
            VALUES (?, ?, ?, ?, ?, ?)`;
            
        connection.query(query, [
            newrequest_id || null,
            repairlog_id || null,
            type,
            costdata.productname, // ส่งค่าที่ตรวจสอบแล้ว
            costdata.price,
            costdata.quantity
        ], (error, results) => {
            if (error) {
                console.error('Error inserting cost data:', error);
                callback(error, null);
            } else {
                callback(null, results);
            }
        });
    },

    getInformation: function(callback) {
        connection.query(`SELECT 
            YEAR(r.date) AS year, 
            MONTH(r.date) AS month, 
            r.request_id,
            r.date,
            r.status, 
            r.requestor, 
            r.sup_ke,
            r.request_type,
            CASE 
                WHEN r.request_type = 'Repair Request' THEN it.issuetype_name
                WHEN r.request_type = 'New Request' THEN nr.subject
                ELSE NULL 
            END AS Subject 
        FROM 
            Request r 
        LEFT JOIN 
            NewRequest nr ON nr.request_id = r.request_id
        LEFT JOIN 
            RepairRequest rr ON rr.request_id = r.request_id
        LEFT JOIN 
            IssueType it ON rr.subjectrr = it.issuetype_id
        WHERE 
            r.status IN ('waiting for goods', 'Out of Stock') -- ใช้ IN แทน AND
        ORDER BY 
            year DESC, month DESC;

        `, callback)
        },
        
    getComplatedInformRepair: function(callback) {
        connection.query(`
            SELECT 
            r.request_id AS 'Doc No.',
            it.issuetype_name AS 'Subject',
            rp.implement_end AS 'DataComplete',
            r.request_type AS 'Type', 
            r.status AS 'Status' ,
            rp.repairlog_id AS 'Repairlog_id'
        FROM
            Request r
        LEFT JOIN
            RepairRequest rr ON rr.request_id = r.request_id
        LEFT JOIN
            IssueType it ON rr.subjectrr = it.issuetype_id
        LEFT JOIN
            Repairlog rp ON r.request_id = rp.request_id
        WHERE
            r.status IN ('Completed') 
            AND r.request_type = 'Repair Request'`, callback)
    },
};




router.get('/listrequest', (req, res) => {
    Admin.getRequest((err, results) => {
        if (err) {
            console.error('Error fetching requests:', err);
            return res.status(500).send('Error retrieving data');
        }

        // Adjust the format of results before sending them back
        const modifiedResults = results.map(row => {
            return {
                request_id: `Doc No.24-${row['Doc No.']}`, 
                subject: row.Subject, 
                date: new Date(row.Date).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' }),
                request_type: row.Type,
                requestor: row.Requester,
                status: row.Status
            };
        });

        // Send modifiedResults back to the client
        res.json(modifiedResults);
    });
});


router.get('/detailrepair/:request_id', (req, res) => {
    const request_id = req.params.request_id;

    if (!request_id) {
        return res.status(400).send('Request ID is required');
    }

    Admin.getDetailRepair(request_id, (err, results) => {
        if (err) {
            console.error('Error fetching detailrepair', err);
            return res.status(500).send('Error retrieving data');
        }

        if (Array.isArray(results)) {
            const formattedData = results.map(row => ({
                request_id: `Doc No.24-${row['Doc No.']}`,
                requestor: row.Requestor,
                date: new Date(row.Date).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' }),
                rank: row.Rank,
                subject: row.Subject,
                lineprocess: row['Line Process'],
                station: row.Station,
                linestop: row['Line Stop'],
                detail: row.Detail,
            }));
            res.json(formattedData);
        } else {
            console.error('Unexpected data format:', results);
            res.status(500).send('Unexpected data format');
        }
    });
});



router.get('/detailnewrequest/:request_id', (req,res) => {
    const request_id = req.params.request_id;

    if(!request_id) {
        return res.status(400).send('Request ID is required');
    }

    Admin.getDetailNewRequest(request_id, (err, results) => {
        if(err) {
            console.error('Error fetching datailnewrequest', err);
            return res.status(500).send('Error retrieving data');
        }

        if(Array.isArray(results)) {
            const baseUrl = 'http://localhost:8000/';
            const formattedData = results.map(row =>({
                request_id: `Doc No.24-${row['Doc No.']}`,
                requestor: row.Requestor,
                date: new Date(row.Date).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' }),
                jobtype: row.JobType,
                subject: row.Subject,
                lineprocess: row['Line Process'],
                station: row.Station,
                cause: row.Cause,
                detail: row.Detail,
                image: row.Image ? baseUrl + row.Image : null,
                newrequest_id: row.NewRequestID
            }));
            res.json(formattedData)
        } else {
            console.error('Unexpected data format:', results);
        }
    })
});


router.delete('/reject/:request_id', (req,res) => {
    const request_id = req.params.request_id;

    if(!request_id) {
        return res.status(400).send('Request ID is required');
    }

    Admin.rejectRequest(request_id, (err) => {
        if(err) {
            console.error('Error deleting request:', err);
            return res.status(500).send('Error reject request');
        }

        res.status(200).send('Request ID ${request_id} and associated data deleted successfully');
    });
});


router.put('/acceptrequest/:request_id', authenticateToken, (req, res) => {
    const request_id = req.params.request_id;
    const updatedData = req.body;
    const supervisorName = `${req.user.firstname} ${req.user.lastname}`;


    updatedData.sup_ke = supervisorName;
    
    if(!request_id || !updatedData) {
        return res.status(400).send('Request ID and update data are required');
    }

    Admin.acceptRequest(request_id, updatedData, (err, results) => {
        if(err) {
            console.error('Error updating request:', err);
            return res.status(500).send('Error updating request');
        }

        res.status(200).send('Request ID ${request_id} updated successfully')
    });
});

router.get('/product', (req, res) => {
    Admin.getProduct((err, results) => {
        if(err) {
            res.status(500).send('Error querying the database.');
            return;
        }
        res.json(results)
    })
})


router.post('/addcost', (req, res) => {
    const costdata = req.body;
    
    const newrequest_id = costdata.newrequest_id; // ดึง newrequest_id จาก body
    const repairlog_id = costdata.repairlog_id
    const orderItems = costdata.orderItems; // ดึง orderItems จาก body
    
    if ((!newrequest_id && !repairlog_id) || !Array.isArray(orderItems)) {
        return res.status(400).json({ error: 'Invalid data' });
    }

    // วนลูปเพื่อบันทึก orderItems ทีละรายการ
    const queries = orderItems.map(item => {
        return new Promise((resolve, reject) => {
            Admin.cost(newrequest_id, repairlog_id, item, (err, results) => {
                if (err) {
                    return reject(err);
                }
                resolve(results);
            });
        });
    });

    // รอให้การบันทึกทั้งหมดเสร็จสิ้น
    Promise.all(queries)
        .then(results => {
            res.status(201).json(results);
        })
        .catch(err => {
            console.error('Error inserting cost data:', err); // เพิ่มการจับข้อผิดพลาดเพื่อดูรายละเอียด
            res.status(500).json({ error: 'Error querying the database.' });
        });
});



router.get('/information', (req, res) => {
    Admin.getInformation((err, results) => {
        if (err) {
            console.error('Error fetching requests:', err);
            return res.status(500).send('Error retrieving data');
        }

        const groupedData = results.reduce((acc, row) => {
            const { year, month, status } = row;

            // Group by year
            if (!acc[year]) {
                acc[year] = {};
            }

            // Group by month within the year
            if (!acc[year][month]) {
                acc[year][month] = {};
            }

            // Check if the status array already exists
            if (!acc[year][month][status]) {
                acc[year][month][status] = [];
            }

            // Add request details
            acc[year][month][status].push({
                docNumber: `Doc No.24-${row.request_id}`,
                status: status,
                subject: row.Subject,
                requesttype: row.request_type,
                date: new Date(row.date).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' }),
                requestor: row.requestor,
                acceptor: row.sup_ke,
            });

            // Combine status information if both statuses exist
            if (status === 'waiting for goods' && acc[year][month]['Out of Stock']) {
                acc[year][month]['Out of Stock'].forEach(outOfStockRequest => {
                    outOfStockRequest.status = 'waiting for goods, Out of Stock';
                });
            }

            return acc;
        }, {});

        res.json(groupedData);
    });
});

router.get('/InformCompleteRepari', (req, res) => {
    Admin.getComplatedInformRepair((err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            res.status(500).send('Error retrieving data');
        }

        const modifiedResults = results.map(row => {
            return {
                request_id: `Doc No.24-${row['Doc No.']}`,
                subject: row.Subject,
                datecompleted: new Date(row.DataComplete).toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok' }),
                request_type: row.Type,
                status: row.Status,
                repairlog_id: row.Repairlog_id
            };
            
        });

        res.json(modifiedResults)
    });
});



module.exports = router;