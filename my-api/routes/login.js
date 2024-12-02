const express = require('express');
const router = express.Router();
const UserService = require('../models/login');

function canRequest(position_name) {
    return position_name === 'Staff';
}

// ตรวจสอบว่าเป็น Admin ที่สามารถเข้าดูข้อมูลได้
function isAdmin(position_name) {
    return ['Senior Staff', 'Supervisor', 'Manager', 'Leader'].includes(position_name);
}

// ตรวจสอบว่าเป็น Worker ที่สามารถกรอกข้อมูลได้
function isWorker(position_name) {
    return ['Senior Staff', 'Technician', 'Operator', 'Assistant Technician'].includes(position_name);
}


router.post('/signin', (req, res) => {
    const { email, employee_code } = req.body;

    UserService.login(email, employee_code, (err, data) => {
        if (err) {
            console.error('Login error:', err);
            return res.status(500).send('Error login');
        }

        if (data) {
            const { token, user } = data;
            
            // ตรวจสอบตำแหน่งและกำหนดสิทธิ์ในการเข้าถึง
            if (canRequest(user.position_name)) {
                return res.json({
                    message: 'Login successful for requestor',
                    token: token,
                    user: user
                });
            } else if (isAdmin(user.position_name)) {
                return res.json({
                    message: 'Login successful for admin',
                    token: token,
                    user: user
                });
            } else if (isWorker(user.position_name)) {
                return res.json({
                    message: 'Login successful for worker',
                    token: token,
                    user: user
                });
            } else {
                return res.status(403).send('Unauthorized role');
            }
        } else {
            return res.status(401).send('Invalid credentials or role not authorized.');
        }
    });
});

module.exports = router;