const express = require('express');
require('dotenv').config();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const Login = require('./models/login');
const Requestor = require('./models/requestor');
const Admin = require('./models/admin');
const Operator = require('./models/worker');
const Dashboard = require('./models/dashbord');

const app = express();

// CORS configuration - make sure this is at the top of the file before any routes
const corsOptions = {
  origin: ['https://p-request-app.vercel.app', 'https://another-domain.com'], // ใส่โดเมนเพิ่มเติม
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
app.use('/', Requestor);
app.use('/', Login);
app.use('/', Admin);
app.use('/', Operator);
app.use('/', Dashboard);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Start the server
module.exports = app;
