# express-api-version

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Build Status](https://travis-ci.com/SphericalElephant/express-api-version.svg?branch=master)](https://travis-ci.com/SphericalElephant/express-api-version)
[![Coverage Status](https://coveralls.io/repos/github/SphericalElephant/express-api-version/badge.svg?branch=master)](https://coveralls.io/github/SphericalElephant/express-api-version?branch=master)

A simple API versioning middleware for express.

## Usage

```javascript
const {VersionManager, MiddlewareFactory} = require('@sphericalelephant/express-api-version');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const middlewareFactory = new MiddleWarefactory({
  // required: your custom vendor extension, resulting Content-Type application/vnd.api-test-vendor-1.0.0+json
  vndExtension: 'test-vendor',
  // required: a list of valid API versions
  supportedVersions: ['1.0.0', '1.1.1', '2.0.0', '2.2.2'],
  // optional: is used to attach the maximum satifying version to the req object, if not set '__api_version' is used
  attachVersionKey: 'customKey'
});

app.use(bodyParser.json({type: middlewareFactory.getVndExtensions()}));
app.get('/', (req, res, next) => {
  if (!req['customKey']) {
    return res.status(400).send();
  }
  // do something with the version key here
});
```

[npm-image]: https://img.shields.io/npm/v/@sphericalelephant/express-api-version.svg
[npm-url]: https://npmjs.org/package/@sphericalelephant/express-api-version
[downloads-image]: https://img.shields.io/npm/dm/@sphericalelephant/express-api-version.svg
[downloads-url]: https://npmjs.org/package/@sphericalelephant/express-api-version
