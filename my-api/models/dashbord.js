const connection = require('../config/config');

const Dashboard = {
    
    getamountrequest: function(callback) {
        connection.query(`
            SELECT 
            DATE_FORMAT(date, '%Y-%m-%d') AS day, 
            COUNT(*) AS count 
        FROM 
            Request 
        GROUP BY 
            day 
        ORDER BY 
            day ASC;`,callback)
    },

    getamounttype: function(callback) {
        connection.query(`
            SELECT 
            request_type, 
            DATE_FORMAT(date, '%Y-%m-%d') AS day, 
            COUNT(*) AS count 
        FROM 
            Request 
        WHERE 
            DAYOFWEEK(date) BETWEEN 2 AND 6  -- กรองเฉพาะวันจันทร์ถึงศุกร์ (2 = Monday, 6 = Friday)
        GROUP BY 
            request_type, day
        ORDER BY 
            day ASC;
        `, callback)
    },

    getamountrequestyear: function(callback) {
        connection.query(`
            SELECT 
            YEAR(date) AS year, 
            MONTH(date) AS month, 
            request_type, 
            COUNT(*) AS count
        FROM Request
        GROUP BY YEAR(date), MONTH(date), request_type
        ORDER BY year ASC, month ASC`, callback)
    },

};

module.exports = Dashboard;