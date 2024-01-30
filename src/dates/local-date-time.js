'use strict';
const LOCAL_DATE_TIME = /^[0-9]{4}-[0-9]{2}-[0-9]{2}[Tt\x20][0-9]{2}:[0-9]{2}:[0-9]{2}(?:\.[0-9]+)?$/;
const VALIDATE = Symbol();

// TODO: maybe prevent valueOf/getTime/setTime/getTimezoneOffset and UTC/GMT/ISO methods
// TODO: maybe allow date to be invalid, and just handle the case in string methods
class LocalDateTime extends Date {
	constructor(...args) {
		if (args.length === 0) {
			super();
		} else if (args.length === 1) {
			let value = args[0];
			if (typeof value !== 'number') {
				if (value instanceof Date) {
					value = +value.valueOf();
				} else if (typeof value === 'string') {
					if (!LOCAL_DATE_TIME.test(value)) {
						throw new Error('LocalDateTime string is invalid');
					}
					value = parseLocalDateTime(value);
				} else {
					throw new TypeError('Expected argument to be a string, number, or Date');
				}
			}
			super(value);
		} else {
			throw new RangeError('LocalDateTime constructor only supports 1 parameter');
		}
		this[VALIDATE](0);
	}
	static parse(str) {
		if (typeof str !== 'string') {
			throw new TypeError('Expected argument to be a string');
		}
		return new LocalDateTime(str);
	}
	static UTC() {
		throw new TypeError('Method not supported');
	}
	static now() {
		throw new TypeError('Method not supported');
	}
	[VALIDATE](prevValue) {
		const value = super.valueOf();
		if (!Number.isFinite(value)) {
			super.setTime(prevValue);
			throw new Error('Date/time value is invalid');
		}
		return value;
	}
	// getTime() { return super.getTime(); }
	setTime(x) { const v = super.valueOf(); super.setTime(x); return this[VALIDATE](v); }
	// getMilliseconds() { return super.getMilliseconds(); }
	setMilliseconds(x) { const v = super.valueOf(); super.setMilliseconds(x); return this[VALIDATE](v); }
	// getUTCMilliseconds() { return super.getUTCMilliseconds(); }
	setUTCMilliseconds(x) { const v = super.valueOf(); super.setUTCMilliseconds(x); return this[VALIDATE](v); }
	// getSeconds() { return super.getSeconds(); }
	setSeconds(x) { const v = super.valueOf(); super.setSeconds(x); return this[VALIDATE](v); }
	// getUTCSeconds() { return super.getUTCSeconds(); }
	setUTCSeconds(x) { const v = super.valueOf(); super.setUTCSeconds(x); return this[VALIDATE](v); }
	// getMinutes() { return super.getMinutes(); }
	setMinutes(x) { const v = super.valueOf(); super.setMinutes(x); return this[VALIDATE](v); }
	// getUTCMinutes() { return super.getUTCMinutes(); }
	setUTCMinutes(x) { const v = super.valueOf(); super.setUTCMinutes(x); return this[VALIDATE](v); }
	// getHours() { return super.getHours(); }
	setHours(x) { const v = super.valueOf(); super.setHours(x); return this[VALIDATE](v); }
	// getUTCHours() { return super.getUTCHours(); }
	setUTCHours(x) { const v = super.valueOf(); super.setUTCHours(x); return this[VALIDATE](v); }
	// getDate() { return super.getDate(); }
	setDate(x) { const v = super.valueOf(); super.setDate(x); return this[VALIDATE](v); }
	// getUTCDate() { return super.getUTCDate(); }
	setUTCDate(x) { const v = super.valueOf(); super.setUTCDate(x); return this[VALIDATE](v); }
	// getMonth() { return super.getMonth(); }
	setMonth(x) { const v = super.valueOf(); super.setMonth(x); return this[VALIDATE](v); }
	// getUTCMonth() { return super.getUTCMonth(); }
	setUTCMonth(x) { const v = super.valueOf(); super.setUTCMonth(x); return this[VALIDATE](v); }
	// getYear() { return super.getYear(); }
	setYear(x) { const v = super.valueOf(); super.setYear(x); return this[VALIDATE](v); }
	// getFullYear() { return super.getFullYear(); }
	setFullYear(x) { const v = super.valueOf(); super.setFullYear(x); return this[VALIDATE](v); }
	// getUTCFullYear() { return super.getUTCFullYear(); }
	setUTCFullYear(x) { const v = super.valueOf(); super.setUTCFullYear(x); return this[VALIDATE](v); }
	// getDay() { return super.getDay(); }
	// getUTCDay() { return super.getUTCDay(); }
	// getTimezoneOffset() { return super.getTimezoneOffset(); }
	toString() { return super.toString().replace(/(:[0-9]{2}:[0-9]{2}).*/, '$1'); }
	// toUTCString() { return super.toUTCString(); }
	// toGMTString() { return super.toGMTString(); }
	// toISOString() { return super.toISOString(); }
	// toDateString() { return super.toDateString(); }
	toTimeString() { return super.toTimeString().slice(0, 8); }
	// toLocaleDateString() { return super.toLocaleDateString(); }
	// toLocaleTimeString() { return super.toLocaleTimeString(); }
	// toLocaleString() { return super.toLocaleString(); }
	// toJSON() { return super.toJSON(); }
}

function parseLocalDateTime(str) {
	const year = Number.parseInt(str.slice(0, 4), 10);
	const month = Number.parseInt(str.slice(5, 7), 10);
	const day = Number.parseInt(str.slice(8, 10), 10);
	if (month < 1) throw new RangeError('Month value cannot be 0');
	if (day < 1) throw new RangeError('Day value cannot be 0');
	const hours = Number.parseInt(str.slice(11, 13), 10);
	const minutes = Number.parseInt(str.slice(14, 16), 10);
	const seconds = Number.parseInt(str.slice(17, 19), 10);
	const milliseconds = str.length > 19 ? Math.trunc(Number.parseFloat(str.slice(19), 10) * 1000) : 0;
	const date = new Date(year, month - 1, day, hours, minutes, seconds, milliseconds);
	// The Date constructor interprets 2-digit years as relative to 1900.
	if (year >= 0 && year <= 99) date.setUTCFullYear(date.getUTCFullYear() - 1900);
	return date.valueOf();
}

Object.assign(exports, {
	LocalDateTime,
	parseLocalDateTime,
});
