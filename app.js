const express = require('express')
const bodyParser = require('body-parser')
const ejs = require('ejs')
const mongoose = require('mongoose')

const app = express()

app.set('view engine', ejs)
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'))

//setting up connection to mongoDB
mongoose.connect('mongodb://localhost:27017/wikiDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

//setting up the schema
const articleSchema = {
  title: String,
  content: String,
}

//setting up the mongoose model
const Article = mongoose.model('Article', articleSchema) //specify the name of the 'collection' (mongoDB lower cases 'Article' and makes it plural)

/// Requests targetting all articles

app
  .route('/articles')
  .get(function (req, res) {
    Article.find(function (err, foundArticles) {
      if (!err) {
        res.send(foundArticles)
      } else {
        res.send(err)
      }
    })
  })
  .post(function (req, res) {
    //new document
    const newArticle = new Article({
      title: req.body.title,
      content: req.body.content,
    })
    newArticle.save(function (err) {
      if (!err) {
        res.send('Successfully added a new article.')
      } else {
        res.send(err)
      }
    })
  })
  //deleting all articles
  .delete(function (req, res) {
    //mongoose
    Article.deleteMany(function (err) {
      if (!err) {
        res.send('Sucessfully deleted all articles')
      } else {
        res.send(err)
      }
    })
  })

/// Requests targeting a specific article

app
  .route('/articles/:articleTitle')
  .get(function (req, res) {
    Article.findOne({ title: req.params.articleTitle }, function (
      err,
      foundArticle
    ) {
      if (foundArticle) {
        res.send(foundArticle)
      } else {
        res.send('No articles matching that title was found')
      }
    })
  })

  .put(function (req, res) {
    Article.update(
      { title: req.params.articleTitle }, //searches all the articles having 'articleTitle' from the url
      { title: req.body.title, content: req.body.content }, //replaces the title with the new 'title' and content with the new 'content'
      { overwrite: true }, //mongoose prevents properties from being deleted, hence it has to be added
      function (err) {
        if (!err) {
          res.send('Succesfully updated article')
        }
      }
    )
  })

  .patch(function (req, res) {
    Article.update(
      { title: req.params.articleTitle },
      { title: req.body.title, content: req.body.content },
      { $set: req.body }, //making the fields dynamic, 4:30 of 372
      function (err) {
        if (!err) {
          res.send('Succesfully updated article')
        }
      }
    )
  })

  .delete(function (req, res) {
    Article.deleteOne({ title: req.params.articleTitle }, function (err) {
      if (!err) {
        res.send('Successfully deleted article')
      }
    })
  })

app.listen(3000, function () {
  console.log('Server has started on port 3000')
})
