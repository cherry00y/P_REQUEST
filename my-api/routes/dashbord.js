const express = require('express');
const router = express.Router();
const Dashboard = require('../models/dashbord')


router.get('/requestsummary', (req, res) => {
    Dashboard.getamountrequest((err, results) => {
      if (err) {
        console.error('Error fetching request summary:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.json(results);
    });
});

router.get('/typesummary', (req, res) => {
    Dashboard.getamounttype((err, results) => {
        if (err) {
            console.error('Error fetching type request summary:', err);
            return res.status(500).json({error: 'Internal server error' });
        }
        res.json(results);
    });
});

router.get('/yearsummary', (req, res) => {
    Dashboard.getamountrequestyear((err, results) => {
        if (err) {
            console.error('Error fetching year request summary:', err);
            return res.status(500).json({error: 'Internal server error'});
        }
        res.json(results)
    })
});

router.get('/issuetypesummary', (req, res) => {
    Dashboard.getamountissuetype((err, results) => {
        if (err) {
            console.error('Error fetching issuetype request summary:', err);
            return res.status(500).json({error: 'Internal server error'});
        }
        res.json(results)
    });
});

module.exports = router;