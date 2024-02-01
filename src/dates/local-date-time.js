'use strict';
const LOCAL_DATE_TIME = /^[0-9]{4}-[0-9]{2}-[0-9]{2}[Tt\x20][0-9]{2}:[0-9]{2}:[0-9]{2}(?:\.[0-9]+)?$/;
const { printTimeString } = require('./local-time');
const { printDateString } = require('./local-date');

class LocalDateTime extends Date {
	constructor(...args) {
		if (args.length === 0) {
			super();
		} else if (args.length === 1) {
			let value = args[0];
			if (typeof value !== 'number') {
				if (value instanceof Date) {
					value = Number(new Date(value));
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
	}
	static parse() { throw methodNotSupported(); }
	static UTC() { throw methodNotSupported(); }
	static now() { throw methodNotSupported(); }
	valueOf() { throw noTimezoneInformation(); }
	getTime() { throw noTimezoneInformation(); }
	setTime() { throw noTimezoneInformation(); }
	// getMilliseconds() { return super.getMilliseconds(); }
	// setMilliseconds(x) { return super.setMilliseconds(x); }
	getUTCMilliseconds() { throw noTimezoneInformation(); }
	setUTCMilliseconds() { throw noTimezoneInformation(); }
	// getSeconds() { return super.getSeconds(); }
	// setSeconds(x) { return super.setSeconds(x); }
	getUTCSeconds() { throw noTimezoneInformation(); }
	setUTCSeconds() { throw noTimezoneInformation(); }
	// getMinutes() { return super.getMinutes(); }
	// setMinutes(x) { return super.setMinutes(x); }
	getUTCMinutes() { throw noTimezoneInformation(); }
	setUTCMinutes() { throw noTimezoneInformation(); }
	// getHours() { return super.getHours(); }
	// setHours(x) { return super.setHours(x); }
	getUTCHours() { throw noTimezoneInformation(); }
	setUTCHours() { throw noTimezoneInformation(); }
	// getDate() { return super.getDate(); }
	// setDate(x) { return super.setDate(x); }
	getUTCDate() { throw noTimezoneInformation(); }
	setUTCDate() { throw noTimezoneInformation(); }
	// getMonth() { return super.getMonth(); }
	// setMonth(x) { return super.setMonth(x); }
	getUTCMonth() { throw noTimezoneInformation(); }
	setUTCMonth() { throw noTimezoneInformation(); }
	// getYear() { return super.getYear(); }
	// setYear(x) { return super.setYear(x); }
	// getFullYear() { return super.getFullYear(); }
	// setFullYear(x) { return super.setFullYear(x); }
	getUTCFullYear() { throw noTimezoneInformation(); }
	setUTCFullYear() { throw noTimezoneInformation(); }
	// getDay() { return super.getDay(); }
	getUTCDay() { throw noTimezoneInformation(); }
	getTimezoneOffset() { throw noTimezoneInformation(); }
	toString() {
		if (Number.isNaN(super.valueOf())) return 'Invalid Date';
		return `${super.toDateString()} ${printTimeString(this, true)}`;
	}
	toUTCString() { throw noTimezoneInformation(); }
	toGMTString() { throw noTimezoneInformation(); }
	toISOString() {
		if (Number.isNaN(super.valueOf())) throw new RangeError('Invalid time value');
		return `${printDateString(this)}T${printTimeString(this)}`;
	}
	// toDateString() { return super.toDateString(); }
	toTimeString() {
		if (Number.isNaN(super.valueOf())) return 'Invalid Date';
		return printTimeString(this, true);
	}
	// toLocaleDateString() { return super.toLocaleDateString(); }
	// toLocaleTimeString() { return super.toLocaleTimeString(); }
	// toLocaleString() { return super.toLocaleString(); }
	toJSON() { return this.toISOString(); }
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
	if (year >= 0 && year <= 99) date.setFullYear(date.getFullYear() - 1900);
	return date.valueOf();
}

function methodNotSupported() {
	return new TypeError('Method not supported');
}

function noTimezoneInformation() {
	return new TypeError('No timezone information available');
}

Object.assign(exports, {
	LocalDateTime,
	parseLocalDateTime,
});
