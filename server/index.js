const fs = require('fs')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const bcrypt = require('bcrypt')
const express = require('express')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)

const path = require('path')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const mongoose = require('mongoose')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const flash = require('connect-flash')

const routes = require('./routes')
const { User } = require('./models')

// mongo shit
const REQUIRED_ENVS = [
  'SESSION_SECRET',
  'MONGODB_URI',
  'FACEBOOK_APP_ID',
  'FACEBOOK_APP_SECRET',
]
REQUIRED_ENVS.forEach(function(el){
  if (!process.env[el]) throw new Error('Missing required env var ' + el)
})
mongoose.connect(process.env.MONGODB_URI)
mongoose.connection.once('open', () => console.log(`Connected to MongoDB!`))

const IS_DEV = app.get('env') === 'development'
if (IS_DEV) {
  mongoose.set('debug', true)
}

app.use(cors())
app.use(flash())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(morgan('combined'))
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'fake secret',
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  }),
)

passport.serializeUser(function(user, cb) {
  console.log('serializeUser', user)
  cb(null, user._id)
})

passport.deserializeUser(async function(obj, cb) {
  console.log('deserializeUser', obj)
  const user = await User.findById(obj)
  if (!user) {
    cb('not found')
    return
  }
  console.log(user)
  cb(null, user)
})

// passport strategy
passport.use(
  new LocalStrategy(async function(username, password, done) {
    console.log('authenticating', username,password)
    if (typeof username !== 'string') {
      done(null, false, { message: 'User must be string.' })
      return
    }

    const user = await User.findOne({ username })
    if (!user) {
      done(null, false, { message: 'Incorrect username or password.' })
      return
    }

    // if no user present, auth failed
    // if passwords do not match, auth failed
    bcrypt.compare(password, user.password, function(err, res) {
      // res == true
      if (!res) {
        done(null, false, { message: 'Incorrect username or password.' })
        return
      }
      // auth has has succeeded
      done(null, user)
    })
  }),
)

app.use(passport.initialize())
app.use(passport.session())

app.get('/auth/failure', (req, res) => {
  console.log('in failure')
  res.status(403).json({ success: false })
  return
})

// routes
app.use(routes(passport))

// static
app.use(express.static(path.join(__dirname, 'build')))

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    console.error(err)
    res.status(err.status || 500)
    res.json({
      message: err.message,
      error: err,
    })
  })
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500)
  res.json({
    message: err.message,
  })
})

module.exports = app
