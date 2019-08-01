const express = require('express')
const { ScrapeResult, Restaurant } = require('./models')

module.exports = function(passport) {
  var router = express.Router()
  router.get('/', (req, res) => {
    res.send('hello')
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
      const rPromises = results.map(async (entry) => {
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

  return router
}
