'use strict';
const fs = require('fs');
const path = require('path');
const { EOL } = require('os');
const { expect } = require('chai');
const { SourceError } = require('super-sources');
const { parse, LocalTime, LocalDate, LocalDateTime, OffsetDateTime } = require('..');

const EXPECT_FAILURE = [
	'valid/integer/long', // JavaScript numbers don't have 64 bits of precisions
	'invalid/encoding/bad-codepoint', // We parse strings, not raw buffers
	'invalid/encoding/bad-utf8-in-comment', // We parse strings, not raw buffers
	'invalid/encoding/bad-utf8-in-multiline', // We parse strings, not raw buffers
	'invalid/encoding/bad-utf8-in-multiline-literal', // We parse strings, not raw buffers
	'invalid/encoding/bad-utf8-in-string', // We parse strings, not raw buffers
	'invalid/encoding/bad-utf8-in-string-literal', // We parse strings, not raw buffers
];

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
			json = JSON.parse(normalizeLines(fs.readFileSync(completePath.slice(0, -5) + '.json', 'utf8')));
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

function normalizeLines(str) {
	if (EOL === '\n') return str;
	return str.replace(/\n/g, EOL);
}
