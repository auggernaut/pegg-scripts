(function() {
  exports.setEnvironment = function(env) {
    console.log("set app environment: " + env);
    switch (env) {
      case "development":
        exports.DEBUG_LOG = true;
        exports.DEBUG_WARN = true;
        exports.DEBUG_ERROR = true;
        exports.DEBUG_CLIENT = true;
        exports.DB_HOST = 'localhost';
        exports.DB_PORT = "3306";
        exports.DB_NAME = 'mvc_example';
        exports.DB_USER = 'root';
        return exports.DB_PASS = 'root';
      case "testing":
        exports.DEBUG_LOG = true;
        exports.DEBUG_WARN = true;
        exports.DEBUG_ERROR = true;
        return exports.DEBUG_CLIENT = true;
      case "production":
        exports.DEBUG_LOG = false;
        exports.DEBUG_WARN = false;
        exports.DEBUG_ERROR = true;
        return exports.DEBUG_CLIENT = false;
      default:
        return console.log("environment " + env + " not found");
    }
  };

}).call(this);
