'use strict';
const LOCAL_TIME = /^[0-9]{2}:[0-9]{2}:[0-9]{2}(?:\.[0-9]+)?$/;
const NORMALIZE = Symbol();
const DATE = new Date(0);

class LocalTime extends Date {
	constructor(...args) {
		if (args.length === 0) {
			super();
		} else if (args.length === 1) {
			let value = args[0];
			if (typeof value !== 'number') {
				if (value instanceof Date) {
					value = Number(new Date(value));
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

		if (!Number.isNaN(super.valueOf())) {
			super.setFullYear(1970);
			super.setMonth(0);
			super.setDate(0);
			this[NORMALIZE]();
		}
	}
	static parse() { throw methodNotSupported(); }
	static UTC() { throw methodNotSupported(); }
	static now() { throw methodNotSupported(); }
	[NORMALIZE]() {
		const value = super.valueOf();
		return super.setTime(value % 86400000 + (value < 0 ? 86400000 : 0));
	}
	// valueOf() { return super.valueOf(); }
	getTime() { throw noTimezoneInformation(); }
	setTime() { throw noTimezoneInformation(); }
	// getMilliseconds() { return super.getMilliseconds(); }
	setMilliseconds(x) { super.setMilliseconds(x % 86400000); return this[NORMALIZE](); }
	getUTCMilliseconds() { throw noTimezoneInformation(); }
	setUTCMilliseconds() { throw noTimezoneInformation(); }
	// getSeconds() { return super.getSeconds(); }
	setSeconds(x) { super.setSeconds(x % 86400); return this[NORMALIZE](); }
	getUTCSeconds() { throw noTimezoneInformation(); }
	setUTCSeconds() { throw noTimezoneInformation(); }
	// getMinutes() { return super.getMinutes(); }
	setMinutes(x) { super.setMinutes(x % 1440); return this[NORMALIZE](); }
	getUTCMinutes() { throw noTimezoneInformation(); }
	setUTCMinutes() { throw noTimezoneInformation(); }
	// getHours() { return super.getHours(); }
	setHours(x) { super.setHours(x % 24); return this[NORMALIZE](); }
	getUTCHours() { throw noTimezoneInformation(); }
	setUTCHours() { throw noTimezoneInformation(); }
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
	getTimezoneOffset() { throw noTimezoneInformation(); }
	toString() {
		if (Number.isNaN(super.valueOf())) return 'Invalid Date';
		return printTimeString(this, true);
	}
	toUTCString() { throw noTimezoneInformation(); }
	toGMTString() { throw noTimezoneInformation(); }
	toISOString() {
		if (Number.isNaN(super.valueOf())) throw new RangeError('Invalid time value');
		return printTimeString(this);
	}
	toDateString() { throw noDateInformation(); }
	toTimeString() { return this.toString(); }
	toLocaleDateString() { throw noDateInformation(); }
	// toLocaleTimeString() { return super.toLocaleTimeString(); }
	toLocaleString() { return super.toLocaleTimeString(); }
	toJSON() { return this.toISOString(); }
}

function printTimeString(date, ignoreMilliseconds = false) {
	const strHours = date.getHours().toString().padStart(2, '0');
	const strMinutes = date.getMinutes().toString().padStart(2, '0');
	const strSeconds = date.getSeconds().toString().padStart(2, '0');
	if (!ignoreMilliseconds) {
		const milliseconds = date.getMilliseconds();
		if (milliseconds !== 0) {
			const strMilliseconds = milliseconds.toString().padStart(3, '0');
			return `${strHours}:${strMinutes}:${strSeconds}.${strMilliseconds}`;
		}
	}
	return `${strHours}:${strMinutes}:${strSeconds}`;
}

function parseTimeString(str) {
	const hours = Number.parseInt(str.slice(0, 2), 10);
	const minutes = Number.parseInt(str.slice(3, 5), 10);
	const seconds = Number.parseInt(str.slice(6, 8), 10);
	const milliseconds = str.length > 8 ? Math.trunc(Number.parseFloat(str.slice(8), 10) * 1000) : 0;
	if (hours > 23) throw new RangeError('Hours value out of bounds');
	if (minutes > 59) throw new RangeError('Minutes value out of bounds');
	if (seconds > 60) throw new RangeError('Seconds value out of bounds');
	return { hours, minutes, seconds, milliseconds };
}

function parseLocalTime(str) {
	const { hours, minutes, seconds, milliseconds } = parseTimeString(str);
	const minutesUTC = minutes + DATE.getTimezoneOffset();
	return milliseconds + seconds * 1000 + minutesUTC * 60000 + hours * 3600000;
}

function methodNotSupported() {
	return new TypeError('Method not supported');
}

function noDateInformation() {
	return new TypeError('No date information available');
}

function noTimezoneInformation() {
	return new TypeError('No timezone information available');
}

Object.assign(exports, {
	LocalTime,
	printTimeString,
	parseTimeString,
	parseLocalTime,
});
