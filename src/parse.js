'use strict';
const { EOL } = require('os');
const { LocalTime, parseLocalTime } = require('./dates/local-time');
const { LocalDate, parseLocalDate } = require('./dates/local-date');
const { LocalDateTime, parseLocalDateTime } = require('./dates/local-date-time');
const { OffsetDateTime, parseOffsetDateTime, OFFSET } = require('./dates/offset-date-time');
const Parser = require('./parser');
const ast = require('./ast');

const NEWLINE = /\r?\n/y;
const DATE = /[0-9]{4}-[0-9]{2}-[0-9]{2}/y;
const TIME = /[0-9]{2}:[0-9]{2}:[0-9]{2}(?:\.[0-9]+)?/y;
const BASIC_STRING_ESCAPE = /["\\bfnrtuU]/y;
const BASIC_STRING_CHARS = /[\t\x20\x21\x23-\x5b\x5d-\x7e\u0080-\ud7ff\ue000-\u{10ffff}]+/yu;
const LITERAL_STRING_CHARS = /[\t\x20-\x26\x28-\x7e\u0080-\ud7ff\ue000-\u{10ffff}]+/yu;

/*
	Parses the given TOML file using standard recursive descent.
 */

module.exports = (file) => {
	const parser = new Parser(file);
	const definitions = [];
	parser.skipLines();
	while (!parser.isDone()) {
		definitions.push(definition(parser));
		parser.terminateLine();
		parser.skipLines();
	}
	return definitions;
};

function definition(parser) {
	if (parser.accept('[[')) {
		const begin = parser.getCaptured();
		const key = keyPath(parser);
		const end = parser.expect(']]');
		return new ast.ScopeNode(begin.to(end), key, true);
	} else if (parser.accept('[')) {
		const begin = parser.getCaptured();
		const key = keyPath(parser);
		const end = parser.expect(']');
		return new ast.ScopeNode(begin.to(end), key, false);
	} else {
		const key = keyPath(parser);
		const value = valueAssignment(parser);
		return new ast.AssignmentNode(key, value);
	}
}

function keyPath(parser) {
	const parts = [];
	do {
		parser.skip();
		if (parser.accept('"')) {
			parts.push(basicString(parser));
		} else if (parser.accept('\'')) {
			parts.push(literalString(parser));
		} else {
			parts.push(new ast.IdentNode(parser.expect(/[a-zA-Z0-9_-]+/y)));
		}
		parser.skip();
	} while (parser.accept('.'));
	return new ast.KeyNode(parts);
}

function valueAssignment(parser) {
	parser.expect('=');
	parser.skip();
	return expression(parser);
}

function expression(parser) {
	if (parser.accept('{')) return inlineTable(parser);
	if (parser.accept('[')) return inlineArray(parser);
	if (parser.accept('"""')) return multilineBasicString(parser);
	if (parser.accept('\'\'\'')) return multilineLiteralString(parser);
	if (parser.accept('"')) return basicString(parser);
	if (parser.accept('\'')) return literalString(parser);
	if (parser.accept(DATE)) return dateLiteral(parser);
	if (parser.accept(TIME)) return timeLiteral(parser);
	if (parser.accept(/0x[0-9A-Fa-f](?:_?[0-9A-Fa-f])*/y)) return baseNLiteral(parser, 16);
	if (parser.accept(/0o[0-7](?:_?[0-7])*/y)) return baseNLiteral(parser, 8);
	if (parser.accept(/0b[01](?:_?[01])*/y)) return baseNLiteral(parser, 2);
	if (parser.accept(/[+-]?(?:[1-9](?:_?[0-9])+|[0-9])/y)) return decimalLiteral(parser);
	if (parser.accept(/[+-]?(?:inf|nan)/y)) return specialFloatLiteral(parser);
	if (parser.accept('true')) return new ast.BooleanNode(parser.getCaptured(), true);
	if (parser.accept('false')) return new ast.BooleanNode(parser.getCaptured(), false);
	parser.fail('Invalid value');
}

function inlineTable(parser) {
	const begin = parser.getCaptured();
	const assignments = [];
	parser.skip();
	if (!parser.accept('}')) {
		for (;;) {
			const key = keyPath(parser);
			const value = valueAssignment(parser);
			assignments.push(new ast.AssignmentNode(key, value));
			parser.skip();
			if (parser.accept(',')) {
				parser.skip();
			} else {
				break;
			}
		}
		parser.expect('}');
	}
	const end = parser.getCaptured();
	return new ast.InlineTableNode(begin.to(end), assignments);
}

function inlineArray(parser) {
	const begin = parser.getCaptured();
	const values = [];
	let allowMore = true;
	parser.skipLines();
	while (!parser.accept(']')) {
		allowMore || parser.fail();
		values.push(expression(parser));
		parser.skipLines();
		if (parser.accept(',')) {
			allowMore = true;
			parser.skipLines();
		} else {
			allowMore = false;
		}
	}
	const end = parser.getCaptured();
	return new ast.InlineArrayNode(begin.to(end), values);
}

function basicString(parser) {
	const begin = parser.getCaptured();
	const parts = [];
	for (;;) {
		if (parser.accept(BASIC_STRING_CHARS)) {
			parts.push(parser.getCaptured().string());
		}
		if (parser.accept('\\')) {
			parser.expect(BASIC_STRING_ESCAPE, 'Invalid escape sequence');
			parts.push(escapeSequence(parser));
		} else {
			break;
		}
	}
	const end = parser.expect('"', 'Invalid string character');
	return new ast.StringNode(begin.to(end), parts.join(''));
}

function literalString(parser) {
	const begin = parser.getCaptured();
	let value = '';
	if (parser.accept(LITERAL_STRING_CHARS)) {
		value = parser.getCaptured().string();
	}
	const end = parser.expect('\'', 'Invalid string character');
	return new ast.StringNode(begin.to(end), value);
}

function multilineBasicString(parser) {
	const begin = parser.getCaptured();
	const parts = [];
	parser.accept(NEWLINE);
	for (;;) {
		if (parser.accept(BASIC_STRING_CHARS)) {
			parts.push(parser.getCaptured().string());
		} else if (parser.accept(NEWLINE)) {
			parts.push(EOL);
		} else if (parser.accept('\\')) {
			if (parser.accept(BASIC_STRING_ESCAPE)) {
				parts.push(escapeSequence(parser));
			} else {
				parser.terminateLineInString();
			}
		} else if (parser.accept(/""?(?!")/y)) {
			parts.push(parser.getCaptured().string());
		} else {
			if (parser.accept(/""?(?=""")/y)) {
				parts.push(parser.getCaptured().string());
			}
			break;
		}
	}
	const end = parser.expect('"""', 'Invalid string character');
	return new ast.StringNode(begin.to(end), parts.join(''));
}

function multilineLiteralString(parser) {
	const begin = parser.getCaptured();
	const parts = [];
	parser.accept(NEWLINE);
	for (;;) {
		if (parser.accept(LITERAL_STRING_CHARS)) {
			parts.push(parser.getCaptured().string());
		} else if (parser.accept(NEWLINE)) {
			parts.push(EOL);
		} else if (parser.accept(/''?(?!')/y)) {
			parts.push(parser.getCaptured().string());
		} else {
			if (parser.accept(/''?(?=''')/y)) {
				parts.push(parser.getCaptured().string());
			}
			break;
		}
	}
	const end = parser.expect('\'\'\'', 'Invalid string character');
	return new ast.StringNode(begin.to(end), parts.join(''));
}

function escapeSequence(parser) {
	let source;
	switch (parser.getCaptured().string()) {
		case '"': return '"';
		case '\\': return '\\';
		case 'b': return '\b';
		case 'f': return '\f';
		case 'n': return '\n';
		case 'r': return '\r';
		case 't': return '\t';
		case 'u':
			source = parser.expect(/[0-9A-Fa-f]{4}/y, 'Invalid unicode escape sequence');
			break;
		case 'U':
			source = parser.expect(/[0-9A-Fa-f]{8}/y, 'Invalid unicode escape sequence');
			break;
		default:
			throw new TypeError('Unrecognized escape sequence');
	}

	const codePoint = Number.parseInt(source.string(), 16);
	if (!(
		codePoint >= 0 && codePoint <= 0xd7ff ||
		codePoint >= 0xe000 && codePoint <= 0x10ffff
	)) {
		throw source.error('Invalid unicode code point').done();
	}

	return String.fromCodePoint(codePoint);
}

function baseNLiteral(parser, base) {
	const source = parser.getCaptured();
	const value = Number.parseInt(source.string().slice(2).replace(/_/g, ''), base);
	if (value > Number.MAX_SAFE_INTEGER || value < Number.MIN_SAFE_INTEGER) {
		throw source.error('Integer cannot be represented losslessly').done();
	}
	return new ast.NumberNode(source, value);
}

function decimalLiteral(parser) {
	const wholePart = parser.getCaptured();
	let fractionalPart;
	let exponentPart;

	if (parser.accept(/\.[0-9](?:_?[0-9])*/y)) {
		fractionalPart = parser.getCaptured();
	}
	if (parser.accept(/[eE][+-]?[0-9](?:_?[0-9])*/y)) {
		exponentPart = parser.getCaptured();
	}

	if (!fractionalPart && !exponentPart) {
		let value = Number.parseInt(wholePart.string().replace(/_/g, ''), 10);
		// When there's no fractional part or exponent part, the value must be
		// interpretted as an integer, not a float. The TOML spec mandates that
		// integers must be represented losslessly, or else an error is thrown.
		if (value > Number.MAX_SAFE_INTEGER || value < Number.MIN_SAFE_INTEGER) {
			throw wholePart.error('Integer cannot be represented losslessly').done();
		}
		// Unlike floats, integers make no distinction between -0 and 0, so we
		// normalize the value by adding 0.
		value += 0;
		return new ast.NumberNode(wholePart, value);
	}

	const source = wholePart.to(exponentPart || fractionalPart);
	const value = Number.parseFloat(source.string().replace(/_/g, ''), 10);
	return new ast.NumberNode(source, value);
}

function specialFloatLiteral(parser) {
	const source = parser.getCaptured();
	const string = source.string();

	let start = 0;
	let sign = 1;
	if (string.length === 4) {
		start = 1;
		sign = string.startsWith('-') ? -1 : 1;
	}

	const value = string.charAt(start) === 'i' ? Infinity : NaN;
	return new ast.NumberNode(source, value * sign);
}

function dateLiteral(parser) {
	const date = parser.getCaptured();
	if (!parser.accept(/[Tt\x20]/y)) {
		const value = safeParse(parseLocalDate, date);
		return new ast.LocalDateNode(date, new LocalDate(value));
	}

	const time = parser.expect(TIME);
	if (parser.accept(/[Zz]|[+-][0-9]{2}:[0-9]{2}/y)) {
		const source = date.to(parser.getCaptured());
		const { value, offset } = safeParse(parseOffsetDateTime, source);
		const date = new OffsetDateTime(value);
		date[OFFSET] = offset;
		return new ast.OffsetDateTimeNode(source, date);
	} else {
		const source = date.to(time);
		const value = safeParse(parseLocalDateTime, source);
		return new ast.LocalDateTimeNode(source, new LocalDateTimeNode(value));
	}
}

function timeLiteral(parser) {
	const time = parser.getCaptured();
	const value = safeParse(parseLocalTime, time);
	return new ast.LocalTimeNode(time, new LocalTime(value));
}

function safeParse(fn, source) {
	try {
		return fn(source.string());
	} catch (err) {
		throw source.error(err.message).done();
	}
}
