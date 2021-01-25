'use strict';
const path = require('path');
const decode = require('./decode');
const { FILEPATH } = require('./shared');

module.exports = (broker, root, allowDotfiles) => (req) => {
	const { method } = req;
	if (method !== 'GET' && method !== 'HEAD') {
		return 404;
	}

	const urlpath = decode(req.target.pathname, allowDotfiles);
	if (urlpath === null) {
		return 404;
	}

	const filepath = broker(urlpath, req);
	if (typeof filepath !== 'string') {
		throw new TypeError('Expected \'broker\' function to return a string');
	}

	req.meta[FILEPATH] = path.join(root, path.join(path.sep, filepath));
};
