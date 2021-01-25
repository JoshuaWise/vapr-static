'use strict';

module.exports = (pathname, allowDotfiles) => {
	if (pathname === '*') {
		return null;
	}

	const hasTrailingSlash = pathname.endsWith('/');
	const segments = pathname
		.slice(1, pathname.length - (hasTrailingSlash ? 1 : 0))
		.split('/')
		.map(decodeURIComponent);

	if (segments.some(isInvalidSegment)) {
		return null;
	}

	if (!allowDotfiles && segments.some(isDotfileSegment)) {
		return null;
	}

	return '/' + segments.join('/') + (hasTrailingSlash ? '/' : '');
};

const INVALID_SEGMENT = /^\.*$|[/\\]/;
const DOTFILE_SEGMENT = /^\./;
const isInvalidSegment = x => INVALID_SEGMENT.test(x);
const isDotfileSegment = x => DOTFILE_SEGMENT.test(x);
