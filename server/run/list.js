(function() {
  var walk;

  walk = require('walk');

  module.exports = {
    serverScripts: function(res) {
      var files, walker;
      files = [];
      walker = walk.walk("./server/run", {
        followLinks: false
      });
      walker.on("file", function(root, stat, next) {
        if (stat.name.indexOf(".js") > 0) {
          files.push(root + "/" + stat.name);
        }
        return next();
      });
      return walker.on("end", function() {
        return res.send(files);
      });
    }
  };

}).call(this);
