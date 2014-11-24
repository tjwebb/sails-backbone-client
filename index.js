'use strict';

var _ = require('lodash');
var Promise = require('bluebird');
var parser = require('./lib/parser');

var Backbone = global.Backbone || (global.Backbone = require('backbone'));
require('backbone-relational');
require('backbone-validation');

module.exports = {
  /**
   * Return Promise that resolves the API
   * @param url String [optional] the url of the backbonemodels REST endpoint
   * @param ns  Object namespace object
   */
  create: function (_url, ns) {
    if (!_.isObject(ns)) {
      ns = { };
    }
    if (_.isObject(_url)) {
      ns = _url;
      _url = null;
    }

    Backbone.Relational.showWarnings = false;

    var ModelCollection = Backbone.Collection.extend({
      url: function () {
        return _url || this.document.url() + '/backbonemodel';
      }
    });
    var collection = new ModelCollection();

    return new Promise(function (resolve, reject) {
      collection.fetch({
        success: function (collection, response) {
          Backbone.Relational.store.addModelScope(ns);
          resolve(_.extend(ns, parser.parse(response, ns)));
        },
        error: function (collection, error) {
          reject(new Error(JSON.stringify(error)));
        }
      });
    });
  }
};
