'use strict';
const { expect } = require('chai');
const { parse } = require('..');

describe('parse()', function () {
	it('throws when the first argument is not provided');
	it('throws when a non-string first argument is passed');
	it('throws when a non-string second argument is passed');
	it('throws when a non-SourceTracker/null third argument is passed');
	it('parses the given TOML document');
});
