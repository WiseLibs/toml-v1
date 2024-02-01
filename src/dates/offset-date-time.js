'use strict';
const { parseTimeString } = require('./local-time');
const { parseDateString } = require('./local-date');
const OFFSET_DATE_TIME = /^[0-9]{4}-[0-9]{2}-[0-9]{2}[Tt\x20][0-9]{2}:[0-9]{2}:[0-9]{2}(?:\.[0-9]+)?(?:[Zz]|[+-][0-9]{2}:[0-9]{2})$/;
const OFFSET = Symbol();

class OffsetDateTime extends Date {
	constructor(...args) {
		let offset = 0;
		if (args.length === 0) {
			super();
		} else if (args.length === 1) {
			let value = args[0];
			if (typeof value !== 'number') {
				if (value instanceof Date) {
					value = Number(new Date(value));
				} else if (typeof value === 'string') {
					if (!OFFSET_DATE_TIME.test(value)) {
						throw new Error('OffsetDateTime string format is invalid');
					}
					({ value, offset } = parseOffsetDateTime(value));
				} else {
					throw new TypeError('Expected argument to be a string, number, or Date');
				}
			}
			super(value);
		} else {
			throw new RangeError('OffsetDateTime constructor only supports 1 parameter');
		}

		Object.defineProperty(this, OFFSET, {
			value: offset,
			writable: true,
		});
	}

	static parse() { throw methodNotSupported(); }
	static UTC() { throw methodNotSupported(); }
	static now() { throw methodNotSupported(); }

	getOriginalTimezoneOffset() {
		return this[OFFSET];
	}
	setOriginalTimezoneOffset(offset) {
		if (!Number.isInteger(offset)) {
			throw new TypeError('Expected offset to be an integer');
		}
		if (offset < -6039 || offset > 6039) {
			throw new RangeError('Offset value out of bounds');
		}
		this[OFFSET] = offset;
	}
	toISOString() {
		const offset = this[OFFSET];
		if (offset === 0) {
			const year = super.getUTCFullYear();
			if (year < 0) throw new RangeError('Negative years are not supported');
			if (year > 9999) throw new RangeError('Years beyond 9999 are not supported');
			return super.toISOString();
		} else {
			const date = new Date(super.valueOf() - offset * 60000);
			const year = date.getUTCFullYear();
			if (year < 0) throw new RangeError('Negative years are not supported');
			if (year > 9999) throw new RangeError('Years beyond 9999 are not supported');
			const sign = offset > 0 ? '-' : '+';
			const offsetAbs = Math.abs(offset);
			const offsetHours = Math.trunc(offsetAbs / 60);
			const offsetMinutes = offsetAbs - offsetHours * 60;
			const offsetHoursString = offsetHours.toString().padStart(2, '0');
			const offsetMinutesString = offsetMinutes.toString().padStart(2, '0');
			return `${date.toISOString().slice(0, -1)}${sign}${offsetHoursString}:${offsetMinutesString}`;
		}
	}
	toJSON() {
		return this.toISOString();
	}
}

function parseOffsetDateTime(str) {
	let offset = 0;
	let tailLength = 1;
	if (!str.endsWith('Z') && !str.endsWith('z')) {
		const sign = str.slice(-6, -5) === '-' ? 1 : -1;
		const offsetHours = Number.parseInt(str.slice(-5, -3), 10);
		const offsetMinutes = Number.parseInt(str.slice(-2), 10);
		offset = sign * (offsetHours * 60 + offsetMinutes);
		tailLength = 6;
	}
	const { year, month, day } = parseDateString(str);
	const { hours, minutes, seconds, milliseconds } = parseTimeString(str.slice(11, -tailLength));
	const date = new Date(Date.UTC(year, month - 1, day, hours, minutes + offset, seconds, milliseconds));
	// The Date constructor interprets 2-digit years as relative to 1900.
	if (year >= 0 && year <= 99) date.setUTCFullYear(date.getUTCFullYear() - 1900);
	return { value: date.valueOf(), offset };
}

function methodNotSupported() {
	return new TypeError('Method not supported');
}

Object.assign(exports, {
	OffsetDateTime,
	parseOffsetDateTime,
	OFFSET,
});
