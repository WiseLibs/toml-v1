'use strict';
const { File } = require('super-sources');

const WHITESPACE = /[\x20\t]+/y;
const NEWLINE = /\r?\n/y;
const EMPTY_LINES = /(?:\r?\n|[\x20\t])+/y;
const COMMENT = /#[^\x00-\x08\x0a-\x1f\x7f]*/y;

/*
	A basic parser that can match against strings or RexExp objects, and can
	skip whitespace, empty lines, and comments.
 */

module.exports = class Parser {
	constructor(file) {
		if (!(file instanceof File)) {
			throw new TypeError('Expected file to be a File object');
		}

		this._file = file;
		this._offset = 0;
		this._captured = file.at(0, 1);
	}

	_skip(pattern) {
		if (!pattern.sticky) {
			throw new TypeError('Expected RegExp pattern to have the sticky flag');
		}
		pattern.lastIndex = this._offset;
		const match = pattern.exec(this._file.content);
		if (match) {
			if (match.length !== 1) {
				throw new TypeError('Expected RegExp pattern to not have capture groups');
			}
			this._offset += match[0].length;
			return true;
		}
		return false;
	}

	skip() {
		this._skip(WHITESPACE);
	}

	skipLines() {
		do {
			this._skip(EMPTY_LINES);
		} while (this._skip(COMMENT));
	}

	terminateLine() {
		this._skip(WHITESPACE);
		this._skip(COMMENT);
		this.isDone() || this._skip(NEWLINE) || this.fail();
	}

	terminateLineInString() {
		const message = this._skip(WHITESPACE) ? undefined : 'Invalid escape sequence';
		this._skip(NEWLINE) || this.fail(message);
		this._skip(EMPTY_LINES);
	}

	accept(pattern) {
		const { content } = this._file;
		if (typeof pattern === 'string') {
			if (!pattern) {
				throw new TypeError('Expected string pattern to not be empty');
			}
			if (content.startsWith(pattern, this._offset)) {
				this._captured = this._file.at(this._offset, pattern.length);
				this._offset += pattern.length;
				return true;
			}
		} else {
			if (!pattern.sticky) {
				throw new TypeError('Expected RegExp pattern to have the sticky flag');
			}
			pattern.lastIndex = this._offset;
			const match = pattern.exec(content);
			if (match) {
				if (match.length !== 1) {
					throw new TypeError('Expected RegExp pattern to not have capture groups');
				}
				this._captured = this._file.at(this._offset, match[0].length);
				this._offset += match[0].length;
				return true;
			}
		}
		return false;
	}

	expect(pattern, message) {
		this.accept(pattern) || this.fail(message);
		return this._captured;
	}

	fail(message = 'Invalid syntax') {
		throw this._file.at(this._offset, 1).error(message).done();
	}

	isDone() {
		return this._offset === this._file.content.length;
	}

	getCaptured() {
		return this._captured;
	}
};
