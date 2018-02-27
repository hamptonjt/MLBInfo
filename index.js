/*
 * Messing around with the MLB APIs for displaying game data based on today's date.
 * If before game time, will display a preview of who will be pitching.
 * If during the game, will display a box score and who's pitching vs. who's batting - also displaying homeruns as they happen
 * If the game is over, will recap the box score, displaying the winning/losing pitchers and if there was a save.
 *  - also display homeruns that occurred during the game.
 */
let axios = require('axios')

let dateOptions = { year: 'numeric', month: '2-digit', day: '2-digit' }

let today = new Date()
let day = today.getDate()
let month = today.getMonth() + 1 
let year = today.getFullYear()

// pad day and month if less than 10..
day = (day < 10) ? ('0' + day) : day
month = (month < 10) ? ('0' + month) : month

let url = 'http://gd.mlb.com/components/game/mlb/year_'+year+'/month_'+month+'/day_'+day+'/master_scoreboard.json'

// console.log(url)

axios.get(url).then(response => {
  // console.log(response.data)
  let games = response.data.data.games

  let YankeeGame = games.game.find((game) => {
    return (game.away_file_code === 'nyy' || game.home_file_code === 'nyy')
  })

  games.game.forEach((game) => {
    console.log()
    console.log()
    if (game === YankeeGame) {
      console.log('*******')
      console.log('Yankees Game!!!')
      console.log('*******')
    }
    if (game.status.status === 'Preview') {
      console.log('Probable Starters: ')
      console.log('Away:', game.away_name_abbrev, ' - ', game.away_probable_pitcher.first, 
          game.away_probable_pitcher.last, '#' + game.away_probable_pitcher.number, 
          '('+game.away_probable_pitcher.wins+'-'+game.away_probable_pitcher.losses+')', game.away_probable_pitcher.era )
      console.log('Home:', game.home_name_abbrev, ' - ', game.home_probable_pitcher.first, 
          game.home_probable_pitcher.last, '#' + game.home_probable_pitcher.number, 
          '('+game.home_probable_pitcher.wins+'-'+game.home_probable_pitcher.losses+')', game.home_probable_pitcher.era)
    } else if (game.status.status === 'In Progress') {
      console.log('Inning:', game.status.inning_state, game.status.inning)
      console.log('Away:', game.away_name_abbrev, game.linescore.r.away, game.linescore.h.away, game.linescore.e.away)
      console.log('Home:', game.home_name_abbrev, game.linescore.r.home, game.linescore.h.home, game.linescore.e.home)
      console.log()
      console.log('Pitching:', game.pitcher.first, game.pitcher.last, '#'+game.pitcher.number, game.pitcher.era)
      console.log('Batting :', game.batter.first, game.batter.last, '#'+game.batter.number, game.batter.avg)
      console.log()
      if (Array.isArray(game.home_runs.player)) {
        game.home_runs.player.forEach(p => {
          console.log('Homeruns:', p.team_code.toUpperCase(), p.first, p.last, '('+p.hr+')', 'Inning:', p.inning)
        })
      }
    } else {
      console.log('Final')
      console.log('Away:', game.away_name_abbrev, game.linescore.r.away, game.linescore.h.away, game.linescore.e.away)
      console.log('Home:', game.home_name_abbrev, game.linescore.r.home, game.linescore.h.home, game.linescore.e.home)
      console.log()
      console.log('Winning Pitcher:', game.winning_pitcher.first, game.winning_pitcher.last, '('+game.winning_pitcher.wins+'-'+game.winning_pitcher.losses+')', game.winning_pitcher.era)
      console.log('Losing Pitcher :', game.losing_pitcher.first, game.losing_pitcher.last, '('+game.losing_pitcher.wins+'-'+game.losing_pitcher.losses+')', game.losing_pitcher.era)
      if (game.save_pitcher.first) {
        console.log('Saving Pitcher :', game.save_pitcher.first, game.save_pitcher.last, '('+game.save_pitcher.saves+')', game.save_pitcher.era)
      }
      console.log()
      if (Array.isArray(game.home_runs.player)) {
        game.home_runs.player.forEach(p => {
          console.log('Homeruns:', p.team_code.toUpperCase(), p.first, p.last, '('+p.hr+')', 'Inning:', p.inning)
        })
      }
    }
  })
}).catch(e => {
  console.error(e)
})

