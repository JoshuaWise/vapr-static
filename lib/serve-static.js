'use strict';
const fs = require('fs');
const util = require('util');
const { River } = require('vapr');
const { FILEPATH } = require('./shared');

module.exports = (useEtags) => async (req) => {
	const filepath = req.meta[FILEPATH];
	const fd = await openAsync(filepath, 'r').catch(throwFileError);
	let shouldClose = true;

	try {
		const stat = await fstatAsync(fd);
		if (!stat.isFile()) {
			return 404;
		}

		if (useEtags) {
			req.verify({ weak: [
				String(Number(stat.mtime)),
				String(stat.size),
			] });
		}

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

const openAsync = util.promisify(fs.open);
const fstatAsync = util.promisify(fs.fstat);
const closeAsync = util.promisify(fs.close);
