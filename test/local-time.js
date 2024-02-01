'use strict';
const { expect } = require('chai');
const { LocalTime } = require('..');

describe('LocalTime', function () {
	it('is a subclass of Date', function () {
		expect(new LocalTime()).to.be.an.instanceof(Date);
		expect(Object.getPrototypeOf(new LocalTime())).to.equal(LocalTime.prototype);
		expect(Object.getPrototypeOf(LocalTime)).to.equal(Date);
		expect(LocalTime.prototype).to.not.equal(Date.prototype);
	});
	it('does not support static methods of Date', function () {
		expect(() => LocalTime.parse('2000-01-01')).to.throw(TypeError);
		expect(() => LocalTime.parse(new Date().toISOString())).to.throw(TypeError);
		expect(() => LocalTime.UTC(2000)).to.throw(TypeError);
		expect(() => LocalTime.now()).to.throw(TypeError);
	});
	it('does not support date-related methods', function () {
		const localTime = new LocalTime();
		expect(() => localTime.getDate()).to.throw(TypeError);
		expect(() => localTime.setDate(1)).to.throw(TypeError);
		expect(() => localTime.getUTCDate()).to.throw(TypeError);
		expect(() => localTime.setUTCDate(1)).to.throw(TypeError);
		expect(() => localTime.getMonth()).to.throw(TypeError);
		expect(() => localTime.setMonth(1)).to.throw(TypeError);
		expect(() => localTime.getUTCMonth()).to.throw(TypeError);
		expect(() => localTime.setUTCMonth(1)).to.throw(TypeError);
		expect(() => localTime.getYear()).to.throw(TypeError);
		expect(() => localTime.setYear(1)).to.throw(TypeError);
		expect(() => localTime.getFullYear()).to.throw(TypeError);
		expect(() => localTime.setFullYear(1)).to.throw(TypeError);
		expect(() => localTime.getUTCFullYear()).to.throw(TypeError);
		expect(() => localTime.setUTCFullYear(1)).to.throw(TypeError);
		expect(() => localTime.getDay()).to.throw(TypeError);
		expect(() => localTime.getUTCDay()).to.throw(TypeError);
		expect(() => localTime.toDateString()).to.throw(TypeError);
		expect(() => localTime.toLocaleDateString()).to.throw(TypeError);
	});
	it('does not support timezone-related methods', function () {
		const localTime = new LocalTime();
		expect(() => localTime.getTime()).to.throw(TypeError);
		expect(() => localTime.setTime(1)).to.throw(TypeError);
		expect(() => localTime.getUTCMilliseconds()).to.throw(TypeError);
		expect(() => localTime.setUTCMilliseconds(1)).to.throw(TypeError);
		expect(() => localTime.getUTCSeconds()).to.throw(TypeError);
		expect(() => localTime.setUTCSeconds(1)).to.throw(TypeError);
		expect(() => localTime.getUTCMinutes()).to.throw(TypeError);
		expect(() => localTime.setUTCMinutes(1)).to.throw(TypeError);
		expect(() => localTime.getUTCHours()).to.throw(TypeError);
		expect(() => localTime.setUTCHours(1)).to.throw(TypeError);
		expect(() => localTime.getTimezoneOffset()).to.throw(TypeError);
		expect(() => localTime.toUTCString()).to.throw(TypeError);
		expect(() => localTime.toGMTString()).to.throw(TypeError);
	});
	describe('constructor', function () {
		it('uses the current time when no parameters are passed', function () {
			const before = Date.now() % 86400000;
			const localTime = new LocalTime();
			const after = Date.now() % 86400000;
			expect(new Date(localTime).valueOf()).to.be.within(before, after);
		});
		it('interprets a Date argument as a UNIX timestamp', function () {
			const date = new Date(1999, 2, 24, 21, 18, 0, 42);
			const timestamp = date.valueOf() % 86400000;
			expect(new Date(new LocalTime(date)).valueOf()).to.equal(timestamp);
			expect(new Date(new LocalTime(new LocalTime(date))).valueOf()).to.equal(timestamp);
		});
		it('interprets a number argument as a UNIX timestamp', function () {
			const date = new Date(1999, 2, 24, 21, 18, 0, 42);
			const localTime = new LocalTime(date.valueOf());
			const timestamp = date.valueOf() % 86400000;
			expect(new Date(localTime).valueOf()).to.equal(timestamp);
		});
		it('interprets a string argument as a local time string', function () {
			const date1 = new Date(1999, 2, 24, 21, 18, 0, 42);
			const localTime1 = new LocalTime('21:18:00.042');
			const timestamp1 = date1.valueOf() % 86400000;
			expect(new Date(localTime1).valueOf()).to.equal(timestamp1);
			const date2 = new Date(1999, 2, 24, 21, 18, 0, 0);
			const localTime2 = new LocalTime('21:18:00');
			const timestamp2 = date2.valueOf() % 86400000;
			expect(new Date(localTime2).valueOf()).to.equal(timestamp2);
			expect(() => new LocalTime('23:59:60')).to.not.throw();
		});
		it('does not support invalid time strings', function () {
			expect(() => new LocalTime('21:18:00Z')).to.throw(Error);
			expect(() => new LocalTime('21:18:000')).to.throw(Error);
			expect(() => new LocalTime('21:18')).to.throw(Error);
			expect(() => new LocalTime('21')).to.throw(Error);
			expect(() => new LocalTime('2:18:00')).to.throw(Error);
			expect(() => new LocalTime('21:1:00')).to.throw(Error);
			expect(() => new LocalTime('21:18:0')).to.throw(Error);
			expect(() => new LocalTime('21-18-00')).to.throw(Error);
			expect(() => new LocalTime('2021-18-00')).to.throw(Error);
			expect(() => new LocalTime('2021-18-00T21:18:00')).to.throw(Error);
			expect(() => new LocalTime('2021-18-00T21:18:00Z')).to.throw(Error);
			expect(() => new LocalTime('2021-18-00T21:18:00.042')).to.throw(Error);
			expect(() => new LocalTime('2021-18-00T21:18:00.042Z')).to.throw(Error);
			expect(() => new LocalTime('24:00:00')).to.throw(Error);
			expect(() => new LocalTime('23:60:00')).to.throw(Error);
			expect(() => new LocalTime('23:59:61')).to.throw(Error);
		});
		it('does not support other argument types', function () {
			expect(() => new LocalTime(undefined)).to.throw(TypeError);
			expect(() => new LocalTime(null)).to.throw(TypeError);
			expect(() => new LocalTime(false)).to.throw(TypeError);
			expect(() => new LocalTime(true)).to.throw(TypeError);
			expect(() => new LocalTime(BigInt(12))).to.throw(TypeError);
			expect(() => new LocalTime(new Number(12))).to.throw(TypeError);
			expect(() => new LocalTime(new String('21:18:00'))).to.throw(TypeError);
			expect(() => new LocalTime({ valueOf: () => 12 })).to.throw(TypeError);
		});
		it('does not support multiple constructor arguments', function () {
			expect(() => new LocalTime('21:18:00', {})).to.throw(RangeError);
			expect(() => new LocalTime(21, 18, 0)).to.throw(RangeError);
			expect(() => new LocalTime(Date.now(), undefined)).to.throw(RangeError);
		});
	});
	describe('supported methods', function () {
		specify('valueOf()', function () {
			const date = new Date(0);
			date.setHours(21);
			date.setMinutes(18);
			expect(new LocalTime('21:18:00').valueOf()).to.equal(date.valueOf());
		});
		specify('getMilliseconds()', function () {
			expect(new LocalTime('21:18:00').getMilliseconds()).to.equal(0);
			expect(new LocalTime('21:18:00.042').getMilliseconds()).to.equal(42);
		});
		specify('setMilliseconds()', function () {
			const localTime = new LocalTime('21:18:00.042');
			localTime.setMilliseconds(123);
			expect(localTime.getMilliseconds()).to.equal(123);
			localTime.setMilliseconds(999);
			expect(localTime.getMilliseconds()).to.equal(999);
		});
		specify('getSeconds()', function () {
			expect(new LocalTime('21:18:00.042').getSeconds()).to.equal(0);
			expect(new LocalTime('21:18:02').getSeconds()).to.equal(2);
			expect(new LocalTime('21:18:59.999').getSeconds()).to.equal(59);
		});
		specify('setSeconds()', function () {
			const localTime = new LocalTime('21:18:00.042');
			localTime.setSeconds(2);
			expect(localTime.getSeconds()).to.equal(2);
			localTime.setSeconds(42);
			expect(localTime.getSeconds()).to.equal(42);
		});
		specify('getMinutes()', function () {
			expect(new LocalTime('21:00:00').getMinutes()).to.equal(0);
			expect(new LocalTime('21:08:00.042').getMinutes()).to.equal(8);
			expect(new LocalTime('21:18:00.042').getMinutes()).to.equal(18);
		});
		specify('setMinutes()', function () {
			const localTime = new LocalTime('21:18:00.042');
			localTime.setMinutes(2);
			expect(localTime.getMinutes()).to.equal(2);
			localTime.setMinutes(42);
			expect(localTime.getMinutes()).to.equal(42);
		});
		specify('getHours()', function () {
			expect(new LocalTime('00:18:00').getHours()).to.equal(0);
			expect(new LocalTime('01:18:02.042').getHours()).to.equal(1);
			expect(new LocalTime('21:18:42.042').getHours()).to.equal(21);
		});
		specify('setHours()', function () {
			const localTime = new LocalTime('21:18:00.042');
			localTime.setHours(1);
			expect(localTime.getHours()).to.equal(1);
			localTime.setHours(21);
			expect(localTime.getHours()).to.equal(21);
		});
		specify('toString()', function () {
			expect(new LocalTime(NaN).toString()).to.equal('Invalid Date');
			expect(new LocalTime('21:18:00').toString()).to.equal('21:18:00');
			expect(new LocalTime('21:18:00.042').toString()).to.equal('21:18:00');
			expect(new LocalTime('21:18:00.999').toString()).to.equal('21:18:00');
			expect(new LocalTime(new Date(1999, 2, 24, 21, 18, 1, 42)).toString()).to.equal('21:18:01');
		});
		specify('toISOString()', function () {
			expect(() => new LocalTime(NaN).toISOString()).to.throw(RangeError);
			expect(new LocalTime('21:18:00').toISOString()).to.equal('21:18:00');
			expect(new LocalTime('21:18:00.042').toISOString()).to.equal('21:18:00.042');
			expect(new LocalTime('21:18:00.999').toISOString()).to.equal('21:18:00.999');
			expect(new LocalTime(new Date(1999, 2, 24, 21, 18, 1, 42)).toISOString()).to.equal('21:18:01.042');
		});
		specify('toTimeString()', function () {
			expect(new LocalTime(NaN).toTimeString()).to.equal('Invalid Date');
			expect(new LocalTime('21:18:00').toTimeString()).to.equal('21:18:00');
			expect(new LocalTime('21:18:00.042').toTimeString()).to.equal('21:18:00');
			expect(new LocalTime('21:18:00.999').toTimeString()).to.equal('21:18:00');
			expect(new LocalTime(new Date(1999, 2, 24, 21, 18, 1, 42)).toTimeString()).to.equal('21:18:01');
		});
		specify('toLocaleTimeString()', function () {
			expect(new LocalTime(NaN).toLocaleTimeString()).to.equal('Invalid Date');
			expect(new LocalTime('21:18:00.042').toLocaleTimeString())
				.to.equal(new Date(1999, 2, 24, 21, 18, 0, 42).toLocaleTimeString());
		});
		specify('toLocaleString()', function () {
			expect(new LocalTime(NaN).toLocaleString()).to.equal('Invalid Date');
			expect(new LocalTime('21:18:00.042').toLocaleString())
				.to.equal(new Date(1999, 2, 24, 21, 18, 0, 42).toLocaleTimeString());
		});
		specify('toJSON()', function () {
			expect(() => new LocalTime(NaN).toJSON()).to.throw(RangeError);
			expect(new LocalTime('21:18:00').toJSON()).to.equal('21:18:00');
			expect(new LocalTime('21:18:00.042').toJSON()).to.equal('21:18:00.042');
			expect(new LocalTime('21:18:00.999').toJSON()).to.equal('21:18:00.999');
			expect(new LocalTime(new Date(1999, 2, 24, 21, 18, 1, 42)).toJSON()).to.equal('21:18:01.042');
		});
	});
	describe('normalization', function () {
		specify('constructor', function () {
			expect(new Date(new LocalTime(86400000 + 1234567)).valueOf()).to.equal(1234567);
			expect(new Date(new LocalTime(-1234567)).valueOf()).to.equal(86400000 - 1234567);
		});
		specify('setMilliseconds()', function () {
			const localTime = new LocalTime('21:18:00.042');
			localTime.setMilliseconds(62123);
			expect(localTime.toISOString()).to.equal('21:19:02.123');
			localTime.setMilliseconds(-1);
			expect(localTime.toISOString()).to.equal('21:19:01.999');
		});
		specify('setSeconds()', function () {
			const localTime = new LocalTime('21:18:00.042');
			localTime.setSeconds(3722);
			expect(localTime.toISOString()).to.equal('22:20:02.042');
			localTime.setSeconds(-3);
			expect(localTime.toISOString()).to.equal('22:19:57.042');
		});
		specify('setMinutes()', function () {
			const localTime = new LocalTime('21:18:00.042');
			localTime.setMinutes(322);
			expect(localTime.toISOString()).to.equal('02:22:00.042');
			localTime.setMinutes(-61);
			expect(localTime.toISOString()).to.equal('00:59:00.042');
		});
		specify('setHours()', function () {
			const localTime = new LocalTime('21:18:00.042');
			localTime.setHours(500);
			expect(localTime.toISOString()).to.equal('20:18:00.042');
			localTime.setHours(-25);
			expect(localTime.toISOString()).to.equal('23:18:00.042');
		});
	});
	specify('stress test', function () {
		this.slow(5000);
		this.timeout(10000);
		for (let year = 1970; year <= 2050; ++year) {
			for (let month = 0; month <= 11; ++month) {
				for (let day = 1; day <= 31; ++day) {
					const date = new Date(year, month, day);
					const localTime = new LocalTime(date);
					expect(localTime.getHours()).to.equal(date.getHours());
					expect(localTime.getMinutes()).to.equal(date.getMinutes());
					expect(localTime.getSeconds()).to.equal(date.getSeconds());
					expect(localTime.getMilliseconds()).to.equal(date.getMilliseconds());
					expect(localTime.toISOString()).to.equal(
						localTime.getHours().toString().padStart(2, '0') + ':'
						+ localTime.getMinutes().toString().padStart(2, '0') + ':'
						+ localTime.getSeconds().toString().padStart(2, '0')
					);
				}
			}
		}
	});
});
