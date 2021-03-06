// Generated by CoffeeScript 1.10.0

/*
 * DEPRECATED, see server/peggAdmin.coffee:migrateImagesToS3()
 */

(function() {
  var Migrate, S3Bucket, request;

  filepicker.setKey("A36NnDQaISmXZ8IOmKGEQz");

  request = window.superagent;

  S3Bucket = "https://pegg.s3.amazonaws.com/";

  Migrate = (function() {
    function Migrate() {}

    Migrate.prototype.moveImagesToS3 = function() {
      return this.fetchImageUrls((function(_this) {
        return function(items) {
          var filename, i, image, item, len, matches, ref;
          ref = items.body;
          for (i = 0, len = ref.length; i < len; i++) {
            item = ref[i];
            if ((item.image != null) && item.image.length > 0) {
              matches = item.image.match(/[^\/]+(#|\?|$)/);
              filename = matches != null ? "_" + item.objectId + "_." + matches[0] : "_" + item.objectId + "_.jpg";
              image = {
                id: item.objectId,
                url: item.image,
                name: filename
              };
              _this.saveImageToS3(image, function(InkBlob) {
                return _this.updateImageUrl(InkBlob);
              });
            }
          }
          return null;
        };
      })(this));
    };

    Migrate.prototype.pickAndStore = function() {
      return filepicker.pickAndStore({
        mimetype: "image/*"
      }, {
        path: '/uploaded/'
      }, function(InkBlobs) {
        var result;
        result = InkBlobs[0];
        result.fullS3 = Config.s3.bucket + InkBlobs[0].key;
        filepicker.convert(InkBlobs[0], {
          width: 100,
          height: 100,
          fit: 'clip',
          format: 'jpg'
        }, {
          path: '/processed/'
        }, (function(_this) {
          return function(thumbBlob) {
            thumbBlob.s3 = S3Bucket + thumbBlob.key;
            return result.thumb = thumbBlob;
          };
        })(this));
        return null;
      });
    };

    Migrate.prototype.fetchImageUrls = function(cb) {
      return request.get('/choices').end(function(res) {
        cb(res);
        return null;
      });
    };

    Migrate.prototype.updateImageUrl = function(InkBlob) {
      return request.post('/choice').send(InkBlob).end(function(res) {
        console.log(res);
        return null;
      });
    };

    Migrate.prototype.saveImageToS3 = function(image, cb) {
      var combinedBlob, storeOptions;
      combinedBlob = {};
      combinedBlob.id = image.id;
      storeOptions = {
        filename: image.name,
        location: 'S3',
        path: '/orig/'
      };
      return filepicker.storeUrl(image.url, storeOptions, (function(_this) {
        return function(origBlob) {
          var convertOptions;
          combinedBlob.orig = origBlob;
          combinedBlob.orig.S3 = S3Bucket + origBlob.key;
          convertOptions = {
            width: 100,
            height: 100,
            fit: 'clip',
            format: 'jpg'
          };
          storeOptions.path = '/thumb/';
          filepicker.convert(origBlob, convertOptions, storeOptions, function(thumbBlob) {
            combinedBlob.thumb = thumbBlob;
            combinedBlob.thumb.S3 = S3Bucket + thumbBlob.key;
            console.log(JSON.stringify(combinedBlob));
            return cb(combinedBlob);
          });
          return null;
        };
      })(this));
    };

    return Migrate;

  })();

  window.migrate = new Migrate();

}).call(this);
