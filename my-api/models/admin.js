const path = require('path');
const connection = require('../config/config');


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
            Lineprocess lp ON rr.lineprocess = lp.lineprocess_id 
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
            Lineprocess lp ON nr.lineprocess = lp.lineprocess_id 
        WHERE 
            r.request_type = 'New Request' 
        AND 
            r.request_id = ?`, [request_id], callback)
    },

    rejectRequest: function (request_id, callback) {

        connection.beginTransaction((err) => {
            if (err) {
                return callback(err);
            }
    
            // ลบขั้นตอนที่เกี่ยวกับการดึงพาธของรูปภาพและการลบไฟล์
    
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
                            callback(null); // Request deleted successfully
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


module.exports = Admin;