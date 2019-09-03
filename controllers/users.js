const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
    const users = await User
        .find({}).populate('blogs', { url: 1, title: 1, author: 1 })
    response.json(users.map(u => u.toJSON()))
  })

usersRouter.post('/', async (request, response) => {
  try {
    const body = request.body

    if (body.username.length < 3) {
        return response.status(400).json( {error: 'too short username'} )
    }
    if (body.password.length < 3) {
        return response.status(400).json( {error: 'too short password'} )
    }
    if (body.username === undefined) {
        return response.status(400).json( {error: 'user must have a username'} )
    }
    if (body.password === undefined) {
        return response.status(400).json( {error: 'user must have a password'} )
    }
    

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const user = new User({
      username: body.username,
      name: body.name,
      passwordHash,
    })

    const savedUser = await user.save()

    response.json(savedUser)
  } catch (exception) {
    if (exception.name === 'ValidationError') {
        return response.status(400).json( {error: 'username must be unique'} ) 
    }
    return response.status(400).json( {error: exception} )
  }
})

module.exports = usersRouter