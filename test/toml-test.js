'use strict';
const fs = require('fs');
const path = require('path');
const { EOL } = require('os');
const { expect } = require('chai');
const { SourceError } = require('super-sources');
const { parse, LocalTime, LocalDate, LocalDateTime, OffsetDateTime } = require('..');

const EXPECT_FAILURE = [
	// This fails because JavaScript numbers don't have 64 bits of precisions.
	'valid/integer/long',

	// These fails because we parse strings, not raw buffers.
	'invalid/encoding/bad-codepoint',
	'invalid/encoding/bad-utf8-in-comment',
	'invalid/encoding/bad-utf8-in-multiline',
	'invalid/encoding/bad-utf8-in-multiline-literal',
	'invalid/encoding/bad-utf8-in-string',
	'invalid/encoding/bad-utf8-in-string-literal',
];

// The tests expect all newlines to be UNIX-style, even though the spec allows
// us to normalize newlines within multiline strings for the current platform.
const WINDOWS_NEWLINES = [
	'valid/array/string-with-comma-2',
	'valid/comment/tricky',
	'valid/inline-table/multiline',
	'valid/spec/string-1',
	'valid/spec/string-6',
	'valid/string/ends-in-whitespace-escape',
	'valid/string/multiline',
	'valid/string/multiline-quotes',
	'valid/string/raw-multiline',
];

// These files are somehow named incorrectly the "toml-test" repository.
// Eventually someone should make a PR to fix them.
const MISNAMED_FILES = new Map([
	['invalid/inline-table/overwrite-1.toml', 'invalid/inline-table/overwrite-01.toml'],
	['invalid/inline-table/overwrite-2.toml', 'invalid/inline-table/overwrite-02.toml'],
	['invalid/inline-table/overwrite-3.toml', 'invalid/inline-table/overwrite-03.toml'],
	['invalid/inline-table/overwrite-4.toml', 'invalid/inline-table/overwrite-04.toml'],
	['invalid/inline-table/overwrite-5.toml', 'invalid/inline-table/overwrite-05.toml'],
	['invalid/inline-table/overwrite-6.toml', 'invalid/inline-table/overwrite-06.toml'],
	['invalid/inline-table/overwrite-7.toml', 'invalid/inline-table/overwrite-07.toml'],
	['invalid/inline-table/overwrite-8.toml', 'invalid/inline-table/overwrite-08.toml'],
	['invalid/inline-table/overwrite-9.toml', 'invalid/inline-table/overwrite-09.toml'],
]);

const TESTS_DIR = path.join(__dirname, 'toml-test', 'tests');
const FILES = fs.readFileSync(path.join(TESTS_DIR, 'files-toml-1.0.0'), 'utf8')
	.split(/\r?\n/)
	.filter(x => path.extname(x) === '.toml')
	.map(x => MISNAMED_FILES.get(x) || x);

describe('Official TOML test suite', function () {
	for (const partialPath of FILES) {
		const completePath = path.join(TESTS_DIR, partialPath);
		const testName = partialPath.slice(0, -5);
		const toml = fs.readFileSync(completePath, 'utf8');
		let json;

		if (testName.startsWith('valid/')) {
			let jsonString = fs.readFileSync(completePath.slice(0, -5) + '.json', 'utf8');
			if (EOL === '\r\n' && WINDOWS_NEWLINES.includes(testName)) {
				jsonString = jsonString.replace(/\\n/g, '\\r\\n');
			}
			json = JSON.parse(jsonString);
		} else if (!testName.startsWith('invalid/')) {
			throw new TypeError('Unexpected test name');
		}

		specify(testName, function () {
			if (json) {
				if (EXPECT_FAILURE.includes(testName)) {
					expect(() => parse(toml)).to.throw(SourceError);
				} else {
					expect(parse(toml)).to.deep.equal(format(json));
				}
			} else {
				if (EXPECT_FAILURE.includes(testName)) {
					expect(() => parse(toml)).to.not.throw();
				} else {
					expect(() => parse(toml)).to.throw(SourceError);
				}

			}
		});
	}
});

function format(table) {
	if (Array.isArray(table)) {
		return table.map(format);
	}
	if (typeof table.type === 'string' && typeof table.value === 'string') {
		switch (table.type) {
			case 'bool':
				return table.value === 'true';
			case 'float':
				if (table.value === 'nan') return NaN;
				if (table.value === '+nan') return NaN;
				if (table.value === '-nan') return NaN;
				if (table.value === 'inf') return Infinity;
				if (table.value === '+inf') return Infinity;
				if (table.value === '-inf') return -Infinity;
				return Number.parseFloat(table.value, 10);
			case 'integer':
				return Number.parseInt(table.value, 10);
			case 'string':
				return table.value;
			case 'time-local':
				return new LocalTime(table.value);
			case 'date-local':
				return new LocalDate(table.value);
			case 'datetime-local':
				return new LocalDateTime(table.value);
			case 'datetime':
				return new OffsetDateTime(table.value);
			default:
				throw new TypeError('Unrecognized value type in TOML tests');
		}
	}
	const clone = {};
	for (const [key, value] of Object.entries(table)) {
		clone[key] = format(value);
	}
	return clone;
}
