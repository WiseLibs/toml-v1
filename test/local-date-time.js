'use strict';
const { expect } = require('chai');
const { LocalDateTime } = require('..');

describe('LocalDateTime', function () {
	it('is a subclass of Date', function () {
		expect(new LocalDateTime()).to.be.an.instanceof(Date);
		expect(Object.getPrototypeOf(new LocalDateTime())).to.equal(LocalDateTime.prototype);
		expect(Object.getPrototypeOf(LocalDateTime)).to.equal(Date);
		expect(LocalDateTime.prototype).to.not.equal(Date.prototype);
	});
	it('does not support static methods of Date', function () {
		expect(() => LocalDateTime.parse('2000-01-01')).to.throw(TypeError);
		expect(() => LocalDateTime.parse(new Date().toISOString())).to.throw(TypeError);
		expect(() => LocalDateTime.UTC(2000)).to.throw(TypeError);
		expect(() => LocalDateTime.now()).to.throw(TypeError);
	});
	it('does not support timezone-related methods', function () {
		const localDateTime = new LocalDateTime();
		expect(() => localDateTime.getTime()).to.throw(TypeError);
		expect(() => localDateTime.setTime(1)).to.throw(TypeError);
		expect(() => localDateTime.getUTCMilliseconds()).to.throw(TypeError);
		expect(() => localDateTime.setUTCMilliseconds(1)).to.throw(TypeError);
		expect(() => localDateTime.getUTCSeconds()).to.throw(TypeError);
		expect(() => localDateTime.setUTCSeconds(1)).to.throw(TypeError);
		expect(() => localDateTime.getUTCMinutes()).to.throw(TypeError);
		expect(() => localDateTime.setUTCMinutes(1)).to.throw(TypeError);
		expect(() => localDateTime.getUTCHours()).to.throw(TypeError);
		expect(() => localDateTime.setUTCHours(1)).to.throw(TypeError);
		expect(() => localDateTime.getUTCDate()).to.throw(TypeError);
		expect(() => localDateTime.setUTCDate(1)).to.throw(TypeError);
		expect(() => localDateTime.getUTCMonth()).to.throw(TypeError);
		expect(() => localDateTime.setUTCMonth(1)).to.throw(TypeError);
		expect(() => localDateTime.getUTCFullYear()).to.throw(TypeError);
		expect(() => localDateTime.setUTCFullYear(1)).to.throw(TypeError);
		expect(() => localDateTime.getUTCDay()).to.throw(TypeError);
		expect(() => localDateTime.getTimezoneOffset()).to.throw(TypeError);
		expect(() => localDateTime.toUTCString()).to.throw(TypeError);
		expect(() => localDateTime.toGMTString()).to.throw(TypeError);
	});
	describe('constructor', function () {
		it('uses the current date when no parameters are passed', function () {
			const before = Date.now();
			const localDateTime = new LocalDateTime();
			const after = Date.now();
			expect(new Date(localDateTime).valueOf()).to.be.within(before, after);
		});
		it('interprets a Date argument as a UNIX timestamp', function () {
			const date = new Date(1999, 2, 24, 21, 18, 0, 42);
			expect(new Date(new LocalDateTime(date)).valueOf()).to.equal(date.valueOf());
			expect(new Date(new LocalDateTime(new LocalDateTime(date))).valueOf()).to.equal(date.valueOf());
		});
		it('interprets a number argument as a UNIX timestamp', function () {
			const date = new Date(1999, 2, 24, 21, 18, 0, 42);
			const localDateTime = new LocalDateTime(date.valueOf());
			expect(new Date(localDateTime).valueOf()).to.equal(date.valueOf());
		});
		it('interprets a string argument as a local date-time string', function () {
			const date1 = new Date(1999, 2, 24, 21, 18, 0, 42);
			const localDateTime1 = new LocalDateTime('1999-03-24T21:18:00.042');
			expect(new Date(localDateTime1).valueOf()).to.equal(date1.valueOf());
			const date2 = new Date(1999, 2, 24, 21, 18, 0, 0);
			const localDateTime2 = new LocalDateTime('1999-03-24T21:18:00');
			expect(new Date(localDateTime2).valueOf()).to.equal(date2.valueOf());
			const date3 = new Date(1999, 2, 24, 21, 18, 0, 0);
			const localDateTime3 = new LocalDateTime('1999-03-24t21:18:00');
			expect(new Date(localDateTime3).valueOf()).to.equal(date3.valueOf());
			const date4 = new Date(1999, 2, 24, 21, 18, 0, 0);
			const localDateTime4 = new LocalDateTime('1999-03-24 21:18:00');
			expect(new Date(localDateTime4).valueOf()).to.equal(date4.valueOf());
		});
		it('does not support invalid date strings', function () {
			expect(() => new LocalDateTime('21:18:00Z')).to.throw(Error);
			expect(() => new LocalDateTime('21:18:000')).to.throw(Error);
			expect(() => new LocalDateTime('21:18')).to.throw(Error);
			expect(() => new LocalDateTime('21')).to.throw(Error);
			expect(() => new LocalDateTime('2:18:00')).to.throw(Error);
			expect(() => new LocalDateTime('21:1:00')).to.throw(Error);
			expect(() => new LocalDateTime('21:18:0')).to.throw(Error);
			expect(() => new LocalDateTime('21-18-00')).to.throw(Error);
			expect(() => new LocalDateTime('2021-18-00')).to.throw(Error);
			expect(() => new LocalDateTime('2021-18-00T21:18:00')).to.throw(Error);
			expect(() => new LocalDateTime('2021-18-00T21:18:00Z')).to.throw(Error);
			expect(() => new LocalDateTime('2021-18-00T21:18:00.042')).to.throw(Error);
			expect(() => new LocalDateTime('2021-18-00T21:18:00.042Z')).to.throw(Error);
			expect(() => new LocalDateTime('1999-03-24Z')).to.throw(Error);
			expect(() => new LocalDateTime('1999-03-024')).to.throw(Error);
			expect(() => new LocalDateTime('1999-03')).to.throw(Error);
			expect(() => new LocalDateTime('1999')).to.throw(Error);
			expect(() => new LocalDateTime('99-03-24')).to.throw(Error);
			expect(() => new LocalDateTime('1999-3-24')).to.throw(Error);
			expect(() => new LocalDateTime('1999-03-4')).to.throw(Error);
			expect(() => new LocalDateTime('1999:03:24')).to.throw(Error);
			expect(() => new LocalDateTime('99:03:24')).to.throw(Error);
			expect(() => new LocalDateTime('99-03-24T19:03:23')).to.throw(Error);
			expect(() => new LocalDateTime('1999-03-24T19:03:023')).to.throw(Error);
			expect(() => new LocalDateTime('1999-03-24T19:03:23Z')).to.throw(Error);
			expect(() => new LocalDateTime('1999-03-24T19:03:023.042')).to.throw(Error);
			expect(() => new LocalDateTime('1999-03-24T19:03:23.042Z')).to.throw(Error);
			expect(() => new LocalDateTime('1999-03-24T19:03:23-06:00')).to.throw(Error);
		});
		it('does not support other argument types', function () {
			expect(() => new LocalDateTime(undefined)).to.throw(TypeError);
			expect(() => new LocalDateTime(null)).to.throw(TypeError);
			expect(() => new LocalDateTime(false)).to.throw(TypeError);
			expect(() => new LocalDateTime(true)).to.throw(TypeError);
			expect(() => new LocalDateTime(BigInt(19))).to.throw(TypeError);
			expect(() => new LocalDateTime(new Number(19))).to.throw(TypeError);
			expect(() => new LocalDateTime(new String('1999-03-24T21:18:00'))).to.throw(TypeError);
			expect(() => new LocalDateTime({ valueOf: () => 19 })).to.throw(TypeError);
		});
		it('does not support multiple constructor arguments', function () {
			expect(() => new LocalDateTime('1999-03-24T21:18:00', {})).to.throw(RangeError);
			expect(() => new LocalDateTime(1999, 3, 24, 21, 18, 0)).to.throw(RangeError);
			expect(() => new LocalDateTime(Date.now(), undefined)).to.throw(RangeError);
		});
	});
	describe('supported methods', function () {
		specify('valueOf()', function () {
			expect(new LocalDateTime('1999-03-24T21:18:00').valueOf()).to.equal(new Date('1999-03-24T21:18:00').valueOf());
		});
		specify('getMilliseconds()', function () {
			expect(new LocalDateTime('1999-03-24T21:18:00').getMilliseconds()).to.equal(0);
			expect(new LocalDateTime('1999-03-24T21:18:00.042').getMilliseconds()).to.equal(42);
		});
		specify('setMilliseconds()', function () {
			const localDateTime = new LocalDateTime('1999-03-24T21:18:00.042');
			localDateTime.setMilliseconds(123);
			expect(localDateTime.getMilliseconds()).to.equal(123);
			localDateTime.setMilliseconds(999);
			expect(localDateTime.getMilliseconds()).to.equal(999);
		});
		specify('getSeconds()', function () {
			expect(new LocalDateTime('1999-03-24T21:18:00.042').getSeconds()).to.equal(0);
			expect(new LocalDateTime('1999-03-24T21:18:02').getSeconds()).to.equal(2);
			expect(new LocalDateTime('1999-03-24T21:18:59.999').getSeconds()).to.equal(59);
		});
		specify('setSeconds()', function () {
			const localDateTime = new LocalDateTime('1999-03-24T21:18:00.042');
			localDateTime.setSeconds(2);
			expect(localDateTime.getSeconds()).to.equal(2);
			localDateTime.setSeconds(42);
			expect(localDateTime.getSeconds()).to.equal(42);
		});
		specify('getMinutes()', function () {
			expect(new LocalDateTime('1999-03-24T21:00:00').getMinutes()).to.equal(0);
			expect(new LocalDateTime('1999-03-24T21:08:00.042').getMinutes()).to.equal(8);
			expect(new LocalDateTime('1999-03-24T21:18:00.042').getMinutes()).to.equal(18);
		});
		specify('setMinutes()', function () {
			const localDateTime = new LocalDateTime('1999-03-24T21:18:00.042');
			localDateTime.setMinutes(2);
			expect(localDateTime.getMinutes()).to.equal(2);
			localDateTime.setMinutes(42);
			expect(localDateTime.getMinutes()).to.equal(42);
		});
		specify('getHours()', function () {
			expect(new LocalDateTime('1999-03-24T00:18:00').getHours()).to.equal(0);
			expect(new LocalDateTime('1999-03-24T01:18:02.042').getHours()).to.equal(1);
			expect(new LocalDateTime('1999-03-24T21:18:42.042').getHours()).to.equal(21);
		});
		specify('setHours()', function () {
			const localDateTime = new LocalDateTime('1999-03-24T21:18:00.042');
			localDateTime.setHours(1);
			expect(localDateTime.getHours()).to.equal(1);
			localDateTime.setHours(21);
			expect(localDateTime.getHours()).to.equal(21);
		});
		specify('getDate()', function () {
			expect(new LocalDateTime('1999-03-04T21:18:00.042').getDate()).to.equal(4);
			expect(new LocalDateTime('1999-03-24T21:18:00.042').getDate()).to.equal(24);
		});
		specify('setDate()', function () {
			const localDateTime = new LocalDateTime('1999-03-24T21:18:00.042');
			localDateTime.setDate(1);
			expect(localDateTime.getDate()).to.equal(1);
			localDateTime.setDate(31);
			expect(localDateTime.getDate()).to.equal(31);
		});
		specify('getMonth()', function () {
			expect(new LocalDateTime('1999-01-24T21:18:00.042').getMonth()).to.equal(0);
			expect(new LocalDateTime('1999-03-24T21:18:00.042').getMonth()).to.equal(2);
			expect(new LocalDateTime('1999-12-24T21:18:00.042').getMonth()).to.equal(11);
		});
		specify('setMonth()', function () {
			const localDateTime = new LocalDateTime('1999-03-24T21:18:00.042');
			localDateTime.setMonth(0);
			expect(localDateTime.getMonth()).to.equal(0);
			localDateTime.setMonth(2);
			expect(localDateTime.getMonth()).to.equal(2);
			localDateTime.setMonth(11);
			expect(localDateTime.getMonth()).to.equal(11);
		});
		specify('getYear()', function () {
			expect(new LocalDateTime('1900-03-24T21:18:00.042').getYear()).to.equal(0);
			expect(new LocalDateTime('1902-12-24T21:18:00.042').getYear()).to.equal(2);
			expect(new LocalDateTime('1999-01-24T21:18:00.042').getYear()).to.equal(99);
		});
		specify('setYear()', function () {
			const localDateTime = new LocalDateTime('1999-03-24T21:18:00.042');
			localDateTime.setYear(0);
			expect(localDateTime.getYear()).to.equal(0);
			localDateTime.setYear(2);
			expect(localDateTime.getYear()).to.equal(2);
			localDateTime.setYear(11);
			expect(localDateTime.getYear()).to.equal(11);
		});
		specify('getFullYear()', function () {
			expect(new LocalDateTime('0000-01-24T21:18:00.042').getFullYear()).to.equal(0);
			expect(new LocalDateTime('0099-01-24T21:18:00.042').getFullYear()).to.equal(99);
			expect(new LocalDateTime('1999-03-24T21:18:00.042').getFullYear()).to.equal(1999);
			expect(new LocalDateTime('2024-12-24T21:18:00.042').getFullYear()).to.equal(2024);
		});
		specify('setFullYear()', function () {
			const localDateTime = new LocalDateTime('1999-03-24T21:18:00.042');
			localDateTime.setFullYear(0);
			expect(localDateTime.getFullYear()).to.equal(0);
			localDateTime.setFullYear(99);
			expect(localDateTime.getFullYear()).to.equal(99);
			localDateTime.setFullYear(1999);
			expect(localDateTime.getFullYear()).to.equal(1999);
			localDateTime.setFullYear(2024);
			expect(localDateTime.getFullYear()).to.equal(2024);
		});
		specify('getDay()', function () {
			expect(new LocalDateTime('1999-03-24T21:18:00.042').getDay()).to.equal(3);
		});
		specify('toString()', function () {
			expect(new LocalDateTime(NaN).toString()).to.equal('Invalid Date');
			expect(new LocalDateTime('0099-03-24T21:18:00.042').toString()).to.equal('Tue Mar 24 0099 21:18:00');
			expect(new LocalDateTime('1999-03-24T21:18:00.042').toString()).to.equal('Wed Mar 24 1999 21:18:00');
			expect(new LocalDateTime('1999-03-24T21:18:00').toString()).to.equal('Wed Mar 24 1999 21:18:00');
			expect(new LocalDateTime(new Date(1999, 2, 24, 23, 59, 59, 999)).toString()).to.equal('Wed Mar 24 1999 23:59:59');
		});
		specify('toISOString()', function () {
			expect(() => new LocalDateTime(NaN).toISOString()).to.throw(RangeError);
			expect(() => new LocalDateTime(new Date(-1000, 0)).toISOString()).to.throw(RangeError);
			expect(() => new LocalDateTime(new Date(10000, 0)).toISOString()).to.throw(RangeError);
			expect(new LocalDateTime('0099-03-24T21:18:00.042').toISOString()).to.equal('0099-03-24T21:18:00.042');
			expect(new LocalDateTime('1999-03-24T21:18:00.042').toISOString()).to.equal('1999-03-24T21:18:00.042');
			expect(new LocalDateTime('1999-03-24T21:18:00').toISOString()).to.equal('1999-03-24T21:18:00');
			expect(new LocalDateTime(new Date(1999, 2, 24, 23, 59, 59, 999)).toISOString()).to.equal('1999-03-24T23:59:59.999');
		});
		specify('toDateString()', function () {
			expect(new LocalDateTime(NaN).toDateString()).to.equal('Invalid Date');
			expect(new LocalDateTime('0099-03-24T21:18:00.042').toDateString()).to.equal('Tue Mar 24 0099');
			expect(new LocalDateTime('1999-03-24T21:18:00.042').toDateString()).to.equal('Wed Mar 24 1999');
			expect(new LocalDateTime(new Date(1999, 2, 24, 23, 59, 59, 999)).toDateString()).to.equal('Wed Mar 24 1999');
		});
		specify('toTimeString()', function () {
			expect(new LocalDateTime(NaN).toTimeString()).to.equal('Invalid Date');
			expect(new LocalDateTime('1999-03-24T21:18:00').toTimeString()).to.equal('21:18:00');
			expect(new LocalDateTime('1999-03-24T21:18:00.042').toTimeString()).to.equal('21:18:00');
			expect(new LocalDateTime('1999-03-24T21:18:00.999').toTimeString()).to.equal('21:18:00');
			expect(new LocalDateTime(new Date(1999, 2, 24, 21, 18, 1, 42)).toTimeString()).to.equal('21:18:01');
		});
		specify('toLocaleDateString()', function () {
			expect(new LocalDateTime(NaN).toLocaleDateString()).to.equal('Invalid Date');
			expect(new LocalDateTime('1999-03-24T21:18:00.042').toLocaleDateString())
				.to.equal(new Date(1999, 2, 24, 21, 18, 0, 42).toLocaleDateString());
		});
		specify('toLocaleTimeString()', function () {
			expect(new LocalDateTime(NaN).toLocaleTimeString()).to.equal('Invalid Date');
			expect(new LocalDateTime('1999-03-24T21:18:00.042').toLocaleTimeString())
				.to.equal(new Date(1999, 2, 24, 21, 18, 0, 42).toLocaleTimeString());
		});
		specify('toLocaleString()', function () {
			expect(new LocalDateTime(NaN).toLocaleString()).to.equal('Invalid Date');
			expect(new LocalDateTime('1999-03-24T21:18:00.042').toLocaleString())
				.to.equal(new Date(1999, 2, 24, 21, 18, 0, 42).toLocaleString());
		});
		specify('toJSON()', function () {
			expect(() => new LocalDateTime(NaN).toJSON()).to.throw(RangeError);
			expect(() => new LocalDateTime(new Date(-1000, 0)).toJSON()).to.throw(RangeError);
			expect(() => new LocalDateTime(new Date(10000, 0)).toJSON()).to.throw(RangeError);
			expect(new LocalDateTime('0099-03-24T21:18:00.042').toJSON()).to.equal('0099-03-24T21:18:00.042');
			expect(new LocalDateTime('1999-03-24T21:18:00.042').toJSON()).to.equal('1999-03-24T21:18:00.042');
			expect(new LocalDateTime('1999-03-24T21:18:00').toJSON()).to.equal('1999-03-24T21:18:00');
			expect(new LocalDateTime(new Date(1999, 2, 24, 23, 59, 59, 999)).toJSON()).to.equal('1999-03-24T23:59:59.999');
		});
	});
	specify('stress test', function () {
		this.slow(5000);
		this.timeout(10000);
		for (let year = 1970; year <= 2050; ++year) {
			for (let month = 0; month <= 11; ++month) {
				for (let day = 1; day <= 31; ++day) {
					const date = new Date(year, month, day);
					const localDateTime = new LocalDateTime(date);
					expect(localDateTime.getFullYear()).to.equal(date.getFullYear());
					expect(localDateTime.getMonth()).to.equal(date.getMonth());
					expect(localDateTime.getDate()).to.equal(date.getDate());
					expect(localDateTime.getHours()).to.equal(date.getHours());
					expect(localDateTime.getMinutes()).to.equal(date.getMinutes());
					expect(localDateTime.getSeconds()).to.equal(date.getSeconds());
					expect(localDateTime.getMilliseconds()).to.equal(date.getMilliseconds());
					expect(localDateTime.toISOString()).to.equal(
						localDateTime.getFullYear() + '-'
						+ (localDateTime.getMonth() + 1).toString().padStart(2, '0') + '-'
						+ localDateTime.getDate().toString().padStart(2, '0') + 'T'
						+ localDateTime.getHours().toString().padStart(2, '0') + ':'
						+ localDateTime.getMinutes().toString().padStart(2, '0') + ':'
						+ localDateTime.getSeconds().toString().padStart(2, '0')
					);
				}
			}
		}
	});
});
