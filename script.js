var map
var service
var infowindow
var key = 'AIzaSyAl47PKs4pPRlLgQORJZXkUe0JG1nTy3Zw'

async function getLocation(input) {
  const req = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      input,
    )}&key=${key}`,
  )
  const resp = await req.json()
  console.log(resp)
  if (!resp || resp.results.length < 1) {
    throw new Error('Could not find location')
  }

  return resp.results[0]
}

let isFetchingNext

function findChickFilA({ lat, lng }, cb) {
  return new Promise(resolve => {
    var here = new google.maps.LatLng(lat, lng)
    map = new google.maps.Map(document.getElementById('map'), {
      center: here,
      zoom: 15,
    })

    var request = {
      query: 'chick-fil-a',
      location: here,
      radius: '500',
      // type: ['restaurant'],
    }

    service = new google.maps.places.PlacesService(map)
    service.textSearch(request, function callback(results, status, next) {
      cb({
        data: results,
        hasNextPage: next.hasNextPage,
      })
      next.nextPage()
    })
  })
}

async function write(v) {
  document.getElementById('results').innerText = JSON.stringify(v, null, '  ')
}

window.results = {}
$('#form').on('submit', async function(e) {
  e.preventDefault()
  const inputLoc = $(this)
    .find('input[name=location]')
    .val()
  console.log('finding value', inputLoc)

  const { geometry } = await getLocation(inputLoc)
  const { location } = geometry

  let res = []
  findChickFilA(location, ({ data, hasNextPage }) => {
    console.log(`found ${data.length} results, hasNextPage=${hasNextPage}`)
    res = [...res, ...data]
    write(res)
    if (!hasNextPage) {
      window.results[inputLoc] = {
        inputLoc,
        geometry,
        location,
        results: res,
      }
    }
  })
})

$('#upload').on('click', async function() {
  const $form = $(this).parents('form')
  const inputLoc = $form.find('input[name=location]').val()

  const results = window.results[inputLoc]
  if (!results) {
    alert('cant find shit to upload')
  }

  const req = await fetch('http://localhost:4000/upload_results', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(results),
  })
  const res = await req.json()
  console.log('upload success', res)
})

// initialize()
