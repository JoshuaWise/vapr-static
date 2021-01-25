# vapr-static [![Build Status](https://travis-ci.org/JoshuaWise/vapr-static.svg?branch=master)](https://travis-ci.org/JoshuaWise/vapr-static)

## Installation

```bash
npm install --save vapr
npm install --save vapr-static
```

## Usage

This is a convenience plugin that provides a basic static file server.

```js
const staticFileServer = require('vapr-static');
const app = require('vapr')();
const route = app.notFound();

route.use(staticFileServer({ root: '/path/to/static/folder' }));
```

This plugin also exports a function called `getFilename()` which returns the fully resolved filename associated with a request, typically for logging purposes. If a valid filename could not be determined (e.g., because the request was invalid), it returns `null`.

```js
const { getFilename } = require('vapr-static');

route.use((req) => (res) => {
  if (req.method === 'GET' && res.code === 404) {
    console.error(`The requested file does not exist: ${getFilename(req)}`);
  }
});
```

Under the hood, this plugin uses [`vapr-conditionals`](https://github.com/JoshuaWise/vapr-conditionals) to provide ETags, so you shouldn't use that plugin in combination with this one, and you shouldn't provide your own ETag implementation. However, you may want to utilize [`vapr-caching`](https://github.com/JoshuaWise/vapr-caching) and/or [`vapr-compress`](https://github.com/JoshuaWise/vapr-compress) to improve the performance of serving static files.

## Options

### options.root

The filesystem path of the directory containing all static files to be served. This is the only option that's required.

### options.dotfiles = *false*

By default, this plugin will not serve files that have a path segment beginning with a dot (`"."`), for security purposes. You can disable that behavior by setting this option to `true`.

### options.noEtags = *false*

By default, ETags will automatically be generated to support [conditional requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Conditional_requests) for static files (improving the performance of the server). However, you can disable ETags by setting this option to `true`.

### options.broker = *null*

This option allows you to provide a "broker" function, which allows you to perform custom logic on incoming requests, before the filesystem is accessed.

The broker function takes two arguments. The first argument is a decoded (not containing percent-encodings) version of [`req.target.pathname`](https://github.com/JoshuaWise/vapr/blob/master/docs/reference/request.md#target---object). The second argument is the `req` object itself.

The broker function must return a filesystem path intended to replace the path given as the first argument. Alternatively, the broker can throw any valid [vapr response](https://github.com/JoshuaWise/vapr/blob/master/docs/reference/response.md#class-response).

Below are some examples of things you can do with a broker.

#### Serve index.html when "/" is requested

```js
route.use(staticFileServer({
  root: '/path/to/folder',
  broker: (pathname) => {
    if (pathname === '/') return '/index.html';
    return pathname;
  },
}));
```

#### Add ".html" extension when a file extension is missing

```js
const { extname } = require('path');

route.use(staticFileServer({
  root: '/path/to/folder',
  broker: (pathname) => {
    if (!extname(pathname)) return pathname + '.html';
    return pathname;
  },
}));
```

#### Redirect requests with trailing slashes

```js
route.use(staticFileServer({
  root: '/path/to/folder',
  broker: (pathname, req) => {
    if (pathname !== '/' && pathname.endsWith('/')) {
      throw [308, { location: req.target.pathname.slice(0, -1) }];
    }
    return pathname;
  },
}));
```

#### Require all requests to be prefixed with "/static/"

```js
route.use(staticFileServer({
  root: '/path/to/folder',
  broker: (pathname) => {
    if (!pathname.startsWith('/static/')) throw 404;
    return pathname.slice(7);
  },
}));
```
