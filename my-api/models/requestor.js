const connection = require('../config/config');


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
            null, null,null], 
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
        'INSERT INTO RepairRequest (request_id, `rank`, lineprocess, station, subjectrr, linestop, problem) VALUES (?, ?, ?, ?, ?, ?, ?)';
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


module.exports = Requestor; // ส่งออกเป็น router เท่านั้น
