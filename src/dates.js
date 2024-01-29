'use strict';
const VALUE = Symbol();
const LOCAL_TIME = /^[0-9]{2}:[0-9]{2}:[0-9]{2}(?:\.[0-9]+)?$/;
const LOCAL_DATE = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
const LOCAL_DATE_TIME = /^[0-9]{4}-[0-9]{2}-[0-9]{2}[Tt\x20][0-9]{2}:[0-9]{2}:[0-9]{2}(?:\.[0-9]+)?$/;
const OFFSET_DATE_TIME = /^[0-9]{4}-[0-9]{2}-[0-9]{2}[Tt\x20][0-9]{2}:[0-9]{2}:[0-9]{2}(?:\.[0-9]+)?(?:[Zz]|[+-][0-9]{2}:[0-9]{2})$/;

class LocalTime {
	constructor({ hours, minutes, seconds, milliseconds } = {}) {
		// Ensure that all values are safe integers, and wrap any that overflow.
		hours = safeInteger(hours) % 24 | 0;
		minutes = safeInteger(minutes) % 1440 | 0;
		seconds = safeInteger(seconds) % 86400 | 0;
		milliseconds = safeInteger(milliseconds) % 86400000 | 0;

		// Caclulate the total number of milliseconds being represented.
		let value = milliseconds;
		value += seconds * 1000;
		value += minutes * 60000;
		value += hours * 3600000;
		value %= 86400000;
		value |= 0;

		// Normalize/wrap negative values.
		if (value < 0) {
			value += 86400000;
		}

		// Normalize/wrap the components by re-calculating them from the sum.
		let leftover = value;
		hours = leftover / 3600000 | 0;
		leftover -= hours * 3600000;
		minutes = leftover / 60000 | 0;
		leftover -= minutes * 60000;
		seconds = leftover / 1000 | 0;
		leftover -= seconds * 1000;
		milliseconds = leftover | 0;

		Object.defineProperties(this, {
			[VALUE]: { value },
			hours: { value: hours, enumerable: true },
			minutes: { value: minutes, enumerable: true },
			seconds: { value: seconds, enumerable: true },
			milliseconds: { value: milliseconds, enumerable: true },
		});
	}

	toString() {
		const hours = this.hours.toString().padStart(2, '0');
		const minutes = this.minutes.toString().padStart(2, '0');
		const seconds = this.seconds.toString().padStart(2, '0');
		if (this.milliseconds !== 0) {
			const milliseconds = this.milliseconds.toString().padStart(3, '0');
			return `${hours}:${minutes}:${seconds}.${milliseconds}`;
		} else {
			return `${hours}:${minutes}:${seconds}`;
		}
	}

	valueOf() {
		return this[VALUE];
	}

	static parse(str) {
		if (typeof str !== 'string') throw new TypeError('Expected a string');
		if (!LOCAL_TIME.test(str)) throw new TypeError('LocalTime string is invalid');
		return parseLocalTime(str);
	}
}

class LocalDate {
	constructor({ years, months, days } = {}) {
		years = safeInteger(years);
		months = safeInteger(months);
		days = safeInteger(days);

		const date = new Date(Date.UTC(years, months, days + 1));

		// The built-in Date class treats 2-digit years as relative to 1900.
		// Ours treats all options as counts, not as human-formated numbers.
		if (years >= 0 && years <= 99) {
			date.setUTCFullYear(date.getUTCFullYear() - 1900);
		}

		Object.defineProperties(this, {
			[VALUE]: { value: date.valueOf() },
			years: { value: date.getUTCFullYear(), enumerable: true },
			months: { value: date.getUTCMonth() | 0, enumerable: true },
			days: { value: date.getUTCDate() - 1 | 0, enumerable: true },
		});

		if (this.years < 0) {
			throw new RangeError('Negative years not supported');
		}
	}

	toString() {
		const years = this.years.toString().padStart(4, '0');
		const months = (this.months + 1).toString().padStart(2, '0');
		const days = (this.days + 1).toString().padStart(2, '0');
		return `${years}-${months}-${days}`;
	}

	valueOf() {
		return this[VALUE];
	}

	static parse(str) {
		if (typeof str !== 'string') throw new TypeError('Expected a string');
		if (!LOCAL_DATE.test(str)) throw new TypeError('LocalDate string is invalid');
		return parseLocalDate(str);
	}
}

class LocalDateTime {
	constructor(options = {}) {
		const localDate = new LocalDate(options);
		const localTime = new LocalTime(options);
		const date = new Date(localDate[VALUE] + localTime[VALUE]);

		Object.defineProperties(this, {
			[VALUE]: { value: date.valueOf() },
			years: { value: date.getUTCFullYear(), enumerable: true },
			months: { value: date.getUTCMonth() | 0, enumerable: true },
			days: { value: date.getUTCDate() - 1 | 0, enumerable: true },
			hours: { value: date.getUTCHours() | 0, enumerable: true },
			minutes: { value: date.getUTCMinutes() | 0, enumerable: true },
			seconds: { value: date.getUTCSeconds() | 0, enumerable: true },
			milliseconds: { value: date.getUTCMilliseconds() | 0, enumerable: true },
		});
	}

