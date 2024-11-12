const express = require('express');
require('dotenv').config();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const Login = require('./models/login');
const Requestor = require('./routes/requestor');
const Admin = require('./models/admin');
const Operator = require('./models/worker');
const Dashboard = require('./models/dashbord');

const app = express();

// CORS configuration - make sure this is at the top of the file before any routes
const corsOptions = {
  origin: ['https://p-request-app.vercel.app', 'https://p-request-api.vercel.app'], // ใส่โดเมนเพิ่มเติม
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
};


app.use(cors(corsOptions));  // This applies CORS globally to all routes

// Handle preflight requests (OPTIONS requests) for all routes
app.options('*', cors());

// Body parser middleware
app.use(bodyParser.json());

// Basic route for testing
app.get('/', (req, res) => {
  res.send("Hi hi!");
});

// Use route handlers
app.use('/Requestor', Requestor);
app.use('/Login', Login);
app.use('/Admin', Admin);
app.use('/Operator', Operator);
app.use('/Dashboard', Dashboard);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

/*const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});*/


// Start the server
module.exports = app;
