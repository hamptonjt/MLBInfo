/**
* @param context {WebtaskContext}
*/
module.exports = function (context, cb) {
  var axios = require('axios');
  var cheerio = require('cheerio');
  var Twitter = require('twitter');
  var client = new Twitter(context.secrets);

  var tweet = '';
  var url = 'http://www.nationalpastime.com/site/index.php?action=baseball_team_search&baseball_team=New+York+Yankees';

  axios.get(url).then(response => {
    var html = response.data;
    var $ = cheerio.load(html);

    var data = [];
    var pertDivs = $('div').filter(function(i, el) {
      return $(this).attr('style') === 'border-top:1px solid #333366;';
    });

    pertDivs.each(function(i, el) {
      var year = '';
      var fact = '';
      var tds = $(this).find('td');
      tds.each(function(j, elem) {
        // First element should be the year.. 2nd is the fact...
        if (j === 0) {
          year = $(this).text().trim();
        } else {
          fact = $(this).text().trim();
        }
      });
      data.push({'year': year, 'fact': fact});
    });

    data.forEach(factoid => {
      console.log(factoid);
      tweet = `${factoid.year}:\n${factoid.fact}`;

      console.log(tweet);
      var status = {
        status: tweet.substr(0,280)
      };

      client.post('statuses/update', status, function (err, tweet, resp) {
        if (!err) {
          console.log('Tweeted ok...');
        } else {
          cb(err);
        }
      });
    });
//    cb(null, { tweet: tweet });
  }).catch(e => {
    console.error(e);
    cb(e);
  });
};