	toDateLocal() {
		return new Date(this.toString());
	}

	toDateUTC() {
		return new Date(this.valueOf());
	}

	toString() {
		const date = LocalDate.prototype.toString.call(this);
		const time = LocalTime.prototype.toString.call(this);
		return `${date}T${time}`;
	}

	valueOf() {
		return this[VALUE];
	}

	static parse(str) {
		if (typeof str !== 'string') throw new TypeError('Expected a string');
		if (!LOCAL_DATE_TIME.test(str)) throw new TypeError('LocalDateTime string is invalid');
		return parseLocalDateTime(str);
	}
}

class OffsetDateTime {
	constructor({ offset, ...options } = {}) {
		offset = safeInteger(offset);

		if (Math.abs(offset) > 6039) {
			throw new RangeError('Expected options.offset to be within [-6039, +6039]');
		}

		const date = new LocalDateTime(options).toDateUTC();
		date.setUTCMinutes(date.getUTCMinutes() + offset);

		Object.defineProperties(this, {
			[VALUE]: { value: date.valueOf() },
			years: { value: date.getUTCFullYear(), enumerable: true },
			months: { value: date.getUTCMonth() | 0, enumerable: true },
			days: { value: date.getUTCDate() - 1 | 0, enumerable: true },
			hours: { value: date.getUTCHours() | 0, enumerable: true },
			minutes: { value: date.getUTCMinutes() | 0, enumerable: true },
			seconds: { value: date.getUTCSeconds() | 0, enumerable: true },
			milliseconds: { value: date.getUTCMilliseconds() | 0, enumerable: true },
			offset: { value: offset | 0, enumerable: true },
		});

		if (this.years < 0) {
			throw new RangeError('Negative years not supported');
		}
	}

	toDate() {
		return new Date(this.valueOf());
	}

	toString() {
		const date = LocalDate.prototype.toString.call(this);
		const time = LocalTime.prototype.toString.call(this);
		if (this.offset !== 0) {
			const sign = this.offset > 0 ? '+' : '-';
			const offsetAbs = Math.abs(this.offset);
			const offsetHours = Math.floor(offsetAbs / 60).toString().padStart(2, '0');
			const offsetMinutes = (offsetAbs - offsetHours * 60).toString().padStart(2, '0');
			return `${date}T${time}${sign}${offsetHours}:${offsetMinutes}`;
		} else {
			return `${date}T${time}Z`;
		}
	}

	valueOf() {
		return this[VALUE];
	}

	static parse(str) {
		if (typeof str !== 'string') throw new TypeError('Expected a string');
		if (!OFFSET_DATE_TIME.test(str)) throw new TypeError('OffsetDateTime string is invalid');
		return parseOffsetDateTime(str);
	}
}

function parseLocalTime(str) {
	const hours = Number.parseInt(str.slice(0, 2), 10);
	const minutes = Number.parseInt(str.slice(3, 5), 10);
	const seconds = Number.parseInt(str.slice(6, 8), 10);
	const milliseconds = str.length > 8 ? Math.trunc(Number.parseFloat(str.slice(8), 10) * 1000) : 0;
	return new LocalTime({ hours, minutes, seconds, milliseconds });
}

function parseLocalDate(str) {
	const years = Number.parseInt(str.slice(0, 4), 10);
	const months = Number.parseInt(str.slice(5, 7), 10) - 1;
	const days = Number.parseInt(str.slice(8, 10), 10) - 1;
	if (months < 0) throw new RangeError('Month value cannot be 0');
	if (days < 0) throw new RangeError('Day value cannot be 0');
	return new LocalDate({ years, months, days });
}

function parseLocalDateTime(str) {
	const { years, months, days } = parseLocalDate(str.slice(0, 10));
	const { hours, minutes, seconds, milliseconds } = parseLocalTime(str.slice(11));
	return new LocalDateTime({ years, months, days, hours, minutes, seconds, milliseconds });
}

function parseOffsetDateTime(str) {
	let offset = 0;
	let localPart;
	if (str.endsWith('Z') || str.endsWith('z')) {
		localPart = str.slice(0, -1);
	} else {
		localPart = str.slice(0, -6);
		const sign = str.slice(-6, -5) === '-' ? -1 : 1;
		const offsetHours = Number.parseInt(str.slice(-5, -3), 10);
		const offsetMinutes = Number.parseInt(str.slice(-2), 10);
		offset = sign * (offsetHours * 60 + offsetMinutes);
	}
	return new OffsetDateTime({ offset, ...parseLocalDate(localPart) });
}

function safeInteger(value) {
	if (value == null) {
		return 0;
	}
	if (!Number.isInteger(value)) {
		throw new TypeError('Expected date/time value to be an integer');
	}
	if (value > Number.MAX_SAFE_INTEGER || value < Number.MIN_SAFE_INTEGER) {
		throw new RangeError('Date/time value is out of bounds');
	}
	return value;
}

Object.assign(exports, {
	LocalTime,
	LocalDate,
	LocalDateTime,
	OffsetDateTime,
	parseLocalTime,
	parseLocalDate,
	parseLocalDateTime,
	parseOffsetDateTime,
});
