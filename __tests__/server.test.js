const supergoose = require('@code-fellows/supergoose');
const serverObj = require('../lib/server.js');
const Model = require('../lib/models/model.js');
const schema = require('../lib/models/user-schema.js');
const UserModel = new Model(schema);

// create our mock server from the imported server
const mockRequest = supergoose(serverObj.server);

beforeAll(async () => {
    await UserModel.create({
      "username": "Test",
      "password": "Password"
    });

    await UserModel.create({
      "username": "Admin",
      "password": "Password",
      "role":"admin"
    });

    await UserModel.create({
      "username": "Editor",
      "password": "Password",
      "role":"editor"
    });
  
  });

describe('happy path', () => {
    it('can create a user', async () => {
        let response = await mockRequest.post('/signup').send({
            username: 'bUser',
            password: 'bPass',
            email:'bUser@test.com'
        });

        expect(response.status).toBe(201);
        //expect(response.body.username).toStrictEqual('bUser')
        //expect(response.body.email).toStrictEqual('bUser@test.com')
    });

    it('cannot  create existing user', async () => {
      let response = await mockRequest.post('/signup').send({
          username: 'Test',
          password: 'bPass',
      });

      expect(response.status).toBe(500);
      //expect(response.body.message).toStrictEqual('Username has to be unique');
  });

    it('valid user can signin', async () => {
        let response = await mockRequest.post('/signin').auth('Test:Password');
        expect(response.body.token).toBeTruthy();
      });

});

describe('user endpoint', () => {
  it('authorizes users via token', async () => {
    let userData = await mockRequest.post('/signin').auth('Test:Password');
    let token = userData.body.token;
  
    let response = await mockRequest.get('/users').set('Authorization', `Bearer ${token}`);
  
    expect(response.body.user).toStrictEqual('Test');
  });


});

describe('testing GET /user endpoint', () => {
  it('authorizes users via token', async () => {
    let userData = await mockRequest.post('/signin').auth('Test:Password');
    let token = userData.body.token;
  
    let response = await mockRequest.get('/user').set('Authorization', `Bearer ${token}`);
  
    expect(response.body.user).toStrictEqual('Test');
  });
});

describe('access control endpoints', () => {
  it('GET public route', async () => {
    let response = await mockRequest.get('/public');
  
    expect(response.text).toStrictEqual('this is a public route');
  });

  it('GET private route', async () => {
    let userData = await mockRequest.post('/signin').auth('Test:Password');
    let token = userData.body.token;

    let response = await mockRequest.get('/private').set('Authorization', `Bearer ${token}`);

    expect(response.text).toStrictEqual('this is a private route only for logged in users');
  });

  it('GET readonly', async () => {
    let userData = await mockRequest.post('/signin').auth('Test:Password');
    let token = userData.body.token;

    let response = await mockRequest.get('/readonly').set('Authorization', `Bearer ${token}`);

    expect(response.text).toStrictEqual('You have read only and can see this content');

  });

  it('GET readonly for admin', async () => {
    let userData = await mockRequest.post('/signin').auth('admin:Password');
    let token = userData.body.token;

    let response = await mockRequest.get('/readonly').set('Authorization', `Bearer ${token}`);

    expect(response.text).toStrictEqual('You have read only and can see this content');

  });

  it('GET everything for admin', async () => {
    let userData = await mockRequest.post('/signin').auth('admin:Password');
    let token = userData.body.token;

    let response = await mockRequest.get('/everything').set('Authorization', `Bearer ${token}`);

    expect(response.text).toStrictEqual('You have the superuser capability and can see this content');

  });

  it('user role cannot get everything', async () => {
    let userData = await mockRequest.post('/signin').auth('Test:Password');
    let token = userData.body.token;

    let response = await mockRequest.get('/everything').set('Authorization', `Bearer ${token}`);

    expect(response.text).toStrictEqual('Access not allowed');

  });

  it('user role not allowed to update', async () => {
    let userData = await mockRequest.post('/signin').auth('Test:Password');
    let token = userData.body.token;

    let response = await mockRequest.put('/update').set('Authorization', `Bearer ${token}`);
    expect(response.body.message).toStrictEqual('Access not allowed');
  });

  it('admin role allowed to update', async () => {
    let userData = await mockRequest.post('/signin').auth('editor:Password');
    let token = userData.body.token;

    let response = await mockRequest.put('/update').set('Authorization', `Bearer ${token}`);
    expect(response.body.message).toStrictEqual('You can update record');
  });

  it('user role not allowed to delete', async () => {
    let userData = await mockRequest.post('/signin').auth('Test:Password');
    let token = userData.body.token;

    let response = await mockRequest.delete('/delete').set('Authorization', `Bearer ${token}`);
    expect(response.body.message).toStrictEqual('Access not allowed');
  });

  it('editor role allowed to delete', async () => {
    let userData = await mockRequest.post('/signin').auth('editor:Password');
    let token = userData.body.token;

    let response = await mockRequest.delete('/delete').set('Authorization', `Bearer ${token}`);
    expect(response.body.message).toStrictEqual('You can delete record');
  });

});