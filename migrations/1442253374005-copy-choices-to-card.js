// Generated by CoffeeScript 1.10.0
(function() {
  var Parse, PeggAdmin, Promise, _, config, env,
    hasProp = {}.hasOwnProperty;

  _ = require('lodash');

  Promise = require('bluebird');

  Parse = require('node-parse-api').Parse;

  PeggAdmin = require('../server/run/peggAdmin');

  config = require('../server/run/config');

  env = process.env.NODE_ENV || 'development';

  config.setEnvironment(env);

  exports.up = function(next) {
    var choices, db;
    db = new PeggAdmin(config.PARSE_APP_ID, config.PARSE_MASTER_KEY, config.FILE_PICKER_ID);
    choices = [];
    db.on('results', (function(_this) {
      return function(results) {
        console.log("got " + results.length + " choices");
        return choices = choices.concat(results);
      };
    })(this));
    db.on('done', (function(_this) {
      return function(results) {
        return console.log("updated " + results.length + " cards");
      };
    })(this));
    return db.findRecursive('Choice', {
      limit: 500,
      skip: 0
    }).then((function(_this) {
      return function() {
        var card, cardId, cards, choice, i, len, ref, requests;
        console.log(choices.length + " total choices");
        console.log((_.values(cards).length) + " total cards");
        cards = {};
        for (i = 0, len = choices.length; i < len; i++) {
          choice = choices[i];
          cardId = choice != null ? (ref = choice.card) != null ? ref.objectId : void 0 : void 0;
          if (cards[cardId] == null) {
            cards[cardId] = {};
            cards[cardId].choices = {};
          }
          cards[cardId].choices[choice.objectId] = {
            text: choice.text,
            image: choice.blob || {
              big: choice.image,
              small: choice.image,
              meta: {
                url: choice.image,
                source: choice.imageSource,
                credit: choice.imageCredit
              }
            }
          };
        }
        requests = [];
        for (cardId in cards) {
          if (!hasProp.call(cards, cardId)) continue;
          card = cards[cardId];
          requests.push({
            method: 'PUT',
            path: "/1/classes/Card/" + cardId,
            body: {
              choices: card.choices
            }
          });
        }
        return db.updateBatchRecursive(requests, 0);
      };
    })(this)).then(next);
  };

  exports.down = function(next) {
    return next();
  };

}).call(this);
