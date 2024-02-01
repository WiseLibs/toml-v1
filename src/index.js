'use strict';
const { File } = require('super-sources');
const { LocalTime } = require('./dates/local-time');
const { LocalDate } = require('./dates/local-date');
const { LocalDateTime } = require('./dates/local-date-time');
const { OffsetDateTime } = require('./dates/offset-date-time');
const { SourceTracker } = require('./source-tracker');
const parseAST = require('./parse');
const interpret = require('./interpret');

function parse(toml, filename = 'TOML document', tracker = null) {
	if (typeof toml !== 'string') {
		throw new TypeError('Expected toml to be a string');
	}
	if (typeof filename !== 'string') {
		throw new TypeError('Expected filename to be a string');
	}
	if (tracker !== null && !(tracker instanceof SourceTracker)) {
		throw new TypeError('Expected tracker to be a SourceTracker object');
	}
	return interpret(parseAST(new File(filename, toml)), tracker);
}

Object.assign(exports, {
	parse,
	LocalTime,
	LocalDate,
	LocalDateTime,
	OffsetDateTime,
	SourceTracker,
});
