'use strict';
const { expect } = require('chai');
const { LocalTime } = require('..');

describe('SourceTracker', function () {
	describe('supported TOML entities', function () {
		specify('implicit tables');
		specify('explicit tables');
		specify('arrays of tables');
		specify('tables within arrays of tables');
		specify('key-value assignments on implicit tables');
		specify('key-value assignments on explicit tables');
		specify('key-value assignments on tables within arrays of tables');
		specify('key-value assignments on inline tables');
		specify('values within inline arrays');
	});
});
