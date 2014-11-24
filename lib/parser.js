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

/**
 * Parse a schema into Backbone Relational models.
 * @param schema - list of backbone model definitions ordered by inheritance depth
 * @param [ns] - existing namespace
 */
exports.parse = function (schema, _ns) {
  return _.transform(_.sortBy(schema, 'index'), function (ns, model) {
    var superModel = _.isString(model.extend) ? ns[model.extend] : Backbone.RelationalModel;
    var superCollection = _.isString(model.extend) ? ns[model.extend + 'Collection'] : Backbone.Collection;

    ns[model.name] = superModel.extend(_.extend(model, _ns[model.name], instanceMethods));
    ns[model.name + 'Collection'] = superCollection.extend(_.extend({
      model: ns[model.name],
      url: url.resolve(_ns.url.protocol + '//' + _ns.url.host, model.urlRoot),
    }, _ns[model.name + 'Collection']));
  });
};
