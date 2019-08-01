const client = require('@google/maps').createClient({
  key: process.env.GOOGLE_MAPS_API_KEY,
})

async function main() {
 client.findPlace({
    input: 'chick-fil-a',
    inputtype: 'textquery'
  }, (err, data) => {

  console.log(err, data.json.candidates)
  })
}
main()
