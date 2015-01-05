'use strict';

var url = require('url');
var _ = require('lodash');
var Backbone = global.Backbone || (global.Backbone = require('backbone'));
require('backbone-relational');
require('backbone-validation');

// <https://github.com/balderdashy/waterline-docs/blob/master/models.md#data-types-and-attribute-properties>
var instanceMethods = {
  defaults: function () {
    return _.cloneDeep(this._defaults);
  },
  validation: function () {
    return _.cloneDeep(this._validation);
  }
};

Backbone._sync = Backbone.sync;
Backbone.sync = function (method, model, options) {
  return Backbone._sync.call(this, method, model, _.extend({
    xhrFields: {
      withCredentials: true
    }
  }, options));
};

/**
 * Parse a schema into Backbone Relational models.
 * @param schema - list of backbone model definitions ordered by inheritance depth
 * @param [ns] - existing namespace
 */
exports.parse = function (schema, _ns) {
  _ns.url || (_ns.url = { });
  _ns._lower = { };

  console.trace('parse() 1:');
  var result = _.transform(_.sortBy(schema, 'index'), function (ns, model) {
    var superModel = _.isString(model.extend) ? ns[model.extend] : Backbone.RelationalModel;
    var superCollection = _.isString(model.extend) ? ns[model.extend + 'Collection'] : Backbone.Collection;

    ns[model.name] = superModel.extend(_.omit(_.extend(model, _ns[model.name], instanceMethods), 'urlRoot'));
    ns[model.name + 'Collection'] = superCollection.extend(_.extend({
      model: ns[model.name],
      url: _ns.url.host ? url.resolve(_ns.url.protocol + '//' + _ns.url.host, model.urlRoot) : model.urlRoot,
    }, _ns[model.name + 'Collection']));

    _ns._lower[model.name.toLowerCase()] = ns[model.name];
    _ns._lower[model.name.toLowerCase() + 'collection'] = ns[model.name + 'Collection'];

    console.trace('parse() transform:');
  });

  console.trace('parse() 2:');
  return result;
};
