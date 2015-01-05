'use strict';

var _ = require('lodash');
var Promise = require('bluebird');
var parser = require('./lib/parser');
var url = require('url');

var anchorRules = _.transform(require('anchor/lib/match/rules'), function (rules, rule, name) {
  rules[name] = function (value) {
    return rule(value) === true ? undefined : 'failed "' + name + '" validation';
  };
});

var associationRules = function (ns) {
  return {
    model: function (value, attr, model, obj, json) {
      if (value === null || _.isNumber(value)) return;
      if (!obj instanceof ns._lower[model]) {
        return 'association ('+ attr +') not instance of '+ model;
      }
    },
    collection: function (value, attr, collection, obj, json) {
      if (value === null || _.isNumber(value)) return;
      if (!obj instanceof ns._lower[model]) {
        return 'association ('+ attr +') not instance of '+ collection;
      }
    }
  };
};

Backbone || (Backbone = require('backbone'));
Backbone.Validation = require('backbone-validation');
require('backbone-relational');

module.exports = {
  /**
   * Return Promise that resolves the API
   * @param url - String the url of the backbonemodels REST endpoint
   * @param ns  - Object namespace object
   */
  create: function (_url, ns) {
    _.isObject(ns) || (ns = { });
    ns.url = url.parse(_url);

    Backbone.Relational.showWarnings = false;
    Backbone.Relational.store.addModelScope(ns);

    _.extend(Backbone.Validation.validators, anchorRules, associationRules(ns));
    _.extend(Backbone.Model.prototype, Backbone.Validation.mixin);

    var ModelCollection = Backbone.Collection.extend({ url: _url });
    var models = new ModelCollection();

    return new Promise(function (resolve, reject) {
      models.fetch({
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
