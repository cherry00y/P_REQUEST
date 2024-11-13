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

    getamountissuetype: function(callback) {
        connection.query(`
            SELECT 
            Year,
            Month,
            issuetype_name,
            RequestCount
        FROM (
            SELECT 
                YEAR(r.date) AS Year,
                MONTH(r.date) AS Month,
                it.issuetype_name,
                COUNT(rr.repairrequest_id) AS RequestCount,
                @rank := IF(@currentYearMonth = CONCAT(YEAR(r.date), MONTH(r.date)), @rank + 1, 1) AS rank,
                @currentYearMonth := CONCAT(YEAR(r.date), MONTH(r.date))
            FROM 
                Request r
            JOIN 
                RepairRequest rr ON r.request_id = rr.request_id
            JOIN 
                IssueType it ON rr.subjectrr = it.issuetype_id
            CROSS JOIN 
                (SELECT @rank := 0, @currentYearMonth := '') AS vars
            GROUP BY 
                YEAR(r.date), MONTH(r.date), it.issuetype_name
            ORDER BY 
                Year, Month, RequestCount DESC
        ) AS RankedRequests
        WHERE 
            rank <= 3
        ORDER BY 
            Year ASC, 
            Month ASC, 
            RequestCount DESC;

        `, callback)
    }
};

module.exports = Dashboard;