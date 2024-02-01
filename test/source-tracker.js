'use strict';
const { expect } = require('chai');
const { Source } = require('super-sources');
const { parse, SourceTracker } = require('..');

describe('SourceTracker', function () {
	it('throws when passed a non-object/non-array', function () {
		const tracker = new SourceTracker();
		expect(() => tracker.getKeySource(undefined, 'trim')).to.throw(TypeError);
		expect(() => tracker.getKeySource(null, 'trim')).to.throw(TypeError);
		expect(() => tracker.getKeySource(123, 'toString')).to.throw(TypeError);
		expect(() => tracker.getKeySource('foo', 'trim')).to.throw(TypeError);
		expect(() => tracker.getValueSource(undefined, 'trim')).to.throw(TypeError);
		expect(() => tracker.getValueSource(null, 'trim')).to.throw(TypeError);
		expect(() => tracker.getValueSource(123, 'toString')).to.throw(TypeError);
		expect(() => tracker.getValueSource('foo', 'trim')).to.throw(TypeError);
	});
	it('throws when passed an object/array that is not tracked', function () {
		const tracker = new SourceTracker();
		const doc = parse('[foo]\nbar.baz = { quz = [123] }', 'foo.toml', tracker);
		expect(() => tracker.getKeySource({ foo: '123' }, 'foo')).to.throw(TypeError);
		expect(() => tracker.getKeySource({ foo: doc.foo }, 'foo')).to.throw(TypeError);
		expect(() => tracker.getKeySource({ ...doc }, 'foo')).to.throw(TypeError);
		expect(() => tracker.getKeySource(Object.assign({}, doc), 'foo')).to.throw(TypeError);
		expect(() => tracker.getValueSource({ foo: '123' }, 'foo')).to.throw(TypeError);
		expect(() => tracker.getValueSource({ foo: doc.foo }, 'foo')).to.throw(TypeError);
		expect(() => tracker.getValueSource({ ...doc }, 'foo')).to.throw(TypeError);
		expect(() => tracker.getValueSource(Object.assign({}, doc), 'foo')).to.throw(TypeError);
	});
	it('throws when trying to access a nonexistent key', function () {
		const tracker = new SourceTracker();
		const doc = parse('[foo]\nbar.baz = { quz = [123] }', 'foo.toml', tracker);
		expect(() => tracker.getKeySource(doc, '')).to.throw(TypeError);
		expect(() => tracker.getKeySource(doc.foo, 'baz')).to.throw(TypeError);
		expect(() => tracker.getKeySource(doc.foo.bar, 'qux')).to.throw(TypeError);
		expect(() => tracker.getKeySource(doc.foo.bar.qux, 'meh')).to.throw(TypeError);
		expect(() => tracker.getKeySource(doc.foo.bar.qux, 1)).to.throw(TypeError);
		expect(() => tracker.getValueSource(doc, '')).to.throw(TypeError);
		expect(() => tracker.getValueSource(doc.foo, 'baz')).to.throw(TypeError);
		expect(() => tracker.getValueSource(doc.foo.bar, 'qux')).to.throw(TypeError);
		expect(() => tracker.getValueSource(doc.foo.bar.qux, 'meh')).to.throw(TypeError);
		expect(() => tracker.getValueSource(doc.foo.bar.qux, 1)).to.throw(TypeError);
	});
	describe('supported TOML entities', function () {
		specify('implicit tables', function () {
			const tracker = new SourceTracker();
			const doc1 = parse('foo.bar.baz = 123', 'foo.toml', tracker);
			expect(tracker.getKeySource(doc1, 'foo')).to.be.an.instanceof(Source);
			expect(tracker.getValueSource(doc1, 'foo')).to.be.an.instanceof(Source);
			expect(tracker.getKeySource(doc1.foo, 'bar')).to.be.an.instanceof(Source);
			expect(tracker.getValueSource(doc1.foo, 'bar')).to.be.an.instanceof(Source);
			const doc2 = parse('[foo.bar.baz]\nqux = 123', 'foo.toml', tracker);
			expect(tracker.getKeySource(doc2, 'foo')).to.be.an.instanceof(Source);
			expect(tracker.getValueSource(doc2, 'foo')).to.be.an.instanceof(Source);
			expect(tracker.getKeySource(doc2.foo, 'bar')).to.be.an.instanceof(Source);
			expect(tracker.getValueSource(doc2.foo, 'bar')).to.be.an.instanceof(Source);
			expect(tracker.getValueSource(doc2.foo, 'bar').file.filename).to.equal('foo.toml');
		});
		specify('explicit tables', function () {
			const tracker = new SourceTracker();
			const doc1 = parse('[foo]\nbar = 123', 'foo.toml', tracker);
			expect(tracker.getKeySource(doc1, 'foo')).to.be.an.instanceof(Source);
			expect(tracker.getValueSource(doc1, 'foo')).to.be.an.instanceof(Source);
			const doc2 = parse('[foo.bar]\nbaz = 123', 'foo.toml', tracker);
			expect(tracker.getKeySource(doc2.foo, 'bar')).to.be.an.instanceof(Source);
			expect(tracker.getValueSource(doc2.foo, 'bar')).to.be.an.instanceof(Source);
			expect(tracker.getValueSource(doc2.foo, 'bar').file.filename).to.equal('foo.toml');
		});
		specify('arrays of tables', function () {
			const tracker = new SourceTracker();
			const doc1 = parse('[[foo]]\nbar = 123', 'foo.toml', tracker);
			expect(tracker.getKeySource(doc1, 'foo')).to.be.an.instanceof(Source);
			expect(tracker.getValueSource(doc1, 'foo')).to.be.an.instanceof(Source);
			const doc2 = parse('[[foo.bar]]\nbaz = 123', 'foo.toml', tracker);
			expect(tracker.getKeySource(doc2.foo, 'bar')).to.be.an.instanceof(Source);
			expect(tracker.getValueSource(doc2.foo, 'bar')).to.be.an.instanceof(Source);
			expect(tracker.getValueSource(doc2.foo, 'bar').file.filename).to.equal('foo.toml');
		});
		specify('tables within arrays of tables', function () {
			const tracker = new SourceTracker();
			const doc1 = parse('[[foo]]\nbar = 123', 'foo.toml', tracker);
			expect(tracker.getKeySource(doc1.foo, 0)).to.be.an.instanceof(Source);
			expect(tracker.getValueSource(doc1.foo, 0)).to.be.an.instanceof(Source);
			const doc2 = parse('[[foo.bar]]\nbaz = 123', 'foo.toml', tracker);
			expect(tracker.getKeySource(doc2.foo.bar, 0)).to.be.an.instanceof(Source);
			expect(tracker.getValueSource(doc2.foo.bar, 0)).to.be.an.instanceof(Source);
			expect(tracker.getValueSource(doc2.foo.bar, 0).file.filename).to.equal('foo.toml');
		});
		specify('key-value assignments on implicit tables', function () {
			const tracker = new SourceTracker();
			const doc = parse('foo.bar.baz = 123\nfoo.x = 456\nfoo.bar.x = "ok"', 'foo.toml', tracker);
			expect(tracker.getKeySource(doc.foo, 'x')).to.be.an.instanceof(Source);
			expect(tracker.getValueSource(doc.foo, 'x')).to.be.an.instanceof(Source);
			expect(tracker.getKeySource(doc.foo.bar, 'x')).to.be.an.instanceof(Source);
			expect(tracker.getValueSource(doc.foo.bar, 'x')).to.be.an.instanceof(Source);
			expect(tracker.getValueSource(doc.foo.bar, 'x').file.filename).to.equal('foo.toml');
		});
		specify('key-value assignments on explicit tables', function () {
			const tracker = new SourceTracker();
			const doc1 = parse('[foo]\nbar = 123', 'foo.toml', tracker);
			expect(tracker.getKeySource(doc1.foo, 'bar')).to.be.an.instanceof(Source);
			expect(tracker.getValueSource(doc1.foo, 'bar')).to.be.an.instanceof(Source);
			const doc2 = parse('[foo.bar]\nbaz = 123', 'foo.toml', tracker);
			expect(tracker.getKeySource(doc2.foo.bar, 'baz')).to.be.an.instanceof(Source);
			expect(tracker.getValueSource(doc2.foo.bar, 'baz')).to.be.an.instanceof(Source);
			expect(tracker.getValueSource(doc2.foo.bar, 'baz').file.filename).to.equal('foo.toml');
		});
		specify('key-value assignments on tables within arrays of tables', function () {
			const tracker = new SourceTracker();
			const doc1 = parse('[[foo]]\nbar = 123', 'foo.toml', tracker);
			expect(tracker.getKeySource(doc1.foo[0], 'bar')).to.be.an.instanceof(Source);
			expect(tracker.getValueSource(doc1.foo[0], 'bar')).to.be.an.instanceof(Source);
			const doc2 = parse('[[foo.bar]]\nbaz = 123', 'foo.toml', tracker);
			expect(tracker.getKeySource(doc2.foo.bar[0], 'baz')).to.be.an.instanceof(Source);
			expect(tracker.getValueSource(doc2.foo.bar[0], 'baz')).to.be.an.instanceof(Source);
			expect(tracker.getValueSource(doc2.foo.bar[0], 'baz').file.filename).to.equal('foo.toml');
		});
		specify('key-value assignments on inline tables', function () {
			const tracker = new SourceTracker();
			const doc = parse('foo = { bar = { baz = 123 } }', 'foo.toml', tracker);
			expect(tracker.getKeySource(doc.foo, 'bar')).to.be.an.instanceof(Source);
			expect(tracker.getValueSource(doc.foo, 'bar')).to.be.an.instanceof(Source);
			expect(tracker.getKeySource(doc.foo.bar, 'baz')).to.be.an.instanceof(Source);
			expect(tracker.getValueSource(doc.foo.bar, 'baz')).to.be.an.instanceof(Source);
			expect(tracker.getValueSource(doc.foo.bar, 'baz').file.filename).to.equal('foo.toml');
		});
		specify('values within inline arrays', function () {
			const tracker = new SourceTracker();
			const doc = parse('foo = [[123]]', 'foo.toml', tracker);
			expect(tracker.getKeySource(doc.foo, 0)).to.be.an.instanceof(Source);
			expect(tracker.getValueSource(doc.foo, 0)).to.be.an.instanceof(Source);
			expect(tracker.getKeySource(doc.foo[0], 0)).to.be.an.instanceof(Source);
			expect(tracker.getValueSource(doc.foo[0], 0)).to.be.an.instanceof(Source);
			expect(tracker.getValueSource(doc.foo[0], 0).file.filename).to.equal('foo.toml');
		});
	});
});
