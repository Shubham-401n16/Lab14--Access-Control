'use strict';

// Esoteric Resources
const express = require('express');

// Internal Resources
const Model = require('../models/model.js');
const userSchema = require('../models/user-schema.js');
const errorHandler = require('../middleware/error-handler.js');
const auth = require('../middleware/auth.js');

// Variables
const UsersModel = new Model(userSchema);
const router = express.Router();

// Route-wide Middleware

// Routes
/**
 * This route lets you create a user, with the user credentials in the request body
 * @route POST /signup-body
 * @group auth - operations for signup and signin
 * @param {string} username.body.required - This is the unique user's username
 * @param {string} password.body.required - The user's password
 * @param {string} fname.body - The user's first name
 * @param {string} lname.body - The user's last name
 * @returns {object} 201 - The created user object
 * @returns {object} 400 - If username is not unique
 * 
 */

router.post('/signup',async (req, res, next) => {
     // console.log(req);
     let presentUser = await UsersModel.readByQuery({username:req.body.username});
     if(presentUser.length ===0){
         // create a user from data in req.body
         let user = await UsersModel.create(req.body);
         let token = user.generateToken();
    
      res.status(201).send({user, token});
  
     }else{
         next({status:400, message:'Username has to be unique'});
     }
});

/**
 * This route validates and signs a user in
 * @route POST /signin
 * @group auth - operations for signup and signin
 * @returns {object} 200 - Success message
 */

router.post('/signin', auth, async (req, res, next) => {
    if (req.user._id) {
        res.status(200);
        let token = req.user.generateToken();
        //let token = jwt.sign({ _id: req.user._id }, process.env.SECRET);
        res.send({ user: req.user, token: token });
        return;
    } else {
        next({ err: 401, msg: 'User not found' });
    }
});

/**
 * This route gives you an array of all current users
 * @route GET /users
 * @group user
 * @returns {object} 200 - Array of users
 * @returns {object} 400 - No users
 */
router.get('/users', auth, async(req,res,next)=> {
    console.log(req.user);
    if (req.user._id) {
        res.status(200).send({user: req.user.username});
        //res.send('Secret information that only logged in users can see');
    } else {
        next({ err: 401, msg: 'Not logged in / invalid token' });
    }
   
});

router.get('/hidden', auth, async (req, res, next) => {
    if (req.user && req.user._id) {
        res.status(200);
        res.send('Secret information that only logged in users can see');
    } else {
        next({ err: 401, msg: 'Not logged in / invalid token' });
    }
});

// Error Handling
router.use(errorHandler);

// Exports
module.exports = router;
