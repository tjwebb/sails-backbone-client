'use strict';

var _ = require('lodash');
var Backbone = global.Backbone || (global.Backbone = require('backbone'));
require('backbone-relational');
require('backbone-validation');

var anchorRules = _.transform(require('anchor/lib/match/rules'), function (rules, rule, name) {
  rules[name] = function (value) {
    return rule(value) === true ? undefined : 'failed "' + name + '" validation';
  };
});

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
  var ns = { };

  // install waterline validation functions into Backbone.Validation
  _.extend(Backbone.Validation.validators, anchorRules);

  // install Backbone.Validation into Backbone
  _.extend(Backbone.Model.prototype, Backbone.Validation.mixin);

  _.each(_.sortBy(schema, 'index'), function (model) {

    // mixin any existing model definition in the provided namespace
    _.extend(model, _ns[model.name] || { });
    _.extend(model, instanceMethods);

    // if this model inherits from a superkind, find it and .extend it
    if (_.isString(model.extend) && ns[model.extend]) {
      ns[model.name] = ns[model.extend].extend(model);
      ns[model.name + 'Collection'] = ns[model.extend + 'Collection'].extend(_.extend({
        model: ns[model.name],
        url: model.urlRoot
      }, ns[model.name + 'Collection']));
    }
    // else if this model does not define any superkinds to inherit
    else {
      ns[model.name] = Backbone.RelationalModel.extend(model);
      ns[model.name + 'Collection'] = Backbone.Collection.extend(_.extend({
        model: ns[model.name],
        url: model.urlRoot
      }, ns[model.name + 'Collection']));
    }
  });

  return ns;
};
