'use strict';

module.exports = (pathname, allowDotfiles) => {
	if (pathname === '*') {
		return null;
	}

	const segments = pathname
		.slice(1)
		.split('/')
		.map(decodeURIComponent);

	if (segments.some(isInvalidSegment)) {
		return null;
	}

	if (!allowDotfiles && segments.some(isDotfileSegment)) {
		return null;
	}

	return '/' + segments.join('/');
};

const INVALID_SEGMENT = /^\.*$|[/\\]/;
const DOTFILE_SEGMENT = /^\./;
const isInvalidSegment = x => INVALID_SEGMENT.test(x);
const isDotfileSegment = x => DOTFILE_SEGMENT.test(x);
