'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const roles = require('../../docs/roles.json');

const rSchema = mongoose.Schema({
    role: {
        type: 'String',
        required: true,
        default: 'user',
        enum: ['admin', 'editor', 'user'],
    },
    capabilities: { required: false },
});

const rModel = mongoose.model('roles', rSchema);

const schema = mongoose.Schema({
    username: { type: 'String', unique: true, required: true },
    password: { type: 'String', required: true },
    fname: { type: 'String' },
    lname: { type: 'String' },
    role: {
        type: 'String',
        required: true,
        default: 'user',
        enum: ['admin', 'editor', 'user'],
    },
});

schema.virtual('roleObj', {
    ref: 'roles',
    localField: 'role',
    foreignField: 'role',
});

schema.pre('save', async function () {
    this.password = await bcrypt.hash(this.password, 10);
});

//schema.findOne().populate('roleObj');

schema.methods.generateToken = function () {
    let timeout = Math.floor(Date.now() / 1000) + 50;

    return jwt.sign(
        { exp: timeout, data: { _id: this._id } },
        process.env.SECRET,
    );
};

schema.methods.comparePasswords = async function (plainTextPass) {
    return await bcrypt.compare(plainTextPass, this.password);
};

schema.methods.hasCapability = function (capability) {
    this.populate('roleObj');
    console.log(this);

    for (let i = 0; i < roles.length; i++) {
        if (roles[i].role === this.role)
            return roles[i].capabilities.includes(capability);
    }

    return false;
};

schema.statics.verifyToken = function (token) {
    try {
        let tokenContents = jwt.verify(token, process.env.SECRET);
        return tokenContents.data;
    } catch (e) {
        console.log('EXPIRED OR INVALID!');
    }

    return {};
};

module.exports = mongoose.model('users', schema);
