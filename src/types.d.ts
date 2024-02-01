declare namespace TOML {
	export function parse<T = any>(
		toml: string,
		filename?: string,
		tracker?: SourceTracker | null
	): T;

	export class LocalTime extends Date {
		constructor(timestamp?: Date | number | string);
	}

	export class LocalDate extends Date {
		constructor(timestamp?: Date | number | string);
	}

	export class LocalDateTime extends Date {
		constructor(timestamp?: Date | number | string);
	}

	export class OffsetDateTime extends Date {
		constructor(timestamp?: Date | number | string);
		getOriginalTimezoneOffset(): number;
		setOriginalTimezoneOffset(offset: number): void;
	}

	export class SourceTracker {
		getKeySource(obj: object | any[], key: string | number);
		getValueSource(obj: object | any[], key: string | number);
	}
}

export = TOML;
