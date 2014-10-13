var Promise = require('bluebird');
var parser = require('./lib/parser');

module.exports = {
  /**
   * Return Promise that resolves the API
   */
  create: function (_url) {
    var ModelCollection = Backbone.Collection.extend({
      url: _url || window.location.host + '/backbonemodel'
    });
    var collection = new ModelCollection();

    return new Promise(function (resolve, reject) {
      ModelCollection.fetch({
        success: function (collection, response) {
          resolve(parser.parse(response));
        },
        error: function (error) {
          reject(error);
        }
      });
    });
  }
};
