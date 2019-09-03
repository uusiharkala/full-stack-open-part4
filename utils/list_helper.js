const _ = require('lodash');

const dummy = (blogs) => {
    return 1
  }

const totalLikes = (blogs) => {
    const likes = blogs.map(blog => blog.likes)
    return likes.reduce((sum, item) => sum + item,0)
}

const favoriteBlog = (blogs) => {
    const reducer = (blog1, blog2) => {
        return blog1.likes > blog2.likes
            ? blog1
            : blog2
    }
    const best = blogs.reduce(reducer, {})
    return { title: best.title, author: best.author, likes: best.likes}
}

const mostBlogs = (blogs) => {
    const authors = _.values(_.groupBy(blogs, 'author'))
                    .map(list => {
                       return { author: list[0].author, blogs: list.length }
                    })
    return _(authors).maxBy('blogs') || {}
}

const mostLikes = (blogs) => {
    const reducer = (blog1, blog2) => {
        return blog1 + blog2
    }
    const authors = _.values(_.groupBy(blogs, 'author'))
                    .map(list => {
                       return { author: list[0].author, likes: list.map(blog => blog.likes).reduce(reducer,0)}
                    })
    return _(authors).maxBy('likes') || {}
     
}
  
  module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
  }