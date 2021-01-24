# vapr-static [![Build Status](https://travis-ci.org/JoshuaWise/vapr-static.svg?branch=master)](https://travis-ci.org/JoshuaWise/vapr-static)

## Installation

```bash
npm install --save vapr
npm install --save vapr-static
```

## Usage

This is a convenience plugin that provides a basic static file server.

```js
const static = require('vapr-static');
const app = require('vapr')();
const route = app.notFound();

route.use(static({ root: '/path/to/static/folder' }));
```

Under the hood, this plugin uses [`vapr-conditionals`](https://github.com/JoshuaWise/vapr-conditionals) to provide ETags, so you should not use that plugin in combination with this one, and you should not provide your own ETag implementation. However, you may want to utilize [`vapr-caching`](https://github.com/JoshuaWise/vapr-caching) and/or [`vapr-compress`](https://github.com/JoshuaWise/vapr-compress) to improve the performance of serving static files.

## Options

### options.root
### options.dotfiles = *false*
### options.noEtags = *false*
### options.broker = *null*
/index.html, /inner/page.html
filter based on pathname, or anything in the request
throw redirect responses
### options.notFound = *null*
