'use strict';
const { expect } = require('chai');
const { OffsetDateTime } = require('..');

const OFFSET = new Date().getTimezoneOffset();
const SUFFIX = (
	(OFFSET > 0 ? '-' : '+')
	+ Math.trunc(OFFSET / 60).toString().padStart(2, '0') + ':'
	+ (OFFSET % 60).toString().padStart(2, '0')
);

describe('OffsetDateTime', function () {
	it('is a subclass of Date', function () {
		expect(new OffsetDateTime()).to.be.an.instanceof(Date);
		expect(Object.getPrototypeOf(new OffsetDateTime())).to.equal(OffsetDateTime.prototype);
		expect(Object.getPrototypeOf(OffsetDateTime)).to.equal(Date);
		expect(OffsetDateTime.prototype).to.not.equal(Date.prototype);
	});
	it('does not support static methods of Date', function () {
		expect(() => OffsetDateTime.parse('2000-01-01')).to.throw(TypeError);
		expect(() => OffsetDateTime.parse(new Date().toISOString())).to.throw(TypeError);
		expect(() => OffsetDateTime.UTC(2000)).to.throw(TypeError);
		expect(() => OffsetDateTime.now()).to.throw(TypeError);
	});
	describe('constructor', function () {
		it('uses the current date when no parameters are passed', function () {
			const before = Date.now();
			const offsetDateTime = new OffsetDateTime();
			const after = Date.now();
			expect(offsetDateTime.valueOf()).to.be.within(before, after);
		});
		it('interprets a Date argument as a UNIX timestamp', function () {
			const date = new Date(1999, 2, 24, 21, 18, 0, 42);
			expect(new OffsetDateTime(date).valueOf()).to.equal(date.valueOf());
			expect(new OffsetDateTime(new OffsetDateTime(date)).valueOf()).to.equal(date.valueOf());
		});
		it('interprets a number argument as a UNIX timestamp', function () {
			const date = new Date(1999, 2, 24, 21, 18, 0, 42);
			const offsetDateTime = new OffsetDateTime(date.valueOf());
			expect(offsetDateTime.valueOf()).to.equal(date.valueOf());
		});
		it('interprets a string argument as a local date-time string', function () {
			const date1 = new Date(Date.UTC(1999, 2, 24, 21, 18, 0, 42));
			const offsetDateTime1 = new OffsetDateTime('1999-03-24T21:18:00.042Z');
			expect(offsetDateTime1.valueOf()).to.equal(date1.valueOf());
			const date2 = new Date(Date.UTC(1999, 2, 24, 21, 18, 0, 0));
			const offsetDateTime2 = new OffsetDateTime('1999-03-24T21:18:00Z');
			expect(offsetDateTime2.valueOf()).to.equal(date2.valueOf());
			const offsetDateTime3 = new OffsetDateTime('1999-03-24t21:18:00Z');
			expect(offsetDateTime3.valueOf()).to.equal(date2.valueOf());
			const offsetDateTime4 = new OffsetDateTime('1999-03-24 21:18:00z');
			expect(offsetDateTime4.valueOf()).to.equal(date2.valueOf());
			const offsetDateTime5 = new OffsetDateTime('1999-03-24 15:18:00.042-06:00');
			expect(offsetDateTime5.valueOf()).to.equal(date1.valueOf());
			const offsetDateTime6 = new OffsetDateTime('1999-03-25t03:18:00+06:00');
			expect(offsetDateTime6.valueOf()).to.equal(date2.valueOf());
		});
		it('does not support invalid date strings', function () {
			expect(() => new OffsetDateTime('21:18:00Z')).to.throw(Error);
			expect(() => new OffsetDateTime('21:18:000')).to.throw(Error);
			expect(() => new OffsetDateTime('21:18')).to.throw(Error);
			expect(() => new OffsetDateTime('21')).to.throw(Error);
			expect(() => new OffsetDateTime('2:18:00')).to.throw(Error);
			expect(() => new OffsetDateTime('21:1:00')).to.throw(Error);
			expect(() => new OffsetDateTime('21:18:0')).to.throw(Error);
			expect(() => new OffsetDateTime('21-18-00')).to.throw(Error);
			expect(() => new OffsetDateTime('2021-18-00')).to.throw(Error);
			expect(() => new OffsetDateTime('2021-18-00T21:18:00')).to.throw(Error);
			expect(() => new OffsetDateTime('2021-18-00T21:18:00Z')).to.throw(Error);
			expect(() => new OffsetDateTime('2021-18-00T21:18:00.042')).to.throw(Error);
			expect(() => new OffsetDateTime('2021-18-00T21:18:00.042Z')).to.throw(Error);
			expect(() => new OffsetDateTime('1999-03-24Z')).to.throw(Error);
			expect(() => new OffsetDateTime('1999-03-024')).to.throw(Error);
			expect(() => new OffsetDateTime('1999-03')).to.throw(Error);
			expect(() => new OffsetDateTime('1999')).to.throw(Error);
			expect(() => new OffsetDateTime('99-03-24')).to.throw(Error);
			expect(() => new OffsetDateTime('1999-3-24')).to.throw(Error);
			expect(() => new OffsetDateTime('1999-03-4')).to.throw(Error);
			expect(() => new OffsetDateTime('1999:03:24')).to.throw(Error);
			expect(() => new OffsetDateTime('99:03:24')).to.throw(Error);
			expect(() => new OffsetDateTime('99-03-24T19:03:23')).to.throw(Error);
			expect(() => new OffsetDateTime('1999-03-24T19:03:023Z')).to.throw(Error);
			expect(() => new OffsetDateTime('1999-03-24T19:03:23')).to.throw(Error);
			expect(() => new OffsetDateTime('1999-03-24T19:03:023.042Z')).to.throw(Error);
			expect(() => new OffsetDateTime('1999-03-24T19:03:23.042')).to.throw(Error);
			expect(() => new OffsetDateTime('1999-03-24T19:03:23-06')).to.throw(Error);
			expect(() => new OffsetDateTime('1999-03-24T19:03:23-06:000')).to.throw(Error);
			expect(() => new OffsetDateTime('1999-03-24T19:03:23-06:00.0')).to.throw(Error);
			expect(() => new OffsetDateTime('1999-03-24T19:03:23-06:00Z')).to.throw(Error);
			expect(() => new OffsetDateTime('1999-03-24T19:03:23-06:00:00')).to.throw(Error);
		});
		it('does not support other argument types', function () {
			expect(() => new OffsetDateTime(undefined)).to.throw(TypeError);
			expect(() => new OffsetDateTime(null)).to.throw(TypeError);
			expect(() => new OffsetDateTime(false)).to.throw(TypeError);
			expect(() => new OffsetDateTime(true)).to.throw(TypeError);
			expect(() => new OffsetDateTime(BigInt(19))).to.throw(TypeError);
			expect(() => new OffsetDateTime(new Number(19))).to.throw(TypeError);
			expect(() => new OffsetDateTime(new String('1999-03-24T21:18:00Z'))).to.throw(TypeError);
			expect(() => new OffsetDateTime({ valueOf: () => 19 })).to.throw(TypeError);
		});
		it('does not support multiple constructor arguments', function () {
			expect(() => new OffsetDateTime('1999-03-24T21:18:00Z', {})).to.throw(RangeError);
			expect(() => new OffsetDateTime(1999, 3, 24, 21, 18, 0)).to.throw(RangeError);
			expect(() => new OffsetDateTime(Date.now(), undefined)).to.throw(RangeError);
		});
	});
	describe('supported methods', function () {
		specify('valueOf()', function () {
			expect(new OffsetDateTime('1999-03-24T21:18:00Z').valueOf()).to.equal(922310280000);
		});
		specify('getTime()', function () {
			expect(new OffsetDateTime('1999-03-24T21:18:00Z').getTime()).to.equal(922310280000);
		});
		specify('setTime()', function () {
			const offsetDateTime = new OffsetDateTime('1999-03-24T21:18:00Z');
			offsetDateTime.setTime(0);
			expect(offsetDateTime.getTime()).to.equal(0);
			offsetDateTime.setTime(922310280001);
			expect(offsetDateTime.getTime()).to.equal(922310280001);
		});
		specify('getMilliseconds()', function () {
			expect(new OffsetDateTime('1999-03-24T21:18:00' + SUFFIX).getMilliseconds()).to.equal(0);
			expect(new OffsetDateTime('1999-03-24T21:18:00.042' + SUFFIX).getMilliseconds()).to.equal(42);
		});
		specify('setMilliseconds()', function () {
			const offsetDateTime = new OffsetDateTime('1999-03-24T21:18:00.042' + SUFFIX);
			offsetDateTime.setMilliseconds(123);
			expect(offsetDateTime.getMilliseconds()).to.equal(123);
			offsetDateTime.setMilliseconds(999);
			expect(offsetDateTime.getMilliseconds()).to.equal(999);
		});
		specify('getUTCMilliseconds()', function () {
			expect(new OffsetDateTime('1999-03-24T21:18:00Z').getUTCMilliseconds()).to.equal(0);
			expect(new OffsetDateTime('1999-03-24T21:18:00.042Z').getUTCMilliseconds()).to.equal(42);
		});
		specify('setUTCMilliseconds()', function () {
			const offsetDateTime = new OffsetDateTime('1999-03-24T21:18:00.042Z');
			offsetDateTime.setUTCMilliseconds(123);
			expect(offsetDateTime.getUTCMilliseconds()).to.equal(123);
			offsetDateTime.setUTCMilliseconds(999);
			expect(offsetDateTime.getUTCMilliseconds()).to.equal(999);
		});
		specify('getSeconds()', function () {
			expect(new OffsetDateTime('1999-03-24T21:18:00.042' + SUFFIX).getSeconds()).to.equal(0);
			expect(new OffsetDateTime('1999-03-24T21:18:02' + SUFFIX).getSeconds()).to.equal(2);
			expect(new OffsetDateTime('1999-03-24T21:18:59.999' + SUFFIX).getSeconds()).to.equal(59);
		});
		specify('setSeconds()', function () {
			const offsetDateTime = new OffsetDateTime('1999-03-24T21:18:00.042' + SUFFIX);
			offsetDateTime.setSeconds(2);
			expect(offsetDateTime.getSeconds()).to.equal(2);
			offsetDateTime.setSeconds(42);
			expect(offsetDateTime.getSeconds()).to.equal(42);
		});
		specify('getUTCSeconds()', function () {
			expect(new OffsetDateTime('1999-03-24T21:18:00.042Z').getUTCSeconds()).to.equal(0);
			expect(new OffsetDateTime('1999-03-24T21:18:02Z').getUTCSeconds()).to.equal(2);
			expect(new OffsetDateTime('1999-03-24T21:18:59.999Z').getUTCSeconds()).to.equal(59);
		});
		specify('setUTCSeconds()', function () {
			const offsetDateTime = new OffsetDateTime('1999-03-24T21:18:00.042Z');
			offsetDateTime.setUTCSeconds(2);
			expect(offsetDateTime.getUTCSeconds()).to.equal(2);
			offsetDateTime.setUTCSeconds(42);
			expect(offsetDateTime.getUTCSeconds()).to.equal(42);
		});
		specify('getMinutes()', function () {
			expect(new OffsetDateTime('1999-03-24T21:00:00' + SUFFIX).getMinutes()).to.equal(0);
			expect(new OffsetDateTime('1999-03-24T21:08:00.042' + SUFFIX).getMinutes()).to.equal(8);
			expect(new OffsetDateTime('1999-03-24T21:18:00.042' + SUFFIX).getMinutes()).to.equal(18);
		});
		specify('setMinutes()', function () {
			const offsetDateTime = new OffsetDateTime('1999-03-24T21:18:00.042' + SUFFIX);
			offsetDateTime.setMinutes(2);
			expect(offsetDateTime.getMinutes()).to.equal(2);
			offsetDateTime.setMinutes(42);
			expect(offsetDateTime.getMinutes()).to.equal(42);
		});
		specify('getUTCMinutes()', function () {
			expect(new OffsetDateTime('1999-03-24T21:00:00Z').getUTCMinutes()).to.equal(0);
			expect(new OffsetDateTime('1999-03-24T21:08:00.042Z').getUTCMinutes()).to.equal(8);
			expect(new OffsetDateTime('1999-03-24T21:18:00.042Z').getUTCMinutes()).to.equal(18);
		});
		specify('setUTCMinutes()', function () {
			const offsetDateTime = new OffsetDateTime('1999-03-24T21:18:00.042Z');
			offsetDateTime.setUTCMinutes(2);
			expect(offsetDateTime.getUTCMinutes()).to.equal(2);
			offsetDateTime.setUTCMinutes(42);
			expect(offsetDateTime.getUTCMinutes()).to.equal(42);
		});
		specify('getHours()', function () {
			expect(new OffsetDateTime('1999-03-24T00:18:00' + SUFFIX).getHours()).to.equal(0);
			expect(new OffsetDateTime('1999-03-24T01:18:02.042' + SUFFIX).getHours()).to.equal(1);
			expect(new OffsetDateTime('1999-03-24T21:18:42.042' + SUFFIX).getHours()).to.equal(21);
		});
		specify('setHours()', function () {
			const offsetDateTime = new OffsetDateTime('1999-03-24T21:18:00.042' + SUFFIX);
			offsetDateTime.setHours(1);
			expect(offsetDateTime.getHours()).to.equal(1);
			offsetDateTime.setHours(21);
			expect(offsetDateTime.getHours()).to.equal(21);
		});
		specify('getUTCHours()', function () {
			expect(new OffsetDateTime('1999-03-24T00:18:00Z').getUTCHours()).to.equal(0);
			expect(new OffsetDateTime('1999-03-24T01:18:02.042Z').getUTCHours()).to.equal(1);
			expect(new OffsetDateTime('1999-03-24T21:18:42.042Z').getUTCHours()).to.equal(21);
		});
		specify('setUTCHours()', function () {
			const offsetDateTime = new OffsetDateTime('1999-03-24T21:18:00.042Z');
			offsetDateTime.setUTCHours(1);
			expect(offsetDateTime.getUTCHours()).to.equal(1);
			offsetDateTime.setUTCHours(21);
			expect(offsetDateTime.getUTCHours()).to.equal(21);
		});
		specify('getDate()', function () {
			expect(new OffsetDateTime('1999-03-04T21:18:00.042' + SUFFIX).getDate()).to.equal(4);
			expect(new OffsetDateTime('1999-03-24T21:18:00.042' + SUFFIX).getDate()).to.equal(24);
		});
		specify('setDate()', function () {
			const offsetDateTime = new OffsetDateTime('1999-03-24T21:18:00.042' + SUFFIX);
			offsetDateTime.setDate(1);
			expect(offsetDateTime.getDate()).to.equal(1);
			offsetDateTime.setDate(31);
			expect(offsetDateTime.getDate()).to.equal(31);
		});
		specify('getUTCDate()', function () {
			expect(new OffsetDateTime('1999-03-04T21:18:00.042Z').getUTCDate()).to.equal(4);
			expect(new OffsetDateTime('1999-03-24T21:18:00.042Z').getUTCDate()).to.equal(24);
		});
		specify('setUTCDate()', function () {
			const offsetDateTime = new OffsetDateTime('1999-03-24T21:18:00.042Z');
			offsetDateTime.setUTCDate(1);
			expect(offsetDateTime.getUTCDate()).to.equal(1);
			offsetDateTime.setUTCDate(31);
			expect(offsetDateTime.getUTCDate()).to.equal(31);
		});
		specify('getMonth()', function () {
			expect(new OffsetDateTime('1999-01-24T21:18:00.042' + SUFFIX).getMonth()).to.equal(0);
			expect(new OffsetDateTime('1999-03-24T21:18:00.042' + SUFFIX).getMonth()).to.equal(2);
			expect(new OffsetDateTime('1999-12-24T21:18:00.042' + SUFFIX).getMonth()).to.equal(11);
		});
		specify('setMonth()', function () {
			const offsetDateTime = new OffsetDateTime('1999-03-24T21:18:00.042' + SUFFIX);
			offsetDateTime.setMonth(0);
			expect(offsetDateTime.getMonth()).to.equal(0);
			offsetDateTime.setMonth(2);
			expect(offsetDateTime.getMonth()).to.equal(2);
			offsetDateTime.setMonth(11);
			expect(offsetDateTime.getMonth()).to.equal(11);
		});
		specify('getUTCMonth()', function () {
			expect(new OffsetDateTime('1999-01-24T21:18:00.042Z').getUTCMonth()).to.equal(0);
			expect(new OffsetDateTime('1999-03-24T21:18:00.042Z').getUTCMonth()).to.equal(2);
			expect(new OffsetDateTime('1999-12-24T21:18:00.042Z').getUTCMonth()).to.equal(11);
		});
		specify('setUTCMonth()', function () {
			const offsetDateTime = new OffsetDateTime('1999-03-24T21:18:00.042Z');
			offsetDateTime.setUTCMonth(0);
			expect(offsetDateTime.getUTCMonth()).to.equal(0);
			offsetDateTime.setUTCMonth(2);
			expect(offsetDateTime.getUTCMonth()).to.equal(2);
			offsetDateTime.setUTCMonth(11);
			expect(offsetDateTime.getUTCMonth()).to.equal(11);
		});
		specify('getYear()', function () {
			expect(new OffsetDateTime('1900-03-24T21:18:00.042' + SUFFIX).getYear()).to.equal(0);
			expect(new OffsetDateTime('1902-12-24T21:18:00.042' + SUFFIX).getYear()).to.equal(2);
			expect(new OffsetDateTime('1999-01-24T21:18:00.042' + SUFFIX).getYear()).to.equal(99);
		});
		specify('setYear()', function () {
			const offsetDateTime = new OffsetDateTime('1999-03-24T21:18:00.042' + SUFFIX);
			offsetDateTime.setYear(0);
			expect(offsetDateTime.getYear()).to.equal(0);
			offsetDateTime.setYear(2);
			expect(offsetDateTime.getYear()).to.equal(2);
			offsetDateTime.setYear(11);
			expect(offsetDateTime.getYear()).to.equal(11);
		});
		specify('getFullYear()', function () {
			expect(new OffsetDateTime('0000-01-24T21:18:00.042' + SUFFIX).getFullYear()).to.equal(0);
			expect(new OffsetDateTime('0099-01-24T21:18:00.042' + SUFFIX).getFullYear()).to.equal(99);
			expect(new OffsetDateTime('1999-03-24T21:18:00.042' + SUFFIX).getFullYear()).to.equal(1999);
			expect(new OffsetDateTime('2024-12-24T21:18:00.042' + SUFFIX).getFullYear()).to.equal(2024);
		});
		specify('setFullYear()', function () {
			const offsetDateTime = new OffsetDateTime('1999-03-24T21:18:00.042' + SUFFIX);
			offsetDateTime.setFullYear(0);
			expect(offsetDateTime.getFullYear()).to.equal(0);
			offsetDateTime.setFullYear(99);
			expect(offsetDateTime.getFullYear()).to.equal(99);
			offsetDateTime.setFullYear(1999);
			expect(offsetDateTime.getFullYear()).to.equal(1999);
			offsetDateTime.setFullYear(2024);
			expect(offsetDateTime.getFullYear()).to.equal(2024);
		});
		specify('getUTCFullYear()', function () {
			expect(new OffsetDateTime('0000-01-24T21:18:00.042Z').getUTCFullYear()).to.equal(0);
			expect(new OffsetDateTime('0099-01-24T21:18:00.042Z').getUTCFullYear()).to.equal(99);
			expect(new OffsetDateTime('1999-03-24T21:18:00.042Z').getUTCFullYear()).to.equal(1999);
			expect(new OffsetDateTime('2024-12-24T21:18:00.042Z').getUTCFullYear()).to.equal(2024);
		});
		specify('setUTCFullYear()', function () {
			const offsetDateTime = new OffsetDateTime('1999-03-24T21:18:00.042Z');
			offsetDateTime.setUTCFullYear(0);
			expect(offsetDateTime.getUTCFullYear()).to.equal(0);
			offsetDateTime.setUTCFullYear(99);
			expect(offsetDateTime.getUTCFullYear()).to.equal(99);
			offsetDateTime.setUTCFullYear(1999);
			expect(offsetDateTime.getUTCFullYear()).to.equal(1999);
			offsetDateTime.setUTCFullYear(2024);
			expect(offsetDateTime.getUTCFullYear()).to.equal(2024);
		});
		specify('getDay()', function () {
			expect(new OffsetDateTime('1999-03-24T21:18:00.042' + SUFFIX).getDay()).to.equal(3);
		});
		specify('getUTCDay()', function () {
			expect(new OffsetDateTime('1999-03-24T21:18:00.042Z').getUTCDay()).to.equal(3);
		});
		specify('getTimezoneOffset()', function () {
			expect(new OffsetDateTime('1999-03-24T21:18:00.042Z').getTimezoneOffset()).to.equal(new Date().getTimezoneOffset());
			expect(new OffsetDateTime('1999-03-24T21:18:00.042' + SUFFIX).getTimezoneOffset()).to.equal(new Date().getTimezoneOffset());
		});
		specify('toString()', function () {
			expect(new OffsetDateTime(NaN).toString()).to.equal('Invalid Date');
			expect(new OffsetDateTime('0099-03-24T21:18:00.042Z').toString()).to.equal(new Date('0099-03-24T21:18:00.042Z').toString());
			expect(new OffsetDateTime('1999-03-24T21:18:00.042' + SUFFIX).toString()).to.equal(new Date('1999-03-24T21:18:00.042' + SUFFIX).toString());
			expect(new OffsetDateTime('1999-03-24T21:18:00Z').toString()).to.equal(new Date('1999-03-24T21:18:00Z').toString());
			expect(new OffsetDateTime(new Date(1999, 2, 24, 23, 59, 59, 999)).toString()).to.equal(new Date(1999, 2, 24, 23, 59, 59, 999).toString());
		});
		specify('toUTCString()', function () {
			expect(new OffsetDateTime(NaN).toUTCString()).to.equal('Invalid Date');
			expect(new OffsetDateTime('0099-03-24T21:18:00.042Z').toUTCString()).to.equal(new Date('0099-03-24T21:18:00.042Z').toUTCString());
			expect(new OffsetDateTime('1999-03-24T21:18:00.042' + SUFFIX).toUTCString()).to.equal(new Date('1999-03-24T21:18:00.042' + SUFFIX).toUTCString());
			expect(new OffsetDateTime('1999-03-24T21:18:00Z').toUTCString()).to.equal(new Date('1999-03-24T21:18:00Z').toUTCString());
			expect(new OffsetDateTime(new Date(1999, 2, 24, 23, 59, 59, 999)).toUTCString()).to.equal(new Date(1999, 2, 24, 23, 59, 59, 999).toUTCString());
		});
		specify('toGMTString()', function () {
			expect(new OffsetDateTime(NaN).toGMTString()).to.equal('Invalid Date');
			expect(new OffsetDateTime('0099-03-24T21:18:00.042Z').toGMTString()).to.equal(new Date('0099-03-24T21:18:00.042Z').toGMTString());
			expect(new OffsetDateTime('1999-03-24T21:18:00.042' + SUFFIX).toGMTString()).to.equal(new Date('1999-03-24T21:18:00.042' + SUFFIX).toGMTString());
			expect(new OffsetDateTime('1999-03-24T21:18:00Z').toGMTString()).to.equal(new Date('1999-03-24T21:18:00Z').toGMTString());
			expect(new OffsetDateTime(new Date(1999, 2, 24, 23, 59, 59, 999)).toGMTString()).to.equal(new Date(1999, 2, 24, 23, 59, 59, 999).toGMTString());
		});
		specify('toISOString()', function () {
			expect(() => new OffsetDateTime(NaN).toISOString()).to.throw(RangeError);
			expect(() => new OffsetDateTime(new Date(-1000, 0)).toISOString()).to.throw(RangeError);
			expect(() => new OffsetDateTime(new Date(10000, 0)).toISOString()).to.throw(RangeError);
			expect(new OffsetDateTime('0099-03-24T21:18:00.042Z').toISOString()).to.equal('0099-03-24T21:18:00.042Z');
			expect(new OffsetDateTime('1999-03-24T21:18:00.042Z').toISOString()).to.equal('1999-03-24T21:18:00.042Z');
			expect(new OffsetDateTime(new Date(Date.UTC(1999, 2, 24, 23, 59, 59, 999))).toISOString()).to.equal('1999-03-24T23:59:59.999Z');
			const offsetDateTime1 = new OffsetDateTime('0099-03-24T21:18:00.042' + SUFFIX);
			const offsetDateTime2 = new OffsetDateTime('1999-03-24T21:18:00.042' + SUFFIX);
			expect(offsetDateTime1.toISOString()).to.equal('0099-03-24T21:18:00.042' + SUFFIX);
			expect(offsetDateTime2.toISOString()).to.equal('1999-03-24T21:18:00.042' + SUFFIX);
		});
		specify('toDateString()', function () {
			expect(new OffsetDateTime(NaN).toDateString()).to.equal('Invalid Date');
			expect(new OffsetDateTime('0099-03-24T21:18:00.042Z').toDateString()).to.equal(new Date('0099-03-24T21:18:00.042Z').toDateString());
			expect(new OffsetDateTime('1999-03-24T21:18:00.042' + SUFFIX).toDateString()).to.equal(new Date('1999-03-24T21:18:00.042' + SUFFIX).toDateString());
			expect(new OffsetDateTime('1999-03-24T21:18:00Z').toDateString()).to.equal(new Date('1999-03-24T21:18:00Z').toDateString());
			expect(new OffsetDateTime(new Date(1999, 2, 24, 23, 59, 59, 999)).toDateString()).to.equal(new Date(1999, 2, 24, 23, 59, 59, 999).toDateString());
		});
		specify('toTimeString()', function () {
			expect(new OffsetDateTime(NaN).toTimeString()).to.equal('Invalid Date');
			expect(new OffsetDateTime('0099-03-24T21:18:00.042Z').toTimeString()).to.equal(new Date('0099-03-24T21:18:00.042Z').toTimeString());
			expect(new OffsetDateTime('1999-03-24T21:18:00.042' + SUFFIX).toTimeString()).to.equal(new Date('1999-03-24T21:18:00.042' + SUFFIX).toTimeString());
			expect(new OffsetDateTime('1999-03-24T21:18:00Z').toTimeString()).to.equal(new Date('1999-03-24T21:18:00Z').toTimeString());
			expect(new OffsetDateTime(new Date(1999, 2, 24, 23, 59, 59, 999)).toTimeString()).to.equal(new Date(1999, 2, 24, 23, 59, 59, 999).toTimeString());
		});
		specify('toLocaleDateString()', function () {
			expect(new OffsetDateTime(NaN).toLocaleDateString()).to.equal('Invalid Date');
			expect(new OffsetDateTime('1999-03-24T21:18:00.042' + SUFFIX).toLocaleDateString())
				.to.equal(new Date(1999, 2, 24, 21, 18, 0, 42).toLocaleDateString());
		});
		specify('toLocaleTimeString()', function () {
			expect(new OffsetDateTime(NaN).toLocaleTimeString()).to.equal('Invalid Date');
			expect(new OffsetDateTime('1999-03-24T21:18:00.042' + SUFFIX).toLocaleTimeString())
				.to.equal(new Date(1999, 2, 24, 21, 18, 0, 42).toLocaleTimeString());
		});
		specify('toLocaleString()', function () {
			expect(new OffsetDateTime(NaN).toLocaleString()).to.equal('Invalid Date');
			expect(new OffsetDateTime('1999-03-24T21:18:00.042' + SUFFIX).toLocaleString())
				.to.equal(new Date(1999, 2, 24, 21, 18, 0, 42).toLocaleString());
		});
		specify('toJSON()', function () {
			expect(() => new OffsetDateTime(NaN).toJSON()).to.throw(RangeError);
			expect(() => new OffsetDateTime(new Date(-1000, 0)).toJSON()).to.throw(RangeError);
			expect(() => new OffsetDateTime(new Date(10000, 0)).toJSON()).to.throw(RangeError);
			expect(new OffsetDateTime('0099-03-24T21:18:00.042Z').toJSON()).to.equal('0099-03-24T21:18:00.042Z');
			expect(new OffsetDateTime('1999-03-24T21:18:00.042Z').toJSON()).to.equal('1999-03-24T21:18:00.042Z');
			expect(new OffsetDateTime(new Date(Date.UTC(1999, 2, 24, 23, 59, 59, 999))).toJSON()).to.equal('1999-03-24T23:59:59.999Z');
			const offsetDateTime1 = new OffsetDateTime('0099-03-24T21:18:00.042' + SUFFIX);
			const offsetDateTime2 = new OffsetDateTime('1999-03-24T21:18:00.042' + SUFFIX);
			expect(offsetDateTime1.toJSON()).to.equal('0099-03-24T21:18:00.042' + SUFFIX);
			expect(offsetDateTime2.toJSON()).to.equal('1999-03-24T21:18:00.042' + SUFFIX);
		});
	});
	describe('subclass methods', function () {
		specify('getOriginalTimezoneOffset()', function () {
			const offsetDateTime1 = new OffsetDateTime('0099-03-24T21:18:00.042Z');
			expect(offsetDateTime1.getOriginalTimezoneOffset()).to.equal(0);
			const offsetDateTime2 = new OffsetDateTime('0099-03-24T21:18:00.042-06:00');
			expect(offsetDateTime2.getOriginalTimezoneOffset()).to.equal(360);
		});
		specify('setOriginalTimezoneOffset()', function () {
			const offsetDateTime = new OffsetDateTime('0099-03-24T21:18:00.042Z');
			offsetDateTime.setOriginalTimezoneOffset(360);
			expect(offsetDateTime.getOriginalTimezoneOffset()).to.equal(360);
			expect(offsetDateTime.toISOString()).to.equal('0099-03-24T15:18:00.042-06:00');
			offsetDateTime.setOriginalTimezoneOffset(-360);
			expect(offsetDateTime.getOriginalTimezoneOffset()).to.equal(-360);
			expect(offsetDateTime.toISOString()).to.equal('0099-03-25T03:18:00.042+06:00');
			offsetDateTime.setOriginalTimezoneOffset(0);
			expect(offsetDateTime.getOriginalTimezoneOffset()).to.equal(0);
			expect(offsetDateTime.toISOString()).to.equal('0099-03-24T21:18:00.042Z');
		});
	});
	specify('stress test', function () {
		this.slow(5000);
		this.timeout(10000);
		for (let year = 1970; year <= 2050; ++year) {
			for (let month = 0; month <= 11; ++month) {
				for (let day = 1; day <= 31; ++day) {
					const date = new Date(year, month, day);
					const offsetDateTime = new OffsetDateTime(date);
					expect(offsetDateTime.getUTCFullYear()).to.equal(date.getUTCFullYear());
					expect(offsetDateTime.getUTCMonth()).to.equal(date.getUTCMonth());
					expect(offsetDateTime.getUTCDate()).to.equal(date.getUTCDate());
					expect(offsetDateTime.getUTCHours()).to.equal(date.getUTCHours());
					expect(offsetDateTime.getUTCMinutes()).to.equal(date.getUTCMinutes());
					expect(offsetDateTime.getUTCSeconds()).to.equal(date.getUTCSeconds());
					expect(offsetDateTime.getUTCMilliseconds()).to.equal(date.getUTCMilliseconds());
					expect(offsetDateTime.toISOString()).to.equal(
						offsetDateTime.getUTCFullYear() + '-'
						+ (offsetDateTime.getUTCMonth() + 1).toString().padStart(2, '0') + '-'
						+ offsetDateTime.getUTCDate().toString().padStart(2, '0') + 'T'
						+ offsetDateTime.getUTCHours().toString().padStart(2, '0') + ':'
						+ offsetDateTime.getUTCMinutes().toString().padStart(2, '0') + ':'
						+ offsetDateTime.getUTCSeconds().toString().padStart(2, '0') + '.'
						+ offsetDateTime.getUTCMilliseconds().toString().padStart(3, '0') + 'Z'
					);
				}
			}
		}
	});
});
