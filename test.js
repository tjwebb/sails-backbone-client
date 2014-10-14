'use strict';

var assert = require('assert');
var path = require('path');
var SailsApp = require('sails').Sails;
var _ = require('lodash');
var BackboneClient;

describe('sails-backbone-client', function () {
  var url = 'http://localhost:1337/api/v1/backbonemodel';
  var schema;
  var app = new SailsApp();
  var xm;
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

  var config = {
    appPath: path.dirname(require.resolve('xtuple-api')),
    hooks: {
      grunt: false
    }
  };

  before(function (done) {
    this.timeout(60 * 1000);

    app.lift(config, function (error, sails) {
      app = sails;

      var jsdom = require('jsdom');
      var doc = jsdom.jsdom();
      //global.$ = require('jquery')(doc.parentWindow);

      global.Backbone = require('backbone');
      global.Backbone.ajax = require('najax');
      BackboneClient = require('./');

      done(error);
    });
  });

  describe('#create()', function () {
    it('should run without error', function (done) {
      this.timeout(20 * 1000);

      BackboneClient.create(url, ns)
        .then(function (api) {
          //console.log(api);
          xm = api;
          done();
        })
        .catch(function (error) {
          //console.log(error);
          done(error);
        });

      global.Backbone.Relational.store.addModelScope(xm);
    });
    it.skip('should be fast (t < 20ms) * 100', function () {
      this.timeout(2000);
      for (var i = 0; i < 100; i++) {
        BackboneClient.create(url);
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

      var account = new xm.Account();
      assert(_.isFunction(account.foo));
      assert(_.isFunction(account.whoami));
      assert(account.foo() === 'bar');
      assert(account.whoami() === xm.Account.prototype.name, account.whoami());
    });
  });
  describe('#validate()', function () {
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
