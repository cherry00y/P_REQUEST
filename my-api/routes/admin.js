const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY;
const Admin = require('../models/admin');


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
            const baseUrl = `${req.protocol}://${req.get('host')}/`;
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