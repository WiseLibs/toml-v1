'use strict';
const { File } = require('super-sources');
const { LocalTime, LocalDate, LocalDateTime, OffsetDateTime } = require('./dates');
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
