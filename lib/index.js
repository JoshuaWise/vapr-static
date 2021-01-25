'use strict';
const path = require('path');
const conditionals = require('vapr-conditionals');
const selectFile = require('./select-file');
const serveStatic = require('./serve-static');
const { FILEPATH } = require('./shared');
const defaultBroker = x => x;

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
	plugins.push(selectFile(broker, path.resolve(root), !!dotfiles));
	noEtags || plugins.push(conditionals());
	plugins.push(serveStatic(!noEtags));
	return plugins;
};

module.exports.getFilename = (req) => {
	return req.meta[FILEPATH] || null;
};
