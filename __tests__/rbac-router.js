'use strict';

// Esoteric Resources
const express = require('express');

// Internal Resources
const Model = require('../lib/models/model.js');
const userSchema = require('../lib/models/user-schema.js');
const auth = require('../lib/middleware/auth.js');
const roles = require('../docs/roles.json');

// Variables
const UsersModel = new Model(userSchema);
const router = express.Router();

router.get('/public', (req, res, next) => {
    res.send('this is a public route');
});

router.get('/private', auth, (req, res, next) => {
    // req.user set and req.user._id present

    if (req.user && req.user._id)
        res.send('this is a private route only for logged in users');
    else next({ err: 401, msg: 'You must be logged in to see this route' });
});

/**
 * @route GET /readonly
 * @group private
 * @returns {string} 200 - You have read only and can see this content

 */
router.get('/readonly', auth, (req, res, next) => {
    console.log('I am here',req.user);
    if (req.user && req.user._id) {
        if (
            req.user.hasCapability('read') ||
            req.user.hasCapability('superuser')
        ) {
            res.send('You have read only and can see this content');
            return;
        }
    }

    //console.log('I am here',req.header.Authorization);
    next({ err: 403, msg: 'Access not allowed' });
});

/**
 * @route GET /everything
 * @group private
 * @returns {string} 200 - You have the superuser capability and can see this content

 */

router.get('/everything', auth, (req, res, next) => {
    // check if req.user has role.capabilities where "superuser" is included in that list
    if (req.user && req.user._id) {
        if (req.user.hasCapability('superuser')) {
            res.send(
                'You have the superuser capability and can see this content',
            );
            return;
        }
    }

    next({ err: 403, msg: 'Access not allowed' });
});

/**
 * @route POST /create
 * @group create
 * @returns {string} 200 - You can create record
 */
router.post('/create', auth, (req, res, next) => {
    if (req.user && req.user._id) {
        if (
            req.user.hasCapability('create') ||
            req.user.hasCapability('superuser')
        ) {
            res.send('You can create record');
            return;
        }
    }

    next({ err: 403, msg: 'Access not allowed' });
});

/**
 * @route PUT /update
 * @group create
 * @returns {string} 200 - You can update record
 */
router.put('/update', auth, (req, res, next) => {
    if (req.user && req.user._id) {
        if (
            req.user.hasCapability('update') ||
            req.user.hasCapability('superuser')
        ) {
            res.send('You can update record');
            return;
        }
    }

    next({ err: 403, msg: 'Access not allowed' });
});

/**
 * @route DELETE /delete
 * @group create
 * @returns {string} 200 - You can delete record
 */

router.delete('/delete', auth, (req, res, next) => {
    if (req.user && req.user._id) {
        if (
            req.user.hasCapability('delete') ||
            req.user.hasCapability('superuser')
        ) {
            res.send('You can delete record');
            return;
        }
    }

    next({ err: 403, msg: 'Access not allowed' });
});

module.exports = router;
