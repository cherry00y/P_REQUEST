const express = require('express');
require('dotenv').config();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const Login = require('./models/login');
const Requestor = require('./models/requestor'); // ตรวจสอบว่าการนำเข้าเป็น router
const Admin = require('./models/admin');
const Operator = require('./models/worker');
const Dashboard = require('./models/dashbord');

const app = express();
app.use(cors({
  origin: 'https://kaizen-request.vercel.app', // โดเมนของคลายแอนด์
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// ตั้งค่าพอร์ต
const port = process.env.PORT || 8000;

app.use(bodyParser.json()); // ใช้ bodyParser สำหรับการแปลง request body เป็น JSON

// เส้นทางเริ่มต้น
app.get('/', (req, res) => {
  res.send("Hi hi!");
});

// ใช้เส้นทางที่แยกไว้
app.use('/', Requestor); // ตรวจสอบว่าการใช้เป็น router
app.use('/',Login);
app.use('/', Admin);
app.use('/',Operator);
app.use('/',Dashboard)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// เริ่มต้นเซิร์ฟเวอร์
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
