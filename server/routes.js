const express = require('express')
const bcrypt = require('bcrypt')
const { User, ScrapeResult, Restaurant } = require('./models')

module.exports = function(passport) {
  var router = express.Router()
  router.get('/', (req, res) => {
    res.send('hello')
  })

  router.get('/login/failure', function(req, res) {
    res.status(401).json({
      success: false,
    })
    return
  })

  router.post('/register', function(req, res, next) {
    const { username, password } = req.body
    const params = { username, password }
    console.log('registering', params)

    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(params.password, salt, function(err, hash) {
        // Store hash in your password DB.
        params.password = hash
        User.create(params, function(err, user) {
          if (err) {
            res.status(400).json({
              success: false,
              error: err.message,
            })
          } else {
            res.json({
              success: true,
              user: user,
            })
          }
        })
      })
    })
  })

  router.post('/upload_results', async (req, res) => {
    const { location, inputLoc, results } = req.body
    const sr = new ScrapeResult({
      query: inputLoc,
      location: {
        type: 'Point',
        coordinates: [location.lng, location.lat],
      },
      numResults: results.length,
      results: JSON.stringify(results),
    })

    try {
      await sr.save()
      const rPromises = results.map(async entry => {
        const r = new Restaurant({
          formattedAddress: entry.formatted_address,
          location: {
            type: 'Point',
            coordinates: [entry.geometry.location.lng, entry.geometry.location.lat],
          },
          placeId: entry.place_id,
          name: entry.name,
          rating: entry.rating,
          numRatings: entry.user_ratings_total,
        })
        return r.save()
      })
      await Promise.all(rPromises)
      return res.json({ success: true })
    } catch (e) {
      res.json({ success: false, error: e.message })
    }
  })

  router.post(
    '/login',
    passport.authenticate('local', {
      successRedirect: '/login/success',
      failureRedirect: '/login/failure',
      failureFlash: true,
    }),
  )

  router.use(function(req, res, next) {
    if (!req.isAuthenticated()) {
      res.status(401).json({
        success: false,
        error: 'not authenticated',
      })
    } else {
      next()
    }
  })

  router.get('/login/success', function(req, res) {
    const { username, _id } = req.user
    const user = { username, _id }

    res.json({
      success: true,
      user,
    })
  })

  router.get('/api', (req, res) => {
    console.log(req.user.id)
    res.send('in')
    return
  })

  return router
}
