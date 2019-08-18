const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const morgan = require('morgan')

morgan.token('body', (req) => {
    return JSON.stringify(req.body)
  })
blogsRouter.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

blogsRouter.get('/', (request, response) => {
    Blog
      .find({})
      .then(blogs => {
        response.json(blogs)
      })
  })
  
  blogsRouter.post('/', (request, response) => {
    const blog = new Blog(request.body)
  
    blog
      .save()
      .then(result => {
        response.status(201).json(result)
      })
  })

  morgan
  
  module.exports = blogsRouter