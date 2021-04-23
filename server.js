require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
const failedApp = require('./appFailure');
//allows use to access config variables throughout our app

//NODE ERROR HANDLING
process.on('uncaughtException', (err) => {
    console.log(
        '\n\nUNCAUGHT EXCEPTION. Error message:\n\n',
        err.message,
        '\n\n Full error:\n\n',
        err
    );
    console.log('Now shutting down...');
    //end node process
    process.exit(1);
});

//connect to mongo database
const connected = mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
    })
    .then(() => {
        console.log('MONGO connection successful');
        return true;
    })
    .catch((err) => {
        console.log('Failed to connect to database');
        return false;
    });

const port = process.env.PORT || 8000;
let server;
if (connected) {
    server = app.listen(port, () => {
        console.log(`App listening on port ${port}`);
    });
} else {
    //if failed to connect then listen in order to send error response
    failedApp.listen(port, () => {
        console.log(
            `App failed to connect to database. Listening on port ${port}`
        );
    });
}

//deal with unhandled promise rejections using node process obj
process.on('unhandledRejection', (err) => {
    console.log(
        '\n\nUNHANDLED REJECTION. Error message:\n\n',
        err.message,
        '\n\n'
    );
    console.log('Now shutting down...');
    //need to crash application when there is uhandled promise rejection as
    //app might be in unclean state (e.g. request to database failing but if continued then app might expect data to
    //be there when it isnt)
    server.close(() => {
        //end node process
        process.exit(1);
    });
});
