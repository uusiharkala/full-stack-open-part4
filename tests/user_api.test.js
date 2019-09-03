const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')

const api = supertest(app)

const testUsers = [
  {
    username: 'hellas',
    name: 'Arto Hellas',
    password: 'salasana'
  }
]

beforeEach(async () => {
    await User.deleteMany({})

    for (let user of testUsers) {
      let userObject = new User(user)
      await userObject.save()
    }
})

test('a user with alredy existing username will not be added', async () => {
    const newUser = {
        username: 'hellas',
        name: 'Ville Hellas',
        password: 'salasanaville'
      }
    
      await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
    
      const response = await api.get('/api/users')
    
      const names = response.body.map(r => r.name)
    
      expect(names).not.toContain('Ville Hellas')
})

test('a user with too short username will not be added', async () => {
    const newUser = {
        username: 'hh',
        name: 'Heikki Helander',
        password: 'salasanaheikki'
      }
    
      await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
    
      const response = await api.get('/api/users')
    
      const names = response.body.map(r => r.name)
    
      expect(names).not.toContain('Heikki Helander')
})

test('a user with non-existing password will not be added', async () => {
    const newUser = {
        username: 'teekkis',
        name: 'Teemu Teekkari'
      }
    
      await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
    
      const response = await api.get('/api/users')
    
      const names = response.body.map(r => r.name)
    
      expect(names).not.toContain('Teemu Teekkari')
})

afterAll(() => {
    mongoose.connection.close()
})