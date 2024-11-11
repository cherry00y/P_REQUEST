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
  origin: 'https://p-request-app.vercel.app', // Allow your frontend domain
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
app.use('/requestor', Requestor);
app.use('/', Login);
app.use('/admin', Admin);
app.use('/operator', Operator);
app.use('/dashboard', Dashboard);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start the server
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
