'use strict';

let axios = require('axios');
let cheerio = require('cheerio');
let Twitter = require('twitter');

/**
* @param context {WebtaskContext}
*/
module.exports = function (context, cb) {
  let client = new Twitter(context.secrets);
  
  let in_reply_to = '';
  
  let tweet = '';
  let url = 'http://www.nationalpastime.com/site/index.php?action=baseball_team_search&baseball_team=Atlanta+Braves';

  getData().then((data) =>  {
    for (let factoid of data) {
      in_reply_to = '';
      let spaceIndex = 274; // initialize to the max single tweet...
      let gt = false;

      // get the last word completely past the 265 character mark...
      if (factoid.fact.length > 274) {
        spaceIndex = factoid.fact.indexOf(' ', 265);
        gt = true;
      }
      tweet = `${factoid.year}:\n${factoid.fact.substr(0,spaceIndex)}`;
      console.log(tweet);
      sendTweet(tweet, in_reply_to).then(sentTweet => {
        in_reply_to = sentTweet.id_str;
        console.log(in_reply_to);
        // console.log(tweet.length, tweet);
        if (gt) {
          tweet = '@TodayBraves ' + factoid.fact.substr(spaceIndex +1);
          //console.log(tweet);
          sendTweet(tweet, in_reply_to).then(st => {
            console.log('Done with tweet?');
          });
        }
      });
    }

  }).catch(e => {
    console.error(e);
    cb(e);
  });
  
  function getData() {
    return new Promise((resolve, reject) => {
      let data = [];
      axios.get(url).then(response => {
        let html = response.data;
        let $ = cheerio.load(html);

        let pertDivs = $('div').filter(function(i, el) {
          return $(this).attr('style') === 'border-top:1px solid #333366;';
        });

        pertDivs.each(function(i, el) {
          let year = '';
          let fact = '';
          let tds = $(this).find('td');
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
        // console.log(data);
        resolve(data);
      }).catch(e => {
        console.error(e);
        reject (e);
      });
    });
  }

  function sendTweet(tweet, in_reply_to) {
    return new Promise((resolve, reject) => {
      // console.log('reply_id =', in_reply_to);
      let status = {
        status: tweet,
        in_reply_to_status_id: in_reply_to
      };
      console.log(JSON.stringify(status, undefined, 2));
      client.post('statuses/update', status).then(t => {
        console.log('Tweeted ok...');
        resolve(t);
      }).catch(e => {
        console.error(e);
        reject(e);
      });
    });
  }
//    cb(null, { tweet: 'ok' });
};
