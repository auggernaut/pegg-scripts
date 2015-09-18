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
      this.onError = bind(this.onError, this);
      this.onDone = bind(this.onDone, this);
      this.onMessage = bind(this.onMessage, this);
      this.migrateS3 = bind(this.migrateS3, this);
      this.resetUser = bind(this.resetUser, this);
      this.deleteCard = bind(this.deleteCard, this);
      this.createCard = bind(this.createCard, this);
      $('#createCard_form').on('submit', this.createCard);
      $('#deleteCard').on('submit', this.deleteCard);
      $('#resetUser').on('submit', this.resetUser);
      $('#migrateS3').on('submit', this.migrateS3);
      this.server.io.on('message', this.onMessage);
      this.server.io.on('done', this.onDone);
      this.server.io.on('error', this.onError);
    }

    Client.prototype.createCard = function(e) {
      var data, err, error;
      data = $(e.currentTarget).serializeObject();
      log("creating card:", data);
      this.reset('createCard');
      try {
        this.server.createCard(data);
      } catch (error) {
        err = error;
        this.error('createCard', err.message);
      }
      return e.preventDefault();
    };

    Client.prototype.deleteCard = function(e) {
      var cardId, err, error;
      cardId = $('#deleteCard_id').val();
      log("deleting card " + cardId);
      this.reset('deleteCard');
      try {
        this.server.deleteCard(cardId);
      } catch (error) {
        err = error;
        this.error('deleteCard', err.message);
      }
      return e.preventDefault();
    };

    Client.prototype.resetUser = function(e) {
      var err, error, userId;
      userId = $('#resetUser_id').val();
      log("resetting user " + userId);
      this.reset('resetUser');
      try {
        this.server.resetUser(userId);
      } catch (error) {
        err = error;
        this.error('resetUser', err.message);
      }
      return e.preventDefault();
    };

    Client.prototype.migrateS3 = function(e) {
      var err, error;
      log("migrating image content to S3");
      this.reset('migrateS3');
      try {
        this.server.migrateS3();
      } catch (error) {
        err = error;
        this.error('migrateS3', err.message);
      }
      return e.preventDefault();
    };

    Client.prototype.onMessage = function(data) {
      return log("server: ", data.message);
    };

    Client.prototype.onDone = function(data) {
      $("#" + data.data.task + "_message").html(data.message).parent().addClass('has-success');
      return log(data.data.task + " done!", data.data);
    };

    Client.prototype.onError = function(data) {
      var fullMessage, message, ref, ref1, ref2;
      message = (ref = (data != null ? (ref1 = data.error) != null ? ref1.message : void 0 : void 0) || (data != null ? (ref2 = data.error) != null ? ref2.error : void 0 : void 0)) != null ? ref : 'Unknown error occurred';
      fullMessage = "ERROR: " + message + " (see server output for details)";
      return this.error(data.data.task, fullMessage);
    };

    Client.prototype.error = function(task, message) {
      log(message);
      return $("#" + task + "_message").html(message).parent().addClass('has-error').removeClass('has-success');
    };

    Client.prototype.reset = function(task) {
      return $("#" + task + "_message").html("working ...").parent().removeClass('has-success').removeClass('has-error');
    };

    return Client;

  })();

  ServerActions = (function() {
    function ServerActions() {
      this.io = window.io.connect();
      this.io.emit('ready');
    }

    ServerActions.prototype.createCard = function(data) {
      var choice, i, j, len, ref;
      ref = data.choices;
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        choice = ref[i];
        if (_.isEmpty(choice.text) && _.isEmpty(choice.image.meta.url)) {
          data.choices[i] = void 0;
        } else {
          choice.image.small = choice.image.meta.url;
          choice.image.big = choice.image.meta.url;
        }
      }
      if (_.isEmpty(data.question)) {
        throw new Error('Please enter a question');
      }
      data.choices = _.compact(data.choices);
      if (data.choices.length < 2) {
        throw new Error('Please enter 2+ choices');
      }
      return this.io.emit("create", {
        type: 'Card',
        object: data,
        task: 'createCard'
      });
    };

    ServerActions.prototype.deleteCard = function(cardId) {
      return this.io.emit('deleteCard', cardId);
    };

    ServerActions.prototype.resetUser = function(userId) {
      return this.io.emit('resetUser', userId);
    };

    ServerActions.prototype.migrateS3 = function() {
      return this.io.emit('migrateS3');
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
      log("showing page " + window.location.hash);
      $(".page").hide();
      return $(window.location.hash).show();
    };

    return App;

  })();

  $(document).ready(function() {
    return window.App = new App();
  });

}).call(this);
