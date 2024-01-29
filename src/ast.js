'use strict';
const { Source } = require('super-sources');
const { LocalTime, LocalDate, LocalDateTime, OffsetDateTime } = require('./dates');

/*
	These nodes make up the AST (abstract syntax tree) of a TOML document.
 */

class Node {
	constructor(source) {
		if (!(source instanceof Source)) {
			throw new TypeError('Expected source to be a Source object');
		}
		this.source = source;
	}
}

class ScopeNode extends Node {
	constructor(source, key, isArrayTable) {
		if (!(key instanceof KeyNode)) {
			throw new TypeError('Expected key to be a KeyNode');
		}
		if (typeof isArrayTable !== 'boolean') {
			throw new TypeError('Expected isArrayTable to be a boolean');
		}

		super(source);
		this.key = key;
		this.isArrayTable = isArrayTable;
	}
}

class AssignmentNode extends Node {
	constructor(key, value) {
		if (!(key instanceof KeyNode)) {
			throw new TypeError('Expected key to be a KeyNode');
		}
		if (!(value instanceof ValueNode)) {
			throw new TypeError('Expected value to be a ValueNode');
		}

		super(key.source.to(value.source));
		this.key = key;
		this.value = value;
	}
}

class KeyNode extends Node {
	constructor(parts) {
		if (!Array.isArray(parts)) {
			throw new TypeError('Expected parts to be an array');
		}
		if (!parts.length) {
			throw new TypeError('Expected parts to be non-empty');
		}

		const firstPart = parts[0];
		const lastPart = parts[parts.length - 1];
		super(firstPart.source.to(lastPart.source));
		this.parts = parts;
	}
}

class IdentNode extends Node {
	constructor(source) {
		super(source);
		this.value = source.string();
	}
}

class ValueNode extends Node {}

class InlineTableNode extends ValueNode {
	constructor(source, assignments) {
		if (!Array.isArray(assignments)) {
			throw new TypeError('Expected assignments to be an array');
		}

		super(source);
		this.assignments = assignments;
	}
}

class InlineArrayNode extends ValueNode {
	constructor(source, values) {
		if (!Array.isArray(values)) {
			throw new TypeError('Expected values to be an array');
		}

		super(source);
		this.values = values;
	}
}

class StringNode extends ValueNode {
	constructor(source, value) {
		if (typeof value !== 'string') {
			throw new TypeError('Expected value to be a string');
		}

		super(source);
		this.value = value;
	}
}

class NumberNode extends ValueNode {
	constructor(source, value) {
		if (typeof value !== 'number') {
			throw new TypeError('Expected value to be a number');
		}

		super(source);
		this.value = value;
	}
}

class BooleanNode extends ValueNode {
	constructor(source, value) {
		if (typeof value !== 'boolean') {
			throw new TypeError('Expected value to be a boolean');
		}

		super(source);
		this.value = value;
	}
}

class LocalTimeNode extends ValueNode {
	constructor(source, value) {
		if (!(value instanceof LocalTime)) {
			throw new TypeError('Expected value to be a LocalTime object');
		}

		super(source);
		this.value = value;
	}
}

class LocalDateNode extends ValueNode {
	constructor(source, value) {
		if (!(value instanceof LocalDate)) {
			throw new TypeError('Expected value to be a LocalDate object');
		}

		super(source);
		this.value = value;
	}
}

class LocalDateTimeNode extends ValueNode {
	constructor(source, value) {
		if (!(value instanceof LocalDateTime)) {
			throw new TypeError('Expected value to be a LocalDateTime object');
		}

		super(source);
		this.value = value;
	}
}

class OffsetDateTimeNode extends ValueNode {
	constructor(source, value) {
		if (!(value instanceof OffsetDateTime)) {
			throw new TypeError('Expected value to be a OffsetDateTime object');
		}

		super(source);
		this.value = value;
	}
}

Object.assign(exports, {
	Node,
	ScopeNode,
	AssignmentNode,
	KeyNode,
	IdentNode,
	ValueNode,
	InlineTableNode,
	InlineArrayNode,
	StringNode,
	NumberNode,
	BooleanNode,
	LocalTimeNode,
	LocalDateNode,
	LocalDateTimeNode,
	OffsetDateTimeNode,
});
