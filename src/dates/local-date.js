'use strict';
const LOCAL_DATE = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
const VALIDATE = Symbol();
const NORMALIZE = Symbol();
const DATE = new Date();

// TODO: maybe prevent valueOf/getTime/setTime/getTimezoneOffset and UTC/GMT/ISO methods
// TODO: maybe allow date to be invalid, and just handle the case in string methods
class LocalDate extends Date {
	constructor(...args) {
		if (args.length === 0) {
			super();
		} else if (args.length === 1) {
			let value = args[0];
			if (typeof value !== 'number') {
				if (value instanceof Date) {
					value = +value.valueOf();
				} else if (typeof value === 'string') {
					if (!LOCAL_DATE.test(value)) {
						throw new Error('LocalDate string is invalid');
					}
					value = parseLocalDate(value);
				} else {
					throw new TypeError('Expected argument to be a string, number, or Date');
				}
			}
			super(value);
		} else {
			throw new RangeError('LocalDate constructor only supports 1 parameter');
		}
		this[NORMALIZE](0);
	}
	static parse(str) {
		if (typeof str !== 'string') {
			throw new TypeError('Expected argument to be a string');
		}
		return new LocalDate(str);
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
	[NORMALIZE](prevValue) {
		this[VALIDATE](prevValue);
		const timezoneOffset = super.getTimezoneOffset();
		const delta = super.getDate() !== super.getUTCDate() ? -Math.sign(timezoneOffset) : 0;
		super.setUTCHours(0);
		super.setUTCMinutes(safeOffset(timezoneOffset));
		super.setUTCSeconds(0);
		super.setUTCMilliseconds(0);
		return super.setUTCDate(super.getUTCDate() + delta);
	}
	// getTime() { return super.getTime(); }
	setTime(x) { const v = super.valueOf(); super.setTime(x); return this[NORMALIZE](v); }
	getMilliseconds() { throw noTimeInformation(); }
	setMilliseconds() { throw noTimeInformation(); }
	getUTCMilliseconds() { throw noTimeInformation(); }
	setUTCMilliseconds() { throw noTimeInformation(); }
	getSeconds() { throw noTimeInformation(); }
	setSeconds() { throw noTimeInformation(); }
	getUTCSeconds() { throw noTimeInformation(); }
	setUTCSeconds() { throw noTimeInformation(); }
	getMinutes() { throw noTimeInformation(); }
	setMinutes() { throw noTimeInformation(); }
	getUTCMinutes() { throw noTimeInformation(); }
	setUTCMinutes() { throw noTimeInformation(); }
	getHours() { throw noTimeInformation(); }
	setHours() { throw noTimeInformation(); }
	getUTCHours() { throw noTimeInformation(); }
	setUTCHours() { throw noTimeInformation(); }
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
	toString() { return super.toDateString(); }
	toUTCString() { return super.toUTCString().slice(0, -13); }
	toGMTString() { return this.toUTCString(); }
	toISOString() { return super.toISOString().slice(0, -14); }
	// toDateString() { return super.toDateString(); }
	toTimeString() { throw noTimeInformation(); }
	// toLocaleDateString() { return super.toLocaleDateString(); }
	toLocaleTimeString() { throw noTimeInformation(); }
	toLocaleString() { return super.toLocaleDateString(); }
	toJSON() { return this.toISOString(); }
}

function parseLocalDate(str) {
	const year = Number.parseInt(str.slice(0, 4), 10);
	const month = Number.parseInt(str.slice(5, 7), 10);
	const day = Number.parseInt(str.slice(8, 10), 10);
	if (month < 1) throw new RangeError('Month value cannot be 0');
	if (day < 1) throw new RangeError('Day value cannot be 0');
	const timezoneOffset = DATE.getTimezoneOffset();
	const date = new Date(year, month - 1, day, 0, safeOffset(timezoneOffset) - timezoneOffset);
	// The Date constructor interprets 2-digit years as relative to 1900.
	if (year >= 0 && year <= 99) date.setUTCFullYear(date.getUTCFullYear() - 1900);
	return date.valueOf();
}

// LocalDate contains no time information, so timezones become meaningless.
// Therefore, there should be no difference between UTC-prefixed methods and
// regular methods. To ensure this, we set the LocalDate's underlying time value
// to a safe time in the middle of the day, based on the timezone. Note that
// using 12:00 is not sufficient, because some timezones have 14-hour offsets.
function safeOffset(timezoneOffset) {
	return Math.floor((1440 - timezoneOffset) / 2 + timezoneOffset);
}

function noTimeInformation() {
	return new TypeError('No time information available');
}

Object.assign(exports, {
	LocalDate,
	parseLocalDate,
});
