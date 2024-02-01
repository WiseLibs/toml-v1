'use strict';
const { expect } = require('chai');
const { parse } = require('..');

describe('parse()', function () {
	it('throws when the first argument is not provided', function () {
		expect(() => parse()).to.throw(TypeError);
		expect(() => parse(undefined)).to.throw(TypeError);
	});
	it('throws when a non-string first argument is passed', function () {
		expect(() => parse(null)).to.throw(TypeError);
		expect(() => parse(false)).to.throw(TypeError);
		expect(() => parse(123)).to.throw(TypeError);
		expect(() => parse(['foo = "bar"'])).to.throw(TypeError);
		expect(() => parse(new String('foo = "bar"'))).to.throw(TypeError);
		expect(() => parse({ valueOf: () => 'foo = "bar"' })).to.throw(TypeError);
	});
	it('throws when a non-string second argument is passed', function () {
		expect(() => parse('foo = "bar"', null)).to.throw(TypeError);
		expect(() => parse('foo = "bar"', false)).to.throw(TypeError);
		expect(() => parse('foo = "bar"', 123)).to.throw(TypeError);
		expect(() => parse('foo = "bar"', ['foo.toml'])).to.throw(TypeError);
		expect(() => parse('foo = "bar"', new String('foo.toml'))).to.throw(TypeError);
		expect(() => parse('foo = "bar"', { valueOf: () => 'foo.toml' })).to.throw(TypeError);
	});
	it('throws when a non-SourceTracker/null third argument is passed', function () {
		expect(() => parse('foo = "bar"', 'foo.toml', false)).to.throw(TypeError);
		expect(() => parse('foo = "bar"', 'foo.toml', 123)).to.throw(TypeError);
		expect(() => parse('foo = "bar"', 'foo.toml', 'foo')).to.throw(TypeError);
		expect(() => parse('foo = "bar"', 'foo.toml', {})).to.throw(TypeError);
	});
	it('parses the given TOML document', function () {
		expect(parse('[table]\nfoo = 123')).to.deep.equal({ table: { foo: 123 } });
		expect(parse('[[table]]\nfoo.bar = true')).to.deep.equal({ table: [{ foo: { bar: true } }] });
		expect(parse('foo.bar = [123, "foo"]')).to.deep.equal({ foo: { bar: [123, 'foo'] } });
		expect(parse('foo = { bar = 123, baz = [456] }')).to.deep.equal({ foo: { bar: 123, baz: [456] } });
	});
});
