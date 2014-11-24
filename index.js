'use strict';

var _ = require('lodash');
var Promise = require('bluebird');
var parser = require('./lib/parser');

var anchorRules = _.transform(require('anchor/lib/match/rules'), function (rules, rule, name) {
  rules[name] = function (value) {
    return rule(value) === true ? undefined : 'failed "' + name + '" validation';
  };
});

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
    Backbone.Relational.store.addModelScope(ns);

    _.extend(Backbone.Validation.validators, anchorRules);
    _.extend(Backbone.Model.prototype, Backbone.Validation.mixin);

    var ModelCollection = Backbone.Collection.extend({
      url: function () {
        return _url || this.document.url() + '/backbonemodel';
      }
    });
    var collection = new ModelCollection();

    return new Promise(function (resolve, reject) {
      collection.fetch({
        success: function (collection, response) {
          resolve(_.extend(ns, parser.parse(response, ns)));
        },
        error: function (collection, error) {
          reject(new Error(JSON.stringify(error)));
        }
      });
    });
  }
};
