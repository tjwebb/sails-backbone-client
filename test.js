'use strict';

var assert = require('assert');
var path = require('path');
var SailsApp = require('sails').Sails;
var SailsBackbone = require('./');
var Backbone = require('backbone');
require('backbone-relational');
require('backbone-validation');
var _ = require('lodash');

describe('sails-backbone-client', function () {
  var schema;

  describe.skip('REST', function () {

    it('can make a rest request', function () {
      // TODO
    });

  });

  describe.skip('#parse()', function () {
    var xm;

    it('should run without error', function () {
      xm = SailsBackbone.parse(schema);
      Backbone.Relational.store.addModelScope(xm);
    });
    it('should be fast (t < 20ms) * 100', function () {
      this.timeout(2000);
      for (var i = 0; i < 100; i++) {
        SailsBackbone.parse(schema);
      }
    });
    it('can instantiate new model without error', function () {
      var account = new xm.Account();
      assert(_.isObject(account));
    });
    it('should record proper inheritance in the prototype chain', function () {
      assert(xm.Account.__super__.name === 'xTupleObject');
      assert(xm.Country.__super__.name === 'Place');
      var account = new xm.Account();
      assert(account.constructor.__super__.name === 'xTupleObject');
    });
    it('should mixin any existing models of the same name', function () {
      var ns = {
        Account: {
          foo: function () {
            return 'bar';
          },
          whoami: function () {
            return this.name;
          }
        }
      };
      var xm = SailsBackbone.parse(schema, ns);

      var account = new xm.Account();
      assert(_.isFunction(account.foo));
      assert(_.isFunction(account.whoami));
      assert(account.foo() === 'bar');
      assert(account.whoami() === xm.Account.prototype.name, account.whoami());
    });
  });
  describe.skip('#validate()', function () {
    var xm;

    before(function () {
      schema = SailsBackbone.generate(app);
      xm = SailsBackbone.parse(schema);
    });

    it('should invalidate an invalid model using default validators', function (done) {
      var role = new xm.Role({
        name: 1,
        active: 'hello'
      });
      //console.log(xm.Role.prototype);
      role.once('validated', function (isValid, model, errors) {
        assert(!isValid);
        if (!_.isEmpty(errors)) {
          assert(_.isString(errors.name));
          assert(_.isString(errors.active));
          return done();
        }
        else {
          done(new Error('should be invalid'));
        }
      });
      role.validate();
    });
    it('should validate a legit model using default validators', function (done) {
      var role = new xm.Role({
        name: 'role1',
        active: true
      });
      role.once('validated', function (isValid, model, errors) {
        assert(isValid);
        if (!_.isEmpty(errors)) {
          return done(new Error(JSON.stringify(errors)));
        }
        done();
      });

      role.validate();
    });
  });
});
