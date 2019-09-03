const mongoose = require('mongoose')
const config = require('../utils/config')
mongoose.set('useFindAndModify', false)

const mongoUrl = config.MONGODB_URI
mongoose.connect(mongoUrl, { useNewUrlParser: true })

const blogSchema = mongoose.Schema({
    url: String,
    title: String,
    author: String,
    likes: Number,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  })

blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    returnedObject.likes = returnedObject.likes || 0
    delete returnedObject._id
    delete returnedObject.__v
  }
})

  module.exports = mongoose.model('Blog', blogSchema)