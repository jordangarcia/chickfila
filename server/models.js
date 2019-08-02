const mongoose = require('mongoose')
const Schema = mongoose.Schema

const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true,
  },
  coordinates: {
    type: [Number],
    required: true,
  },
})

const ScrapeResultSchema = new Schema({
  query: {
    type: String,
    required: true,
  },
  location: {
    type: pointSchema,
    required: true,
  },
  numResults: {
    type: Number,
    required: true,
  },
  results: {
    type: String,
    required: true,
  },
})

const RestaurantSchema = new Schema({
  formattedAddress: {
    type: String,
    required: true,
  },
  location: {
    type: pointSchema,
    required: true,
  },
  placeId: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  numRatings: {
    type: Number,
    required: true,
  },

  name: {
    type: String,
    required: true,
  },
})

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
})

// const ProviderUserSchema = new Schema({
//   provider: {
//     type: String,
//     enum: ['facebook'],
//     required: true,
//   },

//   providerId: {
//     type: String,
//     required: true,
//   },

//   displayName: {
//     type: String,
//   },
// })

exports.ScrapeResult = mongoose.model('ScrapeResult', ScrapeResultSchema)
exports.Restaurant = mongoose.model('Restaurant', RestaurantSchema)
exports.User = mongoose.model('User', UserSchema)
