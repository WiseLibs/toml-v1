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
		expect(() => localDateTime.valueOf()).to.throw(TypeError);
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
		it('uses the current time when no parameters are passed');
		it('interprets a Date argument as a UNIX timestamp');
		it('interprets a number argument as a UNIX timestamp');
		it('interprets a string argument as a local date-time string');
		it('does not support other argument types');
		it('does not support multiple constructor arguments');
	});
	describe('supported methods', function () {
		specify('getMilliseconds()');
		specify('setMilliseconds()');
		specify('getSeconds()');
		specify('setSeconds()');
		specify('getMinutes()');
		specify('setMinutes()');
		specify('getHours()');
		specify('setHours()');
		specify('getDate()');
		specify('setDate()');
		specify('getMonth()');
		specify('setMonth()');
		specify('getYear()');
		specify('setYear()');
		specify('getFullYear()');
		specify('setFullYear()');
		specify('getDay()');
		specify('toString()');
		specify('toISOString()');
		specify('toDateString()');
		specify('toTimeString()');
		specify('toLocaleDateString()');
		specify('toLocaleTimeString()');
		specify('toLocaleString()');
		specify('toJSON()');
	});
	describe('normalization', function () {
		specify('constructor');
		specify('setMilliseconds()');
		specify('setSeconds()');
		specify('setMinutes()');
		specify('setHours()');
		specify('setDate()');
		specify('setMonth()');
		specify('setYear()');
		specify('setFullYear()');
	});
});
