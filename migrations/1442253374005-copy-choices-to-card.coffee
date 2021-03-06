_ = require 'lodash'
Promise = require 'bluebird'
Parse = require('node-parse-api').Parse
PeggAdmin = require '../server/run/peggAdmin'


# Config module exports has `setEnvironment` function that sets app settings depending on environment.
config = require '../server/run/config'
env = process.env.NODE_ENV or 'development'
config.setEnvironment env

exports.up = (next) ->
  db = new PeggAdmin config.PARSE_APP_ID, config.PARSE_MASTER_KEY, config.FILE_PICKER_ID
  choices = []
  db.on 'fetch', (results) =>
    console.log "got #{results.length} choices"
    choices = choices.concat results

  db.on 'update', (results) =>
    console.log "updated #{results.length} cards"

  db.findRecursive 'Choice',
      limit: 500 # max rows you can fetch on a single query is 1000
      skip: 0
    .then =>
      console.log "#{choices.length} total choices"
      cards = {}
      for choice in choices
        cardId = choice?.card?.objectId
        if !cards[cardId]?
          cards[cardId] = {}
          cards[cardId].choices = {}
        cards[cardId].choices[choice.objectId] =
          id: choice.objectId
          cardId: cardId
          text: choice.text
          image: choice.blob or {
            big: choice.image
            small: choice.image
            meta:
              url: choice.image
              source: choice.imageSource
              credit: choice.imageCredit
          }
      console.log "#{_.values(cards).length} total cards"

      requests = []
      for own cardId, card of cards
        requests.push
           method: 'PUT'
           path: "/1/classes/Card/#{cardId}"
           body:
             choices: card.choices
#      console.log JSON.stringify requests, null, 2
      db.updateBatchRecursive requests, 0

    .then next

exports.down = (next) ->
  next()
