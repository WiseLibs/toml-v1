'use strict';
const { expect } = require('chai');
const { LocalDate } = require('..');

describe('LocalDate', function () {
	it('is a subclass of Date', function () {
		expect(new LocalDate()).to.be.an.instanceof(Date);
		expect(Object.getPrototypeOf(new LocalDate())).to.equal(LocalDate.prototype);
		expect(Object.getPrototypeOf(LocalDate)).to.equal(Date);
		expect(LocalDate.prototype).to.not.equal(Date.prototype);
	});
	it('does not support static methods of Date', function () {
		expect(() => LocalDate.parse('2000-01-01')).to.throw(TypeError);
		expect(() => LocalDate.parse(new Date().toISOString())).to.throw(TypeError);
		expect(() => LocalDate.UTC(2000)).to.throw(TypeError);
		expect(() => LocalDate.now()).to.throw(TypeError);
	});
	it('does not support time-related methods', function () {
		const localDate = new LocalDate();
		expect(() => localDate.getMilliseconds()).to.throw(TypeError);
		expect(() => localDate.setMilliseconds(1)).to.throw(TypeError);
		expect(() => localDate.getUTCMilliseconds()).to.throw(TypeError);
		expect(() => localDate.setUTCMilliseconds(1)).to.throw(TypeError);
		expect(() => localDate.getSeconds()).to.throw(TypeError);
		expect(() => localDate.setSeconds(1)).to.throw(TypeError);
		expect(() => localDate.getUTCSeconds()).to.throw(TypeError);
		expect(() => localDate.setUTCSeconds(1)).to.throw(TypeError);
		expect(() => localDate.getMinutes()).to.throw(TypeError);
		expect(() => localDate.setMinutes(1)).to.throw(TypeError);
		expect(() => localDate.getUTCMinutes()).to.throw(TypeError);
		expect(() => localDate.setUTCMinutes(1)).to.throw(TypeError);
		expect(() => localDate.getHours()).to.throw(TypeError);
		expect(() => localDate.setHours(1)).to.throw(TypeError);
		expect(() => localDate.getUTCHours()).to.throw(TypeError);
		expect(() => localDate.setUTCHours(1)).to.throw(TypeError);
		expect(() => localDate.toTimeString()).to.throw(TypeError);
		expect(() => localDate.toLocaleTimeString()).to.throw(TypeError);
	});
	it('does not support timezone-related methods', function () {
		const localDate = new LocalDate();
		expect(() => localDate.valueOf()).to.throw(TypeError);
		expect(() => localDate.getTime()).to.throw(TypeError);
		expect(() => localDate.setTime(1)).to.throw(TypeError);
		expect(() => localDate.getUTCDate()).to.throw(TypeError);
		expect(() => localDate.setUTCDate(1)).to.throw(TypeError);
		expect(() => localDate.getUTCMonth()).to.throw(TypeError);
		expect(() => localDate.setUTCMonth(1)).to.throw(TypeError);
		expect(() => localDate.getUTCFullYear()).to.throw(TypeError);
		expect(() => localDate.setUTCFullYear(1)).to.throw(TypeError);
		expect(() => localDate.getUTCDay()).to.throw(TypeError);
		expect(() => localDate.getTimezoneOffset()).to.throw(TypeError);
		expect(() => localDate.toUTCString()).to.throw(TypeError);
		expect(() => localDate.toGMTString()).to.throw(TypeError);
	});
	describe('constructor', function () {
		it('uses the current date when no parameters are passed', function () {
			const localDate = new LocalDate();
			expectWithinDate(new Date(localDate).valueOf(), new Date());
		});
		it('interprets a Date argument as a UNIX timestamp', function () {
			const date1 = new Date(1999, 2, 24);
			const date2 = new Date(1999, 2, 24, 23, 59, 59, 999);
			expectWithinDate(new Date(new LocalDate(date1)).valueOf(), date1);
			expectWithinDate(new Date(new LocalDate(new LocalDate(date1))).valueOf(), date2);
		});
		it('interprets a number argument as a UNIX timestamp', function () {
			const date1 = new Date(1999, 2, 24);
			const date2 = new Date(1999, 2, 24, 23, 59, 59, 999);
			const localDate = new LocalDate(date1.valueOf());
			expectWithinDate(new Date(localDate).valueOf(), date1);
			expectWithinDate(new Date(localDate).valueOf(), date2);
		});
		it('interprets a string argument as a local date string', function () {
			const date1 = new Date(1999, 2, 24);
			const date2 = new Date(1999, 2, 24, 23, 59, 59, 999);
			const localDate = new LocalDate('1999-03-24');
			expectWithinDate(new Date(localDate).valueOf(), date1);
			expectWithinDate(new Date(localDate).valueOf(), date2);
		});
		it('does not support invalid date strings', function () {
			expect(() => new LocalDate('1999-03-24Z')).to.throw(Error);
			expect(() => new LocalDate('1999-03-024')).to.throw(Error);
			expect(() => new LocalDate('1999-03')).to.throw(Error);
			expect(() => new LocalDate('1999')).to.throw(Error);
			expect(() => new LocalDate('99-03-24')).to.throw(Error);
			expect(() => new LocalDate('1999-3-24')).to.throw(Error);
			expect(() => new LocalDate('1999-03-4')).to.throw(Error);
			expect(() => new LocalDate('1999:03:24')).to.throw(Error);
			expect(() => new LocalDate('99:03:24')).to.throw(Error);
			expect(() => new LocalDate('1999-03-24T19:03:23')).to.throw(Error);
			expect(() => new LocalDate('1999-03-24T19:03:23Z')).to.throw(Error);
			expect(() => new LocalDate('1999-03-24T19:03:23.042')).to.throw(Error);
			expect(() => new LocalDate('1999-03-24T19:03:23.042Z')).to.throw(Error);
		});
		it('does not support other argument types', function () {
			expect(() => new LocalDate(undefined)).to.throw(TypeError);
			expect(() => new LocalDate(null)).to.throw(TypeError);
			expect(() => new LocalDate(false)).to.throw(TypeError);
			expect(() => new LocalDate(true)).to.throw(TypeError);
			expect(() => new LocalDate(BigInt(19))).to.throw(TypeError);
			expect(() => new LocalDate(new Number(19))).to.throw(TypeError);
			expect(() => new LocalDate(new String('1999-03-24'))).to.throw(TypeError);
			expect(() => new LocalDate({ valueOf: () => 19 })).to.throw(TypeError);
		});
		it('does not support multiple constructor arguments', function () {
			expect(() => new LocalDate('1999-03-24', {})).to.throw(RangeError);
			expect(() => new LocalDate(1999, 3, 24)).to.throw(RangeError);
			expect(() => new LocalDate(Date.now(), undefined)).to.throw(RangeError);
		});
	});
	describe('supported methods', function () {
		specify('getDate()', function () {
			expect(new LocalDate('1999-03-04').getDate()).to.equal(4);
			expect(new LocalDate('1999-03-24').getDate()).to.equal(24);
		});
		specify('setDate()', function () {
			const localDate = new LocalDate('1999-03-24');
			localDate.setDate(1);
			expect(localDate.getDate()).to.equal(1);
			localDate.setDate(31);
			expect(localDate.getDate()).to.equal(31);
		});
		specify('getMonth()', function () {
			expect(new LocalDate('1999-01-24').getMonth()).to.equal(0);
			expect(new LocalDate('1999-03-24').getMonth()).to.equal(2);
			expect(new LocalDate('1999-12-24').getMonth()).to.equal(11);
		});
		specify('setMonth()', function () {
			const localDate = new LocalDate('1999-03-24');
			localDate.setMonth(0);
			expect(localDate.getMonth()).to.equal(0);
			localDate.setMonth(2);
			expect(localDate.getMonth()).to.equal(2);
			localDate.setMonth(11);
			expect(localDate.getMonth()).to.equal(11);
		});
		specify('getYear()', function () {
			expect(new LocalDate('1900-03-24').getYear()).to.equal(0);
			expect(new LocalDate('1902-12-24').getYear()).to.equal(2);
			expect(new LocalDate('1999-01-24').getYear()).to.equal(99);
		});
		specify('setYear()', function () {
			const localDate = new LocalDate('1999-03-24');
			localDate.setYear(0);
			expect(localDate.getYear()).to.equal(0);
			localDate.setYear(2);
			expect(localDate.getYear()).to.equal(2);
			localDate.setYear(11);
			expect(localDate.getYear()).to.equal(11);
		});
		specify('getFullYear()', function () {
			expect(new LocalDate('0000-01-24').getFullYear()).to.equal(0);
			expect(new LocalDate('0099-01-24').getFullYear()).to.equal(99);
			expect(new LocalDate('1999-03-24').getFullYear()).to.equal(1999);
			expect(new LocalDate('2024-12-24').getFullYear()).to.equal(2024);
		});
		specify('setFullYear()', function () {
			const localDate = new LocalDate('1999-03-24');
			localDate.setFullYear(0);
			expect(localDate.getFullYear()).to.equal(0);
			localDate.setFullYear(99);
			expect(localDate.getFullYear()).to.equal(99);
			localDate.setFullYear(1999);
			expect(localDate.getFullYear()).to.equal(1999);
			localDate.setFullYear(2024);
			expect(localDate.getFullYear()).to.equal(2024);
		});
		specify('getDay()', function () {
			expect(new LocalDate('1999-03-24').getDay()).to.equal(3);
		});
		specify('toString()', function () {
			expect(new LocalDate(NaN).toString()).to.equal('Invalid Date');
			expect(new LocalDate('0099-03-24').toString()).to.equal('Tue Mar 24 0099');
			expect(new LocalDate('1999-03-24').toString()).to.equal('Wed Mar 24 1999');
			expect(new LocalDate(new Date(1999, 2, 24, 23, 59, 59, 999)).toString()).to.equal('Wed Mar 24 1999');
		});
		specify('toISOString()', function () {
			expect(() => new LocalDate(NaN).toISOString()).to.throw(RangeError);
			expect(() => new LocalDate(new Date(-1000, 0)).toISOString()).to.throw(RangeError);
			expect(() => new LocalDate(new Date(10000, 0)).toISOString()).to.throw(RangeError);
			expect(new LocalDate('0099-03-24').toISOString()).to.equal('0099-03-24');
			expect(new LocalDate('1999-03-24').toISOString()).to.equal('1999-03-24');
			expect(new LocalDate(new Date(1999, 2, 24, 23, 59, 59, 999)).toISOString()).to.equal('1999-03-24');
		});
		specify('toDateString()', function () {
			expect(new LocalDate(NaN).toDateString()).to.equal('Invalid Date');
			expect(new LocalDate('0099-03-24').toDateString()).to.equal('Tue Mar 24 0099');
			expect(new LocalDate('1999-03-24').toDateString()).to.equal('Wed Mar 24 1999');
			expect(new LocalDate(new Date(1999, 2, 24, 23, 59, 59, 999)).toDateString()).to.equal('Wed Mar 24 1999');
		});
		specify('toLocaleDateString()', function () {
			expect(new LocalDate(NaN).toLocaleDateString()).to.equal('Invalid Date');
			expect(new LocalDate('1999-03-24').toLocaleDateString())
				.to.equal(new Date(1999, 2, 24, 21, 18, 0, 42).toLocaleDateString());
		});
		specify('toLocaleString()', function () {
			expect(new LocalDate(NaN).toLocaleString()).to.equal('Invalid Date');
			expect(new LocalDate('1999-03-24').toLocaleString())
				.to.equal(new Date(1999, 2, 24, 21, 18, 0, 42).toLocaleDateString());
		});
		specify('toJSON()', function () {
			expect(() => new LocalDate(NaN).toJSON()).to.throw(RangeError);
			expect(() => new LocalDate(new Date(-1000, 0)).toJSON()).to.throw(RangeError);
			expect(() => new LocalDate(new Date(10000, 0)).toJSON()).to.throw(RangeError);
			expect(new LocalDate('0099-03-24').toJSON()).to.equal('0099-03-24');
			expect(new LocalDate('1999-03-24').toJSON()).to.equal('1999-03-24');
			expect(new LocalDate(new Date(1999, 2, 24, 23, 59, 59, 999)).toJSON()).to.equal('1999-03-24');
		});
	});
	it('normalizes out-of-bounds dates in the constructor', function () {
		expectWithinDate(new Date(new LocalDate('1999-99-99')).valueOf(), new Date(1999, 98, 99));
	});
	it('maintains an internal offset to ensure consistent time interpretation', function () {
		const localDate1 = new LocalDate(new Date(1999, 2, 24, 0, 0, 0, 0));
		const localDate2 = new LocalDate(new Date(1999, 2, 24, 23, 59, 59, 999));
		expect(localDate1.toISOString()).to.equal(localDate2.toISOString());
		expect(localDate1.toString()).to.equal(localDate2.toString());
		expect(localDate1.toISOString()).to.equal('1999-03-24');
		expect(localDate1.toString()).to.equal('Wed Mar 24 1999');
		expect(new LocalDate(new LocalDate()).toString()).to.equal(new LocalDate().toString())
		expect(new LocalDate(new LocalDate(new LocalDate())).toString()).to.equal(new LocalDate().toString())
		expect(new LocalDate(new LocalDate(new LocalDate(new LocalDate()))).toString()).to.equal(new LocalDate().toString())
		expect(new LocalDate(new LocalDate(new LocalDate(new LocalDate(new LocalDate())))).toString()).to.equal(new LocalDate().toString())
		expect(new LocalDate(new LocalDate(new LocalDate(new LocalDate(new LocalDate(new LocalDate()))))).toString()).to.equal(new LocalDate().toString())
		expect(new Date(new LocalDate(new Date(1999, 2, 24, 0, 0, 0, 0))).valueOf()).to.equal(922287600000);
		expect(new Date(new LocalDate(new Date(1999, 2, 24, 23, 59, 59, 999))).valueOf()).to.equal(922287600000);
	});
	specify('stress test', function () {
		this.slow(5000);
		this.timeout(10000);
		for (let year = 1970; year <= 2050; ++year) {
			for (let month = 0; month <= 11; ++month) {
				for (let day = 1; day <= 31; ++day) {
					const date = new Date(year, month, day);
					const localDate = new LocalDate(date);
					expect(localDate.getFullYear()).to.equal(date.getFullYear());
					expect(localDate.getMonth()).to.equal(date.getMonth());
					expect(localDate.getDate()).to.equal(date.getDate());
					expect(localDate.toISOString()).to.equal(
						localDate.getFullYear() + '-'
						+ (localDate.getMonth() + 1).toString().padStart(2, '0') + '-'
						+ (localDate.getDate()).toString().padStart(2, '0')
					);
				}
			}
		}
	});
});

function expectWithinDate(timestamp, date) {
	const dateBegin = new Date(date);
	dateBegin.setHours(0);
	dateBegin.setMinutes(0);
	dateBegin.setSeconds(0);
	dateBegin.setMilliseconds(0);
	const dateEnd = new Date(dateBegin);
	dateEnd.setDate(dateEnd.getDate() + 1);
	dateEnd.setMilliseconds(-1);
	expect(timestamp).to.be.within(dateBegin.valueOf(), dateEnd.valueOf());
	const offset = dateBegin.getTimezoneOffset() * 60000;
	expect(timestamp + offset).to.be.within(dateBegin.valueOf(), dateEnd.valueOf());
}
