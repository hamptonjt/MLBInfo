let axios = require('axios')
let cheerio = require('cheerio')

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

}).catch(e => {
  console.error(e)
})

