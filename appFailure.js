const express = require('express');

const failedApp = express();
//if we failed to connect to mongo database then send this reponse regardless of what route is trying to be accessed
failedApp.use('*/', (req, res, next) => {
    res.send('Failed to connect to database. Please try again later');
});

module.exports = failedApp;
