# express-api-version
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
