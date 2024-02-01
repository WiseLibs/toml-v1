'use strict';
const LOCAL_DATE = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
const MAX_DAY = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const MAX_DAY_LEAP = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

class LocalDate extends Date {
	constructor(...args) {
		if (args.length === 0) {
			super();
		} else if (args.length === 1) {
			let value = args[0];
			if (typeof value !== 'number') {
				if (value instanceof Date) {
					value = Number(new Date(value));
				} else if (typeof value === 'string') {
					if (!LOCAL_DATE.test(value)) {
						throw new Error('LocalDate string format is invalid');
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

		super.setHours(0);
		super.setMinutes(0);
		super.setSeconds(0);
		super.setMilliseconds(0);
		super.setMinutes(safeOffset(super.getTimezoneOffset()));
	}

	static parse() { throw methodNotSupported(); }
	static UTC() { throw methodNotSupported(); }
	static now() { throw methodNotSupported(); }

	// valueOf() { return super.valueOf(); }
	getTime() { throw noTimezoneInformation(); }
	setTime() { throw noTimezoneInformation(); }
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
	toString() { return super.toDateString(); }
	toUTCString() { throw noTimezoneInformation(); }
	toGMTString() { throw noTimezoneInformation(); }
	toISOString() {
		if (Number.isNaN(super.valueOf())) throw new RangeError('Invalid time value');
		return printDateString(this);
	}
	// toDateString() { return super.toDateString(); }
	toTimeString() { throw noTimeInformation(); }
	// toLocaleDateString() { return super.toLocaleDateString(); }
	toLocaleTimeString() { throw noTimeInformation(); }
	toLocaleString() { return super.toLocaleDateString(); }
	toJSON() { return this.toISOString(); }
}

function printDateString(date) {
	const year = date.getFullYear();
	if (year < 0) throw new RangeError('Negative years are not supported');
	if (year > 9999) throw new RangeError('Years beyond 9999 are not supported');
	const strYear = year.toString().padStart(4, '0');
	const strMonth = (date.getMonth() + 1).toString().padStart(2, '0');
	const strDay = date.getDate().toString().padStart(2, '0');
	return `${strYear}-${strMonth}-${strDay}`;
}

function parseDateString(str) {
	const year = Number.parseInt(str.slice(0, 4), 10);
	const month = Number.parseInt(str.slice(5, 7), 10);
	const day = Number.parseInt(str.slice(8, 10), 10);
	const maxDay = isLeapYear(year) ? MAX_DAY_LEAP[month - 1] : MAX_DAY[month - 1];
	if (month < 1 || month > 12) throw new RangeError('Month value out of bounds');
	if (day < 1 || day > maxDay) throw new RangeError('Day value out of bounds');
	return { year, month, day };
}

function parseLocalDate(str) {
	const { year, month, day } = parseDateString(str);
	const date = new Date(year, month - 1, day, 0, 0, 0, 0);
	// The Date constructor interprets 2-digit years as relative to 1900.
	if (year >= 0 && year <= 99) date.setFullYear(date.getFullYear() - 1900);
	date.setMinutes(safeOffset(date.getTimezoneOffset()));
	return date.valueOf();
}

// When constructing a LocalDate from a number or Date, we interpret the UNIX
// timestamp as representing a date *IN LOCAL TIME*. It would be intuitive to
// normalize the LocalDate's time components to 0, but that would cause
// expressions like "new LocalDate(new LocalDate())" to yield inconsistent
// results for timezones that are east of GMT. Therefore, we normalize the
// internal time components to a safe time in the middle of the day, based on
// the timezone. Note that using 12:00 is not sufficient, because some timezones
// have 14-hour offsets. This offset also allows us to use "super.toISOString()"
// to get the local date, without worrying about the timezone.
function safeOffset(timezoneOffset) {
	return Math.floor((1440 - timezoneOffset) / 2);
}

function isLeapYear(year) {
	return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function methodNotSupported() {
	return new TypeError('Method not supported');
}

function noTimeInformation() {
	return new TypeError('No time information available');
}

function noTimezoneInformation() {
	return new TypeError('No timezone information available');
}

Object.assign(exports, {
	LocalDate,
	printDateString,
	parseDateString,
	parseLocalDate,
});
