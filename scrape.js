/*
 * Contacted the national pastime web site to attempt to get information about their data.
 * Web site copyright is 2015 - so I'm not sure it's still being maintained.  Scraping the
 * information I want for now.  Brittle, but working at the moment.
 */
let axios = require('axios')
let cheerio = require('cheerio')

var lineReader = require('readline').createInterface({
  input: require('fs').createReadStream('./twitter_keys.txt')
});

let consumer_key = ''
let consumer_secret = ''
let access_token = ''
let access_token_secret = ''

let counter = 0

lineReader.on('line', function (line) {
  // console.log('Line from file:', line);
  counter += 1
  switch (counter) {
    case 1: consumer_key = line; break
    case 2: consumer_secret = line; break
    case 3: access_token = line; break
    case 4: access_token_secret = line; break
  }
});



const url = 'http://www.nationalpastime.com/site/index.php?action=baseball_team_search&baseball_team=New+York+Yankees'

axios.get(url).then(response => {
  const html = response.data
  const $ = cheerio.load(html)

  let data = []
  let pertDivs = $('div').filter(function(i, el) {
    return $(this).attr('style') === 'border-top:1px solid #333366;'
  })

  pertDivs.each(function(i, el) {
    let year = ''
    let fact = ''
    let tds = $(this).find('td')
    tds.each(function(j, elem) {
      // First element should be the year.. 2nd is the fact...
      if (j === 0) {
        year = $(this).text().trim()
      } else {
        fact = $(this).text().trim()
      }
    })
    data.push({'year': year, 'fact': fact})
  })

  // First thing is to test the data...
  console.log(data)
  // const Twit = require('twit')

  // const T = new Twit({
  //   consumer_key:         consumer_key,
  //   consumer_secret:      consumer_secret,
  //   access_token:         access_token,
  //   access_token_secret:  access_token_secret,
  //   timeout_ms:           60 * 1000,
  // });

  // // Post a tweet
  // T.post(
  //   'statuses/update',
  //   { status: `Today in ${data[0].year}: ${data[0].fact}` },
  //   (err, data, response) => {
  //     console.log(err, data, response);
  //   }
  // )


}).catch(e => {
  console.error(e)
})

