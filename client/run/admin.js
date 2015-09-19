// Generated by CoffeeScript 1.10.0
(function() {
  var App, Client, ServerActions, log,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  log = function() {
    return console.log.apply(console, arguments);
  };

  Client = (function() {
    function Client(server) {
      this.server = server;
      this["do"] = bind(this["do"], this);
      this.onError = bind(this.onError, this);
      this.onDone = bind(this.onDone, this);
      this.onMessage = bind(this.onMessage, this);
      this.migrateS3 = bind(this.migrateS3, this);
      this.resetUser = bind(this.resetUser, this);
      this.deleteCard = bind(this.deleteCard, this);
      this.createOrUpdateCard = bind(this.createOrUpdateCard, this);
      $('#card').on('submit', this.createOrUpdateCard);
      $('#deleteCard').on('submit', this.deleteCard);
      $('#resetUser').on('submit', this.resetUser);
      $('#migrateS3').on('submit', this.migrateS3);
      this.server.io.on('message', this.onMessage);
      this.server.io.on('done', this.onDone);
      this.server.io.on('error', this.onError);
    }


    /* Actions */

    Client.prototype.createOrUpdateCard = function(e) {
      var data;
      data = $('#card form').serializeObject();
      data.section = 'card';
      if (data.cardId != null) {
        log("upadating card:", data);
        this["do"]('updateCard', data);
      } else {
        log("creating card:", data);
        this["do"]('createCard', data);
      }
      return e.preventDefault();
    };

    Client.prototype.deleteCard = function(e) {
      var cardId;
      cardId = $('#deleteCard input[name="cardId"]').val();
      log("deleting card " + cardId);
      this["do"]('deleteCard', {
        section: 'deleteCard',
        cardId: cardId
      });
      return e.preventDefault();
    };

    Client.prototype.resetUser = function(e) {
      var userId;
      userId = $('#resetUser input[name="userId"]').val();
      log("resetting user " + userId);
      this["do"]('resetUser', {
        section: 'resetUser',
        userId: userId
      });
      return e.preventDefault();
    };

    Client.prototype.migrateS3 = function(e) {
      log("migrating image content to S3");
      this["do"]('migrateS3', {
        section: 'migrateS3'
      });
      return e.preventDefault();
    };


    /* Server Listeners */

    Client.prototype.onMessage = function(data) {
      return log("server: ", data.message);
    };

    Client.prototype.onDone = function(data) {
      var section;
      section = data.data.section;
      $("#" + section + " .message").html(data.message).parent().addClass('has-success');
      log(data.data.section + " done!", data.data);
      return this.resetForm(section);
    };

    Client.prototype.onError = function(data) {
      var fullMessage, message, ref, ref1, ref2;
      message = (ref = (data != null ? (ref1 = data.error) != null ? ref1.message : void 0 : void 0) || (data != null ? (ref2 = data.error) != null ? ref2.error : void 0 : void 0)) != null ? ref : 'Unknown error occurred';
      fullMessage = "ERROR: " + message + " (see server output for details)";
      return this.error(data.data.section, fullMessage);
    };


    /* Helpers */

    Client.prototype.error = function(section, message) {
      console.error(message);
      return $("#" + section + " .message").html(message).parent().addClass('has-error').removeClass('has-success');
    };

    Client.prototype["do"] = function(task, data) {
      var err, error;
      this.resetStyles(data.section);
      this.showWorkingMessage(data.section);
      try {
        return this.server[task](data);
      } catch (error) {
        err = error;
        return this.error(data.section, err.message);
      }
    };

    Client.prototype.showWorkingMessage = function(section) {
      return $("#" + section + " .message").html("working ...");
    };

    Client.prototype.resetForm = function(section) {
      return $("#" + section + " form").each(function() {
        return this.reset();
      });
    };

    Client.prototype.resetStyles = function(section) {
      return $("#" + section + " .message").parent().removeClass('has-success').removeClass('has-error');
    };

    return Client;

  })();

  ServerActions = (function() {
    function ServerActions() {
      this.io = window.io.connect();
      this.io.emit('ready');
    }

    ServerActions.prototype._validateCard = function(data) {
      var choice, i, j, len, ref;
      ref = data.choices;
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        choice = ref[i];
        if (_.isEmpty(choice.text) && _.isEmpty(choice.blob.meta.url)) {
          data.choices[i] = void 0;
        } else {
          choice.blob.small = choice.blob.meta.url;
          choice.blob.big = choice.blob.meta.url;
        }
      }
      if (_.isEmpty(data.question)) {
        throw new Error('Please enter a question');
      }
      data.choices = _.compact(data.choices);
      if (data.choices.length < 2) {
        throw new Error('Please enter 2+ choices');
      }
    };

    ServerActions.prototype.updateCard = function(data) {
      this._validateCard(data);
      return this.io.emit('updateCard', data);
    };

    ServerActions.prototype.createCard = function(data) {
      this._validateCard(data);
      return this.io.emit('createCard', data);
    };

    ServerActions.prototype.deleteCard = function(data) {
      return this.io.emit('deleteCard', data);
    };

    ServerActions.prototype.resetUser = function(data) {
      return this.io.emit('resetUser', data);
    };

    ServerActions.prototype.migrateS3 = function(data) {
      return this.io.emit('migrateImagesToS3', data);
    };

    return ServerActions;

  })();

  App = (function() {
    function App() {
      this.server = new ServerActions;
      this.client = new Client(this.server);
      this.initRouting();
    }

    App.prototype.initRouting = function() {
      window.onhashchange = this.hashChange;
      if (window.location.hash) {
        return this.hashChange();
      }
    };

    App.prototype.hashChange = function() {
      var page;
      page = window.location.hash || '#home';
      log("showing page " + page);
      $(".page").hide();
      return $(page).show();
    };

    return App;

  })();

  $(document).ready(function() {
    return window.App = new App();
  });

}).call(this);
