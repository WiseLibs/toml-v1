'use strict';
const LOCAL_TIME = /^[0-9]{2}:[0-9]{2}:[0-9]{2}(?:\.[0-9]+)?$/;
const NORMALIZE = Symbol();
const DATE = new Date();

// TODO: maybe prevent valueOf/getTime/setTime/getTimezoneOffset and UTC/GMT/ISO methods
// TODO: maybe allow date to be invalid, and just handle the case in string methods
class LocalTime extends Date {
	constructor(...args) {
		if (args.length === 0) {
			super();
		} else if (args.length === 1) {
			let value = args[0];
			if (typeof value !== 'number') {
				if (value instanceof Date) {
					value = +value.valueOf();
				} else if (typeof value === 'string') {
					if (!LOCAL_TIME.test(value)) {
						throw new Error('LocalTime string is invalid');
					}
					value = parseLocalTime(value);
				} else {
					throw new TypeError('Expected argument to be a string, number, or Date');
				}
			}
			super(value);
		} else {
			throw new RangeError('LocalTime constructor only supports 1 parameter');
		}
		this[NORMALIZE](0);
	}
	static parse(str) {
		if (typeof str !== 'string') {
			throw new TypeError('Expected argument to be a string');
		}
		return new LocalTime(str);
	}
	static UTC() {
		throw new TypeError('Method not supported');
	}
	static now() {
		throw new TypeError('Method not supported');
	}
	[NORMALIZE](prevValue) {
		const value = super.valueOf();
		if (!Number.isFinite(value)) {
			super.setTime(prevValue);
			throw new Error('Date/time value is invalid');
		}
		return super.setTime(value % 86400000 + (value < 0 ? 86400000 : 0));
	}
	// getTime() { return super.getTime(); }
	setTime(x) { const v = super.valueOf(); super.setTime(x); return this[NORMALIZE](v); }
	// getMilliseconds() { return super.getMilliseconds(); }
	setMilliseconds(x) { const v = super.valueOf(); super.setMilliseconds(x); return this[NORMALIZE](v); }
	// getUTCMilliseconds() { return super.getUTCMilliseconds(); }
	setUTCMilliseconds(x) { const v = super.valueOf(); super.setUTCMilliseconds(x); return this[NORMALIZE](v); }
	// getSeconds() { return super.getSeconds(); }
	setSeconds(x) { const v = super.valueOf(); super.setSeconds(x); return this[NORMALIZE](v); }
	// getUTCSeconds() { return super.getUTCSeconds(); }
	setUTCSeconds(x) { const v = super.valueOf(); super.setUTCSeconds(x); return this[NORMALIZE](v); }
	// getMinutes() { return super.getMinutes(); }
	setMinutes(x) { const v = super.valueOf(); super.setMinutes(x); return this[NORMALIZE](v); }
	// getUTCMinutes() { return super.getUTCMinutes(); }
	setUTCMinutes(x) { const v = super.valueOf(); super.setUTCMinutes(x); return this[NORMALIZE](v); }
	// getHours() { return super.getHours(); }
	setHours(x) { const v = super.valueOf(); super.setHours(x); return this[NORMALIZE](v); }
	// getUTCHours() { return super.getUTCHours(); }
	setUTCHours(x) { const v = super.valueOf(); super.setUTCHours(x); return this[NORMALIZE](v); }
	getDate() { throw noDateInformation(); }
	setDate() { throw noDateInformation(); }
	getUTCDate() { throw noDateInformation(); }
	setUTCDate() { throw noDateInformation(); }
	getMonth() { throw noDateInformation(); }
	setMonth() { throw noDateInformation(); }
	getUTCMonth() { throw noDateInformation(); }
	setUTCMonth() { throw noDateInformation(); }
	getYear() { throw noDateInformation(); }
	setYear() { throw noDateInformation(); }
	getFullYear() { throw noDateInformation(); }
	setFullYear() { throw noDateInformation(); }
	getUTCFullYear() { throw noDateInformation(); }
	setUTCFullYear() { throw noDateInformation(); }
	getDay() { throw noDateInformation(); }
	getUTCDay() { throw noDateInformation(); }
	// getTimezoneOffset() { return super.getTimezoneOffset(); }
	toString() { return this.toTimeString(); }
	toUTCString() { return super.toUTCString().slice(-12, -4); }
	toGMTString() { return this.toUTCString(); }
	toISOString() { return super.toISOString().slice(-13, -5); }
	toDateString() { throw noDateInformation(); }
	toTimeString() { return super.toTimeString().slice(0, 8); }
	toLocaleDateString() { throw noDateInformation(); }
	// toLocaleTimeString() { return super.toLocaleTimeString(); }
	toLocaleString() { return super.toLocaleTimeString(); }
	toJSON() { return this.toISOString(); }
}

function parseLocalTime(str) {
	const hours = Number.parseInt(str.slice(0, 2), 10);
	const minutes = Number.parseInt(str.slice(3, 5), 10) + DATE.getTimezoneOffset();
	const seconds = Number.parseInt(str.slice(6, 8), 10);
	const milliseconds = str.length > 8 ? Math.trunc(Number.parseFloat(str.slice(8), 10) * 1000) : 0;
	return milliseconds + seconds * 1000 + minutes * 60000 + hours * 3600000;
}

function noDateInformation() {
	return new TypeError('No date information available');
}

Object.assign(exports, {
	LocalTime,
	parseLocalTime,
});
