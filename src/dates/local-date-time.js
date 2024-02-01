'use strict';
const { printTimeString, parseTimeString } = require('./local-time');
const { printDateString, parseDateString } = require('./local-date');
const LOCAL_DATE_TIME = /^[0-9]{4}-[0-9]{2}-[0-9]{2}[Tt\x20][0-9]{2}:[0-9]{2}:[0-9]{2}(?:\.[0-9]+)?$/;

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
	// valueOf() { return super.valueOf(); }
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
	const { year, month, day } = parseDateString(str);
	const { hours, minutes, seconds, milliseconds } = parseTimeString(str.slice(11));
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
