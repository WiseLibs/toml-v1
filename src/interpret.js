'use strict';
const ast = require('./ast');

/*
	Given a parsed AST, this generates the final object represented by the TOML.
 */

module.exports = (definitions) => {
	const explicitTables = new Set();
	const implicitTables = new Set();
	const appendableArrays = new Set();
	return buildRoot();

	function buildRoot() {
		const root = Object.create(null);
		let current = root;

		for (const definition of definitions) {
			if (definition instanceof ast.ScopeNode) {
				if (definition.isArrayTable) {
					current = append(root, definition.key.parts);
				} else {
					current = define(root, definition.key.parts);
				}
			} else if (definition instanceof ast.AssignmentNode) {
				assign(current, definition.key.parts, getValue(definition.value));
			} else {
				throw new TypeError('Unrecognized definition type');
			}
		}

		return root;
	}

	function traverse(obj, keyPath, traverseAny = false) {
		const length = keyPath.length - 1;
		for (let i = 0; i < length; ++i) {
			const key = keyPath[i].value;
			const value = obj[key];
			if (value === undefined) {
				const table = Object.create(null);
				implicitTables.add(table);
				obj[key] = table;
				obj = table;
			} else if (implicitTables.has(value)) {
				obj = value;
			} else if (traverseAny && explicitTables.has(value)) {
				obj = value;
			} else if (traverseAny && appendableArrays.has(value)) {
				obj = value[value.length - 1];
			} else {
				const source = keyPath[0].source.to(keyPath[i].source);
				throw source.error('Cannot redefine existing key').done();
			}
		}
		return obj;
	}

	function define(obj, keyPath) {
		obj = traverse(obj, keyPath, true);

		const key = keyPath[keyPath.length - 1].value;
		if (obj[key] === undefined) {
			const table = Object.create(null);
			explicitTables.add(table);
			obj[key] = table;
			return table;
		} else {
			const source = keyPath[0].source.to(keyPath[keyPath.length - 1].source);
			throw source.error('Cannot redefine existing key').done();
		}
	}

	function append(obj, keyPath) {
		obj = traverse(obj, keyPath, true);

		const key = keyPath[keyPath.length - 1].value;
		const value = obj[key];
		if (value === undefined) {
			const element = Object.create(null);
			const array = [element];
			appendableArrays.add(array);
			obj[key] = array;
			return element;
		} else if (appendableArrays.has(value)) {
			const element = Object.create(null);
			value.push(element);
			return element;
		} else {
			const source = keyPath[0].source.to(keyPath[keyPath.length - 1].source);
			throw source.error('Cannot redefine existing key').done();
		}
	}

	function assign(obj, keyPath, value) {
		obj = traverse(obj, keyPath);

		const key = keyPath[keyPath.length - 1].value;
		if (obj[key] === undefined) {
			obj[key] = value;
		} else {
			const source = keyPath[0].source.to(keyPath[keyPath.length - 1].source);
			throw source.error('Cannot redefine existing key').done();
		}
	}

	function getValue(node) {
		if (!(node instanceof ast.ValueNode)) {
			throw new TypeError('Expected node to be a ValueNode');
		}
		if (node instanceof ast.InlineTableNode) {
			const table = Object.create(null);
			for (const assignmentNode of node.assignments) {
				assign(table, assignmentNode.key.parts, getValue(assignmentNode.value));
			}
			return table;
		}
		if (node instanceof ast.InlineArrayNode) {
			const array = [];
			for (const valueNode of node.values) {
				array.push(getValue(valueNode));
			}
			return array;
		}
		if (node.value == null) {
			throw new TypeError('Expected ValueNode to have a value');
		}
		return node.value;
	}
};
