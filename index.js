var Backbone = global.Backbone || require('backbone');
var Promise = require('bluebird');
var parser = require('./lib/parser');

module.exports = {
  /**
   * Return Promise that resolves the API
   */
  create: function (_url, ns) {
    var ModelCollection = Backbone.Collection.extend({
      url: function () {
        return _url || this.document.url() + '/backbonemodel';
      }
    });
    var collection = new ModelCollection();

    return new Promise(function (resolve, reject) {
      collection.fetch({
        success: function (collection, response) {
          resolve(parser.parse({
            models: response,
            version: '0'
          }, ns));
        },
        error: function (error) {
          reject(new Error(JSON.stringify(error)));
        }
      });
    });
  }
};
