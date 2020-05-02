'use strict';

// Esoteric Resources
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');

// Internal Resources
const errorHandler = require('./middleware/error-handler.js');
const notFoundHandler = require('./middleware/404.js');
const authRouter = require('./routes/auth-router.js');
const rbacRouter = require('../__tests__/rbac-router.js');
const generateSwagger = require('../docs/swagger.js');

// Application-wide Middleware
const app = express();

generateSwagger(app);

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// Routes

/**
 * This route gives you an array of all current users
 * @route GET /
 * @group Homepage
 * @returns {object} 200 
 * @returns {String} - Homepage
 */
app.get('/', (req, res, next) => {
    res.send('Homepage');
});

app.use(authRouter);
app.use(rbacRouter);

// Error Handling
app.use('*', notFoundHandler);
app.use(errorHandler);



// Exports
module.exports = {
    server: app,
    start: (port, mongodb_uri) => {
        app.listen(port, () => {
            console.log('Server is up and running on port', port);
        });

        // stuff to connect to MongoDB
        let options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
        };

        mongoose.connect(mongodb_uri, options);
    },
};
