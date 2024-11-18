const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY;
const connection = require('../config/config');


const UserService = {
    login: function(email, employee_code, callback) {
        const query = 
            `SELECT u.*, p.position_name 
            FROM User u 
            JOIN Position p ON u.position_id = p.position_id 
            WHERE u.email = ? AND u.employee_code = ?`;

        connection.query(query, [email, employee_code], (err, results) => {
            if (err) {
                return callback(err, null);
            }

            if (results.length > 0) {
                const user = results[0];
                const token = jwt.sign({
                    id: user.id,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    position: user.position_name
                }, secretKey, { expiresIn: '20m' });

                return callback(null, { token, user });
            } else {
                return callback(null, null); // No user found
            }
        });
    }
};


module.exports = UserService;