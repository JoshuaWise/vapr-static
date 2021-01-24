'use strict';
const fs = require('fs');
const path = require('path');
const util = require('util');
const { River } = require('vapr');
const conditionalsPlugin = require('vapr-conditionals');
const decode = require('./decode');
const FILEPATH = Symbol();

module.exports = ({ root, dotfiles, noEtags, broker } = {}) => {
	if (typeof root !== 'string') {
		throw new TypeError('Expected \'root\' option to be a string');
	}
	if (broker == null) {
		broker = defaultBroker;
	} else if (typeof broker !== 'function') {
		throw new TypeError('Expected \'broker\' option to be a function');
	}

	const plugins = [];
	// TODO: log requests and error results
	plugins.push(brokerPlugin(broker, path.resolve(root), !!dotfiles));
	noEtags || plugins.push(conditionalsPlugin());
	plugins.push(staticPlugin);
	return plugins;
};

// TODO: redirect trailings slash?
const brokerPlugin = (broker, root, allowDotfiles) => (req) => {
	const { method } = req;
	if (method !== 'GET' && method !== 'HEAD') {
		return 404;
	}

	const urlpath = decode(req.target.pathname, allowDotfiles);
	if (urlpath === null) {
		return 404;
	}

	const filepath = broker(urlpath, req);
	if (!filepath) {
		return 404;
	}
	if (typeof filepath !== 'string') {
		throw new TypeError('Expected \'broker\' function to return a string or null');
	}

	req.meta[FILEPATH] = path.join(root, path.join(path.sep, filepath));
};

const staticPlugin = async (req) => {
	const filepath = req.meta[FILEPATH];
	const fd = await openAsync(filepath, 'r').catch(throwFileError);
	let shouldClose = true;

	try {
		const stat = await fstatAsync(fd);
		if (!stat.isFile()) {
			return 404;
		}

		// TODO: use req.verify() to provide etags
		// req.verify({ weak: [filepath, String(Number(stat.mtime))] }); // TODO: realpath?

		let body;
		if (req.method !== 'HEAD') {
			body = River.riverify(fs.createReadStream('', { fd }));
			shouldClose = false;
		}
		return [200, [body]];
	} finally {
		if (shouldClose) {
			await closeAsync(fd);
		}
	}
};

const throwFileError = (err) => {
	if (err != null) {
		const { code } = err;
		if (code === 'ENOENT' || code === 'ENAMETOOLONG') {
			throw 404;
		}
	}
	throw err;
};

const defaultBroker = x => x;
const openAsync = util.promisify(fs.open);
const fstatAsync = util.promisify(fs.fstat);
const closeAsync = util.promisify(fs.close);
