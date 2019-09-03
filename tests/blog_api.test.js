const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')

const api = supertest(app)

const testBlogs = [
  {
    title: 'Blog1',
    author: 'author1',
    url: 'url1',
    likes: 1
  },
  {
    title: 'Blog2',
    author: 'author2',
    url: 'url2',
    likes: 2
  }
]

beforeEach(async () => {
    await Blog.deleteMany({})

    for (let blog of testBlogs) {
      let blogObject = new Blog(blog)
      await blogObject.save()
    }
})

test('correct number of json type blogs is returned', async () => {
  const response = await api.get('/api/blogs')
    .expect('Content-Type',/application\/json/)
  expect(response.status).toBe(200)
  expect(response.body.length).toBe(2)
})

test('id should be named id', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body[0].id).toBeDefined()
})

test('a valid blog can be added', async () => {
  const newBlog = {
    title: 'Blog3',
    author: 'author3',
    url: 'url3',
    likes: 3
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type',/application\/json/)

  const response = await api.get('/api/blogs')

  const titles = response.body.map(r => r.title)

  expect(response.body.length).toBe(testBlogs.length + 1)
  expect(titles).toContain(
    'Blog3'
  )
    
})

test('if no likes given, should be zero', async () => {
  const newBlog = {
    title: 'Blog3',
    author: 'author3',
    url: 'url3'
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type',/application\/json/)

  const response = await api.get('/api/blogs')

  const likes = response.body.map(r => r.likes)

  expect(likes).toContain(0)
})

test('if title and url not defined should return Bad request', async () => {
  const newBlog = {
    author: 'author4',
    likes: 4
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)

  const response = await api.get('/api/blogs')

  expect(response.body.length).toBe(testBlogs.length)


})

test('delete a blog succesfully', async () => {
  const blogsInDb = await Blog.find({})
  const blogsAtStart = blogsInDb.map(blog => blog.toJSON())
  const blogToDelete = blogsAtStart[0]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .expect(204)

  const blogsInDbEnd = await Blog.find({})
  const blogsAtEnd = blogsInDbEnd.map(blog => blog.toJSON())

  expect(blogsAtEnd.length).toBe(
    testBlogs.length - 1
  )

  const titles = blogsAtEnd.map(r => r.title)

  expect(titles).not.toContain(blogToDelete.title)
})

test('return 404 if id not found on delete', async () => {
  await api
    .delete('/api/blogs/123')
    .expect(404)

  const response = await api.get('/api/blogs')

  expect(response.body.length).toBe(testBlogs.length)
})

test('modify likes suddesfully', async () => {
  const blogsInDb = await Blog.find({})
  const blogsAtStart = blogsInDb.map(blog => blog.toJSON())
  const blogToModify = blogsAtStart[0]

  const modifiedBlog = {
    title: blogToModify.title,
    author: blogToModify.author,
    url: blogToModify.url,
    likes: 8
  }

  await api
    .put(`/api/blogs/${blogToModify.id}`)
    .send(modifiedBlog)
    .expect(200)

  const response = await api.get('/api/blogs')

  expect(response.body[0].likes).toBe(8)
})

test('return 404 if id not found on modify likes', async () => {
  await api
    .put('/api/blogs/123')
    .send(testBlogs[0])
    .expect(404)

  const response = await api.get('/api/blogs')

  expect(response.body.length).toBe(testBlogs.length)
})

afterAll(() => {
  mongoose.connection.close()
})