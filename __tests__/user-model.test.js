'use strict';

const supergoose = require('@code-fellows/supergoose');

const Model = require('../lib/models/model.js');
const schema = require('../lib/models/user-schema.js');

const UserModel = new Model(schema);

describe('Testing Model', () => {
  it('can create users', async () => {
    let user = await UserModel.create({
      "username":"Shubham",
      "lname":"lastname",
      "fname":"firstname",
      "password":"Password"  
    });
    
    expect(user.username).toStrictEqual('Shubham');
    expect(user.lname).toStrictEqual('lastname');
    expect(user.fname).toStrictEqual('firstname');
  });

  it('can read all users', async () => {
    let allUsers = await UserModel.read();
    expect(allUsers.length).toStrictEqual(1);
  });
  it('can update a user', async () => {
    let user = await UserModel.readByQuery({'username':'Shubham'});

console.log(user);
    let newRecord = {
      "username": "Updated",
      "lname":"newlastname",
      "fname":"newfirstname",
      "paassword": "Password"
    }
    console.log('New User =',newRecord);

    let updated = await UserModel.update(user[0]._id, newRecord);
    console.log('updatedRecrd =' + updated);

    expect(updated[0].username).toStrictEqual('Updated');
    expect(updated[0].lname).toEqual('newlastname');
    expect(updated[0].fname).toEqual('newfirstname');
  });

  it('can delete a user', async () => {
    let user = await UserModel.readByQuery({'username':'Updated'});
    let id = user[0]._id;
    console.log('userId='+id);
    let deleted = await UserModel.delete(id);
    expect(deleted).toStrictEqual(id);
  });

});