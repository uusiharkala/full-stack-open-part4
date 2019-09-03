const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const morgan = require('morgan')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

morgan.token('body', (req) => {
    return JSON.stringify(req.body)
  })
blogsRouter.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

blogsRouter.get('/', (request, response) => {
    Blog
      .find({})
      .populate('user', {username: 1, name: 1})
      .then(blogs => {
        response.json(blogs.map(blog => blog.toJSON()))
      })
  })
  
  blogsRouter.post('/', async (request, response) => {
    const body = request.body
  
    if (typeof body.title === 'undefined' || typeof body.url === 'undefined') {
        return response.status(400).send({
          message: 'title and/or url not defined'
        })
    } else {
      try {
        const token = request.token
        const decodedToken = jwt.verify(request.token, process.env.SECRET)
        if (!token || !decodedToken.id) {
          return response.status(401).json({ error: 'token missing or invalid' })
        }

        const user = await User.findById(decodedToken.id)

        const blog = new Blog({
          title: body.title,
          author: body.author,
          url: body.url,
          likes: body.likes,
          user: user._id
        })

        
          const savedBlog = await blog.save()
          user.blogs = user.blogs.concat(savedBlog._id)
          await user.save()
          response.status(201).json(savedBlog.toJSON())
      } catch(exception) {
        return response.status(400).send({
          message: exception
        })
      }
    }
    
  })

  blogsRouter.delete('/:id', async (request, response) => {
    try {
      const token = request.token
      const decodedToken = jwt.verify(request.token, process.env.SECRET)
      if (!token || !decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' })
      }
      
      const blog = await Blog.findById(request.params.id)
      const userid = decodedToken.id
      if ( blog.user.toString() === userid.toString() ) {
        await Blog.findByIdAndRemove(request.params.id)
        response.status(204).end()
      } else {
        response.status(401).json({ error: 'only the uploader can remove blogs' })
      }
    }
    catch(exception) {
      return response.status(404).send({
        message: exception
      })
    }
  })

  blogsRouter.put('/:id', async (request, response) => {
    const body = request.body

    const blog = {
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes
    }

    try {
    updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    response.status(200).json(updatedBlog.toJSON())
    }
    catch {
      return response.status(404).send({
        message: `id: ${request.params.id} not found`
      })
    }

  })

  morgan
  
  module.exports = blogsRouter