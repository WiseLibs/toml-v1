# toml-v1 [![test](https://github.com/WiseLibs/toml-v1/actions/workflows/test.yml/badge.svg)](https://github.com/WiseLibs/toml-v1/actions/workflows/test.yml)

A TOML parser compatible with TOML version [v1.0.0](https://toml.io/en/v1.0.0).

This package passes [the TOML test suite](https://github.com/toml-lang/toml-test), except for a few tests that fall into these categories:

- Tests for 64-bit integers (JavaScript numbers only have 53 bits of precision)
- Tests for detecting invalid UTF-8 (not applicable to JavaScript strings)

It has the additional ability to track the source locations of keys and values after parsing ([see below](#source-tracking)).

## Installation

```
npm install toml-v1
```

> Requires Node.js v14.x.x or later.

## Usage

```js
import { parse } from 'toml-v1';

const data = parse('[foo]\nbar = 123');

assert(data.foo.bar === 123);
```

### Parsing dates

TOML defines four types of dates:

- [`OffsetDateTime`](https://toml.io/en/v1.0.0#offset-date-time)
- [`LocalDateTime`](https://toml.io/en/v1.0.0#local-date-time)
- [`LocalDate`](https://toml.io/en/v1.0.0#local-date)
- [`LocalTime`](https://toml.io/en/v1.0.0#local-time)

This package defines these types as subclasses of `Date`. The `OffsetDateTime` subclass is functionally equivalent to `Date`, but its timezone information is not forgotten. The other classes contain incomplete date/time information, so some of their methods are disabled. For example, calling `.getFullYear()` on `LocalTime` will throw an error.

```js
import { LocalTime } from 'toml-v1';

const localTime = new LocalTime('12:42:42');

assert(localTime.getHours() === 12);
assert(localTime.toString() === '12:42:42');
```

### Source tracking

By using the `SourceTracker`, you can retrieve [`Source`](https://github.com/WiseLibs/super-sources?tab=readme-ov-file#new-sourcefile-start-end) objects corresponding to each key and value in the TOML file.

```js
import { parser, SourceTracker } from 'toml-v1';

const tracker = new SourceTracker();
const data = parse('[foo]\nbar = 123', 'example.toml', tracker);

const keySource = tracker.getKeySource(data.foo, 'bar');
const valueSource = tracker.getValueSource(data.foo, 'bar');

assert(keySource.start === 6);
assert(keySource.end === 9);
assert(valueSource.start === 12);
assert(valueSource.end === 15);
```

## License

[MIT](https://github.com/WiseLibs/toml-v1/blob/master/LICENSE)
