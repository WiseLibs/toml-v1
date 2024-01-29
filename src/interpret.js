'use strict';
const { SOURCES } = require('./source-tracker');
const ast = require('./ast');

/*
	Given a parsed AST, this generates the final object represented by the TOML.
	If a SourceTracker is provided, it will track the source locations of all
	keys and value of all generated objects (i.e., "tables") and arrays.
 */

module.exports = (definitions, tracker) => {
	const explicitTables = new Set();
	const implicitTables = new Set();
	const appendableArrays = new Set();
	return buildRoot();

	function buildRoot() {
		const root = createTable();
		let current = root;

		for (const definition of definitions) {
			if (definition instanceof ast.ScopeNode) {
				if (definition.isArrayTable) {
					current = appendTable(root, definition.key.parts, definition.source);
				} else {
					current = defineTable(root, definition.key.parts, definition.source);
				}
			} else if (definition instanceof ast.AssignmentNode) {
				assign(current, definition.key.parts, definition.value);
			} else {
				throw new TypeError('Unrecognized definition type');
			}
		}

		return root;
	}

	function traverse(obj, keyPath, traverseAny = false) {
		const length = keyPath.length - 1;
		for (let i = 0; i < length; ++i) {
			const keyPart = keyPath[i];
			const key = keyPart.value;
			const value = obj[key];
			if (value === undefined) {
				const table = createTable();
				implicitTables.add(table);
				tracker && track(obj, key, keyPart.source, getKeySource(keyPath, i));
				obj[key] = table;
				obj = table;
			} else if (implicitTables.has(value)) {
				obj = value;
			} else if (traverseAny && explicitTables.has(value)) {
				obj = value;
			} else if (traverseAny && appendableArrays.has(value)) {
				obj = value[value.length - 1];
			} else {
				const source = getKeySource(keyPath, i);
				throw source.error('Cannot redefine existing key').done();
			}
		}
		return obj;
	}

	function defineTable(obj, keyPath, source) {
		obj = traverse(obj, keyPath, true);

		const keyPart = keyPath[keyPath.length - 1];
		const key = keyPart.value;
		if (obj[key] === undefined) {
			const table = createTable();
			explicitTables.add(table);
			tracker && track(obj, key, keyPart.source, source);
			obj[key] = table;
			return table;
		} else {
			const source = getKeySource(keyPath);
			throw source.error('Cannot redefine existing key').done();
		}
	}

	function appendTable(obj, keyPath, source) {
		obj = traverse(obj, keyPath, true);

		const keyPart = keyPath[keyPath.length - 1];
		const key = keyPart.value;
		let value = obj[key];
		if (value === undefined) {
			value = createArray();
			appendableArrays.add(value);
			tracker && track(obj, key, keyPart.source, source);
			obj[key] = value;
		}
		if (appendableArrays.has(value)) {
			const table = createTable();
			tracker && track(value, value.length, source, source);
			value.push(table);
			return table;
		} else {
			const source = getKeySource(keyPath);
			throw source.error('Cannot redefine existing key').done();
		}
	}

	function assign(obj, keyPath, valueNode) {
		obj = traverse(obj, keyPath);

		const keyPart = keyPath[keyPath.length - 1];
		const key = keyPart.value;
		if (obj[key] === undefined) {
			tracker && track(obj, key, keyPart.source, valueNode.source);
			obj[key] = getValue(valueNode);
		} else {
			const source = getKeySource(keyPath);
			throw source.error('Cannot redefine existing key').done();
		}
	}

	function getValue(node) {
		if (!(node instanceof ast.ValueNode)) {
			throw new TypeError('Expected node to be a ValueNode');
		}
		if (node instanceof ast.InlineTableNode) {
			const table = createTable();
			for (const assignmentNode of node.assignments) {
				assign(table, assignmentNode.key.parts, assignmentNode.value);
			}
			return table;
		}
		if (node instanceof ast.InlineArrayNode) {
			const array = createArray();
			for (const valueNode of node.values) {
				tracker && track(array, array.length, valueNode.source, valueNode.source);
				array.push(getValue(valueNode));
			}
			return array;
		}
		if (node.value == null) {
			throw new TypeError('Expected ValueNode to have a value');
		}
		return node.value;
	}

	function createTable() {
		const table = Object.create(null);
		tracker && tracker[SOURCES].set(table, new Map());
		return table;
	}

	function createArray() {
		const array = [];
		tracker && tracker[SOURCES].set(array, new Map());
		return array;
	}

	function track(obj, key, keySource, valueSource) {
		tracker[SOURCES].get(obj).set(key, { key: keySource, value: valueSource });
	}
};

function getKeySource(keyPath, lastIndex = keyPath.length - 1) {
	return keyPath[0].source.to(keyPath[lastIndex].source);
}
