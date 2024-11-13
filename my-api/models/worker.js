const connection = require('../config/config');

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


module.exports = Operator;