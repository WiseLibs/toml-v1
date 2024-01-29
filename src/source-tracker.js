'use strict';
const SOURCES = Symbol();

/*
	SourceTracker can be used to remember/retrieve the source locations of each
	key and value within a TOML document.
 */

class SourceTracker {
	constructor() {
		Object.defineProperty(this, SOURCES, { value: new WeakMap() });
	}

	getKeySource(obj, key) {
		return getSourceRecord(this[SOURCES], obj, key).key;
	}

	getValueSource(obj, key) {
		return getSourceRecord(this[SOURCES], obj, key).value;
	}
}

function getSourceRecord(sources, obj, key) {
	if (typeof obj !== 'object' || obj === null) {
		throw new TypeError('Expected the tracked entity to be an object or array');
	}
	if (typeof key !== 'string' && !Number.isInteger(key)) {
		throw new TypeError('Expected key to be a string or integer');
	}

	const map = sources.get(obj);
	if (!map) {
		if (Array.isArray(obj)) {
			throw new TypeError('No source tracked for that array');
		} else {
			throw new TypeError('No source tracked for that object');
		}
	}

	const record = map.get(key);
	if (!record) {
		throw new TypeError('No source tracked for that key');
	}

	return record;
}

Object.assign(exports, {
	SourceTracker,
	SOURCES,
});
