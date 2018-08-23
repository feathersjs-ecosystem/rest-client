# @feathersjs/rest-client

> __Important:__ The code for this module has been moved into the main Feathers repository at [feathersjs/feathers](https://github.com/feathersjs/feathers) ([package direct link](https://github.com/feathersjs/feathers/tree/master/packages/rest-client)). Please open issues and pull requests there.

[![Build Status](https://travis-ci.org/feathersjs/rest-client.png?branch=master)](https://travis-ci.org/feathersjs/rest-client)

REST client services for different Ajax libraries

`@feathersjs/rest-client` supports [REST server](https://docs.feathersjs.com/api/rest.html#server) connectivity using [jQuery](https://jquery.com/), [request](https://github.com/request/request), [Superagent](http://visionmedia.github.io/superagent/), [Axios](https://github.com/mzabriskie/axios), [Fetch](https://facebook.github.io/react-native/docs/network.html) or [Angular HTTP](https://angularjs.org/) as the AJAX library.

## Installation

```
npm install @feathersjs/rest-client --save
```

## Quick example

```js
const feathers = require('@feathersjs/feathers');
const rest = require('@feathersjs/rest-client');

const app = feathers();

// Connect to the same as the browser URL (only in the browser)
const restClient = rest();

// Connect to a different URL
const restClient = rest('http://feathers-api.com')

// Configure an AJAX library (see below) with that client 
app.configure(restClient.fetch(window.fetch));

// Connect to the `http://feathers-api.com/messages` service
const messages = app.service('messages');
```

## Documentation

Please refer to the [@feathersjs/rest-client documentation](https://docs.feathersjs.com/api/client/rest.html) for more details.

## License

Copyright (c) 2018

Licensed under the [MIT license](LICENSE).
