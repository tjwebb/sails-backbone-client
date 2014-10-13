# <img src="http://cdn.tjw.io/images/sails-logo.png" height='43px' />-backbone

[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Dependency Status][daviddm-image]][daviddm-url]

Load a Sails Backbone API in the Browser

## Install
```sh
$ npm install sails-backbone-client --save
```

## Usage

```js
var BackboneClient = require('sails-backbone-client-client');
var api = { };
BackboneClient.create('localhost/api/v1/backbonemodels', api)
  .then(function (api) {
    api.Account.fetch() // ...
  });
```

## License
MIT

[sails-logo]: http://cdn.tjw.io/images/sails-logo.png
[sails-url]: https://sailsjs.org
[npm-image]: https://img.shields.io/npm/v/sails-backbone-client.svg?style=flat
[npm-url]: https://npmjs.org/package/sails-backbone-client
[travis-image]: https://img.shields.io/travis/tjwebb/sails-backbone-client.svg?style=flat
[travis-url]: https://travis-ci.org/tjwebb/sails-backbone-client
[daviddm-image]: http://img.shields.io/david/tjwebb/sails-backbone-client.svg?style=flat
[daviddm-url]: https://david-dm.org/tjwebb/sails-backbone-client
