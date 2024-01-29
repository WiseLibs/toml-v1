'use strict';
const { File } = require('super-sources');
const { LocalTime, LocalDate, LocalDateTime, OffsetDateTime } = require('./dates');
const parseAST = require('./parse');
const interpret = require('./interpret');

function parse(toml, filename = 'TOML document') {
	if (typeof toml !== 'string') {
		throw new TypeError('Expected toml to be a string');
	}
	if (typeof filename !== 'string') {
		throw new TypeError('Expected filename to be a string');
	}
	return interpret(parseAST(new File(filename, toml)));
}

Object.assign(exports, {
	parse,
	LocalTime,
	LocalDate,
	LocalDateTime,
	OffsetDateTime,
});
