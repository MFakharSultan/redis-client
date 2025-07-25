'use strict';

var require$$0 = require('node:crypto');
var require$$0$1 = require('node:events');
var require$$1 = require('node:net');
var require$$2 = require('node:tls');
var require$$4 = require('node:timers/promises');
var require$$7 = require('node:url');
var require$$0$2 = require('stream');
var require$$1$1 = require('tty');
var require$$1$2 = require('util');
var require$$0$3 = require('os');

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var dist$1 = {};

var dist = {};

var decoder = {};

var verbatimString = {};

var hasRequiredVerbatimString;

function requireVerbatimString () {
	if (hasRequiredVerbatimString) return verbatimString;
	hasRequiredVerbatimString = 1;
	Object.defineProperty(verbatimString, "__esModule", { value: true });
	verbatimString.VerbatimString = void 0;
	class VerbatimString extends String {
	    format;
	    constructor(format, value) {
	        super(value);
	        this.format = format;
	    }
	}
	verbatimString.VerbatimString = VerbatimString;
	
	return verbatimString;
}

var errors = {};

var hasRequiredErrors;

function requireErrors () {
	if (hasRequiredErrors) return errors;
	hasRequiredErrors = 1;
	Object.defineProperty(errors, "__esModule", { value: true });
	errors.MultiErrorReply = errors.TimeoutError = errors.BlobError = errors.SimpleError = errors.ErrorReply = errors.ReconnectStrategyError = errors.RootNodesUnavailableError = errors.SocketClosedUnexpectedlyError = errors.DisconnectsClientError = errors.ClientOfflineError = errors.ClientClosedError = errors.SocketTimeoutError = errors.ConnectionTimeoutError = errors.WatchError = errors.AbortError = void 0;
	class AbortError extends Error {
	    constructor() {
	        super('The command was aborted');
	    }
	}
	errors.AbortError = AbortError;
	class WatchError extends Error {
	    constructor(message = 'One (or more) of the watched keys has been changed') {
	        super(message);
	    }
	}
	errors.WatchError = WatchError;
	class ConnectionTimeoutError extends Error {
	    constructor() {
	        super('Connection timeout');
	    }
	}
	errors.ConnectionTimeoutError = ConnectionTimeoutError;
	class SocketTimeoutError extends Error {
	    constructor(timeout) {
	        super(`Socket timeout timeout. Expecting data, but didn't receive any in ${timeout}ms.`);
	    }
	}
	errors.SocketTimeoutError = SocketTimeoutError;
	class ClientClosedError extends Error {
	    constructor() {
	        super('The client is closed');
	    }
	}
	errors.ClientClosedError = ClientClosedError;
	class ClientOfflineError extends Error {
	    constructor() {
	        super('The client is offline');
	    }
	}
	errors.ClientOfflineError = ClientOfflineError;
	class DisconnectsClientError extends Error {
	    constructor() {
	        super('Disconnects client');
	    }
	}
	errors.DisconnectsClientError = DisconnectsClientError;
	class SocketClosedUnexpectedlyError extends Error {
	    constructor() {
	        super('Socket closed unexpectedly');
	    }
	}
	errors.SocketClosedUnexpectedlyError = SocketClosedUnexpectedlyError;
	class RootNodesUnavailableError extends Error {
	    constructor() {
	        super('All the root nodes are unavailable');
	    }
	}
	errors.RootNodesUnavailableError = RootNodesUnavailableError;
	class ReconnectStrategyError extends Error {
	    originalError;
	    socketError;
	    constructor(originalError, socketError) {
	        super(originalError.message);
	        this.originalError = originalError;
	        this.socketError = socketError;
	    }
	}
	errors.ReconnectStrategyError = ReconnectStrategyError;
	class ErrorReply extends Error {
	    constructor(message) {
	        super(message);
	        this.stack = undefined;
	    }
	}
	errors.ErrorReply = ErrorReply;
	class SimpleError extends ErrorReply {
	}
	errors.SimpleError = SimpleError;
	class BlobError extends ErrorReply {
	}
	errors.BlobError = BlobError;
	class TimeoutError extends Error {
	}
	errors.TimeoutError = TimeoutError;
	class MultiErrorReply extends ErrorReply {
	    replies;
	    errorIndexes;
	    constructor(replies, errorIndexes) {
	        super(`${errorIndexes.length} commands failed, see .replies and .errorIndexes for more information`);
	        this.replies = replies;
	        this.errorIndexes = errorIndexes;
	    }
	    *errors() {
	        for (const index of this.errorIndexes) {
	            yield this.replies[index];
	        }
	    }
	}
	errors.MultiErrorReply = MultiErrorReply;
	
	return errors;
}

var hasRequiredDecoder;

function requireDecoder () {
	if (hasRequiredDecoder) return decoder;
	hasRequiredDecoder = 1;
	(function (exports) {
		var _a;
		Object.defineProperty(exports, "__esModule", { value: true });
		exports.Decoder = exports.PUSH_TYPE_MAPPING = exports.RESP_TYPES = void 0;
		// @ts-nocheck
		const verbatim_string_1 = requireVerbatimString();
		const errors_1 = requireErrors();
		// https://github.com/redis/redis-specifications/blob/master/protocol/RESP3.md
		exports.RESP_TYPES = {
		    NULL: 95, // _
		    BOOLEAN: 35, // #
		    NUMBER: 58, // :
		    BIG_NUMBER: 40, // (
		    DOUBLE: 44, // ,
		    SIMPLE_STRING: 43, // +
		    BLOB_STRING: 36, // $
		    VERBATIM_STRING: 61, // =
		    SIMPLE_ERROR: 45, // -
		    BLOB_ERROR: 33, // !
		    ARRAY: 42, // *
		    SET: 126, // ~
		    MAP: 37, // %
		    PUSH: 62 // >
		};
		const ASCII = {
		    '\r': 13,
		    't': 116,
		    '+': 43,
		    '-': 45,
		    '0': 48,
		    '.': 46,
		    'i': 105,
		    'n': 110,
		    'E': 69,
		    'e': 101
		};
		exports.PUSH_TYPE_MAPPING = {
		    [exports.RESP_TYPES.BLOB_STRING]: Buffer
		};
		class Decoder {
		    onReply;
		    onErrorReply;
		    onPush;
		    getTypeMapping;
		    #cursor = 0;
		    #next;
		    constructor(config) {
		        this.onReply = config.onReply;
		        this.onErrorReply = config.onErrorReply;
		        this.onPush = config.onPush;
		        this.getTypeMapping = config.getTypeMapping;
		    }
		    reset() {
		        this.#cursor = 0;
		        this.#next = undefined;
		    }
		    write(chunk) {
		        if (this.#cursor >= chunk.length) {
		            this.#cursor -= chunk.length;
		            return;
		        }
		        if (this.#next) {
		            if (this.#next(chunk) || this.#cursor >= chunk.length) {
		                this.#cursor -= chunk.length;
		                return;
		            }
		        }
		        do {
		            const type = chunk[this.#cursor];
		            if (++this.#cursor === chunk.length) {
		                this.#next = this.#continueDecodeTypeValue.bind(this, type);
		                break;
		            }
		            if (this.#decodeTypeValue(type, chunk)) {
		                break;
		            }
		        } while (this.#cursor < chunk.length);
		        this.#cursor -= chunk.length;
		    }
		    #continueDecodeTypeValue(type, chunk) {
		        this.#next = undefined;
		        return this.#decodeTypeValue(type, chunk);
		    }
		    #decodeTypeValue(type, chunk) {
		        switch (type) {
		            case exports.RESP_TYPES.NULL:
		                this.onReply(this.#decodeNull());
		                return false;
		            case exports.RESP_TYPES.BOOLEAN:
		                return this.#handleDecodedValue(this.onReply, this.#decodeBoolean(chunk));
		            case exports.RESP_TYPES.NUMBER:
		                return this.#handleDecodedValue(this.onReply, this.#decodeNumber(this.getTypeMapping()[exports.RESP_TYPES.NUMBER], chunk));
		            case exports.RESP_TYPES.BIG_NUMBER:
		                return this.#handleDecodedValue(this.onReply, this.#decodeBigNumber(this.getTypeMapping()[exports.RESP_TYPES.BIG_NUMBER], chunk));
		            case exports.RESP_TYPES.DOUBLE:
		                return this.#handleDecodedValue(this.onReply, this.#decodeDouble(this.getTypeMapping()[exports.RESP_TYPES.DOUBLE], chunk));
		            case exports.RESP_TYPES.SIMPLE_STRING:
		                return this.#handleDecodedValue(this.onReply, this.#decodeSimpleString(this.getTypeMapping()[exports.RESP_TYPES.SIMPLE_STRING], chunk));
		            case exports.RESP_TYPES.BLOB_STRING:
		                return this.#handleDecodedValue(this.onReply, this.#decodeBlobString(this.getTypeMapping()[exports.RESP_TYPES.BLOB_STRING], chunk));
		            case exports.RESP_TYPES.VERBATIM_STRING:
		                return this.#handleDecodedValue(this.onReply, this.#decodeVerbatimString(this.getTypeMapping()[exports.RESP_TYPES.VERBATIM_STRING], chunk));
		            case exports.RESP_TYPES.SIMPLE_ERROR:
		                return this.#handleDecodedValue(this.onErrorReply, this.#decodeSimpleError(chunk));
		            case exports.RESP_TYPES.BLOB_ERROR:
		                return this.#handleDecodedValue(this.onErrorReply, this.#decodeBlobError(chunk));
		            case exports.RESP_TYPES.ARRAY:
		                return this.#handleDecodedValue(this.onReply, this.#decodeArray(this.getTypeMapping(), chunk));
		            case exports.RESP_TYPES.SET:
		                return this.#handleDecodedValue(this.onReply, this.#decodeSet(this.getTypeMapping(), chunk));
		            case exports.RESP_TYPES.MAP:
		                return this.#handleDecodedValue(this.onReply, this.#decodeMap(this.getTypeMapping(), chunk));
		            case exports.RESP_TYPES.PUSH:
		                return this.#handleDecodedValue(this.onPush, this.#decodeArray(exports.PUSH_TYPE_MAPPING, chunk));
		            default:
		                throw new Error(`Unknown RESP type ${type} "${String.fromCharCode(type)}"`);
		        }
		    }
		    #handleDecodedValue(cb, value) {
		        if (typeof value === 'function') {
		            this.#next = this.#continueDecodeValue.bind(this, cb, value);
		            return true;
		        }
		        cb(value);
		        return false;
		    }
		    #continueDecodeValue(cb, next, chunk) {
		        this.#next = undefined;
		        return this.#handleDecodedValue(cb, next(chunk));
		    }
		    #decodeNull() {
		        this.#cursor += 2; // skip \r\n
		        return null;
		    }
		    #decodeBoolean(chunk) {
		        const boolean = chunk[this.#cursor] === ASCII.t;
		        this.#cursor += 3; // skip {t | f}\r\n
		        return boolean;
		    }
		    #decodeNumber(type, chunk) {
		        if (type === String) {
		            return this.#decodeSimpleString(String, chunk);
		        }
		        switch (chunk[this.#cursor]) {
		            case ASCII['+']:
		                return this.#maybeDecodeNumberValue(false, chunk);
		            case ASCII['-']:
		                return this.#maybeDecodeNumberValue(true, chunk);
		            default:
		                return this.#decodeNumberValue(false, this.#decodeUnsingedNumber.bind(this, 0), chunk);
		        }
		    }
		    #maybeDecodeNumberValue(isNegative, chunk) {
		        const cb = this.#decodeUnsingedNumber.bind(this, 0);
		        return ++this.#cursor === chunk.length ?
		            this.#decodeNumberValue.bind(this, isNegative, cb) :
		            this.#decodeNumberValue(isNegative, cb, chunk);
		    }
		    #decodeNumberValue(isNegative, numberCb, chunk) {
		        const number = numberCb(chunk);
		        return typeof number === 'function' ?
		            this.#decodeNumberValue.bind(this, isNegative, number) :
		            isNegative ? -number : number;
		    }
		    #decodeUnsingedNumber(number, chunk) {
		        let cursor = this.#cursor;
		        do {
		            const byte = chunk[cursor];
		            if (byte === ASCII['\r']) {
		                this.#cursor = cursor + 2; // skip \r\n
		                return number;
		            }
		            number = number * 10 + byte - ASCII['0'];
		        } while (++cursor < chunk.length);
		        this.#cursor = cursor;
		        return this.#decodeUnsingedNumber.bind(this, number);
		    }
		    #decodeBigNumber(type, chunk) {
		        if (type === String) {
		            return this.#decodeSimpleString(String, chunk);
		        }
		        switch (chunk[this.#cursor]) {
		            case ASCII['+']:
		                return this.#maybeDecodeBigNumberValue(false, chunk);
		            case ASCII['-']:
		                return this.#maybeDecodeBigNumberValue(true, chunk);
		            default:
		                return this.#decodeBigNumberValue(false, this.#decodeUnsingedBigNumber.bind(this, 0n), chunk);
		        }
		    }
		    #maybeDecodeBigNumberValue(isNegative, chunk) {
		        const cb = this.#decodeUnsingedBigNumber.bind(this, 0n);
		        return ++this.#cursor === chunk.length ?
		            this.#decodeBigNumberValue.bind(this, isNegative, cb) :
		            this.#decodeBigNumberValue(isNegative, cb, chunk);
		    }
		    #decodeBigNumberValue(isNegative, bigNumberCb, chunk) {
		        const bigNumber = bigNumberCb(chunk);
		        return typeof bigNumber === 'function' ?
		            this.#decodeBigNumberValue.bind(this, isNegative, bigNumber) :
		            isNegative ? -bigNumber : bigNumber;
		    }
		    #decodeUnsingedBigNumber(bigNumber, chunk) {
		        let cursor = this.#cursor;
		        do {
		            const byte = chunk[cursor];
		            if (byte === ASCII['\r']) {
		                this.#cursor = cursor + 2; // skip \r\n
		                return bigNumber;
		            }
		            bigNumber = bigNumber * 10n + BigInt(byte - ASCII['0']);
		        } while (++cursor < chunk.length);
		        this.#cursor = cursor;
		        return this.#decodeUnsingedBigNumber.bind(this, bigNumber);
		    }
		    #decodeDouble(type, chunk) {
		        if (type === String) {
		            return this.#decodeSimpleString(String, chunk);
		        }
		        switch (chunk[this.#cursor]) {
		            case ASCII.n:
		                this.#cursor += 5; // skip nan\r\n
		                return NaN;
		            case ASCII['+']:
		                return this.#maybeDecodeDoubleInteger(false, chunk);
		            case ASCII['-']:
		                return this.#maybeDecodeDoubleInteger(true, chunk);
		            default:
		                return this.#decodeDoubleInteger(false, 0, chunk);
		        }
		    }
		    #maybeDecodeDoubleInteger(isNegative, chunk) {
		        return ++this.#cursor === chunk.length ?
		            this.#decodeDoubleInteger.bind(this, isNegative, 0) :
		            this.#decodeDoubleInteger(isNegative, 0, chunk);
		    }
		    #decodeDoubleInteger(isNegative, integer, chunk) {
		        if (chunk[this.#cursor] === ASCII.i) {
		            this.#cursor += 5; // skip inf\r\n
		            return isNegative ? -Infinity : Infinity;
		        }
		        return this.#continueDecodeDoubleInteger(isNegative, integer, chunk);
		    }
		    #continueDecodeDoubleInteger(isNegative, integer, chunk) {
		        let cursor = this.#cursor;
		        do {
		            const byte = chunk[cursor];
		            switch (byte) {
		                case ASCII['.']:
		                    this.#cursor = cursor + 1; // skip .
		                    return this.#cursor < chunk.length ?
		                        this.#decodeDoubleDecimal(isNegative, 0, integer, chunk) :
		                        this.#decodeDoubleDecimal.bind(this, isNegative, 0, integer);
		                case ASCII.E:
		                case ASCII.e:
		                    this.#cursor = cursor + 1; // skip E/e
		                    const i = isNegative ? -integer : integer;
		                    return this.#cursor < chunk.length ?
		                        this.#decodeDoubleExponent(i, chunk) :
		                        this.#decodeDoubleExponent.bind(this, i);
		                case ASCII['\r']:
		                    this.#cursor = cursor + 2; // skip \r\n
		                    return isNegative ? -integer : integer;
		                default:
		                    integer = integer * 10 + byte - ASCII['0'];
		            }
		        } while (++cursor < chunk.length);
		        this.#cursor = cursor;
		        return this.#continueDecodeDoubleInteger.bind(this, isNegative, integer);
		    }
		    // Precalculated multipliers for decimal points to improve performance
		    // "... about 15 to 17 decimal places ..."
		    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number#:~:text=about%2015%20to%2017%20decimal%20places
		    static #DOUBLE_DECIMAL_MULTIPLIERS = [
		        1e-1, 1e-2, 1e-3, 1e-4, 1e-5, 1e-6,
		        1e-7, 1e-8, 1e-9, 1e-10, 1e-11, 1e-12,
		        1e-13, 1e-14, 1e-15, 1e-16, 1e-17
		    ];
		    #decodeDoubleDecimal(isNegative, decimalIndex, double, chunk) {
		        let cursor = this.#cursor;
		        do {
		            const byte = chunk[cursor];
		            switch (byte) {
		                case ASCII.E:
		                case ASCII.e:
		                    this.#cursor = cursor + 1; // skip E/e
		                    const d = isNegative ? -double : double;
		                    return this.#cursor === chunk.length ?
		                        this.#decodeDoubleExponent.bind(this, d) :
		                        this.#decodeDoubleExponent(d, chunk);
		                case ASCII['\r']:
		                    this.#cursor = cursor + 2; // skip \r\n
		                    return isNegative ? -double : double;
		            }
		            if (decimalIndex < _a.#DOUBLE_DECIMAL_MULTIPLIERS.length) {
		                double += (byte - ASCII['0']) * _a.#DOUBLE_DECIMAL_MULTIPLIERS[decimalIndex++];
		            }
		        } while (++cursor < chunk.length);
		        this.#cursor = cursor;
		        return this.#decodeDoubleDecimal.bind(this, isNegative, decimalIndex, double);
		    }
		    #decodeDoubleExponent(double, chunk) {
		        switch (chunk[this.#cursor]) {
		            case ASCII['+']:
		                return ++this.#cursor === chunk.length ?
		                    this.#continueDecodeDoubleExponent.bind(this, false, double, 0) :
		                    this.#continueDecodeDoubleExponent(false, double, 0, chunk);
		            case ASCII['-']:
		                return ++this.#cursor === chunk.length ?
		                    this.#continueDecodeDoubleExponent.bind(this, true, double, 0) :
		                    this.#continueDecodeDoubleExponent(true, double, 0, chunk);
		        }
		        return this.#continueDecodeDoubleExponent(false, double, 0, chunk);
		    }
		    #continueDecodeDoubleExponent(isNegative, double, exponent, chunk) {
		        let cursor = this.#cursor;
		        do {
		            const byte = chunk[cursor];
		            if (byte === ASCII['\r']) {
		                this.#cursor = cursor + 2; // skip \r\n
		                return double * 10 ** (isNegative ? -exponent : exponent);
		            }
		            exponent = exponent * 10 + byte - ASCII['0'];
		        } while (++cursor < chunk.length);
		        this.#cursor = cursor;
		        return this.#continueDecodeDoubleExponent.bind(this, isNegative, double, exponent);
		    }
		    #findCRLF(chunk, cursor) {
		        while (chunk[cursor] !== ASCII['\r']) {
		            if (++cursor === chunk.length) {
		                this.#cursor = chunk.length;
		                return -1;
		            }
		        }
		        this.#cursor = cursor + 2; // skip \r\n
		        return cursor;
		    }
		    #decodeSimpleString(type, chunk) {
		        const start = this.#cursor, crlfIndex = this.#findCRLF(chunk, start);
		        if (crlfIndex === -1) {
		            return this.#continueDecodeSimpleString.bind(this, [chunk.subarray(start)], type);
		        }
		        const slice = chunk.subarray(start, crlfIndex);
		        return type === Buffer ?
		            slice :
		            slice.toString();
		    }
		    #continueDecodeSimpleString(chunks, type, chunk) {
		        const start = this.#cursor, crlfIndex = this.#findCRLF(chunk, start);
		        if (crlfIndex === -1) {
		            chunks.push(chunk.subarray(start));
		            return this.#continueDecodeSimpleString.bind(this, chunks, type);
		        }
		        chunks.push(chunk.subarray(start, crlfIndex));
		        return type === Buffer ?
		            Buffer.concat(chunks) :
		            chunks.join('');
		    }
		    #decodeBlobString(type, chunk) {
		        // RESP 2 bulk string null
		        // https://github.com/redis/redis-specifications/blob/master/protocol/RESP2.md#resp-bulk-strings
		        if (chunk[this.#cursor] === ASCII['-']) {
		            this.#cursor += 4; // skip -1\r\n
		            return null;
		        }
		        const length = this.#decodeUnsingedNumber(0, chunk);
		        if (typeof length === 'function') {
		            return this.#continueDecodeBlobStringLength.bind(this, length, type);
		        }
		        else if (this.#cursor >= chunk.length) {
		            return this.#decodeBlobStringWithLength.bind(this, length, type);
		        }
		        return this.#decodeBlobStringWithLength(length, type, chunk);
		    }
		    #continueDecodeBlobStringLength(lengthCb, type, chunk) {
		        const length = lengthCb(chunk);
		        if (typeof length === 'function') {
		            return this.#continueDecodeBlobStringLength.bind(this, length, type);
		        }
		        else if (this.#cursor >= chunk.length) {
		            return this.#decodeBlobStringWithLength.bind(this, length, type);
		        }
		        return this.#decodeBlobStringWithLength(length, type, chunk);
		    }
		    #decodeStringWithLength(length, skip, type, chunk) {
		        const end = this.#cursor + length;
		        if (end >= chunk.length) {
		            const slice = chunk.subarray(this.#cursor);
		            this.#cursor = chunk.length;
		            return this.#continueDecodeStringWithLength.bind(this, length - slice.length, [slice], skip, type);
		        }
		        const slice = chunk.subarray(this.#cursor, end);
		        this.#cursor = end + skip;
		        return type === Buffer ?
		            slice :
		            slice.toString();
		    }
		    #continueDecodeStringWithLength(length, chunks, skip, type, chunk) {
		        const end = this.#cursor + length;
		        if (end >= chunk.length) {
		            const slice = chunk.subarray(this.#cursor);
		            chunks.push(slice);
		            this.#cursor = chunk.length;
		            return this.#continueDecodeStringWithLength.bind(this, length - slice.length, chunks, skip, type);
		        }
		        chunks.push(chunk.subarray(this.#cursor, end));
		        this.#cursor = end + skip;
		        return type === Buffer ?
		            Buffer.concat(chunks) :
		            chunks.join('');
		    }
		    #decodeBlobStringWithLength(length, type, chunk) {
		        return this.#decodeStringWithLength(length, 2, type, chunk);
		    }
		    #decodeVerbatimString(type, chunk) {
		        return this.#continueDecodeVerbatimStringLength(this.#decodeUnsingedNumber.bind(this, 0), type, chunk);
		    }
		    #continueDecodeVerbatimStringLength(lengthCb, type, chunk) {
		        const length = lengthCb(chunk);
		        return typeof length === 'function' ?
		            this.#continueDecodeVerbatimStringLength.bind(this, length, type) :
		            this.#decodeVerbatimStringWithLength(length, type, chunk);
		    }
		    #decodeVerbatimStringWithLength(length, type, chunk) {
		        const stringLength = length - 4; // skip <format>:
		        if (type === verbatim_string_1.VerbatimString) {
		            return this.#decodeVerbatimStringFormat(stringLength, chunk);
		        }
		        this.#cursor += 4; // skip <format>:
		        return this.#cursor >= chunk.length ?
		            this.#decodeBlobStringWithLength.bind(this, stringLength, type) :
		            this.#decodeBlobStringWithLength(stringLength, type, chunk);
		    }
		    #decodeVerbatimStringFormat(stringLength, chunk) {
		        const formatCb = this.#decodeStringWithLength.bind(this, 3, 1, String);
		        return this.#cursor >= chunk.length ?
		            this.#continueDecodeVerbatimStringFormat.bind(this, stringLength, formatCb) :
		            this.#continueDecodeVerbatimStringFormat(stringLength, formatCb, chunk);
		    }
		    #continueDecodeVerbatimStringFormat(stringLength, formatCb, chunk) {
		        const format = formatCb(chunk);
		        return typeof format === 'function' ?
		            this.#continueDecodeVerbatimStringFormat.bind(this, stringLength, format) :
		            this.#decodeVerbatimStringWithFormat(stringLength, format, chunk);
		    }
		    #decodeVerbatimStringWithFormat(stringLength, format, chunk) {
		        return this.#continueDecodeVerbatimStringWithFormat(format, this.#decodeBlobStringWithLength.bind(this, stringLength, String), chunk);
		    }
		    #continueDecodeVerbatimStringWithFormat(format, stringCb, chunk) {
		        const string = stringCb(chunk);
		        return typeof string === 'function' ?
		            this.#continueDecodeVerbatimStringWithFormat.bind(this, format, string) :
		            new verbatim_string_1.VerbatimString(format, string);
		    }
		    #decodeSimpleError(chunk) {
		        const string = this.#decodeSimpleString(String, chunk);
		        return typeof string === 'function' ?
		            this.#continueDecodeSimpleError.bind(this, string) :
		            new errors_1.SimpleError(string);
		    }
		    #continueDecodeSimpleError(stringCb, chunk) {
		        const string = stringCb(chunk);
		        return typeof string === 'function' ?
		            this.#continueDecodeSimpleError.bind(this, string) :
		            new errors_1.SimpleError(string);
		    }
		    #decodeBlobError(chunk) {
		        const string = this.#decodeBlobString(String, chunk);
		        return typeof string === 'function' ?
		            this.#continueDecodeBlobError.bind(this, string) :
		            new errors_1.BlobError(string);
		    }
		    #continueDecodeBlobError(stringCb, chunk) {
		        const string = stringCb(chunk);
		        return typeof string === 'function' ?
		            this.#continueDecodeBlobError.bind(this, string) :
		            new errors_1.BlobError(string);
		    }
		    #decodeNestedType(typeMapping, chunk) {
		        const type = chunk[this.#cursor];
		        return ++this.#cursor === chunk.length ?
		            this.#decodeNestedTypeValue.bind(this, type, typeMapping) :
		            this.#decodeNestedTypeValue(type, typeMapping, chunk);
		    }
		    #decodeNestedTypeValue(type, typeMapping, chunk) {
		        switch (type) {
		            case exports.RESP_TYPES.NULL:
		                return this.#decodeNull();
		            case exports.RESP_TYPES.BOOLEAN:
		                return this.#decodeBoolean(chunk);
		            case exports.RESP_TYPES.NUMBER:
		                return this.#decodeNumber(typeMapping[exports.RESP_TYPES.NUMBER], chunk);
		            case exports.RESP_TYPES.BIG_NUMBER:
		                return this.#decodeBigNumber(typeMapping[exports.RESP_TYPES.BIG_NUMBER], chunk);
		            case exports.RESP_TYPES.DOUBLE:
		                return this.#decodeDouble(typeMapping[exports.RESP_TYPES.DOUBLE], chunk);
		            case exports.RESP_TYPES.SIMPLE_STRING:
		                return this.#decodeSimpleString(typeMapping[exports.RESP_TYPES.SIMPLE_STRING], chunk);
		            case exports.RESP_TYPES.BLOB_STRING:
		                return this.#decodeBlobString(typeMapping[exports.RESP_TYPES.BLOB_STRING], chunk);
		            case exports.RESP_TYPES.VERBATIM_STRING:
		                return this.#decodeVerbatimString(typeMapping[exports.RESP_TYPES.VERBATIM_STRING], chunk);
		            case exports.RESP_TYPES.SIMPLE_ERROR:
		                return this.#decodeSimpleError(chunk);
		            case exports.RESP_TYPES.BLOB_ERROR:
		                return this.#decodeBlobError(chunk);
		            case exports.RESP_TYPES.ARRAY:
		                return this.#decodeArray(typeMapping, chunk);
		            case exports.RESP_TYPES.SET:
		                return this.#decodeSet(typeMapping, chunk);
		            case exports.RESP_TYPES.MAP:
		                return this.#decodeMap(typeMapping, chunk);
		            default:
		                throw new Error(`Unknown RESP type ${type} "${String.fromCharCode(type)}"`);
		        }
		    }
		    #decodeArray(typeMapping, chunk) {
		        // RESP 2 null
		        // https://github.com/redis/redis-specifications/blob/master/protocol/RESP2.md#resp-arrays
		        if (chunk[this.#cursor] === ASCII['-']) {
		            this.#cursor += 4; // skip -1\r\n
		            return null;
		        }
		        return this.#decodeArrayWithLength(this.#decodeUnsingedNumber(0, chunk), typeMapping, chunk);
		    }
		    #decodeArrayWithLength(length, typeMapping, chunk) {
		        return typeof length === 'function' ?
		            this.#continueDecodeArrayLength.bind(this, length, typeMapping) :
		            this.#decodeArrayItems(new Array(length), 0, typeMapping, chunk);
		    }
		    #continueDecodeArrayLength(lengthCb, typeMapping, chunk) {
		        return this.#decodeArrayWithLength(lengthCb(chunk), typeMapping, chunk);
		    }
		    #decodeArrayItems(array, filled, typeMapping, chunk) {
		        for (let i = filled; i < array.length; i++) {
		            if (this.#cursor >= chunk.length) {
		                return this.#decodeArrayItems.bind(this, array, i, typeMapping);
		            }
		            const item = this.#decodeNestedType(typeMapping, chunk);
		            if (typeof item === 'function') {
		                return this.#continueDecodeArrayItems.bind(this, array, i, item, typeMapping);
		            }
		            array[i] = item;
		        }
		        return array;
		    }
		    #continueDecodeArrayItems(array, filled, itemCb, typeMapping, chunk) {
		        const item = itemCb(chunk);
		        if (typeof item === 'function') {
		            return this.#continueDecodeArrayItems.bind(this, array, filled, item, typeMapping);
		        }
		        array[filled++] = item;
		        return this.#decodeArrayItems(array, filled, typeMapping, chunk);
		    }
		    #decodeSet(typeMapping, chunk) {
		        const length = this.#decodeUnsingedNumber(0, chunk);
		        if (typeof length === 'function') {
		            return this.#continueDecodeSetLength.bind(this, length, typeMapping);
		        }
		        return this.#decodeSetItems(length, typeMapping, chunk);
		    }
		    #continueDecodeSetLength(lengthCb, typeMapping, chunk) {
		        const length = lengthCb(chunk);
		        return typeof length === 'function' ?
		            this.#continueDecodeSetLength.bind(this, length, typeMapping) :
		            this.#decodeSetItems(length, typeMapping, chunk);
		    }
		    #decodeSetItems(length, typeMapping, chunk) {
		        return typeMapping[exports.RESP_TYPES.SET] === Set ?
		            this.#decodeSetAsSet(new Set(), length, typeMapping, chunk) :
		            this.#decodeArrayItems(new Array(length), 0, typeMapping, chunk);
		    }
		    #decodeSetAsSet(set, remaining, typeMapping, chunk) {
		        // using `remaining` instead of `length` & `set.size` to make it work even if the set contains duplicates
		        while (remaining > 0) {
		            if (this.#cursor >= chunk.length) {
		                return this.#decodeSetAsSet.bind(this, set, remaining, typeMapping);
		            }
		            const item = this.#decodeNestedType(typeMapping, chunk);
		            if (typeof item === 'function') {
		                return this.#continueDecodeSetAsSet.bind(this, set, remaining, item, typeMapping);
		            }
		            set.add(item);
		            --remaining;
		        }
		        return set;
		    }
		    #continueDecodeSetAsSet(set, remaining, itemCb, typeMapping, chunk) {
		        const item = itemCb(chunk);
		        if (typeof item === 'function') {
		            return this.#continueDecodeSetAsSet.bind(this, set, remaining, item, typeMapping);
		        }
		        set.add(item);
		        return this.#decodeSetAsSet(set, remaining - 1, typeMapping, chunk);
		    }
		    #decodeMap(typeMapping, chunk) {
		        const length = this.#decodeUnsingedNumber(0, chunk);
		        if (typeof length === 'function') {
		            return this.#continueDecodeMapLength.bind(this, length, typeMapping);
		        }
		        return this.#decodeMapItems(length, typeMapping, chunk);
		    }
		    #continueDecodeMapLength(lengthCb, typeMapping, chunk) {
		        const length = lengthCb(chunk);
		        return typeof length === 'function' ?
		            this.#continueDecodeMapLength.bind(this, length, typeMapping) :
		            this.#decodeMapItems(length, typeMapping, chunk);
		    }
		    #decodeMapItems(length, typeMapping, chunk) {
		        switch (typeMapping[exports.RESP_TYPES.MAP]) {
		            case Map:
		                return this.#decodeMapAsMap(new Map(), length, typeMapping, chunk);
		            case Array:
		                return this.#decodeArrayItems(new Array(length * 2), 0, typeMapping, chunk);
		            default:
		                return this.#decodeMapAsObject(Object.create(null), length, typeMapping, chunk);
		        }
		    }
		    #decodeMapAsMap(map, remaining, typeMapping, chunk) {
		        // using `remaining` instead of `length` & `map.size` to make it work even if the map contains duplicate keys
		        while (remaining > 0) {
		            if (this.#cursor >= chunk.length) {
		                return this.#decodeMapAsMap.bind(this, map, remaining, typeMapping);
		            }
		            const key = this.#decodeMapKey(typeMapping, chunk);
		            if (typeof key === 'function') {
		                return this.#continueDecodeMapKey.bind(this, map, remaining, key, typeMapping);
		            }
		            if (this.#cursor >= chunk.length) {
		                return this.#continueDecodeMapValue.bind(this, map, remaining, key, this.#decodeNestedType.bind(this, typeMapping), typeMapping);
		            }
		            const value = this.#decodeNestedType(typeMapping, chunk);
		            if (typeof value === 'function') {
		                return this.#continueDecodeMapValue.bind(this, map, remaining, key, value, typeMapping);
		            }
		            map.set(key, value);
		            --remaining;
		        }
		        return map;
		    }
		    #decodeMapKey(typeMapping, chunk) {
		        const type = chunk[this.#cursor];
		        return ++this.#cursor === chunk.length ?
		            this.#decodeMapKeyValue.bind(this, type, typeMapping) :
		            this.#decodeMapKeyValue(type, typeMapping, chunk);
		    }
		    #decodeMapKeyValue(type, typeMapping, chunk) {
		        switch (type) {
		            // decode simple string map key as string (and not as buffer)
		            case exports.RESP_TYPES.SIMPLE_STRING:
		                return this.#decodeSimpleString(String, chunk);
		            // decode blob string map key as string (and not as buffer)
		            case exports.RESP_TYPES.BLOB_STRING:
		                return this.#decodeBlobString(String, chunk);
		            default:
		                return this.#decodeNestedTypeValue(type, typeMapping, chunk);
		        }
		    }
		    #continueDecodeMapKey(map, remaining, keyCb, typeMapping, chunk) {
		        const key = keyCb(chunk);
		        if (typeof key === 'function') {
		            return this.#continueDecodeMapKey.bind(this, map, remaining, key, typeMapping);
		        }
		        if (this.#cursor >= chunk.length) {
		            return this.#continueDecodeMapValue.bind(this, map, remaining, key, this.#decodeNestedType.bind(this, typeMapping), typeMapping);
		        }
		        const value = this.#decodeNestedType(typeMapping, chunk);
		        if (typeof value === 'function') {
		            return this.#continueDecodeMapValue.bind(this, map, remaining, key, value, typeMapping);
		        }
		        map.set(key, value);
		        return this.#decodeMapAsMap(map, remaining - 1, typeMapping, chunk);
		    }
		    #continueDecodeMapValue(map, remaining, key, valueCb, typeMapping, chunk) {
		        const value = valueCb(chunk);
		        if (typeof value === 'function') {
		            return this.#continueDecodeMapValue.bind(this, map, remaining, key, value, typeMapping);
		        }
		        map.set(key, value);
		        return this.#decodeMapAsMap(map, remaining - 1, typeMapping, chunk);
		    }
		    #decodeMapAsObject(object, remaining, typeMapping, chunk) {
		        while (remaining > 0) {
		            if (this.#cursor >= chunk.length) {
		                return this.#decodeMapAsObject.bind(this, object, remaining, typeMapping);
		            }
		            const key = this.#decodeMapKey(typeMapping, chunk);
		            if (typeof key === 'function') {
		                return this.#continueDecodeMapAsObjectKey.bind(this, object, remaining, key, typeMapping);
		            }
		            if (this.#cursor >= chunk.length) {
		                return this.#continueDecodeMapAsObjectValue.bind(this, object, remaining, key, this.#decodeNestedType.bind(this, typeMapping), typeMapping);
		            }
		            const value = this.#decodeNestedType(typeMapping, chunk);
		            if (typeof value === 'function') {
		                return this.#continueDecodeMapAsObjectValue.bind(this, object, remaining, key, value, typeMapping);
		            }
		            object[key] = value;
		            --remaining;
		        }
		        return object;
		    }
		    #continueDecodeMapAsObjectKey(object, remaining, keyCb, typeMapping, chunk) {
		        const key = keyCb(chunk);
		        if (typeof key === 'function') {
		            return this.#continueDecodeMapAsObjectKey.bind(this, object, remaining, key, typeMapping);
		        }
		        if (this.#cursor >= chunk.length) {
		            return this.#continueDecodeMapAsObjectValue.bind(this, object, remaining, key, this.#decodeNestedType.bind(this, typeMapping), typeMapping);
		        }
		        const value = this.#decodeNestedType(typeMapping, chunk);
		        if (typeof value === 'function') {
		            return this.#continueDecodeMapAsObjectValue.bind(this, object, remaining, key, value, typeMapping);
		        }
		        object[key] = value;
		        return this.#decodeMapAsObject(object, remaining - 1, typeMapping, chunk);
		    }
		    #continueDecodeMapAsObjectValue(object, remaining, key, valueCb, typeMapping, chunk) {
		        const value = valueCb(chunk);
		        if (typeof value === 'function') {
		            return this.#continueDecodeMapAsObjectValue.bind(this, object, remaining, key, value, typeMapping);
		        }
		        object[key] = value;
		        return this.#decodeMapAsObject(object, remaining - 1, typeMapping, chunk);
		    }
		}
		exports.Decoder = Decoder;
		_a = Decoder;
		
	} (decoder));
	return decoder;
}

var luaScript = {};

var hasRequiredLuaScript;

function requireLuaScript () {
	if (hasRequiredLuaScript) return luaScript;
	hasRequiredLuaScript = 1;
	Object.defineProperty(luaScript, "__esModule", { value: true });
	luaScript.scriptSha1 = luaScript.defineScript = void 0;
	const node_crypto_1 = require$$0;
	function defineScript(script) {
	    return {
	        ...script,
	        SHA1: scriptSha1(script.SCRIPT)
	    };
	}
	luaScript.defineScript = defineScript;
	function scriptSha1(script) {
	    return (0, node_crypto_1.createHash)('sha1').update(script).digest('hex');
	}
	luaScript.scriptSha1 = scriptSha1;
	
	return luaScript;
}

var client = {};

var commands$5 = {};

var ACL_CAT = {};

var hasRequiredACL_CAT;

function requireACL_CAT () {
	if (hasRequiredACL_CAT) return ACL_CAT;
	hasRequiredACL_CAT = 1;
	Object.defineProperty(ACL_CAT, "__esModule", { value: true });
	ACL_CAT.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Lists ACL categories or commands in a category
	     * @param parser - The Redis command parser
	     * @param categoryName - Optional category name to filter commands
	     */
	    parseCommand(parser, categoryName) {
	        parser.push('ACL', 'CAT');
	        if (categoryName) {
	            parser.push(categoryName);
	        }
	    },
	    transformReply: undefined
	};
	
	return ACL_CAT;
}

var ACL_DELUSER = {};

var hasRequiredACL_DELUSER;

function requireACL_DELUSER () {
	if (hasRequiredACL_DELUSER) return ACL_DELUSER;
	hasRequiredACL_DELUSER = 1;
	Object.defineProperty(ACL_DELUSER, "__esModule", { value: true });
	ACL_DELUSER.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Deletes one or more users from the ACL
	     * @param parser - The Redis command parser
	     * @param username - Username(s) to delete
	     */
	    parseCommand(parser, username) {
	        parser.push('ACL', 'DELUSER');
	        parser.pushVariadic(username);
	    },
	    transformReply: undefined
	};
	
	return ACL_DELUSER;
}

var ACL_DRYRUN = {};

var hasRequiredACL_DRYRUN;

function requireACL_DRYRUN () {
	if (hasRequiredACL_DRYRUN) return ACL_DRYRUN;
	hasRequiredACL_DRYRUN = 1;
	Object.defineProperty(ACL_DRYRUN, "__esModule", { value: true });
	ACL_DRYRUN.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Simulates ACL operations without executing them
	     * @param parser - The Redis command parser
	     * @param username - Username to simulate ACL operations for
	     * @param command - Command arguments to simulate
	     */
	    parseCommand(parser, username, command) {
	        parser.push('ACL', 'DRYRUN', username, ...command);
	    },
	    transformReply: undefined
	};
	
	return ACL_DRYRUN;
}

var ACL_GENPASS = {};

var hasRequiredACL_GENPASS;

function requireACL_GENPASS () {
	if (hasRequiredACL_GENPASS) return ACL_GENPASS;
	hasRequiredACL_GENPASS = 1;
	Object.defineProperty(ACL_GENPASS, "__esModule", { value: true });
	ACL_GENPASS.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Generates a secure password for ACL users
	     * @param parser - The Redis command parser
	     * @param bits - Optional number of bits for password entropy
	     */
	    parseCommand(parser, bits) {
	        parser.push('ACL', 'GENPASS');
	        if (bits) {
	            parser.push(bits.toString());
	        }
	    },
	    transformReply: undefined
	};
	
	return ACL_GENPASS;
}

var ACL_GETUSER = {};

var hasRequiredACL_GETUSER;

function requireACL_GETUSER () {
	if (hasRequiredACL_GETUSER) return ACL_GETUSER;
	hasRequiredACL_GETUSER = 1;
	Object.defineProperty(ACL_GETUSER, "__esModule", { value: true });
	ACL_GETUSER.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Returns ACL information about a specific user
	     * @param parser - The Redis command parser
	     * @param username - Username to get information for
	     */
	    parseCommand(parser, username) {
	        parser.push('ACL', 'GETUSER', username);
	    },
	    transformReply: {
	        2: (reply) => ({
	            flags: reply[1],
	            passwords: reply[3],
	            commands: reply[5],
	            keys: reply[7],
	            channels: reply[9],
	            selectors: reply[11]?.map(selector => {
	                const inferred = selector;
	                return {
	                    commands: inferred[1],
	                    keys: inferred[3],
	                    channels: inferred[5]
	                };
	            })
	        }),
	        3: undefined
	    }
	};
	
	return ACL_GETUSER;
}

var ACL_LIST = {};

var hasRequiredACL_LIST;

function requireACL_LIST () {
	if (hasRequiredACL_LIST) return ACL_LIST;
	hasRequiredACL_LIST = 1;
	Object.defineProperty(ACL_LIST, "__esModule", { value: true });
	ACL_LIST.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Returns all configured ACL users and their permissions
	     * @param parser - The Redis command parser
	     */
	    parseCommand(parser) {
	        parser.push('ACL', 'LIST');
	    },
	    transformReply: undefined
	};
	
	return ACL_LIST;
}

var ACL_LOAD = {};

var hasRequiredACL_LOAD;

function requireACL_LOAD () {
	if (hasRequiredACL_LOAD) return ACL_LOAD;
	hasRequiredACL_LOAD = 1;
	Object.defineProperty(ACL_LOAD, "__esModule", { value: true });
	ACL_LOAD.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Reloads ACL configuration from the ACL file
	     * @param parser - The Redis command parser
	     */
	    parseCommand(parser) {
	        parser.push('ACL', 'LOAD');
	    },
	    transformReply: undefined
	};
	
	return ACL_LOAD;
}

var ACL_LOG_RESET = {};

var ACL_LOG = {};

var genericTransformers = {};

var parser = {};

var hasRequiredParser;

function requireParser () {
	if (hasRequiredParser) return parser;
	hasRequiredParser = 1;
	Object.defineProperty(parser, "__esModule", { value: true });
	parser.BasicCommandParser = void 0;
	class BasicCommandParser {
	    #redisArgs = [];
	    #keys = [];
	    preserve;
	    get redisArgs() {
	        return this.#redisArgs;
	    }
	    get keys() {
	        return this.#keys;
	    }
	    get firstKey() {
	        return this.#keys[0];
	    }
	    get cacheKey() {
	        const tmp = new Array(this.#redisArgs.length * 2);
	        for (let i = 0; i < this.#redisArgs.length; i++) {
	            tmp[i] = this.#redisArgs[i].length;
	            tmp[i + this.#redisArgs.length] = this.#redisArgs[i];
	        }
	        return tmp.join('_');
	    }
	    push(...arg) {
	        this.#redisArgs.push(...arg);
	    }
	    ;
	    pushVariadic(vals) {
	        if (Array.isArray(vals)) {
	            for (const val of vals) {
	                this.push(val);
	            }
	        }
	        else {
	            this.push(vals);
	        }
	    }
	    pushVariadicWithLength(vals) {
	        if (Array.isArray(vals)) {
	            this.#redisArgs.push(vals.length.toString());
	        }
	        else {
	            this.#redisArgs.push('1');
	        }
	        this.pushVariadic(vals);
	    }
	    pushVariadicNumber(vals) {
	        if (Array.isArray(vals)) {
	            for (const val of vals) {
	                this.push(val.toString());
	            }
	        }
	        else {
	            this.push(vals.toString());
	        }
	    }
	    pushKey(key) {
	        this.#keys.push(key);
	        this.#redisArgs.push(key);
	    }
	    pushKeysLength(keys) {
	        if (Array.isArray(keys)) {
	            this.#redisArgs.push(keys.length.toString());
	        }
	        else {
	            this.#redisArgs.push('1');
	        }
	        this.pushKeys(keys);
	    }
	    pushKeys(keys) {
	        if (Array.isArray(keys)) {
	            this.#keys.push(...keys);
	            this.#redisArgs.push(...keys);
	        }
	        else {
	            this.#keys.push(keys);
	            this.#redisArgs.push(keys);
	        }
	    }
	}
	parser.BasicCommandParser = BasicCommandParser;
	
	return parser;
}

var hasRequiredGenericTransformers;

function requireGenericTransformers () {
	if (hasRequiredGenericTransformers) return genericTransformers;
	hasRequiredGenericTransformers = 1;
	(function (exports) {
		Object.defineProperty(exports, "__esModule", { value: true });
		exports.transformRedisJsonNullReply = exports.transformRedisJsonReply = exports.transformRedisJsonArgument = exports.transformStreamsMessagesReplyResp3 = exports.transformStreamsMessagesReplyResp2 = exports.transformStreamMessagesReply = exports.transformStreamMessageNullReply = exports.transformStreamMessageReply = exports.parseArgs = exports.parseZKeysArguments = exports.transformRangeReply = exports.parseSlotRangesArguments = exports.transformFunctionListItemReply = exports.RedisFunctionFlags = exports.transformCommandReply = exports.CommandCategories = exports.CommandFlags = exports.parseOptionalVariadicArgument = exports.pushVariadicArgument = exports.pushVariadicNumberArguments = exports.pushVariadicArguments = exports.pushEvalArguments = exports.evalFirstKeyIndex = exports.transformPXAT = exports.transformEXAT = exports.transformSortedSetReply = exports.transformTuplesReply = exports.createTransformTuplesReplyFunc = exports.transformTuplesToMap = exports.transformNullableDoubleReply = exports.createTransformNullableDoubleReplyResp2Func = exports.transformDoubleArrayReply = exports.createTransformDoubleReplyResp2Func = exports.transformDoubleReply = exports.transformStringDoubleArgument = exports.transformDoubleArgument = exports.transformBooleanArrayReply = exports.transformBooleanReply = exports.isArrayReply = exports.isNullReply = void 0;
		const parser_1 = requireParser();
		const decoder_1 = requireDecoder();
		function isNullReply(reply) {
		    return reply === null;
		}
		exports.isNullReply = isNullReply;
		function isArrayReply(reply) {
		    return Array.isArray(reply);
		}
		exports.isArrayReply = isArrayReply;
		exports.transformBooleanReply = {
		    2: (reply) => reply === 1,
		    3: undefined
		};
		exports.transformBooleanArrayReply = {
		    2: (reply) => {
		        return reply.map(exports.transformBooleanReply[2]);
		    },
		    3: undefined
		};
		function transformDoubleArgument(num) {
		    switch (num) {
		        case Infinity:
		            return '+inf';
		        case -Infinity:
		            return '-inf';
		        default:
		            return num.toString();
		    }
		}
		exports.transformDoubleArgument = transformDoubleArgument;
		function transformStringDoubleArgument(num) {
		    if (typeof num !== 'number')
		        return num;
		    return transformDoubleArgument(num);
		}
		exports.transformStringDoubleArgument = transformStringDoubleArgument;
		exports.transformDoubleReply = {
		    2: (reply, preserve, typeMapping) => {
		        const double = typeMapping ? typeMapping[decoder_1.RESP_TYPES.DOUBLE] : undefined;
		        switch (double) {
		            case String: {
		                return reply;
		            }
		            default: {
		                let ret;
		                switch (reply.toString()) {
		                    case 'inf':
		                    case '+inf':
		                        ret = Infinity;
		                    case '-inf':
		                        ret = -Infinity;
		                    case 'nan':
		                        ret = NaN;
		                    default:
		                        ret = Number(reply);
		                }
		                return ret;
		            }
		        }
		    },
		    3: undefined
		};
		function createTransformDoubleReplyResp2Func(preserve, typeMapping) {
		    return (reply) => {
		        return exports.transformDoubleReply[2](reply, preserve, typeMapping);
		    };
		}
		exports.createTransformDoubleReplyResp2Func = createTransformDoubleReplyResp2Func;
		exports.transformDoubleArrayReply = {
		    2: (reply, preserve, typeMapping) => {
		        return reply.map(createTransformDoubleReplyResp2Func(preserve, typeMapping));
		    },
		    3: undefined
		};
		function createTransformNullableDoubleReplyResp2Func(preserve, typeMapping) {
		    return (reply) => {
		        return exports.transformNullableDoubleReply[2](reply, preserve, typeMapping);
		    };
		}
		exports.createTransformNullableDoubleReplyResp2Func = createTransformNullableDoubleReplyResp2Func;
		exports.transformNullableDoubleReply = {
		    2: (reply, preserve, typeMapping) => {
		        if (reply === null)
		            return null;
		        return exports.transformDoubleReply[2](reply, preserve, typeMapping);
		    },
		    3: undefined
		};
		function transformTuplesToMap(reply, func) {
		    const message = Object.create(null);
		    for (let i = 0; i < reply.length; i += 2) {
		        message[reply[i].toString()] = func(reply[i + 1]);
		    }
		    return message;
		}
		exports.transformTuplesToMap = transformTuplesToMap;
		function createTransformTuplesReplyFunc(preserve, typeMapping) {
		    return (reply) => {
		        return transformTuplesReply(reply, preserve, typeMapping);
		    };
		}
		exports.createTransformTuplesReplyFunc = createTransformTuplesReplyFunc;
		function transformTuplesReply(reply, preserve, typeMapping) {
		    const mapType = typeMapping ? typeMapping[decoder_1.RESP_TYPES.MAP] : undefined;
		    const inferred = reply;
		    switch (mapType) {
		        case Array: {
		            return reply;
		        }
		        case Map: {
		            const ret = new Map;
		            for (let i = 0; i < inferred.length; i += 2) {
		                ret.set(inferred[i].toString(), inferred[i + 1]);
		            }
		            return ret;
		        }
		        default: {
		            const ret = Object.create(null);
		            for (let i = 0; i < inferred.length; i += 2) {
		                ret[inferred[i].toString()] = inferred[i + 1];
		            }
		            return ret;
		        }
		    }
		}
		exports.transformTuplesReply = transformTuplesReply;
		exports.transformSortedSetReply = {
		    2: (reply, preserve, typeMapping) => {
		        const inferred = reply, members = [];
		        for (let i = 0; i < inferred.length; i += 2) {
		            members.push({
		                value: inferred[i],
		                score: exports.transformDoubleReply[2](inferred[i + 1], preserve, typeMapping)
		            });
		        }
		        return members;
		    },
		    3: (reply) => {
		        return reply.map(member => {
		            const [value, score] = member;
		            return {
		                value,
		                score
		            };
		        });
		    }
		};
		function transformEXAT(EXAT) {
		    return (typeof EXAT === 'number' ? EXAT : Math.floor(EXAT.getTime() / 1000)).toString();
		}
		exports.transformEXAT = transformEXAT;
		function transformPXAT(PXAT) {
		    return (typeof PXAT === 'number' ? PXAT : PXAT.getTime()).toString();
		}
		exports.transformPXAT = transformPXAT;
		function evalFirstKeyIndex(options) {
		    return options?.keys?.[0];
		}
		exports.evalFirstKeyIndex = evalFirstKeyIndex;
		function pushEvalArguments(args, options) {
		    if (options?.keys) {
		        args.push(options.keys.length.toString(), ...options.keys);
		    }
		    else {
		        args.push('0');
		    }
		    if (options?.arguments) {
		        args.push(...options.arguments);
		    }
		    return args;
		}
		exports.pushEvalArguments = pushEvalArguments;
		function pushVariadicArguments(args, value) {
		    if (Array.isArray(value)) {
		        // https://github.com/redis/node-redis/pull/2160
		        args = args.concat(value);
		    }
		    else {
		        args.push(value);
		    }
		    return args;
		}
		exports.pushVariadicArguments = pushVariadicArguments;
		function pushVariadicNumberArguments(args, value) {
		    if (Array.isArray(value)) {
		        for (const item of value) {
		            args.push(item.toString());
		        }
		    }
		    else {
		        args.push(value.toString());
		    }
		    return args;
		}
		exports.pushVariadicNumberArguments = pushVariadicNumberArguments;
		function pushVariadicArgument(args, value) {
		    if (Array.isArray(value)) {
		        args.push(value.length.toString(), ...value);
		    }
		    else {
		        args.push('1', value);
		    }
		    return args;
		}
		exports.pushVariadicArgument = pushVariadicArgument;
		function parseOptionalVariadicArgument(parser, name, value) {
		    if (value === undefined)
		        return;
		    parser.push(name);
		    parser.pushVariadicWithLength(value);
		}
		exports.parseOptionalVariadicArgument = parseOptionalVariadicArgument;
		var CommandFlags;
		(function (CommandFlags) {
		    CommandFlags["WRITE"] = "write";
		    CommandFlags["READONLY"] = "readonly";
		    CommandFlags["DENYOOM"] = "denyoom";
		    CommandFlags["ADMIN"] = "admin";
		    CommandFlags["PUBSUB"] = "pubsub";
		    CommandFlags["NOSCRIPT"] = "noscript";
		    CommandFlags["RANDOM"] = "random";
		    CommandFlags["SORT_FOR_SCRIPT"] = "sort_for_script";
		    CommandFlags["LOADING"] = "loading";
		    CommandFlags["STALE"] = "stale";
		    CommandFlags["SKIP_MONITOR"] = "skip_monitor";
		    CommandFlags["ASKING"] = "asking";
		    CommandFlags["FAST"] = "fast";
		    CommandFlags["MOVABLEKEYS"] = "movablekeys"; // keys have no pre-determined position. You must discover keys yourself.
		})(CommandFlags || (exports.CommandFlags = CommandFlags = {}));
		var CommandCategories;
		(function (CommandCategories) {
		    CommandCategories["KEYSPACE"] = "@keyspace";
		    CommandCategories["READ"] = "@read";
		    CommandCategories["WRITE"] = "@write";
		    CommandCategories["SET"] = "@set";
		    CommandCategories["SORTEDSET"] = "@sortedset";
		    CommandCategories["LIST"] = "@list";
		    CommandCategories["HASH"] = "@hash";
		    CommandCategories["STRING"] = "@string";
		    CommandCategories["BITMAP"] = "@bitmap";
		    CommandCategories["HYPERLOGLOG"] = "@hyperloglog";
		    CommandCategories["GEO"] = "@geo";
		    CommandCategories["STREAM"] = "@stream";
		    CommandCategories["PUBSUB"] = "@pubsub";
		    CommandCategories["ADMIN"] = "@admin";
		    CommandCategories["FAST"] = "@fast";
		    CommandCategories["SLOW"] = "@slow";
		    CommandCategories["BLOCKING"] = "@blocking";
		    CommandCategories["DANGEROUS"] = "@dangerous";
		    CommandCategories["CONNECTION"] = "@connection";
		    CommandCategories["TRANSACTION"] = "@transaction";
		    CommandCategories["SCRIPTING"] = "@scripting";
		})(CommandCategories || (exports.CommandCategories = CommandCategories = {}));
		function transformCommandReply([name, arity, flags, firstKeyIndex, lastKeyIndex, step, categories]) {
		    return {
		        name,
		        arity,
		        flags: new Set(flags),
		        firstKeyIndex,
		        lastKeyIndex,
		        step,
		        categories: new Set(categories)
		    };
		}
		exports.transformCommandReply = transformCommandReply;
		var RedisFunctionFlags;
		(function (RedisFunctionFlags) {
		    RedisFunctionFlags["NO_WRITES"] = "no-writes";
		    RedisFunctionFlags["ALLOW_OOM"] = "allow-oom";
		    RedisFunctionFlags["ALLOW_STALE"] = "allow-stale";
		    RedisFunctionFlags["NO_CLUSTER"] = "no-cluster";
		})(RedisFunctionFlags || (exports.RedisFunctionFlags = RedisFunctionFlags = {}));
		function transformFunctionListItemReply(reply) {
		    return {
		        libraryName: reply[1],
		        engine: reply[3],
		        functions: reply[5].map(fn => ({
		            name: fn[1],
		            description: fn[3],
		            flags: fn[5]
		        }))
		    };
		}
		exports.transformFunctionListItemReply = transformFunctionListItemReply;
		function parseSlotRangeArguments(parser, range) {
		    parser.push(range.start.toString(), range.end.toString());
		}
		function parseSlotRangesArguments(parser, ranges) {
		    if (Array.isArray(ranges)) {
		        for (const range of ranges) {
		            parseSlotRangeArguments(parser, range);
		        }
		    }
		    else {
		        parseSlotRangeArguments(parser, ranges);
		    }
		}
		exports.parseSlotRangesArguments = parseSlotRangesArguments;
		function transformRangeReply([start, end]) {
		    return {
		        start,
		        end
		    };
		}
		exports.transformRangeReply = transformRangeReply;
		function parseZKeysArguments(parser, keys) {
		    if (Array.isArray(keys)) {
		        parser.push(keys.length.toString());
		        if (keys.length) {
		            if (isPlainKeys(keys)) {
		                parser.pushKeys(keys);
		            }
		            else {
		                for (let i = 0; i < keys.length; i++) {
		                    parser.pushKey(keys[i].key);
		                }
		                parser.push('WEIGHTS');
		                for (let i = 0; i < keys.length; i++) {
		                    parser.push(transformDoubleArgument(keys[i].weight));
		                }
		            }
		        }
		    }
		    else {
		        parser.push('1');
		        if (isPlainKey(keys)) {
		            parser.pushKey(keys);
		        }
		        else {
		            parser.pushKey(keys.key);
		            parser.push('WEIGHTS', transformDoubleArgument(keys.weight));
		        }
		    }
		}
		exports.parseZKeysArguments = parseZKeysArguments;
		function isPlainKey(key) {
		    return typeof key === 'string' || key instanceof Buffer;
		}
		function isPlainKeys(keys) {
		    return isPlainKey(keys[0]);
		}
		/**
		 * @deprecated
		 */
		function parseArgs(command, ...args) {
		    const parser = new parser_1.BasicCommandParser();
		    command.parseCommand(parser, ...args);
		    const redisArgs = parser.redisArgs;
		    if (parser.preserve) {
		        redisArgs.preserve = parser.preserve;
		    }
		    return redisArgs;
		}
		exports.parseArgs = parseArgs;
		function transformStreamMessageReply(typeMapping, reply) {
		    const [id, message] = reply;
		    return {
		        id: id,
		        message: transformTuplesReply(message, undefined, typeMapping)
		    };
		}
		exports.transformStreamMessageReply = transformStreamMessageReply;
		function transformStreamMessageNullReply(typeMapping, reply) {
		    return isNullReply(reply) ? reply : transformStreamMessageReply(typeMapping, reply);
		}
		exports.transformStreamMessageNullReply = transformStreamMessageNullReply;
		function transformStreamMessagesReply(r, typeMapping) {
		    const reply = r;
		    return reply.map(transformStreamMessageReply.bind(undefined, typeMapping));
		}
		exports.transformStreamMessagesReply = transformStreamMessagesReply;
		function transformStreamsMessagesReplyResp2(reply, preserve, typeMapping) {
		    // FUTURE: resposne type if resp3 was working, reverting to old v4 for now
		    //: MapReply<BlobStringReply | string, StreamMessagesReply> | NullReply {
		    if (reply === null)
		        return null;
		    switch (typeMapping ? typeMapping[decoder_1.RESP_TYPES.MAP] : undefined) {
		        /* FUTURE: a response type for when resp3 is working properly
		            case Map: {
		              const ret = new Map<string, StreamMessagesReply>();
		        
		              for (let i=0; i < reply.length; i++) {
		                const stream = reply[i] as unknown as UnwrapReply<StreamMessagesRawReply>;
		            
		                const name = stream[0];
		                const rawMessages = stream[1];
		            
		                ret.set(name.toString(), transformStreamMessagesReply(rawMessages, typeMapping));
		              }
		            
		              return ret as unknown as MapReply<string, StreamMessagesReply>;
		            }
		            case Array: {
		              const ret: Array<BlobStringReply | StreamMessagesReply> = [];
		        
		              for (let i=0; i < reply.length; i++) {
		                const stream = reply[i] as unknown as UnwrapReply<StreamMessagesRawReply>;
		            
		                const name = stream[0];
		                const rawMessages = stream[1];
		            
		                ret.push(name);
		                ret.push(transformStreamMessagesReply(rawMessages, typeMapping));
		              }
		        
		              return ret as unknown as MapReply<string, StreamMessagesReply>;
		            }
		            default: {
		              const ret: Record<string, StreamMessagesReply> = Object.create(null);
		        
		              for (let i=0; i < reply.length; i++) {
		                const stream = reply[i] as unknown as UnwrapReply<StreamMessagesRawReply>;
		            
		                const name = stream[0] as unknown as UnwrapReply<BlobStringReply>;
		                const rawMessages = stream[1];
		            
		                ret[name.toString()] = transformStreamMessagesReply(rawMessages);
		              }
		            
		              return ret as unknown as MapReply<string, StreamMessagesReply>;
		            }
		        */
		        // V4 compatible response type
		        default: {
		            const ret = [];
		            for (let i = 0; i < reply.length; i++) {
		                const stream = reply[i];
		                ret.push({
		                    name: stream[0],
		                    messages: transformStreamMessagesReply(stream[1])
		                });
		            }
		            return ret;
		        }
		    }
		}
		exports.transformStreamsMessagesReplyResp2 = transformStreamsMessagesReplyResp2;
		function transformStreamsMessagesReplyResp3(reply) {
		    if (reply === null)
		        return null;
		    if (reply instanceof Map) {
		        const ret = new Map();
		        for (const [n, rawMessages] of reply) {
		            const name = n;
		            ret.set(name.toString(), transformStreamMessagesReply(rawMessages));
		        }
		        return ret;
		    }
		    else if (reply instanceof Array) {
		        const ret = [];
		        for (let i = 0; i < reply.length; i += 2) {
		            const name = reply[i];
		            const rawMessages = reply[i + 1];
		            ret.push(name);
		            ret.push(transformStreamMessagesReply(rawMessages));
		        }
		        return ret;
		    }
		    else {
		        const ret = Object.create(null);
		        for (const [name, rawMessages] of Object.entries(reply)) {
		            ret[name] = transformStreamMessagesReply(rawMessages);
		        }
		        return ret;
		    }
		}
		exports.transformStreamsMessagesReplyResp3 = transformStreamsMessagesReplyResp3;
		function transformRedisJsonArgument(json) {
		    return JSON.stringify(json);
		}
		exports.transformRedisJsonArgument = transformRedisJsonArgument;
		function transformRedisJsonReply(json) {
		    const res = JSON.parse(json.toString());
		    return res;
		}
		exports.transformRedisJsonReply = transformRedisJsonReply;
		function transformRedisJsonNullReply(json) {
		    return isNullReply(json) ? json : transformRedisJsonReply(json);
		}
		exports.transformRedisJsonNullReply = transformRedisJsonNullReply;
		
	} (genericTransformers));
	return genericTransformers;
}

var hasRequiredACL_LOG;

function requireACL_LOG () {
	if (hasRequiredACL_LOG) return ACL_LOG;
	hasRequiredACL_LOG = 1;
	Object.defineProperty(ACL_LOG, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	ACL_LOG.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Returns ACL security events log entries
	     * @param parser - The Redis command parser
	     * @param count - Optional maximum number of entries to return
	     */
	    parseCommand(parser, count) {
	        parser.push('ACL', 'LOG');
	        if (count != undefined) {
	            parser.push(count.toString());
	        }
	    },
	    transformReply: {
	        2: (reply, preserve, typeMapping) => {
	            return reply.map(item => {
	                const inferred = item;
	                return {
	                    count: inferred[1],
	                    reason: inferred[3],
	                    context: inferred[5],
	                    object: inferred[7],
	                    username: inferred[9],
	                    'age-seconds': generic_transformers_1.transformDoubleReply[2](inferred[11], preserve, typeMapping),
	                    'client-info': inferred[13],
	                    'entry-id': inferred[15],
	                    'timestamp-created': inferred[17],
	                    'timestamp-last-updated': inferred[19]
	                };
	            });
	        },
	        3: undefined
	    }
	};
	
	return ACL_LOG;
}

var hasRequiredACL_LOG_RESET;

function requireACL_LOG_RESET () {
	if (hasRequiredACL_LOG_RESET) return ACL_LOG_RESET;
	hasRequiredACL_LOG_RESET = 1;
	var __importDefault = (ACL_LOG_RESET && ACL_LOG_RESET.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(ACL_LOG_RESET, "__esModule", { value: true });
	const ACL_LOG_1 = __importDefault(requireACL_LOG());
	ACL_LOG_RESET.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: ACL_LOG_1.default.IS_READ_ONLY,
	    /**
	     * Clears the ACL security events log
	     * @param parser - The Redis command parser
	     */
	    parseCommand(parser) {
	        parser.push('ACL', 'LOG', 'RESET');
	    },
	    transformReply: undefined
	};
	
	return ACL_LOG_RESET;
}

var ACL_SAVE = {};

var hasRequiredACL_SAVE;

function requireACL_SAVE () {
	if (hasRequiredACL_SAVE) return ACL_SAVE;
	hasRequiredACL_SAVE = 1;
	Object.defineProperty(ACL_SAVE, "__esModule", { value: true });
	ACL_SAVE.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Saves the current ACL configuration to the ACL file
	     * @param parser - The Redis command parser
	     */
	    parseCommand(parser) {
	        parser.push('ACL', 'SAVE');
	    },
	    transformReply: undefined
	};
	
	return ACL_SAVE;
}

var ACL_SETUSER = {};

var hasRequiredACL_SETUSER;

function requireACL_SETUSER () {
	if (hasRequiredACL_SETUSER) return ACL_SETUSER;
	hasRequiredACL_SETUSER = 1;
	Object.defineProperty(ACL_SETUSER, "__esModule", { value: true });
	ACL_SETUSER.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Creates or modifies ACL user with specified rules
	     * @param parser - The Redis command parser
	     * @param username - Username to create or modify
	     * @param rule - ACL rule(s) to apply to the user
	     */
	    parseCommand(parser, username, rule) {
	        parser.push('ACL', 'SETUSER', username);
	        parser.pushVariadic(rule);
	    },
	    transformReply: undefined
	};
	
	return ACL_SETUSER;
}

var ACL_USERS = {};

var hasRequiredACL_USERS;

function requireACL_USERS () {
	if (hasRequiredACL_USERS) return ACL_USERS;
	hasRequiredACL_USERS = 1;
	Object.defineProperty(ACL_USERS, "__esModule", { value: true });
	ACL_USERS.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Returns a list of all configured ACL usernames
	     * @param parser - The Redis command parser
	     */
	    parseCommand(parser) {
	        parser.push('ACL', 'USERS');
	    },
	    transformReply: undefined
	};
	
	return ACL_USERS;
}

var ACL_WHOAMI = {};

var hasRequiredACL_WHOAMI;

function requireACL_WHOAMI () {
	if (hasRequiredACL_WHOAMI) return ACL_WHOAMI;
	hasRequiredACL_WHOAMI = 1;
	Object.defineProperty(ACL_WHOAMI, "__esModule", { value: true });
	ACL_WHOAMI.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Returns the username of the current connection
	     * @param parser - The Redis command parser
	     */
	    parseCommand(parser) {
	        parser.push('ACL', 'WHOAMI');
	    },
	    transformReply: undefined
	};
	
	return ACL_WHOAMI;
}

var APPEND = {};

var hasRequiredAPPEND;

function requireAPPEND () {
	if (hasRequiredAPPEND) return APPEND;
	hasRequiredAPPEND = 1;
	Object.defineProperty(APPEND, "__esModule", { value: true });
	APPEND.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Appends a value to a string key
	     * @param parser - The Redis command parser
	     * @param key - The key to append to
	     * @param value - The value to append
	     */
	    parseCommand(parser, key, value) {
	        parser.push('APPEND', key, value);
	    },
	    transformReply: undefined
	};
	
	return APPEND;
}

var ASKING = {};

var hasRequiredASKING;

function requireASKING () {
	if (hasRequiredASKING) return ASKING;
	hasRequiredASKING = 1;
	(function (exports) {
		Object.defineProperty(exports, "__esModule", { value: true });
		exports.ASKING_CMD = void 0;
		exports.ASKING_CMD = 'ASKING';
		exports.default = {
		    NOT_KEYED_COMMAND: true,
		    IS_READ_ONLY: true,
		    /**
		     * Tells a Redis cluster node that the client is ok receiving such redirects
		     * @param parser - The Redis command parser
		     */
		    parseCommand(parser) {
		        parser.push(exports.ASKING_CMD);
		    },
		    transformReply: undefined
		};
		
	} (ASKING));
	return ASKING;
}

var AUTH = {};

var hasRequiredAUTH;

function requireAUTH () {
	if (hasRequiredAUTH) return AUTH;
	hasRequiredAUTH = 1;
	Object.defineProperty(AUTH, "__esModule", { value: true });
	AUTH.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Authenticates the connection using a password or username and password
	     * @param parser - The Redis command parser
	     * @param options - Authentication options containing username and/or password
	     * @param options.username - Optional username for authentication
	     * @param options.password - Password for authentication
	     */
	    parseCommand(parser, { username, password }) {
	        parser.push('AUTH');
	        if (username !== undefined) {
	            parser.push(username);
	        }
	        parser.push(password);
	    },
	    transformReply: undefined
	};
	
	return AUTH;
}

var BGREWRITEAOF = {};

var hasRequiredBGREWRITEAOF;

function requireBGREWRITEAOF () {
	if (hasRequiredBGREWRITEAOF) return BGREWRITEAOF;
	hasRequiredBGREWRITEAOF = 1;
	Object.defineProperty(BGREWRITEAOF, "__esModule", { value: true });
	BGREWRITEAOF.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Asynchronously rewrites the append-only file
	     * @param parser - The Redis command parser
	     */
	    parseCommand(parser) {
	        parser.push('BGREWRITEAOF');
	    },
	    transformReply: undefined
	};
	
	return BGREWRITEAOF;
}

var BGSAVE = {};

var hasRequiredBGSAVE;

function requireBGSAVE () {
	if (hasRequiredBGSAVE) return BGSAVE;
	hasRequiredBGSAVE = 1;
	Object.defineProperty(BGSAVE, "__esModule", { value: true });
	BGSAVE.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Asynchronously saves the dataset to disk
	     * @param parser - The Redis command parser
	     * @param options - Optional configuration
	     * @param options.SCHEDULE - Schedule a BGSAVE operation when no BGSAVE is already in progress
	     */
	    parseCommand(parser, options) {
	        parser.push('BGSAVE');
	        if (options?.SCHEDULE) {
	            parser.push('SCHEDULE');
	        }
	    },
	    transformReply: undefined
	};
	
	return BGSAVE;
}

var BITCOUNT = {};

var hasRequiredBITCOUNT;

function requireBITCOUNT () {
	if (hasRequiredBITCOUNT) return BITCOUNT;
	hasRequiredBITCOUNT = 1;
	Object.defineProperty(BITCOUNT, "__esModule", { value: true });
	BITCOUNT.default = {
	    CACHEABLE: true,
	    IS_READ_ONLY: true,
	    /**
	     * Returns the count of set bits in a string key
	     * @param parser - The Redis command parser
	     * @param key - The key to count bits in
	     * @param range - Optional range specification
	     * @param range.start - Start offset in bytes/bits
	     * @param range.end - End offset in bytes/bits
	     * @param range.mode - Optional counting mode: BYTE or BIT
	     */
	    parseCommand(parser, key, range) {
	        parser.push('BITCOUNT');
	        parser.pushKey(key);
	        if (range) {
	            parser.push(range.start.toString());
	            parser.push(range.end.toString());
	            if (range.mode) {
	                parser.push(range.mode);
	            }
	        }
	    },
	    transformReply: undefined
	};
	
	return BITCOUNT;
}

var BITFIELD_RO = {};

var hasRequiredBITFIELD_RO;

function requireBITFIELD_RO () {
	if (hasRequiredBITFIELD_RO) return BITFIELD_RO;
	hasRequiredBITFIELD_RO = 1;
	Object.defineProperty(BITFIELD_RO, "__esModule", { value: true });
	BITFIELD_RO.default = {
	    CACHEABLE: true,
	    IS_READ_ONLY: true,
	    /**
	     * Performs read-only bitfield integer operations on strings
	     * @param parser - The Redis command parser
	     * @param key - The key holding the string
	     * @param operations - Array of GET operations to perform on the bitfield
	     */
	    parseCommand(parser, key, operations) {
	        parser.push('BITFIELD_RO');
	        parser.pushKey(key);
	        for (const operation of operations) {
	            parser.push('GET');
	            parser.push(operation.encoding);
	            parser.push(operation.offset.toString());
	        }
	    },
	    transformReply: undefined
	};
	
	return BITFIELD_RO;
}

var BITFIELD = {};

var hasRequiredBITFIELD;

function requireBITFIELD () {
	if (hasRequiredBITFIELD) return BITFIELD;
	hasRequiredBITFIELD = 1;
	Object.defineProperty(BITFIELD, "__esModule", { value: true });
	BITFIELD.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Performs arbitrary bitfield integer operations on strings
	     * @param parser - The Redis command parser
	     * @param key - The key holding the string
	     * @param operations - Array of bitfield operations to perform: GET, SET, INCRBY or OVERFLOW
	     */
	    parseCommand(parser, key, operations) {
	        parser.push('BITFIELD');
	        parser.pushKey(key);
	        for (const options of operations) {
	            switch (options.operation) {
	                case 'GET':
	                    parser.push('GET', options.encoding, options.offset.toString());
	                    break;
	                case 'SET':
	                    parser.push('SET', options.encoding, options.offset.toString(), options.value.toString());
	                    break;
	                case 'INCRBY':
	                    parser.push('INCRBY', options.encoding, options.offset.toString(), options.increment.toString());
	                    break;
	                case 'OVERFLOW':
	                    parser.push('OVERFLOW', options.behavior);
	                    break;
	            }
	        }
	    },
	    transformReply: undefined
	};
	
	return BITFIELD;
}

var BITOP = {};

var hasRequiredBITOP;

function requireBITOP () {
	if (hasRequiredBITOP) return BITOP;
	hasRequiredBITOP = 1;
	Object.defineProperty(BITOP, "__esModule", { value: true });
	BITOP.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Performs bitwise operations between strings
	     * @param parser - The Redis command parser
	     * @param operation - Bitwise operation to perform: AND, OR, XOR, NOT, DIFF, DIFF1, ANDOR, ONE
	     * @param destKey - Destination key to store the result
	     * @param key - Source key(s) to perform operation on
	     */
	    parseCommand(parser, operation, destKey, key) {
	        parser.push('BITOP', operation);
	        parser.pushKey(destKey);
	        parser.pushKeys(key);
	    },
	    transformReply: undefined
	};
	
	return BITOP;
}

var BITPOS = {};

var hasRequiredBITPOS;

function requireBITPOS () {
	if (hasRequiredBITPOS) return BITPOS;
	hasRequiredBITPOS = 1;
	Object.defineProperty(BITPOS, "__esModule", { value: true });
	BITPOS.default = {
	    CACHEABLE: true,
	    IS_READ_ONLY: true,
	    /**
	     * Returns the position of first bit set to 0 or 1 in a string
	     * @param parser - The Redis command parser
	     * @param key - The key holding the string
	     * @param bit - The bit value to look for (0 or 1)
	     * @param start - Optional starting position in bytes/bits
	     * @param end - Optional ending position in bytes/bits
	     * @param mode - Optional counting mode: BYTE or BIT
	     */
	    parseCommand(parser, key, bit, start, end, mode) {
	        parser.push('BITPOS');
	        parser.pushKey(key);
	        parser.push(bit.toString());
	        if (start !== undefined) {
	            parser.push(start.toString());
	        }
	        if (end !== undefined) {
	            parser.push(end.toString());
	        }
	        if (mode) {
	            parser.push(mode);
	        }
	    },
	    transformReply: undefined
	};
	
	return BITPOS;
}

var BLMOVE = {};

var hasRequiredBLMOVE;

function requireBLMOVE () {
	if (hasRequiredBLMOVE) return BLMOVE;
	hasRequiredBLMOVE = 1;
	Object.defineProperty(BLMOVE, "__esModule", { value: true });
	BLMOVE.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Pop an element from a list, push it to another list and return it; or block until one is available
	     * @param parser - The Redis command parser
	     * @param source - Key of the source list
	     * @param destination - Key of the destination list
	     * @param sourceSide - Side of source list to pop from (LEFT or RIGHT)
	     * @param destinationSide - Side of destination list to push to (LEFT or RIGHT)
	     * @param timeout - Timeout in seconds, 0 to block indefinitely
	     */
	    parseCommand(parser, source, destination, sourceSide, destinationSide, timeout) {
	        parser.push('BLMOVE');
	        parser.pushKeys([source, destination]);
	        parser.push(sourceSide, destinationSide, timeout.toString());
	    },
	    transformReply: undefined
	};
	
	return BLMOVE;
}

var BLMPOP = {};

var LMPOP = {};

var hasRequiredLMPOP;

function requireLMPOP () {
	if (hasRequiredLMPOP) return LMPOP;
	hasRequiredLMPOP = 1;
	Object.defineProperty(LMPOP, "__esModule", { value: true });
	LMPOP.parseLMPopArguments = void 0;
	function parseLMPopArguments(parser, keys, side, options) {
	    parser.pushKeysLength(keys);
	    parser.push(side);
	    if (options?.COUNT !== undefined) {
	        parser.push('COUNT', options.COUNT.toString());
	    }
	}
	LMPOP.parseLMPopArguments = parseLMPopArguments;
	LMPOP.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Constructs the LMPOP command
	     *
	     * @param parser - The command parser
	     * @param args - Arguments including keys, side (LEFT or RIGHT), and options
	     * @see https://redis.io/commands/lmpop/
	     */
	    parseCommand(parser, ...args) {
	        parser.push('LMPOP');
	        parseLMPopArguments(parser, ...args);
	    },
	    transformReply: undefined
	};
	
	return LMPOP;
}

var hasRequiredBLMPOP;

function requireBLMPOP () {
	if (hasRequiredBLMPOP) return BLMPOP;
	hasRequiredBLMPOP = 1;
	var __createBinding = (BLMPOP && BLMPOP.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (BLMPOP && BLMPOP.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar = (BLMPOP && BLMPOP.__importStar) || function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
	    __setModuleDefault(result, mod);
	    return result;
	};
	Object.defineProperty(BLMPOP, "__esModule", { value: true });
	const LMPOP_1 = __importStar(requireLMPOP());
	BLMPOP.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Pops elements from multiple lists; blocks until elements are available
	     * @param parser - The Redis command parser
	     * @param timeout - Timeout in seconds, 0 to block indefinitely
	     * @param args - Additional arguments for LMPOP command
	     */
	    parseCommand(parser, timeout, ...args) {
	        parser.push('BLMPOP', timeout.toString());
	        (0, LMPOP_1.parseLMPopArguments)(parser, ...args);
	    },
	    transformReply: LMPOP_1.default.transformReply
	};
	
	return BLMPOP;
}

var BLPOP = {};

var hasRequiredBLPOP;

function requireBLPOP () {
	if (hasRequiredBLPOP) return BLPOP;
	hasRequiredBLPOP = 1;
	Object.defineProperty(BLPOP, "__esModule", { value: true });
	BLPOP.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Removes and returns the first element in a list, or blocks until one is available
	     * @param parser - The Redis command parser
	     * @param key - Key of the list to pop from, or array of keys to try sequentially
	     * @param timeout - Maximum seconds to block, 0 to block indefinitely
	     */
	    parseCommand(parser, key, timeout) {
	        parser.push('BLPOP');
	        parser.pushKeys(key);
	        parser.push(timeout.toString());
	    },
	    transformReply(reply) {
	        if (reply === null)
	            return null;
	        return {
	            key: reply[0],
	            element: reply[1]
	        };
	    }
	};
	
	return BLPOP;
}

var BRPOP = {};

var hasRequiredBRPOP;

function requireBRPOP () {
	if (hasRequiredBRPOP) return BRPOP;
	hasRequiredBRPOP = 1;
	var __importDefault = (BRPOP && BRPOP.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(BRPOP, "__esModule", { value: true });
	const BLPOP_1 = __importDefault(requireBLPOP());
	BRPOP.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Removes and returns the last element in a list, or blocks until one is available
	     * @param parser - The Redis command parser
	     * @param key - Key of the list to pop from, or array of keys to try sequentially
	     * @param timeout - Maximum seconds to block, 0 to block indefinitely
	     */
	    parseCommand(parser, key, timeout) {
	        parser.push('BRPOP');
	        parser.pushKeys(key);
	        parser.push(timeout.toString());
	    },
	    transformReply: BLPOP_1.default.transformReply
	};
	
	return BRPOP;
}

var BRPOPLPUSH = {};

var hasRequiredBRPOPLPUSH;

function requireBRPOPLPUSH () {
	if (hasRequiredBRPOPLPUSH) return BRPOPLPUSH;
	hasRequiredBRPOPLPUSH = 1;
	Object.defineProperty(BRPOPLPUSH, "__esModule", { value: true });
	BRPOPLPUSH.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Pops an element from a list, pushes it to another list and returns it; blocks until element is available
	     * @param parser - The Redis command parser
	     * @param source - Key of the source list to pop from
	     * @param destination - Key of the destination list to push to
	     * @param timeout - Maximum seconds to block, 0 to block indefinitely
	     */
	    parseCommand(parser, source, destination, timeout) {
	        parser.push('BRPOPLPUSH');
	        parser.pushKeys([source, destination]);
	        parser.push(timeout.toString());
	    },
	    transformReply: undefined
	};
	
	return BRPOPLPUSH;
}

var BZMPOP = {};

var ZMPOP = {};

var hasRequiredZMPOP;

function requireZMPOP () {
	if (hasRequiredZMPOP) return ZMPOP;
	hasRequiredZMPOP = 1;
	Object.defineProperty(ZMPOP, "__esModule", { value: true });
	ZMPOP.parseZMPopArguments = void 0;
	const generic_transformers_1 = requireGenericTransformers();
	function parseZMPopArguments(parser, keys, side, options) {
	    parser.pushKeysLength(keys);
	    parser.push(side);
	    if (options?.COUNT) {
	        parser.push('COUNT', options.COUNT.toString());
	    }
	}
	ZMPOP.parseZMPopArguments = parseZMPopArguments;
	ZMPOP.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Removes and returns up to count members with the highest/lowest scores from the first non-empty sorted set.
	     * @param parser - The Redis command parser.
	     * @param keys - Keys of the sorted sets to pop from.
	     * @param side - Side to pop from (MIN or MAX).
	     * @param options - Optional parameters including COUNT.
	     */
	    parseCommand(parser, keys, side, options) {
	        parser.push('ZMPOP');
	        parseZMPopArguments(parser, keys, side, options);
	    },
	    transformReply: {
	        2(reply, preserve, typeMapping) {
	            return reply === null ? null : {
	                key: reply[0],
	                members: reply[1].map(member => {
	                    const [value, score] = member;
	                    return {
	                        value,
	                        score: generic_transformers_1.transformDoubleReply[2](score, preserve, typeMapping)
	                    };
	                })
	            };
	        },
	        3(reply) {
	            return reply === null ? null : {
	                key: reply[0],
	                members: generic_transformers_1.transformSortedSetReply[3](reply[1])
	            };
	        }
	    }
	};
	
	return ZMPOP;
}

var hasRequiredBZMPOP;

function requireBZMPOP () {
	if (hasRequiredBZMPOP) return BZMPOP;
	hasRequiredBZMPOP = 1;
	var __createBinding = (BZMPOP && BZMPOP.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (BZMPOP && BZMPOP.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar = (BZMPOP && BZMPOP.__importStar) || function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
	    __setModuleDefault(result, mod);
	    return result;
	};
	Object.defineProperty(BZMPOP, "__esModule", { value: true });
	const ZMPOP_1 = __importStar(requireZMPOP());
	BZMPOP.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Removes and returns members from one or more sorted sets in the specified order; blocks until elements are available
	     * @param parser - The Redis command parser
	     * @param timeout - Maximum seconds to block, 0 to block indefinitely
	     * @param args - Additional arguments specifying the keys, min/max count, and order (MIN/MAX)
	     */
	    parseCommand(parser, timeout, ...args) {
	        parser.push('BZMPOP', timeout.toString());
	        (0, ZMPOP_1.parseZMPopArguments)(parser, ...args);
	    },
	    transformReply: ZMPOP_1.default.transformReply
	};
	
	return BZMPOP;
}

var BZPOPMAX = {};

var hasRequiredBZPOPMAX;

function requireBZPOPMAX () {
	if (hasRequiredBZPOPMAX) return BZPOPMAX;
	hasRequiredBZPOPMAX = 1;
	Object.defineProperty(BZPOPMAX, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	BZPOPMAX.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Removes and returns the member with the highest score in a sorted set, or blocks until one is available
	     * @param parser - The Redis command parser
	     * @param keys - Key of the sorted set, or array of keys to try sequentially
	     * @param timeout - Maximum seconds to block, 0 to block indefinitely
	     */
	    parseCommand(parser, keys, timeout) {
	        parser.push('BZPOPMAX');
	        parser.pushKeys(keys);
	        parser.push(timeout.toString());
	    },
	    transformReply: {
	        2(reply, preserve, typeMapping) {
	            return reply === null ? null : {
	                key: reply[0],
	                value: reply[1],
	                score: generic_transformers_1.transformDoubleReply[2](reply[2], preserve, typeMapping)
	            };
	        },
	        3(reply) {
	            return reply === null ? null : {
	                key: reply[0],
	                value: reply[1],
	                score: reply[2]
	            };
	        }
	    }
	};
	
	return BZPOPMAX;
}

var BZPOPMIN = {};

var hasRequiredBZPOPMIN;

function requireBZPOPMIN () {
	if (hasRequiredBZPOPMIN) return BZPOPMIN;
	hasRequiredBZPOPMIN = 1;
	var __importDefault = (BZPOPMIN && BZPOPMIN.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(BZPOPMIN, "__esModule", { value: true });
	const BZPOPMAX_1 = __importDefault(requireBZPOPMAX());
	BZPOPMIN.default = {
	    IS_READ_ONLY: BZPOPMAX_1.default.IS_READ_ONLY,
	    /**
	     * Removes and returns the member with the lowest score in a sorted set, or blocks until one is available
	     * @param parser - The Redis command parser
	     * @param keys - Key of the sorted set, or array of keys to try sequentially
	     * @param timeout - Maximum seconds to block, 0 to block indefinitely
	     */
	    parseCommand(parser, keys, timeout) {
	        parser.push('BZPOPMIN');
	        parser.pushKeys(keys);
	        parser.push(timeout.toString());
	    },
	    transformReply: BZPOPMAX_1.default.transformReply
	};
	
	return BZPOPMIN;
}

var CLIENT_CACHING = {};

var hasRequiredCLIENT_CACHING;

function requireCLIENT_CACHING () {
	if (hasRequiredCLIENT_CACHING) return CLIENT_CACHING;
	hasRequiredCLIENT_CACHING = 1;
	Object.defineProperty(CLIENT_CACHING, "__esModule", { value: true });
	CLIENT_CACHING.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Instructs the server about tracking or not keys in the next request
	     * @param parser - The Redis command parser
	     * @param value - Whether to enable (true) or disable (false) tracking
	     */
	    parseCommand(parser, value) {
	        parser.push('CLIENT', 'CACHING', value ? 'YES' : 'NO');
	    },
	    transformReply: undefined
	};
	
	return CLIENT_CACHING;
}

var CLIENT_GETNAME = {};

var hasRequiredCLIENT_GETNAME;

function requireCLIENT_GETNAME () {
	if (hasRequiredCLIENT_GETNAME) return CLIENT_GETNAME;
	hasRequiredCLIENT_GETNAME = 1;
	Object.defineProperty(CLIENT_GETNAME, "__esModule", { value: true });
	CLIENT_GETNAME.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Returns the name of the current connection
	     * @param parser - The Redis command parser
	     */
	    parseCommand(parser) {
	        parser.push('CLIENT', 'GETNAME');
	    },
	    transformReply: undefined
	};
	
	return CLIENT_GETNAME;
}

var CLIENT_GETREDIR = {};

var hasRequiredCLIENT_GETREDIR;

function requireCLIENT_GETREDIR () {
	if (hasRequiredCLIENT_GETREDIR) return CLIENT_GETREDIR;
	hasRequiredCLIENT_GETREDIR = 1;
	Object.defineProperty(CLIENT_GETREDIR, "__esModule", { value: true });
	CLIENT_GETREDIR.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Returns the ID of the client to which the current client is redirecting tracking notifications
	     * @param parser - The Redis command parser
	     */
	    parseCommand(parser) {
	        parser.push('CLIENT', 'GETREDIR');
	    },
	    transformReply: undefined
	};
	
	return CLIENT_GETREDIR;
}

var CLIENT_ID = {};

var hasRequiredCLIENT_ID;

function requireCLIENT_ID () {
	if (hasRequiredCLIENT_ID) return CLIENT_ID;
	hasRequiredCLIENT_ID = 1;
	Object.defineProperty(CLIENT_ID, "__esModule", { value: true });
	CLIENT_ID.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Returns the client ID for the current connection
	     * @param parser - The Redis command parser
	     */
	    parseCommand(parser) {
	        parser.push('CLIENT', 'ID');
	    },
	    transformReply: undefined
	};
	
	return CLIENT_ID;
}

var CLIENT_INFO = {};

var hasRequiredCLIENT_INFO;

function requireCLIENT_INFO () {
	if (hasRequiredCLIENT_INFO) return CLIENT_INFO;
	hasRequiredCLIENT_INFO = 1;
	Object.defineProperty(CLIENT_INFO, "__esModule", { value: true });
	const CLIENT_INFO_REGEX = /([^\s=]+)=([^\s]*)/g;
	CLIENT_INFO.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Returns information and statistics about the current client connection
	     * @param parser - The Redis command parser
	     */
	    parseCommand(parser) {
	        parser.push('CLIENT', 'INFO');
	    },
	    transformReply(rawReply) {
	        const map = {};
	        for (const item of rawReply.toString().matchAll(CLIENT_INFO_REGEX)) {
	            map[item[1]] = item[2];
	        }
	        const reply = {
	            id: Number(map.id),
	            addr: map.addr,
	            fd: Number(map.fd),
	            name: map.name,
	            age: Number(map.age),
	            idle: Number(map.idle),
	            flags: map.flags,
	            db: Number(map.db),
	            sub: Number(map.sub),
	            psub: Number(map.psub),
	            multi: Number(map.multi),
	            qbuf: Number(map.qbuf),
	            qbufFree: Number(map['qbuf-free']),
	            argvMem: Number(map['argv-mem']),
	            obl: Number(map.obl),
	            oll: Number(map.oll),
	            omem: Number(map.omem),
	            totMem: Number(map['tot-mem']),
	            events: map.events,
	            cmd: map.cmd,
	            user: map.user,
	            libName: map['lib-name'],
	            libVer: map['lib-ver']
	        };
	        if (map.laddr !== undefined) {
	            reply.laddr = map.laddr;
	        }
	        if (map.redir !== undefined) {
	            reply.redir = Number(map.redir);
	        }
	        if (map.ssub !== undefined) {
	            reply.ssub = Number(map.ssub);
	        }
	        if (map['multi-mem'] !== undefined) {
	            reply.multiMem = Number(map['multi-mem']);
	        }
	        if (map.resp !== undefined) {
	            reply.resp = Number(map.resp);
	        }
	        return reply;
	    }
	};
	
	return CLIENT_INFO;
}

var CLIENT_KILL = {};

var hasRequiredCLIENT_KILL;

function requireCLIENT_KILL () {
	if (hasRequiredCLIENT_KILL) return CLIENT_KILL;
	hasRequiredCLIENT_KILL = 1;
	(function (exports) {
		Object.defineProperty(exports, "__esModule", { value: true });
		exports.CLIENT_KILL_FILTERS = void 0;
		exports.CLIENT_KILL_FILTERS = {
		    ADDRESS: 'ADDR',
		    LOCAL_ADDRESS: 'LADDR',
		    ID: 'ID',
		    TYPE: 'TYPE',
		    USER: 'USER',
		    SKIP_ME: 'SKIPME',
		    MAXAGE: 'MAXAGE'
		};
		exports.default = {
		    NOT_KEYED_COMMAND: true,
		    IS_READ_ONLY: true,
		    /**
		     * Closes client connections matching the specified filters
		     * @param parser - The Redis command parser
		     * @param filters - One or more filters to match client connections to kill
		     */
		    parseCommand(parser, filters) {
		        parser.push('CLIENT', 'KILL');
		        if (Array.isArray(filters)) {
		            for (const filter of filters) {
		                pushFilter(parser, filter);
		            }
		        }
		        else {
		            pushFilter(parser, filters);
		        }
		    },
		    transformReply: undefined
		};
		function pushFilter(parser, filter) {
		    if (filter === exports.CLIENT_KILL_FILTERS.SKIP_ME) {
		        parser.push('SKIPME');
		        return;
		    }
		    parser.push(filter.filter);
		    switch (filter.filter) {
		        case exports.CLIENT_KILL_FILTERS.ADDRESS:
		            parser.push(filter.address);
		            break;
		        case exports.CLIENT_KILL_FILTERS.LOCAL_ADDRESS:
		            parser.push(filter.localAddress);
		            break;
		        case exports.CLIENT_KILL_FILTERS.ID:
		            parser.push(typeof filter.id === 'number' ?
		                filter.id.toString() :
		                filter.id);
		            break;
		        case exports.CLIENT_KILL_FILTERS.TYPE:
		            parser.push(filter.type);
		            break;
		        case exports.CLIENT_KILL_FILTERS.USER:
		            parser.push(filter.username);
		            break;
		        case exports.CLIENT_KILL_FILTERS.SKIP_ME:
		            parser.push(filter.skipMe ? 'yes' : 'no');
		            break;
		        case exports.CLIENT_KILL_FILTERS.MAXAGE:
		            parser.push(filter.maxAge.toString());
		            break;
		    }
		}
		
	} (CLIENT_KILL));
	return CLIENT_KILL;
}

var CLIENT_LIST = {};

var hasRequiredCLIENT_LIST;

function requireCLIENT_LIST () {
	if (hasRequiredCLIENT_LIST) return CLIENT_LIST;
	hasRequiredCLIENT_LIST = 1;
	var __importDefault = (CLIENT_LIST && CLIENT_LIST.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(CLIENT_LIST, "__esModule", { value: true });
	const CLIENT_INFO_1 = __importDefault(requireCLIENT_INFO());
	CLIENT_LIST.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Returns information about all client connections. Can be filtered by type or ID
	     * @param parser - The Redis command parser
	     * @param filter - Optional filter to return only specific client types or IDs
	     */
	    parseCommand(parser, filter) {
	        parser.push('CLIENT', 'LIST');
	        if (filter) {
	            if (filter.TYPE !== undefined) {
	                parser.push('TYPE', filter.TYPE);
	            }
	            else {
	                parser.push('ID');
	                parser.pushVariadic(filter.ID);
	            }
	        }
	    },
	    transformReply(rawReply) {
	        const split = rawReply.toString().split('\n'), length = split.length - 1, reply = [];
	        for (let i = 0; i < length; i++) {
	            reply.push(CLIENT_INFO_1.default.transformReply(split[i]));
	        }
	        return reply;
	    }
	};
	
	return CLIENT_LIST;
}

var CLIENT_NOEVICT = {};

var hasRequiredCLIENT_NOEVICT;

function requireCLIENT_NOEVICT () {
	if (hasRequiredCLIENT_NOEVICT) return CLIENT_NOEVICT;
	hasRequiredCLIENT_NOEVICT = 1;
	Object.defineProperty(CLIENT_NOEVICT, "__esModule", { value: true });
	CLIENT_NOEVICT.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Controls whether to prevent the client's connections from being evicted
	     * @param parser - The Redis command parser
	     * @param value - Whether to enable (true) or disable (false) the no-evict mode
	     */
	    parseCommand(parser, value) {
	        parser.push('CLIENT', 'NO-EVICT', value ? 'ON' : 'OFF');
	    },
	    transformReply: undefined
	};
	
	return CLIENT_NOEVICT;
}

var CLIENT_NOTOUCH = {};

var hasRequiredCLIENT_NOTOUCH;

function requireCLIENT_NOTOUCH () {
	if (hasRequiredCLIENT_NOTOUCH) return CLIENT_NOTOUCH;
	hasRequiredCLIENT_NOTOUCH = 1;
	Object.defineProperty(CLIENT_NOTOUCH, "__esModule", { value: true });
	CLIENT_NOTOUCH.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Controls whether to prevent the client from touching the LRU/LFU of keys
	     * @param parser - The Redis command parser
	     * @param value - Whether to enable (true) or disable (false) the no-touch mode
	     */
	    parseCommand(parser, value) {
	        parser.push('CLIENT', 'NO-TOUCH', value ? 'ON' : 'OFF');
	    },
	    transformReply: undefined
	};
	
	return CLIENT_NOTOUCH;
}

var CLIENT_PAUSE = {};

var hasRequiredCLIENT_PAUSE;

function requireCLIENT_PAUSE () {
	if (hasRequiredCLIENT_PAUSE) return CLIENT_PAUSE;
	hasRequiredCLIENT_PAUSE = 1;
	Object.defineProperty(CLIENT_PAUSE, "__esModule", { value: true });
	CLIENT_PAUSE.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Stops the server from processing client commands for the specified duration
	     * @param parser - The Redis command parser
	     * @param timeout - Time in milliseconds to pause command processing
	     * @param mode - Optional mode: 'WRITE' to pause only write commands, 'ALL' to pause all commands
	     */
	    parseCommand(parser, timeout, mode) {
	        parser.push('CLIENT', 'PAUSE', timeout.toString());
	        if (mode) {
	            parser.push(mode);
	        }
	    },
	    transformReply: undefined
	};
	
	return CLIENT_PAUSE;
}

var CLIENT_SETNAME = {};

var hasRequiredCLIENT_SETNAME;

function requireCLIENT_SETNAME () {
	if (hasRequiredCLIENT_SETNAME) return CLIENT_SETNAME;
	hasRequiredCLIENT_SETNAME = 1;
	Object.defineProperty(CLIENT_SETNAME, "__esModule", { value: true });
	CLIENT_SETNAME.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Assigns a name to the current connection
	     * @param parser - The Redis command parser
	     * @param name - The name to assign to the connection
	     */
	    parseCommand(parser, name) {
	        parser.push('CLIENT', 'SETNAME', name);
	    },
	    transformReply: undefined
	};
	
	return CLIENT_SETNAME;
}

var CLIENT_TRACKING = {};

var hasRequiredCLIENT_TRACKING;

function requireCLIENT_TRACKING () {
	if (hasRequiredCLIENT_TRACKING) return CLIENT_TRACKING;
	hasRequiredCLIENT_TRACKING = 1;
	Object.defineProperty(CLIENT_TRACKING, "__esModule", { value: true });
	CLIENT_TRACKING.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Controls server-assisted client side caching for the current connection
	     * @param parser - The Redis command parser
	     * @param mode - Whether to enable (true) or disable (false) tracking
	     * @param options - Optional configuration including REDIRECT, BCAST, PREFIX, OPTIN, OPTOUT, and NOLOOP options
	     */
	    parseCommand(parser, mode, options) {
	        parser.push('CLIENT', 'TRACKING', mode ? 'ON' : 'OFF');
	        if (mode) {
	            if (options?.REDIRECT) {
	                parser.push('REDIRECT', options.REDIRECT.toString());
	            }
	            if (isBroadcast(options)) {
	                parser.push('BCAST');
	                if (options?.PREFIX) {
	                    if (Array.isArray(options.PREFIX)) {
	                        for (const prefix of options.PREFIX) {
	                            parser.push('PREFIX', prefix);
	                        }
	                    }
	                    else {
	                        parser.push('PREFIX', options.PREFIX);
	                    }
	                }
	            }
	            else if (isOptIn(options)) {
	                parser.push('OPTIN');
	            }
	            else if (isOptOut(options)) {
	                parser.push('OPTOUT');
	            }
	            if (options?.NOLOOP) {
	                parser.push('NOLOOP');
	            }
	        }
	    },
	    transformReply: undefined
	};
	function isBroadcast(options) {
	    return options?.BCAST === true;
	}
	function isOptIn(options) {
	    return options?.OPTIN === true;
	}
	function isOptOut(options) {
	    return options?.OPTOUT === true;
	}
	
	return CLIENT_TRACKING;
}

var CLIENT_TRACKINGINFO = {};

var hasRequiredCLIENT_TRACKINGINFO;

function requireCLIENT_TRACKINGINFO () {
	if (hasRequiredCLIENT_TRACKINGINFO) return CLIENT_TRACKINGINFO;
	hasRequiredCLIENT_TRACKINGINFO = 1;
	Object.defineProperty(CLIENT_TRACKINGINFO, "__esModule", { value: true });
	CLIENT_TRACKINGINFO.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Returns information about the current connection's key tracking state
	     * @param parser - The Redis command parser
	     */
	    parseCommand(parser) {
	        parser.push('CLIENT', 'TRACKINGINFO');
	    },
	    transformReply: {
	        2: (reply) => ({
	            flags: reply[1],
	            redirect: reply[3],
	            prefixes: reply[5]
	        }),
	        3: undefined
	    }
	};
	
	return CLIENT_TRACKINGINFO;
}

var CLIENT_UNPAUSE = {};

var hasRequiredCLIENT_UNPAUSE;

function requireCLIENT_UNPAUSE () {
	if (hasRequiredCLIENT_UNPAUSE) return CLIENT_UNPAUSE;
	hasRequiredCLIENT_UNPAUSE = 1;
	Object.defineProperty(CLIENT_UNPAUSE, "__esModule", { value: true });
	CLIENT_UNPAUSE.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Resumes processing of client commands after a CLIENT PAUSE
	     * @param parser - The Redis command parser
	     */
	    parseCommand(parser) {
	        parser.push('CLIENT', 'UNPAUSE');
	    },
	    transformReply: undefined
	};
	
	return CLIENT_UNPAUSE;
}

var CLUSTER_ADDSLOTS = {};

var hasRequiredCLUSTER_ADDSLOTS;

function requireCLUSTER_ADDSLOTS () {
	if (hasRequiredCLUSTER_ADDSLOTS) return CLUSTER_ADDSLOTS;
	hasRequiredCLUSTER_ADDSLOTS = 1;
	Object.defineProperty(CLUSTER_ADDSLOTS, "__esModule", { value: true });
	CLUSTER_ADDSLOTS.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Assigns hash slots to the current node in a Redis Cluster
	     * @param parser - The Redis command parser
	     * @param slots - One or more hash slots to be assigned
	     */
	    parseCommand(parser, slots) {
	        parser.push('CLUSTER', 'ADDSLOTS');
	        parser.pushVariadicNumber(slots);
	    },
	    transformReply: undefined
	};
	
	return CLUSTER_ADDSLOTS;
}

var CLUSTER_ADDSLOTSRANGE = {};

var hasRequiredCLUSTER_ADDSLOTSRANGE;

function requireCLUSTER_ADDSLOTSRANGE () {
	if (hasRequiredCLUSTER_ADDSLOTSRANGE) return CLUSTER_ADDSLOTSRANGE;
	hasRequiredCLUSTER_ADDSLOTSRANGE = 1;
	Object.defineProperty(CLUSTER_ADDSLOTSRANGE, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	CLUSTER_ADDSLOTSRANGE.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Assigns hash slot ranges to the current node in a Redis Cluster
	     * @param parser - The Redis command parser
	     * @param ranges - One or more slot ranges to be assigned, each specified as [start, end]
	     */
	    parseCommand(parser, ranges) {
	        parser.push('CLUSTER', 'ADDSLOTSRANGE');
	        (0, generic_transformers_1.parseSlotRangesArguments)(parser, ranges);
	    },
	    transformReply: undefined
	};
	
	return CLUSTER_ADDSLOTSRANGE;
}

var CLUSTER_BUMPEPOCH = {};

var hasRequiredCLUSTER_BUMPEPOCH;

function requireCLUSTER_BUMPEPOCH () {
	if (hasRequiredCLUSTER_BUMPEPOCH) return CLUSTER_BUMPEPOCH;
	hasRequiredCLUSTER_BUMPEPOCH = 1;
	Object.defineProperty(CLUSTER_BUMPEPOCH, "__esModule", { value: true });
	CLUSTER_BUMPEPOCH.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Advances the cluster config epoch
	     * @param parser - The Redis command parser
	     */
	    parseCommand(parser) {
	        parser.push('CLUSTER', 'BUMPEPOCH');
	    },
	    transformReply: undefined
	};
	
	return CLUSTER_BUMPEPOCH;
}

var CLUSTER_COUNTFAILUREREPORTS = {};

var hasRequiredCLUSTER_COUNTFAILUREREPORTS;

function requireCLUSTER_COUNTFAILUREREPORTS () {
	if (hasRequiredCLUSTER_COUNTFAILUREREPORTS) return CLUSTER_COUNTFAILUREREPORTS;
	hasRequiredCLUSTER_COUNTFAILUREREPORTS = 1;
	Object.defineProperty(CLUSTER_COUNTFAILUREREPORTS, "__esModule", { value: true });
	CLUSTER_COUNTFAILUREREPORTS.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Returns the number of failure reports for a given node
	     * @param parser - The Redis command parser
	     * @param nodeId - The ID of the node to check
	     */
	    parseCommand(parser, nodeId) {
	        parser.push('CLUSTER', 'COUNT-FAILURE-REPORTS', nodeId);
	    },
	    transformReply: undefined
	};
	
	return CLUSTER_COUNTFAILUREREPORTS;
}

var CLUSTER_COUNTKEYSINSLOT = {};

var hasRequiredCLUSTER_COUNTKEYSINSLOT;

function requireCLUSTER_COUNTKEYSINSLOT () {
	if (hasRequiredCLUSTER_COUNTKEYSINSLOT) return CLUSTER_COUNTKEYSINSLOT;
	hasRequiredCLUSTER_COUNTKEYSINSLOT = 1;
	Object.defineProperty(CLUSTER_COUNTKEYSINSLOT, "__esModule", { value: true });
	CLUSTER_COUNTKEYSINSLOT.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Returns the number of keys in the specified hash slot
	     * @param parser - The Redis command parser
	     * @param slot - The hash slot to check
	     */
	    parseCommand(parser, slot) {
	        parser.push('CLUSTER', 'COUNTKEYSINSLOT', slot.toString());
	    },
	    transformReply: undefined
	};
	
	return CLUSTER_COUNTKEYSINSLOT;
}

var CLUSTER_DELSLOTS = {};

var hasRequiredCLUSTER_DELSLOTS;

function requireCLUSTER_DELSLOTS () {
	if (hasRequiredCLUSTER_DELSLOTS) return CLUSTER_DELSLOTS;
	hasRequiredCLUSTER_DELSLOTS = 1;
	Object.defineProperty(CLUSTER_DELSLOTS, "__esModule", { value: true });
	CLUSTER_DELSLOTS.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Removes hash slots from the current node in a Redis Cluster
	     * @param parser - The Redis command parser
	     * @param slots - One or more hash slots to be removed
	     */
	    parseCommand(parser, slots) {
	        parser.push('CLUSTER', 'DELSLOTS');
	        parser.pushVariadicNumber(slots);
	    },
	    transformReply: undefined
	};
	
	return CLUSTER_DELSLOTS;
}

var CLUSTER_DELSLOTSRANGE = {};

var hasRequiredCLUSTER_DELSLOTSRANGE;

function requireCLUSTER_DELSLOTSRANGE () {
	if (hasRequiredCLUSTER_DELSLOTSRANGE) return CLUSTER_DELSLOTSRANGE;
	hasRequiredCLUSTER_DELSLOTSRANGE = 1;
	Object.defineProperty(CLUSTER_DELSLOTSRANGE, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	CLUSTER_DELSLOTSRANGE.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Removes hash slot ranges from the current node in a Redis Cluster
	     * @param parser - The Redis command parser
	     * @param ranges - One or more slot ranges to be removed, each specified as [start, end]
	     */
	    parseCommand(parser, ranges) {
	        parser.push('CLUSTER', 'DELSLOTSRANGE');
	        (0, generic_transformers_1.parseSlotRangesArguments)(parser, ranges);
	    },
	    transformReply: undefined
	};
	
	return CLUSTER_DELSLOTSRANGE;
}

var CLUSTER_FAILOVER = {};

var hasRequiredCLUSTER_FAILOVER;

function requireCLUSTER_FAILOVER () {
	if (hasRequiredCLUSTER_FAILOVER) return CLUSTER_FAILOVER;
	hasRequiredCLUSTER_FAILOVER = 1;
	Object.defineProperty(CLUSTER_FAILOVER, "__esModule", { value: true });
	CLUSTER_FAILOVER.FAILOVER_MODES = void 0;
	CLUSTER_FAILOVER.FAILOVER_MODES = {
	    FORCE: 'FORCE',
	    TAKEOVER: 'TAKEOVER'
	};
	CLUSTER_FAILOVER.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Forces a replica to perform a manual failover of its master
	     * @param parser - The Redis command parser
	     * @param options - Optional configuration with FORCE or TAKEOVER mode
	     */
	    parseCommand(parser, options) {
	        parser.push('CLUSTER', 'FAILOVER');
	        if (options?.mode) {
	            parser.push(options.mode);
	        }
	    },
	    transformReply: undefined
	};
	
	return CLUSTER_FAILOVER;
}

var CLUSTER_FLUSHSLOTS = {};

var hasRequiredCLUSTER_FLUSHSLOTS;

function requireCLUSTER_FLUSHSLOTS () {
	if (hasRequiredCLUSTER_FLUSHSLOTS) return CLUSTER_FLUSHSLOTS;
	hasRequiredCLUSTER_FLUSHSLOTS = 1;
	Object.defineProperty(CLUSTER_FLUSHSLOTS, "__esModule", { value: true });
	CLUSTER_FLUSHSLOTS.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Deletes all hash slots from the current node in a Redis Cluster
	     * @param parser - The Redis command parser
	     */
	    parseCommand(parser) {
	        parser.push('CLUSTER', 'FLUSHSLOTS');
	    },
	    transformReply: undefined
	};
	
	return CLUSTER_FLUSHSLOTS;
}

var CLUSTER_FORGET = {};

var hasRequiredCLUSTER_FORGET;

function requireCLUSTER_FORGET () {
	if (hasRequiredCLUSTER_FORGET) return CLUSTER_FORGET;
	hasRequiredCLUSTER_FORGET = 1;
	Object.defineProperty(CLUSTER_FORGET, "__esModule", { value: true });
	CLUSTER_FORGET.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Removes a node from the cluster
	     * @param parser - The Redis command parser
	     * @param nodeId - The ID of the node to remove
	     */
	    parseCommand(parser, nodeId) {
	        parser.push('CLUSTER', 'FORGET', nodeId);
	    },
	    transformReply: undefined
	};
	
	return CLUSTER_FORGET;
}

var CLUSTER_GETKEYSINSLOT = {};

var hasRequiredCLUSTER_GETKEYSINSLOT;

function requireCLUSTER_GETKEYSINSLOT () {
	if (hasRequiredCLUSTER_GETKEYSINSLOT) return CLUSTER_GETKEYSINSLOT;
	hasRequiredCLUSTER_GETKEYSINSLOT = 1;
	Object.defineProperty(CLUSTER_GETKEYSINSLOT, "__esModule", { value: true });
	CLUSTER_GETKEYSINSLOT.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Returns a number of keys from the specified hash slot
	     * @param parser - The Redis command parser
	     * @param slot - The hash slot to get keys from
	     * @param count - Maximum number of keys to return
	     */
	    parseCommand(parser, slot, count) {
	        parser.push('CLUSTER', 'GETKEYSINSLOT', slot.toString(), count.toString());
	    },
	    transformReply: undefined
	};
	
	return CLUSTER_GETKEYSINSLOT;
}

var CLUSTER_INFO = {};

var hasRequiredCLUSTER_INFO;

function requireCLUSTER_INFO () {
	if (hasRequiredCLUSTER_INFO) return CLUSTER_INFO;
	hasRequiredCLUSTER_INFO = 1;
	Object.defineProperty(CLUSTER_INFO, "__esModule", { value: true });
	CLUSTER_INFO.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Returns information about the state of a Redis Cluster
	     * @param parser - The Redis command parser
	     */
	    parseCommand(parser) {
	        parser.push('CLUSTER', 'INFO');
	    },
	    transformReply: undefined
	};
	
	return CLUSTER_INFO;
}

var CLUSTER_KEYSLOT = {};

var hasRequiredCLUSTER_KEYSLOT;

function requireCLUSTER_KEYSLOT () {
	if (hasRequiredCLUSTER_KEYSLOT) return CLUSTER_KEYSLOT;
	hasRequiredCLUSTER_KEYSLOT = 1;
	Object.defineProperty(CLUSTER_KEYSLOT, "__esModule", { value: true });
	CLUSTER_KEYSLOT.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Returns the hash slot number for a given key
	     * @param parser - The Redis command parser
	     * @param key - The key to get the hash slot for
	     */
	    parseCommand(parser, key) {
	        parser.push('CLUSTER', 'KEYSLOT', key);
	    },
	    transformReply: undefined
	};
	
	return CLUSTER_KEYSLOT;
}

var CLUSTER_LINKS = {};

var hasRequiredCLUSTER_LINKS;

function requireCLUSTER_LINKS () {
	if (hasRequiredCLUSTER_LINKS) return CLUSTER_LINKS;
	hasRequiredCLUSTER_LINKS = 1;
	Object.defineProperty(CLUSTER_LINKS, "__esModule", { value: true });
	CLUSTER_LINKS.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Returns information about all cluster links (lower level connections to other nodes)
	     * @param parser - The Redis command parser
	     */
	    parseCommand(parser) {
	        parser.push('CLUSTER', 'LINKS');
	    },
	    transformReply: {
	        2: (reply) => reply.map(link => {
	            const unwrapped = link;
	            return {
	                direction: unwrapped[1],
	                node: unwrapped[3],
	                'create-time': unwrapped[5],
	                events: unwrapped[7],
	                'send-buffer-allocated': unwrapped[9],
	                'send-buffer-used': unwrapped[11]
	            };
	        }),
	        3: undefined
	    }
	};
	
	return CLUSTER_LINKS;
}

var CLUSTER_MEET = {};

var hasRequiredCLUSTER_MEET;

function requireCLUSTER_MEET () {
	if (hasRequiredCLUSTER_MEET) return CLUSTER_MEET;
	hasRequiredCLUSTER_MEET = 1;
	Object.defineProperty(CLUSTER_MEET, "__esModule", { value: true });
	CLUSTER_MEET.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Initiates a handshake with another node in the cluster
	     * @param parser - The Redis command parser
	     * @param host - Host name or IP address of the node
	     * @param port - TCP port of the node
	     */
	    parseCommand(parser, host, port) {
	        parser.push('CLUSTER', 'MEET', host, port.toString());
	    },
	    transformReply: undefined
	};
	
	return CLUSTER_MEET;
}

var CLUSTER_MYID = {};

var hasRequiredCLUSTER_MYID;

function requireCLUSTER_MYID () {
	if (hasRequiredCLUSTER_MYID) return CLUSTER_MYID;
	hasRequiredCLUSTER_MYID = 1;
	Object.defineProperty(CLUSTER_MYID, "__esModule", { value: true });
	CLUSTER_MYID.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Returns the node ID of the current Redis Cluster node
	     * @param parser - The Redis command parser
	     */
	    parseCommand(parser) {
	        parser.push('CLUSTER', 'MYID');
	    },
	    transformReply: undefined
	};
	
	return CLUSTER_MYID;
}

var CLUSTER_MYSHARDID = {};

var hasRequiredCLUSTER_MYSHARDID;

function requireCLUSTER_MYSHARDID () {
	if (hasRequiredCLUSTER_MYSHARDID) return CLUSTER_MYSHARDID;
	hasRequiredCLUSTER_MYSHARDID = 1;
	Object.defineProperty(CLUSTER_MYSHARDID, "__esModule", { value: true });
	CLUSTER_MYSHARDID.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Returns the shard ID of the current Redis Cluster node
	     * @param parser - The Redis command parser
	     */
	    parseCommand(parser) {
	        parser.push('CLUSTER', 'MYSHARDID');
	    },
	    transformReply: undefined
	};
	
	return CLUSTER_MYSHARDID;
}

var CLUSTER_NODES = {};

var hasRequiredCLUSTER_NODES;

function requireCLUSTER_NODES () {
	if (hasRequiredCLUSTER_NODES) return CLUSTER_NODES;
	hasRequiredCLUSTER_NODES = 1;
	Object.defineProperty(CLUSTER_NODES, "__esModule", { value: true });
	CLUSTER_NODES.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Returns serialized information about the nodes in a Redis Cluster
	     * @param parser - The Redis command parser
	     */
	    parseCommand(parser) {
	        parser.push('CLUSTER', 'NODES');
	    },
	    transformReply: undefined
	};
	
	return CLUSTER_NODES;
}

var CLUSTER_REPLICAS = {};

var hasRequiredCLUSTER_REPLICAS;

function requireCLUSTER_REPLICAS () {
	if (hasRequiredCLUSTER_REPLICAS) return CLUSTER_REPLICAS;
	hasRequiredCLUSTER_REPLICAS = 1;
	Object.defineProperty(CLUSTER_REPLICAS, "__esModule", { value: true });
	CLUSTER_REPLICAS.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Returns the replica nodes replicating from the specified primary node
	     * @param parser - The Redis command parser
	     * @param nodeId - Node ID of the primary node
	     */
	    parseCommand(parser, nodeId) {
	        parser.push('CLUSTER', 'REPLICAS', nodeId);
	    },
	    transformReply: undefined
	};
	
	return CLUSTER_REPLICAS;
}

var CLUSTER_REPLICATE = {};

var hasRequiredCLUSTER_REPLICATE;

function requireCLUSTER_REPLICATE () {
	if (hasRequiredCLUSTER_REPLICATE) return CLUSTER_REPLICATE;
	hasRequiredCLUSTER_REPLICATE = 1;
	Object.defineProperty(CLUSTER_REPLICATE, "__esModule", { value: true });
	CLUSTER_REPLICATE.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Reconfigures a node as a replica of the specified primary node
	     * @param parser - The Redis command parser
	     * @param nodeId - Node ID of the primary node to replicate
	     */
	    parseCommand(parser, nodeId) {
	        parser.push('CLUSTER', 'REPLICATE', nodeId);
	    },
	    transformReply: undefined
	};
	
	return CLUSTER_REPLICATE;
}

var CLUSTER_RESET = {};

var hasRequiredCLUSTER_RESET;

function requireCLUSTER_RESET () {
	if (hasRequiredCLUSTER_RESET) return CLUSTER_RESET;
	hasRequiredCLUSTER_RESET = 1;
	Object.defineProperty(CLUSTER_RESET, "__esModule", { value: true });
	CLUSTER_RESET.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Resets a Redis Cluster node, clearing all information and returning it to a brand new state
	     * @param parser - The Redis command parser
	     * @param options - Options for the reset operation
	     */
	    parseCommand(parser, options) {
	        parser.push('CLUSTER', 'RESET');
	        if (options?.mode) {
	            parser.push(options.mode);
	        }
	    },
	    transformReply: undefined
	};
	
	return CLUSTER_RESET;
}

var CLUSTER_SAVECONFIG = {};

var hasRequiredCLUSTER_SAVECONFIG;

function requireCLUSTER_SAVECONFIG () {
	if (hasRequiredCLUSTER_SAVECONFIG) return CLUSTER_SAVECONFIG;
	hasRequiredCLUSTER_SAVECONFIG = 1;
	Object.defineProperty(CLUSTER_SAVECONFIG, "__esModule", { value: true });
	CLUSTER_SAVECONFIG.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Forces a Redis Cluster node to save the cluster configuration to disk
	     * @param parser - The Redis command parser
	     */
	    parseCommand(parser) {
	        parser.push('CLUSTER', 'SAVECONFIG');
	    },
	    transformReply: undefined
	};
	
	return CLUSTER_SAVECONFIG;
}

var CLUSTER_SETCONFIGEPOCH = {};

var hasRequiredCLUSTER_SETCONFIGEPOCH;

function requireCLUSTER_SETCONFIGEPOCH () {
	if (hasRequiredCLUSTER_SETCONFIGEPOCH) return CLUSTER_SETCONFIGEPOCH;
	hasRequiredCLUSTER_SETCONFIGEPOCH = 1;
	Object.defineProperty(CLUSTER_SETCONFIGEPOCH, "__esModule", { value: true });
	CLUSTER_SETCONFIGEPOCH.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Sets the configuration epoch for a Redis Cluster node
	     * @param parser - The Redis command parser
	     * @param configEpoch - The configuration epoch to set
	     */
	    parseCommand(parser, configEpoch) {
	        parser.push('CLUSTER', 'SET-CONFIG-EPOCH', configEpoch.toString());
	    },
	    transformReply: undefined
	};
	
	return CLUSTER_SETCONFIGEPOCH;
}

var CLUSTER_SETSLOT = {};

var hasRequiredCLUSTER_SETSLOT;

function requireCLUSTER_SETSLOT () {
	if (hasRequiredCLUSTER_SETSLOT) return CLUSTER_SETSLOT;
	hasRequiredCLUSTER_SETSLOT = 1;
	Object.defineProperty(CLUSTER_SETSLOT, "__esModule", { value: true });
	CLUSTER_SETSLOT.CLUSTER_SLOT_STATES = void 0;
	CLUSTER_SETSLOT.CLUSTER_SLOT_STATES = {
	    IMPORTING: 'IMPORTING',
	    MIGRATING: 'MIGRATING',
	    STABLE: 'STABLE',
	    NODE: 'NODE'
	};
	CLUSTER_SETSLOT.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Assigns a hash slot to a specific Redis Cluster node
	     * @param parser - The Redis command parser
	     * @param slot - The slot number to assign
	     * @param state - The state to set for the slot (IMPORTING, MIGRATING, STABLE, NODE)
	     * @param nodeId - Node ID (required for IMPORTING, MIGRATING, and NODE states)
	     */
	    parseCommand(parser, slot, state, nodeId) {
	        parser.push('CLUSTER', 'SETSLOT', slot.toString(), state);
	        if (nodeId) {
	            parser.push(nodeId);
	        }
	    },
	    transformReply: undefined
	};
	
	return CLUSTER_SETSLOT;
}

var CLUSTER_SLOTS = {};

var hasRequiredCLUSTER_SLOTS;

function requireCLUSTER_SLOTS () {
	if (hasRequiredCLUSTER_SLOTS) return CLUSTER_SLOTS;
	hasRequiredCLUSTER_SLOTS = 1;
	Object.defineProperty(CLUSTER_SLOTS, "__esModule", { value: true });
	CLUSTER_SLOTS.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Returns information about which Redis Cluster node handles which hash slots
	     * @param parser - The Redis command parser
	     */
	    parseCommand(parser) {
	        parser.push('CLUSTER', 'SLOTS');
	    },
	    transformReply(reply) {
	        return reply.map(([from, to, master, ...replicas]) => ({
	            from,
	            to,
	            master: transformNode(master),
	            replicas: replicas.map(transformNode)
	        }));
	    }
	};
	function transformNode(node) {
	    const [host, port, id] = node;
	    return {
	        host,
	        port,
	        id
	    };
	}
	
	return CLUSTER_SLOTS;
}

var COMMAND_COUNT = {};

var hasRequiredCOMMAND_COUNT;

function requireCOMMAND_COUNT () {
	if (hasRequiredCOMMAND_COUNT) return COMMAND_COUNT;
	hasRequiredCOMMAND_COUNT = 1;
	Object.defineProperty(COMMAND_COUNT, "__esModule", { value: true });
	COMMAND_COUNT.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Returns the total number of commands available in the Redis server
	     * @param parser - The Redis command parser
	     */
	    parseCommand(parser) {
	        parser.push('COMMAND', 'COUNT');
	    },
	    transformReply: undefined
	};
	
	return COMMAND_COUNT;
}

var COMMAND_GETKEYS = {};

var hasRequiredCOMMAND_GETKEYS;

function requireCOMMAND_GETKEYS () {
	if (hasRequiredCOMMAND_GETKEYS) return COMMAND_GETKEYS;
	hasRequiredCOMMAND_GETKEYS = 1;
	Object.defineProperty(COMMAND_GETKEYS, "__esModule", { value: true });
	COMMAND_GETKEYS.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Extracts the key names from a Redis command
	     * @param parser - The Redis command parser
	     * @param args - Command arguments to analyze
	     */
	    parseCommand(parser, args) {
	        parser.push('COMMAND', 'GETKEYS');
	        parser.push(...args);
	    },
	    transformReply: undefined
	};
	
	return COMMAND_GETKEYS;
}

var COMMAND_GETKEYSANDFLAGS = {};

var hasRequiredCOMMAND_GETKEYSANDFLAGS;

function requireCOMMAND_GETKEYSANDFLAGS () {
	if (hasRequiredCOMMAND_GETKEYSANDFLAGS) return COMMAND_GETKEYSANDFLAGS;
	hasRequiredCOMMAND_GETKEYSANDFLAGS = 1;
	Object.defineProperty(COMMAND_GETKEYSANDFLAGS, "__esModule", { value: true });
	COMMAND_GETKEYSANDFLAGS.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Extracts the key names and access flags from a Redis command
	     * @param parser - The Redis command parser
	     * @param args - Command arguments to analyze
	     */
	    parseCommand(parser, args) {
	        parser.push('COMMAND', 'GETKEYSANDFLAGS');
	        parser.push(...args);
	    },
	    transformReply(reply) {
	        return reply.map(entry => {
	            const [key, flags] = entry;
	            return {
	                key,
	                flags
	            };
	        });
	    }
	};
	
	return COMMAND_GETKEYSANDFLAGS;
}

var COMMAND_INFO = {};

var hasRequiredCOMMAND_INFO;

function requireCOMMAND_INFO () {
	if (hasRequiredCOMMAND_INFO) return COMMAND_INFO;
	hasRequiredCOMMAND_INFO = 1;
	Object.defineProperty(COMMAND_INFO, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	COMMAND_INFO.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Returns details about specific Redis commands
	     * @param parser - The Redis command parser
	     * @param commands - Array of command names to get information about
	     */
	    parseCommand(parser, commands) {
	        parser.push('COMMAND', 'INFO', ...commands);
	    },
	    // TODO: This works, as we don't currently handle any of the items returned as a map
	    transformReply(reply) {
	        return reply.map(command => command ? (0, generic_transformers_1.transformCommandReply)(command) : null);
	    }
	};
	
	return COMMAND_INFO;
}

var COMMAND_LIST = {};

var hasRequiredCOMMAND_LIST;

function requireCOMMAND_LIST () {
	if (hasRequiredCOMMAND_LIST) return COMMAND_LIST;
	hasRequiredCOMMAND_LIST = 1;
	Object.defineProperty(COMMAND_LIST, "__esModule", { value: true });
	COMMAND_LIST.COMMAND_LIST_FILTER_BY = void 0;
	COMMAND_LIST.COMMAND_LIST_FILTER_BY = {
	    MODULE: 'MODULE',
	    ACLCAT: 'ACLCAT',
	    PATTERN: 'PATTERN'
	};
	COMMAND_LIST.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Returns a list of all commands supported by the Redis server
	     * @param parser - The Redis command parser
	     * @param options - Options for filtering the command list
	     */
	    parseCommand(parser, options) {
	        parser.push('COMMAND', 'LIST');
	        if (options?.FILTERBY) {
	            parser.push('FILTERBY', options.FILTERBY.type, options.FILTERBY.value);
	        }
	    },
	    transformReply: undefined
	};
	
	return COMMAND_LIST;
}

var COMMAND = {};

var hasRequiredCOMMAND;

function requireCOMMAND () {
	if (hasRequiredCOMMAND) return COMMAND;
	hasRequiredCOMMAND = 1;
	Object.defineProperty(COMMAND, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	COMMAND.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Returns an array with details about all Redis commands
	     * @param parser - The Redis command parser
	     */
	    parseCommand(parser) {
	        parser.push('COMMAND');
	    },
	    // TODO: This works, as we don't currently handle any of the items returned as a map
	    transformReply(reply) {
	        return reply.map(generic_transformers_1.transformCommandReply);
	    }
	};
	
	return COMMAND;
}

var CONFIG_GET$1 = {};

var hasRequiredCONFIG_GET$1;

function requireCONFIG_GET$1 () {
	if (hasRequiredCONFIG_GET$1) return CONFIG_GET$1;
	hasRequiredCONFIG_GET$1 = 1;
	Object.defineProperty(CONFIG_GET$1, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	CONFIG_GET$1.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Gets the values of configuration parameters
	     * @param parser - The Redis command parser
	     * @param parameters - Pattern or specific configuration parameter names
	     */
	    parseCommand(parser, parameters) {
	        parser.push('CONFIG', 'GET');
	        parser.pushVariadic(parameters);
	    },
	    transformReply: {
	        2: (generic_transformers_1.transformTuplesReply),
	        3: undefined
	    }
	};
	
	return CONFIG_GET$1;
}

var CONFIG_RESETSTAT = {};

var hasRequiredCONFIG_RESETSTAT;

function requireCONFIG_RESETSTAT () {
	if (hasRequiredCONFIG_RESETSTAT) return CONFIG_RESETSTAT;
	hasRequiredCONFIG_RESETSTAT = 1;
	Object.defineProperty(CONFIG_RESETSTAT, "__esModule", { value: true });
	CONFIG_RESETSTAT.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Resets the statistics reported by Redis using the INFO command
	     * @param parser - The Redis command parser
	     */
	    parseCommand(parser) {
	        parser.push('CONFIG', 'RESETSTAT');
	    },
	    transformReply: undefined
	};
	
	return CONFIG_RESETSTAT;
}

var CONFIG_REWRITE = {};

var hasRequiredCONFIG_REWRITE;

function requireCONFIG_REWRITE () {
	if (hasRequiredCONFIG_REWRITE) return CONFIG_REWRITE;
	hasRequiredCONFIG_REWRITE = 1;
	Object.defineProperty(CONFIG_REWRITE, "__esModule", { value: true });
	CONFIG_REWRITE.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Rewrites the Redis configuration file with the current configuration
	     * @param parser - The Redis command parser
	     */
	    parseCommand(parser) {
	        parser.push('CONFIG', 'REWRITE');
	    },
	    transformReply: undefined
	};
	
	return CONFIG_REWRITE;
}

var CONFIG_SET$1 = {};

var hasRequiredCONFIG_SET$1;

function requireCONFIG_SET$1 () {
	if (hasRequiredCONFIG_SET$1) return CONFIG_SET$1;
	hasRequiredCONFIG_SET$1 = 1;
	Object.defineProperty(CONFIG_SET$1, "__esModule", { value: true });
	CONFIG_SET$1.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Sets configuration parameters to the specified values
	     * @param parser - The Redis command parser
	     * @param parameterOrConfig - Either a single parameter name or a configuration object
	     * @param value - Value for the parameter (when using single parameter format)
	     */
	    parseCommand(parser, ...[parameterOrConfig, value]) {
	        parser.push('CONFIG', 'SET');
	        if (typeof parameterOrConfig === 'string' || parameterOrConfig instanceof Buffer) {
	            parser.push(parameterOrConfig, value);
	        }
	        else {
	            for (const [key, value] of Object.entries(parameterOrConfig)) {
	                parser.push(key, value);
	            }
	        }
	    },
	    transformReply: undefined
	};
	
	return CONFIG_SET$1;
}

var COPY = {};

var hasRequiredCOPY;

function requireCOPY () {
	if (hasRequiredCOPY) return COPY;
	hasRequiredCOPY = 1;
	Object.defineProperty(COPY, "__esModule", { value: true });
	COPY.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Copies the value stored at the source key to the destination key
	     * @param parser - The Redis command parser
	     * @param source - Source key
	     * @param destination - Destination key
	     * @param options - Options for the copy operation
	     */
	    parseCommand(parser, source, destination, options) {
	        parser.push('COPY');
	        parser.pushKeys([source, destination]);
	        if (options?.DB) {
	            parser.push('DB', options.DB.toString());
	        }
	        if (options?.REPLACE) {
	            parser.push('REPLACE');
	        }
	    },
	    transformReply: undefined
	};
	
	return COPY;
}

var DBSIZE = {};

var hasRequiredDBSIZE;

function requireDBSIZE () {
	if (hasRequiredDBSIZE) return DBSIZE;
	hasRequiredDBSIZE = 1;
	Object.defineProperty(DBSIZE, "__esModule", { value: true });
	DBSIZE.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Returns the number of keys in the current database
	     * @param parser - The Redis command parser
	     */
	    parseCommand(parser) {
	        parser.push('DBSIZE');
	    },
	    transformReply: undefined
	};
	
	return DBSIZE;
}

var DECR = {};

var hasRequiredDECR;

function requireDECR () {
	if (hasRequiredDECR) return DECR;
	hasRequiredDECR = 1;
	Object.defineProperty(DECR, "__esModule", { value: true });
	DECR.default = {
	    /**
	     * Decrements the integer value of a key by one
	     * @param parser - The Redis command parser
	     * @param key - Key to decrement
	     */
	    parseCommand(parser, key) {
	        parser.push('DECR');
	        parser.pushKey(key);
	    },
	    transformReply: undefined
	};
	
	return DECR;
}

var DECRBY$1 = {};

var hasRequiredDECRBY$1;

function requireDECRBY$1 () {
	if (hasRequiredDECRBY$1) return DECRBY$1;
	hasRequiredDECRBY$1 = 1;
	Object.defineProperty(DECRBY$1, "__esModule", { value: true });
	DECRBY$1.default = {
	    /**
	     * Decrements the integer value of a key by the given number
	     * @param parser - The Redis command parser
	     * @param key - Key to decrement
	     * @param decrement - Decrement amount
	     */
	    parseCommand(parser, key, decrement) {
	        parser.push('DECRBY');
	        parser.pushKey(key);
	        parser.push(decrement.toString());
	    },
	    transformReply: undefined
	};
	
	return DECRBY$1;
}

var DEL$3 = {};

var hasRequiredDEL$3;

function requireDEL$3 () {
	if (hasRequiredDEL$3) return DEL$3;
	hasRequiredDEL$3 = 1;
	Object.defineProperty(DEL$3, "__esModule", { value: true });
	DEL$3.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Removes the specified keys. A key is ignored if it does not exist
	     * @param parser - The Redis command parser
	     * @param keys - One or more keys to delete
	     */
	    parseCommand(parser, keys) {
	        parser.push('DEL');
	        parser.pushKeys(keys);
	    },
	    transformReply: undefined
	};
	
	return DEL$3;
}

var DUMP = {};

var hasRequiredDUMP;

function requireDUMP () {
	if (hasRequiredDUMP) return DUMP;
	hasRequiredDUMP = 1;
	Object.defineProperty(DUMP, "__esModule", { value: true });
	DUMP.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Returns a serialized version of the value stored at the key
	     * @param parser - The Redis command parser
	     * @param key - Key to dump
	     */
	    parseCommand(parser, key) {
	        parser.push('DUMP');
	        parser.pushKey(key);
	    },
	    transformReply: undefined
	};
	
	return DUMP;
}

var ECHO = {};

var hasRequiredECHO;

function requireECHO () {
	if (hasRequiredECHO) return ECHO;
	hasRequiredECHO = 1;
	Object.defineProperty(ECHO, "__esModule", { value: true });
	ECHO.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Returns the given string
	     * @param parser - The Redis command parser
	     * @param message - Message to echo back
	     */
	    parseCommand(parser, message) {
	        parser.push('ECHO', message);
	    },
	    transformReply: undefined
	};
	
	return ECHO;
}

var EVAL_RO = {};

var EVAL = {};

var hasRequiredEVAL;

function requireEVAL () {
	if (hasRequiredEVAL) return EVAL;
	hasRequiredEVAL = 1;
	Object.defineProperty(EVAL, "__esModule", { value: true });
	EVAL.parseEvalArguments = void 0;
	function parseEvalArguments(parser, script, options) {
	    parser.push(script);
	    if (options?.keys) {
	        parser.pushKeysLength(options.keys);
	    }
	    else {
	        parser.push('0');
	    }
	    if (options?.arguments) {
	        parser.push(...options.arguments);
	    }
	}
	EVAL.parseEvalArguments = parseEvalArguments;
	EVAL.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Executes a Lua script server side
	     * @param parser - The Redis command parser
	     * @param script - Lua script to execute
	     * @param options - Script execution options including keys and arguments
	     */
	    parseCommand(...args) {
	        args[0].push('EVAL');
	        parseEvalArguments(...args);
	    },
	    transformReply: undefined
	};
	
	return EVAL;
}

var hasRequiredEVAL_RO;

function requireEVAL_RO () {
	if (hasRequiredEVAL_RO) return EVAL_RO;
	hasRequiredEVAL_RO = 1;
	var __createBinding = (EVAL_RO && EVAL_RO.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (EVAL_RO && EVAL_RO.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar = (EVAL_RO && EVAL_RO.__importStar) || function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
	    __setModuleDefault(result, mod);
	    return result;
	};
	Object.defineProperty(EVAL_RO, "__esModule", { value: true });
	const EVAL_1 = __importStar(requireEVAL());
	EVAL_RO.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Executes a read-only Lua script server side
	     * @param parser - The Redis command parser
	     * @param script - Lua script to execute
	     * @param options - Script execution options including keys and arguments
	     */
	    parseCommand(...args) {
	        args[0].push('EVAL_RO');
	        (0, EVAL_1.parseEvalArguments)(...args);
	    },
	    transformReply: EVAL_1.default.transformReply
	};
	
	return EVAL_RO;
}

var EVALSHA_RO = {};

var hasRequiredEVALSHA_RO;

function requireEVALSHA_RO () {
	if (hasRequiredEVALSHA_RO) return EVALSHA_RO;
	hasRequiredEVALSHA_RO = 1;
	var __createBinding = (EVALSHA_RO && EVALSHA_RO.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (EVALSHA_RO && EVALSHA_RO.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar = (EVALSHA_RO && EVALSHA_RO.__importStar) || function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
	    __setModuleDefault(result, mod);
	    return result;
	};
	Object.defineProperty(EVALSHA_RO, "__esModule", { value: true });
	const EVAL_1 = __importStar(requireEVAL());
	EVALSHA_RO.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Executes a read-only Lua script server side using the script's SHA1 digest
	     * @param parser - The Redis command parser
	     * @param sha1 - SHA1 digest of the script
	     * @param options - Script execution options including keys and arguments
	     */
	    parseCommand(...args) {
	        args[0].push('EVALSHA_RO');
	        (0, EVAL_1.parseEvalArguments)(...args);
	    },
	    transformReply: EVAL_1.default.transformReply
	};
	
	return EVALSHA_RO;
}

var EVALSHA = {};

var hasRequiredEVALSHA;

function requireEVALSHA () {
	if (hasRequiredEVALSHA) return EVALSHA;
	hasRequiredEVALSHA = 1;
	var __createBinding = (EVALSHA && EVALSHA.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (EVALSHA && EVALSHA.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar = (EVALSHA && EVALSHA.__importStar) || function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
	    __setModuleDefault(result, mod);
	    return result;
	};
	Object.defineProperty(EVALSHA, "__esModule", { value: true });
	const EVAL_1 = __importStar(requireEVAL());
	EVALSHA.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Executes a Lua script server side using the script's SHA1 digest
	     * @param parser - The Redis command parser
	     * @param sha1 - SHA1 digest of the script
	     * @param options - Script execution options including keys and arguments
	     */
	    parseCommand(...args) {
	        args[0].push('EVALSHA');
	        (0, EVAL_1.parseEvalArguments)(...args);
	    },
	    transformReply: EVAL_1.default.transformReply
	};
	
	return EVALSHA;
}

var GEOADD = {};

var hasRequiredGEOADD;

function requireGEOADD () {
	if (hasRequiredGEOADD) return GEOADD;
	hasRequiredGEOADD = 1;
	Object.defineProperty(GEOADD, "__esModule", { value: true });
	GEOADD.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Adds geospatial items to the specified key
	     * @param parser - The Redis command parser
	     * @param key - Key to add the geospatial items to
	     * @param toAdd - Geospatial member(s) to add
	     * @param options - Options for the GEOADD command
	     */
	    parseCommand(parser, key, toAdd, options) {
	        parser.push('GEOADD');
	        parser.pushKey(key);
	        if (options?.condition) {
	            parser.push(options.condition);
	        }
	        else if (options?.NX) {
	            parser.push('NX');
	        }
	        else if (options?.XX) {
	            parser.push('XX');
	        }
	        if (options?.CH) {
	            parser.push('CH');
	        }
	        if (Array.isArray(toAdd)) {
	            for (const member of toAdd) {
	                pushMember(parser, member);
	            }
	        }
	        else {
	            pushMember(parser, toAdd);
	        }
	    },
	    transformReply: undefined
	};
	function pushMember(parser, { longitude, latitude, member }) {
	    parser.push(longitude.toString(), latitude.toString(), member);
	}
	
	return GEOADD;
}

var GEODIST = {};

var hasRequiredGEODIST;

function requireGEODIST () {
	if (hasRequiredGEODIST) return GEODIST;
	hasRequiredGEODIST = 1;
	Object.defineProperty(GEODIST, "__esModule", { value: true });
	GEODIST.default = {
	    CACHEABLE: true,
	    IS_READ_ONLY: true,
	    /**
	     * Returns the distance between two members in a geospatial index
	     * @param parser - The Redis command parser
	     * @param key - Key of the geospatial index
	     * @param member1 - First member in the geospatial index
	     * @param member2 - Second member in the geospatial index
	     * @param unit - Unit of distance (m, km, ft, mi)
	     */
	    parseCommand(parser, key, member1, member2, unit) {
	        parser.push('GEODIST');
	        parser.pushKey(key);
	        parser.push(member1, member2);
	        if (unit) {
	            parser.push(unit);
	        }
	    },
	    transformReply(reply) {
	        return reply === null ? null : Number(reply);
	    }
	};
	
	return GEODIST;
}

var GEOHASH = {};

var hasRequiredGEOHASH;

function requireGEOHASH () {
	if (hasRequiredGEOHASH) return GEOHASH;
	hasRequiredGEOHASH = 1;
	Object.defineProperty(GEOHASH, "__esModule", { value: true });
	GEOHASH.default = {
	    CACHEABLE: true,
	    IS_READ_ONLY: true,
	    /**
	     * Returns the Geohash string representation of one or more position members
	     * @param parser - The Redis command parser
	     * @param key - Key of the geospatial index
	     * @param member - One or more members in the geospatial index
	     */
	    parseCommand(parser, key, member) {
	        parser.push('GEOHASH');
	        parser.pushKey(key);
	        parser.pushVariadic(member);
	    },
	    transformReply: undefined
	};
	
	return GEOHASH;
}

var GEOPOS = {};

var hasRequiredGEOPOS;

function requireGEOPOS () {
	if (hasRequiredGEOPOS) return GEOPOS;
	hasRequiredGEOPOS = 1;
	Object.defineProperty(GEOPOS, "__esModule", { value: true });
	GEOPOS.default = {
	    CACHEABLE: true,
	    IS_READ_ONLY: true,
	    /**
	     * Returns the longitude and latitude of one or more members in a geospatial index
	     * @param parser - The Redis command parser
	     * @param key - Key of the geospatial index
	     * @param member - One or more members in the geospatial index
	     */
	    parseCommand(parser, key, member) {
	        parser.push('GEOPOS');
	        parser.pushKey(key);
	        parser.pushVariadic(member);
	    },
	    transformReply(reply) {
	        return reply.map(item => {
	            const unwrapped = item;
	            return unwrapped === null ? null : {
	                longitude: unwrapped[0],
	                latitude: unwrapped[1]
	            };
	        });
	    }
	};
	
	return GEOPOS;
}

var GEORADIUS_RO_WITH = {};

var GEORADIUS_WITH = {};

var GEORADIUS = {};

var GEOSEARCH = {};

var hasRequiredGEOSEARCH;

function requireGEOSEARCH () {
	if (hasRequiredGEOSEARCH) return GEOSEARCH;
	hasRequiredGEOSEARCH = 1;
	Object.defineProperty(GEOSEARCH, "__esModule", { value: true });
	GEOSEARCH.parseGeoSearchOptions = GEOSEARCH.parseGeoSearchArguments = void 0;
	function parseGeoSearchArguments(parser, key, from, by, options) {
	    parser.pushKey(key);
	    if (typeof from === 'string' || from instanceof Buffer) {
	        parser.push('FROMMEMBER', from);
	    }
	    else {
	        parser.push('FROMLONLAT', from.longitude.toString(), from.latitude.toString());
	    }
	    if ('radius' in by) {
	        parser.push('BYRADIUS', by.radius.toString(), by.unit);
	    }
	    else {
	        parser.push('BYBOX', by.width.toString(), by.height.toString(), by.unit);
	    }
	    parseGeoSearchOptions(parser, options);
	}
	GEOSEARCH.parseGeoSearchArguments = parseGeoSearchArguments;
	function parseGeoSearchOptions(parser, options) {
	    if (options?.SORT) {
	        parser.push(options.SORT);
	    }
	    if (options?.COUNT) {
	        if (typeof options.COUNT === 'number') {
	            parser.push('COUNT', options.COUNT.toString());
	        }
	        else {
	            parser.push('COUNT', options.COUNT.value.toString());
	            if (options.COUNT.ANY) {
	                parser.push('ANY');
	            }
	        }
	    }
	}
	GEOSEARCH.parseGeoSearchOptions = parseGeoSearchOptions;
	GEOSEARCH.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Queries members inside an area of a geospatial index
	     * @param parser - The Redis command parser
	     * @param key - Key of the geospatial index
	     * @param from - Center point of the search (member name or coordinates)
	     * @param by - Search area specification (radius or box dimensions)
	     * @param options - Additional search options
	     */
	    parseCommand(parser, key, from, by, options) {
	        parser.push('GEOSEARCH');
	        parseGeoSearchArguments(parser, key, from, by, options);
	    },
	    transformReply: undefined
	};
	
	return GEOSEARCH;
}

var hasRequiredGEORADIUS;

function requireGEORADIUS () {
	if (hasRequiredGEORADIUS) return GEORADIUS;
	hasRequiredGEORADIUS = 1;
	Object.defineProperty(GEORADIUS, "__esModule", { value: true });
	GEORADIUS.parseGeoRadiusArguments = void 0;
	const GEOSEARCH_1 = requireGEOSEARCH();
	function parseGeoRadiusArguments(parser, key, from, radius, unit, options) {
	    parser.pushKey(key);
	    parser.push(from.longitude.toString(), from.latitude.toString(), radius.toString(), unit);
	    (0, GEOSEARCH_1.parseGeoSearchOptions)(parser, options);
	}
	GEORADIUS.parseGeoRadiusArguments = parseGeoRadiusArguments;
	GEORADIUS.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Queries members in a geospatial index based on a radius from a center point
	     * @param parser - The Redis command parser
	     * @param key - Key of the geospatial index
	     * @param from - Center coordinates for the search
	     * @param radius - Radius of the search area
	     * @param unit - Unit of distance (m, km, ft, mi)
	     * @param options - Additional search options
	     */
	    parseCommand(...args) {
	        args[0].push('GEORADIUS');
	        return parseGeoRadiusArguments(...args);
	    },
	    transformReply: undefined
	};
	
	return GEORADIUS;
}

var GEOSEARCH_WITH = {};

var hasRequiredGEOSEARCH_WITH;

function requireGEOSEARCH_WITH () {
	if (hasRequiredGEOSEARCH_WITH) return GEOSEARCH_WITH;
	hasRequiredGEOSEARCH_WITH = 1;
	(function (exports) {
		var __importDefault = (GEOSEARCH_WITH && GEOSEARCH_WITH.__importDefault) || function (mod) {
		    return (mod && mod.__esModule) ? mod : { "default": mod };
		};
		Object.defineProperty(exports, "__esModule", { value: true });
		exports.GEO_REPLY_WITH = void 0;
		const GEOSEARCH_1 = __importDefault(requireGEOSEARCH());
		exports.GEO_REPLY_WITH = {
		    DISTANCE: 'WITHDIST',
		    HASH: 'WITHHASH',
		    COORDINATES: 'WITHCOORD'
		};
		exports.default = {
		    IS_READ_ONLY: GEOSEARCH_1.default.IS_READ_ONLY,
		    /**
		     * Queries members inside an area of a geospatial index with additional information
		     * @param parser - The Redis command parser
		     * @param key - Key of the geospatial index
		     * @param from - Center point of the search (member name or coordinates)
		     * @param by - Search area specification (radius or box dimensions)
		     * @param replyWith - Information to include with each returned member
		     * @param options - Additional search options
		     */
		    parseCommand(parser, key, from, by, replyWith, options) {
		        GEOSEARCH_1.default.parseCommand(parser, key, from, by, options);
		        parser.push(...replyWith);
		        parser.preserve = replyWith;
		    },
		    transformReply(reply, replyWith) {
		        const replyWithSet = new Set(replyWith);
		        let index = 0;
		        const distanceIndex = replyWithSet.has(exports.GEO_REPLY_WITH.DISTANCE) && ++index, hashIndex = replyWithSet.has(exports.GEO_REPLY_WITH.HASH) && ++index, coordinatesIndex = replyWithSet.has(exports.GEO_REPLY_WITH.COORDINATES) && ++index;
		        return reply.map(raw => {
		            const unwrapped = raw;
		            const item = {
		                member: unwrapped[0]
		            };
		            if (distanceIndex) {
		                item.distance = unwrapped[distanceIndex];
		            }
		            if (hashIndex) {
		                item.hash = unwrapped[hashIndex];
		            }
		            if (coordinatesIndex) {
		                const [longitude, latitude] = unwrapped[coordinatesIndex];
		                item.coordinates = {
		                    longitude,
		                    latitude
		                };
		            }
		            return item;
		        });
		    }
		};
		
	} (GEOSEARCH_WITH));
	return GEOSEARCH_WITH;
}

var hasRequiredGEORADIUS_WITH;

function requireGEORADIUS_WITH () {
	if (hasRequiredGEORADIUS_WITH) return GEORADIUS_WITH;
	hasRequiredGEORADIUS_WITH = 1;
	var __createBinding = (GEORADIUS_WITH && GEORADIUS_WITH.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (GEORADIUS_WITH && GEORADIUS_WITH.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar = (GEORADIUS_WITH && GEORADIUS_WITH.__importStar) || function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
	    __setModuleDefault(result, mod);
	    return result;
	};
	var __importDefault = (GEORADIUS_WITH && GEORADIUS_WITH.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(GEORADIUS_WITH, "__esModule", { value: true });
	GEORADIUS_WITH.parseGeoRadiusWithArguments = void 0;
	const GEORADIUS_1 = __importStar(requireGEORADIUS());
	const GEOSEARCH_WITH_1 = __importDefault(requireGEOSEARCH_WITH());
	function parseGeoRadiusWithArguments(parser, key, from, radius, unit, replyWith, options) {
	    (0, GEORADIUS_1.parseGeoRadiusArguments)(parser, key, from, radius, unit, options);
	    parser.pushVariadic(replyWith);
	    parser.preserve = replyWith;
	}
	GEORADIUS_WITH.parseGeoRadiusWithArguments = parseGeoRadiusWithArguments;
	GEORADIUS_WITH.default = {
	    IS_READ_ONLY: GEORADIUS_1.default.IS_READ_ONLY,
	    /**
	     * Queries members in a geospatial index based on a radius from a center point with additional information
	     * @param parser - The Redis command parser
	     * @param key - Key of the geospatial index
	     * @param from - Center coordinates for the search
	     * @param radius - Radius of the search area
	     * @param unit - Unit of distance (m, km, ft, mi)
	     * @param replyWith - Information to include with each returned member
	     * @param options - Additional search options
	     */
	    parseCommand(parser, key, from, radius, unit, replyWith, options) {
	        parser.push('GEORADIUS');
	        parseGeoRadiusWithArguments(parser, key, from, radius, unit, replyWith, options);
	    },
	    transformReply: GEOSEARCH_WITH_1.default.transformReply
	};
	
	return GEORADIUS_WITH;
}

var hasRequiredGEORADIUS_RO_WITH;

function requireGEORADIUS_RO_WITH () {
	if (hasRequiredGEORADIUS_RO_WITH) return GEORADIUS_RO_WITH;
	hasRequiredGEORADIUS_RO_WITH = 1;
	var __importDefault = (GEORADIUS_RO_WITH && GEORADIUS_RO_WITH.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(GEORADIUS_RO_WITH, "__esModule", { value: true });
	const GEORADIUS_WITH_1 = requireGEORADIUS_WITH();
	const GEORADIUS_WITH_2 = __importDefault(requireGEORADIUS_WITH());
	GEORADIUS_RO_WITH.default = {
	    CACHEABLE: true,
	    IS_READ_ONLY: true,
	    /**
	     * Read-only variant that queries members in a geospatial index based on a radius from a center point with additional information
	     * @param parser - The Redis command parser
	     * @param key - Key of the geospatial index
	     * @param from - Center coordinates for the search
	     * @param radius - Radius of the search area
	     * @param unit - Unit of distance (m, km, ft, mi)
	     * @param replyWith - Information to include with each returned member
	     * @param options - Additional search options
	     */
	    parseCommand(...args) {
	        args[0].push('GEORADIUS_RO');
	        (0, GEORADIUS_WITH_1.parseGeoRadiusWithArguments)(...args);
	    },
	    transformReply: GEORADIUS_WITH_2.default.transformReply
	};
	
	return GEORADIUS_RO_WITH;
}

var GEORADIUS_RO = {};

var hasRequiredGEORADIUS_RO;

function requireGEORADIUS_RO () {
	if (hasRequiredGEORADIUS_RO) return GEORADIUS_RO;
	hasRequiredGEORADIUS_RO = 1;
	var __createBinding = (GEORADIUS_RO && GEORADIUS_RO.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (GEORADIUS_RO && GEORADIUS_RO.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar = (GEORADIUS_RO && GEORADIUS_RO.__importStar) || function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
	    __setModuleDefault(result, mod);
	    return result;
	};
	Object.defineProperty(GEORADIUS_RO, "__esModule", { value: true });
	const GEORADIUS_1 = __importStar(requireGEORADIUS());
	GEORADIUS_RO.default = {
	    CACHEABLE: true,
	    IS_READ_ONLY: true,
	    /**
	     * Read-only variant that queries members in a geospatial index based on a radius from a center point
	     * @param parser - The Redis command parser
	     * @param key - Key of the geospatial index
	     * @param from - Center coordinates for the search
	     * @param radius - Radius of the search area
	     * @param unit - Unit of distance (m, km, ft, mi)
	     * @param options - Additional search options
	     */
	    parseCommand(...args) {
	        args[0].push('GEORADIUS_RO');
	        (0, GEORADIUS_1.parseGeoRadiusArguments)(...args);
	    },
	    transformReply: GEORADIUS_1.default.transformReply
	};
	
	return GEORADIUS_RO;
}

var GEORADIUS_STORE = {};

var hasRequiredGEORADIUS_STORE;

function requireGEORADIUS_STORE () {
	if (hasRequiredGEORADIUS_STORE) return GEORADIUS_STORE;
	hasRequiredGEORADIUS_STORE = 1;
	var __createBinding = (GEORADIUS_STORE && GEORADIUS_STORE.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (GEORADIUS_STORE && GEORADIUS_STORE.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar = (GEORADIUS_STORE && GEORADIUS_STORE.__importStar) || function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
	    __setModuleDefault(result, mod);
	    return result;
	};
	Object.defineProperty(GEORADIUS_STORE, "__esModule", { value: true });
	const GEORADIUS_1 = __importStar(requireGEORADIUS());
	GEORADIUS_STORE.default = {
	    IS_READ_ONLY: GEORADIUS_1.default.IS_READ_ONLY,
	    /**
	     * Queries members in a geospatial index based on a radius from a center point and stores the results
	     * @param parser - The Redis command parser
	     * @param key - Key of the geospatial index
	     * @param from - Center coordinates for the search
	     * @param radius - Radius of the search area
	     * @param unit - Unit of distance (m, km, ft, mi)
	     * @param destination - Key to store the results
	     * @param options - Additional search and storage options
	     */
	    parseCommand(parser, key, from, radius, unit, destination, options) {
	        parser.push('GEORADIUS');
	        (0, GEORADIUS_1.parseGeoRadiusArguments)(parser, key, from, radius, unit, options);
	        if (options?.STOREDIST) {
	            parser.push('STOREDIST');
	            parser.pushKey(destination);
	        }
	        else {
	            parser.push('STORE');
	            parser.pushKey(destination);
	        }
	    },
	    transformReply: undefined
	};
	
	return GEORADIUS_STORE;
}

var GEORADIUSBYMEMBER_RO_WITH = {};

var GEORADIUSBYMEMBER_WITH = {};

var GEORADIUSBYMEMBER = {};

var hasRequiredGEORADIUSBYMEMBER;

function requireGEORADIUSBYMEMBER () {
	if (hasRequiredGEORADIUSBYMEMBER) return GEORADIUSBYMEMBER;
	hasRequiredGEORADIUSBYMEMBER = 1;
	Object.defineProperty(GEORADIUSBYMEMBER, "__esModule", { value: true });
	GEORADIUSBYMEMBER.parseGeoRadiusByMemberArguments = void 0;
	const GEOSEARCH_1 = requireGEOSEARCH();
	function parseGeoRadiusByMemberArguments(parser, key, from, radius, unit, options) {
	    parser.pushKey(key);
	    parser.push(from, radius.toString(), unit);
	    (0, GEOSEARCH_1.parseGeoSearchOptions)(parser, options);
	}
	GEORADIUSBYMEMBER.parseGeoRadiusByMemberArguments = parseGeoRadiusByMemberArguments;
	GEORADIUSBYMEMBER.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Queries members in a geospatial index based on a radius from a member
	     * @param parser - The Redis command parser
	     * @param key - Key of the geospatial index
	     * @param from - Member name to use as center point
	     * @param radius - Radius of the search area
	     * @param unit - Unit of distance (m, km, ft, mi)
	     * @param options - Additional search options
	     */
	    parseCommand(parser, key, from, radius, unit, options) {
	        parser.push('GEORADIUSBYMEMBER');
	        parseGeoRadiusByMemberArguments(parser, key, from, radius, unit, options);
	    },
	    transformReply: undefined
	};
	
	return GEORADIUSBYMEMBER;
}

var hasRequiredGEORADIUSBYMEMBER_WITH;

function requireGEORADIUSBYMEMBER_WITH () {
	if (hasRequiredGEORADIUSBYMEMBER_WITH) return GEORADIUSBYMEMBER_WITH;
	hasRequiredGEORADIUSBYMEMBER_WITH = 1;
	var __importDefault = (GEORADIUSBYMEMBER_WITH && GEORADIUSBYMEMBER_WITH.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(GEORADIUSBYMEMBER_WITH, "__esModule", { value: true });
	GEORADIUSBYMEMBER_WITH.parseGeoRadiusByMemberWithArguments = void 0;
	const GEORADIUSBYMEMBER_1 = __importDefault(requireGEORADIUSBYMEMBER());
	const GEOSEARCH_1 = requireGEOSEARCH();
	const GEOSEARCH_WITH_1 = __importDefault(requireGEOSEARCH_WITH());
	function parseGeoRadiusByMemberWithArguments(parser, key, from, radius, unit, replyWith, options) {
	    parser.pushKey(key);
	    parser.push(from, radius.toString(), unit);
	    (0, GEOSEARCH_1.parseGeoSearchOptions)(parser, options);
	    parser.push(...replyWith);
	    parser.preserve = replyWith;
	}
	GEORADIUSBYMEMBER_WITH.parseGeoRadiusByMemberWithArguments = parseGeoRadiusByMemberWithArguments;
	GEORADIUSBYMEMBER_WITH.default = {
	    IS_READ_ONLY: GEORADIUSBYMEMBER_1.default.IS_READ_ONLY,
	    /**
	     * Queries members in a geospatial index based on a radius from a member with additional information
	     * @param parser - The Redis command parser
	     * @param key - Key of the geospatial index
	     * @param from - Member name to use as center point
	     * @param radius - Radius of the search area
	     * @param unit - Unit of distance (m, km, ft, mi)
	     * @param replyWith - Information to include with each returned member
	     * @param options - Additional search options
	     */
	    parseCommand(parser, key, from, radius, unit, replyWith, options) {
	        parser.push('GEORADIUSBYMEMBER');
	        parseGeoRadiusByMemberWithArguments(parser, key, from, radius, unit, replyWith, options);
	    },
	    transformReply: GEOSEARCH_WITH_1.default.transformReply
	};
	
	return GEORADIUSBYMEMBER_WITH;
}

var hasRequiredGEORADIUSBYMEMBER_RO_WITH;

function requireGEORADIUSBYMEMBER_RO_WITH () {
	if (hasRequiredGEORADIUSBYMEMBER_RO_WITH) return GEORADIUSBYMEMBER_RO_WITH;
	hasRequiredGEORADIUSBYMEMBER_RO_WITH = 1;
	var __createBinding = (GEORADIUSBYMEMBER_RO_WITH && GEORADIUSBYMEMBER_RO_WITH.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (GEORADIUSBYMEMBER_RO_WITH && GEORADIUSBYMEMBER_RO_WITH.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar = (GEORADIUSBYMEMBER_RO_WITH && GEORADIUSBYMEMBER_RO_WITH.__importStar) || function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
	    __setModuleDefault(result, mod);
	    return result;
	};
	Object.defineProperty(GEORADIUSBYMEMBER_RO_WITH, "__esModule", { value: true });
	const GEORADIUSBYMEMBER_WITH_1 = __importStar(requireGEORADIUSBYMEMBER_WITH());
	GEORADIUSBYMEMBER_RO_WITH.default = {
	    CACHEABLE: true,
	    IS_READ_ONLY: true,
	    /**
	     * Read-only variant that queries members in a geospatial index based on a radius from a member with additional information
	     * @param parser - The Redis command parser
	     * @param key - Key of the geospatial index
	     * @param from - Member name to use as center point
	     * @param radius - Radius of the search area
	     * @param unit - Unit of distance (m, km, ft, mi)
	     * @param withValues - Information to include with each returned member
	     */
	    parseCommand(...args) {
	        const parser = args[0];
	        parser.push('GEORADIUSBYMEMBER_RO');
	        (0, GEORADIUSBYMEMBER_WITH_1.parseGeoRadiusByMemberWithArguments)(...args);
	    },
	    transformReply: GEORADIUSBYMEMBER_WITH_1.default.transformReply
	};
	
	return GEORADIUSBYMEMBER_RO_WITH;
}

var GEORADIUSBYMEMBER_RO = {};

var hasRequiredGEORADIUSBYMEMBER_RO;

function requireGEORADIUSBYMEMBER_RO () {
	if (hasRequiredGEORADIUSBYMEMBER_RO) return GEORADIUSBYMEMBER_RO;
	hasRequiredGEORADIUSBYMEMBER_RO = 1;
	var __createBinding = (GEORADIUSBYMEMBER_RO && GEORADIUSBYMEMBER_RO.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (GEORADIUSBYMEMBER_RO && GEORADIUSBYMEMBER_RO.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar = (GEORADIUSBYMEMBER_RO && GEORADIUSBYMEMBER_RO.__importStar) || function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
	    __setModuleDefault(result, mod);
	    return result;
	};
	Object.defineProperty(GEORADIUSBYMEMBER_RO, "__esModule", { value: true });
	const GEORADIUSBYMEMBER_1 = __importStar(requireGEORADIUSBYMEMBER());
	GEORADIUSBYMEMBER_RO.default = {
	    CACHEABLE: true,
	    IS_READ_ONLY: true,
	    /**
	     * Read-only variant that queries members in a geospatial index based on a radius from a member
	     * @param parser - The Redis command parser
	     * @param key - Key of the geospatial index
	     * @param from - Member name to use as center point
	     * @param radius - Radius of the search area
	     * @param unit - Unit of distance (m, km, ft, mi)
	     * @param options - Additional search options
	     */
	    parseCommand(...args) {
	        const parser = args[0];
	        parser.push('GEORADIUSBYMEMBER_RO');
	        (0, GEORADIUSBYMEMBER_1.parseGeoRadiusByMemberArguments)(...args);
	    },
	    transformReply: GEORADIUSBYMEMBER_1.default.transformReply
	};
	
	return GEORADIUSBYMEMBER_RO;
}

var GEORADIUSBYMEMBER_STORE = {};

var hasRequiredGEORADIUSBYMEMBER_STORE;

function requireGEORADIUSBYMEMBER_STORE () {
	if (hasRequiredGEORADIUSBYMEMBER_STORE) return GEORADIUSBYMEMBER_STORE;
	hasRequiredGEORADIUSBYMEMBER_STORE = 1;
	var __createBinding = (GEORADIUSBYMEMBER_STORE && GEORADIUSBYMEMBER_STORE.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (GEORADIUSBYMEMBER_STORE && GEORADIUSBYMEMBER_STORE.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar = (GEORADIUSBYMEMBER_STORE && GEORADIUSBYMEMBER_STORE.__importStar) || function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
	    __setModuleDefault(result, mod);
	    return result;
	};
	Object.defineProperty(GEORADIUSBYMEMBER_STORE, "__esModule", { value: true });
	const GEORADIUSBYMEMBER_1 = __importStar(requireGEORADIUSBYMEMBER());
	GEORADIUSBYMEMBER_STORE.default = {
	    IS_READ_ONLY: GEORADIUSBYMEMBER_1.default.IS_READ_ONLY,
	    /**
	     * Queries members in a geospatial index based on a radius from a member and stores the results
	     * @param parser - The Redis command parser
	     * @param key - Key of the geospatial index
	     * @param from - Member name to use as center point
	     * @param radius - Radius of the search area
	     * @param unit - Unit of distance (m, km, ft, mi)
	     * @param destination - Key to store the results
	     * @param options - Additional search and storage options
	     */
	    parseCommand(parser, key, from, radius, unit, destination, options) {
	        parser.push('GEORADIUSBYMEMBER');
	        (0, GEORADIUSBYMEMBER_1.parseGeoRadiusByMemberArguments)(parser, key, from, radius, unit, options);
	        if (options?.STOREDIST) {
	            parser.push('STOREDIST');
	            parser.pushKey(destination);
	        }
	        else {
	            parser.push('STORE');
	            parser.pushKey(destination);
	        }
	    },
	    transformReply: undefined
	};
	
	return GEORADIUSBYMEMBER_STORE;
}

var GEOSEARCHSTORE = {};

var hasRequiredGEOSEARCHSTORE;

function requireGEOSEARCHSTORE () {
	if (hasRequiredGEOSEARCHSTORE) return GEOSEARCHSTORE;
	hasRequiredGEOSEARCHSTORE = 1;
	Object.defineProperty(GEOSEARCHSTORE, "__esModule", { value: true });
	const GEOSEARCH_1 = requireGEOSEARCH();
	GEOSEARCHSTORE.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Searches a geospatial index and stores the results in a new sorted set
	     * @param parser - The Redis command parser
	     * @param destination - Key to store the results
	     * @param source - Key of the geospatial index to search
	     * @param from - Center point of the search (member name or coordinates)
	     * @param by - Search area specification (radius or box dimensions)
	     * @param options - Additional search and storage options
	     */
	    parseCommand(parser, destination, source, from, by, options) {
	        parser.push('GEOSEARCHSTORE');
	        if (destination !== undefined) {
	            parser.pushKey(destination);
	        }
	        (0, GEOSEARCH_1.parseGeoSearchArguments)(parser, source, from, by, options);
	        if (options?.STOREDIST) {
	            parser.push('STOREDIST');
	        }
	    },
	    transformReply: undefined
	};
	
	return GEOSEARCHSTORE;
}

var GET$2 = {};

var hasRequiredGET$2;

function requireGET$2 () {
	if (hasRequiredGET$2) return GET$2;
	hasRequiredGET$2 = 1;
	Object.defineProperty(GET$2, "__esModule", { value: true });
	GET$2.default = {
	    CACHEABLE: true,
	    IS_READ_ONLY: true,
	    /**
	     * Gets the value of a key
	     * @param parser - The Redis command parser
	     * @param key - Key to get the value of
	     */
	    parseCommand(parser, key) {
	        parser.push('GET');
	        parser.pushKey(key);
	    },
	    transformReply: undefined
	};
	
	return GET$2;
}

var GETBIT = {};

var hasRequiredGETBIT;

function requireGETBIT () {
	if (hasRequiredGETBIT) return GETBIT;
	hasRequiredGETBIT = 1;
	Object.defineProperty(GETBIT, "__esModule", { value: true });
	GETBIT.default = {
	    CACHEABLE: true,
	    IS_READ_ONLY: true,
	    /**
	     * Returns the bit value at a given offset in a string value
	     * @param parser - The Redis command parser
	     * @param key - Key to retrieve the bit from
	     * @param offset - Bit offset
	     */
	    parseCommand(parser, key, offset) {
	        parser.push('GETBIT');
	        parser.pushKey(key);
	        parser.push(offset.toString());
	    },
	    transformReply: undefined
	};
	
	return GETBIT;
}

var GETDEL = {};

var hasRequiredGETDEL;

function requireGETDEL () {
	if (hasRequiredGETDEL) return GETDEL;
	hasRequiredGETDEL = 1;
	Object.defineProperty(GETDEL, "__esModule", { value: true });
	GETDEL.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Gets the value of a key and deletes the key
	     * @param parser - The Redis command parser
	     * @param key - Key to get and delete
	     */
	    parseCommand(parser, key) {
	        parser.push('GETDEL');
	        parser.pushKey(key);
	    },
	    transformReply: undefined
	};
	
	return GETDEL;
}

var GETEX = {};

var hasRequiredGETEX;

function requireGETEX () {
	if (hasRequiredGETEX) return GETEX;
	hasRequiredGETEX = 1;
	Object.defineProperty(GETEX, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	GETEX.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Gets the value of a key and optionally sets its expiration
	     * @param parser - The Redis command parser
	     * @param key - Key to get value from
	     * @param options - Options for setting expiration
	     */
	    parseCommand(parser, key, options) {
	        parser.push('GETEX');
	        parser.pushKey(key);
	        if ('type' in options) {
	            switch (options.type) {
	                case 'EX':
	                case 'PX':
	                    parser.push(options.type, options.value.toString());
	                    break;
	                case 'EXAT':
	                case 'PXAT':
	                    parser.push(options.type, (0, generic_transformers_1.transformEXAT)(options.value));
	                    break;
	                case 'PERSIST':
	                    parser.push('PERSIST');
	                    break;
	            }
	        }
	        else {
	            if ('EX' in options) {
	                parser.push('EX', options.EX.toString());
	            }
	            else if ('PX' in options) {
	                parser.push('PX', options.PX.toString());
	            }
	            else if ('EXAT' in options) {
	                parser.push('EXAT', (0, generic_transformers_1.transformEXAT)(options.EXAT));
	            }
	            else if ('PXAT' in options) {
	                parser.push('PXAT', (0, generic_transformers_1.transformPXAT)(options.PXAT));
	            }
	            else { // PERSIST
	                parser.push('PERSIST');
	            }
	        }
	    },
	    transformReply: undefined
	};
	
	return GETEX;
}

var GETRANGE = {};

var hasRequiredGETRANGE;

function requireGETRANGE () {
	if (hasRequiredGETRANGE) return GETRANGE;
	hasRequiredGETRANGE = 1;
	Object.defineProperty(GETRANGE, "__esModule", { value: true });
	GETRANGE.default = {
	    CACHEABLE: true,
	    IS_READ_ONLY: true,
	    /**
	     * Returns a substring of the string stored at a key
	     * @param parser - The Redis command parser
	     * @param key - Key to get substring from
	     * @param start - Start position of the substring
	     * @param end - End position of the substring
	     */
	    parseCommand(parser, key, start, end) {
	        parser.push('GETRANGE');
	        parser.pushKey(key);
	        parser.push(start.toString(), end.toString());
	    },
	    transformReply: undefined
	};
	
	return GETRANGE;
}

var GETSET = {};

var hasRequiredGETSET;

function requireGETSET () {
	if (hasRequiredGETSET) return GETSET;
	hasRequiredGETSET = 1;
	Object.defineProperty(GETSET, "__esModule", { value: true });
	GETSET.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Sets a key to a new value and returns its old value
	     * @param parser - The Redis command parser
	     * @param key - Key to set
	     * @param value - Value to set
	     */
	    parseCommand(parser, key, value) {
	        parser.push('GETSET');
	        parser.pushKey(key);
	        parser.push(value);
	    },
	    transformReply: undefined
	};
	
	return GETSET;
}

var EXISTS$2 = {};

var hasRequiredEXISTS$2;

function requireEXISTS$2 () {
	if (hasRequiredEXISTS$2) return EXISTS$2;
	hasRequiredEXISTS$2 = 1;
	Object.defineProperty(EXISTS$2, "__esModule", { value: true });
	EXISTS$2.default = {
	    CACHEABLE: true,
	    IS_READ_ONLY: true,
	    /**
	     * Determines if the specified keys exist
	     * @param parser - The Redis command parser
	     * @param keys - One or more keys to check
	     */
	    parseCommand(parser, keys) {
	        parser.push('EXISTS');
	        parser.pushKeys(keys);
	    },
	    transformReply: undefined
	};
	
	return EXISTS$2;
}

var EXPIRE = {};

var hasRequiredEXPIRE;

function requireEXPIRE () {
	if (hasRequiredEXPIRE) return EXPIRE;
	hasRequiredEXPIRE = 1;
	Object.defineProperty(EXPIRE, "__esModule", { value: true });
	EXPIRE.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Sets a timeout on key. After the timeout has expired, the key will be automatically deleted
	     * @param parser - The Redis command parser
	     * @param key - Key to set expiration on
	     * @param seconds - Number of seconds until key expiration
	     * @param mode - Expiration mode: NX (only if key has no expiry), XX (only if key has existing expiry), GT (only if new expiry is greater than current), LT (only if new expiry is less than current)
	     */
	    parseCommand(parser, key, seconds, mode) {
	        parser.push('EXPIRE');
	        parser.pushKey(key);
	        parser.push(seconds.toString());
	        if (mode) {
	            parser.push(mode);
	        }
	    },
	    transformReply: undefined
	};
	
	return EXPIRE;
}

var EXPIREAT = {};

var hasRequiredEXPIREAT;

function requireEXPIREAT () {
	if (hasRequiredEXPIREAT) return EXPIREAT;
	hasRequiredEXPIREAT = 1;
	Object.defineProperty(EXPIREAT, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	EXPIREAT.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Sets the expiration for a key at a specific Unix timestamp
	     * @param parser - The Redis command parser
	     * @param key - Key to set expiration on
	     * @param timestamp - Unix timestamp (seconds since January 1, 1970) or Date object
	     * @param mode - Expiration mode: NX (only if key has no expiry), XX (only if key has existing expiry), GT (only if new expiry is greater than current), LT (only if new expiry is less than current)
	     */
	    parseCommand(parser, key, timestamp, mode) {
	        parser.push('EXPIREAT');
	        parser.pushKey(key);
	        parser.push((0, generic_transformers_1.transformEXAT)(timestamp));
	        if (mode) {
	            parser.push(mode);
	        }
	    },
	    transformReply: undefined
	};
	
	return EXPIREAT;
}

var EXPIRETIME = {};

var hasRequiredEXPIRETIME;

function requireEXPIRETIME () {
	if (hasRequiredEXPIRETIME) return EXPIRETIME;
	hasRequiredEXPIRETIME = 1;
	Object.defineProperty(EXPIRETIME, "__esModule", { value: true });
	EXPIRETIME.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Returns the absolute Unix timestamp (since January 1, 1970) at which the given key will expire
	     * @param parser - The Redis command parser
	     * @param key - Key to check expiration time
	     */
	    parseCommand(parser, key) {
	        parser.push('EXPIRETIME');
	        parser.pushKey(key);
	    },
	    transformReply: undefined
	};
	
	return EXPIRETIME;
}

var FLUSHALL = {};

var hasRequiredFLUSHALL;

function requireFLUSHALL () {
	if (hasRequiredFLUSHALL) return FLUSHALL;
	hasRequiredFLUSHALL = 1;
	Object.defineProperty(FLUSHALL, "__esModule", { value: true });
	FLUSHALL.REDIS_FLUSH_MODES = void 0;
	FLUSHALL.REDIS_FLUSH_MODES = {
	    ASYNC: 'ASYNC',
	    SYNC: 'SYNC'
	};
	FLUSHALL.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: false,
	    /**
	     * Removes all keys from all databases
	     * @param parser - The Redis command parser
	     * @param mode - Optional flush mode (ASYNC or SYNC)
	     */
	    parseCommand(parser, mode) {
	        parser.push('FLUSHALL');
	        if (mode) {
	            parser.push(mode);
	        }
	    },
	    transformReply: undefined
	};
	
	return FLUSHALL;
}

var FLUSHDB = {};

var hasRequiredFLUSHDB;

function requireFLUSHDB () {
	if (hasRequiredFLUSHDB) return FLUSHDB;
	hasRequiredFLUSHDB = 1;
	Object.defineProperty(FLUSHDB, "__esModule", { value: true });
	FLUSHDB.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: false,
	    /**
	     * Removes all keys from the current database
	     * @param parser - The Redis command parser
	     * @param mode - Optional flush mode (ASYNC or SYNC)
	     */
	    parseCommand(parser, mode) {
	        parser.push('FLUSHDB');
	        if (mode) {
	            parser.push(mode);
	        }
	    },
	    transformReply: undefined
	};
	
	return FLUSHDB;
}

var FCALL = {};

var hasRequiredFCALL;

function requireFCALL () {
	if (hasRequiredFCALL) return FCALL;
	hasRequiredFCALL = 1;
	var __createBinding = (FCALL && FCALL.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (FCALL && FCALL.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar = (FCALL && FCALL.__importStar) || function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
	    __setModuleDefault(result, mod);
	    return result;
	};
	Object.defineProperty(FCALL, "__esModule", { value: true });
	const EVAL_1 = __importStar(requireEVAL());
	FCALL.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Invokes a Redis function
	     * @param parser - The Redis command parser
	     * @param functionName - Name of the function to call
	     * @param options - Function execution options including keys and arguments
	     */
	    parseCommand(...args) {
	        args[0].push('FCALL');
	        (0, EVAL_1.parseEvalArguments)(...args);
	    },
	    transformReply: EVAL_1.default.transformReply
	};
	
	return FCALL;
}

var FCALL_RO = {};

var hasRequiredFCALL_RO;

function requireFCALL_RO () {
	if (hasRequiredFCALL_RO) return FCALL_RO;
	hasRequiredFCALL_RO = 1;
	var __createBinding = (FCALL_RO && FCALL_RO.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (FCALL_RO && FCALL_RO.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar = (FCALL_RO && FCALL_RO.__importStar) || function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
	    __setModuleDefault(result, mod);
	    return result;
	};
	Object.defineProperty(FCALL_RO, "__esModule", { value: true });
	const EVAL_1 = __importStar(requireEVAL());
	FCALL_RO.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Invokes a read-only Redis function
	     * @param parser - The Redis command parser
	     * @param functionName - Name of the function to call
	     * @param options - Function execution options including keys and arguments
	     */
	    parseCommand(...args) {
	        args[0].push('FCALL_RO');
	        (0, EVAL_1.parseEvalArguments)(...args);
	    },
	    transformReply: EVAL_1.default.transformReply
	};
	
	return FCALL_RO;
}

var FUNCTION_DELETE = {};

var hasRequiredFUNCTION_DELETE;

function requireFUNCTION_DELETE () {
	if (hasRequiredFUNCTION_DELETE) return FUNCTION_DELETE;
	hasRequiredFUNCTION_DELETE = 1;
	Object.defineProperty(FUNCTION_DELETE, "__esModule", { value: true });
	FUNCTION_DELETE.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: false,
	    /**
	     * Deletes a library and all its functions
	     * @param parser - The Redis command parser
	     * @param library - Name of the library to delete
	     */
	    parseCommand(parser, library) {
	        parser.push('FUNCTION', 'DELETE', library);
	    },
	    transformReply: undefined
	};
	
	return FUNCTION_DELETE;
}

var FUNCTION_DUMP = {};

var hasRequiredFUNCTION_DUMP;

function requireFUNCTION_DUMP () {
	if (hasRequiredFUNCTION_DUMP) return FUNCTION_DUMP;
	hasRequiredFUNCTION_DUMP = 1;
	Object.defineProperty(FUNCTION_DUMP, "__esModule", { value: true });
	FUNCTION_DUMP.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Returns a serialized payload representing the current functions loaded in the server
	     * @param parser - The Redis command parser
	     */
	    parseCommand(parser) {
	        parser.push('FUNCTION', 'DUMP');
	    },
	    transformReply: undefined
	};
	
	return FUNCTION_DUMP;
}

var FUNCTION_FLUSH = {};

var hasRequiredFUNCTION_FLUSH;

function requireFUNCTION_FLUSH () {
	if (hasRequiredFUNCTION_FLUSH) return FUNCTION_FLUSH;
	hasRequiredFUNCTION_FLUSH = 1;
	Object.defineProperty(FUNCTION_FLUSH, "__esModule", { value: true });
	FUNCTION_FLUSH.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: false,
	    /**
	     * Deletes all the libraries and functions from a Redis server
	     * @param parser - The Redis command parser
	     * @param mode - Optional flush mode (ASYNC or SYNC)
	     */
	    parseCommand(parser, mode) {
	        parser.push('FUNCTION', 'FLUSH');
	        if (mode) {
	            parser.push(mode);
	        }
	    },
	    transformReply: undefined
	};
	
	return FUNCTION_FLUSH;
}

var FUNCTION_KILL = {};

var hasRequiredFUNCTION_KILL;

function requireFUNCTION_KILL () {
	if (hasRequiredFUNCTION_KILL) return FUNCTION_KILL;
	hasRequiredFUNCTION_KILL = 1;
	Object.defineProperty(FUNCTION_KILL, "__esModule", { value: true });
	FUNCTION_KILL.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Kills a function that is currently executing
	     * @param parser - The Redis command parser
	     */
	    parseCommand(parser) {
	        parser.push('FUNCTION', 'KILL');
	    },
	    transformReply: undefined
	};
	
	return FUNCTION_KILL;
}

var FUNCTION_LIST_WITHCODE = {};

var FUNCTION_LIST = {};

var hasRequiredFUNCTION_LIST;

function requireFUNCTION_LIST () {
	if (hasRequiredFUNCTION_LIST) return FUNCTION_LIST;
	hasRequiredFUNCTION_LIST = 1;
	Object.defineProperty(FUNCTION_LIST, "__esModule", { value: true });
	FUNCTION_LIST.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: false,
	    /**
	     * Returns all libraries and functions
	     * @param parser - The Redis command parser
	     * @param options - Options for listing functions
	     */
	    parseCommand(parser, options) {
	        parser.push('FUNCTION', 'LIST');
	        if (options?.LIBRARYNAME) {
	            parser.push('LIBRARYNAME', options.LIBRARYNAME);
	        }
	    },
	    transformReply: {
	        2: (reply) => {
	            return reply.map(library => {
	                const unwrapped = library;
	                return {
	                    library_name: unwrapped[1],
	                    engine: unwrapped[3],
	                    functions: unwrapped[5].map(fn => {
	                        const unwrapped = fn;
	                        return {
	                            name: unwrapped[1],
	                            description: unwrapped[3],
	                            flags: unwrapped[5]
	                        };
	                    })
	                };
	            });
	        },
	        3: undefined
	    }
	};
	
	return FUNCTION_LIST;
}

var hasRequiredFUNCTION_LIST_WITHCODE;

function requireFUNCTION_LIST_WITHCODE () {
	if (hasRequiredFUNCTION_LIST_WITHCODE) return FUNCTION_LIST_WITHCODE;
	hasRequiredFUNCTION_LIST_WITHCODE = 1;
	var __importDefault = (FUNCTION_LIST_WITHCODE && FUNCTION_LIST_WITHCODE.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(FUNCTION_LIST_WITHCODE, "__esModule", { value: true });
	const FUNCTION_LIST_1 = __importDefault(requireFUNCTION_LIST());
	FUNCTION_LIST_WITHCODE.default = {
	    NOT_KEYED_COMMAND: FUNCTION_LIST_1.default.NOT_KEYED_COMMAND,
	    IS_READ_ONLY: FUNCTION_LIST_1.default.IS_READ_ONLY,
	    /**
	     * Returns all libraries and functions including their source code
	     * @param parser - The Redis command parser
	     * @param options - Options for listing functions
	     */
	    parseCommand(...args) {
	        FUNCTION_LIST_1.default.parseCommand(...args);
	        args[0].push('WITHCODE');
	    },
	    transformReply: {
	        2: (reply) => {
	            return reply.map(library => {
	                const unwrapped = library;
	                return {
	                    library_name: unwrapped[1],
	                    engine: unwrapped[3],
	                    functions: unwrapped[5].map(fn => {
	                        const unwrapped = fn;
	                        return {
	                            name: unwrapped[1],
	                            description: unwrapped[3],
	                            flags: unwrapped[5]
	                        };
	                    }),
	                    library_code: unwrapped[7]
	                };
	            });
	        },
	        3: undefined
	    }
	};
	
	return FUNCTION_LIST_WITHCODE;
}

var FUNCTION_LOAD = {};

var hasRequiredFUNCTION_LOAD;

function requireFUNCTION_LOAD () {
	if (hasRequiredFUNCTION_LOAD) return FUNCTION_LOAD;
	hasRequiredFUNCTION_LOAD = 1;
	Object.defineProperty(FUNCTION_LOAD, "__esModule", { value: true });
	FUNCTION_LOAD.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: false,
	    /**
	     * Loads a library to Redis
	     * @param parser - The Redis command parser
	     * @param code - Library code to load
	     * @param options - Function load options
	     */
	    parseCommand(parser, code, options) {
	        parser.push('FUNCTION', 'LOAD');
	        if (options?.REPLACE) {
	            parser.push('REPLACE');
	        }
	        parser.push(code);
	    },
	    transformReply: undefined
	};
	
	return FUNCTION_LOAD;
}

var FUNCTION_RESTORE = {};

var hasRequiredFUNCTION_RESTORE;

function requireFUNCTION_RESTORE () {
	if (hasRequiredFUNCTION_RESTORE) return FUNCTION_RESTORE;
	hasRequiredFUNCTION_RESTORE = 1;
	Object.defineProperty(FUNCTION_RESTORE, "__esModule", { value: true });
	FUNCTION_RESTORE.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: false,
	    /**
	     * Restores libraries from the dump payload
	     * @param parser - The Redis command parser
	     * @param dump - Serialized payload of functions to restore
	     * @param options - Options for the restore operation
	     */
	    parseCommand(parser, dump, options) {
	        parser.push('FUNCTION', 'RESTORE', dump);
	        if (options?.mode) {
	            parser.push(options.mode);
	        }
	    },
	    transformReply: undefined
	};
	
	return FUNCTION_RESTORE;
}

var FUNCTION_STATS = {};

var hasRequiredFUNCTION_STATS;

function requireFUNCTION_STATS () {
	if (hasRequiredFUNCTION_STATS) return FUNCTION_STATS;
	hasRequiredFUNCTION_STATS = 1;
	Object.defineProperty(FUNCTION_STATS, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	FUNCTION_STATS.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Returns information about the function that is currently running and information about the available execution engines
	     * @param parser - The Redis command parser
	     */
	    parseCommand(parser) {
	        parser.push('FUNCTION', 'STATS');
	    },
	    transformReply: {
	        2: (reply) => {
	            return {
	                running_script: transformRunningScript(reply[1]),
	                engines: transformEngines(reply[3])
	            };
	        },
	        3: undefined
	    }
	};
	function transformRunningScript(reply) {
	    if ((0, generic_transformers_1.isNullReply)(reply)) {
	        return null;
	    }
	    const unwraped = reply;
	    return {
	        name: unwraped[1],
	        command: unwraped[3],
	        duration_ms: unwraped[5]
	    };
	}
	function transformEngines(reply) {
	    const unwraped = reply;
	    const engines = Object.create(null);
	    for (let i = 0; i < unwraped.length; i++) {
	        const name = unwraped[i], stats = unwraped[++i], unwrapedStats = stats;
	        engines[name.toString()] = {
	            libraries_count: unwrapedStats[1],
	            functions_count: unwrapedStats[3]
	        };
	    }
	    return engines;
	}
	
	return FUNCTION_STATS;
}

var HDEL = {};

var hasRequiredHDEL;

function requireHDEL () {
	if (hasRequiredHDEL) return HDEL;
	hasRequiredHDEL = 1;
	Object.defineProperty(HDEL, "__esModule", { value: true });
	HDEL.default = {
	    /**
	     * Removes one or more fields from a hash
	     * @param parser - The Redis command parser
	     * @param key - Key of the hash
	     * @param field - Field(s) to remove
	     */
	    parseCommand(parser, key, field) {
	        parser.push('HDEL');
	        parser.pushKey(key);
	        parser.pushVariadic(field);
	    },
	    transformReply: undefined
	};
	
	return HDEL;
}

var HELLO = {};

var hasRequiredHELLO;

function requireHELLO () {
	if (hasRequiredHELLO) return HELLO;
	hasRequiredHELLO = 1;
	Object.defineProperty(HELLO, "__esModule", { value: true });
	HELLO.default = {
	    /**
	     * Handshakes with the Redis server and switches to the specified protocol version
	     * @param parser - The Redis command parser
	     * @param protover - Protocol version to use
	     * @param options - Additional options for authentication and connection naming
	     */
	    parseCommand(parser, protover, options) {
	        parser.push('HELLO');
	        if (protover) {
	            parser.push(protover.toString());
	            if (options?.AUTH) {
	                parser.push('AUTH', options.AUTH.username, options.AUTH.password);
	            }
	            if (options?.SETNAME) {
	                parser.push('SETNAME', options.SETNAME);
	            }
	        }
	    },
	    transformReply: {
	        2: (reply) => ({
	            server: reply[1],
	            version: reply[3],
	            proto: reply[5],
	            id: reply[7],
	            mode: reply[9],
	            role: reply[11],
	            modules: reply[13]
	        }),
	        3: undefined
	    }
	};
	
	return HELLO;
}

var HEXISTS = {};

var hasRequiredHEXISTS;

function requireHEXISTS () {
	if (hasRequiredHEXISTS) return HEXISTS;
	hasRequiredHEXISTS = 1;
	Object.defineProperty(HEXISTS, "__esModule", { value: true });
	HEXISTS.default = {
	    CACHEABLE: true,
	    IS_READ_ONLY: true,
	    /**
	     * Determines whether a field exists in a hash
	     * @param parser - The Redis command parser
	     * @param key - Key of the hash
	     * @param field - Field to check
	     */
	    parseCommand(parser, key, field) {
	        parser.push('HEXISTS');
	        parser.pushKey(key);
	        parser.push(field);
	    },
	    transformReply: undefined
	};
	
	return HEXISTS;
}

var HEXPIRE = {};

var hasRequiredHEXPIRE;

function requireHEXPIRE () {
	if (hasRequiredHEXPIRE) return HEXPIRE;
	hasRequiredHEXPIRE = 1;
	Object.defineProperty(HEXPIRE, "__esModule", { value: true });
	HEXPIRE.HASH_EXPIRATION = void 0;
	HEXPIRE.HASH_EXPIRATION = {
	    /** The field does not exist */
	    FIELD_NOT_EXISTS: -2,
	    /** Specified NX | XX | GT | LT condition not met */
	    CONDITION_NOT_MET: 0,
	    /** Expiration time was set or updated */
	    UPDATED: 1,
	    /** Field deleted because the specified expiration time is in the past */
	    DELETED: 2
	};
	HEXPIRE.default = {
	    /**
	     * Sets a timeout on hash fields. After the timeout has expired, the fields will be automatically deleted
	     * @param parser - The Redis command parser
	     * @param key - Key of the hash
	     * @param fields - Fields to set expiration on
	     * @param seconds - Number of seconds until field expiration
	     * @param mode - Expiration mode: NX (only if field has no expiry), XX (only if field has existing expiry), GT (only if new expiry is greater than current), LT (only if new expiry is less than current)
	     */
	    parseCommand(parser, key, fields, seconds, mode) {
	        parser.push('HEXPIRE');
	        parser.pushKey(key);
	        parser.push(seconds.toString());
	        if (mode) {
	            parser.push(mode);
	        }
	        parser.push('FIELDS');
	        parser.pushVariadicWithLength(fields);
	    },
	    transformReply: undefined
	};
	
	return HEXPIRE;
}

var HEXPIREAT = {};

var hasRequiredHEXPIREAT;

function requireHEXPIREAT () {
	if (hasRequiredHEXPIREAT) return HEXPIREAT;
	hasRequiredHEXPIREAT = 1;
	Object.defineProperty(HEXPIREAT, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	HEXPIREAT.default = {
	    /**
	     * Sets the expiration for hash fields at a specific Unix timestamp
	     * @param parser - The Redis command parser
	     * @param key - Key of the hash
	     * @param fields - Fields to set expiration on
	     * @param timestamp - Unix timestamp (seconds since January 1, 1970) or Date object
	     * @param mode - Expiration mode: NX (only if field has no expiry), XX (only if field has existing expiry), GT (only if new expiry is greater than current), LT (only if new expiry is less than current)
	     */
	    parseCommand(parser, key, fields, timestamp, mode) {
	        parser.push('HEXPIREAT');
	        parser.pushKey(key);
	        parser.push((0, generic_transformers_1.transformEXAT)(timestamp));
	        if (mode) {
	            parser.push(mode);
	        }
	        parser.push('FIELDS');
	        parser.pushVariadicWithLength(fields);
	    },
	    transformReply: undefined
	};
	
	return HEXPIREAT;
}

var HEXPIRETIME = {};

var hasRequiredHEXPIRETIME;

function requireHEXPIRETIME () {
	if (hasRequiredHEXPIRETIME) return HEXPIRETIME;
	hasRequiredHEXPIRETIME = 1;
	Object.defineProperty(HEXPIRETIME, "__esModule", { value: true });
	HEXPIRETIME.HASH_EXPIRATION_TIME = void 0;
	HEXPIRETIME.HASH_EXPIRATION_TIME = {
	    /** The field does not exist */
	    FIELD_NOT_EXISTS: -2,
	    /** The field exists but has no associated expire */
	    NO_EXPIRATION: -1,
	};
	HEXPIRETIME.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Returns the absolute Unix timestamp (since January 1, 1970) at which the given hash fields will expire
	     * @param parser - The Redis command parser
	     * @param key - Key of the hash
	     * @param fields - Fields to check expiration time
	     */
	    parseCommand(parser, key, fields) {
	        parser.push('HEXPIRETIME');
	        parser.pushKey(key);
	        parser.push('FIELDS');
	        parser.pushVariadicWithLength(fields);
	    },
	    transformReply: undefined
	};
	
	return HEXPIRETIME;
}

var HGET = {};

var hasRequiredHGET;

function requireHGET () {
	if (hasRequiredHGET) return HGET;
	hasRequiredHGET = 1;
	Object.defineProperty(HGET, "__esModule", { value: true });
	HGET.default = {
	    CACHEABLE: true,
	    IS_READ_ONLY: true,
	    /**
	     * Gets the value of a field in a hash
	     * @param parser - The Redis command parser
	     * @param key - Key of the hash
	     * @param field - Field to get the value of
	     */
	    parseCommand(parser, key, field) {
	        parser.push('HGET');
	        parser.pushKey(key);
	        parser.push(field);
	    },
	    transformReply: undefined
	};
	
	return HGET;
}

var HGETALL = {};

var hasRequiredHGETALL;

function requireHGETALL () {
	if (hasRequiredHGETALL) return HGETALL;
	hasRequiredHGETALL = 1;
	Object.defineProperty(HGETALL, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	HGETALL.default = {
	    CACHEABLE: true,
	    IS_READ_ONLY: true,
	    /**
	     * Gets all fields and values in a hash
	     * @param parser - The Redis command parser
	     * @param key - Key of the hash
	     */
	    parseCommand(parser, key) {
	        parser.push('HGETALL');
	        parser.pushKey(key);
	    },
	    TRANSFORM_LEGACY_REPLY: true,
	    transformReply: {
	        2: (generic_transformers_1.transformTuplesReply),
	        3: undefined
	    }
	};
	
	return HGETALL;
}

var HGETDEL = {};

var hasRequiredHGETDEL;

function requireHGETDEL () {
	if (hasRequiredHGETDEL) return HGETDEL;
	hasRequiredHGETDEL = 1;
	Object.defineProperty(HGETDEL, "__esModule", { value: true });
	HGETDEL.default = {
	    /**
	     * Gets and deletes the specified fields from a hash
	     * @param parser - The Redis command parser
	     * @param key - Key of the hash
	     * @param fields - Fields to get and delete
	     */
	    parseCommand(parser, key, fields) {
	        parser.push('HGETDEL');
	        parser.pushKey(key);
	        parser.push('FIELDS');
	        parser.pushVariadicWithLength(fields);
	    },
	    transformReply: undefined
	};
	
	return HGETDEL;
}

var HGETEX = {};

var hasRequiredHGETEX;

function requireHGETEX () {
	if (hasRequiredHGETEX) return HGETEX;
	hasRequiredHGETEX = 1;
	Object.defineProperty(HGETEX, "__esModule", { value: true });
	HGETEX.default = {
	    /**
	     * Gets the values of the specified fields in a hash and optionally sets their expiration
	     * @param parser - The Redis command parser
	     * @param key - Key of the hash
	     * @param fields - Fields to get values from
	     * @param options - Options for setting expiration
	     */
	    parseCommand(parser, key, fields, options) {
	        parser.push('HGETEX');
	        parser.pushKey(key);
	        if (options?.expiration) {
	            if (typeof options.expiration === 'string') {
	                parser.push(options.expiration);
	            }
	            else if (options.expiration.type === 'PERSIST') {
	                parser.push('PERSIST');
	            }
	            else {
	                parser.push(options.expiration.type, options.expiration.value.toString());
	            }
	        }
	        parser.push('FIELDS');
	        parser.pushVariadicWithLength(fields);
	    },
	    transformReply: undefined
	};
	
	return HGETEX;
}

var HINCRBY = {};

var hasRequiredHINCRBY;

function requireHINCRBY () {
	if (hasRequiredHINCRBY) return HINCRBY;
	hasRequiredHINCRBY = 1;
	Object.defineProperty(HINCRBY, "__esModule", { value: true });
	HINCRBY.default = {
	    /**
	     * Increments the integer value of a field in a hash by the given number
	     * @param parser - The Redis command parser
	     * @param key - Key of the hash
	     * @param field - Field to increment
	     * @param increment - Increment amount
	     */
	    parseCommand(parser, key, field, increment) {
	        parser.push('HINCRBY');
	        parser.pushKey(key);
	        parser.push(field, increment.toString());
	    },
	    transformReply: undefined
	};
	
	return HINCRBY;
}

var HINCRBYFLOAT = {};

var hasRequiredHINCRBYFLOAT;

function requireHINCRBYFLOAT () {
	if (hasRequiredHINCRBYFLOAT) return HINCRBYFLOAT;
	hasRequiredHINCRBYFLOAT = 1;
	Object.defineProperty(HINCRBYFLOAT, "__esModule", { value: true });
	HINCRBYFLOAT.default = {
	    /**
	     * Increments the float value of a field in a hash by the given amount
	     * @param parser - The Redis command parser
	     * @param key - Key of the hash
	     * @param field - Field to increment
	     * @param increment - Increment amount (float)
	     */
	    parseCommand(parser, key, field, increment) {
	        parser.push('HINCRBYFLOAT');
	        parser.pushKey(key);
	        parser.push(field, increment.toString());
	    },
	    transformReply: undefined
	};
	
	return HINCRBYFLOAT;
}

var HKEYS = {};

var hasRequiredHKEYS;

function requireHKEYS () {
	if (hasRequiredHKEYS) return HKEYS;
	hasRequiredHKEYS = 1;
	Object.defineProperty(HKEYS, "__esModule", { value: true });
	HKEYS.default = {
	    CACHEABLE: true,
	    IS_READ_ONLY: true,
	    /**
	     * Gets all field names in a hash
	     * @param parser - The Redis command parser
	     * @param key - Key of the hash
	     */
	    parseCommand(parser, key) {
	        parser.push('HKEYS');
	        parser.pushKey(key);
	    },
	    transformReply: undefined
	};
	
	return HKEYS;
}

var HLEN = {};

var hasRequiredHLEN;

function requireHLEN () {
	if (hasRequiredHLEN) return HLEN;
	hasRequiredHLEN = 1;
	Object.defineProperty(HLEN, "__esModule", { value: true });
	HLEN.default = {
	    CACHEABLE: true,
	    IS_READ_ONLY: true,
	    /**
	     * Gets the number of fields in a hash.
	     * @param parser - The Redis command parser.
	     * @param key - Key of the hash.
	     */
	    parseCommand(parser, key) {
	        parser.push('HLEN');
	        parser.pushKey(key);
	    },
	    transformReply: undefined
	};
	
	return HLEN;
}

var HMGET = {};

var hasRequiredHMGET;

function requireHMGET () {
	if (hasRequiredHMGET) return HMGET;
	hasRequiredHMGET = 1;
	Object.defineProperty(HMGET, "__esModule", { value: true });
	HMGET.default = {
	    CACHEABLE: true,
	    IS_READ_ONLY: true,
	    /**
	     * Gets the values of all the specified fields in a hash.
	     * @param parser - The Redis command parser.
	     * @param key - Key of the hash.
	     * @param fields - Fields to get from the hash.
	     */
	    parseCommand(parser, key, fields) {
	        parser.push('HMGET');
	        parser.pushKey(key);
	        parser.pushVariadic(fields);
	    },
	    transformReply: undefined
	};
	
	return HMGET;
}

var HPERSIST = {};

var hasRequiredHPERSIST;

function requireHPERSIST () {
	if (hasRequiredHPERSIST) return HPERSIST;
	hasRequiredHPERSIST = 1;
	Object.defineProperty(HPERSIST, "__esModule", { value: true });
	HPERSIST.default = {
	    /**
	     * Removes the expiration from the specified fields in a hash.
	     * @param parser - The Redis command parser.
	     * @param key - Key of the hash.
	     * @param fields - Fields to remove expiration from.
	     */
	    parseCommand(parser, key, fields) {
	        parser.push('HPERSIST');
	        parser.pushKey(key);
	        parser.push('FIELDS');
	        parser.pushVariadicWithLength(fields);
	    },
	    transformReply: undefined
	};
	
	return HPERSIST;
}

var HPEXPIRE = {};

var hasRequiredHPEXPIRE;

function requireHPEXPIRE () {
	if (hasRequiredHPEXPIRE) return HPEXPIRE;
	hasRequiredHPEXPIRE = 1;
	Object.defineProperty(HPEXPIRE, "__esModule", { value: true });
	HPEXPIRE.default = {
	    /**
	     * Parses the arguments for the `HPEXPIRE` command.
	     *
	     * @param parser - The command parser instance.
	     * @param key - The key of the hash.
	     * @param fields - The fields to set the expiration for.
	     * @param ms - The expiration time in milliseconds.
	     * @param mode - Optional mode for the command ('NX', 'XX', 'GT', 'LT').
	     */
	    parseCommand(parser, key, fields, ms, mode) {
	        parser.push('HPEXPIRE');
	        parser.pushKey(key);
	        parser.push(ms.toString());
	        if (mode) {
	            parser.push(mode);
	        }
	        parser.push('FIELDS');
	        parser.pushVariadicWithLength(fields);
	    },
	    transformReply: undefined
	};
	
	return HPEXPIRE;
}

var HPEXPIREAT = {};

var hasRequiredHPEXPIREAT;

function requireHPEXPIREAT () {
	if (hasRequiredHPEXPIREAT) return HPEXPIREAT;
	hasRequiredHPEXPIREAT = 1;
	Object.defineProperty(HPEXPIREAT, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	HPEXPIREAT.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Parses the arguments for the `HPEXPIREAT` command.
	     *
	     * @param parser - The command parser instance.
	     * @param key - The key of the hash.
	     * @param fields - The fields to set the expiration for.
	     * @param timestamp - The expiration timestamp (Unix timestamp or Date object).
	     * @param mode - Optional mode for the command ('NX', 'XX', 'GT', 'LT').
	     */
	    parseCommand(parser, key, fields, timestamp, mode) {
	        parser.push('HPEXPIREAT');
	        parser.pushKey(key);
	        parser.push((0, generic_transformers_1.transformPXAT)(timestamp));
	        if (mode) {
	            parser.push(mode);
	        }
	        parser.push('FIELDS');
	        parser.pushVariadicWithLength(fields);
	    },
	    transformReply: undefined
	};
	
	return HPEXPIREAT;
}

var HPEXPIRETIME = {};

var hasRequiredHPEXPIRETIME;

function requireHPEXPIRETIME () {
	if (hasRequiredHPEXPIRETIME) return HPEXPIRETIME;
	hasRequiredHPEXPIRETIME = 1;
	Object.defineProperty(HPEXPIRETIME, "__esModule", { value: true });
	HPEXPIRETIME.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the HPEXPIRETIME command
	     *
	     * @param parser - The command parser
	     * @param key - The key to retrieve expiration time for
	     * @param fields - The fields to retrieve expiration time for
	     * @see https://redis.io/commands/hpexpiretime/
	     */
	    parseCommand(parser, key, fields) {
	        parser.push('HPEXPIRETIME');
	        parser.pushKey(key);
	        parser.push('FIELDS');
	        parser.pushVariadicWithLength(fields);
	    },
	    transformReply: undefined
	};
	
	return HPEXPIRETIME;
}

var HPTTL = {};

var hasRequiredHPTTL;

function requireHPTTL () {
	if (hasRequiredHPTTL) return HPTTL;
	hasRequiredHPTTL = 1;
	Object.defineProperty(HPTTL, "__esModule", { value: true });
	HPTTL.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the HPTTL command
	     *
	     * @param parser - The command parser
	     * @param key - The key to check time-to-live for
	     * @param fields - The fields to check time-to-live for
	     * @see https://redis.io/commands/hpttl/
	     */
	    parseCommand(parser, key, fields) {
	        parser.push('HPTTL');
	        parser.pushKey(key);
	        parser.push('FIELDS');
	        parser.pushVariadicWithLength(fields);
	    },
	    transformReply: undefined
	};
	
	return HPTTL;
}

var HRANDFIELD_COUNT_WITHVALUES = {};

var hasRequiredHRANDFIELD_COUNT_WITHVALUES;

function requireHRANDFIELD_COUNT_WITHVALUES () {
	if (hasRequiredHRANDFIELD_COUNT_WITHVALUES) return HRANDFIELD_COUNT_WITHVALUES;
	hasRequiredHRANDFIELD_COUNT_WITHVALUES = 1;
	Object.defineProperty(HRANDFIELD_COUNT_WITHVALUES, "__esModule", { value: true });
	HRANDFIELD_COUNT_WITHVALUES.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the HRANDFIELD command with count parameter and WITHVALUES option
	     *
	     * @param parser - The command parser
	     * @param key - The key of the hash to get random fields from
	     * @param count - The number of fields to return (positive: unique fields, negative: may repeat fields)
	     * @see https://redis.io/commands/hrandfield/
	     */
	    parseCommand(parser, key, count) {
	        parser.push('HRANDFIELD');
	        parser.pushKey(key);
	        parser.push(count.toString(), 'WITHVALUES');
	    },
	    transformReply: {
	        2: (rawReply) => {
	            const reply = [];
	            let i = 0;
	            while (i < rawReply.length) {
	                reply.push({
	                    field: rawReply[i++],
	                    value: rawReply[i++]
	                });
	            }
	            return reply;
	        },
	        3: (reply) => {
	            return reply.map(entry => {
	                const [field, value] = entry;
	                return {
	                    field,
	                    value
	                };
	            });
	        }
	    }
	};
	
	return HRANDFIELD_COUNT_WITHVALUES;
}

var HRANDFIELD_COUNT = {};

var hasRequiredHRANDFIELD_COUNT;

function requireHRANDFIELD_COUNT () {
	if (hasRequiredHRANDFIELD_COUNT) return HRANDFIELD_COUNT;
	hasRequiredHRANDFIELD_COUNT = 1;
	Object.defineProperty(HRANDFIELD_COUNT, "__esModule", { value: true });
	HRANDFIELD_COUNT.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the HRANDFIELD command with count parameter
	     *
	     * @param parser - The command parser
	     * @param key - The key of the hash to get random fields from
	     * @param count - The number of fields to return (positive: unique fields, negative: may repeat fields)
	     * @see https://redis.io/commands/hrandfield/
	     */
	    parseCommand(parser, key, count) {
	        parser.push('HRANDFIELD');
	        parser.pushKey(key);
	        parser.push(count.toString());
	    },
	    transformReply: undefined
	};
	
	return HRANDFIELD_COUNT;
}

var HRANDFIELD = {};

var hasRequiredHRANDFIELD;

function requireHRANDFIELD () {
	if (hasRequiredHRANDFIELD) return HRANDFIELD;
	hasRequiredHRANDFIELD = 1;
	Object.defineProperty(HRANDFIELD, "__esModule", { value: true });
	HRANDFIELD.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the HRANDFIELD command
	     *
	     * @param parser - The command parser
	     * @param key - The key of the hash to get a random field from
	     * @see https://redis.io/commands/hrandfield/
	     */
	    parseCommand(parser, key) {
	        parser.push('HRANDFIELD');
	        parser.pushKey(key);
	    },
	    transformReply: undefined
	};
	
	return HRANDFIELD;
}

var HSCAN = {};

var SCAN = {};

var hasRequiredSCAN;

function requireSCAN () {
	if (hasRequiredSCAN) return SCAN;
	hasRequiredSCAN = 1;
	Object.defineProperty(SCAN, "__esModule", { value: true });
	SCAN.pushScanArguments = SCAN.parseScanArguments = void 0;
	/**
	 * Parses scan arguments for SCAN-type commands
	 *
	 * @param parser - The command parser
	 * @param cursor - The cursor position for iteration
	 * @param options - Scan options
	 */
	function parseScanArguments(parser, cursor, options) {
	    parser.push(cursor);
	    if (options?.MATCH) {
	        parser.push('MATCH', options.MATCH);
	    }
	    if (options?.COUNT) {
	        parser.push('COUNT', options.COUNT.toString());
	    }
	}
	SCAN.parseScanArguments = parseScanArguments;
	/**
	 * Pushes scan arguments to the command arguments array
	 *
	 * @param args - The command arguments array
	 * @param cursor - The cursor position for iteration
	 * @param options - Scan options
	 * @returns The updated command arguments array
	 */
	function pushScanArguments(args, cursor, options) {
	    args.push(cursor.toString());
	    if (options?.MATCH) {
	        args.push('MATCH', options.MATCH);
	    }
	    if (options?.COUNT) {
	        args.push('COUNT', options.COUNT.toString());
	    }
	    return args;
	}
	SCAN.pushScanArguments = pushScanArguments;
	SCAN.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the SCAN command
	     *
	     * @param parser - The command parser
	     * @param cursor - The cursor position to start scanning from
	     * @param options - Scan options
	     * @see https://redis.io/commands/scan/
	     */
	    parseCommand(parser, cursor, options) {
	        parser.push('SCAN');
	        parseScanArguments(parser, cursor, options);
	        if (options?.TYPE) {
	            parser.push('TYPE', options.TYPE);
	        }
	        console.log('eeeeeeeeee', parser.redisArgs);
	    },
	    /**
	     * Transforms the SCAN reply into a structured object
	     *
	     * @param reply - The raw reply containing cursor and keys
	     * @returns Object with cursor and keys properties
	     */
	    transformReply([cursor, keys]) {
	        console.log(cursor, keys);
	        return {
	            cursor,
	            keys
	        };
	    }
	};
	
	return SCAN;
}

var hasRequiredHSCAN;

function requireHSCAN () {
	if (hasRequiredHSCAN) return HSCAN;
	hasRequiredHSCAN = 1;
	Object.defineProperty(HSCAN, "__esModule", { value: true });
	const SCAN_1 = requireSCAN();
	HSCAN.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the HSCAN command
	     *
	     * @param parser - The command parser
	     * @param key - The key of the hash to scan
	     * @param cursor - The cursor position to start scanning from
	     * @param options - Options for the scan (COUNT, MATCH, TYPE)
	     * @see https://redis.io/commands/hscan/
	     */
	    parseCommand(parser, key, cursor, options) {
	        parser.push('HSCAN');
	        parser.pushKey(key);
	        (0, SCAN_1.parseScanArguments)(parser, cursor, options);
	    },
	    transformReply([cursor, rawEntries]) {
	        const entries = [];
	        let i = 0;
	        while (i < rawEntries.length) {
	            entries.push({
	                field: rawEntries[i++],
	                value: rawEntries[i++]
	            });
	        }
	        return {
	            cursor,
	            entries
	        };
	    }
	};
	
	return HSCAN;
}

var HSCAN_NOVALUES = {};

var hasRequiredHSCAN_NOVALUES;

function requireHSCAN_NOVALUES () {
	if (hasRequiredHSCAN_NOVALUES) return HSCAN_NOVALUES;
	hasRequiredHSCAN_NOVALUES = 1;
	var __importDefault = (HSCAN_NOVALUES && HSCAN_NOVALUES.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(HSCAN_NOVALUES, "__esModule", { value: true });
	const HSCAN_1 = __importDefault(requireHSCAN());
	HSCAN_NOVALUES.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the HSCAN command with NOVALUES option
	     *
	     * @param args - The same parameters as HSCAN command
	     * @see https://redis.io/commands/hscan/
	     */
	    parseCommand(...args) {
	        const parser = args[0];
	        HSCAN_1.default.parseCommand(...args);
	        parser.push('NOVALUES');
	    },
	    transformReply([cursor, fields]) {
	        return {
	            cursor,
	            fields
	        };
	    }
	};
	
	return HSCAN_NOVALUES;
}

var HSET = {};

var hasRequiredHSET;

function requireHSET () {
	if (hasRequiredHSET) return HSET;
	hasRequiredHSET = 1;
	Object.defineProperty(HSET, "__esModule", { value: true });
	HSET.default = {
	    /**
	     * Constructs the HSET command
	     *
	     * @param parser - The command parser
	     * @param key - The key of the hash
	     * @param value - Either the field name (when using single field) or an object/map/array of field-value pairs
	     * @param fieldValue - The value to set (only used with single field variant)
	     * @see https://redis.io/commands/hset/
	     */
	    parseCommand(parser, ...[key, value, fieldValue]) {
	        parser.push('HSET');
	        parser.pushKey(key);
	        if (typeof value === 'string' || typeof value === 'number' || value instanceof Buffer) {
	            parser.push(convertValue(value), convertValue(fieldValue));
	        }
	        else if (value instanceof Map) {
	            pushMap(parser, value);
	        }
	        else if (Array.isArray(value)) {
	            pushTuples(parser, value);
	        }
	        else {
	            pushObject(parser, value);
	        }
	    },
	    transformReply: undefined
	};
	function pushMap(parser, map) {
	    for (const [key, value] of map.entries()) {
	        parser.push(convertValue(key), convertValue(value));
	    }
	}
	function pushTuples(parser, tuples) {
	    for (const tuple of tuples) {
	        if (Array.isArray(tuple)) {
	            pushTuples(parser, tuple);
	            continue;
	        }
	        parser.push(convertValue(tuple));
	    }
	}
	function pushObject(parser, object) {
	    for (const key of Object.keys(object)) {
	        parser.push(convertValue(key), convertValue(object[key]));
	    }
	}
	function convertValue(value) {
	    return typeof value === 'number' ?
	        value.toString() :
	        value;
	}
	
	return HSET;
}

var HSETEX = {};

var hasRequiredHSETEX;

function requireHSETEX () {
	if (hasRequiredHSETEX) return HSETEX;
	hasRequiredHSETEX = 1;
	Object.defineProperty(HSETEX, "__esModule", { value: true });
	const parser_1 = requireParser();
	HSETEX.default = {
	    /**
	     * Constructs the HSETEX command
	     *
	     * @param parser - The command parser
	     * @param key - The key of the hash
	     * @param fields - Object, Map, or Array of field-value pairs to set
	     * @param options - Optional configuration for expiration and mode settings
	     * @see https://redis.io/commands/hsetex/
	     */
	    parseCommand(parser, key, fields, options) {
	        parser.push('HSETEX');
	        parser.pushKey(key);
	        if (options?.mode) {
	            parser.push(options.mode);
	        }
	        if (options?.expiration) {
	            if (typeof options.expiration === 'string') {
	                parser.push(options.expiration);
	            }
	            else if (options.expiration.type === 'KEEPTTL') {
	                parser.push('KEEPTTL');
	            }
	            else {
	                parser.push(options.expiration.type, options.expiration.value.toString());
	            }
	        }
	        parser.push('FIELDS');
	        if (fields instanceof Map) {
	            pushMap(parser, fields);
	        }
	        else if (Array.isArray(fields)) {
	            pushTuples(parser, fields);
	        }
	        else {
	            pushObject(parser, fields);
	        }
	    },
	    transformReply: undefined
	};
	function pushMap(parser, map) {
	    parser.push(map.size.toString());
	    for (const [key, value] of map.entries()) {
	        parser.push(convertValue(key), convertValue(value));
	    }
	}
	function pushTuples(parser, tuples) {
	    const tmpParser = new parser_1.BasicCommandParser;
	    _pushTuples(tmpParser, tuples);
	    if (tmpParser.redisArgs.length % 2 != 0) {
	        throw Error('invalid number of arguments, expected key value ....[key value] pairs, got key without value');
	    }
	    parser.push((tmpParser.redisArgs.length / 2).toString());
	    parser.push(...tmpParser.redisArgs);
	}
	function _pushTuples(parser, tuples) {
	    for (const tuple of tuples) {
	        if (Array.isArray(tuple)) {
	            _pushTuples(parser, tuple);
	            continue;
	        }
	        parser.push(convertValue(tuple));
	    }
	}
	function pushObject(parser, object) {
	    const len = Object.keys(object).length;
	    if (len == 0) {
	        throw Error('object without keys');
	    }
	    parser.push(len.toString());
	    for (const key of Object.keys(object)) {
	        parser.push(convertValue(key), convertValue(object[key]));
	    }
	}
	function convertValue(value) {
	    return typeof value === 'number' ? value.toString() : value;
	}
	
	return HSETEX;
}

var HSETNX = {};

var hasRequiredHSETNX;

function requireHSETNX () {
	if (hasRequiredHSETNX) return HSETNX;
	hasRequiredHSETNX = 1;
	Object.defineProperty(HSETNX, "__esModule", { value: true });
	HSETNX.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the HSETNX command
	     *
	     * @param parser - The command parser
	     * @param key - The key of the hash
	     * @param field - The field to set if it does not exist
	     * @param value - The value to set
	     * @see https://redis.io/commands/hsetnx/
	     */
	    parseCommand(parser, key, field, value) {
	        parser.push('HSETNX');
	        parser.pushKey(key);
	        parser.push(field, value);
	    },
	    transformReply: undefined
	};
	
	return HSETNX;
}

var HSTRLEN = {};

var hasRequiredHSTRLEN;

function requireHSTRLEN () {
	if (hasRequiredHSTRLEN) return HSTRLEN;
	hasRequiredHSTRLEN = 1;
	Object.defineProperty(HSTRLEN, "__esModule", { value: true });
	HSTRLEN.default = {
	    CACHEABLE: true,
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the HSTRLEN command
	     *
	     * @param parser - The command parser
	     * @param key - The key of the hash
	     * @param field - The field to get the string length of
	     * @see https://redis.io/commands/hstrlen/
	     */
	    parseCommand(parser, key, field) {
	        parser.push('HSTRLEN');
	        parser.pushKey(key);
	        parser.push(field);
	    },
	    transformReply: undefined
	};
	
	return HSTRLEN;
}

var HTTL = {};

var hasRequiredHTTL;

function requireHTTL () {
	if (hasRequiredHTTL) return HTTL;
	hasRequiredHTTL = 1;
	Object.defineProperty(HTTL, "__esModule", { value: true });
	HTTL.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Returns the remaining time to live of field(s) in a hash.
	     * @param parser - The Redis command parser.
	     * @param key - Key of the hash.
	     * @param fields - Fields to check time to live.
	     */
	    parseCommand(parser, key, fields) {
	        parser.push('HTTL');
	        parser.pushKey(key);
	        parser.push('FIELDS');
	        parser.pushVariadicWithLength(fields);
	    },
	    transformReply: undefined
	};
	
	return HTTL;
}

var HVALS = {};

var hasRequiredHVALS;

function requireHVALS () {
	if (hasRequiredHVALS) return HVALS;
	hasRequiredHVALS = 1;
	Object.defineProperty(HVALS, "__esModule", { value: true });
	HVALS.default = {
	    CACHEABLE: true,
	    IS_READ_ONLY: true,
	    /**
	     * Gets all values in a hash.
	     * @param parser - The Redis command parser.
	     * @param key - Key of the hash.
	     */
	    parseCommand(parser, key) {
	        parser.push('HVALS');
	        parser.pushKey(key);
	    },
	    transformReply: undefined
	};
	
	return HVALS;
}

var INCR = {};

var hasRequiredINCR;

function requireINCR () {
	if (hasRequiredINCR) return INCR;
	hasRequiredINCR = 1;
	Object.defineProperty(INCR, "__esModule", { value: true });
	INCR.default = {
	    /**
	     * Constructs the INCR command
	     *
	     * @param parser - The command parser
	     * @param key - The key to increment
	     * @see https://redis.io/commands/incr/
	     */
	    parseCommand(parser, key) {
	        parser.push('INCR');
	        parser.pushKey(key);
	    },
	    transformReply: undefined
	};
	
	return INCR;
}

var INCRBY$3 = {};

var hasRequiredINCRBY$3;

function requireINCRBY$3 () {
	if (hasRequiredINCRBY$3) return INCRBY$3;
	hasRequiredINCRBY$3 = 1;
	Object.defineProperty(INCRBY$3, "__esModule", { value: true });
	INCRBY$3.default = {
	    /**
	     * Constructs the INCRBY command
	     *
	     * @param parser - The command parser
	     * @param key - The key to increment
	     * @param increment - The amount to increment by
	     * @see https://redis.io/commands/incrby/
	     */
	    parseCommand(parser, key, increment) {
	        parser.push('INCRBY');
	        parser.pushKey(key);
	        parser.push(increment.toString());
	    },
	    transformReply: undefined
	};
	
	return INCRBY$3;
}

var INCRBYFLOAT = {};

var hasRequiredINCRBYFLOAT;

function requireINCRBYFLOAT () {
	if (hasRequiredINCRBYFLOAT) return INCRBYFLOAT;
	hasRequiredINCRBYFLOAT = 1;
	Object.defineProperty(INCRBYFLOAT, "__esModule", { value: true });
	INCRBYFLOAT.default = {
	    /**
	     * Constructs the INCRBYFLOAT command
	     *
	     * @param parser - The command parser
	     * @param key - The key to increment
	     * @param increment - The floating-point value to increment by
	     * @see https://redis.io/commands/incrbyfloat/
	     */
	    parseCommand(parser, key, increment) {
	        parser.push('INCRBYFLOAT');
	        parser.pushKey(key);
	        parser.push(increment.toString());
	    },
	    transformReply: undefined
	};
	
	return INCRBYFLOAT;
}

var INFO$7 = {};

var hasRequiredINFO$7;

function requireINFO$7 () {
	if (hasRequiredINFO$7) return INFO$7;
	hasRequiredINFO$7 = 1;
	Object.defineProperty(INFO$7, "__esModule", { value: true });
	INFO$7.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the INFO command
	     *
	     * @param parser - The command parser
	     * @param section - Optional specific section of information to retrieve
	     * @see https://redis.io/commands/info/
	     */
	    parseCommand(parser, section) {
	        parser.push('INFO');
	        if (section) {
	            parser.push(section);
	        }
	    },
	    transformReply: undefined
	};
	
	return INFO$7;
}

var KEYS = {};

var hasRequiredKEYS;

function requireKEYS () {
	if (hasRequiredKEYS) return KEYS;
	hasRequiredKEYS = 1;
	Object.defineProperty(KEYS, "__esModule", { value: true });
	KEYS.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the KEYS command
	     *
	     * @param parser - The command parser
	     * @param pattern - The pattern to match keys against
	     * @see https://redis.io/commands/keys/
	     */
	    parseCommand(parser, pattern) {
	        parser.push('KEYS', pattern);
	    },
	    transformReply: undefined
	};
	
	return KEYS;
}

var LASTSAVE = {};

var hasRequiredLASTSAVE;

function requireLASTSAVE () {
	if (hasRequiredLASTSAVE) return LASTSAVE;
	hasRequiredLASTSAVE = 1;
	Object.defineProperty(LASTSAVE, "__esModule", { value: true });
	LASTSAVE.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the LASTSAVE command
	     *
	     * @param parser - The command parser
	     * @see https://redis.io/commands/lastsave/
	     */
	    parseCommand(parser) {
	        parser.push('LASTSAVE');
	    },
	    transformReply: undefined
	};
	
	return LASTSAVE;
}

var LATENCY_DOCTOR = {};

var hasRequiredLATENCY_DOCTOR;

function requireLATENCY_DOCTOR () {
	if (hasRequiredLATENCY_DOCTOR) return LATENCY_DOCTOR;
	hasRequiredLATENCY_DOCTOR = 1;
	Object.defineProperty(LATENCY_DOCTOR, "__esModule", { value: true });
	LATENCY_DOCTOR.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the LATENCY DOCTOR command
	     *
	     * @param parser - The command parser
	     * @see https://redis.io/commands/latency-doctor/
	     */
	    parseCommand(parser) {
	        parser.push('LATENCY', 'DOCTOR');
	    },
	    transformReply: undefined
	};
	
	return LATENCY_DOCTOR;
}

var LATENCY_GRAPH = {};

var hasRequiredLATENCY_GRAPH;

function requireLATENCY_GRAPH () {
	if (hasRequiredLATENCY_GRAPH) return LATENCY_GRAPH;
	hasRequiredLATENCY_GRAPH = 1;
	Object.defineProperty(LATENCY_GRAPH, "__esModule", { value: true });
	LATENCY_GRAPH.LATENCY_EVENTS = void 0;
	LATENCY_GRAPH.LATENCY_EVENTS = {
	    ACTIVE_DEFRAG_CYCLE: 'active-defrag-cycle',
	    AOF_FSYNC_ALWAYS: 'aof-fsync-always',
	    AOF_STAT: 'aof-stat',
	    AOF_REWRITE_DIFF_WRITE: 'aof-rewrite-diff-write',
	    AOF_RENAME: 'aof-rename',
	    AOF_WRITE: 'aof-write',
	    AOF_WRITE_ACTIVE_CHILD: 'aof-write-active-child',
	    AOF_WRITE_ALONE: 'aof-write-alone',
	    AOF_WRITE_PENDING_FSYNC: 'aof-write-pending-fsync',
	    COMMAND: 'command',
	    EXPIRE_CYCLE: 'expire-cycle',
	    EVICTION_CYCLE: 'eviction-cycle',
	    EVICTION_DEL: 'eviction-del',
	    FAST_COMMAND: 'fast-command',
	    FORK: 'fork',
	    RDB_UNLINK_TEMP_FILE: 'rdb-unlink-temp-file'
	};
	LATENCY_GRAPH.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the LATENCY GRAPH command
	     *
	     * @param parser - The command parser
	     * @param event - The latency event to get the graph for
	     * @see https://redis.io/commands/latency-graph/
	     */
	    parseCommand(parser, event) {
	        parser.push('LATENCY', 'GRAPH', event);
	    },
	    transformReply: undefined
	};
	
	return LATENCY_GRAPH;
}

var LATENCY_HISTORY = {};

var hasRequiredLATENCY_HISTORY;

function requireLATENCY_HISTORY () {
	if (hasRequiredLATENCY_HISTORY) return LATENCY_HISTORY;
	hasRequiredLATENCY_HISTORY = 1;
	Object.defineProperty(LATENCY_HISTORY, "__esModule", { value: true });
	LATENCY_HISTORY.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the LATENCY HISTORY command
	     *
	     * @param parser - The command parser
	     * @param event - The latency event to get the history for
	     * @see https://redis.io/commands/latency-history/
	     */
	    parseCommand(parser, event) {
	        parser.push('LATENCY', 'HISTORY', event);
	    },
	    transformReply: undefined
	};
	
	return LATENCY_HISTORY;
}

var LATENCY_LATEST = {};

var hasRequiredLATENCY_LATEST;

function requireLATENCY_LATEST () {
	if (hasRequiredLATENCY_LATEST) return LATENCY_LATEST;
	hasRequiredLATENCY_LATEST = 1;
	Object.defineProperty(LATENCY_LATEST, "__esModule", { value: true });
	LATENCY_LATEST.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the LATENCY LATEST command
	     *
	     * @param parser - The command parser
	     * @see https://redis.io/commands/latency-latest/
	     */
	    parseCommand(parser) {
	        parser.push('LATENCY', 'LATEST');
	    },
	    transformReply: undefined
	};
	
	return LATENCY_LATEST;
}

var LCS_IDX_WITHMATCHLEN = {};

var LCS_IDX = {};

var LCS = {};

var hasRequiredLCS;

function requireLCS () {
	if (hasRequiredLCS) return LCS;
	hasRequiredLCS = 1;
	Object.defineProperty(LCS, "__esModule", { value: true });
	LCS.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the LCS command (Longest Common Substring)
	     *
	     * @param parser - The command parser
	     * @param key1 - First key containing the first string
	     * @param key2 - Second key containing the second string
	     * @see https://redis.io/commands/lcs/
	     */
	    parseCommand(parser, key1, key2) {
	        parser.push('LCS');
	        parser.pushKeys([key1, key2]);
	    },
	    transformReply: undefined
	};
	
	return LCS;
}

var hasRequiredLCS_IDX;

function requireLCS_IDX () {
	if (hasRequiredLCS_IDX) return LCS_IDX;
	hasRequiredLCS_IDX = 1;
	var __importDefault = (LCS_IDX && LCS_IDX.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(LCS_IDX, "__esModule", { value: true });
	const LCS_1 = __importDefault(requireLCS());
	LCS_IDX.default = {
	    IS_READ_ONLY: LCS_1.default.IS_READ_ONLY,
	    /**
	     * Constructs the LCS command with IDX option
	     *
	     * @param parser - The command parser
	     * @param key1 - First key containing the first string
	     * @param key2 - Second key containing the second string
	     * @param options - Additional options for the LCS IDX command
	     * @see https://redis.io/commands/lcs/
	     */
	    parseCommand(parser, key1, key2, options) {
	        LCS_1.default.parseCommand(parser, key1, key2);
	        parser.push('IDX');
	        if (options?.MINMATCHLEN) {
	            parser.push('MINMATCHLEN', options.MINMATCHLEN.toString());
	        }
	    },
	    transformReply: {
	        2: (reply) => ({
	            matches: reply[1],
	            len: reply[3]
	        }),
	        3: undefined
	    }
	};
	
	return LCS_IDX;
}

var hasRequiredLCS_IDX_WITHMATCHLEN;

function requireLCS_IDX_WITHMATCHLEN () {
	if (hasRequiredLCS_IDX_WITHMATCHLEN) return LCS_IDX_WITHMATCHLEN;
	hasRequiredLCS_IDX_WITHMATCHLEN = 1;
	var __importDefault = (LCS_IDX_WITHMATCHLEN && LCS_IDX_WITHMATCHLEN.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(LCS_IDX_WITHMATCHLEN, "__esModule", { value: true });
	const LCS_IDX_1 = __importDefault(requireLCS_IDX());
	LCS_IDX_WITHMATCHLEN.default = {
	    IS_READ_ONLY: LCS_IDX_1.default.IS_READ_ONLY,
	    /**
	     * Constructs the LCS command with IDX and WITHMATCHLEN options
	     *
	     * @param args - The same parameters as LCS_IDX command
	     * @see https://redis.io/commands/lcs/
	     */
	    parseCommand(...args) {
	        const parser = args[0];
	        LCS_IDX_1.default.parseCommand(...args);
	        parser.push('WITHMATCHLEN');
	    },
	    transformReply: {
	        2: (reply) => ({
	            matches: reply[1],
	            len: reply[3]
	        }),
	        3: undefined
	    }
	};
	
	return LCS_IDX_WITHMATCHLEN;
}

var LCS_LEN = {};

var hasRequiredLCS_LEN;

function requireLCS_LEN () {
	if (hasRequiredLCS_LEN) return LCS_LEN;
	hasRequiredLCS_LEN = 1;
	var __importDefault = (LCS_LEN && LCS_LEN.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(LCS_LEN, "__esModule", { value: true });
	const LCS_1 = __importDefault(requireLCS());
	LCS_LEN.default = {
	    IS_READ_ONLY: LCS_1.default.IS_READ_ONLY,
	    /**
	     * Constructs the LCS command with LEN option
	     *
	     * @param args - The same parameters as LCS command
	     * @see https://redis.io/commands/lcs/
	     */
	    parseCommand(...args) {
	        const parser = args[0];
	        LCS_1.default.parseCommand(...args);
	        parser.push('LEN');
	    },
	    transformReply: undefined
	};
	
	return LCS_LEN;
}

var LINDEX = {};

var hasRequiredLINDEX;

function requireLINDEX () {
	if (hasRequiredLINDEX) return LINDEX;
	hasRequiredLINDEX = 1;
	Object.defineProperty(LINDEX, "__esModule", { value: true });
	LINDEX.default = {
	    CACHEABLE: true,
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the LINDEX command
	     *
	     * @param parser - The command parser
	     * @param key - The key of the list
	     * @param index - The index of the element to retrieve
	     * @see https://redis.io/commands/lindex/
	     */
	    parseCommand(parser, key, index) {
	        parser.push('LINDEX');
	        parser.pushKey(key);
	        parser.push(index.toString());
	    },
	    transformReply: undefined
	};
	
	return LINDEX;
}

var LINSERT = {};

var hasRequiredLINSERT;

function requireLINSERT () {
	if (hasRequiredLINSERT) return LINSERT;
	hasRequiredLINSERT = 1;
	Object.defineProperty(LINSERT, "__esModule", { value: true });
	LINSERT.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the LINSERT command
	     *
	     * @param parser - The command parser
	     * @param key - The key of the list
	     * @param position - The position where to insert (BEFORE or AFTER)
	     * @param pivot - The element to find in the list
	     * @param element - The element to insert
	     * @see https://redis.io/commands/linsert/
	     */
	    parseCommand(parser, key, position, pivot, element) {
	        parser.push('LINSERT');
	        parser.pushKey(key);
	        parser.push(position, pivot, element);
	    },
	    transformReply: undefined
	};
	
	return LINSERT;
}

var LLEN = {};

var hasRequiredLLEN;

function requireLLEN () {
	if (hasRequiredLLEN) return LLEN;
	hasRequiredLLEN = 1;
	Object.defineProperty(LLEN, "__esModule", { value: true });
	LLEN.default = {
	    CACHEABLE: true,
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the LLEN command
	     *
	     * @param parser - The command parser
	     * @param key - The key of the list to get the length of
	     * @see https://redis.io/commands/llen/
	     */
	    parseCommand(parser, key) {
	        parser.push('LLEN');
	        parser.pushKey(key);
	    },
	    transformReply: undefined
	};
	
	return LLEN;
}

var LMOVE = {};

var hasRequiredLMOVE;

function requireLMOVE () {
	if (hasRequiredLMOVE) return LMOVE;
	hasRequiredLMOVE = 1;
	Object.defineProperty(LMOVE, "__esModule", { value: true });
	LMOVE.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Constructs the LMOVE command
	     *
	     * @param parser - The command parser
	     * @param source - The source list key
	     * @param destination - The destination list key
	     * @param sourceSide - The side to pop from (LEFT or RIGHT)
	     * @param destinationSide - The side to push to (LEFT or RIGHT)
	     * @see https://redis.io/commands/lmove/
	     */
	    parseCommand(parser, source, destination, sourceSide, destinationSide) {
	        parser.push('LMOVE');
	        parser.pushKeys([source, destination]);
	        parser.push(sourceSide, destinationSide);
	    },
	    transformReply: undefined
	};
	
	return LMOVE;
}

var LOLWUT = {};

var hasRequiredLOLWUT;

function requireLOLWUT () {
	if (hasRequiredLOLWUT) return LOLWUT;
	hasRequiredLOLWUT = 1;
	Object.defineProperty(LOLWUT, "__esModule", { value: true });
	LOLWUT.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the LOLWUT command
	     *
	     * @param parser - The command parser
	     * @param version - Optional version parameter
	     * @param optionalArguments - Additional optional numeric arguments
	     * @see https://redis.io/commands/lolwut/
	     */
	    parseCommand(parser, version, ...optionalArguments) {
	        parser.push('LOLWUT');
	        if (version) {
	            parser.push('VERSION', version.toString());
	            parser.pushVariadic(optionalArguments.map(String));
	        }
	    },
	    transformReply: undefined
	};
	
	return LOLWUT;
}

var LPOP_COUNT = {};

var LPOP = {};

var hasRequiredLPOP;

function requireLPOP () {
	if (hasRequiredLPOP) return LPOP;
	hasRequiredLPOP = 1;
	Object.defineProperty(LPOP, "__esModule", { value: true });
	LPOP.default = {
	    /**
	     * Constructs the LPOP command
	     *
	     * @param parser - The command parser
	     * @param key - The key of the list to pop from
	     * @see https://redis.io/commands/lpop/
	     */
	    parseCommand(parser, key) {
	        parser.push('LPOP');
	        parser.pushKey(key);
	    },
	    transformReply: undefined
	};
	
	return LPOP;
}

var hasRequiredLPOP_COUNT;

function requireLPOP_COUNT () {
	if (hasRequiredLPOP_COUNT) return LPOP_COUNT;
	hasRequiredLPOP_COUNT = 1;
	var __importDefault = (LPOP_COUNT && LPOP_COUNT.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(LPOP_COUNT, "__esModule", { value: true });
	const LPOP_1 = __importDefault(requireLPOP());
	LPOP_COUNT.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Constructs the LPOP command with count parameter
	     *
	     * @param parser - The command parser
	     * @param key - The key of the list to pop from
	     * @param count - The number of elements to pop
	     * @see https://redis.io/commands/lpop/
	     */
	    parseCommand(parser, key, count) {
	        LPOP_1.default.parseCommand(parser, key);
	        parser.push(count.toString());
	    },
	    transformReply: undefined
	};
	
	return LPOP_COUNT;
}

var LPOS_COUNT = {};

var LPOS = {};

var hasRequiredLPOS;

function requireLPOS () {
	if (hasRequiredLPOS) return LPOS;
	hasRequiredLPOS = 1;
	Object.defineProperty(LPOS, "__esModule", { value: true });
	LPOS.default = {
	    CACHEABLE: true,
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the LPOS command
	     *
	     * @param parser - The command parser
	     * @param key - The key of the list
	     * @param element - The element to search for
	     * @param options - Optional parameters for RANK and MAXLEN
	     * @see https://redis.io/commands/lpos/
	     */
	    parseCommand(parser, key, element, options) {
	        parser.push('LPOS');
	        parser.pushKey(key);
	        parser.push(element);
	        if (options?.RANK !== undefined) {
	            parser.push('RANK', options.RANK.toString());
	        }
	        if (options?.MAXLEN !== undefined) {
	            parser.push('MAXLEN', options.MAXLEN.toString());
	        }
	    },
	    transformReply: undefined
	};
	
	return LPOS;
}

var hasRequiredLPOS_COUNT;

function requireLPOS_COUNT () {
	if (hasRequiredLPOS_COUNT) return LPOS_COUNT;
	hasRequiredLPOS_COUNT = 1;
	var __importDefault = (LPOS_COUNT && LPOS_COUNT.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(LPOS_COUNT, "__esModule", { value: true });
	const LPOS_1 = __importDefault(requireLPOS());
	LPOS_COUNT.default = {
	    CACHEABLE: LPOS_1.default.CACHEABLE,
	    IS_READ_ONLY: LPOS_1.default.IS_READ_ONLY,
	    /**
	     * Constructs the LPOS command with COUNT option
	     *
	     * @param parser - The command parser
	     * @param key - The key of the list
	     * @param element - The element to search for
	     * @param count - The number of positions to return
	     * @param options - Optional parameters for RANK and MAXLEN
	     * @see https://redis.io/commands/lpos/
	     */
	    parseCommand(parser, key, element, count, options) {
	        LPOS_1.default.parseCommand(parser, key, element, options);
	        parser.push('COUNT', count.toString());
	    },
	    transformReply: undefined
	};
	
	return LPOS_COUNT;
}

var LPUSH = {};

var hasRequiredLPUSH;

function requireLPUSH () {
	if (hasRequiredLPUSH) return LPUSH;
	hasRequiredLPUSH = 1;
	Object.defineProperty(LPUSH, "__esModule", { value: true });
	LPUSH.default = {
	    /**
	     * Constructs the LPUSH command
	     *
	     * @param parser - The command parser
	     * @param key - The key of the list
	     * @param elements - One or more elements to push to the list
	     * @see https://redis.io/commands/lpush/
	     */
	    parseCommand(parser, key, elements) {
	        parser.push('LPUSH');
	        parser.pushKey(key);
	        parser.pushVariadic(elements);
	    },
	    transformReply: undefined
	};
	
	return LPUSH;
}

var LPUSHX = {};

var hasRequiredLPUSHX;

function requireLPUSHX () {
	if (hasRequiredLPUSHX) return LPUSHX;
	hasRequiredLPUSHX = 1;
	Object.defineProperty(LPUSHX, "__esModule", { value: true });
	LPUSHX.default = {
	    /**
	     * Constructs the LPUSHX command
	     *
	     * @param parser - The command parser
	     * @param key - The key of the list
	     * @param elements - One or more elements to push to the list if it exists
	     * @see https://redis.io/commands/lpushx/
	     */
	    parseCommand(parser, key, elements) {
	        parser.push('LPUSHX');
	        parser.pushKey(key);
	        parser.pushVariadic(elements);
	    },
	    transformReply: undefined
	};
	
	return LPUSHX;
}

var LRANGE = {};

var hasRequiredLRANGE;

function requireLRANGE () {
	if (hasRequiredLRANGE) return LRANGE;
	hasRequiredLRANGE = 1;
	Object.defineProperty(LRANGE, "__esModule", { value: true });
	LRANGE.default = {
	    CACHEABLE: true,
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the LRANGE command
	     *
	     * @param parser - The command parser
	     * @param key - The key of the list
	     * @param start - The starting index
	     * @param stop - The ending index
	     * @see https://redis.io/commands/lrange/
	     */
	    parseCommand(parser, key, start, stop) {
	        parser.push('LRANGE');
	        parser.pushKey(key);
	        parser.push(start.toString(), stop.toString());
	    },
	    transformReply: undefined
	};
	
	return LRANGE;
}

var LREM = {};

var hasRequiredLREM;

function requireLREM () {
	if (hasRequiredLREM) return LREM;
	hasRequiredLREM = 1;
	Object.defineProperty(LREM, "__esModule", { value: true });
	LREM.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the LREM command
	     *
	     * @param parser - The command parser
	     * @param key - The key of the list
	     * @param count - The count of elements to remove (negative: from tail to head, 0: all occurrences, positive: from head to tail)
	     * @param element - The element to remove
	     * @see https://redis.io/commands/lrem/
	     */
	    parseCommand(parser, key, count, element) {
	        parser.push('LREM');
	        parser.pushKey(key);
	        parser.push(count.toString());
	        parser.push(element);
	    },
	    transformReply: undefined
	};
	
	return LREM;
}

var LSET = {};

var hasRequiredLSET;

function requireLSET () {
	if (hasRequiredLSET) return LSET;
	hasRequiredLSET = 1;
	Object.defineProperty(LSET, "__esModule", { value: true });
	LSET.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the LSET command
	     *
	     * @param parser - The command parser
	     * @param key - The key of the list
	     * @param index - The index of the element to replace
	     * @param element - The new value to set
	     * @see https://redis.io/commands/lset/
	     */
	    parseCommand(parser, key, index, element) {
	        parser.push('LSET');
	        parser.pushKey(key);
	        parser.push(index.toString(), element);
	    },
	    transformReply: undefined
	};
	
	return LSET;
}

var LTRIM = {};

var hasRequiredLTRIM;

function requireLTRIM () {
	if (hasRequiredLTRIM) return LTRIM;
	hasRequiredLTRIM = 1;
	Object.defineProperty(LTRIM, "__esModule", { value: true });
	LTRIM.default = {
	    /**
	     * Constructs the LTRIM command
	     *
	     * @param parser - The command parser
	     * @param key - The key of the list
	     * @param start - The starting index
	     * @param stop - The ending index
	     * @see https://redis.io/commands/ltrim/
	     */
	    parseCommand(parser, key, start, stop) {
	        parser.push('LTRIM');
	        parser.pushKey(key);
	        parser.push(start.toString(), stop.toString());
	    },
	    transformReply: undefined
	};
	
	return LTRIM;
}

var MEMORY_DOCTOR = {};

var hasRequiredMEMORY_DOCTOR;

function requireMEMORY_DOCTOR () {
	if (hasRequiredMEMORY_DOCTOR) return MEMORY_DOCTOR;
	hasRequiredMEMORY_DOCTOR = 1;
	Object.defineProperty(MEMORY_DOCTOR, "__esModule", { value: true });
	MEMORY_DOCTOR.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the MEMORY DOCTOR command
	     *
	     * @param parser - The command parser
	     * @see https://redis.io/commands/memory-doctor/
	     */
	    parseCommand(parser) {
	        parser.push('MEMORY', 'DOCTOR');
	    },
	    transformReply: undefined
	};
	
	return MEMORY_DOCTOR;
}

var MEMORY_MALLOCSTATS = {};

var hasRequiredMEMORY_MALLOCSTATS;

function requireMEMORY_MALLOCSTATS () {
	if (hasRequiredMEMORY_MALLOCSTATS) return MEMORY_MALLOCSTATS;
	hasRequiredMEMORY_MALLOCSTATS = 1;
	Object.defineProperty(MEMORY_MALLOCSTATS, "__esModule", { value: true });
	MEMORY_MALLOCSTATS.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the MEMORY MALLOC-STATS command
	     *
	     * @param parser - The command parser
	     * @see https://redis.io/commands/memory-malloc-stats/
	     */
	    parseCommand(parser) {
	        parser.push('MEMORY', 'MALLOC-STATS');
	    },
	    transformReply: undefined
	};
	
	return MEMORY_MALLOCSTATS;
}

var MEMORY_PURGE = {};

var hasRequiredMEMORY_PURGE;

function requireMEMORY_PURGE () {
	if (hasRequiredMEMORY_PURGE) return MEMORY_PURGE;
	hasRequiredMEMORY_PURGE = 1;
	Object.defineProperty(MEMORY_PURGE, "__esModule", { value: true });
	MEMORY_PURGE.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: false,
	    /**
	     * Constructs the MEMORY PURGE command
	     *
	     * @param parser - The command parser
	     * @see https://redis.io/commands/memory-purge/
	     */
	    parseCommand(parser) {
	        parser.push('MEMORY', 'PURGE');
	    },
	    transformReply: undefined
	};
	
	return MEMORY_PURGE;
}

var MEMORY_STATS = {};

var hasRequiredMEMORY_STATS;

function requireMEMORY_STATS () {
	if (hasRequiredMEMORY_STATS) return MEMORY_STATS;
	hasRequiredMEMORY_STATS = 1;
	Object.defineProperty(MEMORY_STATS, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	MEMORY_STATS.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the MEMORY STATS command
	     *
	     * @param parser - The command parser
	     * @see https://redis.io/commands/memory-stats/
	     */
	    parseCommand(parser) {
	        parser.push('MEMORY', 'STATS');
	    },
	    transformReply: {
	        2: (rawReply, preserve, typeMapping) => {
	            const reply = {};
	            let i = 0;
	            while (i < rawReply.length) {
	                switch (rawReply[i].toString()) {
	                    case 'dataset.percentage':
	                    case 'peak.percentage':
	                    case 'allocator-fragmentation.ratio':
	                    case 'allocator-rss.ratio':
	                    case 'rss-overhead.ratio':
	                    case 'fragmentation':
	                        reply[rawReply[i++]] = generic_transformers_1.transformDoubleReply[2](rawReply[i++], preserve, typeMapping);
	                        break;
	                    default:
	                        reply[rawReply[i++]] = rawReply[i++];
	                }
	            }
	            return reply;
	        },
	        3: undefined
	    }
	};
	
	return MEMORY_STATS;
}

var MEMORY_USAGE = {};

var hasRequiredMEMORY_USAGE;

function requireMEMORY_USAGE () {
	if (hasRequiredMEMORY_USAGE) return MEMORY_USAGE;
	hasRequiredMEMORY_USAGE = 1;
	Object.defineProperty(MEMORY_USAGE, "__esModule", { value: true });
	MEMORY_USAGE.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the MEMORY USAGE command
	     *
	     * @param parser - The command parser
	     * @param key - The key to get memory usage for
	     * @param options - Optional parameters including SAMPLES
	     * @see https://redis.io/commands/memory-usage/
	     */
	    parseCommand(parser, key, options) {
	        parser.push('MEMORY', 'USAGE');
	        parser.pushKey(key);
	        if (options?.SAMPLES) {
	            parser.push('SAMPLES', options.SAMPLES.toString());
	        }
	    },
	    transformReply: undefined
	};
	
	return MEMORY_USAGE;
}

var MGET$2 = {};

var hasRequiredMGET$2;

function requireMGET$2 () {
	if (hasRequiredMGET$2) return MGET$2;
	hasRequiredMGET$2 = 1;
	Object.defineProperty(MGET$2, "__esModule", { value: true });
	MGET$2.default = {
	    CACHEABLE: true,
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the MGET command
	     *
	     * @param parser - The command parser
	     * @param keys - Array of keys to get
	     * @see https://redis.io/commands/mget/
	     */
	    parseCommand(parser, keys) {
	        parser.push('MGET');
	        parser.pushKeys(keys);
	    },
	    transformReply: undefined
	};
	
	return MGET$2;
}

var MIGRATE = {};

var hasRequiredMIGRATE;

function requireMIGRATE () {
	if (hasRequiredMIGRATE) return MIGRATE;
	hasRequiredMIGRATE = 1;
	Object.defineProperty(MIGRATE, "__esModule", { value: true });
	MIGRATE.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Constructs the MIGRATE command
	     *
	     * @param parser - The command parser
	     * @param host - Target Redis instance host
	     * @param port - Target Redis instance port
	     * @param key - Key or keys to migrate
	     * @param destinationDb - Target database index
	     * @param timeout - Timeout in milliseconds
	     * @param options - Optional parameters including COPY, REPLACE, and AUTH
	     * @see https://redis.io/commands/migrate/
	     */
	    parseCommand(parser, host, port, key, destinationDb, timeout, options) {
	        parser.push('MIGRATE', host, port.toString());
	        const isKeyArray = Array.isArray(key);
	        if (isKeyArray) {
	            parser.push('');
	        }
	        else {
	            parser.push(key);
	        }
	        parser.push(destinationDb.toString(), timeout.toString());
	        if (options?.COPY) {
	            parser.push('COPY');
	        }
	        if (options?.REPLACE) {
	            parser.push('REPLACE');
	        }
	        if (options?.AUTH) {
	            if (options.AUTH.username) {
	                parser.push('AUTH2', options.AUTH.username, options.AUTH.password);
	            }
	            else {
	                parser.push('AUTH', options.AUTH.password);
	            }
	        }
	        if (isKeyArray) {
	            parser.push('KEYS');
	            parser.pushVariadic(key);
	        }
	    },
	    transformReply: undefined
	};
	
	return MIGRATE;
}

var MODULE_LIST = {};

var hasRequiredMODULE_LIST;

function requireMODULE_LIST () {
	if (hasRequiredMODULE_LIST) return MODULE_LIST;
	hasRequiredMODULE_LIST = 1;
	Object.defineProperty(MODULE_LIST, "__esModule", { value: true });
	MODULE_LIST.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the MODULE LIST command
	     *
	     * @param parser - The command parser
	     * @see https://redis.io/commands/module-list/
	     */
	    parseCommand(parser) {
	        parser.push('MODULE', 'LIST');
	    },
	    transformReply: {
	        2: (reply) => {
	            return reply.map(module => {
	                const unwrapped = module;
	                return {
	                    name: unwrapped[1],
	                    ver: unwrapped[3]
	                };
	            });
	        },
	        3: undefined
	    }
	};
	
	return MODULE_LIST;
}

var MODULE_LOAD = {};

var hasRequiredMODULE_LOAD;

function requireMODULE_LOAD () {
	if (hasRequiredMODULE_LOAD) return MODULE_LOAD;
	hasRequiredMODULE_LOAD = 1;
	Object.defineProperty(MODULE_LOAD, "__esModule", { value: true });
	MODULE_LOAD.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the MODULE LOAD command
	     *
	     * @param parser - The command parser
	     * @param path - Path to the module file
	     * @param moduleArguments - Optional arguments to pass to the module
	     * @see https://redis.io/commands/module-load/
	     */
	    parseCommand(parser, path, moduleArguments) {
	        parser.push('MODULE', 'LOAD', path);
	        if (moduleArguments) {
	            parser.push(...moduleArguments);
	        }
	    },
	    transformReply: undefined
	};
	
	return MODULE_LOAD;
}

var MODULE_UNLOAD = {};

var hasRequiredMODULE_UNLOAD;

function requireMODULE_UNLOAD () {
	if (hasRequiredMODULE_UNLOAD) return MODULE_UNLOAD;
	hasRequiredMODULE_UNLOAD = 1;
	Object.defineProperty(MODULE_UNLOAD, "__esModule", { value: true });
	MODULE_UNLOAD.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the MODULE UNLOAD command
	     *
	     * @param parser - The command parser
	     * @param name - The name of the module to unload
	     * @see https://redis.io/commands/module-unload/
	     */
	    parseCommand(parser, name) {
	        parser.push('MODULE', 'UNLOAD', name);
	    },
	    transformReply: undefined
	};
	
	return MODULE_UNLOAD;
}

var MOVE = {};

var hasRequiredMOVE;

function requireMOVE () {
	if (hasRequiredMOVE) return MOVE;
	hasRequiredMOVE = 1;
	Object.defineProperty(MOVE, "__esModule", { value: true });
	MOVE.default = {
	    /**
	     * Constructs the MOVE command
	     *
	     * @param parser - The command parser
	     * @param key - The key to move
	     * @param db - The destination database index
	     * @see https://redis.io/commands/move/
	     */
	    parseCommand(parser, key, db) {
	        parser.push('MOVE');
	        parser.pushKey(key);
	        parser.push(db.toString());
	    },
	    transformReply: undefined
	};
	
	return MOVE;
}

var MSET$1 = {};

var hasRequiredMSET$1;

function requireMSET$1 () {
	if (hasRequiredMSET$1) return MSET$1;
	hasRequiredMSET$1 = 1;
	Object.defineProperty(MSET$1, "__esModule", { value: true });
	MSET$1.parseMSetArguments = void 0;
	function parseMSetArguments(parser, toSet) {
	    if (Array.isArray(toSet)) {
	        if (toSet.length == 0) {
	            throw new Error("empty toSet Argument");
	        }
	        if (Array.isArray(toSet[0])) {
	            for (const tuple of toSet) {
	                parser.pushKey(tuple[0]);
	                parser.push(tuple[1]);
	            }
	        }
	        else {
	            const arr = toSet;
	            for (let i = 0; i < arr.length; i += 2) {
	                parser.pushKey(arr[i]);
	                parser.push(arr[i + 1]);
	            }
	        }
	    }
	    else {
	        for (const tuple of Object.entries(toSet)) {
	            parser.pushKey(tuple[0]);
	            parser.push(tuple[1]);
	        }
	    }
	}
	MSET$1.parseMSetArguments = parseMSetArguments;
	MSET$1.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the MSET command
	     *
	     * @param parser - The command parser
	     * @param toSet - Key-value pairs to set (array of tuples, flat array, or object)
	     * @see https://redis.io/commands/mset/
	     */
	    parseCommand(parser, toSet) {
	        parser.push('MSET');
	        return parseMSetArguments(parser, toSet);
	    },
	    transformReply: undefined
	};
	
	return MSET$1;
}

var MSETNX = {};

var hasRequiredMSETNX;

function requireMSETNX () {
	if (hasRequiredMSETNX) return MSETNX;
	hasRequiredMSETNX = 1;
	Object.defineProperty(MSETNX, "__esModule", { value: true });
	const MSET_1 = requireMSET$1();
	MSETNX.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the MSETNX command
	     *
	     * @param parser - The command parser
	     * @param toSet - Key-value pairs to set if none of the keys exist (array of tuples, flat array, or object)
	     * @see https://redis.io/commands/msetnx/
	     */
	    parseCommand(parser, toSet) {
	        parser.push('MSETNX');
	        return (0, MSET_1.parseMSetArguments)(parser, toSet);
	    },
	    transformReply: undefined
	};
	
	return MSETNX;
}

var OBJECT_ENCODING = {};

var hasRequiredOBJECT_ENCODING;

function requireOBJECT_ENCODING () {
	if (hasRequiredOBJECT_ENCODING) return OBJECT_ENCODING;
	hasRequiredOBJECT_ENCODING = 1;
	Object.defineProperty(OBJECT_ENCODING, "__esModule", { value: true });
	OBJECT_ENCODING.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the OBJECT ENCODING command
	     *
	     * @param parser - The command parser
	     * @param key - The key to get the internal encoding for
	     * @see https://redis.io/commands/object-encoding/
	     */
	    parseCommand(parser, key) {
	        parser.push('OBJECT', 'ENCODING');
	        parser.pushKey(key);
	    },
	    transformReply: undefined
	};
	
	return OBJECT_ENCODING;
}

var OBJECT_FREQ = {};

var hasRequiredOBJECT_FREQ;

function requireOBJECT_FREQ () {
	if (hasRequiredOBJECT_FREQ) return OBJECT_FREQ;
	hasRequiredOBJECT_FREQ = 1;
	Object.defineProperty(OBJECT_FREQ, "__esModule", { value: true });
	OBJECT_FREQ.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the OBJECT FREQ command
	     *
	     * @param parser - The command parser
	     * @param key - The key to get the access frequency for
	     * @see https://redis.io/commands/object-freq/
	     */
	    parseCommand(parser, key) {
	        parser.push('OBJECT', 'FREQ');
	        parser.pushKey(key);
	    },
	    transformReply: undefined
	};
	
	return OBJECT_FREQ;
}

var OBJECT_IDLETIME = {};

var hasRequiredOBJECT_IDLETIME;

function requireOBJECT_IDLETIME () {
	if (hasRequiredOBJECT_IDLETIME) return OBJECT_IDLETIME;
	hasRequiredOBJECT_IDLETIME = 1;
	Object.defineProperty(OBJECT_IDLETIME, "__esModule", { value: true });
	OBJECT_IDLETIME.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the OBJECT IDLETIME command
	     *
	     * @param parser - The command parser
	     * @param key - The key to get the idle time for
	     * @see https://redis.io/commands/object-idletime/
	     */
	    parseCommand(parser, key) {
	        parser.push('OBJECT', 'IDLETIME');
	        parser.pushKey(key);
	    },
	    transformReply: undefined
	};
	
	return OBJECT_IDLETIME;
}

var OBJECT_REFCOUNT = {};

var hasRequiredOBJECT_REFCOUNT;

function requireOBJECT_REFCOUNT () {
	if (hasRequiredOBJECT_REFCOUNT) return OBJECT_REFCOUNT;
	hasRequiredOBJECT_REFCOUNT = 1;
	Object.defineProperty(OBJECT_REFCOUNT, "__esModule", { value: true });
	OBJECT_REFCOUNT.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the OBJECT REFCOUNT command
	     *
	     * @param parser - The command parser
	     * @param key - The key to get the reference count for
	     * @see https://redis.io/commands/object-refcount/
	     */
	    parseCommand(parser, key) {
	        parser.push('OBJECT', 'REFCOUNT');
	        parser.pushKey(key);
	    },
	    transformReply: undefined
	};
	
	return OBJECT_REFCOUNT;
}

var PERSIST = {};

var hasRequiredPERSIST;

function requirePERSIST () {
	if (hasRequiredPERSIST) return PERSIST;
	hasRequiredPERSIST = 1;
	Object.defineProperty(PERSIST, "__esModule", { value: true });
	PERSIST.default = {
	    /**
	     * Constructs the PERSIST command
	     *
	     * @param parser - The command parser
	     * @param key - The key to remove the expiration from
	     * @see https://redis.io/commands/persist/
	     */
	    parseCommand(parser, key) {
	        parser.push('PERSIST');
	        parser.pushKey(key);
	    },
	    transformReply: undefined
	};
	
	return PERSIST;
}

var PEXPIRE = {};

var hasRequiredPEXPIRE;

function requirePEXPIRE () {
	if (hasRequiredPEXPIRE) return PEXPIRE;
	hasRequiredPEXPIRE = 1;
	Object.defineProperty(PEXPIRE, "__esModule", { value: true });
	PEXPIRE.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the PEXPIRE command
	     *
	     * @param parser - The command parser
	     * @param key - The key to set the expiration for
	     * @param ms - The expiration time in milliseconds
	     * @param mode - Optional mode for the command ('NX', 'XX', 'GT', 'LT')
	     * @see https://redis.io/commands/pexpire/
	     */
	    parseCommand(parser, key, ms, mode) {
	        parser.push('PEXPIRE');
	        parser.pushKey(key);
	        parser.push(ms.toString());
	        if (mode) {
	            parser.push(mode);
	        }
	    },
	    transformReply: undefined
	};
	
	return PEXPIRE;
}

var PEXPIREAT = {};

var hasRequiredPEXPIREAT;

function requirePEXPIREAT () {
	if (hasRequiredPEXPIREAT) return PEXPIREAT;
	hasRequiredPEXPIREAT = 1;
	Object.defineProperty(PEXPIREAT, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	PEXPIREAT.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the PEXPIREAT command
	     *
	     * @param parser - The command parser
	     * @param key - The key to set the expiration for
	     * @param msTimestamp - The expiration timestamp in milliseconds (Unix timestamp or Date object)
	     * @param mode - Optional mode for the command ('NX', 'XX', 'GT', 'LT')
	     * @see https://redis.io/commands/pexpireat/
	     */
	    parseCommand(parser, key, msTimestamp, mode) {
	        parser.push('PEXPIREAT');
	        parser.pushKey(key);
	        parser.push((0, generic_transformers_1.transformPXAT)(msTimestamp));
	        if (mode) {
	            parser.push(mode);
	        }
	    },
	    transformReply: undefined
	};
	
	return PEXPIREAT;
}

var PEXPIRETIME = {};

var hasRequiredPEXPIRETIME;

function requirePEXPIRETIME () {
	if (hasRequiredPEXPIRETIME) return PEXPIRETIME;
	hasRequiredPEXPIRETIME = 1;
	Object.defineProperty(PEXPIRETIME, "__esModule", { value: true });
	PEXPIRETIME.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the PEXPIRETIME command
	     *
	     * @param parser - The command parser
	     * @param key - The key to get the expiration time for in milliseconds
	     * @see https://redis.io/commands/pexpiretime/
	     */
	    parseCommand(parser, key) {
	        parser.push('PEXPIRETIME');
	        parser.pushKey(key);
	    },
	    transformReply: undefined
	};
	
	return PEXPIRETIME;
}

var PFADD = {};

var hasRequiredPFADD;

function requirePFADD () {
	if (hasRequiredPFADD) return PFADD;
	hasRequiredPFADD = 1;
	Object.defineProperty(PFADD, "__esModule", { value: true });
	PFADD.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the PFADD command
	     *
	     * @param parser - The command parser
	     * @param key - The key of the HyperLogLog
	     * @param element - Optional elements to add
	     * @see https://redis.io/commands/pfadd/
	     */
	    parseCommand(parser, key, element) {
	        parser.push('PFADD');
	        parser.pushKey(key);
	        if (element) {
	            parser.pushVariadic(element);
	        }
	    },
	    transformReply: undefined
	};
	
	return PFADD;
}

var PFCOUNT = {};

var hasRequiredPFCOUNT;

function requirePFCOUNT () {
	if (hasRequiredPFCOUNT) return PFCOUNT;
	hasRequiredPFCOUNT = 1;
	Object.defineProperty(PFCOUNT, "__esModule", { value: true });
	PFCOUNT.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the PFCOUNT command
	     *
	     * @param parser - The command parser
	     * @param keys - One or more keys of HyperLogLog structures to count
	     * @see https://redis.io/commands/pfcount/
	     */
	    parseCommand(parser, keys) {
	        parser.push('PFCOUNT');
	        parser.pushKeys(keys);
	    },
	    transformReply: undefined
	};
	
	return PFCOUNT;
}

var PFMERGE = {};

var hasRequiredPFMERGE;

function requirePFMERGE () {
	if (hasRequiredPFMERGE) return PFMERGE;
	hasRequiredPFMERGE = 1;
	Object.defineProperty(PFMERGE, "__esModule", { value: true });
	PFMERGE.default = {
	    /**
	     * Constructs the PFMERGE command
	     *
	     * @param parser - The command parser
	     * @param destination - The destination key to merge to
	     * @param sources - One or more source keys to merge from
	     * @see https://redis.io/commands/pfmerge/
	     */
	    parseCommand(parser, destination, sources) {
	        parser.push('PFMERGE');
	        parser.pushKey(destination);
	        if (sources) {
	            parser.pushKeys(sources);
	        }
	    },
	    transformReply: undefined
	};
	
	return PFMERGE;
}

var PING = {};

var hasRequiredPING;

function requirePING () {
	if (hasRequiredPING) return PING;
	hasRequiredPING = 1;
	Object.defineProperty(PING, "__esModule", { value: true });
	PING.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the PING command
	     *
	     * @param parser - The command parser
	     * @param message - Optional message to be returned instead of PONG
	     * @see https://redis.io/commands/ping/
	     */
	    parseCommand(parser, message) {
	        parser.push('PING');
	        if (message) {
	            parser.push(message);
	        }
	    },
	    transformReply: undefined
	};
	
	return PING;
}

var PSETEX = {};

var hasRequiredPSETEX;

function requirePSETEX () {
	if (hasRequiredPSETEX) return PSETEX;
	hasRequiredPSETEX = 1;
	Object.defineProperty(PSETEX, "__esModule", { value: true });
	PSETEX.default = {
	    /**
	     * Constructs the PSETEX command
	     *
	     * @param parser - The command parser
	     * @param key - The key to set
	     * @param ms - The expiration time in milliseconds
	     * @param value - The value to set
	     * @see https://redis.io/commands/psetex/
	     */
	    parseCommand(parser, key, ms, value) {
	        parser.push('PSETEX');
	        parser.pushKey(key);
	        parser.push(ms.toString(), value);
	    },
	    transformReply: undefined
	};
	
	return PSETEX;
}

var PTTL = {};

var hasRequiredPTTL;

function requirePTTL () {
	if (hasRequiredPTTL) return PTTL;
	hasRequiredPTTL = 1;
	Object.defineProperty(PTTL, "__esModule", { value: true });
	PTTL.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the PTTL command
	     *
	     * @param parser - The command parser
	     * @param key - The key to get the time to live in milliseconds
	     * @see https://redis.io/commands/pttl/
	     */
	    parseCommand(parser, key) {
	        parser.push('PTTL');
	        parser.pushKey(key);
	    },
	    transformReply: undefined
	};
	
	return PTTL;
}

var PUBLISH = {};

var hasRequiredPUBLISH;

function requirePUBLISH () {
	if (hasRequiredPUBLISH) return PUBLISH;
	hasRequiredPUBLISH = 1;
	Object.defineProperty(PUBLISH, "__esModule", { value: true });
	PUBLISH.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    IS_FORWARD_COMMAND: true,
	    /**
	     * Constructs the PUBLISH command
	     *
	     * @param parser - The command parser
	     * @param channel - The channel to publish to
	     * @param message - The message to publish
	     * @see https://redis.io/commands/publish/
	     */
	    parseCommand(parser, channel, message) {
	        parser.push('PUBLISH', channel, message);
	    },
	    transformReply: undefined
	};
	
	return PUBLISH;
}

var PUBSUB_CHANNELS = {};

var hasRequiredPUBSUB_CHANNELS;

function requirePUBSUB_CHANNELS () {
	if (hasRequiredPUBSUB_CHANNELS) return PUBSUB_CHANNELS;
	hasRequiredPUBSUB_CHANNELS = 1;
	Object.defineProperty(PUBSUB_CHANNELS, "__esModule", { value: true });
	PUBSUB_CHANNELS.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the PUBSUB CHANNELS command
	     *
	     * @param parser - The command parser
	     * @param pattern - Optional pattern to filter channels
	     * @see https://redis.io/commands/pubsub-channels/
	     */
	    parseCommand(parser, pattern) {
	        parser.push('PUBSUB', 'CHANNELS');
	        if (pattern) {
	            parser.push(pattern);
	        }
	    },
	    transformReply: undefined
	};
	
	return PUBSUB_CHANNELS;
}

var PUBSUB_NUMPAT = {};

var hasRequiredPUBSUB_NUMPAT;

function requirePUBSUB_NUMPAT () {
	if (hasRequiredPUBSUB_NUMPAT) return PUBSUB_NUMPAT;
	hasRequiredPUBSUB_NUMPAT = 1;
	Object.defineProperty(PUBSUB_NUMPAT, "__esModule", { value: true });
	PUBSUB_NUMPAT.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the PUBSUB NUMPAT command
	     *
	     * @param parser - The command parser
	     * @see https://redis.io/commands/pubsub-numpat/
	     */
	    parseCommand(parser) {
	        parser.push('PUBSUB', 'NUMPAT');
	    },
	    transformReply: undefined
	};
	
	return PUBSUB_NUMPAT;
}

var PUBSUB_NUMSUB = {};

var hasRequiredPUBSUB_NUMSUB;

function requirePUBSUB_NUMSUB () {
	if (hasRequiredPUBSUB_NUMSUB) return PUBSUB_NUMSUB;
	hasRequiredPUBSUB_NUMSUB = 1;
	Object.defineProperty(PUBSUB_NUMSUB, "__esModule", { value: true });
	PUBSUB_NUMSUB.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the PUBSUB NUMSUB command
	     *
	     * @param parser - The command parser
	     * @param channels - Optional channel names to get subscription count for
	     * @see https://redis.io/commands/pubsub-numsub/
	     */
	    parseCommand(parser, channels) {
	        parser.push('PUBSUB', 'NUMSUB');
	        if (channels) {
	            parser.pushVariadic(channels);
	        }
	    },
	    /**
	     * Transforms the PUBSUB NUMSUB reply into a record of channel name to subscriber count
	     *
	     * @param rawReply - The raw reply from Redis
	     * @returns Record mapping channel names to their subscriber counts
	     */
	    transformReply(rawReply) {
	        const reply = Object.create(null);
	        let i = 0;
	        while (i < rawReply.length) {
	            reply[rawReply[i++].toString()] = rawReply[i++].toString();
	        }
	        return reply;
	    }
	};
	
	return PUBSUB_NUMSUB;
}

var PUBSUB_SHARDNUMSUB = {};

var hasRequiredPUBSUB_SHARDNUMSUB;

function requirePUBSUB_SHARDNUMSUB () {
	if (hasRequiredPUBSUB_SHARDNUMSUB) return PUBSUB_SHARDNUMSUB;
	hasRequiredPUBSUB_SHARDNUMSUB = 1;
	Object.defineProperty(PUBSUB_SHARDNUMSUB, "__esModule", { value: true });
	PUBSUB_SHARDNUMSUB.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the PUBSUB SHARDNUMSUB command
	     *
	     * @param parser - The command parser
	     * @param channels - Optional shard channel names to get subscription count for
	     * @see https://redis.io/commands/pubsub-shardnumsub/
	     */
	    parseCommand(parser, channels) {
	        parser.push('PUBSUB', 'SHARDNUMSUB');
	        if (channels) {
	            parser.pushVariadic(channels);
	        }
	    },
	    /**
	     * Transforms the PUBSUB SHARDNUMSUB reply into a record of shard channel name to subscriber count
	     *
	     * @param reply - The raw reply from Redis
	     * @returns Record mapping shard channel names to their subscriber counts
	     */
	    transformReply(reply) {
	        const transformedReply = Object.create(null);
	        for (let i = 0; i < reply.length; i += 2) {
	            transformedReply[reply[i].toString()] = reply[i + 1];
	        }
	        return transformedReply;
	    }
	};
	
	return PUBSUB_SHARDNUMSUB;
}

var PUBSUB_SHARDCHANNELS = {};

var hasRequiredPUBSUB_SHARDCHANNELS;

function requirePUBSUB_SHARDCHANNELS () {
	if (hasRequiredPUBSUB_SHARDCHANNELS) return PUBSUB_SHARDCHANNELS;
	hasRequiredPUBSUB_SHARDCHANNELS = 1;
	Object.defineProperty(PUBSUB_SHARDCHANNELS, "__esModule", { value: true });
	PUBSUB_SHARDCHANNELS.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the PUBSUB SHARDCHANNELS command
	     *
	     * @param parser - The command parser
	     * @param pattern - Optional pattern to filter shard channels
	     * @see https://redis.io/commands/pubsub-shardchannels/
	     */
	    parseCommand(parser, pattern) {
	        parser.push('PUBSUB', 'SHARDCHANNELS');
	        if (pattern) {
	            parser.push(pattern);
	        }
	    },
	    transformReply: undefined
	};
	
	return PUBSUB_SHARDCHANNELS;
}

var RANDOMKEY = {};

var hasRequiredRANDOMKEY;

function requireRANDOMKEY () {
	if (hasRequiredRANDOMKEY) return RANDOMKEY;
	hasRequiredRANDOMKEY = 1;
	Object.defineProperty(RANDOMKEY, "__esModule", { value: true });
	RANDOMKEY.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the RANDOMKEY command
	     *
	     * @param parser - The command parser
	     * @see https://redis.io/commands/randomkey/
	     */
	    parseCommand(parser) {
	        parser.push('RANDOMKEY');
	    },
	    transformReply: undefined
	};
	
	return RANDOMKEY;
}

var READONLY = {};

var hasRequiredREADONLY;

function requireREADONLY () {
	if (hasRequiredREADONLY) return READONLY;
	hasRequiredREADONLY = 1;
	Object.defineProperty(READONLY, "__esModule", { value: true });
	READONLY.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the READONLY command
	     *
	     * @param parser - The command parser
	     * @see https://redis.io/commands/readonly/
	     */
	    parseCommand(parser) {
	        parser.push('READONLY');
	    },
	    transformReply: undefined
	};
	
	return READONLY;
}

var RENAME = {};

var hasRequiredRENAME;

function requireRENAME () {
	if (hasRequiredRENAME) return RENAME;
	hasRequiredRENAME = 1;
	Object.defineProperty(RENAME, "__esModule", { value: true });
	RENAME.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the RENAME command
	     *
	     * @param parser - The command parser
	     * @param key - The key to rename
	     * @param newKey - The new key name
	     * @see https://redis.io/commands/rename/
	     */
	    parseCommand(parser, key, newKey) {
	        parser.push('RENAME');
	        parser.pushKeys([key, newKey]);
	    },
	    transformReply: undefined
	};
	
	return RENAME;
}

var RENAMENX = {};

var hasRequiredRENAMENX;

function requireRENAMENX () {
	if (hasRequiredRENAMENX) return RENAMENX;
	hasRequiredRENAMENX = 1;
	Object.defineProperty(RENAMENX, "__esModule", { value: true });
	RENAMENX.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the RENAMENX command
	     *
	     * @param parser - The command parser
	     * @param key - The key to rename
	     * @param newKey - The new key name, if it doesn't exist
	     * @see https://redis.io/commands/renamenx/
	     */
	    parseCommand(parser, key, newKey) {
	        parser.push('RENAMENX');
	        parser.pushKeys([key, newKey]);
	    },
	    transformReply: undefined
	};
	
	return RENAMENX;
}

var REPLICAOF = {};

var hasRequiredREPLICAOF;

function requireREPLICAOF () {
	if (hasRequiredREPLICAOF) return REPLICAOF;
	hasRequiredREPLICAOF = 1;
	Object.defineProperty(REPLICAOF, "__esModule", { value: true });
	REPLICAOF.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the REPLICAOF command
	     *
	     * @param parser - The command parser
	     * @param host - The host of the master to replicate from
	     * @param port - The port of the master to replicate from
	     * @see https://redis.io/commands/replicaof/
	     */
	    parseCommand(parser, host, port) {
	        parser.push('REPLICAOF', host, port.toString());
	    },
	    transformReply: undefined
	};
	
	return REPLICAOF;
}

var RESTOREASKING = {};

var hasRequiredRESTOREASKING;

function requireRESTOREASKING () {
	if (hasRequiredRESTOREASKING) return RESTOREASKING;
	hasRequiredRESTOREASKING = 1;
	Object.defineProperty(RESTOREASKING, "__esModule", { value: true });
	RESTOREASKING.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the RESTORE-ASKING command
	     *
	     * @param parser - The command parser
	     * @see https://redis.io/commands/restore-asking/
	     */
	    parseCommand(parser) {
	        parser.push('RESTORE-ASKING');
	    },
	    transformReply: undefined
	};
	
	return RESTOREASKING;
}

var RESTORE = {};

var hasRequiredRESTORE;

function requireRESTORE () {
	if (hasRequiredRESTORE) return RESTORE;
	hasRequiredRESTORE = 1;
	Object.defineProperty(RESTORE, "__esModule", { value: true });
	RESTORE.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Constructs the RESTORE command
	     *
	     * @param parser - The command parser
	     * @param key - The key to restore
	     * @param ttl - Time to live in milliseconds, 0 for no expiry
	     * @param serializedValue - The serialized value from DUMP command
	     * @param options - Options for the RESTORE command
	     * @see https://redis.io/commands/restore/
	     */
	    parseCommand(parser, key, ttl, serializedValue, options) {
	        parser.push('RESTORE');
	        parser.pushKey(key);
	        parser.push(ttl.toString(), serializedValue);
	        if (options?.REPLACE) {
	            parser.push('REPLACE');
	        }
	        if (options?.ABSTTL) {
	            parser.push('ABSTTL');
	        }
	        if (options?.IDLETIME) {
	            parser.push('IDLETIME', options.IDLETIME.toString());
	        }
	        if (options?.FREQ) {
	            parser.push('FREQ', options.FREQ.toString());
	        }
	    },
	    transformReply: undefined
	};
	
	return RESTORE;
}

var ROLE = {};

var hasRequiredROLE;

function requireROLE () {
	if (hasRequiredROLE) return ROLE;
	hasRequiredROLE = 1;
	Object.defineProperty(ROLE, "__esModule", { value: true });
	ROLE.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the ROLE command
	     *
	     * @param parser - The command parser
	     * @see https://redis.io/commands/role/
	     */
	    parseCommand(parser) {
	        parser.push('ROLE');
	    },
	    /**
	     * Transforms the ROLE reply into a structured object
	     *
	     * @param reply - The raw reply from Redis
	     * @returns Structured object representing role information
	     */
	    transformReply(reply) {
	        switch (reply[0]) {
	            case 'master': {
	                const [role, replicationOffest, replicas] = reply;
	                return {
	                    role,
	                    replicationOffest,
	                    replicas: replicas.map(replica => {
	                        const [host, port, replicationOffest] = replica;
	                        return {
	                            host,
	                            port: Number(port),
	                            replicationOffest: Number(replicationOffest)
	                        };
	                    })
	                };
	            }
	            case 'slave': {
	                const [role, masterHost, masterPort, state, dataReceived] = reply;
	                return {
	                    role,
	                    master: {
	                        host: masterHost,
	                        port: masterPort
	                    },
	                    state,
	                    dataReceived,
	                };
	            }
	            case 'sentinel': {
	                const [role, masterNames] = reply;
	                return {
	                    role,
	                    masterNames
	                };
	            }
	        }
	    }
	};
	
	return ROLE;
}

var RPOP_COUNT = {};

var hasRequiredRPOP_COUNT;

function requireRPOP_COUNT () {
	if (hasRequiredRPOP_COUNT) return RPOP_COUNT;
	hasRequiredRPOP_COUNT = 1;
	Object.defineProperty(RPOP_COUNT, "__esModule", { value: true });
	RPOP_COUNT.default = {
	    /**
	     * Constructs the RPOP command with count parameter
	     *
	     * @param parser - The command parser
	     * @param key - The list key to pop from
	     * @param count - The number of elements to pop
	     * @see https://redis.io/commands/rpop/
	     */
	    parseCommand(parser, key, count) {
	        parser.push('RPOP');
	        parser.pushKey(key);
	        parser.push(count.toString());
	    },
	    transformReply: undefined
	};
	
	return RPOP_COUNT;
}

var RPOP = {};

var hasRequiredRPOP;

function requireRPOP () {
	if (hasRequiredRPOP) return RPOP;
	hasRequiredRPOP = 1;
	Object.defineProperty(RPOP, "__esModule", { value: true });
	RPOP.default = {
	    /**
	     * Constructs the RPOP command
	     *
	     * @param parser - The command parser
	     * @param key - The list key to pop from
	     * @see https://redis.io/commands/rpop/
	     */
	    parseCommand(parser, key) {
	        parser.push('RPOP');
	        parser.pushKey(key);
	    },
	    transformReply: undefined
	};
	
	return RPOP;
}

var RPOPLPUSH = {};

var hasRequiredRPOPLPUSH;

function requireRPOPLPUSH () {
	if (hasRequiredRPOPLPUSH) return RPOPLPUSH;
	hasRequiredRPOPLPUSH = 1;
	Object.defineProperty(RPOPLPUSH, "__esModule", { value: true });
	RPOPLPUSH.default = {
	    /**
	     * Constructs the RPOPLPUSH command
	     *
	     * @param parser - The command parser
	     * @param source - The source list key
	     * @param destination - The destination list key
	     * @see https://redis.io/commands/rpoplpush/
	     */
	    parseCommand(parser, source, destination) {
	        parser.push('RPOPLPUSH');
	        parser.pushKeys([source, destination]);
	    },
	    transformReply: undefined
	};
	
	return RPOPLPUSH;
}

var RPUSH = {};

var hasRequiredRPUSH;

function requireRPUSH () {
	if (hasRequiredRPUSH) return RPUSH;
	hasRequiredRPUSH = 1;
	Object.defineProperty(RPUSH, "__esModule", { value: true });
	RPUSH.default = {
	    /**
	     * Constructs the RPUSH command
	     *
	     * @param parser - The command parser
	     * @param key - The list key to push to
	     * @param element - One or more elements to push
	     * @see https://redis.io/commands/rpush/
	     */
	    parseCommand(parser, key, element) {
	        parser.push('RPUSH');
	        parser.pushKey(key);
	        parser.pushVariadic(element);
	    },
	    transformReply: undefined
	};
	
	return RPUSH;
}

var RPUSHX = {};

var hasRequiredRPUSHX;

function requireRPUSHX () {
	if (hasRequiredRPUSHX) return RPUSHX;
	hasRequiredRPUSHX = 1;
	Object.defineProperty(RPUSHX, "__esModule", { value: true });
	RPUSHX.default = {
	    /**
	     * Constructs the RPUSHX command
	     *
	     * @param parser - The command parser
	     * @param key - The list key to push to (only if it exists)
	     * @param element - One or more elements to push
	     * @see https://redis.io/commands/rpushx/
	     */
	    parseCommand(parser, key, element) {
	        parser.push('RPUSHX');
	        parser.pushKey(key);
	        parser.pushVariadic(element);
	    },
	    transformReply: undefined
	};
	
	return RPUSHX;
}

var SADD = {};

var hasRequiredSADD;

function requireSADD () {
	if (hasRequiredSADD) return SADD;
	hasRequiredSADD = 1;
	Object.defineProperty(SADD, "__esModule", { value: true });
	SADD.default = {
	    /**
	     * Constructs the SADD command
	     *
	     * @param parser - The command parser
	     * @param key - The set key to add members to
	     * @param members - One or more members to add to the set
	     * @see https://redis.io/commands/sadd/
	     */
	    parseCommand(parser, key, members) {
	        parser.push('SADD');
	        parser.pushKey(key);
	        parser.pushVariadic(members);
	    },
	    transformReply: undefined
	};
	
	return SADD;
}

var SCARD = {};

var hasRequiredSCARD;

function requireSCARD () {
	if (hasRequiredSCARD) return SCARD;
	hasRequiredSCARD = 1;
	Object.defineProperty(SCARD, "__esModule", { value: true });
	SCARD.default = {
	    CACHEABLE: true,
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the SCARD command
	     *
	     * @param parser - The command parser
	     * @param key - The set key to get the cardinality of
	     * @see https://redis.io/commands/scard/
	     */
	    parseCommand(parser, key) {
	        parser.push('SCARD');
	        parser.pushKey(key);
	    },
	    transformReply: undefined
	};
	
	return SCARD;
}

var SCRIPT_DEBUG = {};

var hasRequiredSCRIPT_DEBUG;

function requireSCRIPT_DEBUG () {
	if (hasRequiredSCRIPT_DEBUG) return SCRIPT_DEBUG;
	hasRequiredSCRIPT_DEBUG = 1;
	Object.defineProperty(SCRIPT_DEBUG, "__esModule", { value: true });
	SCRIPT_DEBUG.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the SCRIPT DEBUG command
	     *
	     * @param parser - The command parser
	     * @param mode - Debug mode: YES, SYNC, or NO
	     * @see https://redis.io/commands/script-debug/
	     */
	    parseCommand(parser, mode) {
	        parser.push('SCRIPT', 'DEBUG', mode);
	    },
	    transformReply: undefined
	};
	
	return SCRIPT_DEBUG;
}

var SCRIPT_EXISTS = {};

var hasRequiredSCRIPT_EXISTS;

function requireSCRIPT_EXISTS () {
	if (hasRequiredSCRIPT_EXISTS) return SCRIPT_EXISTS;
	hasRequiredSCRIPT_EXISTS = 1;
	Object.defineProperty(SCRIPT_EXISTS, "__esModule", { value: true });
	SCRIPT_EXISTS.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the SCRIPT EXISTS command
	     *
	     * @param parser - The command parser
	     * @param sha1 - One or more SHA1 digests of scripts
	     * @see https://redis.io/commands/script-exists/
	     */
	    parseCommand(parser, sha1) {
	        parser.push('SCRIPT', 'EXISTS');
	        parser.pushVariadic(sha1);
	    },
	    transformReply: undefined
	};
	
	return SCRIPT_EXISTS;
}

var SCRIPT_FLUSH = {};

var hasRequiredSCRIPT_FLUSH;

function requireSCRIPT_FLUSH () {
	if (hasRequiredSCRIPT_FLUSH) return SCRIPT_FLUSH;
	hasRequiredSCRIPT_FLUSH = 1;
	Object.defineProperty(SCRIPT_FLUSH, "__esModule", { value: true });
	SCRIPT_FLUSH.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the SCRIPT FLUSH command
	     *
	     * @param parser - The command parser
	     * @param mode - Optional flush mode: ASYNC or SYNC
	     * @see https://redis.io/commands/script-flush/
	     */
	    parseCommand(parser, mode) {
	        parser.push('SCRIPT', 'FLUSH');
	        if (mode) {
	            parser.push(mode);
	        }
	    },
	    transformReply: undefined
	};
	
	return SCRIPT_FLUSH;
}

var SCRIPT_KILL = {};

var hasRequiredSCRIPT_KILL;

function requireSCRIPT_KILL () {
	if (hasRequiredSCRIPT_KILL) return SCRIPT_KILL;
	hasRequiredSCRIPT_KILL = 1;
	Object.defineProperty(SCRIPT_KILL, "__esModule", { value: true });
	SCRIPT_KILL.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the SCRIPT KILL command
	     *
	     * @param parser - The command parser
	     * @see https://redis.io/commands/script-kill/
	     */
	    parseCommand(parser) {
	        parser.push('SCRIPT', 'KILL');
	    },
	    transformReply: undefined
	};
	
	return SCRIPT_KILL;
}

var SCRIPT_LOAD = {};

var hasRequiredSCRIPT_LOAD;

function requireSCRIPT_LOAD () {
	if (hasRequiredSCRIPT_LOAD) return SCRIPT_LOAD;
	hasRequiredSCRIPT_LOAD = 1;
	Object.defineProperty(SCRIPT_LOAD, "__esModule", { value: true });
	SCRIPT_LOAD.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the SCRIPT LOAD command
	     *
	     * @param parser - The command parser
	     * @param script - The Lua script to load
	     * @see https://redis.io/commands/script-load/
	     */
	    parseCommand(parser, script) {
	        parser.push('SCRIPT', 'LOAD', script);
	    },
	    transformReply: undefined
	};
	
	return SCRIPT_LOAD;
}

var SDIFF = {};

var hasRequiredSDIFF;

function requireSDIFF () {
	if (hasRequiredSDIFF) return SDIFF;
	hasRequiredSDIFF = 1;
	Object.defineProperty(SDIFF, "__esModule", { value: true });
	SDIFF.default = {
	    CACHEABLE: true,
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the SDIFF command
	     *
	     * @param parser - The command parser
	     * @param keys - One or more set keys to compute the difference from
	     * @see https://redis.io/commands/sdiff/
	     */
	    parseCommand(parser, keys) {
	        parser.push('SDIFF');
	        parser.pushKeys(keys);
	    },
	    transformReply: undefined
	};
	
	return SDIFF;
}

var SDIFFSTORE = {};

var hasRequiredSDIFFSTORE;

function requireSDIFFSTORE () {
	if (hasRequiredSDIFFSTORE) return SDIFFSTORE;
	hasRequiredSDIFFSTORE = 1;
	Object.defineProperty(SDIFFSTORE, "__esModule", { value: true });
	SDIFFSTORE.default = {
	    /**
	     * Constructs the SDIFFSTORE command
	     *
	     * @param parser - The command parser
	     * @param destination - The destination key to store the result
	     * @param keys - One or more set keys to compute the difference from
	     * @see https://redis.io/commands/sdiffstore/
	     */
	    parseCommand(parser, destination, keys) {
	        parser.push('SDIFFSTORE');
	        parser.pushKey(destination);
	        parser.pushKeys(keys);
	    },
	    transformReply: undefined
	};
	
	return SDIFFSTORE;
}

var SET$1 = {};

var hasRequiredSET$1;

function requireSET$1 () {
	if (hasRequiredSET$1) return SET$1;
	hasRequiredSET$1 = 1;
	Object.defineProperty(SET$1, "__esModule", { value: true });
	SET$1.default = {
	    /**
	     * Constructs the SET command
	     *
	     * @param parser - The command parser
	     * @param key - The key to set
	     * @param value - The value to set
	     * @param options - Additional options for the SET command
	     * @see https://redis.io/commands/set/
	     */
	    parseCommand(parser, key, value, options) {
	        parser.push('SET');
	        parser.pushKey(key);
	        parser.push(typeof value === 'number' ? value.toString() : value);
	        if (options?.expiration) {
	            if (typeof options.expiration === 'string') {
	                parser.push(options.expiration);
	            }
	            else if (options.expiration.type === 'KEEPTTL') {
	                parser.push('KEEPTTL');
	            }
	            else {
	                parser.push(options.expiration.type, options.expiration.value.toString());
	            }
	        }
	        else if (options?.EX !== undefined) {
	            parser.push('EX', options.EX.toString());
	        }
	        else if (options?.PX !== undefined) {
	            parser.push('PX', options.PX.toString());
	        }
	        else if (options?.EXAT !== undefined) {
	            parser.push('EXAT', options.EXAT.toString());
	        }
	        else if (options?.PXAT !== undefined) {
	            parser.push('PXAT', options.PXAT.toString());
	        }
	        else if (options?.KEEPTTL) {
	            parser.push('KEEPTTL');
	        }
	        if (options?.condition) {
	            parser.push(options.condition);
	        }
	        else if (options?.NX) {
	            parser.push('NX');
	        }
	        else if (options?.XX) {
	            parser.push('XX');
	        }
	        if (options?.GET) {
	            parser.push('GET');
	        }
	    },
	    transformReply: undefined
	};
	
	return SET$1;
}

var SETBIT = {};

var hasRequiredSETBIT;

function requireSETBIT () {
	if (hasRequiredSETBIT) return SETBIT;
	hasRequiredSETBIT = 1;
	Object.defineProperty(SETBIT, "__esModule", { value: true });
	SETBIT.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Constructs the SETBIT command
	     *
	     * @param parser - The command parser
	     * @param key - The key to set the bit on
	     * @param offset - The bit offset (zero-based)
	     * @param value - The bit value (0 or 1)
	     * @see https://redis.io/commands/setbit/
	     */
	    parseCommand(parser, key, offset, value) {
	        parser.push('SETBIT');
	        parser.pushKey(key);
	        parser.push(offset.toString(), value.toString());
	    },
	    transformReply: undefined
	};
	
	return SETBIT;
}

var SETEX = {};

var hasRequiredSETEX;

function requireSETEX () {
	if (hasRequiredSETEX) return SETEX;
	hasRequiredSETEX = 1;
	Object.defineProperty(SETEX, "__esModule", { value: true });
	SETEX.default = {
	    /**
	     * Constructs the SETEX command
	     *
	     * @param parser - The command parser
	     * @param key - The key to set
	     * @param seconds - The expiration time in seconds
	     * @param value - The value to set
	     * @see https://redis.io/commands/setex/
	     */
	    parseCommand(parser, key, seconds, value) {
	        parser.push('SETEX');
	        parser.pushKey(key);
	        parser.push(seconds.toString(), value);
	    },
	    transformReply: undefined
	};
	
	return SETEX;
}

var SETNX = {};

var hasRequiredSETNX;

function requireSETNX () {
	if (hasRequiredSETNX) return SETNX;
	hasRequiredSETNX = 1;
	Object.defineProperty(SETNX, "__esModule", { value: true });
	SETNX.default = {
	    /**
	     * Constructs the SETNX command
	     *
	     * @param parser - The command parser
	     * @param key - The key to set if it doesn't exist
	     * @param value - The value to set
	     * @see https://redis.io/commands/setnx/
	     */
	    parseCommand(parser, key, value) {
	        parser.push('SETNX');
	        parser.pushKey(key);
	        parser.push(value);
	    },
	    transformReply: undefined
	};
	
	return SETNX;
}

var SETRANGE = {};

var hasRequiredSETRANGE;

function requireSETRANGE () {
	if (hasRequiredSETRANGE) return SETRANGE;
	hasRequiredSETRANGE = 1;
	Object.defineProperty(SETRANGE, "__esModule", { value: true });
	SETRANGE.default = {
	    /**
	     * Constructs the SETRANGE command
	     *
	     * @param parser - The command parser
	     * @param key - The key to modify
	     * @param offset - The offset at which to start writing
	     * @param value - The value to write at the offset
	     * @see https://redis.io/commands/setrange/
	     */
	    parseCommand(parser, key, offset, value) {
	        parser.push('SETRANGE');
	        parser.pushKey(key);
	        parser.push(offset.toString(), value);
	    },
	    transformReply: undefined
	};
	
	return SETRANGE;
}

var SINTER = {};

var hasRequiredSINTER;

function requireSINTER () {
	if (hasRequiredSINTER) return SINTER;
	hasRequiredSINTER = 1;
	Object.defineProperty(SINTER, "__esModule", { value: true });
	SINTER.default = {
	    CACHEABLE: true,
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the SINTER command
	     *
	     * @param parser - The command parser
	     * @param keys - One or more set keys to compute the intersection from
	     * @see https://redis.io/commands/sinter/
	     */
	    parseCommand(parser, keys) {
	        parser.push('SINTER');
	        parser.pushKeys(keys);
	    },
	    transformReply: undefined
	};
	
	return SINTER;
}

var SINTERCARD = {};

var hasRequiredSINTERCARD;

function requireSINTERCARD () {
	if (hasRequiredSINTERCARD) return SINTERCARD;
	hasRequiredSINTERCARD = 1;
	Object.defineProperty(SINTERCARD, "__esModule", { value: true });
	SINTERCARD.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the SINTERCARD command
	     *
	     * @param parser - The command parser
	     * @param keys - One or more set keys to compute the intersection cardinality from
	     * @param options - Options for the SINTERCARD command or a number for LIMIT (backwards compatibility)
	     * @see https://redis.io/commands/sintercard/
	     */
	    parseCommand(parser, keys, options) {
	        parser.push('SINTERCARD');
	        parser.pushKeysLength(keys);
	        if (typeof options === 'number') { // backwards compatibility
	            parser.push('LIMIT', options.toString());
	        }
	        else if (options?.LIMIT !== undefined) {
	            parser.push('LIMIT', options.LIMIT.toString());
	        }
	    },
	    transformReply: undefined
	};
	
	return SINTERCARD;
}

var SINTERSTORE = {};

var hasRequiredSINTERSTORE;

function requireSINTERSTORE () {
	if (hasRequiredSINTERSTORE) return SINTERSTORE;
	hasRequiredSINTERSTORE = 1;
	Object.defineProperty(SINTERSTORE, "__esModule", { value: true });
	SINTERSTORE.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Constructs the SINTERSTORE command
	     *
	     * @param parser - The command parser
	     * @param destination - The destination key to store the result
	     * @param keys - One or more set keys to compute the intersection from
	     * @see https://redis.io/commands/sinterstore/
	     */
	    parseCommand(parser, destination, keys) {
	        parser.push('SINTERSTORE');
	        parser.pushKey(destination);
	        parser.pushKeys(keys);
	    },
	    transformReply: undefined
	};
	
	return SINTERSTORE;
}

var SISMEMBER = {};

var hasRequiredSISMEMBER;

function requireSISMEMBER () {
	if (hasRequiredSISMEMBER) return SISMEMBER;
	hasRequiredSISMEMBER = 1;
	Object.defineProperty(SISMEMBER, "__esModule", { value: true });
	SISMEMBER.default = {
	    CACHEABLE: true,
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the SISMEMBER command
	     *
	     * @param parser - The command parser
	     * @param key - The set key to check membership in
	     * @param member - The member to check for existence
	     * @see https://redis.io/commands/sismember/
	     */
	    parseCommand(parser, key, member) {
	        parser.push('SISMEMBER');
	        parser.pushKey(key);
	        parser.push(member);
	    },
	    transformReply: undefined
	};
	
	return SISMEMBER;
}

var SMEMBERS = {};

var hasRequiredSMEMBERS;

function requireSMEMBERS () {
	if (hasRequiredSMEMBERS) return SMEMBERS;
	hasRequiredSMEMBERS = 1;
	Object.defineProperty(SMEMBERS, "__esModule", { value: true });
	SMEMBERS.default = {
	    CACHEABLE: true,
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the SMEMBERS command
	     *
	     * @param parser - The command parser
	     * @param key - The set key to get all members from
	     * @see https://redis.io/commands/smembers/
	     */
	    parseCommand(parser, key) {
	        parser.push('SMEMBERS');
	        parser.pushKey(key);
	    },
	    transformReply: {
	        2: undefined,
	        3: undefined
	    }
	};
	
	return SMEMBERS;
}

var SMISMEMBER = {};

var hasRequiredSMISMEMBER;

function requireSMISMEMBER () {
	if (hasRequiredSMISMEMBER) return SMISMEMBER;
	hasRequiredSMISMEMBER = 1;
	Object.defineProperty(SMISMEMBER, "__esModule", { value: true });
	SMISMEMBER.default = {
	    CACHEABLE: true,
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the SMISMEMBER command
	     *
	     * @param parser - The command parser
	     * @param key - The set key to check membership in
	     * @param members - The members to check for existence
	     * @see https://redis.io/commands/smismember/
	     */
	    parseCommand(parser, key, members) {
	        parser.push('SMISMEMBER');
	        parser.pushKey(key);
	        parser.pushVariadic(members);
	    },
	    transformReply: undefined
	};
	
	return SMISMEMBER;
}

var SMOVE = {};

var hasRequiredSMOVE;

function requireSMOVE () {
	if (hasRequiredSMOVE) return SMOVE;
	hasRequiredSMOVE = 1;
	Object.defineProperty(SMOVE, "__esModule", { value: true });
	SMOVE.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Constructs the SMOVE command
	     *
	     * @param parser - The command parser
	     * @param source - The source set key
	     * @param destination - The destination set key
	     * @param member - The member to move
	     * @see https://redis.io/commands/smove/
	     */
	    parseCommand(parser, source, destination, member) {
	        parser.push('SMOVE');
	        parser.pushKeys([source, destination]);
	        parser.push(member);
	    },
	    transformReply: undefined
	};
	
	return SMOVE;
}

var SORT_RO = {};

var SORT = {};

var hasRequiredSORT;

function requireSORT () {
	if (hasRequiredSORT) return SORT;
	hasRequiredSORT = 1;
	Object.defineProperty(SORT, "__esModule", { value: true });
	SORT.parseSortArguments = void 0;
	/**
	 * Parses sort arguments for the SORT command
	 *
	 * @param parser - The command parser
	 * @param key - The key to sort
	 * @param options - Sort options
	 */
	function parseSortArguments(parser, key, options) {
	    parser.pushKey(key);
	    if (options?.BY) {
	        parser.push('BY', options.BY);
	    }
	    if (options?.LIMIT) {
	        parser.push('LIMIT', options.LIMIT.offset.toString(), options.LIMIT.count.toString());
	    }
	    if (options?.GET) {
	        if (Array.isArray(options.GET)) {
	            for (const pattern of options.GET) {
	                parser.push('GET', pattern);
	            }
	        }
	        else {
	            parser.push('GET', options.GET);
	        }
	    }
	    if (options?.DIRECTION) {
	        parser.push(options.DIRECTION);
	    }
	    if (options?.ALPHA) {
	        parser.push('ALPHA');
	    }
	}
	SORT.parseSortArguments = parseSortArguments;
	SORT.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the SORT command
	     *
	     * @param parser - The command parser
	     * @param key - The key to sort (list, set, or sorted set)
	     * @param options - Sort options
	     * @see https://redis.io/commands/sort/
	     */
	    parseCommand(parser, key, options) {
	        parser.push('SORT');
	        parseSortArguments(parser, key, options);
	    },
	    transformReply: undefined
	};
	
	return SORT;
}

var hasRequiredSORT_RO;

function requireSORT_RO () {
	if (hasRequiredSORT_RO) return SORT_RO;
	hasRequiredSORT_RO = 1;
	var __createBinding = (SORT_RO && SORT_RO.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (SORT_RO && SORT_RO.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar = (SORT_RO && SORT_RO.__importStar) || function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
	    __setModuleDefault(result, mod);
	    return result;
	};
	Object.defineProperty(SORT_RO, "__esModule", { value: true });
	const SORT_1 = __importStar(requireSORT());
	SORT_RO.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Read-only variant of SORT that sorts the elements in a list, set or sorted set.
	     * @param args - Same parameters as the SORT command.
	     */
	    parseCommand(...args) {
	        const parser = args[0];
	        parser.push('SORT_RO');
	        (0, SORT_1.parseSortArguments)(...args);
	    },
	    transformReply: SORT_1.default.transformReply
	};
	
	return SORT_RO;
}

var SORT_STORE = {};

var hasRequiredSORT_STORE;

function requireSORT_STORE () {
	if (hasRequiredSORT_STORE) return SORT_STORE;
	hasRequiredSORT_STORE = 1;
	var __importDefault = (SORT_STORE && SORT_STORE.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(SORT_STORE, "__esModule", { value: true });
	const SORT_1 = __importDefault(requireSORT());
	SORT_STORE.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Sorts the elements in a list, set or sorted set and stores the result in a new list.
	     * @param parser - The Redis command parser.
	     * @param source - Key of the source list, set or sorted set.
	     * @param destination - Destination key where the result will be stored.
	     * @param options - Optional sorting parameters.
	     */
	    parseCommand(parser, source, destination, options) {
	        SORT_1.default.parseCommand(parser, source, options);
	        parser.push('STORE', destination);
	    },
	    transformReply: undefined
	};
	
	return SORT_STORE;
}

var SPOP_COUNT = {};

var hasRequiredSPOP_COUNT;

function requireSPOP_COUNT () {
	if (hasRequiredSPOP_COUNT) return SPOP_COUNT;
	hasRequiredSPOP_COUNT = 1;
	Object.defineProperty(SPOP_COUNT, "__esModule", { value: true });
	SPOP_COUNT.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Constructs the SPOP command to remove and return multiple random members from a set
	     *
	     * @param parser - The command parser
	     * @param key - The key of the set to pop from
	     * @param count - The number of members to pop
	     * @see https://redis.io/commands/spop/
	     */
	    parseCommand(parser, key, count) {
	        parser.push('SPOP');
	        parser.pushKey(key);
	        parser.push(count.toString());
	    },
	    transformReply: undefined
	};
	
	return SPOP_COUNT;
}

var SPOP = {};

var hasRequiredSPOP;

function requireSPOP () {
	if (hasRequiredSPOP) return SPOP;
	hasRequiredSPOP = 1;
	Object.defineProperty(SPOP, "__esModule", { value: true });
	SPOP.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Constructs the SPOP command to remove and return a random member from a set
	     *
	     * @param parser - The command parser
	     * @param key - The key of the set to pop from
	     * @see https://redis.io/commands/spop/
	     */
	    parseCommand(parser, key) {
	        parser.push('SPOP');
	        parser.pushKey(key);
	    },
	    transformReply: undefined
	};
	
	return SPOP;
}

var SPUBLISH = {};

var hasRequiredSPUBLISH;

function requireSPUBLISH () {
	if (hasRequiredSPUBLISH) return SPUBLISH;
	hasRequiredSPUBLISH = 1;
	Object.defineProperty(SPUBLISH, "__esModule", { value: true });
	SPUBLISH.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the SPUBLISH command to post a message to a Sharded Pub/Sub channel
	     *
	     * @param parser - The command parser
	     * @param channel - The channel to publish to
	     * @param message - The message to publish
	     * @see https://redis.io/commands/spublish/
	     */
	    parseCommand(parser, channel, message) {
	        parser.push('SPUBLISH');
	        parser.pushKey(channel);
	        parser.push(message);
	    },
	    transformReply: undefined
	};
	
	return SPUBLISH;
}

var SRANDMEMBER_COUNT = {};

var SRANDMEMBER = {};

var hasRequiredSRANDMEMBER;

function requireSRANDMEMBER () {
	if (hasRequiredSRANDMEMBER) return SRANDMEMBER;
	hasRequiredSRANDMEMBER = 1;
	Object.defineProperty(SRANDMEMBER, "__esModule", { value: true });
	SRANDMEMBER.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the SRANDMEMBER command to get a random member from a set
	     *
	     * @param parser - The command parser
	     * @param key - The key of the set to get random member from
	     * @see https://redis.io/commands/srandmember/
	     */
	    parseCommand(parser, key) {
	        parser.push('SRANDMEMBER');
	        parser.pushKey(key);
	    },
	    transformReply: undefined
	};
	
	return SRANDMEMBER;
}

var hasRequiredSRANDMEMBER_COUNT;

function requireSRANDMEMBER_COUNT () {
	if (hasRequiredSRANDMEMBER_COUNT) return SRANDMEMBER_COUNT;
	hasRequiredSRANDMEMBER_COUNT = 1;
	var __importDefault = (SRANDMEMBER_COUNT && SRANDMEMBER_COUNT.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(SRANDMEMBER_COUNT, "__esModule", { value: true });
	const SRANDMEMBER_1 = __importDefault(requireSRANDMEMBER());
	SRANDMEMBER_COUNT.default = {
	    IS_READ_ONLY: SRANDMEMBER_1.default.IS_READ_ONLY,
	    /**
	     * Constructs the SRANDMEMBER command to get multiple random members from a set
	     *
	     * @param parser - The command parser
	     * @param key - The key of the set to get random members from
	     * @param count - The number of members to return. If negative, may return the same member multiple times
	     * @see https://redis.io/commands/srandmember/
	     */
	    parseCommand(parser, key, count) {
	        SRANDMEMBER_1.default.parseCommand(parser, key);
	        parser.push(count.toString());
	    },
	    transformReply: undefined
	};
	
	return SRANDMEMBER_COUNT;
}

var SREM = {};

var hasRequiredSREM;

function requireSREM () {
	if (hasRequiredSREM) return SREM;
	hasRequiredSREM = 1;
	Object.defineProperty(SREM, "__esModule", { value: true });
	SREM.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Constructs the SREM command to remove one or more members from a set
	     *
	     * @param parser - The command parser
	     * @param key - The key of the set to remove members from
	     * @param members - One or more members to remove from the set
	     * @returns The number of members that were removed from the set
	     * @see https://redis.io/commands/srem/
	     */
	    parseCommand(parser, key, members) {
	        parser.push('SREM');
	        parser.pushKey(key);
	        parser.pushVariadic(members);
	    },
	    transformReply: undefined
	};
	
	return SREM;
}

var SSCAN = {};

var hasRequiredSSCAN;

function requireSSCAN () {
	if (hasRequiredSSCAN) return SSCAN;
	hasRequiredSSCAN = 1;
	Object.defineProperty(SSCAN, "__esModule", { value: true });
	const SCAN_1 = requireSCAN();
	SSCAN.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the SSCAN command to incrementally iterate over elements in a set
	     *
	     * @param parser - The command parser
	     * @param key - The key of the set to scan
	     * @param cursor - The cursor position to start scanning from
	     * @param options - Optional scanning parameters (COUNT and MATCH)
	     * @returns Iterator containing cursor position and matching members
	     * @see https://redis.io/commands/sscan/
	     */
	    parseCommand(parser, key, cursor, options) {
	        parser.push('SSCAN');
	        parser.pushKey(key);
	        (0, SCAN_1.parseScanArguments)(parser, cursor, options);
	    },
	    /**
	     * Transforms the SSCAN reply into a cursor result object
	     *
	     * @param cursor - The next cursor position
	     * @param members - Array of matching set members
	     * @returns Object containing cursor and members array
	     */
	    transformReply([cursor, members]) {
	        return {
	            cursor,
	            members
	        };
	    }
	};
	
	return SSCAN;
}

var STRLEN$1 = {};

var hasRequiredSTRLEN$1;

function requireSTRLEN$1 () {
	if (hasRequiredSTRLEN$1) return STRLEN$1;
	hasRequiredSTRLEN$1 = 1;
	Object.defineProperty(STRLEN$1, "__esModule", { value: true });
	STRLEN$1.default = {
	    CACHEABLE: true,
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the STRLEN command to get the length of a string value
	     *
	     * @param parser - The command parser
	     * @param key - The key holding the string value
	     * @returns The length of the string value, or 0 when key does not exist
	     * @see https://redis.io/commands/strlen/
	     */
	    parseCommand(parser, key) {
	        parser.push('STRLEN');
	        parser.pushKey(key);
	    },
	    transformReply: undefined
	};
	
	return STRLEN$1;
}

var SUNION = {};

var hasRequiredSUNION;

function requireSUNION () {
	if (hasRequiredSUNION) return SUNION;
	hasRequiredSUNION = 1;
	Object.defineProperty(SUNION, "__esModule", { value: true });
	SUNION.default = {
	    CACHEABLE: true,
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the SUNION command to return the members of the set resulting from the union of all the given sets
	     *
	     * @param parser - The command parser
	     * @param keys - One or more set keys to compute the union from
	     * @returns Array of all elements that are members of at least one of the given sets
	     * @see https://redis.io/commands/sunion/
	     */
	    parseCommand(parser, keys) {
	        parser.push('SUNION');
	        parser.pushKeys(keys);
	    },
	    transformReply: undefined
	};
	
	return SUNION;
}

var SUNIONSTORE = {};

var hasRequiredSUNIONSTORE;

function requireSUNIONSTORE () {
	if (hasRequiredSUNIONSTORE) return SUNIONSTORE;
	hasRequiredSUNIONSTORE = 1;
	Object.defineProperty(SUNIONSTORE, "__esModule", { value: true });
	SUNIONSTORE.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Constructs the SUNIONSTORE command to store the union of multiple sets into a destination set
	     *
	     * @param parser - The command parser
	     * @param destination - The destination key to store the resulting set
	     * @param keys - One or more source set keys to compute the union from
	     * @returns The number of elements in the resulting set
	     * @see https://redis.io/commands/sunionstore/
	     */
	    parseCommand(parser, destination, keys) {
	        parser.push('SUNIONSTORE');
	        parser.pushKey(destination);
	        parser.pushKeys(keys);
	    },
	    transformReply: undefined
	};
	
	return SUNIONSTORE;
}

var SWAPDB = {};

var hasRequiredSWAPDB;

function requireSWAPDB () {
	if (hasRequiredSWAPDB) return SWAPDB;
	hasRequiredSWAPDB = 1;
	Object.defineProperty(SWAPDB, "__esModule", { value: true });
	SWAPDB.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: false,
	    /**
	     * Swaps the data of two Redis databases.
	     * @param parser - The Redis command parser.
	     * @param index1 - First database index.
	     * @param index2 - Second database index.
	     */
	    parseCommand(parser, index1, index2) {
	        parser.push('SWAPDB', index1.toString(), index2.toString());
	    },
	    transformReply: undefined
	};
	
	return SWAPDB;
}

var TIME = {};

var hasRequiredTIME;

function requireTIME () {
	if (hasRequiredTIME) return TIME;
	hasRequiredTIME = 1;
	Object.defineProperty(TIME, "__esModule", { value: true });
	TIME.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the TIME command to return the server's current time
	     *
	     * @param parser - The command parser
	     * @returns Array containing the Unix timestamp in seconds and microseconds
	     * @see https://redis.io/commands/time/
	     */
	    parseCommand(parser) {
	        parser.push('TIME');
	    },
	    transformReply: undefined
	};
	
	return TIME;
}

var TOUCH = {};

var hasRequiredTOUCH;

function requireTOUCH () {
	if (hasRequiredTOUCH) return TOUCH;
	hasRequiredTOUCH = 1;
	Object.defineProperty(TOUCH, "__esModule", { value: true });
	TOUCH.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Constructs the TOUCH command to alter the last access time of keys
	     *
	     * @param parser - The command parser
	     * @param key - One or more keys to touch
	     * @returns The number of keys that were touched
	     * @see https://redis.io/commands/touch/
	     */
	    parseCommand(parser, key) {
	        parser.push('TOUCH');
	        parser.pushKeys(key);
	    },
	    transformReply: undefined
	};
	
	return TOUCH;
}

var TTL = {};

var hasRequiredTTL;

function requireTTL () {
	if (hasRequiredTTL) return TTL;
	hasRequiredTTL = 1;
	Object.defineProperty(TTL, "__esModule", { value: true });
	TTL.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the TTL command to get the remaining time to live of a key
	     *
	     * @param parser - The command parser
	     * @param key - Key to check
	     * @returns Time to live in seconds, -2 if key does not exist, -1 if has no timeout
	     * @see https://redis.io/commands/ttl/
	     */
	    parseCommand(parser, key) {
	        parser.push('TTL');
	        parser.pushKey(key);
	    },
	    transformReply: undefined
	};
	
	return TTL;
}

var TYPE$1 = {};

var hasRequiredTYPE$1;

function requireTYPE$1 () {
	if (hasRequiredTYPE$1) return TYPE$1;
	hasRequiredTYPE$1 = 1;
	Object.defineProperty(TYPE$1, "__esModule", { value: true });
	TYPE$1.default = {
	    CACHEABLE: true,
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the TYPE command to determine the data type stored at key
	     *
	     * @param parser - The command parser
	     * @param key - Key to check
	     * @returns String reply: "none", "string", "list", "set", "zset", "hash", "stream"
	     * @see https://redis.io/commands/type/
	     */
	    parseCommand(parser, key) {
	        parser.push('TYPE');
	        parser.pushKey(key);
	    },
	    transformReply: undefined
	};
	
	return TYPE$1;
}

var UNLINK = {};

var hasRequiredUNLINK;

function requireUNLINK () {
	if (hasRequiredUNLINK) return UNLINK;
	hasRequiredUNLINK = 1;
	Object.defineProperty(UNLINK, "__esModule", { value: true });
	UNLINK.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Constructs the UNLINK command to asynchronously delete one or more keys
	     *
	     * @param parser - The command parser
	     * @param keys - One or more keys to unlink
	     * @returns The number of keys that were unlinked
	     * @see https://redis.io/commands/unlink/
	     */
	    parseCommand(parser, keys) {
	        parser.push('UNLINK');
	        parser.pushKeys(keys);
	    },
	    transformReply: undefined
	};
	
	return UNLINK;
}

var WAIT = {};

var hasRequiredWAIT;

function requireWAIT () {
	if (hasRequiredWAIT) return WAIT;
	hasRequiredWAIT = 1;
	Object.defineProperty(WAIT, "__esModule", { value: true });
	WAIT.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the WAIT command to synchronize with replicas
	     *
	     * @param parser - The command parser
	     * @param numberOfReplicas - Number of replicas that must acknowledge the write
	     * @param timeout - Maximum time to wait in milliseconds
	     * @returns The number of replicas that acknowledged the write
	     * @see https://redis.io/commands/wait/
	     */
	    parseCommand(parser, numberOfReplicas, timeout) {
	        parser.push('WAIT', numberOfReplicas.toString(), timeout.toString());
	    },
	    transformReply: undefined
	};
	
	return WAIT;
}

var XACK = {};

var hasRequiredXACK;

function requireXACK () {
	if (hasRequiredXACK) return XACK;
	hasRequiredXACK = 1;
	Object.defineProperty(XACK, "__esModule", { value: true });
	XACK.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Constructs the XACK command to acknowledge the processing of stream messages in a consumer group
	     *
	     * @param parser - The command parser
	     * @param key - The stream key
	     * @param group - The consumer group name
	     * @param id - One or more message IDs to acknowledge
	     * @returns The number of messages successfully acknowledged
	     * @see https://redis.io/commands/xack/
	     */
	    parseCommand(parser, key, group, id) {
	        parser.push('XACK');
	        parser.pushKey(key);
	        parser.push(group);
	        parser.pushVariadic(id);
	    },
	    transformReply: undefined
	};
	
	return XACK;
}

var XADD_NOMKSTREAM = {};

var XADD = {};

var hasRequiredXADD;

function requireXADD () {
	if (hasRequiredXADD) return XADD;
	hasRequiredXADD = 1;
	Object.defineProperty(XADD, "__esModule", { value: true });
	XADD.parseXAddArguments = void 0;
	/**
	 * Parses arguments for the XADD command
	 *
	 * @param optional - Optional command modifier
	 * @param parser - The command parser
	 * @param key - The stream key
	 * @param id - Message ID (* for auto-generation)
	 * @param message - Key-value pairs representing the message fields
	 * @param options - Additional options for stream trimming
	 */
	function parseXAddArguments(optional, parser, key, id, message, options) {
	    parser.push('XADD');
	    parser.pushKey(key);
	    if (optional) {
	        parser.push(optional);
	    }
	    if (options?.TRIM) {
	        if (options.TRIM.strategy) {
	            parser.push(options.TRIM.strategy);
	        }
	        if (options.TRIM.strategyModifier) {
	            parser.push(options.TRIM.strategyModifier);
	        }
	        parser.push(options.TRIM.threshold.toString());
	        if (options.TRIM.limit) {
	            parser.push('LIMIT', options.TRIM.limit.toString());
	        }
	    }
	    parser.push(id);
	    for (const [key, value] of Object.entries(message)) {
	        parser.push(key, value);
	    }
	}
	XADD.parseXAddArguments = parseXAddArguments;
	XADD.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Constructs the XADD command to append a new entry to a stream
	     *
	     * @param parser - The command parser
	     * @param key - The stream key
	     * @param id - Message ID (* for auto-generation)
	     * @param message - Key-value pairs representing the message fields
	     * @param options - Additional options for stream trimming
	     * @returns The ID of the added entry
	     * @see https://redis.io/commands/xadd/
	     */
	    parseCommand(...args) {
	        return parseXAddArguments(undefined, ...args);
	    },
	    transformReply: undefined
	};
	
	return XADD;
}

var hasRequiredXADD_NOMKSTREAM;

function requireXADD_NOMKSTREAM () {
	if (hasRequiredXADD_NOMKSTREAM) return XADD_NOMKSTREAM;
	hasRequiredXADD_NOMKSTREAM = 1;
	Object.defineProperty(XADD_NOMKSTREAM, "__esModule", { value: true });
	const XADD_1 = requireXADD();
	/**
	 * Command for adding entries to an existing stream without creating it if it doesn't exist
	 */
	XADD_NOMKSTREAM.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Constructs the XADD command with NOMKSTREAM option to append a new entry to an existing stream
	     *
	     * @param args - Arguments tuple containing parser, key, id, message, and options
	     * @returns The ID of the added entry, or null if the stream doesn't exist
	     * @see https://redis.io/commands/xadd/
	     */
	    parseCommand(...args) {
	        return (0, XADD_1.parseXAddArguments)('NOMKSTREAM', ...args);
	    },
	    transformReply: undefined
	};
	
	return XADD_NOMKSTREAM;
}

var XAUTOCLAIM_JUSTID = {};

var XAUTOCLAIM = {};

var hasRequiredXAUTOCLAIM;

function requireXAUTOCLAIM () {
	if (hasRequiredXAUTOCLAIM) return XAUTOCLAIM;
	hasRequiredXAUTOCLAIM = 1;
	Object.defineProperty(XAUTOCLAIM, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	XAUTOCLAIM.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Constructs the XAUTOCLAIM command to automatically claim pending messages in a consumer group
	     *
	     * @param parser - The command parser
	     * @param key - The stream key
	     * @param group - The consumer group name
	     * @param consumer - The consumer name that will claim the messages
	     * @param minIdleTime - Minimum idle time in milliseconds for a message to be claimed
	     * @param start - Message ID to start scanning from
	     * @param options - Additional options for the claim operation
	     * @returns Object containing nextId, claimed messages, and list of deleted message IDs
	     * @see https://redis.io/commands/xautoclaim/
	     */
	    parseCommand(parser, key, group, consumer, minIdleTime, start, options) {
	        parser.push('XAUTOCLAIM');
	        parser.pushKey(key);
	        parser.push(group, consumer, minIdleTime.toString(), start);
	        if (options?.COUNT) {
	            parser.push('COUNT', options.COUNT.toString());
	        }
	    },
	    /**
	     * Transforms the raw XAUTOCLAIM reply into a structured object
	     *
	     * @param reply - Raw reply from Redis
	     * @param preserve - Preserve options (unused)
	     * @param typeMapping - Type mapping for message fields
	     * @returns Structured object containing nextId, messages, and deletedMessages
	     */
	    transformReply(reply, preserve, typeMapping) {
	        return {
	            nextId: reply[0],
	            messages: reply[1].map(generic_transformers_1.transformStreamMessageNullReply.bind(undefined, typeMapping)),
	            deletedMessages: reply[2]
	        };
	    }
	};
	
	return XAUTOCLAIM;
}

var hasRequiredXAUTOCLAIM_JUSTID;

function requireXAUTOCLAIM_JUSTID () {
	if (hasRequiredXAUTOCLAIM_JUSTID) return XAUTOCLAIM_JUSTID;
	hasRequiredXAUTOCLAIM_JUSTID = 1;
	var __importDefault = (XAUTOCLAIM_JUSTID && XAUTOCLAIM_JUSTID.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(XAUTOCLAIM_JUSTID, "__esModule", { value: true });
	const XAUTOCLAIM_1 = __importDefault(requireXAUTOCLAIM());
	XAUTOCLAIM_JUSTID.default = {
	    IS_READ_ONLY: XAUTOCLAIM_1.default.IS_READ_ONLY,
	    /**
	     * Constructs the XAUTOCLAIM command with JUSTID option to get only message IDs
	     *
	     * @param args - Same parameters as XAUTOCLAIM command
	     * @returns Object containing nextId and arrays of claimed and deleted message IDs
	     * @see https://redis.io/commands/xautoclaim/
	     */
	    parseCommand(...args) {
	        const parser = args[0];
	        XAUTOCLAIM_1.default.parseCommand(...args);
	        parser.push('JUSTID');
	    },
	    /**
	     * Transforms the raw XAUTOCLAIM JUSTID reply into a structured object
	     *
	     * @param reply - Raw reply from Redis
	     * @returns Structured object containing nextId, message IDs, and deleted message IDs
	     */
	    transformReply(reply) {
	        return {
	            nextId: reply[0],
	            messages: reply[1],
	            deletedMessages: reply[2]
	        };
	    }
	};
	
	return XAUTOCLAIM_JUSTID;
}

var XCLAIM_JUSTID = {};

var XCLAIM = {};

var hasRequiredXCLAIM;

function requireXCLAIM () {
	if (hasRequiredXCLAIM) return XCLAIM;
	hasRequiredXCLAIM = 1;
	Object.defineProperty(XCLAIM, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	XCLAIM.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Constructs the XCLAIM command to claim pending messages in a consumer group
	     *
	     * @param parser - The command parser
	     * @param key - The stream key
	     * @param group - The consumer group name
	     * @param consumer - The consumer name that will claim the messages
	     * @param minIdleTime - Minimum idle time in milliseconds for a message to be claimed
	     * @param id - One or more message IDs to claim
	     * @param options - Additional options for the claim operation
	     * @returns Array of claimed messages
	     * @see https://redis.io/commands/xclaim/
	     */
	    parseCommand(parser, key, group, consumer, minIdleTime, id, options) {
	        parser.push('XCLAIM');
	        parser.pushKey(key);
	        parser.push(group, consumer, minIdleTime.toString());
	        parser.pushVariadic(id);
	        if (options?.IDLE !== undefined) {
	            parser.push('IDLE', options.IDLE.toString());
	        }
	        if (options?.TIME !== undefined) {
	            parser.push('TIME', (options.TIME instanceof Date ? options.TIME.getTime() : options.TIME).toString());
	        }
	        if (options?.RETRYCOUNT !== undefined) {
	            parser.push('RETRYCOUNT', options.RETRYCOUNT.toString());
	        }
	        if (options?.FORCE) {
	            parser.push('FORCE');
	        }
	        if (options?.LASTID !== undefined) {
	            parser.push('LASTID', options.LASTID);
	        }
	    },
	    /**
	     * Transforms the raw XCLAIM reply into an array of messages
	     *
	     * @param reply - Raw reply from Redis
	     * @param preserve - Preserve options (unused)
	     * @param typeMapping - Type mapping for message fields
	     * @returns Array of claimed messages with their fields
	     */
	    transformReply(reply, preserve, typeMapping) {
	        return reply.map(generic_transformers_1.transformStreamMessageNullReply.bind(undefined, typeMapping));
	    }
	};
	
	return XCLAIM;
}

var hasRequiredXCLAIM_JUSTID;

function requireXCLAIM_JUSTID () {
	if (hasRequiredXCLAIM_JUSTID) return XCLAIM_JUSTID;
	hasRequiredXCLAIM_JUSTID = 1;
	var __importDefault = (XCLAIM_JUSTID && XCLAIM_JUSTID.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(XCLAIM_JUSTID, "__esModule", { value: true });
	const XCLAIM_1 = __importDefault(requireXCLAIM());
	/**
	 * Command variant for XCLAIM that returns only message IDs
	 */
	XCLAIM_JUSTID.default = {
	    IS_READ_ONLY: XCLAIM_1.default.IS_READ_ONLY,
	    /**
	     * Constructs the XCLAIM command with JUSTID option to get only message IDs
	     *
	     * @param args - Same parameters as XCLAIM command
	     * @returns Array of successfully claimed message IDs
	     * @see https://redis.io/commands/xclaim/
	     */
	    parseCommand(...args) {
	        const parser = args[0];
	        XCLAIM_1.default.parseCommand(...args);
	        parser.push('JUSTID');
	    },
	    /**
	     * Transforms the XCLAIM JUSTID reply into an array of message IDs
	     *
	     * @returns Array of claimed message IDs
	     */
	    transformReply: undefined
	};
	
	return XCLAIM_JUSTID;
}

var XDEL = {};

var hasRequiredXDEL;

function requireXDEL () {
	if (hasRequiredXDEL) return XDEL;
	hasRequiredXDEL = 1;
	Object.defineProperty(XDEL, "__esModule", { value: true });
	/**
	 * Command for removing messages from a stream
	 */
	XDEL.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Constructs the XDEL command to remove one or more messages from a stream
	     *
	     * @param parser - The command parser
	     * @param key - The stream key
	     * @param id - One or more message IDs to delete
	     * @returns The number of messages actually deleted
	     * @see https://redis.io/commands/xdel/
	     */
	    parseCommand(parser, key, id) {
	        parser.push('XDEL');
	        parser.pushKey(key);
	        parser.pushVariadic(id);
	    },
	    transformReply: undefined
	};
	
	return XDEL;
}

var XGROUP_CREATE = {};

var hasRequiredXGROUP_CREATE;

function requireXGROUP_CREATE () {
	if (hasRequiredXGROUP_CREATE) return XGROUP_CREATE;
	hasRequiredXGROUP_CREATE = 1;
	Object.defineProperty(XGROUP_CREATE, "__esModule", { value: true });
	XGROUP_CREATE.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Constructs the XGROUP CREATE command to create a consumer group for a stream
	     *
	     * @param parser - The command parser
	     * @param key - The stream key
	     * @param group - Name of the consumer group
	     * @param id - ID of the last delivered item in the stream ('$' for last item, '0' for all items)
	     * @param options - Additional options for group creation
	     * @returns 'OK' if successful
	     * @see https://redis.io/commands/xgroup-create/
	     */
	    parseCommand(parser, key, group, id, options) {
	        parser.push('XGROUP', 'CREATE');
	        parser.pushKey(key);
	        parser.push(group, id);
	        if (options?.MKSTREAM) {
	            parser.push('MKSTREAM');
	        }
	        if (options?.ENTRIESREAD) {
	            parser.push('ENTRIESREAD', options.ENTRIESREAD.toString());
	        }
	    },
	    transformReply: undefined
	};
	
	return XGROUP_CREATE;
}

var XGROUP_CREATECONSUMER = {};

var hasRequiredXGROUP_CREATECONSUMER;

function requireXGROUP_CREATECONSUMER () {
	if (hasRequiredXGROUP_CREATECONSUMER) return XGROUP_CREATECONSUMER;
	hasRequiredXGROUP_CREATECONSUMER = 1;
	Object.defineProperty(XGROUP_CREATECONSUMER, "__esModule", { value: true });
	/**
	 * Command for creating a new consumer in a consumer group
	 */
	XGROUP_CREATECONSUMER.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Constructs the XGROUP CREATECONSUMER command to create a new consumer in a consumer group
	     *
	     * @param parser - The command parser
	     * @param key - The stream key
	     * @param group - Name of the consumer group
	     * @param consumer - Name of the consumer to create
	     * @returns 1 if the consumer was created, 0 if it already existed
	     * @see https://redis.io/commands/xgroup-createconsumer/
	     */
	    parseCommand(parser, key, group, consumer) {
	        parser.push('XGROUP', 'CREATECONSUMER');
	        parser.pushKey(key);
	        parser.push(group, consumer);
	    },
	    transformReply: undefined
	};
	
	return XGROUP_CREATECONSUMER;
}

var XGROUP_DELCONSUMER = {};

var hasRequiredXGROUP_DELCONSUMER;

function requireXGROUP_DELCONSUMER () {
	if (hasRequiredXGROUP_DELCONSUMER) return XGROUP_DELCONSUMER;
	hasRequiredXGROUP_DELCONSUMER = 1;
	Object.defineProperty(XGROUP_DELCONSUMER, "__esModule", { value: true });
	/**
	 * Command for removing a consumer from a consumer group
	 */
	XGROUP_DELCONSUMER.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Constructs the XGROUP DELCONSUMER command to remove a consumer from a consumer group
	     *
	     * @param parser - The command parser
	     * @param key - The stream key
	     * @param group - Name of the consumer group
	     * @param consumer - Name of the consumer to remove
	     * @returns The number of pending messages owned by the deleted consumer
	     * @see https://redis.io/commands/xgroup-delconsumer/
	     */
	    parseCommand(parser, key, group, consumer) {
	        parser.push('XGROUP', 'DELCONSUMER');
	        parser.pushKey(key);
	        parser.push(group, consumer);
	    },
	    transformReply: undefined
	};
	
	return XGROUP_DELCONSUMER;
}

var XGROUP_DESTROY = {};

var hasRequiredXGROUP_DESTROY;

function requireXGROUP_DESTROY () {
	if (hasRequiredXGROUP_DESTROY) return XGROUP_DESTROY;
	hasRequiredXGROUP_DESTROY = 1;
	Object.defineProperty(XGROUP_DESTROY, "__esModule", { value: true });
	/**
	 * Command for removing a consumer group
	 */
	XGROUP_DESTROY.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Constructs the XGROUP DESTROY command to remove a consumer group
	     *
	     * @param parser - The command parser
	     * @param key - The stream key
	     * @param group - Name of the consumer group to destroy
	     * @returns 1 if the group was destroyed, 0 if it did not exist
	     * @see https://redis.io/commands/xgroup-destroy/
	     */
	    parseCommand(parser, key, group) {
	        parser.push('XGROUP', 'DESTROY');
	        parser.pushKey(key);
	        parser.push(group);
	    },
	    transformReply: undefined
	};
	
	return XGROUP_DESTROY;
}

var XGROUP_SETID = {};

var hasRequiredXGROUP_SETID;

function requireXGROUP_SETID () {
	if (hasRequiredXGROUP_SETID) return XGROUP_SETID;
	hasRequiredXGROUP_SETID = 1;
	Object.defineProperty(XGROUP_SETID, "__esModule", { value: true });
	XGROUP_SETID.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Constructs the XGROUP SETID command to set the last delivered ID for a consumer group
	     *
	     * @param parser - The command parser
	     * @param key - The stream key
	     * @param group - Name of the consumer group
	     * @param id - ID to set as last delivered message ('$' for last item, '0' for all items)
	     * @param options - Additional options for setting the group ID
	     * @returns 'OK' if successful
	     * @see https://redis.io/commands/xgroup-setid/
	     */
	    parseCommand(parser, key, group, id, options) {
	        parser.push('XGROUP', 'SETID');
	        parser.pushKey(key);
	        parser.push(group, id);
	        if (options?.ENTRIESREAD) {
	            parser.push('ENTRIESREAD', options.ENTRIESREAD.toString());
	        }
	    },
	    transformReply: undefined
	};
	
	return XGROUP_SETID;
}

var XINFO_CONSUMERS = {};

var hasRequiredXINFO_CONSUMERS;

function requireXINFO_CONSUMERS () {
	if (hasRequiredXINFO_CONSUMERS) return XINFO_CONSUMERS;
	hasRequiredXINFO_CONSUMERS = 1;
	Object.defineProperty(XINFO_CONSUMERS, "__esModule", { value: true });
	XINFO_CONSUMERS.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the XINFO CONSUMERS command to list the consumers in a consumer group
	     *
	     * @param parser - The command parser
	     * @param key - The stream key
	     * @param group - Name of the consumer group
	     * @returns Array of consumer information objects
	     * @see https://redis.io/commands/xinfo-consumers/
	     */
	    parseCommand(parser, key, group) {
	        parser.push('XINFO', 'CONSUMERS');
	        parser.pushKey(key);
	        parser.push(group);
	    },
	    transformReply: {
	        /**
	         * Transforms RESP2 reply into a structured consumer information array
	         *
	         * @param reply - Raw RESP2 reply from Redis
	         * @returns Array of consumer information objects
	         */
	        2: (reply) => {
	            return reply.map(consumer => {
	                const unwrapped = consumer;
	                return {
	                    name: unwrapped[1],
	                    pending: unwrapped[3],
	                    idle: unwrapped[5],
	                    inactive: unwrapped[7]
	                };
	            });
	        },
	        3: undefined
	    }
	};
	
	return XINFO_CONSUMERS;
}

var XINFO_GROUPS = {};

var hasRequiredXINFO_GROUPS;

function requireXINFO_GROUPS () {
	if (hasRequiredXINFO_GROUPS) return XINFO_GROUPS;
	hasRequiredXINFO_GROUPS = 1;
	Object.defineProperty(XINFO_GROUPS, "__esModule", { value: true });
	XINFO_GROUPS.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the XINFO GROUPS command to list the consumer groups of a stream
	     *
	     * @param parser - The command parser
	     * @param key - The stream key
	     * @returns Array of consumer group information objects
	     * @see https://redis.io/commands/xinfo-groups/
	     */
	    parseCommand(parser, key) {
	        parser.push('XINFO', 'GROUPS');
	        parser.pushKey(key);
	    },
	    transformReply: {
	        /**
	         * Transforms RESP2 reply into a structured consumer group information array
	         *
	         * @param reply - Raw RESP2 reply from Redis
	         * @returns Array of consumer group information objects containing:
	         *          name - Name of the consumer group
	         *          consumers - Number of consumers in the group
	         *          pending - Number of pending messages for the group
	         *          last-delivered-id - ID of the last delivered message
	         *          entries-read - Number of entries read in the group (Redis 7.0+)
	         *          lag - Number of entries not read by the group (Redis 7.0+)
	         */
	        2: (reply) => {
	            return reply.map(group => {
	                const unwrapped = group;
	                return {
	                    name: unwrapped[1],
	                    consumers: unwrapped[3],
	                    pending: unwrapped[5],
	                    'last-delivered-id': unwrapped[7],
	                    'entries-read': unwrapped[9],
	                    lag: unwrapped[11]
	                };
	            });
	        },
	        3: undefined
	    }
	};
	
	return XINFO_GROUPS;
}

var XINFO_STREAM = {};

var hasRequiredXINFO_STREAM;

function requireXINFO_STREAM () {
	if (hasRequiredXINFO_STREAM) return XINFO_STREAM;
	hasRequiredXINFO_STREAM = 1;
	Object.defineProperty(XINFO_STREAM, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	XINFO_STREAM.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the XINFO STREAM command to get detailed information about a stream
	     *
	     * @param parser - The command parser
	     * @param key - The stream key
	     * @returns Detailed information about the stream including its length, structure, and entries
	     * @see https://redis.io/commands/xinfo-stream/
	     */
	    parseCommand(parser, key) {
	        parser.push('XINFO', 'STREAM');
	        parser.pushKey(key);
	    },
	    transformReply: {
	        // TODO: is there a "type safe" way to do it?
	        2(reply) {
	            const parsedReply = {};
	            for (let i = 0; i < reply.length; i += 2) {
	                switch (reply[i]) {
	                    case 'first-entry':
	                    case 'last-entry':
	                        parsedReply[reply[i]] = transformEntry(reply[i + 1]);
	                        break;
	                    default:
	                        parsedReply[reply[i]] = reply[i + 1];
	                        break;
	                }
	            }
	            return parsedReply;
	        },
	        3(reply) {
	            if (reply instanceof Map) {
	                reply.set('first-entry', transformEntry(reply.get('first-entry')));
	                reply.set('last-entry', transformEntry(reply.get('last-entry')));
	            }
	            else if (reply instanceof Array) {
	                reply[17] = transformEntry(reply[17]);
	                reply[19] = transformEntry(reply[19]);
	            }
	            else {
	                reply['first-entry'] = transformEntry(reply['first-entry']);
	                reply['last-entry'] = transformEntry(reply['last-entry']);
	            }
	            return reply;
	        }
	    }
	};
	/**
	 * Transforms a raw stream entry into a structured object
	 *
	 * @param entry - Raw entry from Redis
	 * @returns Structured object with id and message, or null if entry is null
	 */
	function transformEntry(entry) {
	    if ((0, generic_transformers_1.isNullReply)(entry))
	        return entry;
	    const [id, message] = entry;
	    return {
	        id,
	        message: (0, generic_transformers_1.transformTuplesReply)(message)
	    };
	}
	
	return XINFO_STREAM;
}

var XLEN = {};

var hasRequiredXLEN;

function requireXLEN () {
	if (hasRequiredXLEN) return XLEN;
	hasRequiredXLEN = 1;
	Object.defineProperty(XLEN, "__esModule", { value: true });
	/**
	 * Command for getting the length of a stream
	 */
	XLEN.default = {
	    CACHEABLE: true,
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the XLEN command to get the number of entries in a stream
	     *
	     * @param parser - The command parser
	     * @param key - The stream key
	     * @returns The number of entries inside the stream
	     * @see https://redis.io/commands/xlen/
	     */
	    parseCommand(parser, key) {
	        parser.push('XLEN');
	        parser.pushKey(key);
	    },
	    transformReply: undefined
	};
	
	return XLEN;
}

var XPENDING_RANGE = {};

var hasRequiredXPENDING_RANGE;

function requireXPENDING_RANGE () {
	if (hasRequiredXPENDING_RANGE) return XPENDING_RANGE;
	hasRequiredXPENDING_RANGE = 1;
	Object.defineProperty(XPENDING_RANGE, "__esModule", { value: true });
	XPENDING_RANGE.default = {
	    CACHEABLE: true,
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the XPENDING command with range parameters to get detailed information about pending messages
	     *
	     * @param parser - The command parser
	     * @param key - The stream key
	     * @param group - Name of the consumer group
	     * @param start - Start of ID range (use '-' for minimum ID)
	     * @param end - End of ID range (use '+' for maximum ID)
	     * @param count - Maximum number of messages to return
	     * @param options - Additional filtering options
	     * @returns Array of pending message details
	     * @see https://redis.io/commands/xpending/
	     */
	    parseCommand(parser, key, group, start, end, count, options) {
	        parser.push('XPENDING');
	        parser.pushKey(key);
	        parser.push(group);
	        if (options?.IDLE !== undefined) {
	            parser.push('IDLE', options.IDLE.toString());
	        }
	        parser.push(start, end, count.toString());
	        if (options?.consumer) {
	            parser.push(options.consumer);
	        }
	    },
	    /**
	     * Transforms the raw XPENDING RANGE reply into a structured array of message details
	     *
	     * @param reply - Raw reply from Redis
	     * @returns Array of objects containing message ID, consumer, idle time, and delivery count
	     */
	    transformReply(reply) {
	        return reply.map(pending => {
	            const unwrapped = pending;
	            return {
	                id: unwrapped[0],
	                consumer: unwrapped[1],
	                millisecondsSinceLastDelivery: unwrapped[2],
	                deliveriesCounter: unwrapped[3]
	            };
	        });
	    }
	};
	
	return XPENDING_RANGE;
}

var XPENDING = {};

var hasRequiredXPENDING;

function requireXPENDING () {
	if (hasRequiredXPENDING) return XPENDING;
	hasRequiredXPENDING = 1;
	Object.defineProperty(XPENDING, "__esModule", { value: true });
	XPENDING.default = {
	    CACHEABLE: true,
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the XPENDING command to inspect pending messages of a consumer group
	     *
	     * @param parser - The command parser
	     * @param key - The stream key
	     * @param group - Name of the consumer group
	     * @returns Summary of pending messages including total count, ID range, and per-consumer stats
	     * @see https://redis.io/commands/xpending/
	     */
	    parseCommand(parser, key, group) {
	        parser.push('XPENDING');
	        parser.pushKey(key);
	        parser.push(group);
	    },
	    /**
	     * Transforms the raw XPENDING reply into a structured object
	     *
	     * @param reply - Raw reply from Redis
	     * @returns Object containing pending count, ID range, and consumer statistics
	     */
	    transformReply(reply) {
	        const consumers = reply[3];
	        return {
	            pending: reply[0],
	            firstId: reply[1],
	            lastId: reply[2],
	            consumers: consumers === null ? null : consumers.map(consumer => {
	                const [name, deliveriesCounter] = consumer;
	                return {
	                    name,
	                    deliveriesCounter: Number(deliveriesCounter)
	                };
	            })
	        };
	    }
	};
	
	return XPENDING;
}

var XRANGE = {};

var hasRequiredXRANGE;

function requireXRANGE () {
	if (hasRequiredXRANGE) return XRANGE;
	hasRequiredXRANGE = 1;
	Object.defineProperty(XRANGE, "__esModule", { value: true });
	XRANGE.xRangeArguments = void 0;
	const generic_transformers_1 = requireGenericTransformers();
	/**
	 * Helper function to build XRANGE command arguments
	 *
	 * @param start - Start of ID range (use '-' for minimum ID)
	 * @param end - End of ID range (use '+' for maximum ID)
	 * @param options - Additional options for the range query
	 * @returns Array of arguments for the XRANGE command
	 */
	function xRangeArguments(start, end, options) {
	    const args = [start, end];
	    if (options?.COUNT) {
	        args.push('COUNT', options.COUNT.toString());
	    }
	    return args;
	}
	XRANGE.xRangeArguments = xRangeArguments;
	XRANGE.default = {
	    CACHEABLE: true,
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the XRANGE command to read stream entries in a specific range
	     *
	     * @param parser - The command parser
	     * @param key - The stream key
	     * @param args - Arguments tuple containing start ID, end ID, and options
	     * @returns Array of messages in the specified range
	     * @see https://redis.io/commands/xrange/
	     */
	    parseCommand(parser, key, ...args) {
	        parser.push('XRANGE');
	        parser.pushKey(key);
	        parser.pushVariadic(xRangeArguments(args[0], args[1], args[2]));
	    },
	    /**
	     * Transforms the raw XRANGE reply into structured message objects
	     *
	     * @param reply - Raw reply from Redis
	     * @param preserve - Preserve options (unused)
	     * @param typeMapping - Type mapping for message fields
	     * @returns Array of structured message objects
	     */
	    transformReply(reply, preserve, typeMapping) {
	        return reply.map(generic_transformers_1.transformStreamMessageReply.bind(undefined, typeMapping));
	    }
	};
	
	return XRANGE;
}

var XREAD = {};

var hasRequiredXREAD;

function requireXREAD () {
	if (hasRequiredXREAD) return XREAD;
	hasRequiredXREAD = 1;
	Object.defineProperty(XREAD, "__esModule", { value: true });
	XREAD.pushXReadStreams = void 0;
	const generic_transformers_1 = requireGenericTransformers();
	/**
	 * Helper function to push stream keys and IDs to the command parser
	 *
	 * @param parser - The command parser
	 * @param streams - Single stream or array of streams to read from
	 */
	function pushXReadStreams(parser, streams) {
	    parser.push('STREAMS');
	    if (Array.isArray(streams)) {
	        for (let i = 0; i < streams.length; i++) {
	            parser.pushKey(streams[i].key);
	        }
	        for (let i = 0; i < streams.length; i++) {
	            parser.push(streams[i].id);
	        }
	    }
	    else {
	        parser.pushKey(streams.key);
	        parser.push(streams.id);
	    }
	}
	XREAD.pushXReadStreams = pushXReadStreams;
	XREAD.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the XREAD command to read messages from one or more streams
	     *
	     * @param parser - The command parser
	     * @param streams - Single stream or array of streams to read from
	     * @param options - Additional options for reading streams
	     * @returns Array of stream entries, each containing the stream name and its messages
	     * @see https://redis.io/commands/xread/
	     */
	    parseCommand(parser, streams, options) {
	        parser.push('XREAD');
	        if (options?.COUNT) {
	            parser.push('COUNT', options.COUNT.toString());
	        }
	        if (options?.BLOCK !== undefined) {
	            parser.push('BLOCK', options.BLOCK.toString());
	        }
	        pushXReadStreams(parser, streams);
	    },
	    /**
	     * Transform functions for different RESP versions
	     */
	    transformReply: {
	        2: generic_transformers_1.transformStreamsMessagesReplyResp2,
	        3: undefined
	    },
	    unstableResp3: true
	};
	
	return XREAD;
}

var XREADGROUP = {};

var hasRequiredXREADGROUP;

function requireXREADGROUP () {
	if (hasRequiredXREADGROUP) return XREADGROUP;
	hasRequiredXREADGROUP = 1;
	Object.defineProperty(XREADGROUP, "__esModule", { value: true });
	const XREAD_1 = requireXREAD();
	const generic_transformers_1 = requireGenericTransformers();
	XREADGROUP.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the XREADGROUP command to read messages from streams as a consumer group member
	     *
	     * @param parser - The command parser
	     * @param group - Name of the consumer group
	     * @param consumer - Name of the consumer in the group
	     * @param streams - Single stream or array of streams to read from
	     * @param options - Additional options for reading streams
	     * @returns Array of stream entries, each containing the stream name and its messages
	     * @see https://redis.io/commands/xreadgroup/
	     */
	    parseCommand(parser, group, consumer, streams, options) {
	        parser.push('XREADGROUP', 'GROUP', group, consumer);
	        if (options?.COUNT !== undefined) {
	            parser.push('COUNT', options.COUNT.toString());
	        }
	        if (options?.BLOCK !== undefined) {
	            parser.push('BLOCK', options.BLOCK.toString());
	        }
	        if (options?.NOACK) {
	            parser.push('NOACK');
	        }
	        (0, XREAD_1.pushXReadStreams)(parser, streams);
	    },
	    /**
	     * Transform functions for different RESP versions
	     */
	    transformReply: {
	        2: generic_transformers_1.transformStreamsMessagesReplyResp2,
	        3: undefined
	    },
	    unstableResp3: true,
	};
	
	return XREADGROUP;
}

var XREVRANGE = {};

var hasRequiredXREVRANGE;

function requireXREVRANGE () {
	if (hasRequiredXREVRANGE) return XREVRANGE;
	hasRequiredXREVRANGE = 1;
	var __createBinding = (XREVRANGE && XREVRANGE.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (XREVRANGE && XREVRANGE.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar = (XREVRANGE && XREVRANGE.__importStar) || function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
	    __setModuleDefault(result, mod);
	    return result;
	};
	Object.defineProperty(XREVRANGE, "__esModule", { value: true });
	const XRANGE_1 = __importStar(requireXRANGE());
	/**
	 * Command for reading stream entries in reverse order
	 */
	XREVRANGE.default = {
	    CACHEABLE: XRANGE_1.default.CACHEABLE,
	    IS_READ_ONLY: XRANGE_1.default.IS_READ_ONLY,
	    /**
	     * Constructs the XREVRANGE command to read stream entries in reverse order
	     *
	     * @param parser - The command parser
	     * @param key - The stream key
	     * @param args - Arguments tuple containing start ID, end ID, and options
	     * @returns Array of messages in the specified range in reverse order
	     * @see https://redis.io/commands/xrevrange/
	     */
	    parseCommand(parser, key, ...args) {
	        parser.push('XREVRANGE');
	        parser.pushKey(key);
	        parser.pushVariadic((0, XRANGE_1.xRangeArguments)(args[0], args[1], args[2]));
	    },
	    transformReply: XRANGE_1.default.transformReply
	};
	
	return XREVRANGE;
}

var XSETID = {};

var hasRequiredXSETID;

function requireXSETID () {
	if (hasRequiredXSETID) return XSETID;
	hasRequiredXSETID = 1;
	Object.defineProperty(XSETID, "__esModule", { value: true });
	XSETID.default = {
	    IS_READ_ONLY: false,
	    parseCommand(parser, key, lastId, options) {
	        parser.push('XSETID');
	        parser.pushKey(key);
	        parser.push(lastId);
	        if (options?.ENTRIESADDED) {
	            parser.push('ENTRIESADDED', options.ENTRIESADDED.toString());
	        }
	        if (options?.MAXDELETEDID) {
	            parser.push('MAXDELETEDID', options.MAXDELETEDID);
	        }
	    },
	    transformReply: undefined
	};
	
	return XSETID;
}

var XTRIM = {};

var hasRequiredXTRIM;

function requireXTRIM () {
	if (hasRequiredXTRIM) return XTRIM;
	hasRequiredXTRIM = 1;
	Object.defineProperty(XTRIM, "__esModule", { value: true });
	/**
	 * Command for trimming a stream to a specified length or minimum ID
	 */
	XTRIM.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Constructs the XTRIM command to trim a stream by length or minimum ID
	     *
	     * @param parser - The command parser
	     * @param key - The stream key
	     * @param strategy - Trim by maximum length (MAXLEN) or minimum ID (MINID)
	     * @param threshold - Maximum length or minimum ID threshold
	     * @param options - Additional options for trimming
	     * @returns Number of entries removed from the stream
	     * @see https://redis.io/commands/xtrim/
	     */
	    parseCommand(parser, key, strategy, threshold, options) {
	        parser.push('XTRIM');
	        parser.pushKey(key);
	        parser.push(strategy);
	        if (options?.strategyModifier) {
	            parser.push(options.strategyModifier);
	        }
	        parser.push(threshold.toString());
	        if (options?.LIMIT) {
	            parser.push('LIMIT', options.LIMIT.toString());
	        }
	    },
	    transformReply: undefined
	};
	
	return XTRIM;
}

var ZADD_INCR = {};

var ZADD = {};

var hasRequiredZADD;

function requireZADD () {
	if (hasRequiredZADD) return ZADD;
	hasRequiredZADD = 1;
	Object.defineProperty(ZADD, "__esModule", { value: true });
	ZADD.pushMembers = void 0;
	const generic_transformers_1 = requireGenericTransformers();
	/**
	 * Command for adding members to a sorted set
	 */
	ZADD.default = {
	    /**
	     * Constructs the ZADD command to add one or more members to a sorted set
	     *
	     * @param parser - The command parser
	     * @param key - The sorted set key
	     * @param members - One or more members to add with their scores
	     * @param options - Additional options for adding members
	     * @returns Number of new members added (or changed members if CH is set)
	     * @see https://redis.io/commands/zadd/
	     */
	    parseCommand(parser, key, members, options) {
	        parser.push('ZADD');
	        parser.pushKey(key);
	        if (options?.condition) {
	            parser.push(options.condition);
	        }
	        else if (options?.NX) {
	            parser.push('NX');
	        }
	        else if (options?.XX) {
	            parser.push('XX');
	        }
	        if (options?.comparison) {
	            parser.push(options.comparison);
	        }
	        else if (options?.LT) {
	            parser.push('LT');
	        }
	        else if (options?.GT) {
	            parser.push('GT');
	        }
	        if (options?.CH) {
	            parser.push('CH');
	        }
	        pushMembers(parser, members);
	    },
	    transformReply: generic_transformers_1.transformDoubleReply
	};
	/**
	 * Helper function to push sorted set members to the command
	 *
	 * @param parser - The command parser
	 * @param members - One or more members with their scores
	 */
	function pushMembers(parser, members) {
	    if (Array.isArray(members)) {
	        for (const member of members) {
	            pushMember(parser, member);
	        }
	    }
	    else {
	        pushMember(parser, members);
	    }
	}
	ZADD.pushMembers = pushMembers;
	/**
	 * Helper function to push a single sorted set member to the command
	 *
	 * @param parser - The command parser
	 * @param member - Member with its score
	 */
	function pushMember(parser, member) {
	    parser.push((0, generic_transformers_1.transformDoubleArgument)(member.score), member.value);
	}
	
	return ZADD;
}

var hasRequiredZADD_INCR;

function requireZADD_INCR () {
	if (hasRequiredZADD_INCR) return ZADD_INCR;
	hasRequiredZADD_INCR = 1;
	Object.defineProperty(ZADD_INCR, "__esModule", { value: true });
	const ZADD_1 = requireZADD();
	const generic_transformers_1 = requireGenericTransformers();
	/**
	 * Command for incrementing the score of a member in a sorted set
	 */
	ZADD_INCR.default = {
	    /**
	     * Constructs the ZADD command with INCR option to increment the score of a member
	     *
	     * @param parser - The command parser
	     * @param key - The sorted set key
	     * @param members - Member(s) whose score to increment
	     * @param options - Additional options for the increment operation
	     * @returns The new score of the member after increment (null if member does not exist with XX option)
	     * @see https://redis.io/commands/zadd/
	     */
	    parseCommand(parser, key, members, options) {
	        parser.push('ZADD');
	        parser.pushKey(key);
	        if (options?.condition) {
	            parser.push(options.condition);
	        }
	        if (options?.comparison) {
	            parser.push(options.comparison);
	        }
	        if (options?.CH) {
	            parser.push('CH');
	        }
	        parser.push('INCR');
	        (0, ZADD_1.pushMembers)(parser, members);
	    },
	    transformReply: generic_transformers_1.transformNullableDoubleReply
	};
	
	return ZADD_INCR;
}

var ZCARD = {};

var hasRequiredZCARD;

function requireZCARD () {
	if (hasRequiredZCARD) return ZCARD;
	hasRequiredZCARD = 1;
	Object.defineProperty(ZCARD, "__esModule", { value: true });
	/**
	 * Command for getting the number of members in a sorted set
	 */
	ZCARD.default = {
	    CACHEABLE: true,
	    IS_READ_ONLY: true,
	    /**
	     * Constructs the ZCARD command to get the cardinality (number of members) of a sorted set
	     *
	     * @param parser - The command parser
	     * @param key - The sorted set key
	     * @returns Number of members in the sorted set
	     * @see https://redis.io/commands/zcard/
	     */
	    parseCommand(parser, key) {
	        parser.push('ZCARD');
	        parser.pushKey(key);
	    },
	    transformReply: undefined
	};
	
	return ZCARD;
}

var ZCOUNT = {};

var hasRequiredZCOUNT;

function requireZCOUNT () {
	if (hasRequiredZCOUNT) return ZCOUNT;
	hasRequiredZCOUNT = 1;
	Object.defineProperty(ZCOUNT, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	ZCOUNT.default = {
	    CACHEABLE: true,
	    IS_READ_ONLY: true,
	    /**
	     * Returns the number of elements in the sorted set with a score between min and max.
	     * @param parser - The Redis command parser.
	     * @param key - Key of the sorted set.
	     * @param min - Minimum score to count from (inclusive).
	     * @param max - Maximum score to count to (inclusive).
	     */
	    parseCommand(parser, key, min, max) {
	        parser.push('ZCOUNT');
	        parser.pushKey(key);
	        parser.push((0, generic_transformers_1.transformStringDoubleArgument)(min), (0, generic_transformers_1.transformStringDoubleArgument)(max));
	    },
	    transformReply: undefined
	};
	
	return ZCOUNT;
}

var ZDIFF_WITHSCORES = {};

var ZDIFF = {};

var hasRequiredZDIFF;

function requireZDIFF () {
	if (hasRequiredZDIFF) return ZDIFF;
	hasRequiredZDIFF = 1;
	Object.defineProperty(ZDIFF, "__esModule", { value: true });
	ZDIFF.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Returns the difference between the first sorted set and all the successive sorted sets.
	     * @param parser - The Redis command parser.
	     * @param keys - Keys of the sorted sets.
	     */
	    parseCommand(parser, keys) {
	        parser.push('ZDIFF');
	        parser.pushKeysLength(keys);
	    },
	    transformReply: undefined
	};
	
	return ZDIFF;
}

var hasRequiredZDIFF_WITHSCORES;

function requireZDIFF_WITHSCORES () {
	if (hasRequiredZDIFF_WITHSCORES) return ZDIFF_WITHSCORES;
	hasRequiredZDIFF_WITHSCORES = 1;
	var __importDefault = (ZDIFF_WITHSCORES && ZDIFF_WITHSCORES.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(ZDIFF_WITHSCORES, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	const ZDIFF_1 = __importDefault(requireZDIFF());
	ZDIFF_WITHSCORES.default = {
	    IS_READ_ONLY: ZDIFF_1.default.IS_READ_ONLY,
	    /**
	     * Returns the difference between the first sorted set and all successive sorted sets with their scores.
	     * @param parser - The Redis command parser.
	     * @param keys - Keys of the sorted sets.
	     */
	    parseCommand(parser, keys) {
	        ZDIFF_1.default.parseCommand(parser, keys);
	        parser.push('WITHSCORES');
	    },
	    transformReply: generic_transformers_1.transformSortedSetReply
	};
	
	return ZDIFF_WITHSCORES;
}

var ZDIFFSTORE = {};

var hasRequiredZDIFFSTORE;

function requireZDIFFSTORE () {
	if (hasRequiredZDIFFSTORE) return ZDIFFSTORE;
	hasRequiredZDIFFSTORE = 1;
	Object.defineProperty(ZDIFFSTORE, "__esModule", { value: true });
	ZDIFFSTORE.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Computes the difference between the first and all successive sorted sets and stores it in a new key.
	     * @param parser - The Redis command parser.
	     * @param destination - Destination key where the result will be stored.
	     * @param inputKeys - Keys of the sorted sets to find the difference between.
	     */
	    parseCommand(parser, destination, inputKeys) {
	        parser.push('ZDIFFSTORE');
	        parser.pushKey(destination);
	        parser.pushKeysLength(inputKeys);
	    },
	    transformReply: undefined
	};
	
	return ZDIFFSTORE;
}

var ZINCRBY = {};

var hasRequiredZINCRBY;

function requireZINCRBY () {
	if (hasRequiredZINCRBY) return ZINCRBY;
	hasRequiredZINCRBY = 1;
	Object.defineProperty(ZINCRBY, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	ZINCRBY.default = {
	    /**
	     * Increments the score of a member in a sorted set by the specified increment.
	     * @param parser - The Redis command parser.
	     * @param key - Key of the sorted set.
	     * @param increment - Value to increment the score by.
	     * @param member - Member whose score should be incremented.
	     */
	    parseCommand(parser, key, increment, member) {
	        parser.push('ZINCRBY');
	        parser.pushKey(key);
	        parser.push((0, generic_transformers_1.transformDoubleArgument)(increment), member);
	    },
	    transformReply: generic_transformers_1.transformDoubleReply
	};
	
	return ZINCRBY;
}

var ZINTER_WITHSCORES = {};

var ZINTER = {};

var hasRequiredZINTER;

function requireZINTER () {
	if (hasRequiredZINTER) return ZINTER;
	hasRequiredZINTER = 1;
	Object.defineProperty(ZINTER, "__esModule", { value: true });
	ZINTER.parseZInterArguments = void 0;
	const generic_transformers_1 = requireGenericTransformers();
	function parseZInterArguments(parser, keys, options) {
	    (0, generic_transformers_1.parseZKeysArguments)(parser, keys);
	    if (options?.AGGREGATE) {
	        parser.push('AGGREGATE', options.AGGREGATE);
	    }
	}
	ZINTER.parseZInterArguments = parseZInterArguments;
	ZINTER.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Intersects multiple sorted sets and returns the result as a new sorted set.
	     * @param parser - The Redis command parser.
	     * @param keys - Keys of the sorted sets to intersect.
	     * @param options - Optional parameters for the intersection operation.
	     */
	    parseCommand(parser, keys, options) {
	        parser.push('ZINTER');
	        parseZInterArguments(parser, keys, options);
	    },
	    transformReply: undefined
	};
	
	return ZINTER;
}

var hasRequiredZINTER_WITHSCORES;

function requireZINTER_WITHSCORES () {
	if (hasRequiredZINTER_WITHSCORES) return ZINTER_WITHSCORES;
	hasRequiredZINTER_WITHSCORES = 1;
	var __importDefault = (ZINTER_WITHSCORES && ZINTER_WITHSCORES.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(ZINTER_WITHSCORES, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	const ZINTER_1 = __importDefault(requireZINTER());
	ZINTER_WITHSCORES.default = {
	    IS_READ_ONLY: ZINTER_1.default.IS_READ_ONLY,
	    /**
	     * Intersects multiple sorted sets and returns the result with scores.
	     * @param args - Same parameters as ZINTER command.
	     */
	    parseCommand(...args) {
	        ZINTER_1.default.parseCommand(...args);
	        args[0].push('WITHSCORES');
	    },
	    transformReply: generic_transformers_1.transformSortedSetReply
	};
	
	return ZINTER_WITHSCORES;
}

var ZINTERCARD = {};

var hasRequiredZINTERCARD;

function requireZINTERCARD () {
	if (hasRequiredZINTERCARD) return ZINTERCARD;
	hasRequiredZINTERCARD = 1;
	Object.defineProperty(ZINTERCARD, "__esModule", { value: true });
	ZINTERCARD.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Returns the cardinality of the intersection of multiple sorted sets.
	     * @param parser - The Redis command parser.
	     * @param keys - Keys of the sorted sets to intersect.
	     * @param options - Limit option or options object with limit.
	     */
	    parseCommand(parser, keys, options) {
	        parser.push('ZINTERCARD');
	        parser.pushKeysLength(keys);
	        // backwards compatibility
	        if (typeof options === 'number') {
	            parser.push('LIMIT', options.toString());
	        }
	        else if (options?.LIMIT) {
	            parser.push('LIMIT', options.LIMIT.toString());
	        }
	    },
	    transformReply: undefined
	};
	
	return ZINTERCARD;
}

var ZINTERSTORE = {};

var hasRequiredZINTERSTORE;

function requireZINTERSTORE () {
	if (hasRequiredZINTERSTORE) return ZINTERSTORE;
	hasRequiredZINTERSTORE = 1;
	Object.defineProperty(ZINTERSTORE, "__esModule", { value: true });
	const ZINTER_1 = requireZINTER();
	ZINTERSTORE.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Stores the result of intersection of multiple sorted sets in a new sorted set.
	     * @param parser - The Redis command parser.
	     * @param destination - Destination key where the result will be stored.
	     * @param keys - Keys of the sorted sets to intersect.
	     * @param options - Optional parameters for the intersection operation.
	     */
	    parseCommand(parser, destination, keys, options) {
	        parser.push('ZINTERSTORE');
	        parser.pushKey(destination);
	        (0, ZINTER_1.parseZInterArguments)(parser, keys, options);
	    },
	    transformReply: undefined
	};
	
	return ZINTERSTORE;
}

var ZLEXCOUNT = {};

var hasRequiredZLEXCOUNT;

function requireZLEXCOUNT () {
	if (hasRequiredZLEXCOUNT) return ZLEXCOUNT;
	hasRequiredZLEXCOUNT = 1;
	Object.defineProperty(ZLEXCOUNT, "__esModule", { value: true });
	ZLEXCOUNT.default = {
	    CACHEABLE: true,
	    IS_READ_ONLY: true,
	    /**
	     * Returns the number of elements in the sorted set between the lexicographical range specified by min and max.
	     * @param parser - The Redis command parser.
	     * @param key - Key of the sorted set.
	     * @param min - Minimum lexicographical value (inclusive).
	     * @param max - Maximum lexicographical value (inclusive).
	     */
	    parseCommand(parser, key, min, max) {
	        parser.push('ZLEXCOUNT');
	        parser.pushKey(key);
	        parser.push(min);
	        parser.push(max);
	    },
	    transformReply: undefined
	};
	
	return ZLEXCOUNT;
}

var ZMSCORE = {};

var hasRequiredZMSCORE;

function requireZMSCORE () {
	if (hasRequiredZMSCORE) return ZMSCORE;
	hasRequiredZMSCORE = 1;
	Object.defineProperty(ZMSCORE, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	ZMSCORE.default = {
	    CACHEABLE: true,
	    IS_READ_ONLY: true,
	    /**
	     * Returns the scores associated with the specified members in the sorted set stored at key.
	     * @param parser - The Redis command parser.
	     * @param key - Key of the sorted set.
	     * @param member - One or more members to get scores for.
	     */
	    parseCommand(parser, key, member) {
	        parser.push('ZMSCORE');
	        parser.pushKey(key);
	        parser.pushVariadic(member);
	    },
	    transformReply: {
	        2: (reply, preserve, typeMapping) => {
	            return reply.map((0, generic_transformers_1.createTransformNullableDoubleReplyResp2Func)(preserve, typeMapping));
	        },
	        3: undefined
	    }
	};
	
	return ZMSCORE;
}

var ZPOPMAX_COUNT = {};

var hasRequiredZPOPMAX_COUNT;

function requireZPOPMAX_COUNT () {
	if (hasRequiredZPOPMAX_COUNT) return ZPOPMAX_COUNT;
	hasRequiredZPOPMAX_COUNT = 1;
	Object.defineProperty(ZPOPMAX_COUNT, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	ZPOPMAX_COUNT.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Removes and returns up to count members with the highest scores in the sorted set.
	     * @param parser - The Redis command parser.
	     * @param key - Key of the sorted set.
	     * @param count - Number of members to pop.
	     */
	    parseCommand(parser, key, count) {
	        parser.push('ZPOPMAX');
	        parser.pushKey(key);
	        parser.push(count.toString());
	    },
	    transformReply: generic_transformers_1.transformSortedSetReply
	};
	
	return ZPOPMAX_COUNT;
}

var ZPOPMAX = {};

var hasRequiredZPOPMAX;

function requireZPOPMAX () {
	if (hasRequiredZPOPMAX) return ZPOPMAX;
	hasRequiredZPOPMAX = 1;
	Object.defineProperty(ZPOPMAX, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	ZPOPMAX.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Removes and returns the member with the highest score in the sorted set.
	     * @param parser - The Redis command parser.
	     * @param key - Key of the sorted set.
	     */
	    parseCommand(parser, key) {
	        parser.push('ZPOPMAX');
	        parser.pushKey(key);
	    },
	    transformReply: {
	        2: (reply, preserve, typeMapping) => {
	            if (reply.length === 0)
	                return null;
	            return {
	                value: reply[0],
	                score: generic_transformers_1.transformDoubleReply[2](reply[1], preserve, typeMapping),
	            };
	        },
	        3: (reply) => {
	            if (reply.length === 0)
	                return null;
	            return {
	                value: reply[0],
	                score: reply[1]
	            };
	        }
	    }
	};
	
	return ZPOPMAX;
}

var ZPOPMIN_COUNT = {};

var hasRequiredZPOPMIN_COUNT;

function requireZPOPMIN_COUNT () {
	if (hasRequiredZPOPMIN_COUNT) return ZPOPMIN_COUNT;
	hasRequiredZPOPMIN_COUNT = 1;
	Object.defineProperty(ZPOPMIN_COUNT, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	ZPOPMIN_COUNT.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Removes and returns up to count members with the lowest scores in the sorted set.
	     * @param parser - The Redis command parser.
	     * @param key - Key of the sorted set.
	     * @param count - Number of members to pop.
	     */
	    parseCommand(parser, key, count) {
	        parser.push('ZPOPMIN');
	        parser.pushKey(key);
	        parser.push(count.toString());
	    },
	    transformReply: generic_transformers_1.transformSortedSetReply
	};
	
	return ZPOPMIN_COUNT;
}

var ZPOPMIN = {};

var hasRequiredZPOPMIN;

function requireZPOPMIN () {
	if (hasRequiredZPOPMIN) return ZPOPMIN;
	hasRequiredZPOPMIN = 1;
	var __importDefault = (ZPOPMIN && ZPOPMIN.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(ZPOPMIN, "__esModule", { value: true });
	const ZPOPMAX_1 = __importDefault(requireZPOPMAX());
	ZPOPMIN.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Removes and returns the member with the lowest score in the sorted set.
	     * @param parser - The Redis command parser.
	     * @param key - Key of the sorted set.
	     */
	    parseCommand(parser, key) {
	        parser.push('ZPOPMIN');
	        parser.pushKey(key);
	    },
	    transformReply: ZPOPMAX_1.default.transformReply
	};
	
	return ZPOPMIN;
}

var ZRANDMEMBER_COUNT_WITHSCORES = {};

var ZRANDMEMBER_COUNT = {};

var ZRANDMEMBER = {};

var hasRequiredZRANDMEMBER;

function requireZRANDMEMBER () {
	if (hasRequiredZRANDMEMBER) return ZRANDMEMBER;
	hasRequiredZRANDMEMBER = 1;
	Object.defineProperty(ZRANDMEMBER, "__esModule", { value: true });
	ZRANDMEMBER.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Returns a random member from a sorted set.
	     * @param parser - The Redis command parser.
	     * @param key - Key of the sorted set.
	     */
	    parseCommand(parser, key) {
	        parser.push('ZRANDMEMBER');
	        parser.pushKey(key);
	    },
	    transformReply: undefined
	};
	
	return ZRANDMEMBER;
}

var hasRequiredZRANDMEMBER_COUNT;

function requireZRANDMEMBER_COUNT () {
	if (hasRequiredZRANDMEMBER_COUNT) return ZRANDMEMBER_COUNT;
	hasRequiredZRANDMEMBER_COUNT = 1;
	var __importDefault = (ZRANDMEMBER_COUNT && ZRANDMEMBER_COUNT.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(ZRANDMEMBER_COUNT, "__esModule", { value: true });
	const ZRANDMEMBER_1 = __importDefault(requireZRANDMEMBER());
	ZRANDMEMBER_COUNT.default = {
	    IS_READ_ONLY: ZRANDMEMBER_1.default.IS_READ_ONLY,
	    /**
	     * Returns one or more random members from a sorted set.
	     * @param parser - The Redis command parser.
	     * @param key - Key of the sorted set.
	     * @param count - Number of members to return.
	     */
	    parseCommand(parser, key, count) {
	        ZRANDMEMBER_1.default.parseCommand(parser, key);
	        parser.push(count.toString());
	    },
	    transformReply: undefined
	};
	
	return ZRANDMEMBER_COUNT;
}

var hasRequiredZRANDMEMBER_COUNT_WITHSCORES;

function requireZRANDMEMBER_COUNT_WITHSCORES () {
	if (hasRequiredZRANDMEMBER_COUNT_WITHSCORES) return ZRANDMEMBER_COUNT_WITHSCORES;
	hasRequiredZRANDMEMBER_COUNT_WITHSCORES = 1;
	var __importDefault = (ZRANDMEMBER_COUNT_WITHSCORES && ZRANDMEMBER_COUNT_WITHSCORES.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(ZRANDMEMBER_COUNT_WITHSCORES, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	const ZRANDMEMBER_COUNT_1 = __importDefault(requireZRANDMEMBER_COUNT());
	ZRANDMEMBER_COUNT_WITHSCORES.default = {
	    IS_READ_ONLY: ZRANDMEMBER_COUNT_1.default.IS_READ_ONLY,
	    /**
	     * Returns one or more random members with their scores from a sorted set.
	     * @param parser - The Redis command parser.
	     * @param key - Key of the sorted set.
	     * @param count - Number of members to return.
	     */
	    parseCommand(parser, key, count) {
	        ZRANDMEMBER_COUNT_1.default.parseCommand(parser, key, count);
	        parser.push('WITHSCORES');
	    },
	    transformReply: generic_transformers_1.transformSortedSetReply
	};
	
	return ZRANDMEMBER_COUNT_WITHSCORES;
}

var ZRANGE_WITHSCORES = {};

var ZRANGE = {};

var hasRequiredZRANGE;

function requireZRANGE () {
	if (hasRequiredZRANGE) return ZRANGE;
	hasRequiredZRANGE = 1;
	Object.defineProperty(ZRANGE, "__esModule", { value: true });
	ZRANGE.zRangeArgument = void 0;
	const generic_transformers_1 = requireGenericTransformers();
	function zRangeArgument(min, max, options) {
	    const args = [
	        (0, generic_transformers_1.transformStringDoubleArgument)(min),
	        (0, generic_transformers_1.transformStringDoubleArgument)(max)
	    ];
	    switch (options?.BY) {
	        case 'SCORE':
	            args.push('BYSCORE');
	            break;
	        case 'LEX':
	            args.push('BYLEX');
	            break;
	    }
	    if (options?.REV) {
	        args.push('REV');
	    }
	    if (options?.LIMIT) {
	        args.push('LIMIT', options.LIMIT.offset.toString(), options.LIMIT.count.toString());
	    }
	    return args;
	}
	ZRANGE.zRangeArgument = zRangeArgument;
	ZRANGE.default = {
	    CACHEABLE: true,
	    IS_READ_ONLY: true,
	    /**
	     * Returns the specified range of elements in the sorted set.
	     * @param parser - The Redis command parser.
	     * @param key - Key of the sorted set.
	     * @param min - Minimum index, score or lexicographical value.
	     * @param max - Maximum index, score or lexicographical value.
	     * @param options - Optional parameters for range retrieval (BY, REV, LIMIT).
	     */
	    parseCommand(parser, key, min, max, options) {
	        parser.push('ZRANGE');
	        parser.pushKey(key);
	        parser.pushVariadic(zRangeArgument(min, max, options));
	    },
	    transformReply: undefined
	};
	
	return ZRANGE;
}

var hasRequiredZRANGE_WITHSCORES;

function requireZRANGE_WITHSCORES () {
	if (hasRequiredZRANGE_WITHSCORES) return ZRANGE_WITHSCORES;
	hasRequiredZRANGE_WITHSCORES = 1;
	var __importDefault = (ZRANGE_WITHSCORES && ZRANGE_WITHSCORES.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(ZRANGE_WITHSCORES, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	const ZRANGE_1 = __importDefault(requireZRANGE());
	ZRANGE_WITHSCORES.default = {
	    CACHEABLE: ZRANGE_1.default.CACHEABLE,
	    IS_READ_ONLY: ZRANGE_1.default.IS_READ_ONLY,
	    /**
	     * Returns the specified range of elements in the sorted set with their scores.
	     * @param args - Same parameters as the ZRANGE command.
	     */
	    parseCommand(...args) {
	        const parser = args[0];
	        ZRANGE_1.default.parseCommand(...args);
	        parser.push('WITHSCORES');
	    },
	    transformReply: generic_transformers_1.transformSortedSetReply
	};
	
	return ZRANGE_WITHSCORES;
}

var ZRANGEBYLEX = {};

var hasRequiredZRANGEBYLEX;

function requireZRANGEBYLEX () {
	if (hasRequiredZRANGEBYLEX) return ZRANGEBYLEX;
	hasRequiredZRANGEBYLEX = 1;
	Object.defineProperty(ZRANGEBYLEX, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	ZRANGEBYLEX.default = {
	    CACHEABLE: true,
	    IS_READ_ONLY: true,
	    /**
	     * Returns all the elements in the sorted set at key with a lexicographical value between min and max.
	     * @param parser - The Redis command parser.
	     * @param key - Key of the sorted set.
	     * @param min - Minimum lexicographical value.
	     * @param max - Maximum lexicographical value.
	     * @param options - Optional parameters including LIMIT.
	     */
	    parseCommand(parser, key, min, max, options) {
	        parser.push('ZRANGEBYLEX');
	        parser.pushKey(key);
	        parser.push((0, generic_transformers_1.transformStringDoubleArgument)(min), (0, generic_transformers_1.transformStringDoubleArgument)(max));
	        if (options?.LIMIT) {
	            parser.push('LIMIT', options.LIMIT.offset.toString(), options.LIMIT.count.toString());
	        }
	    },
	    transformReply: undefined
	};
	
	return ZRANGEBYLEX;
}

var ZRANGEBYSCORE_WITHSCORES = {};

var ZRANGEBYSCORE = {};

var hasRequiredZRANGEBYSCORE;

function requireZRANGEBYSCORE () {
	if (hasRequiredZRANGEBYSCORE) return ZRANGEBYSCORE;
	hasRequiredZRANGEBYSCORE = 1;
	Object.defineProperty(ZRANGEBYSCORE, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	ZRANGEBYSCORE.default = {
	    CACHEABLE: true,
	    IS_READ_ONLY: true,
	    /**
	     * Returns all the elements in the sorted set with a score between min and max.
	     * @param parser - The Redis command parser.
	     * @param key - Key of the sorted set.
	     * @param min - Minimum score.
	     * @param max - Maximum score.
	     * @param options - Optional parameters including LIMIT.
	     */
	    parseCommand(parser, key, min, max, options) {
	        parser.push('ZRANGEBYSCORE');
	        parser.pushKey(key);
	        parser.push((0, generic_transformers_1.transformStringDoubleArgument)(min), (0, generic_transformers_1.transformStringDoubleArgument)(max));
	        if (options?.LIMIT) {
	            parser.push('LIMIT', options.LIMIT.offset.toString(), options.LIMIT.count.toString());
	        }
	    },
	    transformReply: undefined
	};
	
	return ZRANGEBYSCORE;
}

var hasRequiredZRANGEBYSCORE_WITHSCORES;

function requireZRANGEBYSCORE_WITHSCORES () {
	if (hasRequiredZRANGEBYSCORE_WITHSCORES) return ZRANGEBYSCORE_WITHSCORES;
	hasRequiredZRANGEBYSCORE_WITHSCORES = 1;
	var __importDefault = (ZRANGEBYSCORE_WITHSCORES && ZRANGEBYSCORE_WITHSCORES.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(ZRANGEBYSCORE_WITHSCORES, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	const ZRANGEBYSCORE_1 = __importDefault(requireZRANGEBYSCORE());
	ZRANGEBYSCORE_WITHSCORES.default = {
	    CACHEABLE: ZRANGEBYSCORE_1.default.CACHEABLE,
	    IS_READ_ONLY: ZRANGEBYSCORE_1.default.IS_READ_ONLY,
	    /**
	     * Returns all the elements in the sorted set with a score between min and max, with their scores.
	     * @param args - Same parameters as the ZRANGEBYSCORE command.
	     */
	    parseCommand(...args) {
	        const parser = args[0];
	        ZRANGEBYSCORE_1.default.parseCommand(...args);
	        parser.push('WITHSCORES');
	    },
	    transformReply: generic_transformers_1.transformSortedSetReply
	};
	
	return ZRANGEBYSCORE_WITHSCORES;
}

var ZRANGESTORE = {};

var hasRequiredZRANGESTORE;

function requireZRANGESTORE () {
	if (hasRequiredZRANGESTORE) return ZRANGESTORE;
	hasRequiredZRANGESTORE = 1;
	Object.defineProperty(ZRANGESTORE, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	ZRANGESTORE.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Stores the result of a range operation on a sorted set into a new sorted set.
	     * @param parser - The Redis command parser.
	     * @param destination - Destination key where the result will be stored.
	     * @param source - Key of the source sorted set.
	     * @param min - Minimum index, score or lexicographical value.
	     * @param max - Maximum index, score or lexicographical value.
	     * @param options - Optional parameters for the range operation (BY, REV, LIMIT).
	     */
	    parseCommand(parser, destination, source, min, max, options) {
	        parser.push('ZRANGESTORE');
	        parser.pushKey(destination);
	        parser.pushKey(source);
	        parser.push((0, generic_transformers_1.transformStringDoubleArgument)(min), (0, generic_transformers_1.transformStringDoubleArgument)(max));
	        switch (options?.BY) {
	            case 'SCORE':
	                parser.push('BYSCORE');
	                break;
	            case 'LEX':
	                parser.push('BYLEX');
	                break;
	        }
	        if (options?.REV) {
	            parser.push('REV');
	        }
	        if (options?.LIMIT) {
	            parser.push('LIMIT', options.LIMIT.offset.toString(), options.LIMIT.count.toString());
	        }
	    },
	    transformReply: undefined
	};
	
	return ZRANGESTORE;
}

var ZREMRANGEBYSCORE = {};

var hasRequiredZREMRANGEBYSCORE;

function requireZREMRANGEBYSCORE () {
	if (hasRequiredZREMRANGEBYSCORE) return ZREMRANGEBYSCORE;
	hasRequiredZREMRANGEBYSCORE = 1;
	Object.defineProperty(ZREMRANGEBYSCORE, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	ZREMRANGEBYSCORE.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Removes all elements in the sorted set with scores between min and max.
	     * @param parser - The Redis command parser.
	     * @param key - Key of the sorted set.
	     * @param min - Minimum score.
	     * @param max - Maximum score.
	     */
	    parseCommand(parser, key, min, max) {
	        parser.push('ZREMRANGEBYSCORE');
	        parser.pushKey(key);
	        parser.push((0, generic_transformers_1.transformStringDoubleArgument)(min), (0, generic_transformers_1.transformStringDoubleArgument)(max));
	    },
	    transformReply: undefined
	};
	
	return ZREMRANGEBYSCORE;
}

var ZRANK_WITHSCORE = {};

var ZRANK = {};

var hasRequiredZRANK;

function requireZRANK () {
	if (hasRequiredZRANK) return ZRANK;
	hasRequiredZRANK = 1;
	Object.defineProperty(ZRANK, "__esModule", { value: true });
	ZRANK.default = {
	    CACHEABLE: true,
	    IS_READ_ONLY: true,
	    /**
	     * Returns the rank of a member in the sorted set, with scores ordered from low to high.
	     * @param parser - The Redis command parser.
	     * @param key - Key of the sorted set.
	     * @param member - Member to get the rank for.
	     */
	    parseCommand(parser, key, member) {
	        parser.push('ZRANK');
	        parser.pushKey(key);
	        parser.push(member);
	    },
	    transformReply: undefined
	};
	
	return ZRANK;
}

var hasRequiredZRANK_WITHSCORE;

function requireZRANK_WITHSCORE () {
	if (hasRequiredZRANK_WITHSCORE) return ZRANK_WITHSCORE;
	hasRequiredZRANK_WITHSCORE = 1;
	var __importDefault = (ZRANK_WITHSCORE && ZRANK_WITHSCORE.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(ZRANK_WITHSCORE, "__esModule", { value: true });
	const ZRANK_1 = __importDefault(requireZRANK());
	ZRANK_WITHSCORE.default = {
	    CACHEABLE: ZRANK_1.default.CACHEABLE,
	    IS_READ_ONLY: ZRANK_1.default.IS_READ_ONLY,
	    /**
	     * Returns the rank of a member in the sorted set with its score.
	     * @param args - Same parameters as the ZRANK command.
	     */
	    parseCommand(...args) {
	        const parser = args[0];
	        ZRANK_1.default.parseCommand(...args);
	        parser.push('WITHSCORE');
	    },
	    transformReply: {
	        2: (reply) => {
	            if (reply === null)
	                return null;
	            return {
	                rank: reply[0],
	                score: Number(reply[1])
	            };
	        },
	        3: (reply) => {
	            if (reply === null)
	                return null;
	            return {
	                rank: reply[0],
	                score: reply[1]
	            };
	        }
	    }
	};
	
	return ZRANK_WITHSCORE;
}

var ZREM = {};

var hasRequiredZREM;

function requireZREM () {
	if (hasRequiredZREM) return ZREM;
	hasRequiredZREM = 1;
	Object.defineProperty(ZREM, "__esModule", { value: true });
	ZREM.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Removes the specified members from the sorted set.
	     * @param parser - The Redis command parser.
	     * @param key - Key of the sorted set.
	     * @param member - One or more members to remove.
	     */
	    parseCommand(parser, key, member) {
	        parser.push('ZREM');
	        parser.pushKey(key);
	        parser.pushVariadic(member);
	    },
	    transformReply: undefined
	};
	
	return ZREM;
}

var ZREMRANGEBYLEX = {};

var hasRequiredZREMRANGEBYLEX;

function requireZREMRANGEBYLEX () {
	if (hasRequiredZREMRANGEBYLEX) return ZREMRANGEBYLEX;
	hasRequiredZREMRANGEBYLEX = 1;
	Object.defineProperty(ZREMRANGEBYLEX, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	ZREMRANGEBYLEX.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Removes all elements in the sorted set with lexicographical values between min and max.
	     * @param parser - The Redis command parser.
	     * @param key - Key of the sorted set.
	     * @param min - Minimum lexicographical value.
	     * @param max - Maximum lexicographical value.
	     */
	    parseCommand(parser, key, min, max) {
	        parser.push('ZREMRANGEBYLEX');
	        parser.pushKey(key);
	        parser.push((0, generic_transformers_1.transformStringDoubleArgument)(min), (0, generic_transformers_1.transformStringDoubleArgument)(max));
	    },
	    transformReply: undefined
	};
	
	return ZREMRANGEBYLEX;
}

var ZREMRANGEBYRANK = {};

var hasRequiredZREMRANGEBYRANK;

function requireZREMRANGEBYRANK () {
	if (hasRequiredZREMRANGEBYRANK) return ZREMRANGEBYRANK;
	hasRequiredZREMRANGEBYRANK = 1;
	Object.defineProperty(ZREMRANGEBYRANK, "__esModule", { value: true });
	ZREMRANGEBYRANK.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Removes all elements in the sorted set with rank between start and stop.
	     * @param parser - The Redis command parser.
	     * @param key - Key of the sorted set.
	     * @param start - Minimum rank (starting from 0).
	     * @param stop - Maximum rank.
	     */
	    parseCommand(parser, key, start, stop) {
	        parser.push('ZREMRANGEBYRANK');
	        parser.pushKey(key);
	        parser.push(start.toString(), stop.toString());
	    },
	    transformReply: undefined
	};
	
	return ZREMRANGEBYRANK;
}

var ZREVRANK = {};

var hasRequiredZREVRANK;

function requireZREVRANK () {
	if (hasRequiredZREVRANK) return ZREVRANK;
	hasRequiredZREVRANK = 1;
	Object.defineProperty(ZREVRANK, "__esModule", { value: true });
	ZREVRANK.default = {
	    CACHEABLE: true,
	    IS_READ_ONLY: true,
	    /**
	     * Returns the rank of a member in the sorted set, with scores ordered from high to low.
	     * @param parser - The Redis command parser.
	     * @param key - Key of the sorted set.
	     * @param member - Member to get the rank for.
	     */
	    parseCommand(parser, key, member) {
	        parser.push('ZREVRANK');
	        parser.pushKey(key);
	        parser.push(member);
	    },
	    transformReply: undefined
	};
	
	return ZREVRANK;
}

var ZSCAN = {};

var hasRequiredZSCAN;

function requireZSCAN () {
	if (hasRequiredZSCAN) return ZSCAN;
	hasRequiredZSCAN = 1;
	Object.defineProperty(ZSCAN, "__esModule", { value: true });
	const SCAN_1 = requireSCAN();
	const generic_transformers_1 = requireGenericTransformers();
	ZSCAN.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Incrementally iterates over a sorted set.
	     * @param parser - The Redis command parser.
	     * @param key - Key of the sorted set.
	     * @param cursor - Cursor position to start the scan from.
	     * @param options - Optional scan parameters (COUNT, MATCH, TYPE).
	     */
	    parseCommand(parser, key, cursor, options) {
	        parser.push('ZSCAN');
	        parser.pushKey(key);
	        (0, SCAN_1.parseScanArguments)(parser, cursor, options);
	    },
	    transformReply([cursor, rawMembers]) {
	        return {
	            cursor,
	            members: generic_transformers_1.transformSortedSetReply[2](rawMembers)
	        };
	    }
	};
	
	return ZSCAN;
}

var ZSCORE = {};

var hasRequiredZSCORE;

function requireZSCORE () {
	if (hasRequiredZSCORE) return ZSCORE;
	hasRequiredZSCORE = 1;
	Object.defineProperty(ZSCORE, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	ZSCORE.default = {
	    CACHEABLE: true,
	    IS_READ_ONLY: true,
	    /**
	     * Returns the score of a member in a sorted set.
	     * @param parser - The Redis command parser.
	     * @param key - Key of the sorted set.
	     * @param member - Member to get the score for.
	     */
	    parseCommand(parser, key, member) {
	        parser.push('ZSCORE');
	        parser.pushKey(key);
	        parser.push(member);
	    },
	    transformReply: generic_transformers_1.transformNullableDoubleReply
	};
	
	return ZSCORE;
}

var ZUNION_WITHSCORES = {};

var ZUNION = {};

var hasRequiredZUNION;

function requireZUNION () {
	if (hasRequiredZUNION) return ZUNION;
	hasRequiredZUNION = 1;
	Object.defineProperty(ZUNION, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	ZUNION.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Returns the union of multiple sorted sets.
	     * @param parser - The Redis command parser.
	     * @param keys - Keys of the sorted sets to combine.
	     * @param options - Optional parameters for the union operation.
	     */
	    parseCommand(parser, keys, options) {
	        parser.push('ZUNION');
	        (0, generic_transformers_1.parseZKeysArguments)(parser, keys);
	        if (options?.AGGREGATE) {
	            parser.push('AGGREGATE', options.AGGREGATE);
	        }
	    },
	    transformReply: undefined
	};
	
	return ZUNION;
}

var hasRequiredZUNION_WITHSCORES;

function requireZUNION_WITHSCORES () {
	if (hasRequiredZUNION_WITHSCORES) return ZUNION_WITHSCORES;
	hasRequiredZUNION_WITHSCORES = 1;
	var __importDefault = (ZUNION_WITHSCORES && ZUNION_WITHSCORES.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(ZUNION_WITHSCORES, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	const ZUNION_1 = __importDefault(requireZUNION());
	ZUNION_WITHSCORES.default = {
	    IS_READ_ONLY: ZUNION_1.default.IS_READ_ONLY,
	    /**
	     * Returns the union of multiple sorted sets with their scores.
	     * @param args - Same parameters as the ZUNION command.
	     */
	    parseCommand(...args) {
	        const parser = args[0];
	        ZUNION_1.default.parseCommand(...args);
	        parser.push('WITHSCORES');
	    },
	    transformReply: generic_transformers_1.transformSortedSetReply
	};
	
	return ZUNION_WITHSCORES;
}

var ZUNIONSTORE = {};

var hasRequiredZUNIONSTORE;

function requireZUNIONSTORE () {
	if (hasRequiredZUNIONSTORE) return ZUNIONSTORE;
	hasRequiredZUNIONSTORE = 1;
	Object.defineProperty(ZUNIONSTORE, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	ZUNIONSTORE.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Stores the union of multiple sorted sets in a new sorted set.
	     * @param parser - The Redis command parser.
	     * @param destination - Destination key where the result will be stored.
	     * @param keys - Keys of the sorted sets to combine.
	     * @param options - Optional parameters for the union operation.
	     */
	    parseCommand(parser, destination, keys, options) {
	        parser.push('ZUNIONSTORE');
	        parser.pushKey(destination);
	        (0, generic_transformers_1.parseZKeysArguments)(parser, keys);
	        if (options?.AGGREGATE) {
	            parser.push('AGGREGATE', options.AGGREGATE);
	        }
	    },
	    transformReply: undefined
	};
	
	return ZUNIONSTORE;
}

var VADD = {};

var hasRequiredVADD;

function requireVADD () {
	if (hasRequiredVADD) return VADD;
	hasRequiredVADD = 1;
	Object.defineProperty(VADD, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	VADD.default = {
	    /**
	     * Add a new element into the vector set specified by key
	     *
	     * @param parser - The command parser
	     * @param key - The name of the key that will hold the vector set data
	     * @param vector - The vector data as array of numbers
	     * @param element - The name of the element being added to the vector set
	     * @param options - Optional parameters for vector addition
	     * @see https://redis.io/commands/vadd/
	     */
	    parseCommand(parser, key, vector, element, options) {
	        parser.push('VADD');
	        parser.pushKey(key);
	        if (options?.REDUCE !== undefined) {
	            parser.push('REDUCE', options.REDUCE.toString());
	        }
	        parser.push('VALUES', vector.length.toString());
	        for (const value of vector) {
	            parser.push((0, generic_transformers_1.transformDoubleArgument)(value));
	        }
	        parser.push(element);
	        if (options?.CAS) {
	            parser.push('CAS');
	        }
	        options?.QUANT && parser.push(options.QUANT);
	        if (options?.EF !== undefined) {
	            parser.push('EF', options.EF.toString());
	        }
	        if (options?.SETATTR) {
	            parser.push('SETATTR', JSON.stringify(options.SETATTR));
	        }
	        if (options?.M !== undefined) {
	            parser.push('M', options.M.toString());
	        }
	    },
	    transformReply: generic_transformers_1.transformBooleanReply
	};
	
	return VADD;
}

var VCARD = {};

var hasRequiredVCARD;

function requireVCARD () {
	if (hasRequiredVCARD) return VCARD;
	hasRequiredVCARD = 1;
	Object.defineProperty(VCARD, "__esModule", { value: true });
	VCARD.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Retrieve the number of elements in a vector set
	     *
	     * @param parser - The command parser
	     * @param key - The key of the vector set
	     * @see https://redis.io/commands/vcard/
	     */
	    parseCommand(parser, key) {
	        parser.push('VCARD');
	        parser.pushKey(key);
	    },
	    transformReply: undefined
	};
	
	return VCARD;
}

var VDIM = {};

var hasRequiredVDIM;

function requireVDIM () {
	if (hasRequiredVDIM) return VDIM;
	hasRequiredVDIM = 1;
	Object.defineProperty(VDIM, "__esModule", { value: true });
	VDIM.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Retrieve the dimension of the vectors in a vector set
	     *
	     * @param parser - The command parser
	     * @param key - The key of the vector set
	     * @see https://redis.io/commands/vdim/
	     */
	    parseCommand(parser, key) {
	        parser.push('VDIM');
	        parser.pushKey(key);
	    },
	    transformReply: undefined
	};
	
	return VDIM;
}

var VEMB = {};

var hasRequiredVEMB;

function requireVEMB () {
	if (hasRequiredVEMB) return VEMB;
	hasRequiredVEMB = 1;
	Object.defineProperty(VEMB, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	VEMB.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Retrieve the approximate vector associated with a vector set element
	     *
	     * @param parser - The command parser
	     * @param key - The key of the vector set
	     * @param element - The name of the element to retrieve the vector for
	     * @see https://redis.io/commands/vemb/
	     */
	    parseCommand(parser, key, element) {
	        parser.push('VEMB');
	        parser.pushKey(key);
	        parser.push(element);
	    },
	    transformReply: generic_transformers_1.transformDoubleArrayReply
	};
	
	return VEMB;
}

var VEMB_RAW = {};

var hasRequiredVEMB_RAW;

function requireVEMB_RAW () {
	if (hasRequiredVEMB_RAW) return VEMB_RAW;
	hasRequiredVEMB_RAW = 1;
	var __importDefault = (VEMB_RAW && VEMB_RAW.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(VEMB_RAW, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	const VEMB_1 = __importDefault(requireVEMB());
	const transformRawVembReply = {
	    2: (reply) => {
	        return {
	            quantization: reply[0],
	            raw: reply[1],
	            l2Norm: generic_transformers_1.transformDoubleReply[2](reply[2]),
	            ...(reply[3] !== undefined && { quantizationRange: generic_transformers_1.transformDoubleReply[2](reply[3]) })
	        };
	    },
	    3: (reply) => {
	        return {
	            quantization: reply[0],
	            raw: reply[1],
	            l2Norm: reply[2],
	            quantizationRange: reply[3]
	        };
	    },
	};
	VEMB_RAW.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Retrieve the RAW approximate vector associated with a vector set element
	     *
	     * @param parser - The command parser
	     * @param key - The key of the vector set
	     * @param element - The name of the element to retrieve the vector for
	     * @see https://redis.io/commands/vemb/
	     */
	    parseCommand(parser, key, element) {
	        VEMB_1.default.parseCommand(parser, key, element);
	        parser.push('RAW');
	    },
	    transformReply: transformRawVembReply
	};
	
	return VEMB_RAW;
}

var VGETATTR = {};

var hasRequiredVGETATTR;

function requireVGETATTR () {
	if (hasRequiredVGETATTR) return VGETATTR;
	hasRequiredVGETATTR = 1;
	Object.defineProperty(VGETATTR, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	VGETATTR.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Retrieve the attributes of a vector set element
	     *
	     * @param parser - The command parser
	     * @param key - The key of the vector set
	     * @param element - The name of the element to retrieve attributes for
	     * @see https://redis.io/commands/vgetattr/
	     */
	    parseCommand(parser, key, element) {
	        parser.push('VGETATTR');
	        parser.pushKey(key);
	        parser.push(element);
	    },
	    transformReply: generic_transformers_1.transformRedisJsonNullReply
	};
	
	return VGETATTR;
}

var VINFO = {};

var hasRequiredVINFO;

function requireVINFO () {
	if (hasRequiredVINFO) return VINFO;
	hasRequiredVINFO = 1;
	Object.defineProperty(VINFO, "__esModule", { value: true });
	VINFO.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Retrieve metadata and internal details about a vector set, including size, dimensions, quantization type, and graph structure
	     *
	     * @param parser - The command parser
	     * @param key - The key of the vector set
	     * @see https://redis.io/commands/vinfo/
	     */
	    parseCommand(parser, key) {
	        parser.push('VINFO');
	        parser.pushKey(key);
	    },
	    transformReply: {
	        2: (reply) => {
	            const ret = Object.create(null);
	            for (let i = 0; i < reply.length; i += 2) {
	                ret[reply[i].toString()] = reply[i + 1];
	            }
	            return ret;
	        },
	        3: undefined
	    }
	};
	
	return VINFO;
}

var VLINKS = {};

var hasRequiredVLINKS;

function requireVLINKS () {
	if (hasRequiredVLINKS) return VLINKS;
	hasRequiredVLINKS = 1;
	Object.defineProperty(VLINKS, "__esModule", { value: true });
	VLINKS.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Retrieve the neighbors of a specified element in a vector set; the connections for each layer of the HNSW graph
	     *
	     * @param parser - The command parser
	     * @param key - The key of the vector set
	     * @param element - The name of the element to retrieve neighbors for
	     * @see https://redis.io/commands/vlinks/
	     */
	    parseCommand(parser, key, element) {
	        parser.push('VLINKS');
	        parser.pushKey(key);
	        parser.push(element);
	    },
	    transformReply: undefined
	};
	
	return VLINKS;
}

var VLINKS_WITHSCORES = {};

var hasRequiredVLINKS_WITHSCORES;

function requireVLINKS_WITHSCORES () {
	if (hasRequiredVLINKS_WITHSCORES) return VLINKS_WITHSCORES;
	hasRequiredVLINKS_WITHSCORES = 1;
	var __importDefault = (VLINKS_WITHSCORES && VLINKS_WITHSCORES.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(VLINKS_WITHSCORES, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	const VLINKS_1 = __importDefault(requireVLINKS());
	function transformVLinksWithScoresReply(reply) {
	    const layers = [];
	    for (const layer of reply) {
	        const obj = Object.create(null);
	        // Each layer contains alternating element names and scores
	        for (let i = 0; i < layer.length; i += 2) {
	            const element = layer[i];
	            const score = generic_transformers_1.transformDoubleReply[2](layer[i + 1]);
	            obj[element.toString()] = score;
	        }
	        layers.push(obj);
	    }
	    return layers;
	}
	VLINKS_WITHSCORES.default = {
	    IS_READ_ONLY: VLINKS_1.default.IS_READ_ONLY,
	    /**
	     * Get the connections for each layer of the HNSW graph with similarity scores
	     * @param args - Same parameters as the VLINKS command
	     * @see https://redis.io/commands/vlinks/
	     */
	    parseCommand(...args) {
	        const parser = args[0];
	        VLINKS_1.default.parseCommand(...args);
	        parser.push('WITHSCORES');
	    },
	    transformReply: {
	        2: transformVLinksWithScoresReply,
	        3: undefined
	    }
	};
	
	return VLINKS_WITHSCORES;
}

var VRANDMEMBER = {};

var hasRequiredVRANDMEMBER;

function requireVRANDMEMBER () {
	if (hasRequiredVRANDMEMBER) return VRANDMEMBER;
	hasRequiredVRANDMEMBER = 1;
	Object.defineProperty(VRANDMEMBER, "__esModule", { value: true });
	VRANDMEMBER.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Retrieve random elements of a vector set
	     *
	     * @param parser - The command parser
	     * @param key - The key of the vector set
	     * @param count - Optional number of elements to return
	     * @see https://redis.io/commands/vrandmember/
	     */
	    parseCommand(parser, key, count) {
	        parser.push('VRANDMEMBER');
	        parser.pushKey(key);
	        if (count !== undefined) {
	            parser.push(count.toString());
	        }
	    },
	    transformReply: undefined
	};
	
	return VRANDMEMBER;
}

var VREM = {};

var hasRequiredVREM;

function requireVREM () {
	if (hasRequiredVREM) return VREM;
	hasRequiredVREM = 1;
	Object.defineProperty(VREM, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	VREM.default = {
	    /**
	     * Remove an element from a vector set
	     *
	     * @param parser - The command parser
	     * @param key - The key of the vector set
	     * @param element - The name of the element to remove from the vector set
	     * @see https://redis.io/commands/vrem/
	     */
	    parseCommand(parser, key, element) {
	        parser.push('VREM');
	        parser.pushKey(key);
	        parser.push(element);
	    },
	    transformReply: generic_transformers_1.transformBooleanReply
	};
	
	return VREM;
}

var VSETATTR = {};

var hasRequiredVSETATTR;

function requireVSETATTR () {
	if (hasRequiredVSETATTR) return VSETATTR;
	hasRequiredVSETATTR = 1;
	Object.defineProperty(VSETATTR, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	VSETATTR.default = {
	    /**
	     * Set or replace attributes on a vector set element
	     *
	     * @param parser - The command parser
	     * @param key - The key of the vector set
	     * @param element - The name of the element to set attributes for
	     * @param attributes - The attributes to set (as JSON string or object)
	     * @see https://redis.io/commands/vsetattr/
	     */
	    parseCommand(parser, key, element, attributes) {
	        parser.push('VSETATTR');
	        parser.pushKey(key);
	        parser.push(element);
	        if (typeof attributes === 'object' && attributes !== null) {
	            parser.push(JSON.stringify(attributes));
	        }
	        else {
	            parser.push(attributes);
	        }
	    },
	    transformReply: generic_transformers_1.transformBooleanReply
	};
	
	return VSETATTR;
}

var VSIM = {};

var hasRequiredVSIM;

function requireVSIM () {
	if (hasRequiredVSIM) return VSIM;
	hasRequiredVSIM = 1;
	Object.defineProperty(VSIM, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	VSIM.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Retrieve elements similar to a given vector or element with optional filtering
	     *
	     * @param parser - The command parser
	     * @param key - The key of the vector set
	     * @param query - The query vector (array of numbers) or element name (string)
	     * @param options - Optional parameters for similarity search
	     * @see https://redis.io/commands/vsim/
	     */
	    parseCommand(parser, key, query, options) {
	        parser.push('VSIM');
	        parser.pushKey(key);
	        if (Array.isArray(query)) {
	            parser.push('VALUES', query.length.toString());
	            for (const value of query) {
	                parser.push((0, generic_transformers_1.transformDoubleArgument)(value));
	            }
	        }
	        else {
	            parser.push('ELE', query);
	        }
	        if (options?.COUNT !== undefined) {
	            parser.push('COUNT', options.COUNT.toString());
	        }
	        if (options?.EF !== undefined) {
	            parser.push('EF', options.EF.toString());
	        }
	        if (options?.FILTER) {
	            parser.push('FILTER', options.FILTER);
	        }
	        if (options?.['FILTER-EF'] !== undefined) {
	            parser.push('FILTER-EF', options['FILTER-EF'].toString());
	        }
	        if (options?.TRUTH) {
	            parser.push('TRUTH');
	        }
	        if (options?.NOTHREAD) {
	            parser.push('NOTHREAD');
	        }
	    },
	    transformReply: undefined
	};
	
	return VSIM;
}

var VSIM_WITHSCORES = {};

var hasRequiredVSIM_WITHSCORES;

function requireVSIM_WITHSCORES () {
	if (hasRequiredVSIM_WITHSCORES) return VSIM_WITHSCORES;
	hasRequiredVSIM_WITHSCORES = 1;
	var __importDefault = (VSIM_WITHSCORES && VSIM_WITHSCORES.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(VSIM_WITHSCORES, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	const VSIM_1 = __importDefault(requireVSIM());
	VSIM_WITHSCORES.default = {
	    IS_READ_ONLY: VSIM_1.default.IS_READ_ONLY,
	    /**
	     * Retrieve elements similar to a given vector or element with similarity scores
	     * @param args - Same parameters as the VSIM command
	     * @see https://redis.io/commands/vsim/
	     */
	    parseCommand(...args) {
	        const parser = args[0];
	        VSIM_1.default.parseCommand(...args);
	        parser.push('WITHSCORES');
	    },
	    transformReply: {
	        2: (reply) => {
	            const inferred = reply;
	            const members = {};
	            for (let i = 0; i < inferred.length; i += 2) {
	                members[inferred[i].toString()] = generic_transformers_1.transformDoubleReply[2](inferred[i + 1]);
	            }
	            return members;
	        },
	        3: undefined
	    }
	};
	
	return VSIM_WITHSCORES;
}

var hasRequiredCommands$5;

function requireCommands$5 () {
	if (hasRequiredCommands$5) return commands$5;
	hasRequiredCommands$5 = 1;
	var __importDefault = (commands$5 && commands$5.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(commands$5, "__esModule", { value: true });
	const ACL_CAT_1 = __importDefault(requireACL_CAT());
	const ACL_DELUSER_1 = __importDefault(requireACL_DELUSER());
	const ACL_DRYRUN_1 = __importDefault(requireACL_DRYRUN());
	const ACL_GENPASS_1 = __importDefault(requireACL_GENPASS());
	const ACL_GETUSER_1 = __importDefault(requireACL_GETUSER());
	const ACL_LIST_1 = __importDefault(requireACL_LIST());
	const ACL_LOAD_1 = __importDefault(requireACL_LOAD());
	const ACL_LOG_RESET_1 = __importDefault(requireACL_LOG_RESET());
	const ACL_LOG_1 = __importDefault(requireACL_LOG());
	const ACL_SAVE_1 = __importDefault(requireACL_SAVE());
	const ACL_SETUSER_1 = __importDefault(requireACL_SETUSER());
	const ACL_USERS_1 = __importDefault(requireACL_USERS());
	const ACL_WHOAMI_1 = __importDefault(requireACL_WHOAMI());
	const APPEND_1 = __importDefault(requireAPPEND());
	const ASKING_1 = __importDefault(requireASKING());
	const AUTH_1 = __importDefault(requireAUTH());
	const BGREWRITEAOF_1 = __importDefault(requireBGREWRITEAOF());
	const BGSAVE_1 = __importDefault(requireBGSAVE());
	const BITCOUNT_1 = __importDefault(requireBITCOUNT());
	const BITFIELD_RO_1 = __importDefault(requireBITFIELD_RO());
	const BITFIELD_1 = __importDefault(requireBITFIELD());
	const BITOP_1 = __importDefault(requireBITOP());
	const BITPOS_1 = __importDefault(requireBITPOS());
	const BLMOVE_1 = __importDefault(requireBLMOVE());
	const BLMPOP_1 = __importDefault(requireBLMPOP());
	const BLPOP_1 = __importDefault(requireBLPOP());
	const BRPOP_1 = __importDefault(requireBRPOP());
	const BRPOPLPUSH_1 = __importDefault(requireBRPOPLPUSH());
	const BZMPOP_1 = __importDefault(requireBZMPOP());
	const BZPOPMAX_1 = __importDefault(requireBZPOPMAX());
	const BZPOPMIN_1 = __importDefault(requireBZPOPMIN());
	const CLIENT_CACHING_1 = __importDefault(requireCLIENT_CACHING());
	const CLIENT_GETNAME_1 = __importDefault(requireCLIENT_GETNAME());
	const CLIENT_GETREDIR_1 = __importDefault(requireCLIENT_GETREDIR());
	const CLIENT_ID_1 = __importDefault(requireCLIENT_ID());
	const CLIENT_INFO_1 = __importDefault(requireCLIENT_INFO());
	const CLIENT_KILL_1 = __importDefault(requireCLIENT_KILL());
	const CLIENT_LIST_1 = __importDefault(requireCLIENT_LIST());
	const CLIENT_NO_EVICT_1 = __importDefault(requireCLIENT_NOEVICT());
	const CLIENT_NO_TOUCH_1 = __importDefault(requireCLIENT_NOTOUCH());
	const CLIENT_PAUSE_1 = __importDefault(requireCLIENT_PAUSE());
	const CLIENT_SETNAME_1 = __importDefault(requireCLIENT_SETNAME());
	const CLIENT_TRACKING_1 = __importDefault(requireCLIENT_TRACKING());
	const CLIENT_TRACKINGINFO_1 = __importDefault(requireCLIENT_TRACKINGINFO());
	const CLIENT_UNPAUSE_1 = __importDefault(requireCLIENT_UNPAUSE());
	const CLUSTER_ADDSLOTS_1 = __importDefault(requireCLUSTER_ADDSLOTS());
	const CLUSTER_ADDSLOTSRANGE_1 = __importDefault(requireCLUSTER_ADDSLOTSRANGE());
	const CLUSTER_BUMPEPOCH_1 = __importDefault(requireCLUSTER_BUMPEPOCH());
	const CLUSTER_COUNT_FAILURE_REPORTS_1 = __importDefault(requireCLUSTER_COUNTFAILUREREPORTS());
	const CLUSTER_COUNTKEYSINSLOT_1 = __importDefault(requireCLUSTER_COUNTKEYSINSLOT());
	const CLUSTER_DELSLOTS_1 = __importDefault(requireCLUSTER_DELSLOTS());
	const CLUSTER_DELSLOTSRANGE_1 = __importDefault(requireCLUSTER_DELSLOTSRANGE());
	const CLUSTER_FAILOVER_1 = __importDefault(requireCLUSTER_FAILOVER());
	const CLUSTER_FLUSHSLOTS_1 = __importDefault(requireCLUSTER_FLUSHSLOTS());
	const CLUSTER_FORGET_1 = __importDefault(requireCLUSTER_FORGET());
	const CLUSTER_GETKEYSINSLOT_1 = __importDefault(requireCLUSTER_GETKEYSINSLOT());
	const CLUSTER_INFO_1 = __importDefault(requireCLUSTER_INFO());
	const CLUSTER_KEYSLOT_1 = __importDefault(requireCLUSTER_KEYSLOT());
	const CLUSTER_LINKS_1 = __importDefault(requireCLUSTER_LINKS());
	const CLUSTER_MEET_1 = __importDefault(requireCLUSTER_MEET());
	const CLUSTER_MYID_1 = __importDefault(requireCLUSTER_MYID());
	const CLUSTER_MYSHARDID_1 = __importDefault(requireCLUSTER_MYSHARDID());
	const CLUSTER_NODES_1 = __importDefault(requireCLUSTER_NODES());
	const CLUSTER_REPLICAS_1 = __importDefault(requireCLUSTER_REPLICAS());
	const CLUSTER_REPLICATE_1 = __importDefault(requireCLUSTER_REPLICATE());
	const CLUSTER_RESET_1 = __importDefault(requireCLUSTER_RESET());
	const CLUSTER_SAVECONFIG_1 = __importDefault(requireCLUSTER_SAVECONFIG());
	const CLUSTER_SET_CONFIG_EPOCH_1 = __importDefault(requireCLUSTER_SETCONFIGEPOCH());
	const CLUSTER_SETSLOT_1 = __importDefault(requireCLUSTER_SETSLOT());
	const CLUSTER_SLOTS_1 = __importDefault(requireCLUSTER_SLOTS());
	const COMMAND_COUNT_1 = __importDefault(requireCOMMAND_COUNT());
	const COMMAND_GETKEYS_1 = __importDefault(requireCOMMAND_GETKEYS());
	const COMMAND_GETKEYSANDFLAGS_1 = __importDefault(requireCOMMAND_GETKEYSANDFLAGS());
	const COMMAND_INFO_1 = __importDefault(requireCOMMAND_INFO());
	const COMMAND_LIST_1 = __importDefault(requireCOMMAND_LIST());
	const COMMAND_1 = __importDefault(requireCOMMAND());
	const CONFIG_GET_1 = __importDefault(requireCONFIG_GET$1());
	const CONFIG_RESETSTAT_1 = __importDefault(requireCONFIG_RESETSTAT());
	const CONFIG_REWRITE_1 = __importDefault(requireCONFIG_REWRITE());
	const CONFIG_SET_1 = __importDefault(requireCONFIG_SET$1());
	const COPY_1 = __importDefault(requireCOPY());
	const DBSIZE_1 = __importDefault(requireDBSIZE());
	const DECR_1 = __importDefault(requireDECR());
	const DECRBY_1 = __importDefault(requireDECRBY$1());
	const DEL_1 = __importDefault(requireDEL$3());
	const DUMP_1 = __importDefault(requireDUMP());
	const ECHO_1 = __importDefault(requireECHO());
	const EVAL_RO_1 = __importDefault(requireEVAL_RO());
	const EVAL_1 = __importDefault(requireEVAL());
	const EVALSHA_RO_1 = __importDefault(requireEVALSHA_RO());
	const EVALSHA_1 = __importDefault(requireEVALSHA());
	const GEOADD_1 = __importDefault(requireGEOADD());
	const GEODIST_1 = __importDefault(requireGEODIST());
	const GEOHASH_1 = __importDefault(requireGEOHASH());
	const GEOPOS_1 = __importDefault(requireGEOPOS());
	const GEORADIUS_RO_WITH_1 = __importDefault(requireGEORADIUS_RO_WITH());
	const GEORADIUS_RO_1 = __importDefault(requireGEORADIUS_RO());
	const GEORADIUS_STORE_1 = __importDefault(requireGEORADIUS_STORE());
	const GEORADIUS_WITH_1 = __importDefault(requireGEORADIUS_WITH());
	const GEORADIUS_1 = __importDefault(requireGEORADIUS());
	const GEORADIUSBYMEMBER_RO_WITH_1 = __importDefault(requireGEORADIUSBYMEMBER_RO_WITH());
	const GEORADIUSBYMEMBER_RO_1 = __importDefault(requireGEORADIUSBYMEMBER_RO());
	const GEORADIUSBYMEMBER_STORE_1 = __importDefault(requireGEORADIUSBYMEMBER_STORE());
	const GEORADIUSBYMEMBER_WITH_1 = __importDefault(requireGEORADIUSBYMEMBER_WITH());
	const GEORADIUSBYMEMBER_1 = __importDefault(requireGEORADIUSBYMEMBER());
	const GEOSEARCH_WITH_1 = __importDefault(requireGEOSEARCH_WITH());
	const GEOSEARCH_1 = __importDefault(requireGEOSEARCH());
	const GEOSEARCHSTORE_1 = __importDefault(requireGEOSEARCHSTORE());
	const GET_1 = __importDefault(requireGET$2());
	const GETBIT_1 = __importDefault(requireGETBIT());
	const GETDEL_1 = __importDefault(requireGETDEL());
	const GETEX_1 = __importDefault(requireGETEX());
	const GETRANGE_1 = __importDefault(requireGETRANGE());
	const GETSET_1 = __importDefault(requireGETSET());
	const EXISTS_1 = __importDefault(requireEXISTS$2());
	const EXPIRE_1 = __importDefault(requireEXPIRE());
	const EXPIREAT_1 = __importDefault(requireEXPIREAT());
	const EXPIRETIME_1 = __importDefault(requireEXPIRETIME());
	const FLUSHALL_1 = __importDefault(requireFLUSHALL());
	const FLUSHDB_1 = __importDefault(requireFLUSHDB());
	const FCALL_1 = __importDefault(requireFCALL());
	const FCALL_RO_1 = __importDefault(requireFCALL_RO());
	const FUNCTION_DELETE_1 = __importDefault(requireFUNCTION_DELETE());
	const FUNCTION_DUMP_1 = __importDefault(requireFUNCTION_DUMP());
	const FUNCTION_FLUSH_1 = __importDefault(requireFUNCTION_FLUSH());
	const FUNCTION_KILL_1 = __importDefault(requireFUNCTION_KILL());
	const FUNCTION_LIST_WITHCODE_1 = __importDefault(requireFUNCTION_LIST_WITHCODE());
	const FUNCTION_LIST_1 = __importDefault(requireFUNCTION_LIST());
	const FUNCTION_LOAD_1 = __importDefault(requireFUNCTION_LOAD());
	const FUNCTION_RESTORE_1 = __importDefault(requireFUNCTION_RESTORE());
	const FUNCTION_STATS_1 = __importDefault(requireFUNCTION_STATS());
	const HDEL_1 = __importDefault(requireHDEL());
	const HELLO_1 = __importDefault(requireHELLO());
	const HEXISTS_1 = __importDefault(requireHEXISTS());
	const HEXPIRE_1 = __importDefault(requireHEXPIRE());
	const HEXPIREAT_1 = __importDefault(requireHEXPIREAT());
	const HEXPIRETIME_1 = __importDefault(requireHEXPIRETIME());
	const HGET_1 = __importDefault(requireHGET());
	const HGETALL_1 = __importDefault(requireHGETALL());
	const HGETDEL_1 = __importDefault(requireHGETDEL());
	const HGETEX_1 = __importDefault(requireHGETEX());
	const HINCRBY_1 = __importDefault(requireHINCRBY());
	const HINCRBYFLOAT_1 = __importDefault(requireHINCRBYFLOAT());
	const HKEYS_1 = __importDefault(requireHKEYS());
	const HLEN_1 = __importDefault(requireHLEN());
	const HMGET_1 = __importDefault(requireHMGET());
	const HPERSIST_1 = __importDefault(requireHPERSIST());
	const HPEXPIRE_1 = __importDefault(requireHPEXPIRE());
	const HPEXPIREAT_1 = __importDefault(requireHPEXPIREAT());
	const HPEXPIRETIME_1 = __importDefault(requireHPEXPIRETIME());
	const HPTTL_1 = __importDefault(requireHPTTL());
	const HRANDFIELD_COUNT_WITHVALUES_1 = __importDefault(requireHRANDFIELD_COUNT_WITHVALUES());
	const HRANDFIELD_COUNT_1 = __importDefault(requireHRANDFIELD_COUNT());
	const HRANDFIELD_1 = __importDefault(requireHRANDFIELD());
	const HSCAN_1 = __importDefault(requireHSCAN());
	const HSCAN_NOVALUES_1 = __importDefault(requireHSCAN_NOVALUES());
	const HSET_1 = __importDefault(requireHSET());
	const HSETEX_1 = __importDefault(requireHSETEX());
	const HSETNX_1 = __importDefault(requireHSETNX());
	const HSTRLEN_1 = __importDefault(requireHSTRLEN());
	const HTTL_1 = __importDefault(requireHTTL());
	const HVALS_1 = __importDefault(requireHVALS());
	const INCR_1 = __importDefault(requireINCR());
	const INCRBY_1 = __importDefault(requireINCRBY$3());
	const INCRBYFLOAT_1 = __importDefault(requireINCRBYFLOAT());
	const INFO_1 = __importDefault(requireINFO$7());
	const KEYS_1 = __importDefault(requireKEYS());
	const LASTSAVE_1 = __importDefault(requireLASTSAVE());
	const LATENCY_DOCTOR_1 = __importDefault(requireLATENCY_DOCTOR());
	const LATENCY_GRAPH_1 = __importDefault(requireLATENCY_GRAPH());
	const LATENCY_HISTORY_1 = __importDefault(requireLATENCY_HISTORY());
	const LATENCY_LATEST_1 = __importDefault(requireLATENCY_LATEST());
	const LCS_IDX_WITHMATCHLEN_1 = __importDefault(requireLCS_IDX_WITHMATCHLEN());
	const LCS_IDX_1 = __importDefault(requireLCS_IDX());
	const LCS_LEN_1 = __importDefault(requireLCS_LEN());
	const LCS_1 = __importDefault(requireLCS());
	const LINDEX_1 = __importDefault(requireLINDEX());
	const LINSERT_1 = __importDefault(requireLINSERT());
	const LLEN_1 = __importDefault(requireLLEN());
	const LMOVE_1 = __importDefault(requireLMOVE());
	const LMPOP_1 = __importDefault(requireLMPOP());
	const LOLWUT_1 = __importDefault(requireLOLWUT());
	const LPOP_COUNT_1 = __importDefault(requireLPOP_COUNT());
	const LPOP_1 = __importDefault(requireLPOP());
	const LPOS_COUNT_1 = __importDefault(requireLPOS_COUNT());
	const LPOS_1 = __importDefault(requireLPOS());
	const LPUSH_1 = __importDefault(requireLPUSH());
	const LPUSHX_1 = __importDefault(requireLPUSHX());
	const LRANGE_1 = __importDefault(requireLRANGE());
	const LREM_1 = __importDefault(requireLREM());
	const LSET_1 = __importDefault(requireLSET());
	const LTRIM_1 = __importDefault(requireLTRIM());
	const MEMORY_DOCTOR_1 = __importDefault(requireMEMORY_DOCTOR());
	const MEMORY_MALLOC_STATS_1 = __importDefault(requireMEMORY_MALLOCSTATS());
	const MEMORY_PURGE_1 = __importDefault(requireMEMORY_PURGE());
	const MEMORY_STATS_1 = __importDefault(requireMEMORY_STATS());
	const MEMORY_USAGE_1 = __importDefault(requireMEMORY_USAGE());
	const MGET_1 = __importDefault(requireMGET$2());
	const MIGRATE_1 = __importDefault(requireMIGRATE());
	const MODULE_LIST_1 = __importDefault(requireMODULE_LIST());
	const MODULE_LOAD_1 = __importDefault(requireMODULE_LOAD());
	const MODULE_UNLOAD_1 = __importDefault(requireMODULE_UNLOAD());
	const MOVE_1 = __importDefault(requireMOVE());
	const MSET_1 = __importDefault(requireMSET$1());
	const MSETNX_1 = __importDefault(requireMSETNX());
	const OBJECT_ENCODING_1 = __importDefault(requireOBJECT_ENCODING());
	const OBJECT_FREQ_1 = __importDefault(requireOBJECT_FREQ());
	const OBJECT_IDLETIME_1 = __importDefault(requireOBJECT_IDLETIME());
	const OBJECT_REFCOUNT_1 = __importDefault(requireOBJECT_REFCOUNT());
	const PERSIST_1 = __importDefault(requirePERSIST());
	const PEXPIRE_1 = __importDefault(requirePEXPIRE());
	const PEXPIREAT_1 = __importDefault(requirePEXPIREAT());
	const PEXPIRETIME_1 = __importDefault(requirePEXPIRETIME());
	const PFADD_1 = __importDefault(requirePFADD());
	const PFCOUNT_1 = __importDefault(requirePFCOUNT());
	const PFMERGE_1 = __importDefault(requirePFMERGE());
	const PING_1 = __importDefault(requirePING());
	const PSETEX_1 = __importDefault(requirePSETEX());
	const PTTL_1 = __importDefault(requirePTTL());
	const PUBLISH_1 = __importDefault(requirePUBLISH());
	const PUBSUB_CHANNELS_1 = __importDefault(requirePUBSUB_CHANNELS());
	const PUBSUB_NUMPAT_1 = __importDefault(requirePUBSUB_NUMPAT());
	const PUBSUB_NUMSUB_1 = __importDefault(requirePUBSUB_NUMSUB());
	const PUBSUB_SHARDNUMSUB_1 = __importDefault(requirePUBSUB_SHARDNUMSUB());
	const PUBSUB_SHARDCHANNELS_1 = __importDefault(requirePUBSUB_SHARDCHANNELS());
	const RANDOMKEY_1 = __importDefault(requireRANDOMKEY());
	const READONLY_1 = __importDefault(requireREADONLY());
	const RENAME_1 = __importDefault(requireRENAME());
	const RENAMENX_1 = __importDefault(requireRENAMENX());
	const REPLICAOF_1 = __importDefault(requireREPLICAOF());
	const RESTORE_ASKING_1 = __importDefault(requireRESTOREASKING());
	const RESTORE_1 = __importDefault(requireRESTORE());
	const ROLE_1 = __importDefault(requireROLE());
	const RPOP_COUNT_1 = __importDefault(requireRPOP_COUNT());
	const RPOP_1 = __importDefault(requireRPOP());
	const RPOPLPUSH_1 = __importDefault(requireRPOPLPUSH());
	const RPUSH_1 = __importDefault(requireRPUSH());
	const RPUSHX_1 = __importDefault(requireRPUSHX());
	const SADD_1 = __importDefault(requireSADD());
	const SCAN_1 = __importDefault(requireSCAN());
	const SCARD_1 = __importDefault(requireSCARD());
	const SCRIPT_DEBUG_1 = __importDefault(requireSCRIPT_DEBUG());
	const SCRIPT_EXISTS_1 = __importDefault(requireSCRIPT_EXISTS());
	const SCRIPT_FLUSH_1 = __importDefault(requireSCRIPT_FLUSH());
	const SCRIPT_KILL_1 = __importDefault(requireSCRIPT_KILL());
	const SCRIPT_LOAD_1 = __importDefault(requireSCRIPT_LOAD());
	const SDIFF_1 = __importDefault(requireSDIFF());
	const SDIFFSTORE_1 = __importDefault(requireSDIFFSTORE());
	const SET_1 = __importDefault(requireSET$1());
	const SETBIT_1 = __importDefault(requireSETBIT());
	const SETEX_1 = __importDefault(requireSETEX());
	const SETNX_1 = __importDefault(requireSETNX());
	const SETRANGE_1 = __importDefault(requireSETRANGE());
	const SINTER_1 = __importDefault(requireSINTER());
	const SINTERCARD_1 = __importDefault(requireSINTERCARD());
	const SINTERSTORE_1 = __importDefault(requireSINTERSTORE());
	const SISMEMBER_1 = __importDefault(requireSISMEMBER());
	const SMEMBERS_1 = __importDefault(requireSMEMBERS());
	const SMISMEMBER_1 = __importDefault(requireSMISMEMBER());
	const SMOVE_1 = __importDefault(requireSMOVE());
	const SORT_RO_1 = __importDefault(requireSORT_RO());
	const SORT_STORE_1 = __importDefault(requireSORT_STORE());
	const SORT_1 = __importDefault(requireSORT());
	const SPOP_COUNT_1 = __importDefault(requireSPOP_COUNT());
	const SPOP_1 = __importDefault(requireSPOP());
	const SPUBLISH_1 = __importDefault(requireSPUBLISH());
	const SRANDMEMBER_COUNT_1 = __importDefault(requireSRANDMEMBER_COUNT());
	const SRANDMEMBER_1 = __importDefault(requireSRANDMEMBER());
	const SREM_1 = __importDefault(requireSREM());
	const SSCAN_1 = __importDefault(requireSSCAN());
	const STRLEN_1 = __importDefault(requireSTRLEN$1());
	const SUNION_1 = __importDefault(requireSUNION());
	const SUNIONSTORE_1 = __importDefault(requireSUNIONSTORE());
	const SWAPDB_1 = __importDefault(requireSWAPDB());
	const TIME_1 = __importDefault(requireTIME());
	const TOUCH_1 = __importDefault(requireTOUCH());
	const TTL_1 = __importDefault(requireTTL());
	const TYPE_1 = __importDefault(requireTYPE$1());
	const UNLINK_1 = __importDefault(requireUNLINK());
	const WAIT_1 = __importDefault(requireWAIT());
	const XACK_1 = __importDefault(requireXACK());
	const XADD_NOMKSTREAM_1 = __importDefault(requireXADD_NOMKSTREAM());
	const XADD_1 = __importDefault(requireXADD());
	const XAUTOCLAIM_JUSTID_1 = __importDefault(requireXAUTOCLAIM_JUSTID());
	const XAUTOCLAIM_1 = __importDefault(requireXAUTOCLAIM());
	const XCLAIM_JUSTID_1 = __importDefault(requireXCLAIM_JUSTID());
	const XCLAIM_1 = __importDefault(requireXCLAIM());
	const XDEL_1 = __importDefault(requireXDEL());
	const XGROUP_CREATE_1 = __importDefault(requireXGROUP_CREATE());
	const XGROUP_CREATECONSUMER_1 = __importDefault(requireXGROUP_CREATECONSUMER());
	const XGROUP_DELCONSUMER_1 = __importDefault(requireXGROUP_DELCONSUMER());
	const XGROUP_DESTROY_1 = __importDefault(requireXGROUP_DESTROY());
	const XGROUP_SETID_1 = __importDefault(requireXGROUP_SETID());
	const XINFO_CONSUMERS_1 = __importDefault(requireXINFO_CONSUMERS());
	const XINFO_GROUPS_1 = __importDefault(requireXINFO_GROUPS());
	const XINFO_STREAM_1 = __importDefault(requireXINFO_STREAM());
	const XLEN_1 = __importDefault(requireXLEN());
	const XPENDING_RANGE_1 = __importDefault(requireXPENDING_RANGE());
	const XPENDING_1 = __importDefault(requireXPENDING());
	const XRANGE_1 = __importDefault(requireXRANGE());
	const XREAD_1 = __importDefault(requireXREAD());
	const XREADGROUP_1 = __importDefault(requireXREADGROUP());
	const XREVRANGE_1 = __importDefault(requireXREVRANGE());
	const XSETID_1 = __importDefault(requireXSETID());
	const XTRIM_1 = __importDefault(requireXTRIM());
	const ZADD_INCR_1 = __importDefault(requireZADD_INCR());
	const ZADD_1 = __importDefault(requireZADD());
	const ZCARD_1 = __importDefault(requireZCARD());
	const ZCOUNT_1 = __importDefault(requireZCOUNT());
	const ZDIFF_WITHSCORES_1 = __importDefault(requireZDIFF_WITHSCORES());
	const ZDIFF_1 = __importDefault(requireZDIFF());
	const ZDIFFSTORE_1 = __importDefault(requireZDIFFSTORE());
	const ZINCRBY_1 = __importDefault(requireZINCRBY());
	const ZINTER_WITHSCORES_1 = __importDefault(requireZINTER_WITHSCORES());
	const ZINTER_1 = __importDefault(requireZINTER());
	const ZINTERCARD_1 = __importDefault(requireZINTERCARD());
	const ZINTERSTORE_1 = __importDefault(requireZINTERSTORE());
	const ZLEXCOUNT_1 = __importDefault(requireZLEXCOUNT());
	const ZMPOP_1 = __importDefault(requireZMPOP());
	const ZMSCORE_1 = __importDefault(requireZMSCORE());
	const ZPOPMAX_COUNT_1 = __importDefault(requireZPOPMAX_COUNT());
	const ZPOPMAX_1 = __importDefault(requireZPOPMAX());
	const ZPOPMIN_COUNT_1 = __importDefault(requireZPOPMIN_COUNT());
	const ZPOPMIN_1 = __importDefault(requireZPOPMIN());
	const ZRANDMEMBER_COUNT_WITHSCORES_1 = __importDefault(requireZRANDMEMBER_COUNT_WITHSCORES());
	const ZRANDMEMBER_COUNT_1 = __importDefault(requireZRANDMEMBER_COUNT());
	const ZRANDMEMBER_1 = __importDefault(requireZRANDMEMBER());
	const ZRANGE_WITHSCORES_1 = __importDefault(requireZRANGE_WITHSCORES());
	const ZRANGE_1 = __importDefault(requireZRANGE());
	const ZRANGEBYLEX_1 = __importDefault(requireZRANGEBYLEX());
	const ZRANGEBYSCORE_WITHSCORES_1 = __importDefault(requireZRANGEBYSCORE_WITHSCORES());
	const ZRANGEBYSCORE_1 = __importDefault(requireZRANGEBYSCORE());
	const ZRANGESTORE_1 = __importDefault(requireZRANGESTORE());
	const ZREMRANGEBYSCORE_1 = __importDefault(requireZREMRANGEBYSCORE());
	const ZRANK_WITHSCORE_1 = __importDefault(requireZRANK_WITHSCORE());
	const ZRANK_1 = __importDefault(requireZRANK());
	const ZREM_1 = __importDefault(requireZREM());
	const ZREMRANGEBYLEX_1 = __importDefault(requireZREMRANGEBYLEX());
	const ZREMRANGEBYRANK_1 = __importDefault(requireZREMRANGEBYRANK());
	const ZREVRANK_1 = __importDefault(requireZREVRANK());
	const ZSCAN_1 = __importDefault(requireZSCAN());
	const ZSCORE_1 = __importDefault(requireZSCORE());
	const ZUNION_WITHSCORES_1 = __importDefault(requireZUNION_WITHSCORES());
	const ZUNION_1 = __importDefault(requireZUNION());
	const ZUNIONSTORE_1 = __importDefault(requireZUNIONSTORE());
	const VADD_1 = __importDefault(requireVADD());
	const VCARD_1 = __importDefault(requireVCARD());
	const VDIM_1 = __importDefault(requireVDIM());
	const VEMB_1 = __importDefault(requireVEMB());
	const VEMB_RAW_1 = __importDefault(requireVEMB_RAW());
	const VGETATTR_1 = __importDefault(requireVGETATTR());
	const VINFO_1 = __importDefault(requireVINFO());
	const VLINKS_1 = __importDefault(requireVLINKS());
	const VLINKS_WITHSCORES_1 = __importDefault(requireVLINKS_WITHSCORES());
	const VRANDMEMBER_1 = __importDefault(requireVRANDMEMBER());
	const VREM_1 = __importDefault(requireVREM());
	const VSETATTR_1 = __importDefault(requireVSETATTR());
	const VSIM_1 = __importDefault(requireVSIM());
	const VSIM_WITHSCORES_1 = __importDefault(requireVSIM_WITHSCORES());
	commands$5.default = {
	    ACL_CAT: ACL_CAT_1.default,
	    aclCat: ACL_CAT_1.default,
	    ACL_DELUSER: ACL_DELUSER_1.default,
	    aclDelUser: ACL_DELUSER_1.default,
	    ACL_DRYRUN: ACL_DRYRUN_1.default,
	    aclDryRun: ACL_DRYRUN_1.default,
	    ACL_GENPASS: ACL_GENPASS_1.default,
	    aclGenPass: ACL_GENPASS_1.default,
	    ACL_GETUSER: ACL_GETUSER_1.default,
	    aclGetUser: ACL_GETUSER_1.default,
	    ACL_LIST: ACL_LIST_1.default,
	    aclList: ACL_LIST_1.default,
	    ACL_LOAD: ACL_LOAD_1.default,
	    aclLoad: ACL_LOAD_1.default,
	    ACL_LOG_RESET: ACL_LOG_RESET_1.default,
	    aclLogReset: ACL_LOG_RESET_1.default,
	    ACL_LOG: ACL_LOG_1.default,
	    aclLog: ACL_LOG_1.default,
	    ACL_SAVE: ACL_SAVE_1.default,
	    aclSave: ACL_SAVE_1.default,
	    ACL_SETUSER: ACL_SETUSER_1.default,
	    aclSetUser: ACL_SETUSER_1.default,
	    ACL_USERS: ACL_USERS_1.default,
	    aclUsers: ACL_USERS_1.default,
	    ACL_WHOAMI: ACL_WHOAMI_1.default,
	    aclWhoAmI: ACL_WHOAMI_1.default,
	    APPEND: APPEND_1.default,
	    append: APPEND_1.default,
	    ASKING: ASKING_1.default,
	    asking: ASKING_1.default,
	    AUTH: AUTH_1.default,
	    auth: AUTH_1.default,
	    BGREWRITEAOF: BGREWRITEAOF_1.default,
	    bgRewriteAof: BGREWRITEAOF_1.default,
	    BGSAVE: BGSAVE_1.default,
	    bgSave: BGSAVE_1.default,
	    BITCOUNT: BITCOUNT_1.default,
	    bitCount: BITCOUNT_1.default,
	    BITFIELD_RO: BITFIELD_RO_1.default,
	    bitFieldRo: BITFIELD_RO_1.default,
	    BITFIELD: BITFIELD_1.default,
	    bitField: BITFIELD_1.default,
	    BITOP: BITOP_1.default,
	    bitOp: BITOP_1.default,
	    BITPOS: BITPOS_1.default,
	    bitPos: BITPOS_1.default,
	    BLMOVE: BLMOVE_1.default,
	    blMove: BLMOVE_1.default,
	    BLMPOP: BLMPOP_1.default,
	    blmPop: BLMPOP_1.default,
	    BLPOP: BLPOP_1.default,
	    blPop: BLPOP_1.default,
	    BRPOP: BRPOP_1.default,
	    brPop: BRPOP_1.default,
	    BRPOPLPUSH: BRPOPLPUSH_1.default,
	    brPopLPush: BRPOPLPUSH_1.default,
	    BZMPOP: BZMPOP_1.default,
	    bzmPop: BZMPOP_1.default,
	    BZPOPMAX: BZPOPMAX_1.default,
	    bzPopMax: BZPOPMAX_1.default,
	    BZPOPMIN: BZPOPMIN_1.default,
	    bzPopMin: BZPOPMIN_1.default,
	    CLIENT_CACHING: CLIENT_CACHING_1.default,
	    clientCaching: CLIENT_CACHING_1.default,
	    CLIENT_GETNAME: CLIENT_GETNAME_1.default,
	    clientGetName: CLIENT_GETNAME_1.default,
	    CLIENT_GETREDIR: CLIENT_GETREDIR_1.default,
	    clientGetRedir: CLIENT_GETREDIR_1.default,
	    CLIENT_ID: CLIENT_ID_1.default,
	    clientId: CLIENT_ID_1.default,
	    CLIENT_INFO: CLIENT_INFO_1.default,
	    clientInfo: CLIENT_INFO_1.default,
	    CLIENT_KILL: CLIENT_KILL_1.default,
	    clientKill: CLIENT_KILL_1.default,
	    CLIENT_LIST: CLIENT_LIST_1.default,
	    clientList: CLIENT_LIST_1.default,
	    'CLIENT_NO-EVICT': CLIENT_NO_EVICT_1.default,
	    clientNoEvict: CLIENT_NO_EVICT_1.default,
	    'CLIENT_NO-TOUCH': CLIENT_NO_TOUCH_1.default,
	    clientNoTouch: CLIENT_NO_TOUCH_1.default,
	    CLIENT_PAUSE: CLIENT_PAUSE_1.default,
	    clientPause: CLIENT_PAUSE_1.default,
	    CLIENT_SETNAME: CLIENT_SETNAME_1.default,
	    clientSetName: CLIENT_SETNAME_1.default,
	    CLIENT_TRACKING: CLIENT_TRACKING_1.default,
	    clientTracking: CLIENT_TRACKING_1.default,
	    CLIENT_TRACKINGINFO: CLIENT_TRACKINGINFO_1.default,
	    clientTrackingInfo: CLIENT_TRACKINGINFO_1.default,
	    CLIENT_UNPAUSE: CLIENT_UNPAUSE_1.default,
	    clientUnpause: CLIENT_UNPAUSE_1.default,
	    CLUSTER_ADDSLOTS: CLUSTER_ADDSLOTS_1.default,
	    clusterAddSlots: CLUSTER_ADDSLOTS_1.default,
	    CLUSTER_ADDSLOTSRANGE: CLUSTER_ADDSLOTSRANGE_1.default,
	    clusterAddSlotsRange: CLUSTER_ADDSLOTSRANGE_1.default,
	    CLUSTER_BUMPEPOCH: CLUSTER_BUMPEPOCH_1.default,
	    clusterBumpEpoch: CLUSTER_BUMPEPOCH_1.default,
	    'CLUSTER_COUNT-FAILURE-REPORTS': CLUSTER_COUNT_FAILURE_REPORTS_1.default,
	    clusterCountFailureReports: CLUSTER_COUNT_FAILURE_REPORTS_1.default,
	    CLUSTER_COUNTKEYSINSLOT: CLUSTER_COUNTKEYSINSLOT_1.default,
	    clusterCountKeysInSlot: CLUSTER_COUNTKEYSINSLOT_1.default,
	    CLUSTER_DELSLOTS: CLUSTER_DELSLOTS_1.default,
	    clusterDelSlots: CLUSTER_DELSLOTS_1.default,
	    CLUSTER_DELSLOTSRANGE: CLUSTER_DELSLOTSRANGE_1.default,
	    clusterDelSlotsRange: CLUSTER_DELSLOTSRANGE_1.default,
	    CLUSTER_FAILOVER: CLUSTER_FAILOVER_1.default,
	    clusterFailover: CLUSTER_FAILOVER_1.default,
	    CLUSTER_FLUSHSLOTS: CLUSTER_FLUSHSLOTS_1.default,
	    clusterFlushSlots: CLUSTER_FLUSHSLOTS_1.default,
	    CLUSTER_FORGET: CLUSTER_FORGET_1.default,
	    clusterForget: CLUSTER_FORGET_1.default,
	    CLUSTER_GETKEYSINSLOT: CLUSTER_GETKEYSINSLOT_1.default,
	    clusterGetKeysInSlot: CLUSTER_GETKEYSINSLOT_1.default,
	    CLUSTER_INFO: CLUSTER_INFO_1.default,
	    clusterInfo: CLUSTER_INFO_1.default,
	    CLUSTER_KEYSLOT: CLUSTER_KEYSLOT_1.default,
	    clusterKeySlot: CLUSTER_KEYSLOT_1.default,
	    CLUSTER_LINKS: CLUSTER_LINKS_1.default,
	    clusterLinks: CLUSTER_LINKS_1.default,
	    CLUSTER_MEET: CLUSTER_MEET_1.default,
	    clusterMeet: CLUSTER_MEET_1.default,
	    CLUSTER_MYID: CLUSTER_MYID_1.default,
	    clusterMyId: CLUSTER_MYID_1.default,
	    CLUSTER_MYSHARDID: CLUSTER_MYSHARDID_1.default,
	    clusterMyShardId: CLUSTER_MYSHARDID_1.default,
	    CLUSTER_NODES: CLUSTER_NODES_1.default,
	    clusterNodes: CLUSTER_NODES_1.default,
	    CLUSTER_REPLICAS: CLUSTER_REPLICAS_1.default,
	    clusterReplicas: CLUSTER_REPLICAS_1.default,
	    CLUSTER_REPLICATE: CLUSTER_REPLICATE_1.default,
	    clusterReplicate: CLUSTER_REPLICATE_1.default,
	    CLUSTER_RESET: CLUSTER_RESET_1.default,
	    clusterReset: CLUSTER_RESET_1.default,
	    CLUSTER_SAVECONFIG: CLUSTER_SAVECONFIG_1.default,
	    clusterSaveConfig: CLUSTER_SAVECONFIG_1.default,
	    'CLUSTER_SET-CONFIG-EPOCH': CLUSTER_SET_CONFIG_EPOCH_1.default,
	    clusterSetConfigEpoch: CLUSTER_SET_CONFIG_EPOCH_1.default,
	    CLUSTER_SETSLOT: CLUSTER_SETSLOT_1.default,
	    clusterSetSlot: CLUSTER_SETSLOT_1.default,
	    CLUSTER_SLOTS: CLUSTER_SLOTS_1.default,
	    clusterSlots: CLUSTER_SLOTS_1.default,
	    COMMAND_COUNT: COMMAND_COUNT_1.default,
	    commandCount: COMMAND_COUNT_1.default,
	    COMMAND_GETKEYS: COMMAND_GETKEYS_1.default,
	    commandGetKeys: COMMAND_GETKEYS_1.default,
	    COMMAND_GETKEYSANDFLAGS: COMMAND_GETKEYSANDFLAGS_1.default,
	    commandGetKeysAndFlags: COMMAND_GETKEYSANDFLAGS_1.default,
	    COMMAND_INFO: COMMAND_INFO_1.default,
	    commandInfo: COMMAND_INFO_1.default,
	    COMMAND_LIST: COMMAND_LIST_1.default,
	    commandList: COMMAND_LIST_1.default,
	    COMMAND: COMMAND_1.default,
	    command: COMMAND_1.default,
	    CONFIG_GET: CONFIG_GET_1.default,
	    configGet: CONFIG_GET_1.default,
	    CONFIG_RESETASTAT: CONFIG_RESETSTAT_1.default,
	    configResetStat: CONFIG_RESETSTAT_1.default,
	    CONFIG_REWRITE: CONFIG_REWRITE_1.default,
	    configRewrite: CONFIG_REWRITE_1.default,
	    CONFIG_SET: CONFIG_SET_1.default,
	    configSet: CONFIG_SET_1.default,
	    COPY: COPY_1.default,
	    copy: COPY_1.default,
	    DBSIZE: DBSIZE_1.default,
	    dbSize: DBSIZE_1.default,
	    DECR: DECR_1.default,
	    decr: DECR_1.default,
	    DECRBY: DECRBY_1.default,
	    decrBy: DECRBY_1.default,
	    DEL: DEL_1.default,
	    del: DEL_1.default,
	    DUMP: DUMP_1.default,
	    dump: DUMP_1.default,
	    ECHO: ECHO_1.default,
	    echo: ECHO_1.default,
	    EVAL_RO: EVAL_RO_1.default,
	    evalRo: EVAL_RO_1.default,
	    EVAL: EVAL_1.default,
	    eval: EVAL_1.default,
	    EVALSHA_RO: EVALSHA_RO_1.default,
	    evalShaRo: EVALSHA_RO_1.default,
	    EVALSHA: EVALSHA_1.default,
	    evalSha: EVALSHA_1.default,
	    EXISTS: EXISTS_1.default,
	    exists: EXISTS_1.default,
	    EXPIRE: EXPIRE_1.default,
	    expire: EXPIRE_1.default,
	    EXPIREAT: EXPIREAT_1.default,
	    expireAt: EXPIREAT_1.default,
	    EXPIRETIME: EXPIRETIME_1.default,
	    expireTime: EXPIRETIME_1.default,
	    FLUSHALL: FLUSHALL_1.default,
	    flushAll: FLUSHALL_1.default,
	    FLUSHDB: FLUSHDB_1.default,
	    flushDb: FLUSHDB_1.default,
	    FCALL: FCALL_1.default,
	    fCall: FCALL_1.default,
	    FCALL_RO: FCALL_RO_1.default,
	    fCallRo: FCALL_RO_1.default,
	    FUNCTION_DELETE: FUNCTION_DELETE_1.default,
	    functionDelete: FUNCTION_DELETE_1.default,
	    FUNCTION_DUMP: FUNCTION_DUMP_1.default,
	    functionDump: FUNCTION_DUMP_1.default,
	    FUNCTION_FLUSH: FUNCTION_FLUSH_1.default,
	    functionFlush: FUNCTION_FLUSH_1.default,
	    FUNCTION_KILL: FUNCTION_KILL_1.default,
	    functionKill: FUNCTION_KILL_1.default,
	    FUNCTION_LIST_WITHCODE: FUNCTION_LIST_WITHCODE_1.default,
	    functionListWithCode: FUNCTION_LIST_WITHCODE_1.default,
	    FUNCTION_LIST: FUNCTION_LIST_1.default,
	    functionList: FUNCTION_LIST_1.default,
	    FUNCTION_LOAD: FUNCTION_LOAD_1.default,
	    functionLoad: FUNCTION_LOAD_1.default,
	    FUNCTION_RESTORE: FUNCTION_RESTORE_1.default,
	    functionRestore: FUNCTION_RESTORE_1.default,
	    FUNCTION_STATS: FUNCTION_STATS_1.default,
	    functionStats: FUNCTION_STATS_1.default,
	    GEOADD: GEOADD_1.default,
	    geoAdd: GEOADD_1.default,
	    GEODIST: GEODIST_1.default,
	    geoDist: GEODIST_1.default,
	    GEOHASH: GEOHASH_1.default,
	    geoHash: GEOHASH_1.default,
	    GEOPOS: GEOPOS_1.default,
	    geoPos: GEOPOS_1.default,
	    GEORADIUS_RO_WITH: GEORADIUS_RO_WITH_1.default,
	    geoRadiusRoWith: GEORADIUS_RO_WITH_1.default,
	    GEORADIUS_RO: GEORADIUS_RO_1.default,
	    geoRadiusRo: GEORADIUS_RO_1.default,
	    GEORADIUS_STORE: GEORADIUS_STORE_1.default,
	    geoRadiusStore: GEORADIUS_STORE_1.default,
	    GEORADIUS_WITH: GEORADIUS_WITH_1.default,
	    geoRadiusWith: GEORADIUS_WITH_1.default,
	    GEORADIUS: GEORADIUS_1.default,
	    geoRadius: GEORADIUS_1.default,
	    GEORADIUSBYMEMBER_RO_WITH: GEORADIUSBYMEMBER_RO_WITH_1.default,
	    geoRadiusByMemberRoWith: GEORADIUSBYMEMBER_RO_WITH_1.default,
	    GEORADIUSBYMEMBER_RO: GEORADIUSBYMEMBER_RO_1.default,
	    geoRadiusByMemberRo: GEORADIUSBYMEMBER_RO_1.default,
	    GEORADIUSBYMEMBER_STORE: GEORADIUSBYMEMBER_STORE_1.default,
	    geoRadiusByMemberStore: GEORADIUSBYMEMBER_STORE_1.default,
	    GEORADIUSBYMEMBER_WITH: GEORADIUSBYMEMBER_WITH_1.default,
	    geoRadiusByMemberWith: GEORADIUSBYMEMBER_WITH_1.default,
	    GEORADIUSBYMEMBER: GEORADIUSBYMEMBER_1.default,
	    geoRadiusByMember: GEORADIUSBYMEMBER_1.default,
	    GEOSEARCH_WITH: GEOSEARCH_WITH_1.default,
	    geoSearchWith: GEOSEARCH_WITH_1.default,
	    GEOSEARCH: GEOSEARCH_1.default,
	    geoSearch: GEOSEARCH_1.default,
	    GEOSEARCHSTORE: GEOSEARCHSTORE_1.default,
	    geoSearchStore: GEOSEARCHSTORE_1.default,
	    GET: GET_1.default,
	    get: GET_1.default,
	    GETBIT: GETBIT_1.default,
	    getBit: GETBIT_1.default,
	    GETDEL: GETDEL_1.default,
	    getDel: GETDEL_1.default,
	    GETEX: GETEX_1.default,
	    getEx: GETEX_1.default,
	    GETRANGE: GETRANGE_1.default,
	    getRange: GETRANGE_1.default,
	    GETSET: GETSET_1.default,
	    getSet: GETSET_1.default,
	    HDEL: HDEL_1.default,
	    hDel: HDEL_1.default,
	    HELLO: HELLO_1.default,
	    hello: HELLO_1.default,
	    HEXISTS: HEXISTS_1.default,
	    hExists: HEXISTS_1.default,
	    HEXPIRE: HEXPIRE_1.default,
	    hExpire: HEXPIRE_1.default,
	    HEXPIREAT: HEXPIREAT_1.default,
	    hExpireAt: HEXPIREAT_1.default,
	    HEXPIRETIME: HEXPIRETIME_1.default,
	    hExpireTime: HEXPIRETIME_1.default,
	    HGET: HGET_1.default,
	    hGet: HGET_1.default,
	    HGETALL: HGETALL_1.default,
	    hGetAll: HGETALL_1.default,
	    HGETDEL: HGETDEL_1.default,
	    hGetDel: HGETDEL_1.default,
	    HGETEX: HGETEX_1.default,
	    hGetEx: HGETEX_1.default,
	    HINCRBY: HINCRBY_1.default,
	    hIncrBy: HINCRBY_1.default,
	    HINCRBYFLOAT: HINCRBYFLOAT_1.default,
	    hIncrByFloat: HINCRBYFLOAT_1.default,
	    HKEYS: HKEYS_1.default,
	    hKeys: HKEYS_1.default,
	    HLEN: HLEN_1.default,
	    hLen: HLEN_1.default,
	    HMGET: HMGET_1.default,
	    hmGet: HMGET_1.default,
	    HPERSIST: HPERSIST_1.default,
	    hPersist: HPERSIST_1.default,
	    HPEXPIRE: HPEXPIRE_1.default,
	    hpExpire: HPEXPIRE_1.default,
	    HPEXPIREAT: HPEXPIREAT_1.default,
	    hpExpireAt: HPEXPIREAT_1.default,
	    HPEXPIRETIME: HPEXPIRETIME_1.default,
	    hpExpireTime: HPEXPIRETIME_1.default,
	    HPTTL: HPTTL_1.default,
	    hpTTL: HPTTL_1.default,
	    HRANDFIELD_COUNT_WITHVALUES: HRANDFIELD_COUNT_WITHVALUES_1.default,
	    hRandFieldCountWithValues: HRANDFIELD_COUNT_WITHVALUES_1.default,
	    HRANDFIELD_COUNT: HRANDFIELD_COUNT_1.default,
	    hRandFieldCount: HRANDFIELD_COUNT_1.default,
	    HRANDFIELD: HRANDFIELD_1.default,
	    hRandField: HRANDFIELD_1.default,
	    HSCAN: HSCAN_1.default,
	    hScan: HSCAN_1.default,
	    HSCAN_NOVALUES: HSCAN_NOVALUES_1.default,
	    hScanNoValues: HSCAN_NOVALUES_1.default,
	    HSET: HSET_1.default,
	    hSet: HSET_1.default,
	    HSETEX: HSETEX_1.default,
	    hSetEx: HSETEX_1.default,
	    HSETNX: HSETNX_1.default,
	    hSetNX: HSETNX_1.default,
	    HSTRLEN: HSTRLEN_1.default,
	    hStrLen: HSTRLEN_1.default,
	    HTTL: HTTL_1.default,
	    hTTL: HTTL_1.default,
	    HVALS: HVALS_1.default,
	    hVals: HVALS_1.default,
	    INCR: INCR_1.default,
	    incr: INCR_1.default,
	    INCRBY: INCRBY_1.default,
	    incrBy: INCRBY_1.default,
	    INCRBYFLOAT: INCRBYFLOAT_1.default,
	    incrByFloat: INCRBYFLOAT_1.default,
	    INFO: INFO_1.default,
	    info: INFO_1.default,
	    KEYS: KEYS_1.default,
	    keys: KEYS_1.default,
	    LASTSAVE: LASTSAVE_1.default,
	    lastSave: LASTSAVE_1.default,
	    LATENCY_DOCTOR: LATENCY_DOCTOR_1.default,
	    latencyDoctor: LATENCY_DOCTOR_1.default,
	    LATENCY_GRAPH: LATENCY_GRAPH_1.default,
	    latencyGraph: LATENCY_GRAPH_1.default,
	    LATENCY_HISTORY: LATENCY_HISTORY_1.default,
	    latencyHistory: LATENCY_HISTORY_1.default,
	    LATENCY_LATEST: LATENCY_LATEST_1.default,
	    latencyLatest: LATENCY_LATEST_1.default,
	    LCS_IDX_WITHMATCHLEN: LCS_IDX_WITHMATCHLEN_1.default,
	    lcsIdxWithMatchLen: LCS_IDX_WITHMATCHLEN_1.default,
	    LCS_IDX: LCS_IDX_1.default,
	    lcsIdx: LCS_IDX_1.default,
	    LCS_LEN: LCS_LEN_1.default,
	    lcsLen: LCS_LEN_1.default,
	    LCS: LCS_1.default,
	    lcs: LCS_1.default,
	    LINDEX: LINDEX_1.default,
	    lIndex: LINDEX_1.default,
	    LINSERT: LINSERT_1.default,
	    lInsert: LINSERT_1.default,
	    LLEN: LLEN_1.default,
	    lLen: LLEN_1.default,
	    LMOVE: LMOVE_1.default,
	    lMove: LMOVE_1.default,
	    LMPOP: LMPOP_1.default,
	    lmPop: LMPOP_1.default,
	    LOLWUT: LOLWUT_1.default,
	    LPOP_COUNT: LPOP_COUNT_1.default,
	    lPopCount: LPOP_COUNT_1.default,
	    LPOP: LPOP_1.default,
	    lPop: LPOP_1.default,
	    LPOS_COUNT: LPOS_COUNT_1.default,
	    lPosCount: LPOS_COUNT_1.default,
	    LPOS: LPOS_1.default,
	    lPos: LPOS_1.default,
	    LPUSH: LPUSH_1.default,
	    lPush: LPUSH_1.default,
	    LPUSHX: LPUSHX_1.default,
	    lPushX: LPUSHX_1.default,
	    LRANGE: LRANGE_1.default,
	    lRange: LRANGE_1.default,
	    LREM: LREM_1.default,
	    lRem: LREM_1.default,
	    LSET: LSET_1.default,
	    lSet: LSET_1.default,
	    LTRIM: LTRIM_1.default,
	    lTrim: LTRIM_1.default,
	    MEMORY_DOCTOR: MEMORY_DOCTOR_1.default,
	    memoryDoctor: MEMORY_DOCTOR_1.default,
	    'MEMORY_MALLOC-STATS': MEMORY_MALLOC_STATS_1.default,
	    memoryMallocStats: MEMORY_MALLOC_STATS_1.default,
	    MEMORY_PURGE: MEMORY_PURGE_1.default,
	    memoryPurge: MEMORY_PURGE_1.default,
	    MEMORY_STATS: MEMORY_STATS_1.default,
	    memoryStats: MEMORY_STATS_1.default,
	    MEMORY_USAGE: MEMORY_USAGE_1.default,
	    memoryUsage: MEMORY_USAGE_1.default,
	    MGET: MGET_1.default,
	    mGet: MGET_1.default,
	    MIGRATE: MIGRATE_1.default,
	    migrate: MIGRATE_1.default,
	    MODULE_LIST: MODULE_LIST_1.default,
	    moduleList: MODULE_LIST_1.default,
	    MODULE_LOAD: MODULE_LOAD_1.default,
	    moduleLoad: MODULE_LOAD_1.default,
	    MODULE_UNLOAD: MODULE_UNLOAD_1.default,
	    moduleUnload: MODULE_UNLOAD_1.default,
	    MOVE: MOVE_1.default,
	    move: MOVE_1.default,
	    MSET: MSET_1.default,
	    mSet: MSET_1.default,
	    MSETNX: MSETNX_1.default,
	    mSetNX: MSETNX_1.default,
	    OBJECT_ENCODING: OBJECT_ENCODING_1.default,
	    objectEncoding: OBJECT_ENCODING_1.default,
	    OBJECT_FREQ: OBJECT_FREQ_1.default,
	    objectFreq: OBJECT_FREQ_1.default,
	    OBJECT_IDLETIME: OBJECT_IDLETIME_1.default,
	    objectIdleTime: OBJECT_IDLETIME_1.default,
	    OBJECT_REFCOUNT: OBJECT_REFCOUNT_1.default,
	    objectRefCount: OBJECT_REFCOUNT_1.default,
	    PERSIST: PERSIST_1.default,
	    persist: PERSIST_1.default,
	    PEXPIRE: PEXPIRE_1.default,
	    pExpire: PEXPIRE_1.default,
	    PEXPIREAT: PEXPIREAT_1.default,
	    pExpireAt: PEXPIREAT_1.default,
	    PEXPIRETIME: PEXPIRETIME_1.default,
	    pExpireTime: PEXPIRETIME_1.default,
	    PFADD: PFADD_1.default,
	    pfAdd: PFADD_1.default,
	    PFCOUNT: PFCOUNT_1.default,
	    pfCount: PFCOUNT_1.default,
	    PFMERGE: PFMERGE_1.default,
	    pfMerge: PFMERGE_1.default,
	    PING: PING_1.default,
	    /**
	     * ping jsdoc
	     */
	    ping: PING_1.default,
	    PSETEX: PSETEX_1.default,
	    pSetEx: PSETEX_1.default,
	    PTTL: PTTL_1.default,
	    pTTL: PTTL_1.default,
	    PUBLISH: PUBLISH_1.default,
	    publish: PUBLISH_1.default,
	    PUBSUB_CHANNELS: PUBSUB_CHANNELS_1.default,
	    pubSubChannels: PUBSUB_CHANNELS_1.default,
	    PUBSUB_NUMPAT: PUBSUB_NUMPAT_1.default,
	    pubSubNumPat: PUBSUB_NUMPAT_1.default,
	    PUBSUB_NUMSUB: PUBSUB_NUMSUB_1.default,
	    pubSubNumSub: PUBSUB_NUMSUB_1.default,
	    PUBSUB_SHARDNUMSUB: PUBSUB_SHARDNUMSUB_1.default,
	    pubSubShardNumSub: PUBSUB_SHARDNUMSUB_1.default,
	    PUBSUB_SHARDCHANNELS: PUBSUB_SHARDCHANNELS_1.default,
	    pubSubShardChannels: PUBSUB_SHARDCHANNELS_1.default,
	    RANDOMKEY: RANDOMKEY_1.default,
	    randomKey: RANDOMKEY_1.default,
	    READONLY: READONLY_1.default,
	    readonly: READONLY_1.default,
	    RENAME: RENAME_1.default,
	    rename: RENAME_1.default,
	    RENAMENX: RENAMENX_1.default,
	    renameNX: RENAMENX_1.default,
	    REPLICAOF: REPLICAOF_1.default,
	    replicaOf: REPLICAOF_1.default,
	    'RESTORE-ASKING': RESTORE_ASKING_1.default,
	    restoreAsking: RESTORE_ASKING_1.default,
	    RESTORE: RESTORE_1.default,
	    restore: RESTORE_1.default,
	    RPOP_COUNT: RPOP_COUNT_1.default,
	    rPopCount: RPOP_COUNT_1.default,
	    ROLE: ROLE_1.default,
	    role: ROLE_1.default,
	    RPOP: RPOP_1.default,
	    rPop: RPOP_1.default,
	    RPOPLPUSH: RPOPLPUSH_1.default,
	    rPopLPush: RPOPLPUSH_1.default,
	    RPUSH: RPUSH_1.default,
	    rPush: RPUSH_1.default,
	    RPUSHX: RPUSHX_1.default,
	    rPushX: RPUSHX_1.default,
	    SADD: SADD_1.default,
	    sAdd: SADD_1.default,
	    SCAN: SCAN_1.default,
	    scan: SCAN_1.default,
	    SCARD: SCARD_1.default,
	    sCard: SCARD_1.default,
	    SCRIPT_DEBUG: SCRIPT_DEBUG_1.default,
	    scriptDebug: SCRIPT_DEBUG_1.default,
	    SCRIPT_EXISTS: SCRIPT_EXISTS_1.default,
	    scriptExists: SCRIPT_EXISTS_1.default,
	    SCRIPT_FLUSH: SCRIPT_FLUSH_1.default,
	    scriptFlush: SCRIPT_FLUSH_1.default,
	    SCRIPT_KILL: SCRIPT_KILL_1.default,
	    scriptKill: SCRIPT_KILL_1.default,
	    SCRIPT_LOAD: SCRIPT_LOAD_1.default,
	    scriptLoad: SCRIPT_LOAD_1.default,
	    SDIFF: SDIFF_1.default,
	    sDiff: SDIFF_1.default,
	    SDIFFSTORE: SDIFFSTORE_1.default,
	    sDiffStore: SDIFFSTORE_1.default,
	    SET: SET_1.default,
	    set: SET_1.default,
	    SETBIT: SETBIT_1.default,
	    setBit: SETBIT_1.default,
	    SETEX: SETEX_1.default,
	    setEx: SETEX_1.default,
	    SETNX: SETNX_1.default,
	    setNX: SETNX_1.default,
	    SETRANGE: SETRANGE_1.default,
	    setRange: SETRANGE_1.default,
	    SINTER: SINTER_1.default,
	    sInter: SINTER_1.default,
	    SINTERCARD: SINTERCARD_1.default,
	    sInterCard: SINTERCARD_1.default,
	    SINTERSTORE: SINTERSTORE_1.default,
	    sInterStore: SINTERSTORE_1.default,
	    SISMEMBER: SISMEMBER_1.default,
	    sIsMember: SISMEMBER_1.default,
	    SMEMBERS: SMEMBERS_1.default,
	    sMembers: SMEMBERS_1.default,
	    SMISMEMBER: SMISMEMBER_1.default,
	    smIsMember: SMISMEMBER_1.default,
	    SMOVE: SMOVE_1.default,
	    sMove: SMOVE_1.default,
	    SORT_RO: SORT_RO_1.default,
	    sortRo: SORT_RO_1.default,
	    SORT_STORE: SORT_STORE_1.default,
	    sortStore: SORT_STORE_1.default,
	    SORT: SORT_1.default,
	    sort: SORT_1.default,
	    SPOP_COUNT: SPOP_COUNT_1.default,
	    sPopCount: SPOP_COUNT_1.default,
	    SPOP: SPOP_1.default,
	    sPop: SPOP_1.default,
	    SPUBLISH: SPUBLISH_1.default,
	    sPublish: SPUBLISH_1.default,
	    SRANDMEMBER_COUNT: SRANDMEMBER_COUNT_1.default,
	    sRandMemberCount: SRANDMEMBER_COUNT_1.default,
	    SRANDMEMBER: SRANDMEMBER_1.default,
	    sRandMember: SRANDMEMBER_1.default,
	    SREM: SREM_1.default,
	    sRem: SREM_1.default,
	    SSCAN: SSCAN_1.default,
	    sScan: SSCAN_1.default,
	    STRLEN: STRLEN_1.default,
	    strLen: STRLEN_1.default,
	    SUNION: SUNION_1.default,
	    sUnion: SUNION_1.default,
	    SUNIONSTORE: SUNIONSTORE_1.default,
	    sUnionStore: SUNIONSTORE_1.default,
	    SWAPDB: SWAPDB_1.default,
	    swapDb: SWAPDB_1.default,
	    TIME: TIME_1.default,
	    time: TIME_1.default,
	    TOUCH: TOUCH_1.default,
	    touch: TOUCH_1.default,
	    TTL: TTL_1.default,
	    ttl: TTL_1.default,
	    TYPE: TYPE_1.default,
	    type: TYPE_1.default,
	    UNLINK: UNLINK_1.default,
	    unlink: UNLINK_1.default,
	    WAIT: WAIT_1.default,
	    wait: WAIT_1.default,
	    XACK: XACK_1.default,
	    xAck: XACK_1.default,
	    XADD_NOMKSTREAM: XADD_NOMKSTREAM_1.default,
	    xAddNoMkStream: XADD_NOMKSTREAM_1.default,
	    XADD: XADD_1.default,
	    xAdd: XADD_1.default,
	    XAUTOCLAIM_JUSTID: XAUTOCLAIM_JUSTID_1.default,
	    xAutoClaimJustId: XAUTOCLAIM_JUSTID_1.default,
	    XAUTOCLAIM: XAUTOCLAIM_1.default,
	    xAutoClaim: XAUTOCLAIM_1.default,
	    XCLAIM_JUSTID: XCLAIM_JUSTID_1.default,
	    xClaimJustId: XCLAIM_JUSTID_1.default,
	    XCLAIM: XCLAIM_1.default,
	    xClaim: XCLAIM_1.default,
	    XDEL: XDEL_1.default,
	    xDel: XDEL_1.default,
	    XGROUP_CREATE: XGROUP_CREATE_1.default,
	    xGroupCreate: XGROUP_CREATE_1.default,
	    XGROUP_CREATECONSUMER: XGROUP_CREATECONSUMER_1.default,
	    xGroupCreateConsumer: XGROUP_CREATECONSUMER_1.default,
	    XGROUP_DELCONSUMER: XGROUP_DELCONSUMER_1.default,
	    xGroupDelConsumer: XGROUP_DELCONSUMER_1.default,
	    XGROUP_DESTROY: XGROUP_DESTROY_1.default,
	    xGroupDestroy: XGROUP_DESTROY_1.default,
	    XGROUP_SETID: XGROUP_SETID_1.default,
	    xGroupSetId: XGROUP_SETID_1.default,
	    XINFO_CONSUMERS: XINFO_CONSUMERS_1.default,
	    xInfoConsumers: XINFO_CONSUMERS_1.default,
	    XINFO_GROUPS: XINFO_GROUPS_1.default,
	    xInfoGroups: XINFO_GROUPS_1.default,
	    XINFO_STREAM: XINFO_STREAM_1.default,
	    xInfoStream: XINFO_STREAM_1.default,
	    XLEN: XLEN_1.default,
	    xLen: XLEN_1.default,
	    XPENDING_RANGE: XPENDING_RANGE_1.default,
	    xPendingRange: XPENDING_RANGE_1.default,
	    XPENDING: XPENDING_1.default,
	    xPending: XPENDING_1.default,
	    XRANGE: XRANGE_1.default,
	    xRange: XRANGE_1.default,
	    XREAD: XREAD_1.default,
	    xRead: XREAD_1.default,
	    XREADGROUP: XREADGROUP_1.default,
	    xReadGroup: XREADGROUP_1.default,
	    XREVRANGE: XREVRANGE_1.default,
	    xRevRange: XREVRANGE_1.default,
	    XSETID: XSETID_1.default,
	    xSetId: XSETID_1.default,
	    XTRIM: XTRIM_1.default,
	    xTrim: XTRIM_1.default,
	    ZADD_INCR: ZADD_INCR_1.default,
	    zAddIncr: ZADD_INCR_1.default,
	    ZADD: ZADD_1.default,
	    zAdd: ZADD_1.default,
	    ZCARD: ZCARD_1.default,
	    zCard: ZCARD_1.default,
	    ZCOUNT: ZCOUNT_1.default,
	    zCount: ZCOUNT_1.default,
	    ZDIFF_WITHSCORES: ZDIFF_WITHSCORES_1.default,
	    zDiffWithScores: ZDIFF_WITHSCORES_1.default,
	    ZDIFF: ZDIFF_1.default,
	    zDiff: ZDIFF_1.default,
	    ZDIFFSTORE: ZDIFFSTORE_1.default,
	    zDiffStore: ZDIFFSTORE_1.default,
	    ZINCRBY: ZINCRBY_1.default,
	    zIncrBy: ZINCRBY_1.default,
	    ZINTER_WITHSCORES: ZINTER_WITHSCORES_1.default,
	    zInterWithScores: ZINTER_WITHSCORES_1.default,
	    ZINTER: ZINTER_1.default,
	    zInter: ZINTER_1.default,
	    ZINTERCARD: ZINTERCARD_1.default,
	    zInterCard: ZINTERCARD_1.default,
	    ZINTERSTORE: ZINTERSTORE_1.default,
	    zInterStore: ZINTERSTORE_1.default,
	    ZLEXCOUNT: ZLEXCOUNT_1.default,
	    zLexCount: ZLEXCOUNT_1.default,
	    ZMPOP: ZMPOP_1.default,
	    zmPop: ZMPOP_1.default,
	    ZMSCORE: ZMSCORE_1.default,
	    zmScore: ZMSCORE_1.default,
	    ZPOPMAX_COUNT: ZPOPMAX_COUNT_1.default,
	    zPopMaxCount: ZPOPMAX_COUNT_1.default,
	    ZPOPMAX: ZPOPMAX_1.default,
	    zPopMax: ZPOPMAX_1.default,
	    ZPOPMIN_COUNT: ZPOPMIN_COUNT_1.default,
	    zPopMinCount: ZPOPMIN_COUNT_1.default,
	    ZPOPMIN: ZPOPMIN_1.default,
	    zPopMin: ZPOPMIN_1.default,
	    ZRANDMEMBER_COUNT_WITHSCORES: ZRANDMEMBER_COUNT_WITHSCORES_1.default,
	    zRandMemberCountWithScores: ZRANDMEMBER_COUNT_WITHSCORES_1.default,
	    ZRANDMEMBER_COUNT: ZRANDMEMBER_COUNT_1.default,
	    zRandMemberCount: ZRANDMEMBER_COUNT_1.default,
	    ZRANDMEMBER: ZRANDMEMBER_1.default,
	    zRandMember: ZRANDMEMBER_1.default,
	    ZRANGE_WITHSCORES: ZRANGE_WITHSCORES_1.default,
	    zRangeWithScores: ZRANGE_WITHSCORES_1.default,
	    ZRANGE: ZRANGE_1.default,
	    zRange: ZRANGE_1.default,
	    ZRANGEBYLEX: ZRANGEBYLEX_1.default,
	    zRangeByLex: ZRANGEBYLEX_1.default,
	    ZRANGEBYSCORE_WITHSCORES: ZRANGEBYSCORE_WITHSCORES_1.default,
	    zRangeByScoreWithScores: ZRANGEBYSCORE_WITHSCORES_1.default,
	    ZRANGEBYSCORE: ZRANGEBYSCORE_1.default,
	    zRangeByScore: ZRANGEBYSCORE_1.default,
	    ZRANGESTORE: ZRANGESTORE_1.default,
	    zRangeStore: ZRANGESTORE_1.default,
	    ZRANK_WITHSCORE: ZRANK_WITHSCORE_1.default,
	    zRankWithScore: ZRANK_WITHSCORE_1.default,
	    ZRANK: ZRANK_1.default,
	    zRank: ZRANK_1.default,
	    ZREM: ZREM_1.default,
	    zRem: ZREM_1.default,
	    ZREMRANGEBYLEX: ZREMRANGEBYLEX_1.default,
	    zRemRangeByLex: ZREMRANGEBYLEX_1.default,
	    ZREMRANGEBYRANK: ZREMRANGEBYRANK_1.default,
	    zRemRangeByRank: ZREMRANGEBYRANK_1.default,
	    ZREMRANGEBYSCORE: ZREMRANGEBYSCORE_1.default,
	    zRemRangeByScore: ZREMRANGEBYSCORE_1.default,
	    ZREVRANK: ZREVRANK_1.default,
	    zRevRank: ZREVRANK_1.default,
	    ZSCAN: ZSCAN_1.default,
	    zScan: ZSCAN_1.default,
	    ZSCORE: ZSCORE_1.default,
	    zScore: ZSCORE_1.default,
	    ZUNION_WITHSCORES: ZUNION_WITHSCORES_1.default,
	    zUnionWithScores: ZUNION_WITHSCORES_1.default,
	    ZUNION: ZUNION_1.default,
	    zUnion: ZUNION_1.default,
	    ZUNIONSTORE: ZUNIONSTORE_1.default,
	    zUnionStore: ZUNIONSTORE_1.default,
	    VADD: VADD_1.default,
	    vAdd: VADD_1.default,
	    VCARD: VCARD_1.default,
	    vCard: VCARD_1.default,
	    VDIM: VDIM_1.default,
	    vDim: VDIM_1.default,
	    VEMB: VEMB_1.default,
	    vEmb: VEMB_1.default,
	    VEMB_RAW: VEMB_RAW_1.default,
	    vEmbRaw: VEMB_RAW_1.default,
	    VGETATTR: VGETATTR_1.default,
	    vGetAttr: VGETATTR_1.default,
	    VINFO: VINFO_1.default,
	    vInfo: VINFO_1.default,
	    VLINKS: VLINKS_1.default,
	    vLinks: VLINKS_1.default,
	    VLINKS_WITHSCORES: VLINKS_WITHSCORES_1.default,
	    vLinksWithScores: VLINKS_WITHSCORES_1.default,
	    VRANDMEMBER: VRANDMEMBER_1.default,
	    vRandMember: VRANDMEMBER_1.default,
	    VREM: VREM_1.default,
	    vRem: VREM_1.default,
	    VSETATTR: VSETATTR_1.default,
	    vSetAttr: VSETATTR_1.default,
	    VSIM: VSIM_1.default,
	    vSim: VSIM_1.default,
	    VSIM_WITHSCORES: VSIM_WITHSCORES_1.default,
	    vSimWithScores: VSIM_WITHSCORES_1.default
	};
	
	return commands$5;
}

var socket = {};

var hasRequiredSocket;

function requireSocket () {
	if (hasRequiredSocket) return socket;
	hasRequiredSocket = 1;
	var __importDefault = (socket && socket.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(socket, "__esModule", { value: true });
	const node_events_1 = require$$0$1;
	const node_net_1 = __importDefault(require$$1);
	const node_tls_1 = __importDefault(require$$2);
	const errors_1 = requireErrors();
	const promises_1 = require$$4;
	class RedisSocket extends node_events_1.EventEmitter {
	    #initiator;
	    #connectTimeout;
	    #reconnectStrategy;
	    #socketFactory;
	    #socketTimeout;
	    #socket;
	    #isOpen = false;
	    get isOpen() {
	        return this.#isOpen;
	    }
	    #isReady = false;
	    get isReady() {
	        return this.#isReady;
	    }
	    #isSocketUnrefed = false;
	    #socketEpoch = 0;
	    get socketEpoch() {
	        return this.#socketEpoch;
	    }
	    constructor(initiator, options) {
	        super();
	        this.#initiator = initiator;
	        this.#connectTimeout = options?.connectTimeout ?? 5000;
	        this.#reconnectStrategy = this.#createReconnectStrategy(options);
	        this.#socketFactory = this.#createSocketFactory(options);
	        this.#socketTimeout = options?.socketTimeout;
	    }
	    #createReconnectStrategy(options) {
	        const strategy = options?.reconnectStrategy;
	        if (strategy === false || typeof strategy === 'number') {
	            return () => strategy;
	        }
	        if (strategy) {
	            return (retries, cause) => {
	                try {
	                    const retryIn = strategy(retries, cause);
	                    if (retryIn !== false && !(retryIn instanceof Error) && typeof retryIn !== 'number') {
	                        throw new TypeError(`Reconnect strategy should return \`false | Error | number\`, got ${retryIn} instead`);
	                    }
	                    return retryIn;
	                }
	                catch (err) {
	                    this.emit('error', err);
	                    return this.defaultReconnectStrategy(retries, err);
	                }
	            };
	        }
	        return this.defaultReconnectStrategy;
	    }
	    #createSocketFactory(options) {
	        // TLS
	        if (options?.tls === true) {
	            const withDefaults = {
	                ...options,
	                port: options?.port ?? 6379,
	                // https://nodejs.org/api/tls.html#tlsconnectoptions-callback "Any socket.connect() option not already listed"
	                // @types/node is... incorrect...
	                // @ts-expect-error
	                noDelay: options?.noDelay ?? true,
	                // https://nodejs.org/api/tls.html#tlsconnectoptions-callback "Any socket.connect() option not already listed"
	                // @types/node is... incorrect...
	                // @ts-expect-error
	                keepAlive: options?.keepAlive ?? true,
	                // https://nodejs.org/api/tls.html#tlsconnectoptions-callback "Any socket.connect() option not already listed"
	                // @types/node is... incorrect...
	                // @ts-expect-error
	                keepAliveInitialDelay: options?.keepAliveInitialDelay ?? 5000,
	                timeout: undefined,
	                onread: undefined,
	                readable: true,
	                writable: true
	            };
	            return {
	                create() {
	                    return node_tls_1.default.connect(withDefaults);
	                },
	                event: 'secureConnect'
	            };
	        }
	        // IPC
	        if (options && 'path' in options) {
	            const withDefaults = {
	                ...options,
	                timeout: undefined,
	                onread: undefined,
	                readable: true,
	                writable: true
	            };
	            return {
	                create() {
	                    return node_net_1.default.createConnection(withDefaults);
	                },
	                event: 'connect'
	            };
	        }
	        // TCP
	        const withDefaults = {
	            ...options,
	            port: options?.port ?? 6379,
	            noDelay: options?.noDelay ?? true,
	            keepAlive: options?.keepAlive ?? true,
	            keepAliveInitialDelay: options?.keepAliveInitialDelay ?? 5000,
	            timeout: undefined,
	            onread: undefined,
	            readable: true,
	            writable: true
	        };
	        return {
	            create() {
	                return node_net_1.default.createConnection(withDefaults);
	            },
	            event: 'connect'
	        };
	    }
	    #shouldReconnect(retries, cause) {
	        const retryIn = this.#reconnectStrategy(retries, cause);
	        if (retryIn === false) {
	            this.#isOpen = false;
	            this.emit('error', cause);
	            return cause;
	        }
	        else if (retryIn instanceof Error) {
	            this.#isOpen = false;
	            this.emit('error', cause);
	            return new errors_1.ReconnectStrategyError(retryIn, cause);
	        }
	        return retryIn;
	    }
	    async connect() {
	        if (this.#isOpen) {
	            throw new Error('Socket already opened');
	        }
	        this.#isOpen = true;
	        return this.#connect();
	    }
	    async #connect() {
	        let retries = 0;
	        do {
	            try {
	                this.#socket = await this.#createSocket();
	                this.emit('connect');
	                try {
	                    await this.#initiator();
	                }
	                catch (err) {
	                    this.#socket.destroy();
	                    this.#socket = undefined;
	                    throw err;
	                }
	                this.#isReady = true;
	                this.#socketEpoch++;
	                this.emit('ready');
	            }
	            catch (err) {
	                const retryIn = this.#shouldReconnect(retries++, err);
	                if (typeof retryIn !== 'number') {
	                    throw retryIn;
	                }
	                this.emit('error', err);
	                await (0, promises_1.setTimeout)(retryIn);
	                this.emit('reconnecting');
	            }
	        } while (this.#isOpen && !this.#isReady);
	    }
	    async #createSocket() {
	        const socket = this.#socketFactory.create();
	        let onTimeout;
	        if (this.#connectTimeout !== undefined) {
	            onTimeout = () => socket.destroy(new errors_1.ConnectionTimeoutError());
	            socket.once('timeout', onTimeout);
	            socket.setTimeout(this.#connectTimeout);
	        }
	        if (this.#isSocketUnrefed) {
	            socket.unref();
	        }
	        await (0, node_events_1.once)(socket, this.#socketFactory.event);
	        if (onTimeout) {
	            socket.removeListener('timeout', onTimeout);
	        }
	        if (this.#socketTimeout) {
	            socket.once('timeout', () => {
	                socket.destroy(new errors_1.SocketTimeoutError(this.#socketTimeout));
	            });
	            socket.setTimeout(this.#socketTimeout);
	        }
	        socket
	            .once('error', err => this.#onSocketError(err))
	            .once('close', hadError => {
	            if (hadError || !this.#isOpen || this.#socket !== socket)
	                return;
	            this.#onSocketError(new errors_1.SocketClosedUnexpectedlyError());
	        })
	            .on('drain', () => this.emit('drain'))
	            .on('data', data => this.emit('data', data));
	        return socket;
	    }
	    #onSocketError(err) {
	        const wasReady = this.#isReady;
	        this.#isReady = false;
	        this.emit('error', err);
	        if (!wasReady || !this.#isOpen || typeof this.#shouldReconnect(0, err) !== 'number')
	            return;
	        this.emit('reconnecting');
	        this.#connect().catch(() => {
	            // the error was already emitted, silently ignore it
	        });
	    }
	    write(iterable) {
	        if (!this.#socket)
	            return;
	        this.#socket.cork();
	        for (const args of iterable) {
	            for (const toWrite of args) {
	                this.#socket.write(toWrite);
	            }
	            if (this.#socket.writableNeedDrain)
	                break;
	        }
	        this.#socket.uncork();
	    }
	    async quit(fn) {
	        if (!this.#isOpen) {
	            throw new errors_1.ClientClosedError();
	        }
	        this.#isOpen = false;
	        const reply = await fn();
	        this.destroySocket();
	        return reply;
	    }
	    close() {
	        if (!this.#isOpen) {
	            throw new errors_1.ClientClosedError();
	        }
	        this.#isOpen = false;
	    }
	    destroy() {
	        if (!this.#isOpen) {
	            throw new errors_1.ClientClosedError();
	        }
	        this.#isOpen = false;
	        this.destroySocket();
	    }
	    destroySocket() {
	        this.#isReady = false;
	        if (this.#socket) {
	            this.#socket.destroy();
	            this.#socket = undefined;
	        }
	        this.emit('end');
	    }
	    ref() {
	        this.#isSocketUnrefed = false;
	        this.#socket?.ref();
	    }
	    unref() {
	        this.#isSocketUnrefed = true;
	        this.#socket?.unref();
	    }
	    defaultReconnectStrategy(retries, cause) {
	        // By default, do not reconnect on socket timeout.
	        if (cause instanceof errors_1.SocketTimeoutError) {
	            return false;
	        }
	        // Generate a random jitter between 0 – 200 ms:
	        const jitter = Math.floor(Math.random() * 200);
	        // Delay is an exponential back off, (times^2) * 50 ms, with a maximum value of 2000 ms:
	        const delay = Math.min(Math.pow(2, retries) * 50, 2000);
	        return delay + jitter;
	    }
	}
	socket.default = RedisSocket;
	
	return socket;
}

var authx = {};

var tokenManager = {};

var token = {};

var hasRequiredToken;

function requireToken () {
	if (hasRequiredToken) return token;
	hasRequiredToken = 1;
	Object.defineProperty(token, "__esModule", { value: true });
	token.Token = void 0;
	/**
	 * A token that can be used to authenticate with a service.
	 */
	class Token {
	    value;
	    expiresAtMs;
	    receivedAtMs;
	    constructor(value, 
	    //represents the token deadline - the time in milliseconds since the Unix epoch at which the token expires
	    expiresAtMs, 
	    //represents the time in milliseconds since the Unix epoch at which the token was received
	    receivedAtMs) {
	        this.value = value;
	        this.expiresAtMs = expiresAtMs;
	        this.receivedAtMs = receivedAtMs;
	    }
	    /**
	     * Returns the time-to-live of the token in milliseconds.
	     * @param now The current time in milliseconds since the Unix epoch.
	     */
	    getTtlMs(now) {
	        if (this.expiresAtMs < now) {
	            return 0;
	        }
	        return this.expiresAtMs - now;
	    }
	}
	token.Token = Token;
	
	return token;
}

var hasRequiredTokenManager;

function requireTokenManager () {
	if (hasRequiredTokenManager) return tokenManager;
	hasRequiredTokenManager = 1;
	Object.defineProperty(tokenManager, "__esModule", { value: true });
	tokenManager.TokenManager = tokenManager.IDPError = void 0;
	const token_1 = requireToken();
	/**
	 * IDPError indicates a failure from the identity provider.
	 *
	 * The `isRetryable` flag is determined by the RetryPolicy's error classification function - if an error is
	 * classified as retryable, it will be marked as transient and the token manager will attempt to recover.
	 */
	class IDPError extends Error {
	    message;
	    isRetryable;
	    constructor(message, isRetryable) {
	        super(message);
	        this.message = message;
	        this.isRetryable = isRetryable;
	        this.name = 'IDPError';
	    }
	}
	tokenManager.IDPError = IDPError;
	/**
	 * TokenManager is responsible for obtaining/refreshing tokens and notifying listeners about token changes.
	 * It uses an IdentityProvider to request tokens. The token refresh is scheduled based on the token's TTL and
	 * the expirationRefreshRatio configuration.
	 *
	 * The TokenManager should be disposed when it is no longer needed by calling the dispose method on the Disposable
	 * returned by start.
	 */
	class TokenManager {
	    identityProvider;
	    config;
	    currentToken = null;
	    refreshTimeout = null;
	    listener = null;
	    retryAttempt = 0;
	    constructor(identityProvider, config) {
	        this.identityProvider = identityProvider;
	        this.config = config;
	        if (this.config.expirationRefreshRatio > 1) {
	            throw new Error('expirationRefreshRatio must be less than or equal to 1');
	        }
	        if (this.config.expirationRefreshRatio < 0) {
	            throw new Error('expirationRefreshRatio must be greater or equal to 0');
	        }
	    }
	    /**
	     * Starts the token manager and returns a Disposable that can be used to stop the token manager.
	     *
	     * @param listener The listener that will receive token updates.
	     * @param initialDelayMs The initial delay in milliseconds before the first token refresh.
	     */
	    start(listener, initialDelayMs = 0) {
	        if (this.listener) {
	            this.stop();
	        }
	        this.listener = listener;
	        this.retryAttempt = 0;
	        this.scheduleNextRefresh(initialDelayMs);
	        return {
	            dispose: () => this.stop()
	        };
	    }
	    calculateRetryDelay() {
	        if (!this.config.retry)
	            return 0;
	        const { initialDelayMs, maxDelayMs, backoffMultiplier, jitterPercentage } = this.config.retry;
	        let delay = initialDelayMs * Math.pow(backoffMultiplier, this.retryAttempt - 1);
	        delay = Math.min(delay, maxDelayMs);
	        if (jitterPercentage) {
	            const jitterRange = delay * (jitterPercentage / 100);
	            const jitterAmount = Math.random() * jitterRange - (jitterRange / 2);
	            delay += jitterAmount;
	        }
	        let result = Math.max(0, Math.floor(delay));
	        return result;
	    }
	    shouldRetry(error) {
	        if (!this.config.retry)
	            return false;
	        const { maxAttempts, isRetryable } = this.config.retry;
	        if (this.retryAttempt >= maxAttempts) {
	            return false;
	        }
	        if (isRetryable) {
	            return isRetryable(error, this.retryAttempt);
	        }
	        return false;
	    }
	    isRunning() {
	        return this.listener !== null;
	    }
	    async refresh() {
	        if (!this.listener) {
	            throw new Error('TokenManager is not running, but refresh was called');
	        }
	        try {
	            await this.identityProvider.requestToken().then(this.handleNewToken);
	            this.retryAttempt = 0;
	        }
	        catch (error) {
	            if (this.shouldRetry(error)) {
	                this.retryAttempt++;
	                const retryDelay = this.calculateRetryDelay();
	                this.notifyError(`Token refresh failed (attempt ${this.retryAttempt}), retrying in ${retryDelay}ms: ${error}`, true);
	                this.scheduleNextRefresh(retryDelay);
	            }
	            else {
	                this.notifyError(error, false);
	                this.stop();
	            }
	        }
	    }
	    handleNewToken = async ({ token: nativeToken, ttlMs }) => {
	        if (!this.listener) {
	            throw new Error('TokenManager is not running, but a new token was received');
	        }
	        const token = this.wrapAndSetCurrentToken(nativeToken, ttlMs);
	        this.listener.onNext(token);
	        this.scheduleNextRefresh(this.calculateRefreshTime(token));
	    };
	    /**
	     * Creates a Token object from a native token and sets it as the current token.
	     *
	     * @param nativeToken - The raw token received from the identity provider
	     * @param ttlMs - Time-to-live in milliseconds for the token
	     *
	     * @returns A new Token instance containing the wrapped native token and expiration details
	     *
	     */
	    wrapAndSetCurrentToken(nativeToken, ttlMs) {
	        const now = Date.now();
	        const token = new token_1.Token(nativeToken, now + ttlMs, now);
	        this.currentToken = token;
	        return token;
	    }
	    scheduleNextRefresh(delayMs) {
	        if (this.refreshTimeout) {
	            clearTimeout(this.refreshTimeout);
	            this.refreshTimeout = null;
	        }
	        if (delayMs === 0) {
	            this.refresh();
	        }
	        else {
	            this.refreshTimeout = setTimeout(() => this.refresh(), delayMs);
	        }
	    }
	    /**
	     * Calculates the time in milliseconds when the token should be refreshed
	     * based on the token's TTL and the expirationRefreshRatio configuration.
	     *
	     * @param token The token to calculate the refresh time for.
	     * @param now The current time in milliseconds. Defaults to Date.now().
	     */
	    calculateRefreshTime(token, now = Date.now()) {
	        const ttlMs = token.getTtlMs(now);
	        return Math.floor(ttlMs * this.config.expirationRefreshRatio);
	    }
	    stop() {
	        if (this.refreshTimeout) {
	            clearTimeout(this.refreshTimeout);
	            this.refreshTimeout = null;
	        }
	        this.listener = null;
	        this.currentToken = null;
	        this.retryAttempt = 0;
	    }
	    /**
	     * Returns the current token or null if no token is available.
	     */
	    getCurrentToken() {
	        return this.currentToken;
	    }
	    notifyError(error, isRetryable) {
	        const errorMessage = error instanceof Error ? error.message : String(error);
	        if (!this.listener) {
	            throw new Error(`TokenManager is not running but received an error: ${errorMessage}`);
	        }
	        this.listener.onError(new IDPError(errorMessage, isRetryable));
	    }
	}
	tokenManager.TokenManager = TokenManager;
	
	return tokenManager;
}

var credentialsProvider = {};

var hasRequiredCredentialsProvider;

function requireCredentialsProvider () {
	if (hasRequiredCredentialsProvider) return credentialsProvider;
	hasRequiredCredentialsProvider = 1;
	Object.defineProperty(credentialsProvider, "__esModule", { value: true });
	credentialsProvider.UnableToObtainNewCredentialsError = credentialsProvider.CredentialsError = void 0;
	/**
	 * Thrown when re-authentication fails with provided credentials .
	 * e.g. when the credentials are invalid, expired or revoked.
	 *
	 */
	class CredentialsError extends Error {
	    constructor(message) {
	        super(`Re-authentication with latest credentials failed: ${message}`);
	        this.name = 'CredentialsError';
	    }
	}
	credentialsProvider.CredentialsError = CredentialsError;
	/**
	 * Thrown when new credentials cannot be obtained before current ones expire
	 */
	class UnableToObtainNewCredentialsError extends Error {
	    constructor(message) {
	        super(`Unable to obtain new credentials : ${message}`);
	        this.name = 'UnableToObtainNewCredentialsError';
	    }
	}
	credentialsProvider.UnableToObtainNewCredentialsError = UnableToObtainNewCredentialsError;
	
	return credentialsProvider;
}

var hasRequiredAuthx;

function requireAuthx () {
	if (hasRequiredAuthx) return authx;
	hasRequiredAuthx = 1;
	(function (exports) {
		Object.defineProperty(exports, "__esModule", { value: true });
		exports.Token = exports.CredentialsError = exports.UnableToObtainNewCredentialsError = exports.IDPError = exports.TokenManager = void 0;
		var token_manager_1 = requireTokenManager();
		Object.defineProperty(exports, "TokenManager", { enumerable: true, get: function () { return token_manager_1.TokenManager; } });
		Object.defineProperty(exports, "IDPError", { enumerable: true, get: function () { return token_manager_1.IDPError; } });
		var credentials_provider_1 = requireCredentialsProvider();
		Object.defineProperty(exports, "UnableToObtainNewCredentialsError", { enumerable: true, get: function () { return credentials_provider_1.UnableToObtainNewCredentialsError; } });
		Object.defineProperty(exports, "CredentialsError", { enumerable: true, get: function () { return credentials_provider_1.CredentialsError; } });
		var token_1 = requireToken();
		Object.defineProperty(exports, "Token", { enumerable: true, get: function () { return token_1.Token; } });
		
	} (authx));
	return authx;
}

var commandsQueue = {};

var linkedList = {};

var hasRequiredLinkedList;

function requireLinkedList () {
	if (hasRequiredLinkedList) return linkedList;
	hasRequiredLinkedList = 1;
	Object.defineProperty(linkedList, "__esModule", { value: true });
	linkedList.SinglyLinkedList = linkedList.DoublyLinkedList = void 0;
	class DoublyLinkedList {
	    #length = 0;
	    get length() {
	        return this.#length;
	    }
	    #head;
	    get head() {
	        return this.#head;
	    }
	    #tail;
	    get tail() {
	        return this.#tail;
	    }
	    push(value) {
	        ++this.#length;
	        if (this.#tail === undefined) {
	            return this.#tail = this.#head = {
	                previous: this.#head,
	                next: undefined,
	                value
	            };
	        }
	        return this.#tail = this.#tail.next = {
	            previous: this.#tail,
	            next: undefined,
	            value
	        };
	    }
	    unshift(value) {
	        ++this.#length;
	        if (this.#head === undefined) {
	            return this.#head = this.#tail = {
	                previous: undefined,
	                next: undefined,
	                value
	            };
	        }
	        return this.#head = this.#head.previous = {
	            previous: undefined,
	            next: this.#head,
	            value
	        };
	    }
	    add(value, prepend = false) {
	        return prepend ?
	            this.unshift(value) :
	            this.push(value);
	    }
	    shift() {
	        if (this.#head === undefined)
	            return undefined;
	        --this.#length;
	        const node = this.#head;
	        if (node.next) {
	            node.next.previous = node.previous;
	            this.#head = node.next;
	            node.next = undefined;
	        }
	        else {
	            this.#head = this.#tail = undefined;
	        }
	        return node.value;
	    }
	    remove(node) {
	        --this.#length;
	        if (this.#tail === node) {
	            this.#tail = node.previous;
	        }
	        if (this.#head === node) {
	            this.#head = node.next;
	        }
	        else {
	            node.previous.next = node.next;
	            node.previous = undefined;
	        }
	        node.next = undefined;
	    }
	    reset() {
	        this.#length = 0;
	        this.#head = this.#tail = undefined;
	    }
	    *[Symbol.iterator]() {
	        let node = this.#head;
	        while (node !== undefined) {
	            yield node.value;
	            node = node.next;
	        }
	    }
	}
	linkedList.DoublyLinkedList = DoublyLinkedList;
	class SinglyLinkedList {
	    #length = 0;
	    get length() {
	        return this.#length;
	    }
	    #head;
	    get head() {
	        return this.#head;
	    }
	    #tail;
	    get tail() {
	        return this.#tail;
	    }
	    push(value) {
	        ++this.#length;
	        const node = {
	            value,
	            next: undefined,
	            removed: false
	        };
	        if (this.#head === undefined) {
	            return this.#head = this.#tail = node;
	        }
	        return this.#tail.next = this.#tail = node;
	    }
	    remove(node, parent) {
	        if (node.removed) {
	            throw new Error("node already removed");
	        }
	        --this.#length;
	        if (this.#head === node) {
	            if (this.#tail === node) {
	                this.#head = this.#tail = undefined;
	            }
	            else {
	                this.#head = node.next;
	            }
	        }
	        else if (this.#tail === node) {
	            this.#tail = parent;
	            parent.next = undefined;
	        }
	        else {
	            parent.next = node.next;
	        }
	        node.removed = true;
	    }
	    shift() {
	        if (this.#head === undefined)
	            return undefined;
	        const node = this.#head;
	        if (--this.#length === 0) {
	            this.#head = this.#tail = undefined;
	        }
	        else {
	            this.#head = node.next;
	        }
	        node.removed = true;
	        return node.value;
	    }
	    reset() {
	        this.#length = 0;
	        this.#head = this.#tail = undefined;
	    }
	    *[Symbol.iterator]() {
	        let node = this.#head;
	        while (node !== undefined) {
	            yield node.value;
	            node = node.next;
	        }
	    }
	}
	linkedList.SinglyLinkedList = SinglyLinkedList;
	
	return linkedList;
}

var encoder = {};

var hasRequiredEncoder;

function requireEncoder () {
	if (hasRequiredEncoder) return encoder;
	hasRequiredEncoder = 1;
	Object.defineProperty(encoder, "__esModule", { value: true });
	const CRLF = '\r\n';
	function encodeCommand(args) {
	    const toWrite = [];
	    let strings = '*' + args.length + CRLF;
	    for (let i = 0; i < args.length; i++) {
	        const arg = args[i];
	        if (typeof arg === 'string') {
	            strings += '$' + Buffer.byteLength(arg) + CRLF + arg + CRLF;
	        }
	        else if (arg instanceof Buffer) {
	            toWrite.push(strings + '$' + arg.length.toString() + CRLF, arg);
	            strings = CRLF;
	        }
	        else {
	            throw new TypeError(`"arguments[${i}]" must be of type "string | Buffer", got ${typeof arg} instead.`);
	        }
	    }
	    toWrite.push(strings);
	    return toWrite;
	}
	encoder.default = encodeCommand;
	
	return encoder;
}

var pubSub = {};

var hasRequiredPubSub;

function requirePubSub () {
	if (hasRequiredPubSub) return pubSub;
	hasRequiredPubSub = 1;
	(function (exports) {
		Object.defineProperty(exports, "__esModule", { value: true });
		exports.PubSub = exports.PUBSUB_TYPE = void 0;
		exports.PUBSUB_TYPE = {
		    CHANNELS: 'CHANNELS',
		    PATTERNS: 'PATTERNS',
		    SHARDED: 'SHARDED'
		};
		const COMMANDS = {
		    [exports.PUBSUB_TYPE.CHANNELS]: {
		        subscribe: Buffer.from('subscribe'),
		        unsubscribe: Buffer.from('unsubscribe'),
		        message: Buffer.from('message')
		    },
		    [exports.PUBSUB_TYPE.PATTERNS]: {
		        subscribe: Buffer.from('psubscribe'),
		        unsubscribe: Buffer.from('punsubscribe'),
		        message: Buffer.from('pmessage')
		    },
		    [exports.PUBSUB_TYPE.SHARDED]: {
		        subscribe: Buffer.from('ssubscribe'),
		        unsubscribe: Buffer.from('sunsubscribe'),
		        message: Buffer.from('smessage')
		    }
		};
		class PubSub {
		    static isStatusReply(reply) {
		        return (COMMANDS[exports.PUBSUB_TYPE.CHANNELS].subscribe.equals(reply[0]) ||
		            COMMANDS[exports.PUBSUB_TYPE.CHANNELS].unsubscribe.equals(reply[0]) ||
		            COMMANDS[exports.PUBSUB_TYPE.PATTERNS].subscribe.equals(reply[0]) ||
		            COMMANDS[exports.PUBSUB_TYPE.PATTERNS].unsubscribe.equals(reply[0]) ||
		            COMMANDS[exports.PUBSUB_TYPE.SHARDED].subscribe.equals(reply[0]));
		    }
		    static isShardedUnsubscribe(reply) {
		        return COMMANDS[exports.PUBSUB_TYPE.SHARDED].unsubscribe.equals(reply[0]);
		    }
		    static #channelsArray(channels) {
		        return (Array.isArray(channels) ? channels : [channels]);
		    }
		    static #listenersSet(listeners, returnBuffers) {
		        return (returnBuffers ? listeners.buffers : listeners.strings);
		    }
		    #subscribing = 0;
		    #isActive = false;
		    get isActive() {
		        return this.#isActive;
		    }
		    listeners = {
		        [exports.PUBSUB_TYPE.CHANNELS]: new Map(),
		        [exports.PUBSUB_TYPE.PATTERNS]: new Map(),
		        [exports.PUBSUB_TYPE.SHARDED]: new Map()
		    };
		    subscribe(type, channels, listener, returnBuffers) {
		        const args = [COMMANDS[type].subscribe], channelsArray = PubSub.#channelsArray(channels);
		        for (const channel of channelsArray) {
		            let channelListeners = this.listeners[type].get(channel);
		            if (!channelListeners || channelListeners.unsubscribing) {
		                args.push(channel);
		            }
		        }
		        if (args.length === 1) {
		            // all channels are already subscribed, add listeners without issuing a command
		            for (const channel of channelsArray) {
		                PubSub.#listenersSet(this.listeners[type].get(channel), returnBuffers).add(listener);
		            }
		            return;
		        }
		        this.#isActive = true;
		        this.#subscribing++;
		        return {
		            args,
		            channelsCounter: args.length - 1,
		            resolve: () => {
		                this.#subscribing--;
		                for (const channel of channelsArray) {
		                    let listeners = this.listeners[type].get(channel);
		                    if (!listeners) {
		                        listeners = {
		                            unsubscribing: false,
		                            buffers: new Set(),
		                            strings: new Set()
		                        };
		                        this.listeners[type].set(channel, listeners);
		                    }
		                    PubSub.#listenersSet(listeners, returnBuffers).add(listener);
		                }
		            },
		            reject: () => {
		                this.#subscribing--;
		                this.#updateIsActive();
		            }
		        };
		    }
		    extendChannelListeners(type, channel, listeners) {
		        if (!this.#extendChannelListeners(type, channel, listeners))
		            return;
		        this.#isActive = true;
		        this.#subscribing++;
		        return {
		            args: [
		                COMMANDS[type].subscribe,
		                channel
		            ],
		            channelsCounter: 1,
		            resolve: () => this.#subscribing--,
		            reject: () => {
		                this.#subscribing--;
		                this.#updateIsActive();
		            }
		        };
		    }
		    #extendChannelListeners(type, channel, listeners) {
		        const existingListeners = this.listeners[type].get(channel);
		        if (!existingListeners) {
		            this.listeners[type].set(channel, listeners);
		            return true;
		        }
		        for (const listener of listeners.buffers) {
		            existingListeners.buffers.add(listener);
		        }
		        for (const listener of listeners.strings) {
		            existingListeners.strings.add(listener);
		        }
		        return false;
		    }
		    extendTypeListeners(type, listeners) {
		        const args = [COMMANDS[type].subscribe];
		        for (const [channel, channelListeners] of listeners) {
		            if (this.#extendChannelListeners(type, channel, channelListeners)) {
		                args.push(channel);
		            }
		        }
		        if (args.length === 1)
		            return;
		        this.#isActive = true;
		        this.#subscribing++;
		        return {
		            args,
		            channelsCounter: args.length - 1,
		            resolve: () => this.#subscribing--,
		            reject: () => {
		                this.#subscribing--;
		                this.#updateIsActive();
		            }
		        };
		    }
		    unsubscribe(type, channels, listener, returnBuffers) {
		        const listeners = this.listeners[type];
		        if (!channels) {
		            return this.#unsubscribeCommand([COMMANDS[type].unsubscribe], 
		            // cannot use `this.#subscribed` because there might be some `SUBSCRIBE` commands in the queue
		            // cannot use `this.#subscribed + this.#subscribing` because some `SUBSCRIBE` commands might fail
		            NaN, () => listeners.clear());
		        }
		        const channelsArray = PubSub.#channelsArray(channels);
		        if (!listener) {
		            return this.#unsubscribeCommand([COMMANDS[type].unsubscribe, ...channelsArray], channelsArray.length, () => {
		                for (const channel of channelsArray) {
		                    listeners.delete(channel);
		                }
		            });
		        }
		        const args = [COMMANDS[type].unsubscribe];
		        for (const channel of channelsArray) {
		            const sets = listeners.get(channel);
		            if (sets) {
		                let current, other;
		                if (returnBuffers) {
		                    current = sets.buffers;
		                    other = sets.strings;
		                }
		                else {
		                    current = sets.strings;
		                    other = sets.buffers;
		                }
		                const currentSize = current.has(listener) ? current.size - 1 : current.size;
		                if (currentSize !== 0 || other.size !== 0)
		                    continue;
		                sets.unsubscribing = true;
		            }
		            args.push(channel);
		        }
		        if (args.length === 1) {
		            // all channels has other listeners,
		            // delete the listeners without issuing a command
		            for (const channel of channelsArray) {
		                PubSub.#listenersSet(listeners.get(channel), returnBuffers).delete(listener);
		            }
		            return;
		        }
		        return this.#unsubscribeCommand(args, args.length - 1, () => {
		            for (const channel of channelsArray) {
		                const sets = listeners.get(channel);
		                if (!sets)
		                    continue;
		                (returnBuffers ? sets.buffers : sets.strings).delete(listener);
		                if (sets.buffers.size === 0 && sets.strings.size === 0) {
		                    listeners.delete(channel);
		                }
		            }
		        });
		    }
		    #unsubscribeCommand(args, channelsCounter, removeListeners) {
		        return {
		            args,
		            channelsCounter,
		            resolve: () => {
		                removeListeners();
		                this.#updateIsActive();
		            },
		            reject: undefined
		        };
		    }
		    #updateIsActive() {
		        this.#isActive = (this.listeners[exports.PUBSUB_TYPE.CHANNELS].size !== 0 ||
		            this.listeners[exports.PUBSUB_TYPE.PATTERNS].size !== 0 ||
		            this.listeners[exports.PUBSUB_TYPE.SHARDED].size !== 0 ||
		            this.#subscribing !== 0);
		    }
		    reset() {
		        this.#isActive = false;
		        this.#subscribing = 0;
		    }
		    resubscribe() {
		        const commands = [];
		        for (const [type, listeners] of Object.entries(this.listeners)) {
		            if (!listeners.size)
		                continue;
		            this.#isActive = true;
		            this.#subscribing++;
		            const callback = () => this.#subscribing--;
		            commands.push({
		                args: [
		                    COMMANDS[type].subscribe,
		                    ...listeners.keys()
		                ],
		                channelsCounter: listeners.size,
		                resolve: callback,
		                reject: callback
		            });
		        }
		        return commands;
		    }
		    handleMessageReply(reply) {
		        if (COMMANDS[exports.PUBSUB_TYPE.CHANNELS].message.equals(reply[0])) {
		            this.#emitPubSubMessage(exports.PUBSUB_TYPE.CHANNELS, reply[2], reply[1]);
		            return true;
		        }
		        else if (COMMANDS[exports.PUBSUB_TYPE.PATTERNS].message.equals(reply[0])) {
		            this.#emitPubSubMessage(exports.PUBSUB_TYPE.PATTERNS, reply[3], reply[2], reply[1]);
		            return true;
		        }
		        else if (COMMANDS[exports.PUBSUB_TYPE.SHARDED].message.equals(reply[0])) {
		            this.#emitPubSubMessage(exports.PUBSUB_TYPE.SHARDED, reply[2], reply[1]);
		            return true;
		        }
		        return false;
		    }
		    removeShardedListeners(channel) {
		        const listeners = this.listeners[exports.PUBSUB_TYPE.SHARDED].get(channel);
		        this.listeners[exports.PUBSUB_TYPE.SHARDED].delete(channel);
		        this.#updateIsActive();
		        return listeners;
		    }
		    #emitPubSubMessage(type, message, channel, pattern) {
		        const keyString = (pattern ?? channel).toString(), listeners = this.listeners[type].get(keyString);
		        if (!listeners)
		            return;
		        for (const listener of listeners.buffers) {
		            listener(message, channel);
		        }
		        if (!listeners.strings.size)
		            return;
		        const channelString = pattern ? channel.toString() : keyString, messageString = channelString === '__redis__:invalidate' ?
		            // https://github.com/redis/redis/pull/7469
		            // https://github.com/redis/redis/issues/7463
		            (message === null ? null : message.map(x => x.toString())) :
		            message.toString();
		        for (const listener of listeners.strings) {
		            listener(messageString, channelString);
		        }
		    }
		}
		exports.PubSub = PubSub;
		
	} (pubSub));
	return pubSub;
}

var hasRequiredCommandsQueue;

function requireCommandsQueue () {
	if (hasRequiredCommandsQueue) return commandsQueue;
	hasRequiredCommandsQueue = 1;
	var __importDefault = (commandsQueue && commandsQueue.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(commandsQueue, "__esModule", { value: true });
	const linked_list_1 = requireLinkedList();
	const encoder_1 = __importDefault(requireEncoder());
	const decoder_1 = requireDecoder();
	const pub_sub_1 = requirePubSub();
	const errors_1 = requireErrors();
	const PONG = Buffer.from('pong'), RESET = Buffer.from('RESET');
	const RESP2_PUSH_TYPE_MAPPING = {
	    ...decoder_1.PUSH_TYPE_MAPPING,
	    [decoder_1.RESP_TYPES.SIMPLE_STRING]: Buffer
	};
	class RedisCommandsQueue {
	    #respVersion;
	    #maxLength;
	    #toWrite = new linked_list_1.DoublyLinkedList();
	    #waitingForReply = new linked_list_1.SinglyLinkedList();
	    #onShardedChannelMoved;
	    #chainInExecution;
	    decoder;
	    #pubSub = new pub_sub_1.PubSub();
	    get isPubSubActive() {
	        return this.#pubSub.isActive;
	    }
	    #invalidateCallback;
	    constructor(respVersion, maxLength, onShardedChannelMoved) {
	        this.#respVersion = respVersion;
	        this.#maxLength = maxLength;
	        this.#onShardedChannelMoved = onShardedChannelMoved;
	        this.decoder = this.#initiateDecoder();
	    }
	    #onReply(reply) {
	        this.#waitingForReply.shift().resolve(reply);
	    }
	    #onErrorReply(err) {
	        this.#waitingForReply.shift().reject(err);
	    }
	    #onPush(push) {
	        // TODO: type
	        if (this.#pubSub.handleMessageReply(push))
	            return true;
	        const isShardedUnsubscribe = pub_sub_1.PubSub.isShardedUnsubscribe(push);
	        if (isShardedUnsubscribe && !this.#waitingForReply.length) {
	            const channel = push[1].toString();
	            this.#onShardedChannelMoved(channel, this.#pubSub.removeShardedListeners(channel));
	            return true;
	        }
	        else if (isShardedUnsubscribe || pub_sub_1.PubSub.isStatusReply(push)) {
	            const head = this.#waitingForReply.head.value;
	            if ((Number.isNaN(head.channelsCounter) && push[2] === 0) ||
	                --head.channelsCounter === 0) {
	                this.#waitingForReply.shift().resolve();
	            }
	            return true;
	        }
	    }
	    #getTypeMapping() {
	        return this.#waitingForReply.head.value.typeMapping ?? {};
	    }
	    #initiateDecoder() {
	        return new decoder_1.Decoder({
	            onReply: reply => this.#onReply(reply),
	            onErrorReply: err => this.#onErrorReply(err),
	            //TODO: we can shave off a few cycles by not adding onPush handler at all if CSC is not used
	            onPush: push => {
	                if (!this.#onPush(push)) {
	                    // currently only supporting "invalidate" over RESP3 push messages
	                    switch (push[0].toString()) {
	                        case "invalidate": {
	                            if (this.#invalidateCallback) {
	                                if (push[1] !== null) {
	                                    for (const key of push[1]) {
	                                        this.#invalidateCallback(key);
	                                    }
	                                }
	                                else {
	                                    this.#invalidateCallback(null);
	                                }
	                            }
	                            break;
	                        }
	                    }
	                }
	            },
	            getTypeMapping: () => this.#getTypeMapping()
	        });
	    }
	    setInvalidateCallback(callback) {
	        this.#invalidateCallback = callback;
	    }
	    addCommand(args, options) {
	        if (this.#maxLength && this.#toWrite.length + this.#waitingForReply.length >= this.#maxLength) {
	            return Promise.reject(new Error('The queue is full'));
	        }
	        else if (options?.abortSignal?.aborted) {
	            return Promise.reject(new errors_1.AbortError());
	        }
	        return new Promise((resolve, reject) => {
	            let node;
	            const value = {
	                args,
	                chainId: options?.chainId,
	                abort: undefined,
	                timeout: undefined,
	                resolve,
	                reject,
	                channelsCounter: undefined,
	                typeMapping: options?.typeMapping
	            };
	            const timeout = options?.timeout;
	            if (timeout) {
	                const signal = AbortSignal.timeout(timeout);
	                value.timeout = {
	                    signal,
	                    listener: () => {
	                        this.#toWrite.remove(node);
	                        value.reject(new errors_1.TimeoutError());
	                    }
	                };
	                signal.addEventListener('abort', value.timeout.listener, { once: true });
	            }
	            const signal = options?.abortSignal;
	            if (signal) {
	                value.abort = {
	                    signal,
	                    listener: () => {
	                        this.#toWrite.remove(node);
	                        value.reject(new errors_1.AbortError());
	                    }
	                };
	                signal.addEventListener('abort', value.abort.listener, { once: true });
	            }
	            node = this.#toWrite.add(value, options?.asap);
	        });
	    }
	    #addPubSubCommand(command, asap = false, chainId) {
	        return new Promise((resolve, reject) => {
	            this.#toWrite.add({
	                args: command.args,
	                chainId,
	                abort: undefined,
	                timeout: undefined,
	                resolve() {
	                    command.resolve();
	                    resolve();
	                },
	                reject(err) {
	                    command.reject?.();
	                    reject(err);
	                },
	                channelsCounter: command.channelsCounter,
	                typeMapping: decoder_1.PUSH_TYPE_MAPPING
	            }, asap);
	        });
	    }
	    #setupPubSubHandler() {
	        // RESP3 uses `onPush` to handle PubSub, so no need to modify `onReply`
	        if (this.#respVersion !== 2)
	            return;
	        this.decoder.onReply = (reply => {
	            if (Array.isArray(reply)) {
	                if (this.#onPush(reply))
	                    return;
	                if (PONG.equals(reply[0])) {
	                    const { resolve, typeMapping } = this.#waitingForReply.shift(), buffer = (reply[1].length === 0 ? reply[0] : reply[1]);
	                    resolve(typeMapping?.[decoder_1.RESP_TYPES.SIMPLE_STRING] === Buffer ? buffer : buffer.toString());
	                    return;
	                }
	            }
	            return this.#onReply(reply);
	        });
	        this.decoder.getTypeMapping = () => RESP2_PUSH_TYPE_MAPPING;
	    }
	    subscribe(type, channels, listener, returnBuffers) {
	        const command = this.#pubSub.subscribe(type, channels, listener, returnBuffers);
	        if (!command)
	            return;
	        this.#setupPubSubHandler();
	        return this.#addPubSubCommand(command);
	    }
	    #resetDecoderCallbacks() {
	        this.decoder.onReply = (reply => this.#onReply(reply));
	        this.decoder.getTypeMapping = () => this.#getTypeMapping();
	    }
	    unsubscribe(type, channels, listener, returnBuffers) {
	        const command = this.#pubSub.unsubscribe(type, channels, listener, returnBuffers);
	        if (!command)
	            return;
	        if (command && this.#respVersion === 2) {
	            // RESP2 modifies `onReply` to handle PubSub (see #setupPubSubHandler)
	            const { resolve } = command;
	            command.resolve = () => {
	                if (!this.#pubSub.isActive) {
	                    this.#resetDecoderCallbacks();
	                }
	                resolve();
	            };
	        }
	        return this.#addPubSubCommand(command);
	    }
	    resubscribe(chainId) {
	        const commands = this.#pubSub.resubscribe();
	        if (!commands.length)
	            return;
	        this.#setupPubSubHandler();
	        return Promise.all(commands.map(command => this.#addPubSubCommand(command, true, chainId)));
	    }
	    extendPubSubChannelListeners(type, channel, listeners) {
	        const command = this.#pubSub.extendChannelListeners(type, channel, listeners);
	        if (!command)
	            return;
	        this.#setupPubSubHandler();
	        return this.#addPubSubCommand(command);
	    }
	    extendPubSubListeners(type, listeners) {
	        const command = this.#pubSub.extendTypeListeners(type, listeners);
	        if (!command)
	            return;
	        this.#setupPubSubHandler();
	        return this.#addPubSubCommand(command);
	    }
	    getPubSubListeners(type) {
	        return this.#pubSub.listeners[type];
	    }
	    monitor(callback, options) {
	        return new Promise((resolve, reject) => {
	            const typeMapping = options?.typeMapping ?? {};
	            this.#toWrite.add({
	                args: ['MONITOR'],
	                chainId: options?.chainId,
	                abort: undefined,
	                timeout: undefined,
	                // using `resolve` instead of using `.then`/`await` to make sure it'll be called before processing the next reply
	                resolve: () => {
	                    // after running `MONITOR` only `MONITOR` and `RESET` replies are expected
	                    // any other command should cause an error
	                    // if `RESET` already overrides `onReply`, set monitor as it's fallback
	                    if (this.#resetFallbackOnReply) {
	                        this.#resetFallbackOnReply = callback;
	                    }
	                    else {
	                        this.decoder.onReply = callback;
	                    }
	                    this.decoder.getTypeMapping = () => typeMapping;
	                    resolve();
	                },
	                reject,
	                channelsCounter: undefined,
	                typeMapping
	            }, options?.asap);
	        });
	    }
	    resetDecoder() {
	        this.#resetDecoderCallbacks();
	        this.decoder.reset();
	    }
	    #resetFallbackOnReply;
	    async reset(chainId, typeMapping) {
	        return new Promise((resolve, reject) => {
	            // overriding onReply to handle `RESET` while in `MONITOR` or PubSub mode
	            this.#resetFallbackOnReply = this.decoder.onReply;
	            this.decoder.onReply = (reply => {
	                if ((typeof reply === 'string' && reply === 'RESET') ||
	                    (reply instanceof Buffer && RESET.equals(reply))) {
	                    this.#resetDecoderCallbacks();
	                    this.#resetFallbackOnReply = undefined;
	                    this.#pubSub.reset();
	                    this.#waitingForReply.shift().resolve(reply);
	                    return;
	                }
	                this.#resetFallbackOnReply(reply);
	            });
	            this.#toWrite.push({
	                args: ['RESET'],
	                chainId,
	                abort: undefined,
	                timeout: undefined,
	                resolve,
	                reject,
	                channelsCounter: undefined,
	                typeMapping
	            });
	        });
	    }
	    isWaitingToWrite() {
	        return this.#toWrite.length > 0;
	    }
	    *commandsToWrite() {
	        let toSend = this.#toWrite.shift();
	        while (toSend) {
	            let encoded;
	            try {
	                encoded = (0, encoder_1.default)(toSend.args);
	            }
	            catch (err) {
	                toSend.reject(err);
	                toSend = this.#toWrite.shift();
	                continue;
	            }
	            // TODO reuse `toSend` or create new object?
	            toSend.args = undefined;
	            if (toSend.abort) {
	                RedisCommandsQueue.#removeAbortListener(toSend);
	                toSend.abort = undefined;
	            }
	            if (toSend.timeout) {
	                RedisCommandsQueue.#removeTimeoutListener(toSend);
	                toSend.timeout = undefined;
	            }
	            this.#chainInExecution = toSend.chainId;
	            toSend.chainId = undefined;
	            this.#waitingForReply.push(toSend);
	            yield encoded;
	            toSend = this.#toWrite.shift();
	        }
	    }
	    #flushWaitingForReply(err) {
	        for (const node of this.#waitingForReply) {
	            node.reject(err);
	        }
	        this.#waitingForReply.reset();
	    }
	    static #removeAbortListener(command) {
	        command.abort.signal.removeEventListener('abort', command.abort.listener);
	    }
	    static #removeTimeoutListener(command) {
	        command.timeout.signal.removeEventListener('abort', command.timeout.listener);
	    }
	    static #flushToWrite(toBeSent, err) {
	        if (toBeSent.abort) {
	            RedisCommandsQueue.#removeAbortListener(toBeSent);
	        }
	        if (toBeSent.timeout) {
	            RedisCommandsQueue.#removeTimeoutListener(toBeSent);
	        }
	        toBeSent.reject(err);
	    }
	    flushWaitingForReply(err) {
	        this.resetDecoder();
	        this.#pubSub.reset();
	        this.#flushWaitingForReply(err);
	        if (!this.#chainInExecution)
	            return;
	        while (this.#toWrite.head?.value.chainId === this.#chainInExecution) {
	            RedisCommandsQueue.#flushToWrite(this.#toWrite.shift(), err);
	        }
	        this.#chainInExecution = undefined;
	    }
	    flushAll(err) {
	        this.resetDecoder();
	        this.#pubSub.reset();
	        this.#flushWaitingForReply(err);
	        for (const node of this.#toWrite) {
	            RedisCommandsQueue.#flushToWrite(node, err);
	        }
	        this.#toWrite.reset();
	    }
	    isEmpty() {
	        return (this.#toWrite.length === 0 &&
	            this.#waitingForReply.length === 0);
	    }
	}
	commandsQueue.default = RedisCommandsQueue;
	
	return commandsQueue;
}

var commander = {};

var hasRequiredCommander;

function requireCommander () {
	if (hasRequiredCommander) return commander;
	hasRequiredCommander = 1;
	Object.defineProperty(commander, "__esModule", { value: true });
	commander.scriptArgumentsPrefix = commander.functionArgumentsPrefix = commander.getTransformReply = commander.attachConfig = void 0;
	/* FIXME: better error message / link */
	function throwResp3SearchModuleUnstableError() {
	    throw new Error('Some RESP3 results for Redis Query Engine responses may change. Refer to the readme for guidance');
	}
	function attachConfig({ BaseClass, commands, createCommand, createModuleCommand, createFunctionCommand, createScriptCommand, config }) {
	    const RESP = config?.RESP ?? 2, Class = class extends BaseClass {
	    };
	    for (const [name, command] of Object.entries(commands)) {
	        if (config?.RESP == 3 && command.unstableResp3 && !config.unstableResp3) {
	            Class.prototype[name] = throwResp3SearchModuleUnstableError;
	        }
	        else {
	            Class.prototype[name] = createCommand(command, RESP);
	        }
	    }
	    if (config?.modules) {
	        for (const [moduleName, module] of Object.entries(config.modules)) {
	            const fns = Object.create(null);
	            for (const [name, command] of Object.entries(module)) {
	                if (config.RESP == 3 && command.unstableResp3 && !config.unstableResp3) {
	                    fns[name] = throwResp3SearchModuleUnstableError;
	                }
	                else {
	                    fns[name] = createModuleCommand(command, RESP);
	                }
	            }
	            attachNamespace(Class.prototype, moduleName, fns);
	        }
	    }
	    if (config?.functions) {
	        for (const [library, commands] of Object.entries(config.functions)) {
	            const fns = Object.create(null);
	            for (const [name, command] of Object.entries(commands)) {
	                fns[name] = createFunctionCommand(name, command, RESP);
	            }
	            attachNamespace(Class.prototype, library, fns);
	        }
	    }
	    if (config?.scripts) {
	        for (const [name, script] of Object.entries(config.scripts)) {
	            Class.prototype[name] = createScriptCommand(script, RESP);
	        }
	    }
	    return Class;
	}
	commander.attachConfig = attachConfig;
	function attachNamespace(prototype, name, fns) {
	    Object.defineProperty(prototype, name, {
	        get() {
	            const value = Object.create(fns);
	            value._self = this;
	            Object.defineProperty(this, name, { value });
	            return value;
	        }
	    });
	}
	function getTransformReply(command, resp) {
	    switch (typeof command.transformReply) {
	        case 'function':
	            return command.transformReply;
	        case 'object':
	            return command.transformReply[resp];
	    }
	}
	commander.getTransformReply = getTransformReply;
	function functionArgumentsPrefix(name, fn) {
	    const prefix = [
	        fn.IS_READ_ONLY ? 'FCALL_RO' : 'FCALL',
	        name
	    ];
	    if (fn.NUMBER_OF_KEYS !== undefined) {
	        prefix.push(fn.NUMBER_OF_KEYS.toString());
	    }
	    return prefix;
	}
	commander.functionArgumentsPrefix = functionArgumentsPrefix;
	function scriptArgumentsPrefix(script) {
	    const prefix = [
	        script.IS_READ_ONLY ? 'EVALSHA_RO' : 'EVALSHA',
	        script.SHA1
	    ];
	    if (script.NUMBER_OF_KEYS !== undefined) {
	        prefix.push(script.NUMBER_OF_KEYS.toString());
	    }
	    return prefix;
	}
	commander.scriptArgumentsPrefix = scriptArgumentsPrefix;
	
	return commander;
}

var multiCommand$2 = {};

var multiCommand$1 = {};

var hasRequiredMultiCommand$2;

function requireMultiCommand$2 () {
	if (hasRequiredMultiCommand$2) return multiCommand$1;
	hasRequiredMultiCommand$2 = 1;
	Object.defineProperty(multiCommand$1, "__esModule", { value: true });
	const errors_1 = requireErrors();
	class RedisMultiCommand {
	    typeMapping;
	    constructor(typeMapping) {
	        this.typeMapping = typeMapping;
	    }
	    queue = [];
	    scriptsInUse = new Set();
	    addCommand(args, transformReply) {
	        this.queue.push({
	            args,
	            transformReply
	        });
	    }
	    addScript(script, args, transformReply) {
	        const redisArgs = [];
	        redisArgs.preserve = args.preserve;
	        if (this.scriptsInUse.has(script.SHA1)) {
	            redisArgs.push('EVALSHA', script.SHA1);
	        }
	        else {
	            this.scriptsInUse.add(script.SHA1);
	            redisArgs.push('EVAL', script.SCRIPT);
	        }
	        if (script.NUMBER_OF_KEYS !== undefined) {
	            redisArgs.push(script.NUMBER_OF_KEYS.toString());
	        }
	        redisArgs.push(...args);
	        this.addCommand(redisArgs, transformReply);
	    }
	    transformReplies(rawReplies) {
	        const errorIndexes = [], replies = rawReplies.map((reply, i) => {
	            if (reply instanceof errors_1.ErrorReply) {
	                errorIndexes.push(i);
	                return reply;
	            }
	            const { transformReply, args } = this.queue[i];
	            return transformReply ? transformReply(reply, args.preserve, this.typeMapping) : reply;
	        });
	        if (errorIndexes.length)
	            throw new errors_1.MultiErrorReply(replies, errorIndexes);
	        return replies;
	    }
	}
	multiCommand$1.default = RedisMultiCommand;
	
	return multiCommand$1;
}

var hasRequiredMultiCommand$1;

function requireMultiCommand$1 () {
	if (hasRequiredMultiCommand$1) return multiCommand$2;
	hasRequiredMultiCommand$1 = 1;
	var __importDefault = (multiCommand$2 && multiCommand$2.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(multiCommand$2, "__esModule", { value: true });
	const commands_1 = __importDefault(requireCommands$5());
	const multi_command_1 = __importDefault(requireMultiCommand$2());
	const commander_1 = requireCommander();
	const parser_1 = requireParser();
	class RedisClientMultiCommand {
	    static #createCommand(command, resp) {
	        const transformReply = (0, commander_1.getTransformReply)(command, resp);
	        return function (...args) {
	            const parser = new parser_1.BasicCommandParser();
	            command.parseCommand(parser, ...args);
	            const redisArgs = parser.redisArgs;
	            redisArgs.preserve = parser.preserve;
	            return this.addCommand(redisArgs, transformReply);
	        };
	    }
	    static #createModuleCommand(command, resp) {
	        const transformReply = (0, commander_1.getTransformReply)(command, resp);
	        return function (...args) {
	            const parser = new parser_1.BasicCommandParser();
	            command.parseCommand(parser, ...args);
	            const redisArgs = parser.redisArgs;
	            redisArgs.preserve = parser.preserve;
	            return this._self.addCommand(redisArgs, transformReply);
	        };
	    }
	    static #createFunctionCommand(name, fn, resp) {
	        const prefix = (0, commander_1.functionArgumentsPrefix)(name, fn);
	        const transformReply = (0, commander_1.getTransformReply)(fn, resp);
	        return function (...args) {
	            const parser = new parser_1.BasicCommandParser();
	            parser.push(...prefix);
	            fn.parseCommand(parser, ...args);
	            const redisArgs = parser.redisArgs;
	            redisArgs.preserve = parser.preserve;
	            return this._self.addCommand(redisArgs, transformReply);
	        };
	    }
	    static #createScriptCommand(script, resp) {
	        const transformReply = (0, commander_1.getTransformReply)(script, resp);
	        return function (...args) {
	            const parser = new parser_1.BasicCommandParser();
	            script.parseCommand(parser, ...args);
	            const redisArgs = parser.redisArgs;
	            redisArgs.preserve = parser.preserve;
	            return this.#addScript(script, redisArgs, transformReply);
	        };
	    }
	    static extend(config) {
	        return (0, commander_1.attachConfig)({
	            BaseClass: RedisClientMultiCommand,
	            commands: commands_1.default,
	            createCommand: RedisClientMultiCommand.#createCommand,
	            createModuleCommand: RedisClientMultiCommand.#createModuleCommand,
	            createFunctionCommand: RedisClientMultiCommand.#createFunctionCommand,
	            createScriptCommand: RedisClientMultiCommand.#createScriptCommand,
	            config
	        });
	    }
	    #multi;
	    #executeMulti;
	    #executePipeline;
	    #selectedDB;
	    constructor(executeMulti, executePipeline, typeMapping) {
	        this.#multi = new multi_command_1.default(typeMapping);
	        this.#executeMulti = executeMulti;
	        this.#executePipeline = executePipeline;
	    }
	    SELECT(db, transformReply) {
	        this.#selectedDB = db;
	        this.#multi.addCommand(['SELECT', db.toString()], transformReply);
	        return this;
	    }
	    select = this.SELECT;
	    addCommand(args, transformReply) {
	        this.#multi.addCommand(args, transformReply);
	        return this;
	    }
	    #addScript(script, args, transformReply) {
	        this.#multi.addScript(script, args, transformReply);
	        return this;
	    }
	    async exec(execAsPipeline = false) {
	        if (execAsPipeline)
	            return this.execAsPipeline();
	        return this.#multi.transformReplies(await this.#executeMulti(this.#multi.queue, this.#selectedDB));
	    }
	    EXEC = this.exec;
	    execTyped(execAsPipeline = false) {
	        return this.exec(execAsPipeline);
	    }
	    async execAsPipeline() {
	        if (this.#multi.queue.length === 0)
	            return [];
	        return this.#multi.transformReplies(await this.#executePipeline(this.#multi.queue, this.#selectedDB));
	    }
	    execAsPipelineTyped() {
	        return this.execAsPipeline();
	    }
	}
	multiCommand$2.default = RedisClientMultiCommand;
	
	return multiCommand$2;
}

var legacyMode = {};

var hasRequiredLegacyMode;

function requireLegacyMode () {
	if (hasRequiredLegacyMode) return legacyMode;
	hasRequiredLegacyMode = 1;
	var __importDefault = (legacyMode && legacyMode.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(legacyMode, "__esModule", { value: true });
	legacyMode.RedisLegacyClient = void 0;
	const commander_1 = requireCommander();
	const commands_1 = __importDefault(requireCommands$5());
	const multi_command_1 = __importDefault(requireMultiCommand$2());
	class RedisLegacyClient {
	    static #transformArguments(redisArgs, args) {
	        let callback;
	        if (typeof args[args.length - 1] === 'function') {
	            callback = args.pop();
	        }
	        RedisLegacyClient.pushArguments(redisArgs, args);
	        return callback;
	    }
	    static pushArguments(redisArgs, args) {
	        for (let i = 0; i < args.length; ++i) {
	            const arg = args[i];
	            if (Array.isArray(arg)) {
	                RedisLegacyClient.pushArguments(redisArgs, arg);
	            }
	            else {
	                redisArgs.push(typeof arg === 'number' || arg instanceof Date ?
	                    arg.toString() :
	                    arg);
	            }
	        }
	    }
	    static getTransformReply(command, resp) {
	        return command.TRANSFORM_LEGACY_REPLY ?
	            (0, commander_1.getTransformReply)(command, resp) :
	            undefined;
	    }
	    static #createCommand(name, command, resp) {
	        const transformReply = RedisLegacyClient.getTransformReply(command, resp);
	        return function (...args) {
	            const redisArgs = [name], callback = RedisLegacyClient.#transformArguments(redisArgs, args), promise = this.#client.sendCommand(redisArgs);
	            if (!callback) {
	                promise.catch(err => this.#client.emit('error', err));
	                return;
	            }
	            promise
	                .then(reply => callback(null, transformReply ? transformReply(reply) : reply))
	                .catch(err => callback(err));
	        };
	    }
	    #client;
	    #Multi;
	    constructor(client) {
	        this.#client = client;
	        const RESP = client.options?.RESP ?? 2;
	        for (const [name, command] of Object.entries(commands_1.default)) {
	            // TODO: as any?
	            this[name] = RedisLegacyClient.#createCommand(name, command, RESP);
	        }
	        this.#Multi = LegacyMultiCommand.factory(RESP);
	    }
	    sendCommand(...args) {
	        const redisArgs = [], callback = RedisLegacyClient.#transformArguments(redisArgs, args), promise = this.#client.sendCommand(redisArgs);
	        if (!callback) {
	            promise.catch(err => this.#client.emit('error', err));
	            return;
	        }
	        promise
	            .then(reply => callback(null, reply))
	            .catch(err => callback(err));
	    }
	    multi() {
	        return this.#Multi(this.#client);
	    }
	}
	legacyMode.RedisLegacyClient = RedisLegacyClient;
	class LegacyMultiCommand {
	    static #createCommand(name, command, resp) {
	        const transformReply = RedisLegacyClient.getTransformReply(command, resp);
	        return function (...args) {
	            const redisArgs = [name];
	            RedisLegacyClient.pushArguments(redisArgs, args);
	            this.#multi.addCommand(redisArgs, transformReply);
	            return this;
	        };
	    }
	    static factory(resp) {
	        const Multi = class extends LegacyMultiCommand {
	        };
	        for (const [name, command] of Object.entries(commands_1.default)) {
	            // TODO: as any?
	            Multi.prototype[name] = LegacyMultiCommand.#createCommand(name, command, resp);
	        }
	        return (client) => {
	            return new Multi(client);
	        };
	    }
	    #multi = new multi_command_1.default();
	    #client;
	    constructor(client) {
	        this.#client = client;
	    }
	    sendCommand(...args) {
	        const redisArgs = [];
	        RedisLegacyClient.pushArguments(redisArgs, args);
	        this.#multi.addCommand(redisArgs);
	        return this;
	    }
	    exec(cb) {
	        const promise = this.#client._executeMulti(this.#multi.queue);
	        if (!cb) {
	            promise.catch(err => this.#client.emit('error', err));
	            return;
	        }
	        promise
	            .then(results => cb(null, this.#multi.transformReplies(results)))
	            .catch(err => cb?.(err));
	    }
	}
	
	return legacyMode;
}

var pool = {};

var cache = {};

var hasRequiredCache;

function requireCache () {
	if (hasRequiredCache) return cache;
	hasRequiredCache = 1;
	Object.defineProperty(cache, "__esModule", { value: true });
	cache.PooledNoRedirectClientSideCache = cache.BasicPooledClientSideCache = cache.PooledClientSideCacheProvider = cache.BasicClientSideCache = cache.ClientSideCacheProvider = cache.CacheStats = void 0;
	const stream_1 = require$$0$2;
	/**
	 * A snapshot of cache statistics.
	 *
	 * This class provides an immutable view of the cache's operational statistics at a particular
	 * point in time. It is heavily inspired by the statistics reporting capabilities found in
	 * Ben Manes's Caffeine cache (https://github.com/ben-manes/caffeine).
	 *
	 * Instances of `CacheStats` are typically obtained from a {@link StatsCounter} and can be used
	 * for performance monitoring, debugging, or logging. It includes metrics such as hit rate,
	 * miss rate, load success/failure rates, average load penalty, and eviction counts.
	 *
	 * All statistics are non-negative. Rates and averages are typically in the range `[0.0, 1.0]`,
	 * or `0` if the an operation has not occurred (e.g. hit rate is 0 if there are no requests).
	 *
	 * Cache statistics are incremented according to specific rules:
	 * - When a cache lookup encounters an existing entry, hitCount is incremented.
	 * - When a cache lookup encounters a missing entry, missCount is incremented.
	 * - When a new entry is successfully loaded, loadSuccessCount is incremented and the
	 *   loading time is added to totalLoadTime.
	 * - When an entry fails to load, loadFailureCount is incremented and the
	 *   loading time is added to totalLoadTime.
	 * - When an entry is evicted due to size constraints or expiration,
	 *   evictionCount is incremented.
	 */
	class CacheStats {
	    hitCount;
	    missCount;
	    loadSuccessCount;
	    loadFailureCount;
	    totalLoadTime;
	    evictionCount;
	    /**
	     * Creates a new CacheStats instance with the specified statistics.
	     */
	    constructor(hitCount, missCount, loadSuccessCount, loadFailureCount, totalLoadTime, evictionCount) {
	        this.hitCount = hitCount;
	        this.missCount = missCount;
	        this.loadSuccessCount = loadSuccessCount;
	        this.loadFailureCount = loadFailureCount;
	        this.totalLoadTime = totalLoadTime;
	        this.evictionCount = evictionCount;
	        if (hitCount < 0 ||
	            missCount < 0 ||
	            loadSuccessCount < 0 ||
	            loadFailureCount < 0 ||
	            totalLoadTime < 0 ||
	            evictionCount < 0) {
	            throw new Error('All statistics values must be non-negative');
	        }
	    }
	    /**
	     * Creates a new CacheStats instance with the specified statistics.
	     *
	     * @param hitCount - Number of cache hits
	     * @param missCount - Number of cache misses
	     * @param loadSuccessCount - Number of successful cache loads
	     * @param loadFailureCount - Number of failed cache loads
	     * @param totalLoadTime - Total load time in milliseconds
	     * @param evictionCount - Number of cache evictions
	     */
	    static of(hitCount = 0, missCount = 0, loadSuccessCount = 0, loadFailureCount = 0, totalLoadTime = 0, evictionCount = 0) {
	        return new CacheStats(hitCount, missCount, loadSuccessCount, loadFailureCount, totalLoadTime, evictionCount);
	    }
	    /**
	     * Returns a statistics instance where no cache events have been recorded.
	     *
	     * @returns An empty statistics instance
	     */
	    static empty() {
	        return CacheStats.EMPTY_STATS;
	    }
	    /**
	     * An empty stats instance with all counters set to zero.
	     */
	    static EMPTY_STATS = new CacheStats(0, 0, 0, 0, 0, 0);
	    /**
	    * Returns the total number of times cache lookup methods have returned
	    * either a cached or uncached value.
	    *
	    * @returns Total number of requests (hits + misses)
	    */
	    requestCount() {
	        return this.hitCount + this.missCount;
	    }
	    /**
	     * Returns the hit rate of the cache.
	     * This is defined as hitCount / requestCount, or 1.0 when requestCount is 0.
	     *
	     * @returns The ratio of cache requests that were hits (between 0.0 and 1.0)
	     */
	    hitRate() {
	        const requestCount = this.requestCount();
	        return requestCount === 0 ? 1.0 : this.hitCount / requestCount;
	    }
	    /**
	     * Returns the miss rate of the cache.
	     * This is defined as missCount / requestCount, or 0.0 when requestCount is 0.
	     *
	     * @returns The ratio of cache requests that were misses (between 0.0 and 1.0)
	     */
	    missRate() {
	        const requestCount = this.requestCount();
	        return requestCount === 0 ? 0.0 : this.missCount / requestCount;
	    }
	    /**
	    * Returns the total number of load operations (successful + failed).
	    *
	    * @returns Total number of load operations
	    */
	    loadCount() {
	        return this.loadSuccessCount + this.loadFailureCount;
	    }
	    /**
	     * Returns the ratio of cache loading attempts that failed.
	     * This is defined as loadFailureCount / loadCount, or 0.0 when loadCount is 0.
	     *
	     * @returns Ratio of load operations that failed (between 0.0 and 1.0)
	     */
	    loadFailureRate() {
	        const loadCount = this.loadCount();
	        return loadCount === 0 ? 0.0 : this.loadFailureCount / loadCount;
	    }
	    /**
	     * Returns the average time spent loading new values, in milliseconds.
	     * This is defined as totalLoadTime / loadCount, or 0.0 when loadCount is 0.
	     *
	     * @returns Average load time in milliseconds
	     */
	    averageLoadPenalty() {
	        const loadCount = this.loadCount();
	        return loadCount === 0 ? 0.0 : this.totalLoadTime / loadCount;
	    }
	    /**
	    * Returns a new CacheStats representing the difference between this CacheStats
	    * and another. Negative values are rounded up to zero.
	    *
	    * @param other - The statistics to subtract from this instance
	    * @returns The difference between this instance and other
	    */
	    minus(other) {
	        return CacheStats.of(Math.max(0, this.hitCount - other.hitCount), Math.max(0, this.missCount - other.missCount), Math.max(0, this.loadSuccessCount - other.loadSuccessCount), Math.max(0, this.loadFailureCount - other.loadFailureCount), Math.max(0, this.totalLoadTime - other.totalLoadTime), Math.max(0, this.evictionCount - other.evictionCount));
	    }
	    /**
	     * Returns a new CacheStats representing the sum of this CacheStats and another.
	     *
	     * @param other - The statistics to add to this instance
	     * @returns The sum of this instance and other
	     */
	    plus(other) {
	        return CacheStats.of(this.hitCount + other.hitCount, this.missCount + other.missCount, this.loadSuccessCount + other.loadSuccessCount, this.loadFailureCount + other.loadFailureCount, this.totalLoadTime + other.totalLoadTime, this.evictionCount + other.evictionCount);
	    }
	}
	cache.CacheStats = CacheStats;
	/**
	 * A StatsCounter implementation that does nothing and always returns empty stats.
	 */
	class DisabledStatsCounter {
	    static INSTANCE = new DisabledStatsCounter();
	    constructor() { }
	    recordHits(count) { }
	    recordMisses(count) { }
	    recordLoadSuccess(loadTime) { }
	    recordLoadFailure(loadTime) { }
	    recordEvictions(count) { }
	    snapshot() { return CacheStats.empty(); }
	}
	/**
	 * Returns a StatsCounter that does not record any cache events.
	 *
	 * @return A StatsCounter that does not record metrics
	 */
	function disabledStatsCounter() {
	    return DisabledStatsCounter.INSTANCE;
	}
	/**
	 * A StatsCounter implementation that maintains cache statistics.
	 */
	class DefaultStatsCounter {
	    #hitCount = 0;
	    #missCount = 0;
	    #loadSuccessCount = 0;
	    #loadFailureCount = 0;
	    #totalLoadTime = 0;
	    #evictionCount = 0;
	    /**
	     * Records cache hits.
	     *
	     * @param count - The number of hits to record
	     */
	    recordHits(count) {
	        this.#hitCount += count;
	    }
	    /**
	     * Records cache misses.
	     *
	     * @param count - The number of misses to record
	     */
	    recordMisses(count) {
	        this.#missCount += count;
	    }
	    /**
	     * Records the successful load of a new entry.
	     *
	     * @param loadTime - The number of milliseconds spent loading the entry
	     */
	    recordLoadSuccess(loadTime) {
	        this.#loadSuccessCount++;
	        this.#totalLoadTime += loadTime;
	    }
	    /**
	     * Records the failed load of a new entry.
	     *
	     * @param loadTime - The number of milliseconds spent attempting to load the entry
	     */
	    recordLoadFailure(loadTime) {
	        this.#loadFailureCount++;
	        this.#totalLoadTime += loadTime;
	    }
	    /**
	     * Records cache evictions.
	     *
	     * @param count - The number of evictions to record
	     */
	    recordEvictions(count) {
	        this.#evictionCount += count;
	    }
	    /**
	     * Returns a snapshot of the current statistics.
	     *
	     * @returns A snapshot of the current statistics
	     */
	    snapshot() {
	        return CacheStats.of(this.#hitCount, this.#missCount, this.#loadSuccessCount, this.#loadFailureCount, this.#totalLoadTime, this.#evictionCount);
	    }
	    /**
	     * Creates a new DefaultStatsCounter.
	     *
	     * @returns A new DefaultStatsCounter instance
	     */
	    static create() {
	        return new DefaultStatsCounter();
	    }
	}
	/**
	 * Generates a unique cache key from Redis command arguments
	 *
	 * @param redisArgs - Array of Redis command arguments
	 * @returns A unique string key for caching
	 */
	function generateCacheKey(redisArgs) {
	    const tmp = new Array(redisArgs.length * 2);
	    for (let i = 0; i < redisArgs.length; i++) {
	        tmp[i] = redisArgs[i].length;
	        tmp[i + redisArgs.length] = redisArgs[i];
	    }
	    return tmp.join('_');
	}
	class ClientSideCacheEntryBase {
	    #invalidated = false;
	    #expireTime;
	    constructor(ttl) {
	        if (ttl == 0) {
	            this.#expireTime = 0;
	        }
	        else {
	            this.#expireTime = Date.now() + ttl;
	        }
	    }
	    invalidate() {
	        this.#invalidated = true;
	    }
	    validate() {
	        return !this.#invalidated && (this.#expireTime == 0 || (Date.now() < this.#expireTime));
	    }
	}
	class ClientSideCacheEntryValue extends ClientSideCacheEntryBase {
	    #value;
	    get value() {
	        return this.#value;
	    }
	    constructor(ttl, value) {
	        super(ttl);
	        this.#value = value;
	    }
	}
	class ClientSideCacheEntryPromise extends ClientSideCacheEntryBase {
	    #sendCommandPromise;
	    get promise() {
	        return this.#sendCommandPromise;
	    }
	    constructor(ttl, sendCommandPromise) {
	        super(ttl);
	        this.#sendCommandPromise = sendCommandPromise;
	    }
	}
	class ClientSideCacheProvider extends stream_1.EventEmitter {
	}
	cache.ClientSideCacheProvider = ClientSideCacheProvider;
	class BasicClientSideCache extends ClientSideCacheProvider {
	    #cacheKeyToEntryMap;
	    #keyToCacheKeySetMap;
	    ttl;
	    maxEntries;
	    lru;
	    #statsCounter;
	    recordEvictions(count) {
	        this.#statsCounter.recordEvictions(count);
	    }
	    recordHits(count) {
	        this.#statsCounter.recordHits(count);
	    }
	    recordMisses(count) {
	        this.#statsCounter.recordMisses(count);
	    }
	    constructor(config) {
	        super();
	        this.#cacheKeyToEntryMap = new Map();
	        this.#keyToCacheKeySetMap = new Map();
	        this.ttl = config?.ttl ?? 0;
	        this.maxEntries = config?.maxEntries ?? 0;
	        this.lru = config?.evictPolicy !== "FIFO";
	        const recordStats = config?.recordStats !== false;
	        this.#statsCounter = recordStats ? DefaultStatsCounter.create() : disabledStatsCounter();
	    }
	    /* logic of how caching works:
	  
	    1. commands use a CommandParser
	      it enables us to define/retrieve
	        cacheKey - a unique key that corresponds to this command and its arguments
	        redisKeys - an array of redis keys as strings that if the key is modified, will cause redis to invalidate this result when cached
	    2. check if cacheKey is in our cache
	      2b1. if its a value cacheEntry - return it
	      2b2. if it's a promise cache entry - wait on promise and then go to 3c.
	    3. if cacheEntry is not in cache
	      3a. send the command save the promise into a a cacheEntry and then wait on result
	      3b. transform reply (if required) based on transformReply
	      3b. check the cacheEntry is still valid - in cache and hasn't been deleted)
	      3c. if valid - overwrite with value entry
	    4. return previously non cached result
	    */
	    async handleCache(client, parser, fn, transformReply, typeMapping) {
	        let reply;
	        const cacheKey = generateCacheKey(parser.redisArgs);
	        // "2"
	        let cacheEntry = this.get(cacheKey);
	        if (cacheEntry) {
	            // If instanceof is "too slow", can add a "type" and then use an "as" cast to call proper getters.
	            if (cacheEntry instanceof ClientSideCacheEntryValue) { // "2b1"
	                this.#statsCounter.recordHits(1);
	                return structuredClone(cacheEntry.value);
	            }
	            else if (cacheEntry instanceof ClientSideCacheEntryPromise) { // 2b2
	                // This counts as a miss since the value hasn't been fully loaded yet.
	                this.#statsCounter.recordMisses(1);
	                reply = await cacheEntry.promise;
	            }
	            else {
	                throw new Error("unknown cache entry type");
	            }
	        }
	        else { // 3/3a
	            this.#statsCounter.recordMisses(1);
	            const startTime = performance.now();
	            const promise = fn();
	            cacheEntry = this.createPromiseEntry(client, promise);
	            this.set(cacheKey, cacheEntry, parser.keys);
	            try {
	                reply = await promise;
	                const loadTime = performance.now() - startTime;
	                this.#statsCounter.recordLoadSuccess(loadTime);
	            }
	            catch (err) {
	                const loadTime = performance.now() - startTime;
	                this.#statsCounter.recordLoadFailure(loadTime);
	                if (cacheEntry.validate()) {
	                    this.delete(cacheKey);
	                }
	                throw err;
	            }
	        }
	        // 3b
	        let val;
	        if (transformReply) {
	            val = transformReply(reply, parser.preserve, typeMapping);
	        }
	        else {
	            val = reply;
	        }
	        // 3c
	        if (cacheEntry.validate()) { // revalidating promise entry (dont save value, if promise entry has been invalidated)
	            // 3d
	            cacheEntry = this.createValueEntry(client, val);
	            this.set(cacheKey, cacheEntry, parser.keys);
	            this.emit("cached-key", cacheKey);
	        }
	        return structuredClone(val);
	    }
	    trackingOn() {
	        return ['CLIENT', 'TRACKING', 'ON'];
	    }
	    invalidate(key) {
	        if (key === null) {
	            this.clear(false);
	            this.emit("invalidate", key);
	            return;
	        }
	        const keySet = this.#keyToCacheKeySetMap.get(key.toString());
	        if (keySet) {
	            for (const cacheKey of keySet) {
	                const entry = this.#cacheKeyToEntryMap.get(cacheKey);
	                if (entry) {
	                    entry.invalidate();
	                }
	                this.#cacheKeyToEntryMap.delete(cacheKey);
	            }
	            this.#keyToCacheKeySetMap.delete(key.toString());
	        }
	        this.emit('invalidate', key);
	    }
	    clear(resetStats = true) {
	        const oldSize = this.#cacheKeyToEntryMap.size;
	        this.#cacheKeyToEntryMap.clear();
	        this.#keyToCacheKeySetMap.clear();
	        if (resetStats) {
	            if (!(this.#statsCounter instanceof DisabledStatsCounter)) {
	                this.#statsCounter = DefaultStatsCounter.create();
	            }
	        }
	        else {
	            // If old entries were evicted due to clear, record them as evictions
	            if (oldSize > 0) {
	                this.#statsCounter.recordEvictions(oldSize);
	            }
	        }
	    }
	    get(cacheKey) {
	        const val = this.#cacheKeyToEntryMap.get(cacheKey);
	        if (val && !val.validate()) {
	            this.delete(cacheKey);
	            this.#statsCounter.recordEvictions(1);
	            this.emit("cache-evict", cacheKey);
	            return undefined;
	        }
	        if (val !== undefined && this.lru) {
	            this.#cacheKeyToEntryMap.delete(cacheKey);
	            this.#cacheKeyToEntryMap.set(cacheKey, val);
	        }
	        return val;
	    }
	    delete(cacheKey) {
	        const entry = this.#cacheKeyToEntryMap.get(cacheKey);
	        if (entry) {
	            entry.invalidate();
	            this.#cacheKeyToEntryMap.delete(cacheKey);
	        }
	    }
	    has(cacheKey) {
	        return this.#cacheKeyToEntryMap.has(cacheKey);
	    }
	    set(cacheKey, cacheEntry, keys) {
	        let count = this.#cacheKeyToEntryMap.size;
	        const oldEntry = this.#cacheKeyToEntryMap.get(cacheKey);
	        if (oldEntry) {
	            count--; // overwriting, so not incrementig
	            oldEntry.invalidate();
	        }
	        if (this.maxEntries > 0 && count >= this.maxEntries) {
	            this.deleteOldest();
	            this.#statsCounter.recordEvictions(1);
	        }
	        this.#cacheKeyToEntryMap.set(cacheKey, cacheEntry);
	        for (const key of keys) {
	            if (!this.#keyToCacheKeySetMap.has(key.toString())) {
	                this.#keyToCacheKeySetMap.set(key.toString(), new Set());
	            }
	            const cacheKeySet = this.#keyToCacheKeySetMap.get(key.toString());
	            cacheKeySet.add(cacheKey);
	        }
	    }
	    size() {
	        return this.#cacheKeyToEntryMap.size;
	    }
	    createValueEntry(client, value) {
	        return new ClientSideCacheEntryValue(this.ttl, value);
	    }
	    createPromiseEntry(client, sendCommandPromise) {
	        return new ClientSideCacheEntryPromise(this.ttl, sendCommandPromise);
	    }
	    stats() {
	        return this.#statsCounter.snapshot();
	    }
	    onError() {
	        this.clear();
	    }
	    onClose() {
	        this.clear();
	    }
	    /**
	     * @internal
	     */
	    deleteOldest() {
	        const it = this.#cacheKeyToEntryMap[Symbol.iterator]();
	        const n = it.next();
	        if (!n.done) {
	            const key = n.value[0];
	            const entry = this.#cacheKeyToEntryMap.get(key);
	            if (entry) {
	                entry.invalidate();
	            }
	            this.#cacheKeyToEntryMap.delete(key);
	        }
	    }
	    /**
	     * Get cache entries for debugging
	     * @internal
	     */
	    entryEntries() {
	        return this.#cacheKeyToEntryMap.entries();
	    }
	    /**
	     * Get key set entries for debugging
	     * @internal
	     */
	    keySetEntries() {
	        return this.#keyToCacheKeySetMap.entries();
	    }
	}
	cache.BasicClientSideCache = BasicClientSideCache;
	class PooledClientSideCacheProvider extends BasicClientSideCache {
	    #disabled = false;
	    disable() {
	        this.#disabled = true;
	    }
	    enable() {
	        this.#disabled = false;
	    }
	    get(cacheKey) {
	        if (this.#disabled) {
	            return undefined;
	        }
	        return super.get(cacheKey);
	    }
	    has(cacheKey) {
	        if (this.#disabled) {
	            return false;
	        }
	        return super.has(cacheKey);
	    }
	    onPoolClose() {
	        this.clear();
	    }
	}
	cache.PooledClientSideCacheProvider = PooledClientSideCacheProvider;
	class BasicPooledClientSideCache extends PooledClientSideCacheProvider {
	    onError() {
	        this.clear(false);
	    }
	    onClose() {
	        this.clear(false);
	    }
	}
	cache.BasicPooledClientSideCache = BasicPooledClientSideCache;
	class PooledClientSideCacheEntryValue extends ClientSideCacheEntryValue {
	    #creator;
	    constructor(ttl, creator, value) {
	        super(ttl, value);
	        this.#creator = creator;
	    }
	    validate() {
	        let ret = super.validate();
	        if (this.#creator) {
	            ret = ret && this.#creator.client.isReady && this.#creator.client.socketEpoch == this.#creator.epoch;
	        }
	        return ret;
	    }
	}
	class PooledClientSideCacheEntryPromise extends ClientSideCacheEntryPromise {
	    #creator;
	    constructor(ttl, creator, sendCommandPromise) {
	        super(ttl, sendCommandPromise);
	        this.#creator = creator;
	    }
	    validate() {
	        let ret = super.validate();
	        return ret && this.#creator.client.isReady && this.#creator.client.socketEpoch == this.#creator.epoch;
	    }
	}
	class PooledNoRedirectClientSideCache extends BasicPooledClientSideCache {
	    createValueEntry(client, value) {
	        const creator = {
	            epoch: client.socketEpoch,
	            client: client
	        };
	        return new PooledClientSideCacheEntryValue(this.ttl, creator, value);
	    }
	    createPromiseEntry(client, sendCommandPromise) {
	        const creator = {
	            epoch: client.socketEpoch,
	            client: client
	        };
	        return new PooledClientSideCacheEntryPromise(this.ttl, creator, sendCommandPromise);
	    }
	    onError() { }
	    onClose() { }
	}
	cache.PooledNoRedirectClientSideCache = PooledNoRedirectClientSideCache;
	
	return cache;
}

var singleEntryCache = {};

var hasRequiredSingleEntryCache;

function requireSingleEntryCache () {
	if (hasRequiredSingleEntryCache) return singleEntryCache;
	hasRequiredSingleEntryCache = 1;
	Object.defineProperty(singleEntryCache, "__esModule", { value: true });
	class SingleEntryCache {
	    #cached;
	    #serializedKey;
	    /**
	     * Retrieves an instance from the cache based on the provided key object.
	     *
	     * @param keyObj - The key object to look up in the cache.
	     * @returns The cached instance if found, undefined otherwise.
	     *
	     * @remarks
	     * This method uses JSON.stringify for comparison, which may not work correctly
	     * if the properties in the key object are rearranged or reordered.
	     */
	    get(keyObj) {
	        return JSON.stringify(keyObj, makeCircularReplacer()) === this.#serializedKey ? this.#cached : undefined;
	    }
	    set(keyObj, obj) {
	        this.#cached = obj;
	        this.#serializedKey = JSON.stringify(keyObj, makeCircularReplacer());
	    }
	}
	singleEntryCache.default = SingleEntryCache;
	function makeCircularReplacer() {
	    const seen = new WeakSet();
	    return function serialize(_, value) {
	        if (value && typeof value === 'object') {
	            if (seen.has(value)) {
	                return 'circular';
	            }
	            seen.add(value);
	            return value;
	        }
	        return value;
	    };
	}
	
	return singleEntryCache;
}

var hasRequiredPool;

function requirePool () {
	if (hasRequiredPool) return pool;
	hasRequiredPool = 1;
	var __importDefault = (pool && pool.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(pool, "__esModule", { value: true });
	pool.RedisClientPool = void 0;
	const commands_1 = __importDefault(requireCommands$5());
	const _1 = __importDefault(requireClient());
	const node_events_1 = require$$0$1;
	const linked_list_1 = requireLinkedList();
	const errors_1 = requireErrors();
	const commander_1 = requireCommander();
	const multi_command_1 = __importDefault(requireMultiCommand$1());
	const cache_1 = requireCache();
	const parser_1 = requireParser();
	const single_entry_cache_1 = __importDefault(requireSingleEntryCache());
	class RedisClientPool extends node_events_1.EventEmitter {
	    static #createCommand(command, resp) {
	        const transformReply = (0, commander_1.getTransformReply)(command, resp);
	        return async function (...args) {
	            const parser = new parser_1.BasicCommandParser();
	            command.parseCommand(parser, ...args);
	            return this.execute(client => client._executeCommand(command, parser, this._commandOptions, transformReply));
	        };
	    }
	    static #createModuleCommand(command, resp) {
	        const transformReply = (0, commander_1.getTransformReply)(command, resp);
	        return async function (...args) {
	            const parser = new parser_1.BasicCommandParser();
	            command.parseCommand(parser, ...args);
	            return this._self.execute(client => client._executeCommand(command, parser, this._self._commandOptions, transformReply));
	        };
	    }
	    static #createFunctionCommand(name, fn, resp) {
	        const prefix = (0, commander_1.functionArgumentsPrefix)(name, fn);
	        const transformReply = (0, commander_1.getTransformReply)(fn, resp);
	        return async function (...args) {
	            const parser = new parser_1.BasicCommandParser();
	            parser.push(...prefix);
	            fn.parseCommand(parser, ...args);
	            return this._self.execute(client => client._executeCommand(fn, parser, this._self._commandOptions, transformReply));
	        };
	    }
	    static #createScriptCommand(script, resp) {
	        const prefix = (0, commander_1.scriptArgumentsPrefix)(script);
	        const transformReply = (0, commander_1.getTransformReply)(script, resp);
	        return async function (...args) {
	            const parser = new parser_1.BasicCommandParser();
	            parser.pushVariadic(prefix);
	            script.parseCommand(parser, ...args);
	            return this.execute(client => client._executeScript(script, parser, this._commandOptions, transformReply));
	        };
	    }
	    static #SingleEntryCache = new single_entry_cache_1.default();
	    static create(clientOptions, options) {
	        let Pool = RedisClientPool.#SingleEntryCache.get(clientOptions);
	        if (!Pool) {
	            Pool = (0, commander_1.attachConfig)({
	                BaseClass: RedisClientPool,
	                commands: commands_1.default,
	                createCommand: RedisClientPool.#createCommand,
	                createModuleCommand: RedisClientPool.#createModuleCommand,
	                createFunctionCommand: RedisClientPool.#createFunctionCommand,
	                createScriptCommand: RedisClientPool.#createScriptCommand,
	                config: clientOptions
	            });
	            Pool.prototype.Multi = multi_command_1.default.extend(clientOptions);
	            RedisClientPool.#SingleEntryCache.set(clientOptions, Pool);
	        }
	        // returning a "proxy" to prevent the namespaces._self to leak between "proxies"
	        return Object.create(new Pool(clientOptions, options));
	    }
	    // TODO: defaults
	    static #DEFAULTS = {
	        minimum: 1,
	        maximum: 100,
	        acquireTimeout: 3000,
	        cleanupDelay: 3000
	    };
	    #clientFactory;
	    #options;
	    #idleClients = new linked_list_1.SinglyLinkedList();
	    /**
	     * The number of idle clients.
	     */
	    get idleClients() {
	        return this._self.#idleClients.length;
	    }
	    #clientsInUse = new linked_list_1.DoublyLinkedList();
	    /**
	     * The number of clients in use.
	     */
	    get clientsInUse() {
	        return this._self.#clientsInUse.length;
	    }
	    /**
	     * The total number of clients in the pool (including connecting, idle, and in use).
	     */
	    get totalClients() {
	        return this._self.#idleClients.length + this._self.#clientsInUse.length;
	    }
	    #tasksQueue = new linked_list_1.SinglyLinkedList();
	    /**
	     * The number of tasks waiting for a client to become available.
	     */
	    get tasksQueueLength() {
	        return this._self.#tasksQueue.length;
	    }
	    #isOpen = false;
	    /**
	     * Whether the pool is open (either connecting or connected).
	     */
	    get isOpen() {
	        return this._self.#isOpen;
	    }
	    #isClosing = false;
	    /**
	     * Whether the pool is closing (*not* closed).
	     */
	    get isClosing() {
	        return this._self.#isClosing;
	    }
	    #clientSideCache;
	    get clientSideCache() {
	        return this._self.#clientSideCache;
	    }
	    /**
	     * You are probably looking for {@link RedisClient.createPool `RedisClient.createPool`},
	     * {@link RedisClientPool.fromClient `RedisClientPool.fromClient`},
	     * or {@link RedisClientPool.fromOptions `RedisClientPool.fromOptions`}...
	     */
	    constructor(clientOptions, options) {
	        super();
	        this.#options = {
	            ...RedisClientPool.#DEFAULTS,
	            ...options
	        };
	        if (options?.clientSideCache) {
	            if (clientOptions === undefined) {
	                clientOptions = {};
	            }
	            if (options.clientSideCache instanceof cache_1.PooledClientSideCacheProvider) {
	                this.#clientSideCache = clientOptions.clientSideCache = options.clientSideCache;
	            }
	            else {
	                const cscConfig = options.clientSideCache;
	                this.#clientSideCache = clientOptions.clientSideCache = new cache_1.BasicPooledClientSideCache(cscConfig);
	                //        this.#clientSideCache = clientOptions.clientSideCache = new PooledNoRedirectClientSideCache(cscConfig);
	            }
	        }
	        this.#clientFactory = _1.default.factory(clientOptions).bind(undefined, clientOptions);
	    }
	    _self = this;
	    _commandOptions;
	    withCommandOptions(options) {
	        const proxy = Object.create(this._self);
	        proxy._commandOptions = options;
	        return proxy;
	    }
	    #commandOptionsProxy(key, value) {
	        const proxy = Object.create(this._self);
	        proxy._commandOptions = Object.create(this._commandOptions ?? null);
	        proxy._commandOptions[key] = value;
	        return proxy;
	    }
	    /**
	     * Override the `typeMapping` command option
	     */
	    withTypeMapping(typeMapping) {
	        return this._self.#commandOptionsProxy('typeMapping', typeMapping);
	    }
	    /**
	     * Override the `abortSignal` command option
	     */
	    withAbortSignal(abortSignal) {
	        return this._self.#commandOptionsProxy('abortSignal', abortSignal);
	    }
	    /**
	     * Override the `asap` command option to `true`
	     * TODO: remove?
	     */
	    asap() {
	        return this._self.#commandOptionsProxy('asap', true);
	    }
	    async connect() {
	        if (this._self.#isOpen)
	            return; // TODO: throw error?
	        this._self.#isOpen = true;
	        const promises = [];
	        while (promises.length < this._self.#options.minimum) {
	            promises.push(this._self.#create());
	        }
	        try {
	            await Promise.all(promises);
	        }
	        catch (err) {
	            this.destroy();
	            throw err;
	        }
	        return this;
	    }
	    async #create() {
	        const node = this._self.#clientsInUse.push(this._self.#clientFactory()
	            .on('error', (err) => this.emit('error', err)));
	        try {
	            const client = node.value;
	            await client.connect();
	        }
	        catch (err) {
	            this._self.#clientsInUse.remove(node);
	            throw err;
	        }
	        this._self.#returnClient(node);
	    }
	    execute(fn) {
	        return new Promise((resolve, reject) => {
	            const client = this._self.#idleClients.shift(), { tail } = this._self.#tasksQueue;
	            if (!client) {
	                let timeout;
	                if (this._self.#options.acquireTimeout > 0) {
	                    timeout = setTimeout(() => {
	                        this._self.#tasksQueue.remove(task, tail);
	                        reject(new errors_1.TimeoutError('Timeout waiting for a client')); // TODO: message
	                    }, this._self.#options.acquireTimeout);
	                }
	                const task = this._self.#tasksQueue.push({
	                    timeout,
	                    // @ts-ignore
	                    resolve,
	                    reject,
	                    fn
	                });
	                if (this.totalClients < this._self.#options.maximum) {
	                    this._self.#create();
	                }
	                return;
	            }
	            const node = this._self.#clientsInUse.push(client);
	            // @ts-ignore
	            this._self.#executeTask(node, resolve, reject, fn);
	        });
	    }
	    #executeTask(node, resolve, reject, fn) {
	        const result = fn(node.value);
	        if (result instanceof Promise) {
	            result.then(resolve, reject);
	            result.finally(() => this.#returnClient(node));
	        }
	        else {
	            resolve(result);
	            this.#returnClient(node);
	        }
	    }
	    #returnClient(node) {
	        const task = this.#tasksQueue.shift();
	        if (task) {
	            clearTimeout(task.timeout);
	            this.#executeTask(node, task.resolve, task.reject, task.fn);
	            return;
	        }
	        this.#clientsInUse.remove(node);
	        this.#idleClients.push(node.value);
	        this.#scheduleCleanup();
	    }
	    cleanupTimeout;
	    #scheduleCleanup() {
	        if (this.totalClients <= this.#options.minimum)
	            return;
	        clearTimeout(this.cleanupTimeout);
	        this.cleanupTimeout = setTimeout(() => this.#cleanup(), this.#options.cleanupDelay);
	    }
	    #cleanup() {
	        const toDestroy = Math.min(this.#idleClients.length, this.totalClients - this.#options.minimum);
	        for (let i = 0; i < toDestroy; i++) {
	            // TODO: shift vs pop
	            const client = this.#idleClients.shift();
	            client.destroy();
	        }
	    }
	    sendCommand(args, options) {
	        return this.execute(client => client.sendCommand(args, options));
	    }
	    MULTI() {
	        return new this.Multi((commands, selectedDB) => this.execute(client => client._executeMulti(commands, selectedDB)), commands => this.execute(client => client._executePipeline(commands)), this._commandOptions?.typeMapping);
	    }
	    multi = this.MULTI;
	    async close() {
	        if (this._self.#isClosing)
	            return; // TODO: throw err?
	        if (!this._self.#isOpen)
	            return; // TODO: throw err?
	        this._self.#isClosing = true;
	        try {
	            const promises = [];
	            for (const client of this._self.#idleClients) {
	                promises.push(client.close());
	            }
	            for (const client of this._self.#clientsInUse) {
	                promises.push(client.close());
	            }
	            await Promise.all(promises);
	            this.#clientSideCache?.onPoolClose();
	            this._self.#idleClients.reset();
	            this._self.#clientsInUse.reset();
	        }
	        catch (err) {
	        }
	        finally {
	            this._self.#isClosing = false;
	        }
	    }
	    destroy() {
	        for (const client of this._self.#idleClients) {
	            client.destroy();
	        }
	        this._self.#idleClients.reset();
	        for (const client of this._self.#clientsInUse) {
	            client.destroy();
	        }
	        this._self.#clientSideCache?.onPoolClose();
	        this._self.#clientsInUse.reset();
	        this._self.#isOpen = false;
	    }
	}
	pool.RedisClientPool = RedisClientPool;
	
	return pool;
}

var version = "5.6.0";
var require$$17 = {
	version: version};

var hasRequiredClient;

function requireClient () {
	if (hasRequiredClient) return client;
	hasRequiredClient = 1;
	var __importDefault = (client && client.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	var _a;
	Object.defineProperty(client, "__esModule", { value: true });
	const commands_1 = __importDefault(requireCommands$5());
	const socket_1 = __importDefault(requireSocket());
	const authx_1 = requireAuthx();
	const commands_queue_1 = __importDefault(requireCommandsQueue());
	const node_events_1 = require$$0$1;
	const commander_1 = requireCommander();
	const errors_1 = requireErrors();
	const node_url_1 = require$$7;
	const pub_sub_1 = requirePubSub();
	const multi_command_1 = __importDefault(requireMultiCommand$1());
	const HELLO_1 = __importDefault(requireHELLO());
	const legacy_mode_1 = requireLegacyMode();
	const pool_1 = requirePool();
	const generic_transformers_1 = requireGenericTransformers();
	const cache_1 = requireCache();
	const parser_1 = requireParser();
	const single_entry_cache_1 = __importDefault(requireSingleEntryCache());
	const package_json_1 = require$$17;
	class RedisClient extends node_events_1.EventEmitter {
	    static #createCommand(command, resp) {
	        const transformReply = (0, commander_1.getTransformReply)(command, resp);
	        return async function (...args) {
	            const parser = new parser_1.BasicCommandParser();
	            command.parseCommand(parser, ...args);
	            return this._self._executeCommand(command, parser, this._commandOptions, transformReply);
	        };
	    }
	    static #createModuleCommand(command, resp) {
	        const transformReply = (0, commander_1.getTransformReply)(command, resp);
	        return async function (...args) {
	            const parser = new parser_1.BasicCommandParser();
	            command.parseCommand(parser, ...args);
	            return this._self._executeCommand(command, parser, this._self._commandOptions, transformReply);
	        };
	    }
	    static #createFunctionCommand(name, fn, resp) {
	        const prefix = (0, commander_1.functionArgumentsPrefix)(name, fn);
	        const transformReply = (0, commander_1.getTransformReply)(fn, resp);
	        return async function (...args) {
	            const parser = new parser_1.BasicCommandParser();
	            parser.push(...prefix);
	            fn.parseCommand(parser, ...args);
	            return this._self._executeCommand(fn, parser, this._self._commandOptions, transformReply);
	        };
	    }
	    static #createScriptCommand(script, resp) {
	        const prefix = (0, commander_1.scriptArgumentsPrefix)(script);
	        const transformReply = (0, commander_1.getTransformReply)(script, resp);
	        return async function (...args) {
	            const parser = new parser_1.BasicCommandParser();
	            parser.push(...prefix);
	            script.parseCommand(parser, ...args);
	            return this._executeScript(script, parser, this._commandOptions, transformReply);
	        };
	    }
	    static #SingleEntryCache = new single_entry_cache_1.default();
	    static factory(config) {
	        let Client = _a.#SingleEntryCache.get(config);
	        if (!Client) {
	            Client = (0, commander_1.attachConfig)({
	                BaseClass: _a,
	                commands: commands_1.default,
	                createCommand: _a.#createCommand,
	                createModuleCommand: _a.#createModuleCommand,
	                createFunctionCommand: _a.#createFunctionCommand,
	                createScriptCommand: _a.#createScriptCommand,
	                config
	            });
	            Client.prototype.Multi = multi_command_1.default.extend(config);
	            _a.#SingleEntryCache.set(config, Client);
	        }
	        return (options) => {
	            // returning a "proxy" to prevent the namespaces._self to leak between "proxies"
	            return Object.create(new Client(options));
	        };
	    }
	    static create(options) {
	        return _a.factory(options)(options);
	    }
	    static parseURL(url) {
	        // https://www.iana.org/assignments/uri-schemes/prov/redis
	        const { hostname, port, protocol, username, password, pathname } = new node_url_1.URL(url), parsed = {
	            socket: {
	                host: hostname
	            }
	        };
	        if (protocol === 'rediss:') {
	            parsed.socket.tls = true;
	        }
	        else if (protocol !== 'redis:') {
	            throw new TypeError('Invalid protocol');
	        }
	        if (port) {
	            parsed.socket.port = Number(port);
	        }
	        if (username) {
	            parsed.username = decodeURIComponent(username);
	        }
	        if (password) {
	            parsed.password = decodeURIComponent(password);
	        }
	        if (username || password) {
	            parsed.credentialsProvider = {
	                type: 'async-credentials-provider',
	                credentials: async () => ({
	                    username: username ? decodeURIComponent(username) : undefined,
	                    password: password ? decodeURIComponent(password) : undefined
	                })
	            };
	        }
	        if (pathname.length > 1) {
	            const database = Number(pathname.substring(1));
	            if (isNaN(database)) {
	                throw new TypeError('Invalid pathname');
	            }
	            parsed.database = database;
	        }
	        return parsed;
	    }
	    #options;
	    #socket;
	    #queue;
	    #selectedDB = 0;
	    #monitorCallback;
	    _self = this;
	    _commandOptions;
	    // flag used to annotate that the client
	    // was in a watch transaction when
	    // a topology change occured
	    #dirtyWatch;
	    #watchEpoch;
	    #clientSideCache;
	    #credentialsSubscription = null;
	    get clientSideCache() {
	        return this._self.#clientSideCache;
	    }
	    get options() {
	        return this._self.#options;
	    }
	    get isOpen() {
	        return this._self.#socket.isOpen;
	    }
	    get isReady() {
	        return this._self.#socket.isReady;
	    }
	    get isPubSubActive() {
	        return this._self.#queue.isPubSubActive;
	    }
	    get socketEpoch() {
	        return this._self.#socket.socketEpoch;
	    }
	    get isWatching() {
	        return this._self.#watchEpoch !== undefined;
	    }
	    /**
	     * Indicates whether the client's WATCH command has been invalidated by a topology change.
	     * When this returns true, any transaction using WATCH will fail with a WatchError.
	     * @returns true if the watched keys have been modified, false otherwise
	     */
	    get isDirtyWatch() {
	        return this._self.#dirtyWatch !== undefined;
	    }
	    /**
	     * Marks the client's WATCH command as invalidated due to a topology change.
	     * This will cause any subsequent EXEC in a transaction to fail with a WatchError.
	     * @param msg - The error message explaining why the WATCH is dirty
	     */
	    setDirtyWatch(msg) {
	        this._self.#dirtyWatch = msg;
	    }
	    constructor(options) {
	        super();
	        this.#validateOptions(options);
	        this.#options = this.#initiateOptions(options);
	        this.#queue = this.#initiateQueue();
	        this.#socket = this.#initiateSocket();
	        if (options?.clientSideCache) {
	            if (options.clientSideCache instanceof cache_1.ClientSideCacheProvider) {
	                this.#clientSideCache = options.clientSideCache;
	            }
	            else {
	                const cscConfig = options.clientSideCache;
	                this.#clientSideCache = new cache_1.BasicClientSideCache(cscConfig);
	            }
	            this.#queue.setInvalidateCallback(this.#clientSideCache.invalidate.bind(this.#clientSideCache));
	        }
	    }
	    #validateOptions(options) {
	        if (options?.clientSideCache && options?.RESP !== 3) {
	            throw new Error('Client Side Caching is only supported with RESP3');
	        }
	    }
	    #initiateOptions(options) {
	        // Convert username/password to credentialsProvider if no credentialsProvider is already in place
	        if (!options?.credentialsProvider && (options?.username || options?.password)) {
	            options.credentialsProvider = {
	                type: 'async-credentials-provider',
	                credentials: async () => ({
	                    username: options.username,
	                    password: options.password
	                })
	            };
	        }
	        if (options?.url) {
	            const parsed = _a.parseURL(options.url);
	            if (options.socket) {
	                parsed.socket = Object.assign(options.socket, parsed.socket);
	            }
	            Object.assign(options, parsed);
	        }
	        if (options?.database) {
	            this._self.#selectedDB = options.database;
	        }
	        if (options?.commandOptions) {
	            this._commandOptions = options.commandOptions;
	        }
	        return options;
	    }
	    #initiateQueue() {
	        return new commands_queue_1.default(this.#options?.RESP ?? 2, this.#options?.commandsQueueMaxLength, (channel, listeners) => this.emit('sharded-channel-moved', channel, listeners));
	    }
	    /**
	     * @param credentials
	     */
	    reAuthenticate = async (credentials) => {
	        // Re-authentication is not supported on RESP2 with PubSub active
	        if (!(this.isPubSubActive && !this.#options?.RESP)) {
	            await this.sendCommand((0, generic_transformers_1.parseArgs)(commands_1.default.AUTH, {
	                username: credentials.username,
	                password: credentials.password ?? ''
	            }));
	        }
	    };
	    #subscribeForStreamingCredentials(cp) {
	        return cp.subscribe({
	            onNext: credentials => {
	                this.reAuthenticate(credentials).catch(error => {
	                    const errorMessage = error instanceof Error ? error.message : String(error);
	                    cp.onReAuthenticationError(new authx_1.CredentialsError(errorMessage));
	                });
	            },
	            onError: (e) => {
	                const errorMessage = `Error from streaming credentials provider: ${e.message}`;
	                cp.onReAuthenticationError(new authx_1.UnableToObtainNewCredentialsError(errorMessage));
	            }
	        });
	    }
	    async #handshake(chainId, asap) {
	        const promises = [];
	        const commandsWithErrorHandlers = await this.#getHandshakeCommands();
	        if (asap)
	            commandsWithErrorHandlers.reverse();
	        for (const { cmd, errorHandler } of commandsWithErrorHandlers) {
	            promises.push(this.#queue
	                .addCommand(cmd, {
	                chainId,
	                asap
	            })
	                .catch(errorHandler));
	        }
	        return promises;
	    }
	    async #getHandshakeCommands() {
	        const commands = [];
	        const cp = this.#options?.credentialsProvider;
	        if (this.#options?.RESP) {
	            const hello = {};
	            if (cp && cp.type === 'async-credentials-provider') {
	                const credentials = await cp.credentials();
	                if (credentials.password) {
	                    hello.AUTH = {
	                        username: credentials.username ?? 'default',
	                        password: credentials.password
	                    };
	                }
	            }
	            if (cp && cp.type === 'streaming-credentials-provider') {
	                const [credentials, disposable] = await this.#subscribeForStreamingCredentials(cp);
	                this.#credentialsSubscription = disposable;
	                if (credentials.password) {
	                    hello.AUTH = {
	                        username: credentials.username ?? 'default',
	                        password: credentials.password
	                    };
	                }
	            }
	            if (this.#options.name) {
	                hello.SETNAME = this.#options.name;
	            }
	            commands.push({ cmd: (0, generic_transformers_1.parseArgs)(HELLO_1.default, this.#options.RESP, hello) });
	        }
	        else {
	            if (cp && cp.type === 'async-credentials-provider') {
	                const credentials = await cp.credentials();
	                if (credentials.username || credentials.password) {
	                    commands.push({
	                        cmd: (0, generic_transformers_1.parseArgs)(commands_1.default.AUTH, {
	                            username: credentials.username,
	                            password: credentials.password ?? ''
	                        })
	                    });
	                }
	            }
	            if (cp && cp.type === 'streaming-credentials-provider') {
	                const [credentials, disposable] = await this.#subscribeForStreamingCredentials(cp);
	                this.#credentialsSubscription = disposable;
	                if (credentials.username || credentials.password) {
	                    commands.push({
	                        cmd: (0, generic_transformers_1.parseArgs)(commands_1.default.AUTH, {
	                            username: credentials.username,
	                            password: credentials.password ?? ''
	                        })
	                    });
	                }
	            }
	            if (this.#options?.name) {
	                commands.push({
	                    cmd: (0, generic_transformers_1.parseArgs)(commands_1.default.CLIENT_SETNAME, this.#options.name)
	                });
	            }
	        }
	        if (this.#selectedDB !== 0) {
	            commands.push({ cmd: ['SELECT', this.#selectedDB.toString()] });
	        }
	        if (this.#options?.readonly) {
	            commands.push({ cmd: (0, generic_transformers_1.parseArgs)(commands_1.default.READONLY) });
	        }
	        if (!this.#options?.disableClientInfo) {
	            commands.push({
	                cmd: ['CLIENT', 'SETINFO', 'LIB-VER', package_json_1.version],
	                errorHandler: () => {
	                    // Client libraries are expected to pipeline this command
	                    // after authentication on all connections and ignore failures
	                    // since they could be connected to an older version that doesn't support them.
	                }
	            });
	            commands.push({
	                cmd: [
	                    'CLIENT',
	                    'SETINFO',
	                    'LIB-NAME',
	                    this.#options?.clientInfoTag
	                        ? `node-redis(${this.#options.clientInfoTag})`
	                        : 'node-redis'
	                ],
	                errorHandler: () => {
	                    // Client libraries are expected to pipeline this command
	                    // after authentication on all connections and ignore failures
	                    // since they could be connected to an older version that doesn't support them.
	                }
	            });
	        }
	        if (this.#clientSideCache) {
	            commands.push({ cmd: this.#clientSideCache.trackingOn() });
	        }
	        return commands;
	    }
	    #initiateSocket() {
	        const socketInitiator = async () => {
	            const promises = [], chainId = Symbol('Socket Initiator');
	            const resubscribePromise = this.#queue.resubscribe(chainId);
	            if (resubscribePromise) {
	                promises.push(resubscribePromise);
	            }
	            if (this.#monitorCallback) {
	                promises.push(this.#queue.monitor(this.#monitorCallback, {
	                    typeMapping: this._commandOptions?.typeMapping,
	                    chainId,
	                    asap: true
	                }));
	            }
	            promises.push(...(await this.#handshake(chainId, true)));
	            if (promises.length) {
	                this.#write();
	                return Promise.all(promises);
	            }
	        };
	        return new socket_1.default(socketInitiator, this.#options?.socket)
	            .on('data', chunk => {
	            try {
	                this.#queue.decoder.write(chunk);
	            }
	            catch (err) {
	                this.#queue.resetDecoder();
	                this.emit('error', err);
	            }
	        })
	            .on('error', err => {
	            this.emit('error', err);
	            this.#clientSideCache?.onError();
	            if (this.#socket.isOpen && !this.#options?.disableOfflineQueue) {
	                this.#queue.flushWaitingForReply(err);
	            }
	            else {
	                this.#queue.flushAll(err);
	            }
	        })
	            .on('connect', () => this.emit('connect'))
	            .on('ready', () => {
	            this.emit('ready');
	            this.#setPingTimer();
	            this.#maybeScheduleWrite();
	        })
	            .on('reconnecting', () => this.emit('reconnecting'))
	            .on('drain', () => this.#maybeScheduleWrite())
	            .on('end', () => this.emit('end'));
	    }
	    #pingTimer;
	    #setPingTimer() {
	        if (!this.#options?.pingInterval || !this.#socket.isReady)
	            return;
	        clearTimeout(this.#pingTimer);
	        this.#pingTimer = setTimeout(() => {
	            if (!this.#socket.isReady)
	                return;
	            this.sendCommand(['PING'])
	                .then(reply => this.emit('ping-interval', reply))
	                .catch(err => this.emit('error', err))
	                .finally(() => this.#setPingTimer());
	        }, this.#options.pingInterval);
	    }
	    withCommandOptions(options) {
	        const proxy = Object.create(this._self);
	        proxy._commandOptions = options;
	        return proxy;
	    }
	    _commandOptionsProxy(key, value) {
	        const proxy = Object.create(this._self);
	        proxy._commandOptions = Object.create(this._commandOptions ?? null);
	        proxy._commandOptions[key] = value;
	        return proxy;
	    }
	    /**
	     * Override the `typeMapping` command option
	     */
	    withTypeMapping(typeMapping) {
	        return this._commandOptionsProxy('typeMapping', typeMapping);
	    }
	    /**
	     * Override the `abortSignal` command option
	     */
	    withAbortSignal(abortSignal) {
	        return this._commandOptionsProxy('abortSignal', abortSignal);
	    }
	    /**
	     * Override the `asap` command option to `true`
	     */
	    asap() {
	        return this._commandOptionsProxy('asap', true);
	    }
	    /**
	     * Create the "legacy" (v3/callback) interface
	     */
	    legacy() {
	        return new legacy_mode_1.RedisLegacyClient(this);
	    }
	    /**
	     * Create {@link RedisClientPool `RedisClientPool`} using this client as a prototype
	     */
	    createPool(options) {
	        return pool_1.RedisClientPool.create(this._self.#options, options);
	    }
	    duplicate(overrides) {
	        return new (Object.getPrototypeOf(this).constructor)({
	            ...this._self.#options,
	            commandOptions: this._commandOptions,
	            ...overrides
	        });
	    }
	    async connect() {
	        await this._self.#socket.connect();
	        return this;
	    }
	    /**
	     * @internal
	     */
	    async _executeCommand(command, parser, commandOptions, transformReply) {
	        const csc = this._self.#clientSideCache;
	        const defaultTypeMapping = this._self.#options?.commandOptions === commandOptions;
	        const fn = () => { return this.sendCommand(parser.redisArgs, commandOptions); };
	        if (csc && command.CACHEABLE && defaultTypeMapping) {
	            return await csc.handleCache(this._self, parser, fn, transformReply, commandOptions?.typeMapping);
	        }
	        else {
	            const reply = await fn();
	            if (transformReply) {
	                return transformReply(reply, parser.preserve, commandOptions?.typeMapping);
	            }
	            return reply;
	        }
	    }
	    /**
	     * @internal
	     */
	    async _executeScript(script, parser, options, transformReply) {
	        const args = parser.redisArgs;
	        let reply;
	        try {
	            reply = await this.sendCommand(args, options);
	        }
	        catch (err) {
	            if (!err?.message?.startsWith?.('NOSCRIPT'))
	                throw err;
	            args[0] = 'EVAL';
	            args[1] = script.SCRIPT;
	            reply = await this.sendCommand(args, options);
	        }
	        return transformReply ?
	            transformReply(reply, parser.preserve, options?.typeMapping) :
	            reply;
	    }
	    sendCommand(args, options) {
	        if (!this._self.#socket.isOpen) {
	            return Promise.reject(new errors_1.ClientClosedError());
	        }
	        else if (!this._self.#socket.isReady && this._self.#options?.disableOfflineQueue) {
	            return Promise.reject(new errors_1.ClientOfflineError());
	        }
	        // Merge global options with provided options
	        const opts = {
	            ...this._self._commandOptions,
	            ...options
	        };
	        const promise = this._self.#queue.addCommand(args, opts);
	        this._self.#scheduleWrite();
	        return promise;
	    }
	    async SELECT(db) {
	        await this.sendCommand(['SELECT', db.toString()]);
	        this._self.#selectedDB = db;
	    }
	    select = this.SELECT;
	    #pubSubCommand(promise) {
	        if (promise === undefined)
	            return Promise.resolve();
	        this.#scheduleWrite();
	        return promise;
	    }
	    SUBSCRIBE(channels, listener, bufferMode) {
	        return this._self.#pubSubCommand(this._self.#queue.subscribe(pub_sub_1.PUBSUB_TYPE.CHANNELS, channels, listener, bufferMode));
	    }
	    subscribe = this.SUBSCRIBE;
	    UNSUBSCRIBE(channels, listener, bufferMode) {
	        return this._self.#pubSubCommand(this._self.#queue.unsubscribe(pub_sub_1.PUBSUB_TYPE.CHANNELS, channels, listener, bufferMode));
	    }
	    unsubscribe = this.UNSUBSCRIBE;
	    PSUBSCRIBE(patterns, listener, bufferMode) {
	        return this._self.#pubSubCommand(this._self.#queue.subscribe(pub_sub_1.PUBSUB_TYPE.PATTERNS, patterns, listener, bufferMode));
	    }
	    pSubscribe = this.PSUBSCRIBE;
	    PUNSUBSCRIBE(patterns, listener, bufferMode) {
	        return this._self.#pubSubCommand(this._self.#queue.unsubscribe(pub_sub_1.PUBSUB_TYPE.PATTERNS, patterns, listener, bufferMode));
	    }
	    pUnsubscribe = this.PUNSUBSCRIBE;
	    SSUBSCRIBE(channels, listener, bufferMode) {
	        return this._self.#pubSubCommand(this._self.#queue.subscribe(pub_sub_1.PUBSUB_TYPE.SHARDED, channels, listener, bufferMode));
	    }
	    sSubscribe = this.SSUBSCRIBE;
	    SUNSUBSCRIBE(channels, listener, bufferMode) {
	        return this._self.#pubSubCommand(this._self.#queue.unsubscribe(pub_sub_1.PUBSUB_TYPE.SHARDED, channels, listener, bufferMode));
	    }
	    sUnsubscribe = this.SUNSUBSCRIBE;
	    async WATCH(key) {
	        const reply = await this._self.sendCommand((0, generic_transformers_1.pushVariadicArguments)(['WATCH'], key));
	        this._self.#watchEpoch ??= this._self.socketEpoch;
	        return reply;
	    }
	    watch = this.WATCH;
	    async UNWATCH() {
	        const reply = await this._self.sendCommand(['UNWATCH']);
	        this._self.#watchEpoch = undefined;
	        return reply;
	    }
	    unwatch = this.UNWATCH;
	    getPubSubListeners(type) {
	        return this._self.#queue.getPubSubListeners(type);
	    }
	    extendPubSubChannelListeners(type, channel, listeners) {
	        return this._self.#pubSubCommand(this._self.#queue.extendPubSubChannelListeners(type, channel, listeners));
	    }
	    extendPubSubListeners(type, listeners) {
	        return this._self.#pubSubCommand(this._self.#queue.extendPubSubListeners(type, listeners));
	    }
	    #write() {
	        this.#socket.write(this.#queue.commandsToWrite());
	    }
	    #scheduledWrite;
	    #scheduleWrite() {
	        if (!this.#socket.isReady || this.#scheduledWrite)
	            return;
	        this.#scheduledWrite = setImmediate(() => {
	            this.#write();
	            this.#scheduledWrite = undefined;
	        });
	    }
	    #maybeScheduleWrite() {
	        if (!this.#queue.isWaitingToWrite())
	            return;
	        this.#scheduleWrite();
	    }
	    /**
	     * @internal
	     */
	    async _executePipeline(commands, selectedDB) {
	        if (!this._self.#socket.isOpen) {
	            return Promise.reject(new errors_1.ClientClosedError());
	        }
	        const chainId = Symbol('Pipeline Chain'), promise = Promise.all(commands.map(({ args }) => this._self.#queue.addCommand(args, {
	            chainId,
	            typeMapping: this._commandOptions?.typeMapping
	        })));
	        this._self.#scheduleWrite();
	        const result = await promise;
	        if (selectedDB !== undefined) {
	            this._self.#selectedDB = selectedDB;
	        }
	        return result;
	    }
	    /**
	     * @internal
	     */
	    async _executeMulti(commands, selectedDB) {
	        const dirtyWatch = this._self.#dirtyWatch;
	        this._self.#dirtyWatch = undefined;
	        const watchEpoch = this._self.#watchEpoch;
	        this._self.#watchEpoch = undefined;
	        if (!this._self.#socket.isOpen) {
	            throw new errors_1.ClientClosedError();
	        }
	        if (dirtyWatch) {
	            throw new errors_1.WatchError(dirtyWatch);
	        }
	        if (watchEpoch && watchEpoch !== this._self.socketEpoch) {
	            throw new errors_1.WatchError('Client reconnected after WATCH');
	        }
	        const typeMapping = this._commandOptions?.typeMapping;
	        const chainId = Symbol('MULTI Chain');
	        const promises = [
	            this._self.#queue.addCommand(['MULTI'], { chainId }),
	        ];
	        for (const { args } of commands) {
	            promises.push(this._self.#queue.addCommand(args, {
	                chainId,
	                typeMapping
	            }));
	        }
	        promises.push(this._self.#queue.addCommand(['EXEC'], { chainId }));
	        this._self.#scheduleWrite();
	        const results = await Promise.all(promises), execResult = results[results.length - 1];
	        if (execResult === null) {
	            throw new errors_1.WatchError();
	        }
	        if (selectedDB !== undefined) {
	            this._self.#selectedDB = selectedDB;
	        }
	        return execResult;
	    }
	    MULTI() {
	        return new this.Multi(this._executeMulti.bind(this), this._executePipeline.bind(this), this._commandOptions?.typeMapping);
	    }
	    multi = this.MULTI;
	    async *scanIterator(options) {
	        let cursor = options?.cursor ?? '0';
	        do {
	            const reply = await this.scan(cursor, options);
	            cursor = reply.cursor;
	            yield reply.keys;
	        } while (cursor !== '0');
	    }
	    async *hScanIterator(key, options) {
	        let cursor = options?.cursor ?? '0';
	        do {
	            const reply = await this.hScan(key, cursor, options);
	            cursor = reply.cursor;
	            yield reply.entries;
	        } while (cursor !== '0');
	    }
	    async *hScanValuesIterator(key, options) {
	        let cursor = options?.cursor ?? '0';
	        do {
	            const reply = await this.hScanNoValues(key, cursor, options);
	            cursor = reply.cursor;
	            yield reply.fields;
	        } while (cursor !== '0');
	    }
	    async *hScanNoValuesIterator(key, options) {
	        let cursor = options?.cursor ?? '0';
	        do {
	            const reply = await this.hScanNoValues(key, cursor, options);
	            cursor = reply.cursor;
	            yield reply.fields;
	        } while (cursor !== '0');
	    }
	    async *sScanIterator(key, options) {
	        let cursor = options?.cursor ?? '0';
	        do {
	            const reply = await this.sScan(key, cursor, options);
	            cursor = reply.cursor;
	            yield reply.members;
	        } while (cursor !== '0');
	    }
	    async *zScanIterator(key, options) {
	        let cursor = options?.cursor ?? '0';
	        do {
	            const reply = await this.zScan(key, cursor, options);
	            cursor = reply.cursor;
	            yield reply.members;
	        } while (cursor !== '0');
	    }
	    async MONITOR(callback) {
	        const promise = this._self.#queue.monitor(callback, {
	            typeMapping: this._commandOptions?.typeMapping
	        });
	        this._self.#scheduleWrite();
	        await promise;
	        this._self.#monitorCallback = callback;
	    }
	    monitor = this.MONITOR;
	    /**
	     * Reset the client to its default state (i.e. stop PubSub, stop monitoring, select default DB, etc.)
	     */
	    async reset() {
	        const chainId = Symbol('Reset Chain'), promises = [this._self.#queue.reset(chainId)], selectedDB = this._self.#options?.database ?? 0;
	        this._self.#credentialsSubscription?.dispose();
	        this._self.#credentialsSubscription = null;
	        promises.push(...(await this._self.#handshake(chainId, false)));
	        this._self.#scheduleWrite();
	        await Promise.all(promises);
	        this._self.#selectedDB = selectedDB;
	        this._self.#monitorCallback = undefined;
	        this._self.#dirtyWatch = undefined;
	        this._self.#watchEpoch = undefined;
	    }
	    /**
	     * If the client has state, reset it.
	     * An internal function to be used by wrapper class such as `RedisClientPool`.
	     * @internal
	     */
	    resetIfDirty() {
	        let shouldReset = false;
	        if (this._self.#selectedDB !== (this._self.#options?.database ?? 0)) {
	            console.warn('Returning a client with a different selected DB');
	            shouldReset = true;
	        }
	        if (this._self.#monitorCallback) {
	            console.warn('Returning a client with active MONITOR');
	            shouldReset = true;
	        }
	        if (this._self.#queue.isPubSubActive) {
	            console.warn('Returning a client with active PubSub');
	            shouldReset = true;
	        }
	        if (this._self.#dirtyWatch || this._self.#watchEpoch) {
	            console.warn('Returning a client with active WATCH');
	            shouldReset = true;
	        }
	        if (shouldReset) {
	            return this.reset();
	        }
	    }
	    /**
	     * @deprecated use .close instead
	     */
	    QUIT() {
	        this._self.#credentialsSubscription?.dispose();
	        this._self.#credentialsSubscription = null;
	        return this._self.#socket.quit(async () => {
	            clearTimeout(this._self.#pingTimer);
	            const quitPromise = this._self.#queue.addCommand(['QUIT']);
	            this._self.#scheduleWrite();
	            return quitPromise;
	        });
	    }
	    quit = this.QUIT;
	    /**
	     * @deprecated use .destroy instead
	     */
	    disconnect() {
	        return Promise.resolve(this.destroy());
	    }
	    /**
	     * Close the client. Wait for pending commands.
	     */
	    close() {
	        return new Promise(resolve => {
	            clearTimeout(this._self.#pingTimer);
	            this._self.#socket.close();
	            this._self.#clientSideCache?.onClose();
	            if (this._self.#queue.isEmpty()) {
	                this._self.#socket.destroySocket();
	                return resolve();
	            }
	            const maybeClose = () => {
	                if (!this._self.#queue.isEmpty())
	                    return;
	                this._self.#socket.off('data', maybeClose);
	                this._self.#socket.destroySocket();
	                resolve();
	            };
	            this._self.#socket.on('data', maybeClose);
	            this._self.#credentialsSubscription?.dispose();
	            this._self.#credentialsSubscription = null;
	        });
	    }
	    /**
	     * Destroy the client. Rejects all commands immediately.
	     */
	    destroy() {
	        clearTimeout(this._self.#pingTimer);
	        this._self.#queue.flushAll(new errors_1.DisconnectsClientError());
	        this._self.#socket.destroy();
	        this._self.#clientSideCache?.onClose();
	        this._self.#credentialsSubscription?.dispose();
	        this._self.#credentialsSubscription = null;
	    }
	    ref() {
	        this._self.#socket.ref();
	    }
	    unref() {
	        this._self.#socket.unref();
	    }
	}
	_a = RedisClient;
	client.default = RedisClient;
	
	return client;
}

var cluster = {};

var clusterSlots = {};

var lib$4 = {exports: {}};

/*
 * Copyright 2001-2010 Georges Menie (www.menie.org)
 * Copyright 2010 Salvatore Sanfilippo (adapted to Redis coding style)
 * Copyright 2015 Zihua Li (http://zihua.li) (ported to JavaScript)
 * Copyright 2016 Mike Diarmid (http://github.com/salakar) (re-write for performance, ~700% perf inc)
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the University of California, Berkeley nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE REGENTS AND CONTRIBUTORS ``AS IS'' AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE REGENTS AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

var hasRequiredLib$4;

function requireLib$4 () {
	if (hasRequiredLib$4) return lib$4.exports;
	hasRequiredLib$4 = 1;
	/* CRC16 implementation according to CCITT standards.
	 *
	 * Note by @antirez: this is actually the XMODEM CRC 16 algorithm, using the
	 * following parameters:
	 *
	 * Name                       : "XMODEM", also known as "ZMODEM", "CRC-16/ACORN"
	 * Width                      : 16 bit
	 * Poly                       : 1021 (That is actually x^16 + x^12 + x^5 + 1)
	 * Initialization             : 0000
	 * Reflect Input byte         : False
	 * Reflect Output CRC         : False
	 * Xor constant to output CRC : 0000
	 * Output for "123456789"     : 31C3
	 */

	var lookup = [
	  0x0000, 0x1021, 0x2042, 0x3063, 0x4084, 0x50a5, 0x60c6, 0x70e7,
	  0x8108, 0x9129, 0xa14a, 0xb16b, 0xc18c, 0xd1ad, 0xe1ce, 0xf1ef,
	  0x1231, 0x0210, 0x3273, 0x2252, 0x52b5, 0x4294, 0x72f7, 0x62d6,
	  0x9339, 0x8318, 0xb37b, 0xa35a, 0xd3bd, 0xc39c, 0xf3ff, 0xe3de,
	  0x2462, 0x3443, 0x0420, 0x1401, 0x64e6, 0x74c7, 0x44a4, 0x5485,
	  0xa56a, 0xb54b, 0x8528, 0x9509, 0xe5ee, 0xf5cf, 0xc5ac, 0xd58d,
	  0x3653, 0x2672, 0x1611, 0x0630, 0x76d7, 0x66f6, 0x5695, 0x46b4,
	  0xb75b, 0xa77a, 0x9719, 0x8738, 0xf7df, 0xe7fe, 0xd79d, 0xc7bc,
	  0x48c4, 0x58e5, 0x6886, 0x78a7, 0x0840, 0x1861, 0x2802, 0x3823,
	  0xc9cc, 0xd9ed, 0xe98e, 0xf9af, 0x8948, 0x9969, 0xa90a, 0xb92b,
	  0x5af5, 0x4ad4, 0x7ab7, 0x6a96, 0x1a71, 0x0a50, 0x3a33, 0x2a12,
	  0xdbfd, 0xcbdc, 0xfbbf, 0xeb9e, 0x9b79, 0x8b58, 0xbb3b, 0xab1a,
	  0x6ca6, 0x7c87, 0x4ce4, 0x5cc5, 0x2c22, 0x3c03, 0x0c60, 0x1c41,
	  0xedae, 0xfd8f, 0xcdec, 0xddcd, 0xad2a, 0xbd0b, 0x8d68, 0x9d49,
	  0x7e97, 0x6eb6, 0x5ed5, 0x4ef4, 0x3e13, 0x2e32, 0x1e51, 0x0e70,
	  0xff9f, 0xefbe, 0xdfdd, 0xcffc, 0xbf1b, 0xaf3a, 0x9f59, 0x8f78,
	  0x9188, 0x81a9, 0xb1ca, 0xa1eb, 0xd10c, 0xc12d, 0xf14e, 0xe16f,
	  0x1080, 0x00a1, 0x30c2, 0x20e3, 0x5004, 0x4025, 0x7046, 0x6067,
	  0x83b9, 0x9398, 0xa3fb, 0xb3da, 0xc33d, 0xd31c, 0xe37f, 0xf35e,
	  0x02b1, 0x1290, 0x22f3, 0x32d2, 0x4235, 0x5214, 0x6277, 0x7256,
	  0xb5ea, 0xa5cb, 0x95a8, 0x8589, 0xf56e, 0xe54f, 0xd52c, 0xc50d,
	  0x34e2, 0x24c3, 0x14a0, 0x0481, 0x7466, 0x6447, 0x5424, 0x4405,
	  0xa7db, 0xb7fa, 0x8799, 0x97b8, 0xe75f, 0xf77e, 0xc71d, 0xd73c,
	  0x26d3, 0x36f2, 0x0691, 0x16b0, 0x6657, 0x7676, 0x4615, 0x5634,
	  0xd94c, 0xc96d, 0xf90e, 0xe92f, 0x99c8, 0x89e9, 0xb98a, 0xa9ab,
	  0x5844, 0x4865, 0x7806, 0x6827, 0x18c0, 0x08e1, 0x3882, 0x28a3,
	  0xcb7d, 0xdb5c, 0xeb3f, 0xfb1e, 0x8bf9, 0x9bd8, 0xabbb, 0xbb9a,
	  0x4a75, 0x5a54, 0x6a37, 0x7a16, 0x0af1, 0x1ad0, 0x2ab3, 0x3a92,
	  0xfd2e, 0xed0f, 0xdd6c, 0xcd4d, 0xbdaa, 0xad8b, 0x9de8, 0x8dc9,
	  0x7c26, 0x6c07, 0x5c64, 0x4c45, 0x3ca2, 0x2c83, 0x1ce0, 0x0cc1,
	  0xef1f, 0xff3e, 0xcf5d, 0xdf7c, 0xaf9b, 0xbfba, 0x8fd9, 0x9ff8,
	  0x6e17, 0x7e36, 0x4e55, 0x5e74, 0x2e93, 0x3eb2, 0x0ed1, 0x1ef0
	];

	/**
	 * Convert a string to a UTF8 array - faster than via buffer
	 * @param str
	 * @returns {Array}
	 */
	var toUTF8Array = function toUTF8Array(str) {
	  var char;
	  var i = 0;
	  var p = 0;
	  var utf8 = [];
	  var len = str.length;

	  for (; i < len; i++) {
	    char = str.charCodeAt(i);
	    if (char < 128) {
	      utf8[p++] = char;
	    } else if (char < 2048) {
	      utf8[p++] = (char >> 6) | 192;
	      utf8[p++] = (char & 63) | 128;
	    } else if (
	        ((char & 0xFC00) === 0xD800) && (i + 1) < str.length &&
	        ((str.charCodeAt(i + 1) & 0xFC00) === 0xDC00)) {
	      char = 0x10000 + ((char & 0x03FF) << 10) + (str.charCodeAt(++i) & 0x03FF);
	      utf8[p++] = (char >> 18) | 240;
	      utf8[p++] = ((char >> 12) & 63) | 128;
	      utf8[p++] = ((char >> 6) & 63) | 128;
	      utf8[p++] = (char & 63) | 128;
	    } else {
	      utf8[p++] = (char >> 12) | 224;
	      utf8[p++] = ((char >> 6) & 63) | 128;
	      utf8[p++] = (char & 63) | 128;
	    }
	  }

	  return utf8;
	};

	/**
	 * Convert a string into a redis slot hash.
	 * @param str
	 * @returns {number}
	 */
	var generate = lib$4.exports = function generate(str) {
	  var char;
	  var i = 0;
	  var start = -1;
	  var result = 0;
	  var resultHash = 0;
	  var utf8 = typeof str === 'string' ? toUTF8Array(str) : str;
	  var len = utf8.length;

	  while (i < len) {
	    char = utf8[i++];
	    if (start === -1) {
	      if (char === 0x7B) {
	        start = i;
	      }
	    } else if (char !== 0x7D) {
	      resultHash = lookup[(char ^ (resultHash >> 8)) & 0xFF] ^ (resultHash << 8);
	    } else if (i - 1 !== start) {
	      return resultHash & 0x3FFF;
	    }

	    result = lookup[(char ^ (result >> 8)) & 0xFF] ^ (result << 8);
	  }

	  return result & 0x3FFF;
	};

	/**
	 * Convert an array of multiple strings into a redis slot hash.
	 * Returns -1 if one of the keys is not for the same slot as the others
	 * @param keys
	 * @returns {number}
	 */
	lib$4.exports.generateMulti = function generateMulti(keys) {
	  var i = 1;
	  var len = keys.length;
	  var base = generate(keys[0]);

	  while (i < len) {
	    if (generate(keys[i++]) !== base) return -1;
	  }

	  return base;
	};
	return lib$4.exports;
}

var hasRequiredClusterSlots;

function requireClusterSlots () {
	if (hasRequiredClusterSlots) return clusterSlots;
	hasRequiredClusterSlots = 1;
	var __importDefault = (clusterSlots && clusterSlots.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	var _a;
	Object.defineProperty(clusterSlots, "__esModule", { value: true });
	const errors_1 = requireErrors();
	const client_1 = __importDefault(requireClient());
	const pub_sub_1 = requirePubSub();
	const cluster_key_slot_1 = __importDefault(requireLib$4());
	const cache_1 = requireCache();
	class RedisClusterSlots {
	    static #SLOTS = 16384;
	    #options;
	    #clientFactory;
	    #emit;
	    slots = new Array(_a.#SLOTS);
	    masters = new Array();
	    replicas = new Array();
	    nodeByAddress = new Map();
	    pubSubNode;
	    clientSideCache;
	    #isOpen = false;
	    get isOpen() {
	        return this.#isOpen;
	    }
	    #validateOptions(options) {
	        if (options?.clientSideCache && options?.RESP !== 3) {
	            throw new Error('Client Side Caching is only supported with RESP3');
	        }
	    }
	    constructor(options, emit) {
	        this.#validateOptions(options);
	        this.#options = options;
	        if (options?.clientSideCache) {
	            if (options.clientSideCache instanceof cache_1.PooledClientSideCacheProvider) {
	                this.clientSideCache = options.clientSideCache;
	            }
	            else {
	                this.clientSideCache = new cache_1.BasicPooledClientSideCache(options.clientSideCache);
	            }
	        }
	        this.#clientFactory = client_1.default.factory(this.#options);
	        this.#emit = emit;
	    }
	    async connect() {
	        if (this.#isOpen) {
	            throw new Error('Cluster already open');
	        }
	        this.#isOpen = true;
	        try {
	            await this.#discoverWithRootNodes();
	        }
	        catch (err) {
	            this.#isOpen = false;
	            throw err;
	        }
	    }
	    async #discoverWithRootNodes() {
	        let start = Math.floor(Math.random() * this.#options.rootNodes.length);
	        for (let i = start; i < this.#options.rootNodes.length; i++) {
	            if (!this.#isOpen)
	                throw new Error('Cluster closed');
	            if (await this.#discover(this.#options.rootNodes[i]))
	                return;
	        }
	        for (let i = 0; i < start; i++) {
	            if (!this.#isOpen)
	                throw new Error('Cluster closed');
	            if (await this.#discover(this.#options.rootNodes[i]))
	                return;
	        }
	        throw new errors_1.RootNodesUnavailableError();
	    }
	    #resetSlots() {
	        this.slots = new Array(_a.#SLOTS);
	        this.masters = [];
	        this.replicas = [];
	        this._randomNodeIterator = undefined;
	    }
	    async #discover(rootNode) {
	        this.clientSideCache?.clear();
	        this.clientSideCache?.disable();
	        try {
	            const addressesInUse = new Set(), promises = [], eagerConnect = this.#options.minimizeConnections !== true;
	            const shards = await this.#getShards(rootNode);
	            this.#resetSlots(); // Reset slots AFTER shards have been fetched to prevent a race condition
	            for (const { from, to, master, replicas } of shards) {
	                const shard = {
	                    master: this.#initiateSlotNode(master, false, eagerConnect, addressesInUse, promises)
	                };
	                if (this.#options.useReplicas) {
	                    shard.replicas = replicas.map(replica => this.#initiateSlotNode(replica, true, eagerConnect, addressesInUse, promises));
	                }
	                for (let i = from; i <= to; i++) {
	                    this.slots[i] = shard;
	                }
	            }
	            if (this.pubSubNode && !addressesInUse.has(this.pubSubNode.address)) {
	                const channelsListeners = this.pubSubNode.client.getPubSubListeners(pub_sub_1.PUBSUB_TYPE.CHANNELS), patternsListeners = this.pubSubNode.client.getPubSubListeners(pub_sub_1.PUBSUB_TYPE.PATTERNS);
	                this.pubSubNode.client.destroy();
	                if (channelsListeners.size || patternsListeners.size) {
	                    promises.push(this.#initiatePubSubClient({
	                        [pub_sub_1.PUBSUB_TYPE.CHANNELS]: channelsListeners,
	                        [pub_sub_1.PUBSUB_TYPE.PATTERNS]: patternsListeners
	                    }));
	                }
	            }
	            for (const [address, node] of this.nodeByAddress.entries()) {
	                if (addressesInUse.has(address))
	                    continue;
	                if (node.client) {
	                    node.client.destroy();
	                }
	                const { pubSub } = node;
	                if (pubSub) {
	                    pubSub.client.destroy();
	                }
	                this.nodeByAddress.delete(address);
	            }
	            await Promise.all(promises);
	            this.clientSideCache?.enable();
	            return true;
	        }
	        catch (err) {
	            this.#emit('error', err);
	            return false;
	        }
	    }
	    async #getShards(rootNode) {
	        const options = this.#clientOptionsDefaults(rootNode);
	        options.socket ??= {};
	        options.socket.reconnectStrategy = false;
	        options.RESP = this.#options.RESP;
	        options.commandOptions = undefined;
	        // TODO: find a way to avoid type casting
	        const client = await this.#clientFactory(options)
	            .on('error', err => this.#emit('error', err))
	            .connect();
	        try {
	            // switch to `CLUSTER SHARDS` when Redis 7.0 will be the minimum supported version
	            return await client.clusterSlots();
	        }
	        finally {
	            client.destroy();
	        }
	    }
	    #getNodeAddress(address) {
	        switch (typeof this.#options.nodeAddressMap) {
	            case 'object':
	                return this.#options.nodeAddressMap[address];
	            case 'function':
	                return this.#options.nodeAddressMap(address);
	        }
	    }
	    #clientOptionsDefaults(options) {
	        if (!this.#options.defaults)
	            return options;
	        let socket;
	        if (this.#options.defaults.socket) {
	            socket = {
	                ...this.#options.defaults.socket,
	                ...options?.socket
	            };
	        }
	        else {
	            socket = options?.socket;
	        }
	        return {
	            ...this.#options.defaults,
	            ...options,
	            socket: socket
	        };
	    }
	    #initiateSlotNode(shard, readonly, eagerConnent, addressesInUse, promises) {
	        const address = `${shard.host}:${shard.port}`;
	        let node = this.nodeByAddress.get(address);
	        if (!node) {
	            node = {
	                ...shard,
	                address,
	                readonly,
	                client: undefined,
	                connectPromise: undefined
	            };
	            if (eagerConnent) {
	                promises.push(this.#createNodeClient(node));
	            }
	            this.nodeByAddress.set(address, node);
	        }
	        if (!addressesInUse.has(address)) {
	            addressesInUse.add(address);
	            (readonly ? this.replicas : this.masters).push(node);
	        }
	        return node;
	    }
	    #createClient(node, readonly = node.readonly) {
	        return this.#clientFactory(this.#clientOptionsDefaults({
	            clientSideCache: this.clientSideCache,
	            RESP: this.#options.RESP,
	            socket: this.#getNodeAddress(node.address) ?? {
	                host: node.host,
	                port: node.port
	            },
	            readonly
	        })).on('error', err => console.error(err));
	    }
	    #createNodeClient(node, readonly) {
	        const client = node.client = this.#createClient(node, readonly);
	        return node.connectPromise = client.connect()
	            .finally(() => node.connectPromise = undefined);
	    }
	    nodeClient(node) {
	        return (node.connectPromise ?? // if the node is connecting
	            node.client ?? // if the node is connected
	            this.#createNodeClient(node) // if the not is disconnected
	        );
	    }
	    #runningRediscoverPromise;
	    async rediscover(startWith) {
	        this.#runningRediscoverPromise ??= this.#rediscover(startWith)
	            .finally(() => this.#runningRediscoverPromise = undefined);
	        return this.#runningRediscoverPromise;
	    }
	    async #rediscover(startWith) {
	        if (await this.#discover(startWith.options))
	            return;
	        return this.#discoverWithRootNodes();
	    }
	    /**
	     * @deprecated Use `close` instead.
	     */
	    quit() {
	        return this.#destroy(client => client.quit());
	    }
	    /**
	     * @deprecated Use `destroy` instead.
	     */
	    disconnect() {
	        return this.#destroy(client => client.disconnect());
	    }
	    close() {
	        return this.#destroy(client => client.close());
	    }
	    destroy() {
	        this.#isOpen = false;
	        for (const client of this.#clients()) {
	            client.destroy();
	        }
	        if (this.pubSubNode) {
	            this.pubSubNode.client.destroy();
	            this.pubSubNode = undefined;
	        }
	        this.#resetSlots();
	        this.nodeByAddress.clear();
	    }
	    *#clients() {
	        for (const master of this.masters) {
	            if (master.client) {
	                yield master.client;
	            }
	            if (master.pubSub) {
	                yield master.pubSub.client;
	            }
	        }
	        for (const replica of this.replicas) {
	            if (replica.client) {
	                yield replica.client;
	            }
	        }
	    }
	    async #destroy(fn) {
	        this.#isOpen = false;
	        const promises = [];
	        for (const client of this.#clients()) {
	            promises.push(fn(client));
	        }
	        if (this.pubSubNode) {
	            promises.push(fn(this.pubSubNode.client));
	            this.pubSubNode = undefined;
	        }
	        this.#resetSlots();
	        this.nodeByAddress.clear();
	        await Promise.allSettled(promises);
	    }
	    getClient(firstKey, isReadonly) {
	        if (!firstKey) {
	            return this.nodeClient(this.getRandomNode());
	        }
	        const slotNumber = (0, cluster_key_slot_1.default)(firstKey);
	        if (!isReadonly) {
	            return this.nodeClient(this.slots[slotNumber].master);
	        }
	        return this.nodeClient(this.getSlotRandomNode(slotNumber));
	    }
	    *#iterateAllNodes() {
	        let i = Math.floor(Math.random() * (this.masters.length + this.replicas.length));
	        if (i < this.masters.length) {
	            do {
	                yield this.masters[i];
	            } while (++i < this.masters.length);
	            for (const replica of this.replicas) {
	                yield replica;
	            }
	        }
	        else {
	            i -= this.masters.length;
	            do {
	                yield this.replicas[i];
	            } while (++i < this.replicas.length);
	        }
	        while (true) {
	            for (const master of this.masters) {
	                yield master;
	            }
	            for (const replica of this.replicas) {
	                yield replica;
	            }
	        }
	    }
	    _randomNodeIterator;
	    getRandomNode() {
	        this._randomNodeIterator ??= this.#iterateAllNodes();
	        return this._randomNodeIterator.next().value;
	    }
	    *#slotNodesIterator(slot) {
	        let i = Math.floor(Math.random() * (1 + slot.replicas.length));
	        if (i < slot.replicas.length) {
	            do {
	                yield slot.replicas[i];
	            } while (++i < slot.replicas.length);
	        }
	        while (true) {
	            yield slot.master;
	            for (const replica of slot.replicas) {
	                yield replica;
	            }
	        }
	    }
	    getSlotRandomNode(slotNumber) {
	        const slot = this.slots[slotNumber];
	        if (!slot.replicas?.length) {
	            return slot.master;
	        }
	        slot.nodesIterator ??= this.#slotNodesIterator(slot);
	        return slot.nodesIterator.next().value;
	    }
	    getMasterByAddress(address) {
	        const master = this.nodeByAddress.get(address);
	        if (!master)
	            return;
	        return this.nodeClient(master);
	    }
	    getPubSubClient() {
	        if (!this.pubSubNode)
	            return this.#initiatePubSubClient();
	        return this.pubSubNode.connectPromise ?? this.pubSubNode.client;
	    }
	    async #initiatePubSubClient(toResubscribe) {
	        const index = Math.floor(Math.random() * (this.masters.length + this.replicas.length)), node = index < this.masters.length ?
	            this.masters[index] :
	            this.replicas[index - this.masters.length], client = this.#createClient(node, false);
	        this.pubSubNode = {
	            address: node.address,
	            client,
	            connectPromise: client.connect()
	                .then(async (client) => {
	                if (toResubscribe) {
	                    await Promise.all([
	                        client.extendPubSubListeners(pub_sub_1.PUBSUB_TYPE.CHANNELS, toResubscribe[pub_sub_1.PUBSUB_TYPE.CHANNELS]),
	                        client.extendPubSubListeners(pub_sub_1.PUBSUB_TYPE.PATTERNS, toResubscribe[pub_sub_1.PUBSUB_TYPE.PATTERNS])
	                    ]);
	                }
	                this.pubSubNode.connectPromise = undefined;
	                return client;
	            })
	                .catch(err => {
	                this.pubSubNode = undefined;
	                throw err;
	            })
	        };
	        return this.pubSubNode.connectPromise;
	    }
	    async executeUnsubscribeCommand(unsubscribe) {
	        const client = await this.getPubSubClient();
	        await unsubscribe(client);
	        if (!client.isPubSubActive) {
	            client.destroy();
	            this.pubSubNode = undefined;
	        }
	    }
	    getShardedPubSubClient(channel) {
	        const { master } = this.slots[(0, cluster_key_slot_1.default)(channel)];
	        if (!master.pubSub)
	            return this.#initiateShardedPubSubClient(master);
	        return master.pubSub.connectPromise ?? master.pubSub.client;
	    }
	    async #initiateShardedPubSubClient(master) {
	        const client = this.#createClient(master, false)
	            .on('server-sunsubscribe', async (channel, listeners) => {
	            try {
	                await this.rediscover(client);
	                const redirectTo = await this.getShardedPubSubClient(channel);
	                await redirectTo.extendPubSubChannelListeners(pub_sub_1.PUBSUB_TYPE.SHARDED, channel, listeners);
	            }
	            catch (err) {
	                this.#emit('sharded-shannel-moved-error', err, channel, listeners);
	            }
	        });
	        master.pubSub = {
	            client,
	            connectPromise: client.connect()
	                .then(client => {
	                master.pubSub.connectPromise = undefined;
	                return client;
	            })
	                .catch(err => {
	                master.pubSub = undefined;
	                throw err;
	            })
	        };
	        return master.pubSub.connectPromise;
	    }
	    async executeShardedUnsubscribeCommand(channel, unsubscribe) {
	        const { master } = this.slots[(0, cluster_key_slot_1.default)(channel)];
	        if (!master.pubSub)
	            return;
	        const client = master.pubSub.connectPromise ?
	            await master.pubSub.connectPromise :
	            master.pubSub.client;
	        await unsubscribe(client);
	        if (!client.isPubSubActive) {
	            client.destroy();
	            master.pubSub = undefined;
	        }
	    }
	}
	_a = RedisClusterSlots;
	clusterSlots.default = RedisClusterSlots;
	
	return clusterSlots;
}

var multiCommand = {};

var hasRequiredMultiCommand;

function requireMultiCommand () {
	if (hasRequiredMultiCommand) return multiCommand;
	hasRequiredMultiCommand = 1;
	var __importDefault = (multiCommand && multiCommand.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(multiCommand, "__esModule", { value: true });
	const commands_1 = __importDefault(requireCommands$5());
	const multi_command_1 = __importDefault(requireMultiCommand$2());
	const commander_1 = requireCommander();
	const parser_1 = requireParser();
	class RedisClusterMultiCommand {
	    static #createCommand(command, resp) {
	        const transformReply = (0, commander_1.getTransformReply)(command, resp);
	        return function (...args) {
	            const parser = new parser_1.BasicCommandParser();
	            command.parseCommand(parser, ...args);
	            const redisArgs = parser.redisArgs;
	            redisArgs.preserve = parser.preserve;
	            const firstKey = parser.firstKey;
	            return this.addCommand(firstKey, command.IS_READ_ONLY, redisArgs, transformReply);
	        };
	    }
	    static #createModuleCommand(command, resp) {
	        const transformReply = (0, commander_1.getTransformReply)(command, resp);
	        return function (...args) {
	            const parser = new parser_1.BasicCommandParser();
	            command.parseCommand(parser, ...args);
	            const redisArgs = parser.redisArgs;
	            redisArgs.preserve = parser.preserve;
	            const firstKey = parser.firstKey;
	            return this._self.addCommand(firstKey, command.IS_READ_ONLY, redisArgs, transformReply);
	        };
	    }
	    static #createFunctionCommand(name, fn, resp) {
	        const prefix = (0, commander_1.functionArgumentsPrefix)(name, fn);
	        const transformReply = (0, commander_1.getTransformReply)(fn, resp);
	        return function (...args) {
	            const parser = new parser_1.BasicCommandParser();
	            parser.push(...prefix);
	            fn.parseCommand(parser, ...args);
	            const redisArgs = parser.redisArgs;
	            redisArgs.preserve = parser.preserve;
	            const firstKey = parser.firstKey;
	            return this._self.addCommand(firstKey, fn.IS_READ_ONLY, redisArgs, transformReply);
	        };
	    }
	    static #createScriptCommand(script, resp) {
	        const transformReply = (0, commander_1.getTransformReply)(script, resp);
	        return function (...args) {
	            const parser = new parser_1.BasicCommandParser();
	            script.parseCommand(parser, ...args);
	            const scriptArgs = parser.redisArgs;
	            scriptArgs.preserve = parser.preserve;
	            const firstKey = parser.firstKey;
	            return this.#addScript(firstKey, script.IS_READ_ONLY, script, scriptArgs, transformReply);
	        };
	    }
	    static extend(config) {
	        return (0, commander_1.attachConfig)({
	            BaseClass: RedisClusterMultiCommand,
	            commands: commands_1.default,
	            createCommand: RedisClusterMultiCommand.#createCommand,
	            createModuleCommand: RedisClusterMultiCommand.#createModuleCommand,
	            createFunctionCommand: RedisClusterMultiCommand.#createFunctionCommand,
	            createScriptCommand: RedisClusterMultiCommand.#createScriptCommand,
	            config
	        });
	    }
	    #multi;
	    #executeMulti;
	    #executePipeline;
	    #firstKey;
	    #isReadonly = true;
	    constructor(executeMulti, executePipeline, routing, typeMapping) {
	        this.#multi = new multi_command_1.default(typeMapping);
	        this.#executeMulti = executeMulti;
	        this.#executePipeline = executePipeline;
	        this.#firstKey = routing;
	    }
	    #setState(firstKey, isReadonly) {
	        this.#firstKey ??= firstKey;
	        this.#isReadonly &&= isReadonly;
	    }
	    addCommand(firstKey, isReadonly, args, transformReply) {
	        this.#setState(firstKey, isReadonly);
	        this.#multi.addCommand(args, transformReply);
	        return this;
	    }
	    #addScript(firstKey, isReadonly, script, args, transformReply) {
	        this.#setState(firstKey, isReadonly);
	        this.#multi.addScript(script, args, transformReply);
	        return this;
	    }
	    async exec(execAsPipeline = false) {
	        if (execAsPipeline)
	            return this.execAsPipeline();
	        return this.#multi.transformReplies(await this.#executeMulti(this.#firstKey, this.#isReadonly, this.#multi.queue));
	    }
	    EXEC = this.exec;
	    execTyped(execAsPipeline = false) {
	        return this.exec(execAsPipeline);
	    }
	    async execAsPipeline() {
	        if (this.#multi.queue.length === 0)
	            return [];
	        return this.#multi.transformReplies(await this.#executePipeline(this.#firstKey, this.#isReadonly, this.#multi.queue));
	    }
	    execAsPipelineTyped() {
	        return this.execAsPipeline();
	    }
	}
	multiCommand.default = RedisClusterMultiCommand;
	
	return multiCommand;
}

var hasRequiredCluster;

function requireCluster () {
	if (hasRequiredCluster) return cluster;
	hasRequiredCluster = 1;
	var __importDefault = (cluster && cluster.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(cluster, "__esModule", { value: true });
	const commands_1 = __importDefault(requireCommands$5());
	const node_events_1 = require$$0$1;
	const commander_1 = requireCommander();
	const cluster_slots_1 = __importDefault(requireClusterSlots());
	const multi_command_1 = __importDefault(requireMultiCommand());
	const errors_1 = requireErrors();
	const parser_1 = requireParser();
	const ASKING_1 = requireASKING();
	const single_entry_cache_1 = __importDefault(requireSingleEntryCache());
	class RedisCluster extends node_events_1.EventEmitter {
	    static #createCommand(command, resp) {
	        const transformReply = (0, commander_1.getTransformReply)(command, resp);
	        return async function (...args) {
	            const parser = new parser_1.BasicCommandParser();
	            command.parseCommand(parser, ...args);
	            return this._self._execute(parser.firstKey, command.IS_READ_ONLY, this._commandOptions, (client, opts) => client._executeCommand(command, parser, opts, transformReply));
	        };
	    }
	    static #createModuleCommand(command, resp) {
	        const transformReply = (0, commander_1.getTransformReply)(command, resp);
	        return async function (...args) {
	            const parser = new parser_1.BasicCommandParser();
	            command.parseCommand(parser, ...args);
	            return this._self._execute(parser.firstKey, command.IS_READ_ONLY, this._self._commandOptions, (client, opts) => client._executeCommand(command, parser, opts, transformReply));
	        };
	    }
	    static #createFunctionCommand(name, fn, resp) {
	        const prefix = (0, commander_1.functionArgumentsPrefix)(name, fn);
	        const transformReply = (0, commander_1.getTransformReply)(fn, resp);
	        return async function (...args) {
	            const parser = new parser_1.BasicCommandParser();
	            parser.push(...prefix);
	            fn.parseCommand(parser, ...args);
	            return this._self._execute(parser.firstKey, fn.IS_READ_ONLY, this._self._commandOptions, (client, opts) => client._executeCommand(fn, parser, opts, transformReply));
	        };
	    }
	    static #createScriptCommand(script, resp) {
	        const prefix = (0, commander_1.scriptArgumentsPrefix)(script);
	        const transformReply = (0, commander_1.getTransformReply)(script, resp);
	        return async function (...args) {
	            const parser = new parser_1.BasicCommandParser();
	            parser.push(...prefix);
	            script.parseCommand(parser, ...args);
	            return this._self._execute(parser.firstKey, script.IS_READ_ONLY, this._commandOptions, (client, opts) => client._executeScript(script, parser, opts, transformReply));
	        };
	    }
	    static #SingleEntryCache = new single_entry_cache_1.default();
	    static factory(config) {
	        let Cluster = RedisCluster.#SingleEntryCache.get(config);
	        if (!Cluster) {
	            Cluster = (0, commander_1.attachConfig)({
	                BaseClass: RedisCluster,
	                commands: commands_1.default,
	                createCommand: RedisCluster.#createCommand,
	                createModuleCommand: RedisCluster.#createModuleCommand,
	                createFunctionCommand: RedisCluster.#createFunctionCommand,
	                createScriptCommand: RedisCluster.#createScriptCommand,
	                config
	            });
	            Cluster.prototype.Multi = multi_command_1.default.extend(config);
	            RedisCluster.#SingleEntryCache.set(config, Cluster);
	        }
	        return (options) => {
	            // returning a "proxy" to prevent the namespaces._self to leak between "proxies"
	            return Object.create(new Cluster(options));
	        };
	    }
	    static create(options) {
	        return RedisCluster.factory(options)(options);
	    }
	    _options;
	    _slots;
	    _self = this;
	    _commandOptions;
	    /**
	     * An array of the cluster slots, each slot contain its `master` and `replicas`.
	     * Use with {@link RedisCluster.prototype.nodeClient} to get the client for a specific node (master or replica).
	     */
	    get slots() {
	        return this._self._slots.slots;
	    }
	    get clientSideCache() {
	        return this._self._slots.clientSideCache;
	    }
	    /**
	     * An array of the cluster masters.
	     * Use with {@link RedisCluster.prototype.nodeClient} to get the client for a specific master node.
	     */
	    get masters() {
	        return this._self._slots.masters;
	    }
	    /**
	     * An array of the cluster replicas.
	     * Use with {@link RedisCluster.prototype.nodeClient} to get the client for a specific replica node.
	     */
	    get replicas() {
	        return this._self._slots.replicas;
	    }
	    /**
	     * A map form a node address (`<host>:<port>`) to its shard, each shard contain its `master` and `replicas`.
	     * Use with {@link RedisCluster.prototype.nodeClient} to get the client for a specific node (master or replica).
	     */
	    get nodeByAddress() {
	        return this._self._slots.nodeByAddress;
	    }
	    /**
	     * The current pub/sub node.
	     */
	    get pubSubNode() {
	        return this._self._slots.pubSubNode;
	    }
	    get isOpen() {
	        return this._self._slots.isOpen;
	    }
	    constructor(options) {
	        super();
	        this._options = options;
	        this._slots = new cluster_slots_1.default(options, this.emit.bind(this));
	        if (options?.commandOptions) {
	            this._commandOptions = options.commandOptions;
	        }
	    }
	    duplicate(overrides) {
	        return new (Object.getPrototypeOf(this).constructor)({
	            ...this._self._options,
	            commandOptions: this._commandOptions,
	            ...overrides
	        });
	    }
	    async connect() {
	        await this._self._slots.connect();
	        return this;
	    }
	    withCommandOptions(options) {
	        const proxy = Object.create(this);
	        proxy._commandOptions = options;
	        return proxy;
	    }
	    _commandOptionsProxy(key, value) {
	        const proxy = Object.create(this);
	        proxy._commandOptions = Object.create(this._commandOptions ?? null);
	        proxy._commandOptions[key] = value;
	        return proxy;
	    }
	    /**
	     * Override the `typeMapping` command option
	     */
	    withTypeMapping(typeMapping) {
	        return this._commandOptionsProxy('typeMapping', typeMapping);
	    }
	    // /**
	    //  * Override the `policies` command option
	    //  * TODO
	    //  */
	    // withPolicies<POLICIES extends CommandPolicies> (policies: POLICIES) {
	    //   return this._commandOptionsProxy('policies', policies);
	    // }
	    _handleAsk(fn) {
	        return async (client, options) => {
	            const chainId = Symbol("asking chain");
	            const opts = options ? { ...options } : {};
	            opts.chainId = chainId;
	            const ret = await Promise.all([
	                client.sendCommand([ASKING_1.ASKING_CMD], { chainId: chainId }),
	                fn(client, opts)
	            ]);
	            return ret[1];
	        };
	    }
	    async _execute(firstKey, isReadonly, options, fn) {
	        const maxCommandRedirections = this._options.maxCommandRedirections ?? 16;
	        let client = await this._slots.getClient(firstKey, isReadonly);
	        let i = 0;
	        let myFn = fn;
	        while (true) {
	            try {
	                return await myFn(client, options);
	            }
	            catch (err) {
	                myFn = fn;
	                // TODO: error class
	                if (++i > maxCommandRedirections || !(err instanceof Error)) {
	                    throw err;
	                }
	                if (err.message.startsWith('ASK')) {
	                    const address = err.message.substring(err.message.lastIndexOf(' ') + 1);
	                    let redirectTo = await this._slots.getMasterByAddress(address);
	                    if (!redirectTo) {
	                        await this._slots.rediscover(client);
	                        redirectTo = await this._slots.getMasterByAddress(address);
	                    }
	                    if (!redirectTo) {
	                        throw new Error(`Cannot find node ${address}`);
	                    }
	                    client = redirectTo;
	                    myFn = this._handleAsk(fn);
	                    continue;
	                }
	                if (err.message.startsWith('MOVED')) {
	                    await this._slots.rediscover(client);
	                    client = await this._slots.getClient(firstKey, isReadonly);
	                    continue;
	                }
	                throw err;
	            }
	        }
	    }
	    async sendCommand(firstKey, isReadonly, args, options) {
	        // Merge global options with local options
	        const opts = {
	            ...this._self._commandOptions,
	            ...options
	        };
	        return this._self._execute(firstKey, isReadonly, opts, (client, opts) => client.sendCommand(args, opts));
	    }
	    MULTI(routing) {
	        return new this.Multi(async (firstKey, isReadonly, commands) => {
	            const client = await this._self._slots.getClient(firstKey, isReadonly);
	            return client._executeMulti(commands);
	        }, async (firstKey, isReadonly, commands) => {
	            const client = await this._self._slots.getClient(firstKey, isReadonly);
	            return client._executePipeline(commands);
	        }, routing, this._commandOptions?.typeMapping);
	    }
	    multi = this.MULTI;
	    async SUBSCRIBE(channels, listener, bufferMode) {
	        return (await this._self._slots.getPubSubClient())
	            .SUBSCRIBE(channels, listener, bufferMode);
	    }
	    subscribe = this.SUBSCRIBE;
	    async UNSUBSCRIBE(channels, listener, bufferMode) {
	        return this._self._slots.executeUnsubscribeCommand(client => client.UNSUBSCRIBE(channels, listener, bufferMode));
	    }
	    unsubscribe = this.UNSUBSCRIBE;
	    async PSUBSCRIBE(patterns, listener, bufferMode) {
	        return (await this._self._slots.getPubSubClient())
	            .PSUBSCRIBE(patterns, listener, bufferMode);
	    }
	    pSubscribe = this.PSUBSCRIBE;
	    async PUNSUBSCRIBE(patterns, listener, bufferMode) {
	        return this._self._slots.executeUnsubscribeCommand(client => client.PUNSUBSCRIBE(patterns, listener, bufferMode));
	    }
	    pUnsubscribe = this.PUNSUBSCRIBE;
	    async SSUBSCRIBE(channels, listener, bufferMode) {
	        const maxCommandRedirections = this._self._options.maxCommandRedirections ?? 16, firstChannel = Array.isArray(channels) ? channels[0] : channels;
	        let client = await this._self._slots.getShardedPubSubClient(firstChannel);
	        for (let i = 0;; i++) {
	            try {
	                return await client.SSUBSCRIBE(channels, listener, bufferMode);
	            }
	            catch (err) {
	                if (++i > maxCommandRedirections || !(err instanceof errors_1.ErrorReply)) {
	                    throw err;
	                }
	                if (err.message.startsWith('MOVED')) {
	                    await this._self._slots.rediscover(client);
	                    client = await this._self._slots.getShardedPubSubClient(firstChannel);
	                    continue;
	                }
	                throw err;
	            }
	        }
	    }
	    sSubscribe = this.SSUBSCRIBE;
	    SUNSUBSCRIBE(channels, listener, bufferMode) {
	        return this._self._slots.executeShardedUnsubscribeCommand(Array.isArray(channels) ? channels[0] : channels, client => client.SUNSUBSCRIBE(channels, listener, bufferMode));
	    }
	    sUnsubscribe = this.SUNSUBSCRIBE;
	    /**
	     * @deprecated Use `close` instead.
	     */
	    quit() {
	        return this._self._slots.quit();
	    }
	    /**
	     * @deprecated Use `destroy` instead.
	     */
	    disconnect() {
	        return this._self._slots.disconnect();
	    }
	    close() {
	        this._self._slots.clientSideCache?.onPoolClose();
	        return this._self._slots.close();
	    }
	    destroy() {
	        this._self._slots.clientSideCache?.onPoolClose();
	        return this._self._slots.destroy();
	    }
	    nodeClient(node) {
	        return this._self._slots.nodeClient(node);
	    }
	    /**
	     * Returns a random node from the cluster.
	     * Userful for running "forward" commands (like PUBLISH) on a random node.
	     */
	    getRandomNode() {
	        return this._self._slots.getRandomNode();
	    }
	    /**
	     * Get a random node from a slot.
	     * Useful for running readonly commands on a slot.
	     */
	    getSlotRandomNode(slot) {
	        return this._self._slots.getSlotRandomNode(slot);
	    }
	    /**
	     * @deprecated use `.masters` instead
	     * TODO
	     */
	    getMasters() {
	        return this.masters;
	    }
	    /**
	     * @deprecated use `.slots[<SLOT>]` instead
	     * TODO
	     */
	    getSlotMaster(slot) {
	        return this.slots[slot].master;
	    }
	}
	cluster.default = RedisCluster;
	
	return cluster;
}

var sentinel = {};

var utils = {};

var hasRequiredUtils;

function requireUtils () {
	if (hasRequiredUtils) return utils;
	hasRequiredUtils = 1;
	Object.defineProperty(utils, "__esModule", { value: true });
	utils.createScriptCommand = utils.createModuleCommand = utils.createFunctionCommand = utils.createCommand = utils.clientSocketToNode = utils.createNodeList = utils.parseNode = void 0;
	const parser_1 = requireParser();
	const commander_1 = requireCommander();
	/* TODO: should use map interface, would need a transform reply probably? as resp2 is list form, which this depends on */
	function parseNode(node) {
	    if (node.flags.includes("s_down") || node.flags.includes("disconnected") || node.flags.includes("failover_in_progress")) {
	        return undefined;
	    }
	    return { host: node.ip, port: Number(node.port) };
	}
	utils.parseNode = parseNode;
	function createNodeList(nodes) {
	    var nodeList = [];
	    for (const nodeData of nodes) {
	        const node = parseNode(nodeData);
	        if (node === undefined) {
	            continue;
	        }
	        nodeList.push(node);
	    }
	    return nodeList;
	}
	utils.createNodeList = createNodeList;
	function clientSocketToNode(socket) {
	    const s = socket;
	    return {
	        host: s.host,
	        port: s.port
	    };
	}
	utils.clientSocketToNode = clientSocketToNode;
	function createCommand(command, resp) {
	    const transformReply = (0, commander_1.getTransformReply)(command, resp);
	    return async function (...args) {
	        const parser = new parser_1.BasicCommandParser();
	        command.parseCommand(parser, ...args);
	        return this._self._execute(command.IS_READ_ONLY, client => client._executeCommand(command, parser, this.commandOptions, transformReply));
	    };
	}
	utils.createCommand = createCommand;
	function createFunctionCommand(name, fn, resp) {
	    const prefix = (0, commander_1.functionArgumentsPrefix)(name, fn);
	    const transformReply = (0, commander_1.getTransformReply)(fn, resp);
	    return async function (...args) {
	        const parser = new parser_1.BasicCommandParser();
	        parser.push(...prefix);
	        fn.parseCommand(parser, ...args);
	        return this._self._execute(fn.IS_READ_ONLY, client => client._executeCommand(fn, parser, this._self.commandOptions, transformReply));
	    };
	}
	utils.createFunctionCommand = createFunctionCommand;
	function createModuleCommand(command, resp) {
	    const transformReply = (0, commander_1.getTransformReply)(command, resp);
	    return async function (...args) {
	        const parser = new parser_1.BasicCommandParser();
	        command.parseCommand(parser, ...args);
	        return this._self._execute(command.IS_READ_ONLY, client => client._executeCommand(command, parser, this._self.commandOptions, transformReply));
	    };
	}
	utils.createModuleCommand = createModuleCommand;
	function createScriptCommand(script, resp) {
	    const prefix = (0, commander_1.scriptArgumentsPrefix)(script);
	    const transformReply = (0, commander_1.getTransformReply)(script, resp);
	    return async function (...args) {
	        const parser = new parser_1.BasicCommandParser();
	        parser.push(...prefix);
	        script.parseCommand(parser, ...args);
	        return this._self._execute(script.IS_READ_ONLY, client => client._executeScript(script, parser, this.commandOptions, transformReply));
	    };
	}
	utils.createScriptCommand = createScriptCommand;
	
	return utils;
}

var multiCommands = {};

var hasRequiredMultiCommands;

function requireMultiCommands () {
	if (hasRequiredMultiCommands) return multiCommands;
	hasRequiredMultiCommands = 1;
	var __importDefault = (multiCommands && multiCommands.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(multiCommands, "__esModule", { value: true });
	const commands_1 = __importDefault(requireCommands$5());
	const multi_command_1 = __importDefault(requireMultiCommand$2());
	const commander_1 = requireCommander();
	const parser_1 = requireParser();
	class RedisSentinelMultiCommand {
	    static _createCommand(command, resp) {
	        const transformReply = (0, commander_1.getTransformReply)(command, resp);
	        return function (...args) {
	            const parser = new parser_1.BasicCommandParser();
	            command.parseCommand(parser, ...args);
	            const redisArgs = parser.redisArgs;
	            redisArgs.preserve = parser.preserve;
	            return this.addCommand(command.IS_READ_ONLY, redisArgs, transformReply);
	        };
	    }
	    static _createModuleCommand(command, resp) {
	        const transformReply = (0, commander_1.getTransformReply)(command, resp);
	        return function (...args) {
	            const parser = new parser_1.BasicCommandParser();
	            command.parseCommand(parser, ...args);
	            const redisArgs = parser.redisArgs;
	            redisArgs.preserve = parser.preserve;
	            return this._self.addCommand(command.IS_READ_ONLY, redisArgs, transformReply);
	        };
	    }
	    static _createFunctionCommand(name, fn, resp) {
	        const prefix = (0, commander_1.functionArgumentsPrefix)(name, fn);
	        const transformReply = (0, commander_1.getTransformReply)(fn, resp);
	        return function (...args) {
	            const parser = new parser_1.BasicCommandParser();
	            parser.push(...prefix);
	            fn.parseCommand(parser, ...args);
	            const redisArgs = parser.redisArgs;
	            redisArgs.preserve = parser.preserve;
	            return this._self.addCommand(fn.IS_READ_ONLY, redisArgs, transformReply);
	        };
	    }
	    static _createScriptCommand(script, resp) {
	        const transformReply = (0, commander_1.getTransformReply)(script, resp);
	        return function (...args) {
	            const parser = new parser_1.BasicCommandParser();
	            script.parseCommand(parser, ...args);
	            const scriptArgs = parser.redisArgs;
	            scriptArgs.preserve = parser.preserve;
	            return this.#addScript(script.IS_READ_ONLY, script, scriptArgs, transformReply);
	        };
	    }
	    static extend(config) {
	        return (0, commander_1.attachConfig)({
	            BaseClass: RedisSentinelMultiCommand,
	            commands: commands_1.default,
	            createCommand: RedisSentinelMultiCommand._createCommand,
	            createModuleCommand: RedisSentinelMultiCommand._createModuleCommand,
	            createFunctionCommand: RedisSentinelMultiCommand._createFunctionCommand,
	            createScriptCommand: RedisSentinelMultiCommand._createScriptCommand,
	            config
	        });
	    }
	    #multi = new multi_command_1.default();
	    #sentinel;
	    #isReadonly = true;
	    constructor(sentinel, typeMapping) {
	        this.#multi = new multi_command_1.default(typeMapping);
	        this.#sentinel = sentinel;
	    }
	    #setState(isReadonly) {
	        this.#isReadonly &&= isReadonly;
	    }
	    addCommand(isReadonly, args, transformReply) {
	        this.#setState(isReadonly);
	        this.#multi.addCommand(args, transformReply);
	        return this;
	    }
	    #addScript(isReadonly, script, args, transformReply) {
	        this.#setState(isReadonly);
	        this.#multi.addScript(script, args, transformReply);
	        return this;
	    }
	    async exec(execAsPipeline = false) {
	        if (execAsPipeline)
	            return this.execAsPipeline();
	        return this.#multi.transformReplies(await this.#sentinel._executeMulti(this.#isReadonly, this.#multi.queue));
	    }
	    EXEC = this.exec;
	    execTyped(execAsPipeline = false) {
	        return this.exec(execAsPipeline);
	    }
	    async execAsPipeline() {
	        if (this.#multi.queue.length === 0)
	            return [];
	        return this.#multi.transformReplies(await this.#sentinel._executePipeline(this.#isReadonly, this.#multi.queue));
	    }
	    execAsPipelineTyped() {
	        return this.execAsPipeline();
	    }
	}
	multiCommands.default = RedisSentinelMultiCommand;
	
	return multiCommands;
}

var pubSubProxy = {};

var hasRequiredPubSubProxy;

function requirePubSubProxy () {
	if (hasRequiredPubSubProxy) return pubSubProxy;
	hasRequiredPubSubProxy = 1;
	var __importDefault = (pubSubProxy && pubSubProxy.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(pubSubProxy, "__esModule", { value: true });
	pubSubProxy.PubSubProxy = void 0;
	const node_events_1 = __importDefault(require$$0$1);
	const pub_sub_1 = requirePubSub();
	const client_1 = __importDefault(requireClient());
	class PubSubProxy extends node_events_1.default {
	    #clientOptions;
	    #onError;
	    #node;
	    #state;
	    #subscriptions;
	    constructor(clientOptions, onError) {
	        super();
	        this.#clientOptions = clientOptions;
	        this.#onError = onError;
	    }
	    #createClient() {
	        if (this.#node === undefined) {
	            throw new Error("pubSubProxy: didn't define node to do pubsub against");
	        }
	        return new client_1.default({
	            ...this.#clientOptions,
	            socket: {
	                ...this.#clientOptions.socket,
	                host: this.#node.host,
	                port: this.#node.port
	            }
	        });
	    }
	    async #initiatePubSubClient(withSubscriptions = false) {
	        const client = this.#createClient()
	            .on('error', this.#onError);
	        const connectPromise = client.connect()
	            .then(async (client) => {
	            if (this.#state?.client !== client) {
	                // if pubsub was deactivated while connecting (`this.#pubSubClient === undefined`)
	                // or if the node changed (`this.#pubSubClient.client !== client`)
	                client.destroy();
	                return this.#state?.connectPromise;
	            }
	            if (withSubscriptions && this.#subscriptions) {
	                await Promise.all([
	                    client.extendPubSubListeners(pub_sub_1.PUBSUB_TYPE.CHANNELS, this.#subscriptions[pub_sub_1.PUBSUB_TYPE.CHANNELS]),
	                    client.extendPubSubListeners(pub_sub_1.PUBSUB_TYPE.PATTERNS, this.#subscriptions[pub_sub_1.PUBSUB_TYPE.PATTERNS])
	                ]);
	            }
	            if (this.#state.client !== client) {
	                // if the node changed (`this.#pubSubClient.client !== client`)
	                client.destroy();
	                return this.#state?.connectPromise;
	            }
	            this.#state.connectPromise = undefined;
	            return client;
	        })
	            .catch(err => {
	            this.#state = undefined;
	            throw err;
	        });
	        this.#state = {
	            client,
	            connectPromise
	        };
	        return connectPromise;
	    }
	    #getPubSubClient() {
	        if (!this.#state)
	            return this.#initiatePubSubClient();
	        return (this.#state.connectPromise ??
	            this.#state.client);
	    }
	    async changeNode(node) {
	        this.#node = node;
	        if (!this.#state)
	            return;
	        // if `connectPromise` is undefined, `this.#subscriptions` is already set
	        // and `this.#state.client` might not have the listeners set yet
	        if (this.#state.connectPromise === undefined) {
	            this.#subscriptions = {
	                [pub_sub_1.PUBSUB_TYPE.CHANNELS]: this.#state.client.getPubSubListeners(pub_sub_1.PUBSUB_TYPE.CHANNELS),
	                [pub_sub_1.PUBSUB_TYPE.PATTERNS]: this.#state.client.getPubSubListeners(pub_sub_1.PUBSUB_TYPE.PATTERNS)
	            };
	            this.#state.client.destroy();
	        }
	        await this.#initiatePubSubClient(true);
	    }
	    #executeCommand(fn) {
	        const client = this.#getPubSubClient();
	        if (client instanceof client_1.default) {
	            return fn(client);
	        }
	        return client.then(client => {
	            // if pubsub was deactivated while connecting
	            if (client === undefined)
	                return;
	            return fn(client);
	        }).catch(err => {
	            if (this.#state?.client.isPubSubActive) {
	                this.#state.client.destroy();
	                this.#state = undefined;
	            }
	            throw err;
	        });
	    }
	    subscribe(channels, listener, bufferMode) {
	        return this.#executeCommand(client => client.SUBSCRIBE(channels, listener, bufferMode));
	    }
	    #unsubscribe(fn) {
	        return this.#executeCommand(async (client) => {
	            const reply = await fn(client);
	            if (!client.isPubSubActive) {
	                client.destroy();
	                this.#state = undefined;
	            }
	            return reply;
	        });
	    }
	    async unsubscribe(channels, listener, bufferMode) {
	        return this.#unsubscribe(client => client.UNSUBSCRIBE(channels, listener, bufferMode));
	    }
	    async pSubscribe(patterns, listener, bufferMode) {
	        return this.#executeCommand(client => client.PSUBSCRIBE(patterns, listener, bufferMode));
	    }
	    async pUnsubscribe(patterns, listener, bufferMode) {
	        return this.#unsubscribe(client => client.PUNSUBSCRIBE(patterns, listener, bufferMode));
	    }
	    destroy() {
	        this.#subscriptions = undefined;
	        if (this.#state === undefined)
	            return;
	        // `connectPromise` already handles the case of `this.#pubSubState = undefined`
	        if (!this.#state.connectPromise) {
	            this.#state.client.destroy();
	        }
	        this.#state = undefined;
	    }
	}
	pubSubProxy.PubSubProxy = PubSubProxy;
	
	return pubSubProxy;
}

var module$1 = {};

var commands$4 = {};

var SENTINEL_MASTER = {};

var hasRequiredSENTINEL_MASTER;

function requireSENTINEL_MASTER () {
	if (hasRequiredSENTINEL_MASTER) return SENTINEL_MASTER;
	hasRequiredSENTINEL_MASTER = 1;
	Object.defineProperty(SENTINEL_MASTER, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	SENTINEL_MASTER.default = {
	    /**
	     * Returns information about the specified master.
	     * @param parser - The Redis command parser.
	     * @param dbname - Name of the master.
	     */
	    parseCommand(parser, dbname) {
	        parser.push('SENTINEL', 'MASTER', dbname);
	    },
	    transformReply: {
	        2: (generic_transformers_1.transformTuplesReply),
	        3: undefined
	    }
	};
	
	return SENTINEL_MASTER;
}

var SENTINEL_MONITOR = {};

var hasRequiredSENTINEL_MONITOR;

function requireSENTINEL_MONITOR () {
	if (hasRequiredSENTINEL_MONITOR) return SENTINEL_MONITOR;
	hasRequiredSENTINEL_MONITOR = 1;
	Object.defineProperty(SENTINEL_MONITOR, "__esModule", { value: true });
	SENTINEL_MONITOR.default = {
	    /**
	     * Instructs a Sentinel to monitor a new master with the specified parameters.
	     * @param parser - The Redis command parser.
	     * @param dbname - Name that identifies the master.
	     * @param host - Host of the master.
	     * @param port - Port of the master.
	     * @param quorum - Number of Sentinels that need to agree to trigger a failover.
	     */
	    parseCommand(parser, dbname, host, port, quorum) {
	        parser.push('SENTINEL', 'MONITOR', dbname, host, port, quorum);
	    },
	    transformReply: undefined
	};
	
	return SENTINEL_MONITOR;
}

var SENTINEL_REPLICAS = {};

var hasRequiredSENTINEL_REPLICAS;

function requireSENTINEL_REPLICAS () {
	if (hasRequiredSENTINEL_REPLICAS) return SENTINEL_REPLICAS;
	hasRequiredSENTINEL_REPLICAS = 1;
	Object.defineProperty(SENTINEL_REPLICAS, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	SENTINEL_REPLICAS.default = {
	    /**
	     * Returns a list of replicas for the specified master.
	     * @param parser - The Redis command parser.
	     * @param dbname - Name of the master.
	     */
	    parseCommand(parser, dbname) {
	        parser.push('SENTINEL', 'REPLICAS', dbname);
	    },
	    transformReply: {
	        2: (reply, preserve, typeMapping) => {
	            const inferred = reply;
	            const initial = [];
	            return inferred.reduce((sentinels, x) => {
	                sentinels.push((0, generic_transformers_1.transformTuplesReply)(x, undefined, typeMapping));
	                return sentinels;
	            }, initial);
	        },
	        3: undefined
	    }
	};
	
	return SENTINEL_REPLICAS;
}

var SENTINEL_SENTINELS = {};

var hasRequiredSENTINEL_SENTINELS;

function requireSENTINEL_SENTINELS () {
	if (hasRequiredSENTINEL_SENTINELS) return SENTINEL_SENTINELS;
	hasRequiredSENTINEL_SENTINELS = 1;
	Object.defineProperty(SENTINEL_SENTINELS, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	SENTINEL_SENTINELS.default = {
	    /**
	     * Returns a list of Sentinel instances for the specified master.
	     * @param parser - The Redis command parser.
	     * @param dbname - Name of the master.
	     */
	    parseCommand(parser, dbname) {
	        parser.push('SENTINEL', 'SENTINELS', dbname);
	    },
	    transformReply: {
	        2: (reply, preserve, typeMapping) => {
	            const inferred = reply;
	            const initial = [];
	            return inferred.reduce((sentinels, x) => {
	                sentinels.push((0, generic_transformers_1.transformTuplesReply)(x, undefined, typeMapping));
	                return sentinels;
	            }, initial);
	        },
	        3: undefined
	    }
	};
	
	return SENTINEL_SENTINELS;
}

var SENTINEL_SET = {};

var hasRequiredSENTINEL_SET;

function requireSENTINEL_SET () {
	if (hasRequiredSENTINEL_SET) return SENTINEL_SET;
	hasRequiredSENTINEL_SET = 1;
	Object.defineProperty(SENTINEL_SET, "__esModule", { value: true });
	SENTINEL_SET.default = {
	    /**
	     * Sets configuration parameters for a specific master.
	     * @param parser - The Redis command parser.
	     * @param dbname - Name of the master.
	     * @param options - Configuration options to set as option-value pairs.
	     */
	    parseCommand(parser, dbname, options) {
	        parser.push('SENTINEL', 'SET', dbname);
	        for (const option of options) {
	            parser.push(option.option, option.value);
	        }
	    },
	    transformReply: undefined
	};
	
	return SENTINEL_SET;
}

var hasRequiredCommands$4;

function requireCommands$4 () {
	if (hasRequiredCommands$4) return commands$4;
	hasRequiredCommands$4 = 1;
	var __importDefault = (commands$4 && commands$4.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(commands$4, "__esModule", { value: true });
	const SENTINEL_MASTER_1 = __importDefault(requireSENTINEL_MASTER());
	const SENTINEL_MONITOR_1 = __importDefault(requireSENTINEL_MONITOR());
	const SENTINEL_REPLICAS_1 = __importDefault(requireSENTINEL_REPLICAS());
	const SENTINEL_SENTINELS_1 = __importDefault(requireSENTINEL_SENTINELS());
	const SENTINEL_SET_1 = __importDefault(requireSENTINEL_SET());
	commands$4.default = {
	    SENTINEL_SENTINELS: SENTINEL_SENTINELS_1.default,
	    sentinelSentinels: SENTINEL_SENTINELS_1.default,
	    SENTINEL_MASTER: SENTINEL_MASTER_1.default,
	    sentinelMaster: SENTINEL_MASTER_1.default,
	    SENTINEL_REPLICAS: SENTINEL_REPLICAS_1.default,
	    sentinelReplicas: SENTINEL_REPLICAS_1.default,
	    SENTINEL_MONITOR: SENTINEL_MONITOR_1.default,
	    sentinelMonitor: SENTINEL_MONITOR_1.default,
	    SENTINEL_SET: SENTINEL_SET_1.default,
	    sentinelSet: SENTINEL_SET_1.default
	};
	
	return commands$4;
}

var hasRequiredModule;

function requireModule () {
	if (hasRequiredModule) return module$1;
	hasRequiredModule = 1;
	var __importDefault = (module$1 && module$1.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(module$1, "__esModule", { value: true });
	const commands_1 = __importDefault(requireCommands$4());
	module$1.default = {
	    sentinel: commands_1.default
	};
	
	return module$1;
}

var waitQueue = {};

var hasRequiredWaitQueue;

function requireWaitQueue () {
	if (hasRequiredWaitQueue) return waitQueue;
	hasRequiredWaitQueue = 1;
	Object.defineProperty(waitQueue, "__esModule", { value: true });
	waitQueue.WaitQueue = void 0;
	const linked_list_1 = requireLinkedList();
	class WaitQueue {
	    #list = new linked_list_1.SinglyLinkedList();
	    #queue = new linked_list_1.SinglyLinkedList();
	    push(value) {
	        const resolve = this.#queue.shift();
	        if (resolve !== undefined) {
	            resolve(value);
	            return;
	        }
	        this.#list.push(value);
	    }
	    shift() {
	        return this.#list.shift();
	    }
	    wait() {
	        return new Promise(resolve => this.#queue.push(resolve));
	    }
	}
	waitQueue.WaitQueue = WaitQueue;
	
	return waitQueue;
}

var hasRequiredSentinel;

function requireSentinel () {
	if (hasRequiredSentinel) return sentinel;
	hasRequiredSentinel = 1;
	var __importDefault = (sentinel && sentinel.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(sentinel, "__esModule", { value: true });
	sentinel.RedisSentinelFactory = sentinel.RedisSentinelClient = void 0;
	const node_events_1 = require$$0$1;
	const client_1 = __importDefault(requireClient());
	const commander_1 = requireCommander();
	const commands_1 = __importDefault(requireCommands$5());
	const utils_1 = requireUtils();
	const multi_commands_1 = __importDefault(requireMultiCommands());
	const pub_sub_proxy_1 = requirePubSubProxy();
	const promises_1 = require$$4;
	const module_1 = __importDefault(requireModule());
	const wait_queue_1 = requireWaitQueue();
	const cache_1 = requireCache();
	class RedisSentinelClient {
	    #clientInfo;
	    #internal;
	    _self;
	    /**
	     * Indicates if the client connection is open
	     *
	     * @returns `true` if the client connection is open, `false` otherwise
	     */
	    get isOpen() {
	        return this._self.#internal.isOpen;
	    }
	    /**
	     * Indicates if the client connection is ready to accept commands
	     *
	     * @returns `true` if the client connection is ready, `false` otherwise
	     */
	    get isReady() {
	        return this._self.#internal.isReady;
	    }
	    /**
	     * Gets the command options configured for this client
	     *
	     * @returns The command options for this client or `undefined` if none were set
	     */
	    get commandOptions() {
	        return this._self.#commandOptions;
	    }
	    #commandOptions;
	    constructor(internal, clientInfo, commandOptions) {
	        this._self = this;
	        this.#internal = internal;
	        this.#clientInfo = clientInfo;
	        this.#commandOptions = commandOptions;
	    }
	    static factory(config) {
	        const SentinelClient = (0, commander_1.attachConfig)({
	            BaseClass: RedisSentinelClient,
	            commands: commands_1.default,
	            createCommand: (utils_1.createCommand),
	            createModuleCommand: (utils_1.createModuleCommand),
	            createFunctionCommand: (utils_1.createFunctionCommand),
	            createScriptCommand: (utils_1.createScriptCommand),
	            config
	        });
	        SentinelClient.prototype.Multi = multi_commands_1.default.extend(config);
	        return (internal, clientInfo, commandOptions) => {
	            // returning a "proxy" to prevent the namespaces._self to leak between "proxies"
	            return Object.create(new SentinelClient(internal, clientInfo, commandOptions));
	        };
	    }
	    static create(options, internal, clientInfo, commandOptions) {
	        return RedisSentinelClient.factory(options)(internal, clientInfo, commandOptions);
	    }
	    withCommandOptions(options) {
	        const proxy = Object.create(this);
	        proxy._commandOptions = options;
	        return proxy;
	    }
	    _commandOptionsProxy(key, value) {
	        const proxy = Object.create(this);
	        proxy._commandOptions = Object.create(this._self.#commandOptions ?? null);
	        proxy._commandOptions[key] = value;
	        return proxy;
	    }
	    /**
	     * Override the `typeMapping` command option
	     */
	    withTypeMapping(typeMapping) {
	        return this._commandOptionsProxy('typeMapping', typeMapping);
	    }
	    async _execute(isReadonly, fn) {
	        if (this._self.#clientInfo === undefined) {
	            throw new Error("Attempted execution on released RedisSentinelClient lease");
	        }
	        return await this._self.#internal.execute(fn, this._self.#clientInfo);
	    }
	    async sendCommand(isReadonly, args, options) {
	        return this._execute(isReadonly, client => client.sendCommand(args, options));
	    }
	    /**
	     * @internal
	     */
	    async _executePipeline(isReadonly, commands) {
	        return this._execute(isReadonly, client => client._executePipeline(commands));
	    }
	    /**f
	      * @internal
	      */
	    async _executeMulti(isReadonly, commands) {
	        return this._execute(isReadonly, client => client._executeMulti(commands));
	    }
	    MULTI() {
	        return new this.Multi(this);
	    }
	    multi = this.MULTI;
	    WATCH(key) {
	        if (this._self.#clientInfo === undefined) {
	            throw new Error("Attempted execution on released RedisSentinelClient lease");
	        }
	        return this._execute(false, client => client.watch(key));
	    }
	    watch = this.WATCH;
	    UNWATCH() {
	        if (this._self.#clientInfo === undefined) {
	            throw new Error('Attempted execution on released RedisSentinelClient lease');
	        }
	        return this._execute(false, client => client.unwatch());
	    }
	    unwatch = this.UNWATCH;
	    /**
	     * Releases the client lease back to the pool
	     *
	     * After calling this method, the client instance should no longer be used as it
	     * will be returned to the client pool and may be given to other operations.
	     *
	     * @returns A promise that resolves when the client is ready to be reused, or undefined
	     *          if the client was immediately ready
	     * @throws Error if the lease has already been released
	     */
	    release() {
	        if (this._self.#clientInfo === undefined) {
	            throw new Error('RedisSentinelClient lease already released');
	        }
	        const result = this._self.#internal.releaseClientLease(this._self.#clientInfo);
	        this._self.#clientInfo = undefined;
	        return result;
	    }
	}
	sentinel.RedisSentinelClient = RedisSentinelClient;
	class RedisSentinel extends node_events_1.EventEmitter {
	    _self;
	    #internal;
	    #options;
	    /**
	     * Indicates if the sentinel connection is open
	     *
	     * @returns `true` if the sentinel connection is open, `false` otherwise
	     */
	    get isOpen() {
	        return this._self.#internal.isOpen;
	    }
	    /**
	     * Indicates if the sentinel connection is ready to accept commands
	     *
	     * @returns `true` if the sentinel connection is ready, `false` otherwise
	     */
	    get isReady() {
	        return this._self.#internal.isReady;
	    }
	    get commandOptions() {
	        return this._self.#commandOptions;
	    }
	    #commandOptions;
	    #trace = () => { };
	    #reservedClientInfo;
	    #masterClientCount = 0;
	    #masterClientInfo;
	    get clientSideCache() {
	        return this._self.#internal.clientSideCache;
	    }
	    constructor(options) {
	        super();
	        this._self = this;
	        this.#options = options;
	        if (options.commandOptions) {
	            this.#commandOptions = options.commandOptions;
	        }
	        this.#internal = new RedisSentinelInternal(options);
	        this.#internal.on('error', err => this.emit('error', err));
	        /* pass through underling events */
	        /* TODO: perhaps make this a struct and one vent, instead of multiple events */
	        this.#internal.on('topology-change', (event) => {
	            if (!this.emit('topology-change', event)) {
	                this._self.#trace(`RedisSentinel: re-emit for topology-change for ${event.type} event returned false`);
	            }
	        });
	    }
	    static factory(config) {
	        const Sentinel = (0, commander_1.attachConfig)({
	            BaseClass: RedisSentinel,
	            commands: commands_1.default,
	            createCommand: (utils_1.createCommand),
	            createModuleCommand: (utils_1.createModuleCommand),
	            createFunctionCommand: (utils_1.createFunctionCommand),
	            createScriptCommand: (utils_1.createScriptCommand),
	            config
	        });
	        Sentinel.prototype.Multi = multi_commands_1.default.extend(config);
	        return (options) => {
	            // returning a "proxy" to prevent the namespaces.self to leak between "proxies"
	            return Object.create(new Sentinel(options));
	        };
	    }
	    static create(options) {
	        return RedisSentinel.factory(options)(options);
	    }
	    withCommandOptions(options) {
	        const proxy = Object.create(this);
	        proxy._commandOptions = options;
	        return proxy;
	    }
	    _commandOptionsProxy(key, value) {
	        const proxy = Object.create(this);
	        // Create new commandOptions object with the inherited properties
	        proxy._self.#commandOptions = {
	            ...(this._self.#commandOptions || {}),
	            [key]: value
	        };
	        return proxy;
	    }
	    /**
	     * Override the `typeMapping` command option
	     */
	    withTypeMapping(typeMapping) {
	        return this._commandOptionsProxy('typeMapping', typeMapping);
	    }
	    async connect() {
	        await this._self.#internal.connect();
	        if (this._self.#options.reserveClient) {
	            this._self.#reservedClientInfo = await this._self.#internal.getClientLease();
	        }
	        return this;
	    }
	    async _execute(isReadonly, fn) {
	        let clientInfo;
	        if (!isReadonly || !this._self.#internal.useReplicas) {
	            if (this._self.#reservedClientInfo) {
	                clientInfo = this._self.#reservedClientInfo;
	            }
	            else {
	                this._self.#masterClientInfo ??= await this._self.#internal.getClientLease();
	                clientInfo = this._self.#masterClientInfo;
	                this._self.#masterClientCount++;
	            }
	        }
	        try {
	            return await this._self.#internal.execute(fn, clientInfo);
	        }
	        finally {
	            if (clientInfo !== undefined &&
	                clientInfo === this._self.#masterClientInfo &&
	                --this._self.#masterClientCount === 0) {
	                const promise = this._self.#internal.releaseClientLease(clientInfo);
	                this._self.#masterClientInfo = undefined;
	                if (promise)
	                    await promise;
	            }
	        }
	    }
	    async use(fn) {
	        const clientInfo = await this._self.#internal.getClientLease();
	        try {
	            return await fn(RedisSentinelClient.create(this._self.#options, this._self.#internal, clientInfo, this._self.#commandOptions));
	        }
	        finally {
	            const promise = this._self.#internal.releaseClientLease(clientInfo);
	            if (promise)
	                await promise;
	        }
	    }
	    async sendCommand(isReadonly, args, options) {
	        return this._execute(isReadonly, client => client.sendCommand(args, options));
	    }
	    /**
	     * @internal
	     */
	    async _executePipeline(isReadonly, commands) {
	        return this._execute(isReadonly, client => client._executePipeline(commands));
	    }
	    /**f
	      * @internal
	      */
	    async _executeMulti(isReadonly, commands) {
	        return this._execute(isReadonly, client => client._executeMulti(commands));
	    }
	    MULTI() {
	        return new this.Multi(this);
	    }
	    multi = this.MULTI;
	    async close() {
	        return this._self.#internal.close();
	    }
	    destroy() {
	        return this._self.#internal.destroy();
	    }
	    async SUBSCRIBE(channels, listener, bufferMode) {
	        return this._self.#internal.subscribe(channels, listener, bufferMode);
	    }
	    subscribe = this.SUBSCRIBE;
	    async UNSUBSCRIBE(channels, listener, bufferMode) {
	        return this._self.#internal.unsubscribe(channels, listener, bufferMode);
	    }
	    unsubscribe = this.UNSUBSCRIBE;
	    async PSUBSCRIBE(patterns, listener, bufferMode) {
	        return this._self.#internal.pSubscribe(patterns, listener, bufferMode);
	    }
	    pSubscribe = this.PSUBSCRIBE;
	    async PUNSUBSCRIBE(patterns, listener, bufferMode) {
	        return this._self.#internal.pUnsubscribe(patterns, listener, bufferMode);
	    }
	    pUnsubscribe = this.PUNSUBSCRIBE;
	    /**
	     * Acquires a master client lease for exclusive operations
	     *
	     * Used when multiple commands need to run on an exclusive client (for example, using `WATCH/MULTI/EXEC`).
	     * The returned client must be released after use with the `release()` method.
	     *
	     * @returns A promise that resolves to a Redis client connected to the master node
	     * @example
	     * ```javascript
	     * const clientLease = await sentinel.acquire();
	     *
	     * try {
	     *   await clientLease.watch('key');
	     *   const resp = await clientLease.multi()
	     *     .get('key')
	     *     .exec();
	     * } finally {
	     *   clientLease.release();
	     * }
	     * ```
	     */
	    async acquire() {
	        const clientInfo = await this._self.#internal.getClientLease();
	        return RedisSentinelClient.create(this._self.#options, this._self.#internal, clientInfo, this._self.#commandOptions);
	    }
	    getSentinelNode() {
	        return this._self.#internal.getSentinelNode();
	    }
	    getMasterNode() {
	        return this._self.#internal.getMasterNode();
	    }
	    getReplicaNodes() {
	        return this._self.#internal.getReplicaNodes();
	    }
	    setTracer(tracer) {
	        if (tracer) {
	            this._self.#trace = (msg) => { tracer.push(msg); };
	        }
	        else {
	            this._self.#trace = () => { };
	        }
	        this._self.#internal.setTracer(tracer);
	    }
	}
	sentinel.default = RedisSentinel;
	class RedisSentinelInternal extends node_events_1.EventEmitter {
	    #isOpen = false;
	    get isOpen() {
	        return this.#isOpen;
	    }
	    #isReady = false;
	    get isReady() {
	        return this.#isReady;
	    }
	    #name;
	    #nodeClientOptions;
	    #sentinelClientOptions;
	    #scanInterval;
	    #passthroughClientErrorEvents;
	    #RESP;
	    #anotherReset = false;
	    #configEpoch = 0;
	    #sentinelRootNodes;
	    #sentinelClient;
	    #masterClients = [];
	    #masterClientQueue;
	    #masterPoolSize;
	    #replicaClients = [];
	    #replicaClientsIdx = 0;
	    #replicaPoolSize;
	    get useReplicas() {
	        return this.#replicaPoolSize > 0;
	    }
	    #connectPromise;
	    #maxCommandRediscovers;
	    #pubSubProxy;
	    #scanTimer;
	    #destroy = false;
	    #trace = () => { };
	    #clientSideCache;
	    get clientSideCache() {
	        return this.#clientSideCache;
	    }
	    #validateOptions(options) {
	        if (options?.clientSideCache && options?.RESP !== 3) {
	            throw new Error('Client Side Caching is only supported with RESP3');
	        }
	    }
	    constructor(options) {
	        super();
	        this.#validateOptions(options);
	        this.#name = options.name;
	        this.#RESP = options.RESP;
	        this.#sentinelRootNodes = Array.from(options.sentinelRootNodes);
	        this.#maxCommandRediscovers = options.maxCommandRediscovers ?? 16;
	        this.#masterPoolSize = options.masterPoolSize ?? 1;
	        this.#replicaPoolSize = options.replicaPoolSize ?? 0;
	        this.#scanInterval = options.scanInterval ?? 0;
	        this.#passthroughClientErrorEvents = options.passthroughClientErrorEvents ?? false;
	        this.#nodeClientOptions = (options.nodeClientOptions ? { ...options.nodeClientOptions } : {});
	        if (this.#nodeClientOptions.url !== undefined) {
	            throw new Error("invalid nodeClientOptions for Sentinel");
	        }
	        if (options.clientSideCache) {
	            if (options.clientSideCache instanceof cache_1.PooledClientSideCacheProvider) {
	                this.#clientSideCache = this.#nodeClientOptions.clientSideCache = options.clientSideCache;
	            }
	            else {
	                const cscConfig = options.clientSideCache;
	                this.#clientSideCache = this.#nodeClientOptions.clientSideCache = new cache_1.BasicPooledClientSideCache(cscConfig);
	                //        this.#clientSideCache = this.#nodeClientOptions.clientSideCache = new PooledNoRedirectClientSideCache(cscConfig);
	            }
	        }
	        this.#sentinelClientOptions = options.sentinelClientOptions ? Object.assign({}, options.sentinelClientOptions) : {};
	        this.#sentinelClientOptions.modules = module_1.default;
	        if (this.#sentinelClientOptions.url !== undefined) {
	            throw new Error("invalid sentinelClientOptions for Sentinel");
	        }
	        this.#masterClientQueue = new wait_queue_1.WaitQueue();
	        for (let i = 0; i < this.#masterPoolSize; i++) {
	            this.#masterClientQueue.push(i);
	        }
	        /* persistent object for life of sentinel object */
	        this.#pubSubProxy = new pub_sub_proxy_1.PubSubProxy(this.#nodeClientOptions, err => this.emit('error', err));
	    }
	    #createClient(node, clientOptions, reconnectStrategy) {
	        return client_1.default.create({
	            //first take the globally set RESP
	            RESP: this.#RESP,
	            //then take the client options, which can in theory overwrite it
	            ...clientOptions,
	            socket: {
	                ...clientOptions.socket,
	                host: node.host,
	                port: node.port,
	                reconnectStrategy
	            }
	        });
	    }
	    /**
	     * Gets a client lease from the master client pool
	     *
	     * @returns A client info object or a promise that resolves to a client info object
	     *          when a client becomes available
	     */
	    getClientLease() {
	        const id = this.#masterClientQueue.shift();
	        if (id !== undefined) {
	            return { id };
	        }
	        return this.#masterClientQueue.wait().then(id => ({ id }));
	    }
	    /**
	     * Releases a client lease back to the pool
	     *
	     * If the client was used for a transaction that might have left it in a dirty state,
	     * it will be reset before being returned to the pool.
	     *
	     * @param clientInfo The client info object representing the client to release
	     * @returns A promise that resolves when the client is ready to be reused, or undefined
	     *          if the client was immediately ready or no longer exists
	     */
	    releaseClientLease(clientInfo) {
	        const client = this.#masterClients[clientInfo.id];
	        // client can be undefined if releasing in middle of a reconfigure
	        if (client !== undefined) {
	            const dirtyPromise = client.resetIfDirty();
	            if (dirtyPromise) {
	                return dirtyPromise
	                    .then(() => this.#masterClientQueue.push(clientInfo.id));
	            }
	        }
	        this.#masterClientQueue.push(clientInfo.id);
	    }
	    async connect() {
	        if (this.#isOpen) {
	            throw new Error("already attempting to open");
	        }
	        try {
	            this.#isOpen = true;
	            this.#connectPromise = this.#connect();
	            await this.#connectPromise;
	            this.#isReady = true;
	        }
	        finally {
	            this.#connectPromise = undefined;
	            if (this.#scanInterval > 0) {
	                this.#scanTimer = setInterval(this.#reset.bind(this), this.#scanInterval);
	            }
	        }
	    }
	    async #connect() {
	        let count = 0;
	        while (true) {
	            this.#trace("starting connect loop");
	            count += 1;
	            if (this.#destroy) {
	                this.#trace("in #connect and want to destroy");
	                return;
	            }
	            try {
	                this.#anotherReset = false;
	                await this.transform(this.analyze(await this.observe()));
	                if (this.#anotherReset) {
	                    this.#trace("#connect: anotherReset is true, so continuing");
	                    continue;
	                }
	                this.#trace("#connect: returning");
	                return;
	            }
	            catch (e) {
	                this.#trace(`#connect: exception ${e.message}`);
	                if (!this.#isReady && count > this.#maxCommandRediscovers) {
	                    throw e;
	                }
	                if (e.message !== 'no valid master node') {
	                    console.log(e);
	                }
	                await (0, promises_1.setTimeout)(1000);
	            }
	            finally {
	                this.#trace("finished connect");
	            }
	        }
	    }
	    async execute(fn, clientInfo) {
	        let iter = 0;
	        while (true) {
	            if (this.#connectPromise !== undefined) {
	                await this.#connectPromise;
	            }
	            const client = this.#getClient(clientInfo);
	            if (!client.isReady) {
	                await this.#reset();
	                continue;
	            }
	            const sockOpts = client.options?.socket;
	            this.#trace("attemping to send command to " + sockOpts?.host + ":" + sockOpts?.port);
	            try {
	                /*
	                        // force testing of READONLY errors
	                        if (clientInfo !== undefined) {
	                          if (Math.floor(Math.random() * 10) < 1) {
	                            console.log("throwing READONLY error");
	                            throw new Error("READONLY You can't write against a read only replica.");
	                          }
	                        }
	                */
	                return await fn(client);
	            }
	            catch (err) {
	                if (++iter > this.#maxCommandRediscovers || !(err instanceof Error)) {
	                    throw err;
	                }
	                /*
	                  rediscover and retry if doing a command against a "master"
	                  a) READONLY error (topology has changed) but we haven't been notified yet via pubsub
	                  b) client is "not ready" (disconnected), which means topology might have changed, but sentinel might not see it yet
	                */
	                if (clientInfo !== undefined && (err.message.startsWith('READONLY') || !client.isReady)) {
	                    await this.#reset();
	                    continue;
	                }
	                throw err;
	            }
	        }
	    }
	    async #createPubSub(client) {
	        /* Whenever sentinels or slaves get added, or when slave configuration changes, reconfigure */
	        await client.pSubscribe(['switch-master', '[-+]sdown', '+slave', '+sentinel', '[-+]odown', '+slave-reconf-done'], (message, channel) => {
	            this.#handlePubSubControlChannel(channel, message);
	        }, true);
	        return client;
	    }
	    async #handlePubSubControlChannel(channel, message) {
	        this.#trace("pubsub control channel message on " + channel);
	        this.#reset();
	    }
	    // if clientInfo is defined, it corresponds to a master client in the #masterClients array, otherwise loop around replicaClients
	    #getClient(clientInfo) {
	        if (clientInfo !== undefined) {
	            return this.#masterClients[clientInfo.id];
	        }
	        if (this.#replicaClientsIdx >= this.#replicaClients.length) {
	            this.#replicaClientsIdx = 0;
	        }
	        if (this.#replicaClients.length == 0) {
	            throw new Error("no replicas available for read");
	        }
	        return this.#replicaClients[this.#replicaClientsIdx++];
	    }
	    async #reset() {
	        /* closing / don't reset */
	        if (this.#isReady == false || this.#destroy == true) {
	            return;
	        }
	        // already in #connect()
	        if (this.#connectPromise !== undefined) {
	            this.#anotherReset = true;
	            return await this.#connectPromise;
	        }
	        try {
	            this.#connectPromise = this.#connect();
	            return await this.#connectPromise;
	        }
	        finally {
	            this.#trace("finished reconfgure");
	            this.#connectPromise = undefined;
	        }
	    }
	    async close() {
	        this.#destroy = true;
	        if (this.#connectPromise != undefined) {
	            await this.#connectPromise;
	        }
	        this.#isReady = false;
	        this.#clientSideCache?.onPoolClose();
	        if (this.#scanTimer) {
	            clearInterval(this.#scanTimer);
	            this.#scanTimer = undefined;
	        }
	        const promises = [];
	        if (this.#sentinelClient !== undefined) {
	            if (this.#sentinelClient.isOpen) {
	                promises.push(this.#sentinelClient.close());
	            }
	            this.#sentinelClient = undefined;
	        }
	        for (const client of this.#masterClients) {
	            if (client.isOpen) {
	                promises.push(client.close());
	            }
	        }
	        this.#masterClients = [];
	        for (const client of this.#replicaClients) {
	            if (client.isOpen) {
	                promises.push(client.close());
	            }
	        }
	        this.#replicaClients = [];
	        await Promise.all(promises);
	        this.#pubSubProxy.destroy();
	        this.#isOpen = false;
	    }
	    // destroy has to be async because its stopping others async events, timers and the like
	    // and shouldn't return until its finished.
	    async destroy() {
	        this.#destroy = true;
	        if (this.#connectPromise != undefined) {
	            await this.#connectPromise;
	        }
	        this.#isReady = false;
	        this.#clientSideCache?.onPoolClose();
	        if (this.#scanTimer) {
	            clearInterval(this.#scanTimer);
	            this.#scanTimer = undefined;
	        }
	        if (this.#sentinelClient !== undefined) {
	            if (this.#sentinelClient.isOpen) {
	                this.#sentinelClient.destroy();
	            }
	            this.#sentinelClient = undefined;
	        }
	        for (const client of this.#masterClients) {
	            if (client.isOpen) {
	                client.destroy();
	            }
	        }
	        this.#masterClients = [];
	        for (const client of this.#replicaClients) {
	            if (client.isOpen) {
	                client.destroy();
	            }
	        }
	        this.#replicaClients = [];
	        this.#pubSubProxy.destroy();
	        this.#isOpen = false;
	        this.#destroy = false;
	    }
	    async subscribe(channels, listener, bufferMode) {
	        return this.#pubSubProxy.subscribe(channels, listener, bufferMode);
	    }
	    async unsubscribe(channels, listener, bufferMode) {
	        return this.#pubSubProxy.unsubscribe(channels, listener, bufferMode);
	    }
	    async pSubscribe(patterns, listener, bufferMode) {
	        return this.#pubSubProxy.pSubscribe(patterns, listener, bufferMode);
	    }
	    async pUnsubscribe(patterns, listener, bufferMode) {
	        return this.#pubSubProxy.pUnsubscribe(patterns, listener, bufferMode);
	    }
	    // observe/analyze/transform remediation functions
	    async observe() {
	        for (const node of this.#sentinelRootNodes) {
	            let client;
	            try {
	                this.#trace(`observe: trying to connect to sentinel: ${node.host}:${node.port}`);
	                client = this.#createClient(node, this.#sentinelClientOptions, false);
	                client.on('error', (err) => this.emit('error', `obseve client error: ${err}`));
	                await client.connect();
	                this.#trace(`observe: connected to sentinel`);
	                const [sentinelData, masterData, replicaData] = await Promise.all([
	                    client.sentinel.sentinelSentinels(this.#name),
	                    client.sentinel.sentinelMaster(this.#name),
	                    client.sentinel.sentinelReplicas(this.#name)
	                ]);
	                this.#trace("observe: got all sentinel data");
	                const ret = {
	                    sentinelConnected: node,
	                    sentinelData: sentinelData,
	                    masterData: masterData,
	                    replicaData: replicaData,
	                    currentMaster: this.getMasterNode(),
	                    currentReplicas: this.getReplicaNodes(),
	                    currentSentinel: this.getSentinelNode(),
	                    replicaPoolSize: this.#replicaPoolSize,
	                    useReplicas: this.useReplicas
	                };
	                return ret;
	            }
	            catch (err) {
	                this.#trace(`observe: error ${err}`);
	                this.emit('error', err);
	            }
	            finally {
	                if (client !== undefined && client.isOpen) {
	                    this.#trace(`observe: destroying sentinel client`);
	                    client.destroy();
	                }
	            }
	        }
	        this.#trace(`observe: none of the sentinels are available`);
	        throw new Error('None of the sentinels are available');
	    }
	    analyze(observed) {
	        let master = (0, utils_1.parseNode)(observed.masterData);
	        if (master === undefined) {
	            this.#trace(`analyze: no valid master node because ${observed.masterData.flags}`);
	            throw new Error("no valid master node");
	        }
	        if (master.host === observed.currentMaster?.host && master.port === observed.currentMaster?.port) {
	            this.#trace(`analyze: master node hasn't changed from ${observed.currentMaster?.host}:${observed.currentMaster?.port}`);
	            master = undefined;
	        }
	        else {
	            this.#trace(`analyze: master node has changed to ${master.host}:${master.port} from ${observed.currentMaster?.host}:${observed.currentMaster?.port}`);
	        }
	        let sentinel = observed.sentinelConnected;
	        if (sentinel.host === observed.currentSentinel?.host && sentinel.port === observed.currentSentinel.port) {
	            this.#trace(`analyze: sentinel node hasn't changed`);
	            sentinel = undefined;
	        }
	        else {
	            this.#trace(`analyze: sentinel node has changed to ${sentinel.host}:${sentinel.port}`);
	        }
	        const replicasToClose = [];
	        const replicasToOpen = new Map();
	        const desiredSet = new Set();
	        const seen = new Set();
	        if (observed.useReplicas) {
	            const replicaList = (0, utils_1.createNodeList)(observed.replicaData);
	            for (const node of replicaList) {
	                desiredSet.add(JSON.stringify(node));
	            }
	            for (const [node, value] of observed.currentReplicas) {
	                if (!desiredSet.has(JSON.stringify(node))) {
	                    replicasToClose.push(node);
	                    this.#trace(`analyze: adding ${node.host}:${node.port} to replicsToClose`);
	                }
	                else {
	                    seen.add(JSON.stringify(node));
	                    if (value != observed.replicaPoolSize) {
	                        replicasToOpen.set(node, observed.replicaPoolSize - value);
	                        this.#trace(`analyze: adding ${node.host}:${node.port} to replicsToOpen`);
	                    }
	                }
	            }
	            for (const node of replicaList) {
	                if (!seen.has(JSON.stringify(node))) {
	                    replicasToOpen.set(node, observed.replicaPoolSize);
	                    this.#trace(`analyze: adding ${node.host}:${node.port} to replicsToOpen`);
	                }
	            }
	        }
	        const ret = {
	            sentinelList: [observed.sentinelConnected].concat((0, utils_1.createNodeList)(observed.sentinelData)),
	            epoch: Number(observed.masterData['config-epoch']),
	            sentinelToOpen: sentinel,
	            masterToOpen: master,
	            replicasToClose: replicasToClose,
	            replicasToOpen: replicasToOpen,
	        };
	        return ret;
	    }
	    async transform(analyzed) {
	        this.#trace("transform: enter");
	        let promises = [];
	        if (analyzed.sentinelToOpen) {
	            this.#trace(`transform: opening a new sentinel`);
	            if (this.#sentinelClient !== undefined && this.#sentinelClient.isOpen) {
	                this.#trace(`transform: destroying old sentinel as open`);
	                this.#sentinelClient.destroy();
	                this.#sentinelClient = undefined;
	            }
	            else {
	                this.#trace(`transform: not destroying old sentinel as not open`);
	            }
	            this.#trace(`transform: creating new sentinel to ${analyzed.sentinelToOpen.host}:${analyzed.sentinelToOpen.port}`);
	            const node = analyzed.sentinelToOpen;
	            const client = this.#createClient(analyzed.sentinelToOpen, this.#sentinelClientOptions, false);
	            client.on('error', (err) => {
	                if (this.#passthroughClientErrorEvents) {
	                    this.emit('error', new Error(`Sentinel Client (${node.host}:${node.port}): ${err.message}`, { cause: err }));
	                }
	                const event = {
	                    type: 'SENTINEL',
	                    node: (0, utils_1.clientSocketToNode)(client.options.socket),
	                    error: err
	                };
	                this.emit('client-error', event);
	                this.#reset();
	            });
	            this.#sentinelClient = client;
	            this.#trace(`transform: adding sentinel client connect() to promise list`);
	            const promise = this.#sentinelClient.connect().then((client) => { return this.#createPubSub(client); });
	            promises.push(promise);
	            this.#trace(`created sentinel client to ${analyzed.sentinelToOpen.host}:${analyzed.sentinelToOpen.port}`);
	            const event = {
	                type: "SENTINEL_CHANGE",
	                node: analyzed.sentinelToOpen
	            };
	            this.#trace(`transform: emiting topology-change event for sentinel_change`);
	            if (!this.emit('topology-change', event)) {
	                this.#trace(`transform: emit for topology-change for sentinel_change returned false`);
	            }
	        }
	        if (analyzed.masterToOpen) {
	            this.#trace(`transform: opening a new master`);
	            const masterPromises = [];
	            const masterWatches = [];
	            this.#trace(`transform: destroying old masters if open`);
	            for (const client of this.#masterClients) {
	                masterWatches.push(client.isWatching || client.isDirtyWatch);
	                if (client.isOpen) {
	                    client.destroy();
	                }
	            }
	            this.#masterClients = [];
	            this.#trace(`transform: creating all master clients and adding connect promises`);
	            for (let i = 0; i < this.#masterPoolSize; i++) {
	                const node = analyzed.masterToOpen;
	                const client = this.#createClient(analyzed.masterToOpen, this.#nodeClientOptions);
	                client.on('error', (err) => {
	                    if (this.#passthroughClientErrorEvents) {
	                        this.emit('error', new Error(`Master Client (${node.host}:${node.port}): ${err.message}`, { cause: err }));
	                    }
	                    const event = {
	                        type: "MASTER",
	                        node: (0, utils_1.clientSocketToNode)(client.options.socket),
	                        error: err
	                    };
	                    this.emit('client-error', event);
	                });
	                if (masterWatches[i]) {
	                    client.setDirtyWatch("sentinel config changed in middle of a WATCH Transaction");
	                }
	                this.#masterClients.push(client);
	                masterPromises.push(client.connect());
	                this.#trace(`created master client to ${analyzed.masterToOpen.host}:${analyzed.masterToOpen.port}`);
	            }
	            this.#trace(`transform: adding promise to change #pubSubProxy node`);
	            masterPromises.push(this.#pubSubProxy.changeNode(analyzed.masterToOpen));
	            promises.push(...masterPromises);
	            const event = {
	                type: "MASTER_CHANGE",
	                node: analyzed.masterToOpen
	            };
	            this.#trace(`transform: emiting topology-change event for master_change`);
	            if (!this.emit('topology-change', event)) {
	                this.#trace(`transform: emit for topology-change for master_change returned false`);
	            }
	            this.#configEpoch++;
	        }
	        const replicaCloseSet = new Set();
	        for (const node of analyzed.replicasToClose) {
	            const str = JSON.stringify(node);
	            replicaCloseSet.add(str);
	        }
	        const newClientList = [];
	        const removedSet = new Set();
	        for (const replica of this.#replicaClients) {
	            const node = (0, utils_1.clientSocketToNode)(replica.options.socket);
	            const str = JSON.stringify(node);
	            if (replicaCloseSet.has(str) || !replica.isOpen) {
	                if (replica.isOpen) {
	                    const sockOpts = replica.options?.socket;
	                    this.#trace(`destroying replica client to ${sockOpts?.host}:${sockOpts?.port}`);
	                    replica.destroy();
	                }
	                if (!removedSet.has(str)) {
	                    const event = {
	                        type: "REPLICA_REMOVE",
	                        node: node
	                    };
	                    this.emit('topology-change', event);
	                    removedSet.add(str);
	                }
	            }
	            else {
	                newClientList.push(replica);
	            }
	        }
	        this.#replicaClients = newClientList;
	        if (analyzed.replicasToOpen.size != 0) {
	            for (const [node, size] of analyzed.replicasToOpen) {
	                for (let i = 0; i < size; i++) {
	                    const client = this.#createClient(node, this.#nodeClientOptions);
	                    client.on('error', (err) => {
	                        if (this.#passthroughClientErrorEvents) {
	                            this.emit('error', new Error(`Replica Client (${node.host}:${node.port}): ${err.message}`, { cause: err }));
	                        }
	                        const event = {
	                            type: "REPLICA",
	                            node: (0, utils_1.clientSocketToNode)(client.options.socket),
	                            error: err
	                        };
	                        this.emit('client-error', event);
	                    });
	                    this.#replicaClients.push(client);
	                    promises.push(client.connect());
	                    this.#trace(`created replica client to ${node.host}:${node.port}`);
	                }
	                const event = {
	                    type: "REPLICA_ADD",
	                    node: node
	                };
	                this.emit('topology-change', event);
	            }
	        }
	        if (analyzed.sentinelList.length != this.#sentinelRootNodes.length) {
	            this.#sentinelRootNodes = analyzed.sentinelList;
	            const event = {
	                type: "SENTINE_LIST_CHANGE",
	                size: analyzed.sentinelList.length
	            };
	            this.emit('topology-change', event);
	        }
	        await Promise.all(promises);
	        this.#trace("transform: exit");
	    }
	    // introspection functions
	    getMasterNode() {
	        if (this.#masterClients.length == 0) {
	            return undefined;
	        }
	        for (const master of this.#masterClients) {
	            if (master.isReady) {
	                return (0, utils_1.clientSocketToNode)(master.options.socket);
	            }
	        }
	        return undefined;
	    }
	    getSentinelNode() {
	        if (this.#sentinelClient === undefined) {
	            return undefined;
	        }
	        return (0, utils_1.clientSocketToNode)(this.#sentinelClient.options.socket);
	    }
	    getReplicaNodes() {
	        const ret = new Map();
	        const initialMap = new Map();
	        for (const replica of this.#replicaClients) {
	            const node = (0, utils_1.clientSocketToNode)(replica.options.socket);
	            const hash = JSON.stringify(node);
	            if (replica.isReady) {
	                initialMap.set(hash, (initialMap.get(hash) ?? 0) + 1);
	            }
	            else {
	                if (!initialMap.has(hash)) {
	                    initialMap.set(hash, 0);
	                }
	            }
	        }
	        for (const [key, value] of initialMap) {
	            ret.set(JSON.parse(key), value);
	        }
	        return ret;
	    }
	    setTracer(tracer) {
	        if (tracer) {
	            this.#trace = (msg) => { tracer.push(msg); };
	        }
	        else {
	            // empty function is faster than testing if something is defined or not
	            this.#trace = () => { };
	        }
	    }
	}
	class RedisSentinelFactory extends node_events_1.EventEmitter {
	    options;
	    #sentinelRootNodes;
	    #replicaIdx = -1;
	    constructor(options) {
	        super();
	        this.options = options;
	        this.#sentinelRootNodes = options.sentinelRootNodes;
	    }
	    async updateSentinelRootNodes() {
	        for (const node of this.#sentinelRootNodes) {
	            const client = client_1.default.create({
	                ...this.options.sentinelClientOptions,
	                socket: {
	                    ...this.options.sentinelClientOptions?.socket,
	                    host: node.host,
	                    port: node.port,
	                    reconnectStrategy: false
	                },
	                modules: module_1.default
	            }).on('error', (err) => this.emit(`updateSentinelRootNodes: ${err}`));
	            try {
	                await client.connect();
	            }
	            catch {
	                if (client.isOpen) {
	                    client.destroy();
	                }
	                continue;
	            }
	            try {
	                const sentinelData = await client.sentinel.sentinelSentinels(this.options.name);
	                this.#sentinelRootNodes = [node].concat((0, utils_1.createNodeList)(sentinelData));
	                return;
	            }
	            finally {
	                client.destroy();
	            }
	        }
	        throw new Error("Couldn't connect to any sentinel node");
	    }
	    async getMasterNode() {
	        let connected = false;
	        for (const node of this.#sentinelRootNodes) {
	            const client = client_1.default.create({
	                ...this.options.sentinelClientOptions,
	                socket: {
	                    ...this.options.sentinelClientOptions?.socket,
	                    host: node.host,
	                    port: node.port,
	                    reconnectStrategy: false
	                },
	                modules: module_1.default
	            }).on('error', err => this.emit(`getMasterNode: ${err}`));
	            try {
	                await client.connect();
	            }
	            catch {
	                if (client.isOpen) {
	                    client.destroy();
	                }
	                continue;
	            }
	            connected = true;
	            try {
	                const masterData = await client.sentinel.sentinelMaster(this.options.name);
	                let master = (0, utils_1.parseNode)(masterData);
	                if (master === undefined) {
	                    continue;
	                }
	                return master;
	            }
	            finally {
	                client.destroy();
	            }
	        }
	        if (connected) {
	            throw new Error("Master Node Not Enumerated");
	        }
	        throw new Error("couldn't connect to any sentinels");
	    }
	    async getMasterClient() {
	        const master = await this.getMasterNode();
	        return client_1.default.create({
	            ...this.options.nodeClientOptions,
	            socket: {
	                ...this.options.nodeClientOptions?.socket,
	                host: master.host,
	                port: master.port
	            }
	        });
	    }
	    async getReplicaNodes() {
	        let connected = false;
	        for (const node of this.#sentinelRootNodes) {
	            const client = client_1.default.create({
	                ...this.options.sentinelClientOptions,
	                socket: {
	                    ...this.options.sentinelClientOptions?.socket,
	                    host: node.host,
	                    port: node.port,
	                    reconnectStrategy: false
	                },
	                modules: module_1.default
	            }).on('error', err => this.emit(`getReplicaNodes: ${err}`));
	            try {
	                await client.connect();
	            }
	            catch {
	                if (client.isOpen) {
	                    client.destroy();
	                }
	                continue;
	            }
	            connected = true;
	            try {
	                const replicaData = await client.sentinel.sentinelReplicas(this.options.name);
	                const replicas = (0, utils_1.createNodeList)(replicaData);
	                if (replicas.length == 0) {
	                    continue;
	                }
	                return replicas;
	            }
	            finally {
	                client.destroy();
	            }
	        }
	        if (connected) {
	            throw new Error("No Replicas Nodes Enumerated");
	        }
	        throw new Error("couldn't connect to any sentinels");
	    }
	    async getReplicaClient() {
	        const replicas = await this.getReplicaNodes();
	        if (replicas.length == 0) {
	            throw new Error("no available replicas");
	        }
	        this.#replicaIdx++;
	        if (this.#replicaIdx >= replicas.length) {
	            this.#replicaIdx = 0;
	        }
	        return client_1.default.create({
	            ...this.options.nodeClientOptions,
	            socket: {
	                ...this.options.nodeClientOptions?.socket,
	                host: replicas[this.#replicaIdx].host,
	                port: replicas[this.#replicaIdx].port
	            }
	        });
	    }
	}
	sentinel.RedisSentinelFactory = RedisSentinelFactory;
	
	return sentinel;
}

var hasRequiredDist$1;

function requireDist$1 () {
	if (hasRequiredDist$1) return dist;
	hasRequiredDist$1 = 1;
	(function (exports) {
		var __createBinding = (dist && dist.__createBinding) || (Object.create ? (function(o, m, k, k2) {
		    if (k2 === undefined) k2 = k;
		    var desc = Object.getOwnPropertyDescriptor(m, k);
		    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
		      desc = { enumerable: true, get: function() { return m[k]; } };
		    }
		    Object.defineProperty(o, k2, desc);
		}) : (function(o, m, k, k2) {
		    if (k2 === undefined) k2 = k;
		    o[k2] = m[k];
		}));
		var __exportStar = (dist && dist.__exportStar) || function(m, exports) {
		    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
		};
		var __importDefault = (dist && dist.__importDefault) || function (mod) {
		    return (mod && mod.__esModule) ? mod : { "default": mod };
		};
		Object.defineProperty(exports, "__esModule", { value: true });
		exports.BasicPooledClientSideCache = exports.BasicClientSideCache = exports.REDIS_FLUSH_MODES = exports.GEO_REPLY_WITH = exports.createSentinel = exports.createCluster = exports.createClientPool = exports.createClient = exports.defineScript = exports.VerbatimString = exports.RESP_TYPES = void 0;
		var decoder_1 = requireDecoder();
		Object.defineProperty(exports, "RESP_TYPES", { enumerable: true, get: function () { return decoder_1.RESP_TYPES; } });
		var verbatim_string_1 = requireVerbatimString();
		Object.defineProperty(exports, "VerbatimString", { enumerable: true, get: function () { return verbatim_string_1.VerbatimString; } });
		var lua_script_1 = requireLuaScript();
		Object.defineProperty(exports, "defineScript", { enumerable: true, get: function () { return lua_script_1.defineScript; } });
		__exportStar(requireErrors(), exports);
		const client_1 = __importDefault(requireClient());
		exports.createClient = client_1.default.create;
		const pool_1 = requirePool();
		exports.createClientPool = pool_1.RedisClientPool.create;
		const cluster_1 = __importDefault(requireCluster());
		exports.createCluster = cluster_1.default.create;
		const sentinel_1 = __importDefault(requireSentinel());
		exports.createSentinel = sentinel_1.default.create;
		var GEOSEARCH_WITH_1 = requireGEOSEARCH_WITH();
		Object.defineProperty(exports, "GEO_REPLY_WITH", { enumerable: true, get: function () { return GEOSEARCH_WITH_1.GEO_REPLY_WITH; } });
		var FLUSHALL_1 = requireFLUSHALL();
		Object.defineProperty(exports, "REDIS_FLUSH_MODES", { enumerable: true, get: function () { return FLUSHALL_1.REDIS_FLUSH_MODES; } });
		var cache_1 = requireCache();
		Object.defineProperty(exports, "BasicClientSideCache", { enumerable: true, get: function () { return cache_1.BasicClientSideCache; } });
		Object.defineProperty(exports, "BasicPooledClientSideCache", { enumerable: true, get: function () { return cache_1.BasicPooledClientSideCache; } });
		
	} (dist));
	return dist;
}

var lib$3 = {};

var commands$3 = {};

var bloom = {};

var ADD$4 = {};

var hasRequiredADD$4;

function requireADD$4 () {
	if (hasRequiredADD$4) return ADD$4;
	hasRequiredADD$4 = 1;
	Object.defineProperty(ADD$4, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	ADD$4.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Adds an item to a Bloom Filter
	     * @param parser - The command parser
	     * @param key - The name of the Bloom filter
	     * @param item - The item to add to the filter
	     */
	    parseCommand(parser, key, item) {
	        parser.push('BF.ADD');
	        parser.pushKey(key);
	        parser.push(item);
	    },
	    transformReply: generic_transformers_1.transformBooleanReply
	};
	
	return ADD$4;
}

var CARD = {};

var hasRequiredCARD;

function requireCARD () {
	if (hasRequiredCARD) return CARD;
	hasRequiredCARD = 1;
	Object.defineProperty(CARD, "__esModule", { value: true });
	CARD.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Returns the cardinality (number of items) in a Bloom Filter
	     * @param parser - The command parser
	     * @param key - The name of the Bloom filter to query
	     */
	    parseCommand(parser, key) {
	        parser.push('BF.CARD');
	        parser.pushKey(key);
	    },
	    transformReply: undefined
	};
	
	return CARD;
}

var EXISTS$1 = {};

var hasRequiredEXISTS$1;

function requireEXISTS$1 () {
	if (hasRequiredEXISTS$1) return EXISTS$1;
	hasRequiredEXISTS$1 = 1;
	Object.defineProperty(EXISTS$1, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	EXISTS$1.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Checks if an item exists in a Bloom Filter
	     * @param parser - The command parser
	     * @param key - The name of the Bloom filter
	     * @param item - The item to check for existence
	     */
	    parseCommand(parser, key, item) {
	        parser.push('BF.EXISTS');
	        parser.pushKey(key);
	        parser.push(item);
	    },
	    transformReply: generic_transformers_1.transformBooleanReply
	};
	
	return EXISTS$1;
}

var INFO$6 = {};

var helpers$1 = {};

var hasRequiredHelpers$1;

function requireHelpers$1 () {
	if (hasRequiredHelpers$1) return helpers$1;
	hasRequiredHelpers$1 = 1;
	Object.defineProperty(helpers$1, "__esModule", { value: true });
	helpers$1.transformInfoV2Reply = void 0;
	const client_1 = requireDist$1();
	function transformInfoV2Reply(reply, typeMapping) {
	    const mapType = typeMapping ? typeMapping[client_1.RESP_TYPES.MAP] : undefined;
	    switch (mapType) {
	        case Array: {
	            return reply;
	        }
	        case Map: {
	            const ret = new Map();
	            for (let i = 0; i < reply.length; i += 2) {
	                ret.set(reply[i].toString(), reply[i + 1]);
	            }
	            return ret;
	        }
	        default: {
	            const ret = Object.create(null);
	            for (let i = 0; i < reply.length; i += 2) {
	                ret[reply[i].toString()] = reply[i + 1];
	            }
	            return ret;
	        }
	    }
	}
	helpers$1.transformInfoV2Reply = transformInfoV2Reply;
	
	return helpers$1;
}

var hasRequiredINFO$6;

function requireINFO$6 () {
	if (hasRequiredINFO$6) return INFO$6;
	hasRequiredINFO$6 = 1;
	Object.defineProperty(INFO$6, "__esModule", { value: true });
	const helpers_1 = requireHelpers$1();
	INFO$6.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Returns information about a Bloom Filter, including capacity, size, number of filters, items inserted, and expansion rate
	     * @param parser - The command parser
	     * @param key - The name of the Bloom filter to get information about
	     */
	    parseCommand(parser, key) {
	        parser.push('BF.INFO');
	        parser.pushKey(key);
	    },
	    transformReply: {
	        2: (reply, _, typeMapping) => {
	            return (0, helpers_1.transformInfoV2Reply)(reply, typeMapping);
	        },
	        3: undefined
	    }
	};
	
	return INFO$6;
}

var INSERT$1 = {};

var hasRequiredINSERT$1;

function requireINSERT$1 () {
	if (hasRequiredINSERT$1) return INSERT$1;
	hasRequiredINSERT$1 = 1;
	Object.defineProperty(INSERT$1, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	INSERT$1.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Adds one or more items to a Bloom Filter, creating it if it does not exist
	     * @param parser - The command parser
	     * @param key - The name of the Bloom filter
	     * @param items - One or more items to add to the filter
	     * @param options - Optional parameters for filter creation
	     * @param options.CAPACITY - Desired capacity for a new filter
	     * @param options.ERROR - Desired error rate for a new filter
	     * @param options.EXPANSION - Expansion rate for a new filter
	     * @param options.NOCREATE - If true, prevents automatic filter creation
	     * @param options.NONSCALING - Prevents the filter from creating additional sub-filters
	     */
	    parseCommand(parser, key, items, options) {
	        parser.push('BF.INSERT');
	        parser.pushKey(key);
	        if (options?.CAPACITY !== undefined) {
	            parser.push('CAPACITY', options.CAPACITY.toString());
	        }
	        if (options?.ERROR !== undefined) {
	            parser.push('ERROR', options.ERROR.toString());
	        }
	        if (options?.EXPANSION !== undefined) {
	            parser.push('EXPANSION', options.EXPANSION.toString());
	        }
	        if (options?.NOCREATE) {
	            parser.push('NOCREATE');
	        }
	        if (options?.NONSCALING) {
	            parser.push('NONSCALING');
	        }
	        parser.push('ITEMS');
	        parser.pushVariadic(items);
	    },
	    transformReply: generic_transformers_1.transformBooleanArrayReply
	};
	
	return INSERT$1;
}

var LOADCHUNK$1 = {};

var hasRequiredLOADCHUNK$1;

function requireLOADCHUNK$1 () {
	if (hasRequiredLOADCHUNK$1) return LOADCHUNK$1;
	hasRequiredLOADCHUNK$1 = 1;
	Object.defineProperty(LOADCHUNK$1, "__esModule", { value: true });
	LOADCHUNK$1.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Restores a Bloom Filter chunk previously saved using SCANDUMP
	     * @param parser - The command parser
	     * @param key - The name of the Bloom filter to restore
	     * @param iterator - Iterator value from the SCANDUMP command
	     * @param chunk - Data chunk from the SCANDUMP command
	     */
	    parseCommand(parser, key, iterator, chunk) {
	        parser.push('BF.LOADCHUNK');
	        parser.pushKey(key);
	        parser.push(iterator.toString(), chunk);
	    },
	    transformReply: undefined
	};
	
	return LOADCHUNK$1;
}

var MADD$1 = {};

var hasRequiredMADD$1;

function requireMADD$1 () {
	if (hasRequiredMADD$1) return MADD$1;
	hasRequiredMADD$1 = 1;
	Object.defineProperty(MADD$1, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	MADD$1.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Adds multiple items to a Bloom Filter in a single call
	     * @param parser - The command parser
	     * @param key - The name of the Bloom filter
	     * @param items - One or more items to add to the filter
	     */
	    parseCommand(parser, key, items) {
	        parser.push('BF.MADD');
	        parser.pushKey(key);
	        parser.pushVariadic(items);
	    },
	    transformReply: generic_transformers_1.transformBooleanArrayReply
	};
	
	return MADD$1;
}

var MEXISTS = {};

var hasRequiredMEXISTS;

function requireMEXISTS () {
	if (hasRequiredMEXISTS) return MEXISTS;
	hasRequiredMEXISTS = 1;
	Object.defineProperty(MEXISTS, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	MEXISTS.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Checks if multiple items exist in a Bloom Filter in a single call
	     * @param parser - The command parser
	     * @param key - The name of the Bloom filter
	     * @param items - One or more items to check for existence
	     */
	    parseCommand(parser, key, items) {
	        parser.push('BF.MEXISTS');
	        parser.pushKey(key);
	        parser.pushVariadic(items);
	    },
	    transformReply: generic_transformers_1.transformBooleanArrayReply
	};
	
	return MEXISTS;
}

var RESERVE$2 = {};

var hasRequiredRESERVE$2;

function requireRESERVE$2 () {
	if (hasRequiredRESERVE$2) return RESERVE$2;
	hasRequiredRESERVE$2 = 1;
	Object.defineProperty(RESERVE$2, "__esModule", { value: true });
	RESERVE$2.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Creates an empty Bloom Filter with a given desired error ratio and initial capacity
	     * @param parser - The command parser
	     * @param key - The name of the Bloom filter to create
	     * @param errorRate - The desired probability for false positives (between 0 and 1)
	     * @param capacity - The number of entries intended to be added to the filter
	     * @param options - Optional parameters to tune the filter
	     * @param options.EXPANSION - Expansion rate for the filter
	     * @param options.NONSCALING - Prevents the filter from creating additional sub-filters
	     */
	    parseCommand(parser, key, errorRate, capacity, options) {
	        parser.push('BF.RESERVE');
	        parser.pushKey(key);
	        parser.push(errorRate.toString(), capacity.toString());
	        if (options?.EXPANSION) {
	            parser.push('EXPANSION', options.EXPANSION.toString());
	        }
	        if (options?.NONSCALING) {
	            parser.push('NONSCALING');
	        }
	    },
	    transformReply: undefined
	};
	
	return RESERVE$2;
}

var SCANDUMP$1 = {};

var hasRequiredSCANDUMP$1;

function requireSCANDUMP$1 () {
	if (hasRequiredSCANDUMP$1) return SCANDUMP$1;
	hasRequiredSCANDUMP$1 = 1;
	Object.defineProperty(SCANDUMP$1, "__esModule", { value: true });
	SCANDUMP$1.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Begins an incremental save of a Bloom Filter. This is useful for large filters that can't be saved at once
	     * @param parser - The command parser
	     * @param key - The name of the Bloom filter to save
	     * @param iterator - Iterator value; Start at 0, and use the iterator from the response for the next chunk
	     */
	    parseCommand(parser, key, iterator) {
	        parser.push('BF.SCANDUMP');
	        parser.pushKey(key);
	        parser.push(iterator.toString());
	    },
	    transformReply(reply) {
	        return {
	            iterator: reply[0],
	            chunk: reply[1]
	        };
	    }
	};
	
	return SCANDUMP$1;
}

var hasRequiredBloom;

function requireBloom () {
	if (hasRequiredBloom) return bloom;
	hasRequiredBloom = 1;
	(function (exports) {
		var __createBinding = (bloom && bloom.__createBinding) || (Object.create ? (function(o, m, k, k2) {
		    if (k2 === undefined) k2 = k;
		    var desc = Object.getOwnPropertyDescriptor(m, k);
		    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
		      desc = { enumerable: true, get: function() { return m[k]; } };
		    }
		    Object.defineProperty(o, k2, desc);
		}) : (function(o, m, k, k2) {
		    if (k2 === undefined) k2 = k;
		    o[k2] = m[k];
		}));
		var __exportStar = (bloom && bloom.__exportStar) || function(m, exports) {
		    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
		};
		var __importDefault = (bloom && bloom.__importDefault) || function (mod) {
		    return (mod && mod.__esModule) ? mod : { "default": mod };
		};
		Object.defineProperty(exports, "__esModule", { value: true });
		const ADD_1 = __importDefault(requireADD$4());
		const CARD_1 = __importDefault(requireCARD());
		const EXISTS_1 = __importDefault(requireEXISTS$1());
		const INFO_1 = __importDefault(requireINFO$6());
		const INSERT_1 = __importDefault(requireINSERT$1());
		const LOADCHUNK_1 = __importDefault(requireLOADCHUNK$1());
		const MADD_1 = __importDefault(requireMADD$1());
		const MEXISTS_1 = __importDefault(requireMEXISTS());
		const RESERVE_1 = __importDefault(requireRESERVE$2());
		const SCANDUMP_1 = __importDefault(requireSCANDUMP$1());
		__exportStar(requireHelpers$1(), exports);
		exports.default = {
		    ADD: ADD_1.default,
		    add: ADD_1.default,
		    CARD: CARD_1.default,
		    card: CARD_1.default,
		    EXISTS: EXISTS_1.default,
		    exists: EXISTS_1.default,
		    INFO: INFO_1.default,
		    info: INFO_1.default,
		    INSERT: INSERT_1.default,
		    insert: INSERT_1.default,
		    LOADCHUNK: LOADCHUNK_1.default,
		    loadChunk: LOADCHUNK_1.default,
		    MADD: MADD_1.default,
		    mAdd: MADD_1.default,
		    MEXISTS: MEXISTS_1.default,
		    mExists: MEXISTS_1.default,
		    RESERVE: RESERVE_1.default,
		    reserve: RESERVE_1.default,
		    SCANDUMP: SCANDUMP_1.default,
		    scanDump: SCANDUMP_1.default
		};
		
	} (bloom));
	return bloom;
}

var countMinSketch = {};

var INCRBY$2 = {};

var hasRequiredINCRBY$2;

function requireINCRBY$2 () {
	if (hasRequiredINCRBY$2) return INCRBY$2;
	hasRequiredINCRBY$2 = 1;
	Object.defineProperty(INCRBY$2, "__esModule", { value: true });
	INCRBY$2.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Increases the count of one or more items in a Count-Min Sketch
	     * @param parser - The command parser
	     * @param key - The name of the sketch
	     * @param items - A single item or array of items to increment, each with an item and increment value
	     */
	    parseCommand(parser, key, items) {
	        parser.push('CMS.INCRBY');
	        parser.pushKey(key);
	        if (Array.isArray(items)) {
	            for (const item of items) {
	                pushIncrByItem(parser, item);
	            }
	        }
	        else {
	            pushIncrByItem(parser, items);
	        }
	    },
	    transformReply: undefined
	};
	function pushIncrByItem(parser, { item, incrementBy }) {
	    parser.push(item, incrementBy.toString());
	}
	
	return INCRBY$2;
}

var INFO$5 = {};

var hasRequiredINFO$5;

function requireINFO$5 () {
	if (hasRequiredINFO$5) return INFO$5;
	hasRequiredINFO$5 = 1;
	Object.defineProperty(INFO$5, "__esModule", { value: true });
	const bloom_1 = requireBloom();
	INFO$5.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Returns width, depth, and total count of items in a Count-Min Sketch
	     * @param parser - The command parser
	     * @param key - The name of the sketch to get information about
	     */
	    parseCommand(parser, key) {
	        parser.push('CMS.INFO');
	        parser.pushKey(key);
	    },
	    transformReply: {
	        2: (reply, _, typeMapping) => {
	            return (0, bloom_1.transformInfoV2Reply)(reply, typeMapping);
	        },
	        3: undefined
	    }
	};
	
	return INFO$5;
}

var INITBYDIM = {};

var hasRequiredINITBYDIM;

function requireINITBYDIM () {
	if (hasRequiredINITBYDIM) return INITBYDIM;
	hasRequiredINITBYDIM = 1;
	Object.defineProperty(INITBYDIM, "__esModule", { value: true });
	INITBYDIM.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Initialize a Count-Min Sketch using width and depth parameters
	     * @param parser - The command parser
	     * @param key - The name of the sketch
	     * @param width - Number of counters in each array (must be a multiple of 2)
	     * @param depth - Number of counter arrays (determines accuracy of estimates)
	     */
	    parseCommand(parser, key, width, depth) {
	        parser.push('CMS.INITBYDIM');
	        parser.pushKey(key);
	        parser.push(width.toString(), depth.toString());
	    },
	    transformReply: undefined
	};
	
	return INITBYDIM;
}

var INITBYPROB = {};

var hasRequiredINITBYPROB;

function requireINITBYPROB () {
	if (hasRequiredINITBYPROB) return INITBYPROB;
	hasRequiredINITBYPROB = 1;
	Object.defineProperty(INITBYPROB, "__esModule", { value: true });
	INITBYPROB.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Initialize a Count-Min Sketch using error rate and probability parameters
	     * @param parser - The command parser
	     * @param key - The name of the sketch
	     * @param error - Estimate error, as a decimal between 0 and 1
	     * @param probability - The desired probability for inflated count, as a decimal between 0 and 1
	     */
	    parseCommand(parser, key, error, probability) {
	        parser.push('CMS.INITBYPROB');
	        parser.pushKey(key);
	        parser.push(error.toString(), probability.toString());
	    },
	    transformReply: undefined
	};
	
	return INITBYPROB;
}

var MERGE$2 = {};

var hasRequiredMERGE$2;

function requireMERGE$2 () {
	if (hasRequiredMERGE$2) return MERGE$2;
	hasRequiredMERGE$2 = 1;
	Object.defineProperty(MERGE$2, "__esModule", { value: true });
	MERGE$2.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Merges multiple Count-Min Sketches into a single sketch, with optional weights
	     * @param parser - The command parser
	     * @param destination - The name of the destination sketch
	     * @param source - Array of sketch names or array of sketches with weights
	     */
	    parseCommand(parser, destination, source) {
	        parser.push('CMS.MERGE');
	        parser.pushKey(destination);
	        parser.push(source.length.toString());
	        if (isPlainSketches(source)) {
	            parser.pushVariadic(source);
	        }
	        else {
	            for (let i = 0; i < source.length; i++) {
	                parser.push(source[i].name);
	            }
	            parser.push('WEIGHTS');
	            for (let i = 0; i < source.length; i++) {
	                parser.push(source[i].weight.toString());
	            }
	        }
	    },
	    transformReply: undefined
	};
	function isPlainSketches(src) {
	    return typeof src[0] === 'string' || src[0] instanceof Buffer;
	}
	
	return MERGE$2;
}

var QUERY$1 = {};

var hasRequiredQUERY$1;

function requireQUERY$1 () {
	if (hasRequiredQUERY$1) return QUERY$1;
	hasRequiredQUERY$1 = 1;
	Object.defineProperty(QUERY$1, "__esModule", { value: true });
	QUERY$1.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Returns the count for one or more items in a Count-Min Sketch
	     * @param parser - The command parser
	     * @param key - The name of the sketch
	     * @param items - One or more items to get counts for
	     */
	    parseCommand(parser, key, items) {
	        parser.push('CMS.QUERY');
	        parser.pushKey(key);
	        parser.pushVariadic(items);
	    },
	    transformReply: undefined
	};
	
	return QUERY$1;
}

var hasRequiredCountMinSketch;

function requireCountMinSketch () {
	if (hasRequiredCountMinSketch) return countMinSketch;
	hasRequiredCountMinSketch = 1;
	var __importDefault = (countMinSketch && countMinSketch.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(countMinSketch, "__esModule", { value: true });
	const INCRBY_1 = __importDefault(requireINCRBY$2());
	const INFO_1 = __importDefault(requireINFO$5());
	const INITBYDIM_1 = __importDefault(requireINITBYDIM());
	const INITBYPROB_1 = __importDefault(requireINITBYPROB());
	const MERGE_1 = __importDefault(requireMERGE$2());
	const QUERY_1 = __importDefault(requireQUERY$1());
	countMinSketch.default = {
	    INCRBY: INCRBY_1.default,
	    incrBy: INCRBY_1.default,
	    INFO: INFO_1.default,
	    info: INFO_1.default,
	    INITBYDIM: INITBYDIM_1.default,
	    initByDim: INITBYDIM_1.default,
	    INITBYPROB: INITBYPROB_1.default,
	    initByProb: INITBYPROB_1.default,
	    MERGE: MERGE_1.default,
	    merge: MERGE_1.default,
	    QUERY: QUERY_1.default,
	    query: QUERY_1.default
	};
	
	return countMinSketch;
}

var cuckoo = {};

var ADD$3 = {};

var hasRequiredADD$3;

function requireADD$3 () {
	if (hasRequiredADD$3) return ADD$3;
	hasRequiredADD$3 = 1;
	Object.defineProperty(ADD$3, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	ADD$3.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Adds an item to a Cuckoo Filter, creating the filter if it does not exist
	     * @param parser - The command parser
	     * @param key - The name of the Cuckoo filter
	     * @param item - The item to add to the filter
	     */
	    parseCommand(parser, key, item) {
	        parser.push('CF.ADD');
	        parser.pushKey(key);
	        parser.push(item);
	    },
	    transformReply: generic_transformers_1.transformBooleanReply
	};
	
	return ADD$3;
}

var ADDNX = {};

var hasRequiredADDNX;

function requireADDNX () {
	if (hasRequiredADDNX) return ADDNX;
	hasRequiredADDNX = 1;
	Object.defineProperty(ADDNX, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	ADDNX.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Adds an item to a Cuckoo Filter only if it does not exist
	     * @param parser - The command parser
	     * @param key - The name of the Cuckoo filter
	     * @param item - The item to add to the filter if it doesn't exist
	     */
	    parseCommand(parser, key, item) {
	        parser.push('CF.ADDNX');
	        parser.pushKey(key);
	        parser.push(item);
	    },
	    transformReply: generic_transformers_1.transformBooleanReply
	};
	
	return ADDNX;
}

var COUNT$1 = {};

var hasRequiredCOUNT$1;

function requireCOUNT$1 () {
	if (hasRequiredCOUNT$1) return COUNT$1;
	hasRequiredCOUNT$1 = 1;
	Object.defineProperty(COUNT$1, "__esModule", { value: true });
	COUNT$1.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Returns the number of times an item appears in a Cuckoo Filter
	     * @param parser - The command parser
	     * @param key - The name of the Cuckoo filter
	     * @param item - The item to count occurrences of
	     */
	    parseCommand(parser, key, item) {
	        parser.push('CF.COUNT');
	        parser.pushKey(key);
	        parser.push(item);
	    },
	    transformReply: undefined
	};
	
	return COUNT$1;
}

var DEL$2 = {};

var hasRequiredDEL$2;

function requireDEL$2 () {
	if (hasRequiredDEL$2) return DEL$2;
	hasRequiredDEL$2 = 1;
	Object.defineProperty(DEL$2, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	DEL$2.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Removes an item from a Cuckoo Filter if it exists
	     * @param parser - The command parser
	     * @param key - The name of the Cuckoo filter
	     * @param item - The item to remove from the filter
	     */
	    parseCommand(parser, key, item) {
	        parser.push('CF.DEL');
	        parser.pushKey(key);
	        parser.push(item);
	    },
	    transformReply: generic_transformers_1.transformBooleanReply
	};
	
	return DEL$2;
}

var EXISTS = {};

var hasRequiredEXISTS;

function requireEXISTS () {
	if (hasRequiredEXISTS) return EXISTS;
	hasRequiredEXISTS = 1;
	Object.defineProperty(EXISTS, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	EXISTS.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Checks if an item exists in a Cuckoo Filter
	     * @param parser - The command parser
	     * @param key - The name of the Cuckoo filter
	     * @param item - The item to check for existence
	     */
	    parseCommand(parser, key, item) {
	        parser.push('CF.EXISTS');
	        parser.pushKey(key);
	        parser.push(item);
	    },
	    transformReply: generic_transformers_1.transformBooleanReply
	};
	
	return EXISTS;
}

var INFO$4 = {};

var hasRequiredINFO$4;

function requireINFO$4 () {
	if (hasRequiredINFO$4) return INFO$4;
	hasRequiredINFO$4 = 1;
	Object.defineProperty(INFO$4, "__esModule", { value: true });
	const bloom_1 = requireBloom();
	INFO$4.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Returns detailed information about a Cuckoo Filter including size, buckets, filters count, items statistics and configuration
	     * @param parser - The command parser
	     * @param key - The name of the Cuckoo filter to get information about
	     */
	    parseCommand(parser, key) {
	        parser.push('CF.INFO');
	        parser.pushKey(key);
	    },
	    transformReply: {
	        2: (reply, _, typeMapping) => {
	            return (0, bloom_1.transformInfoV2Reply)(reply, typeMapping);
	        },
	        3: undefined
	    }
	};
	
	return INFO$4;
}

var INSERT = {};

var hasRequiredINSERT;

function requireINSERT () {
	if (hasRequiredINSERT) return INSERT;
	hasRequiredINSERT = 1;
	Object.defineProperty(INSERT, "__esModule", { value: true });
	INSERT.parseCfInsertArguments = void 0;
	const generic_transformers_1 = requireGenericTransformers();
	function parseCfInsertArguments(parser, key, items, options) {
	    parser.pushKey(key);
	    if (options?.CAPACITY !== undefined) {
	        parser.push('CAPACITY', options.CAPACITY.toString());
	    }
	    if (options?.NOCREATE) {
	        parser.push('NOCREATE');
	    }
	    parser.push('ITEMS');
	    parser.pushVariadic(items);
	}
	INSERT.parseCfInsertArguments = parseCfInsertArguments;
	INSERT.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Adds one or more items to a Cuckoo Filter, creating it if it does not exist
	     * @param parser - The command parser
	     * @param key - The name of the Cuckoo filter
	     * @param items - One or more items to add to the filter
	     * @param options - Optional parameters for filter creation
	     * @param options.CAPACITY - The number of entries intended to be added to the filter
	     * @param options.NOCREATE - If true, prevents automatic filter creation
	     */
	    parseCommand(...args) {
	        args[0].push('CF.INSERT');
	        parseCfInsertArguments(...args);
	    },
	    transformReply: generic_transformers_1.transformBooleanArrayReply
	};
	
	return INSERT;
}

var INSERTNX = {};

var hasRequiredINSERTNX;

function requireINSERTNX () {
	if (hasRequiredINSERTNX) return INSERTNX;
	hasRequiredINSERTNX = 1;
	var __createBinding = (INSERTNX && INSERTNX.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (INSERTNX && INSERTNX.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar = (INSERTNX && INSERTNX.__importStar) || function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
	    __setModuleDefault(result, mod);
	    return result;
	};
	Object.defineProperty(INSERTNX, "__esModule", { value: true });
	const INSERT_1 = __importStar(requireINSERT());
	/**
	 * Adds one or more items to a Cuckoo Filter only if they do not exist yet, creating the filter if needed
	 * @param parser - The command parser
	 * @param key - The name of the Cuckoo filter
	 * @param items - One or more items to add to the filter
	 * @param options - Optional parameters for filter creation
	 * @param options.CAPACITY - The number of entries intended to be added to the filter
	 * @param options.NOCREATE - If true, prevents automatic filter creation
	 */
	INSERTNX.default = {
	    IS_READ_ONLY: INSERT_1.default.IS_READ_ONLY,
	    parseCommand(...args) {
	        args[0].push('CF.INSERTNX');
	        (0, INSERT_1.parseCfInsertArguments)(...args);
	    },
	    transformReply: INSERT_1.default.transformReply
	};
	
	return INSERTNX;
}

var LOADCHUNK = {};

var hasRequiredLOADCHUNK;

function requireLOADCHUNK () {
	if (hasRequiredLOADCHUNK) return LOADCHUNK;
	hasRequiredLOADCHUNK = 1;
	Object.defineProperty(LOADCHUNK, "__esModule", { value: true });
	LOADCHUNK.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Restores a Cuckoo Filter chunk previously saved using SCANDUMP
	     * @param parser - The command parser
	     * @param key - The name of the Cuckoo filter to restore
	     * @param iterator - Iterator value from the SCANDUMP command
	     * @param chunk - Data chunk from the SCANDUMP command
	     */
	    parseCommand(parser, key, iterator, chunk) {
	        parser.push('CF.LOADCHUNK');
	        parser.pushKey(key);
	        parser.push(iterator.toString(), chunk);
	    },
	    transformReply: undefined
	};
	
	return LOADCHUNK;
}

var RESERVE$1 = {};

var hasRequiredRESERVE$1;

function requireRESERVE$1 () {
	if (hasRequiredRESERVE$1) return RESERVE$1;
	hasRequiredRESERVE$1 = 1;
	Object.defineProperty(RESERVE$1, "__esModule", { value: true });
	RESERVE$1.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Creates an empty Cuckoo Filter with specified capacity and parameters
	     * @param parser - The command parser
	     * @param key - The name of the Cuckoo filter to create
	     * @param capacity - The number of entries intended to be added to the filter
	     * @param options - Optional parameters to tune the filter
	     * @param options.BUCKETSIZE - Number of items in each bucket
	     * @param options.MAXITERATIONS - Maximum number of iterations before declaring filter full
	     * @param options.EXPANSION - Number of additional buckets per expansion
	     */
	    parseCommand(parser, key, capacity, options) {
	        parser.push('CF.RESERVE');
	        parser.pushKey(key);
	        parser.push(capacity.toString());
	        if (options?.BUCKETSIZE !== undefined) {
	            parser.push('BUCKETSIZE', options.BUCKETSIZE.toString());
	        }
	        if (options?.MAXITERATIONS !== undefined) {
	            parser.push('MAXITERATIONS', options.MAXITERATIONS.toString());
	        }
	        if (options?.EXPANSION !== undefined) {
	            parser.push('EXPANSION', options.EXPANSION.toString());
	        }
	    },
	    transformReply: undefined
	};
	
	return RESERVE$1;
}

var SCANDUMP = {};

var hasRequiredSCANDUMP;

function requireSCANDUMP () {
	if (hasRequiredSCANDUMP) return SCANDUMP;
	hasRequiredSCANDUMP = 1;
	Object.defineProperty(SCANDUMP, "__esModule", { value: true });
	SCANDUMP.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Begins an incremental save of a Cuckoo Filter. This is useful for large filters that can't be saved at once
	     * @param parser - The command parser
	     * @param key - The name of the Cuckoo filter to save
	     * @param iterator - Iterator value; Start at 0, and use the iterator from the response for the next chunk
	     */
	    parseCommand(parser, key, iterator) {
	        parser.push('CF.SCANDUMP');
	        parser.pushKey(key);
	        parser.push(iterator.toString());
	    },
	    transformReply(reply) {
	        return {
	            iterator: reply[0],
	            chunk: reply[1]
	        };
	    }
	};
	
	return SCANDUMP;
}

var hasRequiredCuckoo;

function requireCuckoo () {
	if (hasRequiredCuckoo) return cuckoo;
	hasRequiredCuckoo = 1;
	var __importDefault = (cuckoo && cuckoo.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(cuckoo, "__esModule", { value: true });
	const ADD_1 = __importDefault(requireADD$3());
	const ADDNX_1 = __importDefault(requireADDNX());
	const COUNT_1 = __importDefault(requireCOUNT$1());
	const DEL_1 = __importDefault(requireDEL$2());
	const EXISTS_1 = __importDefault(requireEXISTS());
	const INFO_1 = __importDefault(requireINFO$4());
	const INSERT_1 = __importDefault(requireINSERT());
	const INSERTNX_1 = __importDefault(requireINSERTNX());
	const LOADCHUNK_1 = __importDefault(requireLOADCHUNK());
	const RESERVE_1 = __importDefault(requireRESERVE$1());
	const SCANDUMP_1 = __importDefault(requireSCANDUMP());
	cuckoo.default = {
	    ADD: ADD_1.default,
	    add: ADD_1.default,
	    ADDNX: ADDNX_1.default,
	    addNX: ADDNX_1.default,
	    COUNT: COUNT_1.default,
	    count: COUNT_1.default,
	    DEL: DEL_1.default,
	    del: DEL_1.default,
	    EXISTS: EXISTS_1.default,
	    exists: EXISTS_1.default,
	    INFO: INFO_1.default,
	    info: INFO_1.default,
	    INSERT: INSERT_1.default,
	    insert: INSERT_1.default,
	    INSERTNX: INSERTNX_1.default,
	    insertNX: INSERTNX_1.default,
	    LOADCHUNK: LOADCHUNK_1.default,
	    loadChunk: LOADCHUNK_1.default,
	    RESERVE: RESERVE_1.default,
	    reserve: RESERVE_1.default,
	    SCANDUMP: SCANDUMP_1.default,
	    scanDump: SCANDUMP_1.default
	};
	
	return cuckoo;
}

var tDigest = {};

var ADD$2 = {};

var hasRequiredADD$2;

function requireADD$2 () {
	if (hasRequiredADD$2) return ADD$2;
	hasRequiredADD$2 = 1;
	Object.defineProperty(ADD$2, "__esModule", { value: true });
	ADD$2.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Adds one or more observations to a t-digest sketch
	     * @param parser - The command parser
	     * @param key - The name of the t-digest sketch
	     * @param values - Array of numeric values to add to the sketch
	     */
	    parseCommand(parser, key, values) {
	        parser.push('TDIGEST.ADD');
	        parser.pushKey(key);
	        for (const value of values) {
	            parser.push(value.toString());
	        }
	    },
	    transformReply: undefined
	};
	
	return ADD$2;
}

var BYRANK = {};

var hasRequiredBYRANK;

function requireBYRANK () {
	if (hasRequiredBYRANK) return BYRANK;
	hasRequiredBYRANK = 1;
	Object.defineProperty(BYRANK, "__esModule", { value: true });
	BYRANK.transformByRankArguments = void 0;
	const generic_transformers_1 = requireGenericTransformers();
	function transformByRankArguments(parser, key, ranks) {
	    parser.pushKey(key);
	    for (const rank of ranks) {
	        parser.push(rank.toString());
	    }
	}
	BYRANK.transformByRankArguments = transformByRankArguments;
	BYRANK.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Returns value estimates for one or more ranks in a t-digest sketch
	     * @param parser - The command parser
	     * @param key - The name of the t-digest sketch
	     * @param ranks - Array of ranks to get value estimates for (ascending order)
	     */
	    parseCommand(...args) {
	        args[0].push('TDIGEST.BYRANK');
	        transformByRankArguments(...args);
	    },
	    transformReply: generic_transformers_1.transformDoubleArrayReply
	};
	
	return BYRANK;
}

var BYREVRANK = {};

var hasRequiredBYREVRANK;

function requireBYREVRANK () {
	if (hasRequiredBYREVRANK) return BYREVRANK;
	hasRequiredBYREVRANK = 1;
	var __createBinding = (BYREVRANK && BYREVRANK.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (BYREVRANK && BYREVRANK.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar = (BYREVRANK && BYREVRANK.__importStar) || function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
	    __setModuleDefault(result, mod);
	    return result;
	};
	Object.defineProperty(BYREVRANK, "__esModule", { value: true });
	const BYRANK_1 = __importStar(requireBYRANK());
	/**
	 * Returns value estimates for one or more ranks in a t-digest sketch, starting from highest rank
	 * @param parser - The command parser
	 * @param key - The name of the t-digest sketch
	 * @param ranks - Array of ranks to get value estimates for (descending order)
	 */
	BYREVRANK.default = {
	    IS_READ_ONLY: BYRANK_1.default.IS_READ_ONLY,
	    parseCommand(...args) {
	        args[0].push('TDIGEST.BYREVRANK');
	        (0, BYRANK_1.transformByRankArguments)(...args);
	    },
	    transformReply: BYRANK_1.default.transformReply
	};
	
	return BYREVRANK;
}

var CDF = {};

var hasRequiredCDF;

function requireCDF () {
	if (hasRequiredCDF) return CDF;
	hasRequiredCDF = 1;
	Object.defineProperty(CDF, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	CDF.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Estimates the cumulative distribution function for values in a t-digest sketch
	     * @param parser - The command parser
	     * @param key - The name of the t-digest sketch
	     * @param values - Array of values to get CDF estimates for
	     */
	    parseCommand(parser, key, values) {
	        parser.push('TDIGEST.CDF');
	        parser.pushKey(key);
	        for (const item of values) {
	            parser.push(item.toString());
	        }
	    },
	    transformReply: generic_transformers_1.transformDoubleArrayReply
	};
	
	return CDF;
}

var CREATE$2 = {};

var hasRequiredCREATE$2;

function requireCREATE$2 () {
	if (hasRequiredCREATE$2) return CREATE$2;
	hasRequiredCREATE$2 = 1;
	Object.defineProperty(CREATE$2, "__esModule", { value: true });
	CREATE$2.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Creates a new t-digest sketch for storing distributions
	     * @param parser - The command parser
	     * @param key - The name of the t-digest sketch
	     * @param options - Optional parameters for sketch creation
	     * @param options.COMPRESSION - Compression parameter that affects performance and accuracy
	     */
	    parseCommand(parser, key, options) {
	        parser.push('TDIGEST.CREATE');
	        parser.pushKey(key);
	        if (options?.COMPRESSION !== undefined) {
	            parser.push('COMPRESSION', options.COMPRESSION.toString());
	        }
	    },
	    transformReply: undefined
	};
	
	return CREATE$2;
}

var INFO$3 = {};

var hasRequiredINFO$3;

function requireINFO$3 () {
	if (hasRequiredINFO$3) return INFO$3;
	hasRequiredINFO$3 = 1;
	Object.defineProperty(INFO$3, "__esModule", { value: true });
	const bloom_1 = requireBloom();
	INFO$3.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Returns information about a t-digest sketch including compression, capacity, nodes, weights, observations and memory usage
	     * @param parser - The command parser
	     * @param key - The name of the t-digest sketch to get information about
	     */
	    parseCommand(parser, key) {
	        parser.push('TDIGEST.INFO');
	        parser.pushKey(key);
	    },
	    transformReply: {
	        2: (reply, _, typeMapping) => {
	            return (0, bloom_1.transformInfoV2Reply)(reply, typeMapping);
	        },
	        3: undefined
	    }
	};
	
	return INFO$3;
}

var MAX = {};

var hasRequiredMAX;

function requireMAX () {
	if (hasRequiredMAX) return MAX;
	hasRequiredMAX = 1;
	Object.defineProperty(MAX, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	MAX.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Returns the maximum value from a t-digest sketch
	     * @param parser - The command parser
	     * @param key - The name of the t-digest sketch
	     */
	    parseCommand(parser, key) {
	        parser.push('TDIGEST.MAX');
	        parser.pushKey(key);
	    },
	    transformReply: generic_transformers_1.transformDoubleReply
	};
	
	return MAX;
}

var MERGE$1 = {};

var hasRequiredMERGE$1;

function requireMERGE$1 () {
	if (hasRequiredMERGE$1) return MERGE$1;
	hasRequiredMERGE$1 = 1;
	Object.defineProperty(MERGE$1, "__esModule", { value: true });
	MERGE$1.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Merges multiple t-digest sketches into one, with optional compression and override settings
	     * @param parser - The command parser
	     * @param destination - The name of the destination t-digest sketch
	     * @param source - One or more source sketch names to merge from
	     * @param options - Optional parameters for merge operation
	     * @param options.COMPRESSION - New compression value for merged sketch
	     * @param options.OVERRIDE - If true, override destination sketch if it exists
	     */
	    parseCommand(parser, destination, source, options) {
	        parser.push('TDIGEST.MERGE');
	        parser.pushKey(destination);
	        parser.pushKeysLength(source);
	        if (options?.COMPRESSION !== undefined) {
	            parser.push('COMPRESSION', options.COMPRESSION.toString());
	        }
	        if (options?.OVERRIDE) {
	            parser.push('OVERRIDE');
	        }
	    },
	    transformReply: undefined
	};
	
	return MERGE$1;
}

var MIN = {};

var hasRequiredMIN;

function requireMIN () {
	if (hasRequiredMIN) return MIN;
	hasRequiredMIN = 1;
	Object.defineProperty(MIN, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	MIN.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Returns the minimum value from a t-digest sketch
	     * @param parser - The command parser
	     * @param key - The name of the t-digest sketch
	     */
	    parseCommand(parser, key) {
	        parser.push('TDIGEST.MIN');
	        parser.pushKey(key);
	    },
	    transformReply: generic_transformers_1.transformDoubleReply
	};
	
	return MIN;
}

var QUANTILE = {};

var hasRequiredQUANTILE;

function requireQUANTILE () {
	if (hasRequiredQUANTILE) return QUANTILE;
	hasRequiredQUANTILE = 1;
	Object.defineProperty(QUANTILE, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	QUANTILE.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Returns value estimates at requested quantiles from a t-digest sketch
	     * @param parser - The command parser
	     * @param key - The name of the t-digest sketch
	     * @param quantiles - Array of quantiles (between 0 and 1) to get value estimates for
	     */
	    parseCommand(parser, key, quantiles) {
	        parser.push('TDIGEST.QUANTILE');
	        parser.pushKey(key);
	        for (const quantile of quantiles) {
	            parser.push(quantile.toString());
	        }
	    },
	    transformReply: generic_transformers_1.transformDoubleArrayReply
	};
	
	return QUANTILE;
}

var RANK = {};

var hasRequiredRANK;

function requireRANK () {
	if (hasRequiredRANK) return RANK;
	hasRequiredRANK = 1;
	Object.defineProperty(RANK, "__esModule", { value: true });
	RANK.transformRankArguments = void 0;
	function transformRankArguments(parser, key, values) {
	    parser.pushKey(key);
	    for (const value of values) {
	        parser.push(value.toString());
	    }
	}
	RANK.transformRankArguments = transformRankArguments;
	RANK.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Returns the rank of one or more values in a t-digest sketch (number of values that are lower than each value)
	     * @param parser - The command parser
	     * @param key - The name of the t-digest sketch
	     * @param values - Array of values to get ranks for
	     */
	    parseCommand(...args) {
	        args[0].push('TDIGEST.RANK');
	        transformRankArguments(...args);
	    },
	    transformReply: undefined
	};
	
	return RANK;
}

var RESET = {};

var hasRequiredRESET;

function requireRESET () {
	if (hasRequiredRESET) return RESET;
	hasRequiredRESET = 1;
	Object.defineProperty(RESET, "__esModule", { value: true });
	RESET.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Resets a t-digest sketch, clearing all previously added observations
	     * @param parser - The command parser
	     * @param key - The name of the t-digest sketch to reset
	     */
	    parseCommand(parser, key) {
	        parser.push('TDIGEST.RESET');
	        parser.pushKey(key);
	    },
	    transformReply: undefined
	};
	
	return RESET;
}

var REVRANK = {};

var hasRequiredREVRANK;

function requireREVRANK () {
	if (hasRequiredREVRANK) return REVRANK;
	hasRequiredREVRANK = 1;
	var __createBinding = (REVRANK && REVRANK.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (REVRANK && REVRANK.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar = (REVRANK && REVRANK.__importStar) || function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
	    __setModuleDefault(result, mod);
	    return result;
	};
	Object.defineProperty(REVRANK, "__esModule", { value: true });
	const RANK_1 = __importStar(requireRANK());
	/**
	 * Returns the reverse rank of one or more values in a t-digest sketch (number of values that are higher than each value)
	 * @param parser - The command parser
	 * @param key - The name of the t-digest sketch
	 * @param values - Array of values to get reverse ranks for
	 */
	REVRANK.default = {
	    IS_READ_ONLY: RANK_1.default.IS_READ_ONLY,
	    parseCommand(...args) {
	        args[0].push('TDIGEST.REVRANK');
	        (0, RANK_1.transformRankArguments)(...args);
	    },
	    transformReply: RANK_1.default.transformReply
	};
	
	return REVRANK;
}

var TRIMMED_MEAN = {};

var hasRequiredTRIMMED_MEAN;

function requireTRIMMED_MEAN () {
	if (hasRequiredTRIMMED_MEAN) return TRIMMED_MEAN;
	hasRequiredTRIMMED_MEAN = 1;
	Object.defineProperty(TRIMMED_MEAN, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	TRIMMED_MEAN.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Returns the mean value from a t-digest sketch after trimming values at specified percentiles
	     * @param parser - The command parser
	     * @param key - The name of the t-digest sketch
	     * @param lowCutPercentile - Lower percentile cutoff (between 0 and 100)
	     * @param highCutPercentile - Higher percentile cutoff (between 0 and 100)
	     */
	    parseCommand(parser, key, lowCutPercentile, highCutPercentile) {
	        parser.push('TDIGEST.TRIMMED_MEAN');
	        parser.pushKey(key);
	        parser.push(lowCutPercentile.toString(), highCutPercentile.toString());
	    },
	    transformReply: generic_transformers_1.transformDoubleReply
	};
	
	return TRIMMED_MEAN;
}

var hasRequiredTDigest;

function requireTDigest () {
	if (hasRequiredTDigest) return tDigest;
	hasRequiredTDigest = 1;
	var __importDefault = (tDigest && tDigest.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(tDigest, "__esModule", { value: true });
	const ADD_1 = __importDefault(requireADD$2());
	const BYRANK_1 = __importDefault(requireBYRANK());
	const BYREVRANK_1 = __importDefault(requireBYREVRANK());
	const CDF_1 = __importDefault(requireCDF());
	const CREATE_1 = __importDefault(requireCREATE$2());
	const INFO_1 = __importDefault(requireINFO$3());
	const MAX_1 = __importDefault(requireMAX());
	const MERGE_1 = __importDefault(requireMERGE$1());
	const MIN_1 = __importDefault(requireMIN());
	const QUANTILE_1 = __importDefault(requireQUANTILE());
	const RANK_1 = __importDefault(requireRANK());
	const RESET_1 = __importDefault(requireRESET());
	const REVRANK_1 = __importDefault(requireREVRANK());
	const TRIMMED_MEAN_1 = __importDefault(requireTRIMMED_MEAN());
	tDigest.default = {
	    ADD: ADD_1.default,
	    add: ADD_1.default,
	    BYRANK: BYRANK_1.default,
	    byRank: BYRANK_1.default,
	    BYREVRANK: BYREVRANK_1.default,
	    byRevRank: BYREVRANK_1.default,
	    CDF: CDF_1.default,
	    cdf: CDF_1.default,
	    CREATE: CREATE_1.default,
	    create: CREATE_1.default,
	    INFO: INFO_1.default,
	    info: INFO_1.default,
	    MAX: MAX_1.default,
	    max: MAX_1.default,
	    MERGE: MERGE_1.default,
	    merge: MERGE_1.default,
	    MIN: MIN_1.default,
	    min: MIN_1.default,
	    QUANTILE: QUANTILE_1.default,
	    quantile: QUANTILE_1.default,
	    RANK: RANK_1.default,
	    rank: RANK_1.default,
	    RESET: RESET_1.default,
	    reset: RESET_1.default,
	    REVRANK: REVRANK_1.default,
	    revRank: REVRANK_1.default,
	    TRIMMED_MEAN: TRIMMED_MEAN_1.default,
	    trimmedMean: TRIMMED_MEAN_1.default
	};
	
	return tDigest;
}

var topK = {};

var ADD$1 = {};

var hasRequiredADD$1;

function requireADD$1 () {
	if (hasRequiredADD$1) return ADD$1;
	hasRequiredADD$1 = 1;
	Object.defineProperty(ADD$1, "__esModule", { value: true });
	ADD$1.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Adds one or more items to a Top-K filter and returns items dropped from the top-K list
	     * @param parser - The command parser
	     * @param key - The name of the Top-K filter
	     * @param items - One or more items to add to the filter
	     */
	    parseCommand(parser, key, items) {
	        parser.push('TOPK.ADD');
	        parser.pushKey(key);
	        parser.pushVariadic(items);
	    },
	    transformReply: undefined
	};
	
	return ADD$1;
}

var COUNT = {};

var hasRequiredCOUNT;

function requireCOUNT () {
	if (hasRequiredCOUNT) return COUNT;
	hasRequiredCOUNT = 1;
	Object.defineProperty(COUNT, "__esModule", { value: true });
	COUNT.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Returns the count of occurrences for one or more items in a Top-K filter
	     * @param parser - The command parser
	     * @param key - The name of the Top-K filter
	     * @param items - One or more items to get counts for
	     */
	    parseCommand(parser, key, items) {
	        parser.push('TOPK.COUNT');
	        parser.pushKey(key);
	        parser.pushVariadic(items);
	    },
	    transformReply: undefined
	};
	
	return COUNT;
}

var INCRBY$1 = {};

var hasRequiredINCRBY$1;

function requireINCRBY$1 () {
	if (hasRequiredINCRBY$1) return INCRBY$1;
	hasRequiredINCRBY$1 = 1;
	Object.defineProperty(INCRBY$1, "__esModule", { value: true });
	function pushIncrByItem(parser, { item, incrementBy }) {
	    parser.push(item, incrementBy.toString());
	}
	INCRBY$1.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Increases the score of one or more items in a Top-K filter by specified increments
	     * @param parser - The command parser
	     * @param key - The name of the Top-K filter
	     * @param items - A single item or array of items to increment, each with an item name and increment value
	     */
	    parseCommand(parser, key, items) {
	        parser.push('TOPK.INCRBY');
	        parser.pushKey(key);
	        if (Array.isArray(items)) {
	            for (const item of items) {
	                pushIncrByItem(parser, item);
	            }
	        }
	        else {
	            pushIncrByItem(parser, items);
	        }
	    },
	    transformReply: undefined
	};
	
	return INCRBY$1;
}

var INFO$2 = {};

var hasRequiredINFO$2;

function requireINFO$2 () {
	if (hasRequiredINFO$2) return INFO$2;
	hasRequiredINFO$2 = 1;
	Object.defineProperty(INFO$2, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	const bloom_1 = requireBloom();
	INFO$2.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Returns configuration and statistics of a Top-K filter, including k, width, depth, and decay parameters
	     * @param parser - The command parser
	     * @param key - The name of the Top-K filter to get information about
	     */
	    parseCommand(parser, key) {
	        parser.push('TOPK.INFO');
	        parser.pushKey(key);
	    },
	    transformReply: {
	        2: (reply, preserve, typeMapping) => {
	            reply[7] = generic_transformers_1.transformDoubleReply[2](reply[7], preserve, typeMapping);
	            return (0, bloom_1.transformInfoV2Reply)(reply, typeMapping);
	        },
	        3: undefined
	    }
	};
	
	return INFO$2;
}

var LIST_WITHCOUNT = {};

var hasRequiredLIST_WITHCOUNT;

function requireLIST_WITHCOUNT () {
	if (hasRequiredLIST_WITHCOUNT) return LIST_WITHCOUNT;
	hasRequiredLIST_WITHCOUNT = 1;
	Object.defineProperty(LIST_WITHCOUNT, "__esModule", { value: true });
	LIST_WITHCOUNT.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Returns all items in a Top-K filter with their respective counts
	     * @param parser - The command parser
	     * @param key - The name of the Top-K filter
	     */
	    parseCommand(parser, key) {
	        parser.push('TOPK.LIST');
	        parser.pushKey(key);
	        parser.push('WITHCOUNT');
	    },
	    transformReply(rawReply) {
	        const reply = [];
	        for (let i = 0; i < rawReply.length; i++) {
	            reply.push({
	                item: rawReply[i],
	                count: rawReply[++i]
	            });
	        }
	        return reply;
	    }
	};
	
	return LIST_WITHCOUNT;
}

var LIST = {};

var hasRequiredLIST;

function requireLIST () {
	if (hasRequiredLIST) return LIST;
	hasRequiredLIST = 1;
	Object.defineProperty(LIST, "__esModule", { value: true });
	LIST.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Returns all items in a Top-K filter
	     * @param parser - The command parser
	     * @param key - The name of the Top-K filter
	     */
	    parseCommand(parser, key) {
	        parser.push('TOPK.LIST');
	        parser.pushKey(key);
	    },
	    transformReply: undefined
	};
	
	return LIST;
}

var QUERY = {};

var hasRequiredQUERY;

function requireQUERY () {
	if (hasRequiredQUERY) return QUERY;
	hasRequiredQUERY = 1;
	Object.defineProperty(QUERY, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	QUERY.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Checks if one or more items are in the Top-K list
	     * @param parser - The command parser
	     * @param key - The name of the Top-K filter
	     * @param items - One or more items to check in the filter
	     */
	    parseCommand(parser, key, items) {
	        parser.push('TOPK.QUERY');
	        parser.pushKey(key);
	        parser.pushVariadic(items);
	    },
	    transformReply: generic_transformers_1.transformBooleanArrayReply
	};
	
	return QUERY;
}

var RESERVE = {};

var hasRequiredRESERVE;

function requireRESERVE () {
	if (hasRequiredRESERVE) return RESERVE;
	hasRequiredRESERVE = 1;
	Object.defineProperty(RESERVE, "__esModule", { value: true });
	RESERVE.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Creates a new Top-K filter with specified parameters
	     * @param parser - The command parser
	     * @param key - The name of the Top-K filter
	     * @param topK - Number of top occurring items to keep
	     * @param options - Optional parameters for filter configuration
	     * @param options.width - Number of counters in each array
	     * @param options.depth - Number of counter-arrays
	     * @param options.decay - Counter decay factor
	     */
	    parseCommand(parser, key, topK, options) {
	        parser.push('TOPK.RESERVE');
	        parser.pushKey(key);
	        parser.push(topK.toString());
	        if (options) {
	            parser.push(options.width.toString(), options.depth.toString(), options.decay.toString());
	        }
	    },
	    transformReply: undefined
	};
	
	return RESERVE;
}

var hasRequiredTopK;

function requireTopK () {
	if (hasRequiredTopK) return topK;
	hasRequiredTopK = 1;
	var __importDefault = (topK && topK.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(topK, "__esModule", { value: true });
	const ADD_1 = __importDefault(requireADD$1());
	const COUNT_1 = __importDefault(requireCOUNT());
	const INCRBY_1 = __importDefault(requireINCRBY$1());
	const INFO_1 = __importDefault(requireINFO$2());
	const LIST_WITHCOUNT_1 = __importDefault(requireLIST_WITHCOUNT());
	const LIST_1 = __importDefault(requireLIST());
	const QUERY_1 = __importDefault(requireQUERY());
	const RESERVE_1 = __importDefault(requireRESERVE());
	topK.default = {
	    ADD: ADD_1.default,
	    add: ADD_1.default,
	    COUNT: COUNT_1.default,
	    count: COUNT_1.default,
	    INCRBY: INCRBY_1.default,
	    incrBy: INCRBY_1.default,
	    INFO: INFO_1.default,
	    info: INFO_1.default,
	    LIST_WITHCOUNT: LIST_WITHCOUNT_1.default,
	    listWithCount: LIST_WITHCOUNT_1.default,
	    LIST: LIST_1.default,
	    list: LIST_1.default,
	    QUERY: QUERY_1.default,
	    query: QUERY_1.default,
	    RESERVE: RESERVE_1.default,
	    reserve: RESERVE_1.default
	};
	
	return topK;
}

var hasRequiredCommands$3;

function requireCommands$3 () {
	if (hasRequiredCommands$3) return commands$3;
	hasRequiredCommands$3 = 1;
	var __importDefault = (commands$3 && commands$3.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(commands$3, "__esModule", { value: true });
	const bloom_1 = __importDefault(requireBloom());
	const count_min_sketch_1 = __importDefault(requireCountMinSketch());
	const cuckoo_1 = __importDefault(requireCuckoo());
	const t_digest_1 = __importDefault(requireTDigest());
	const top_k_1 = __importDefault(requireTopK());
	commands$3.default = {
	    bf: bloom_1.default,
	    cms: count_min_sketch_1.default,
	    cf: cuckoo_1.default,
	    tDigest: t_digest_1.default,
	    topK: top_k_1.default
	};
	
	return commands$3;
}

var hasRequiredLib$3;

function requireLib$3 () {
	if (hasRequiredLib$3) return lib$3;
	hasRequiredLib$3 = 1;
	(function (exports) {
		var __importDefault = (lib$3 && lib$3.__importDefault) || function (mod) {
		    return (mod && mod.__esModule) ? mod : { "default": mod };
		};
		Object.defineProperty(exports, "__esModule", { value: true });
		exports.default = void 0;
		var commands_1 = requireCommands$3();
		Object.defineProperty(exports, "default", { enumerable: true, get: function () { return __importDefault(commands_1).default; } });
		
	} (lib$3));
	return lib$3;
}

var lib$2 = {};

var commands$2 = {};

var ARRAPPEND = {};

var hasRequiredARRAPPEND;

function requireARRAPPEND () {
	if (hasRequiredARRAPPEND) return ARRAPPEND;
	hasRequiredARRAPPEND = 1;
	Object.defineProperty(ARRAPPEND, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	ARRAPPEND.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Appends one or more values to the end of an array in a JSON document.
	     * Returns the new array length after append, or null if the path does not exist.
	     *
	     * @param parser - The Redis command parser
	     * @param key - The key to append to
	     * @param path - Path to the array in the JSON document
	     * @param json - The first value to append
	     * @param jsons - Additional values to append
	     */
	    parseCommand(parser, key, path, json, ...jsons) {
	        parser.push('JSON.ARRAPPEND');
	        parser.pushKey(key);
	        parser.push(path, (0, generic_transformers_1.transformRedisJsonArgument)(json));
	        for (let i = 0; i < jsons.length; i++) {
	            parser.push((0, generic_transformers_1.transformRedisJsonArgument)(jsons[i]));
	        }
	    },
	    transformReply: undefined
	};
	
	return ARRAPPEND;
}

var ARRINDEX = {};

var hasRequiredARRINDEX;

function requireARRINDEX () {
	if (hasRequiredARRINDEX) return ARRINDEX;
	hasRequiredARRINDEX = 1;
	Object.defineProperty(ARRINDEX, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	ARRINDEX.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Returns the index of the first occurrence of a value in a JSON array.
	     * If the specified value is not found, it returns -1, or null if the path does not exist.
	     *
	     * @param parser - The Redis command parser
	     * @param key - The key containing the array
	     * @param path - Path to the array in the JSON document
	     * @param json - The value to search for
	     * @param options - Optional range parameters for the search
	     * @param options.range.start - Starting index for the search
	     * @param options.range.stop - Optional ending index for the search
	     */
	    parseCommand(parser, key, path, json, options) {
	        parser.push('JSON.ARRINDEX');
	        parser.pushKey(key);
	        parser.push(path, (0, generic_transformers_1.transformRedisJsonArgument)(json));
	        if (options?.range) {
	            parser.push(options.range.start.toString());
	            if (options.range.stop !== undefined) {
	                parser.push(options.range.stop.toString());
	            }
	        }
	    },
	    transformReply: undefined
	};
	
	return ARRINDEX;
}

var ARRINSERT = {};

var hasRequiredARRINSERT;

function requireARRINSERT () {
	if (hasRequiredARRINSERT) return ARRINSERT;
	hasRequiredARRINSERT = 1;
	Object.defineProperty(ARRINSERT, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	ARRINSERT.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Inserts one or more values into an array at the specified index.
	     * Returns the new array length after insert, or null if the path does not exist.
	     *
	     * @param parser - The Redis command parser
	     * @param key - The key containing the array
	     * @param path - Path to the array in the JSON document
	     * @param index - The position where to insert the values
	     * @param json - The first value to insert
	     * @param jsons - Additional values to insert
	     */
	    parseCommand(parser, key, path, index, json, ...jsons) {
	        parser.push('JSON.ARRINSERT');
	        parser.pushKey(key);
	        parser.push(path, index.toString(), (0, generic_transformers_1.transformRedisJsonArgument)(json));
	        for (let i = 0; i < jsons.length; i++) {
	            parser.push((0, generic_transformers_1.transformRedisJsonArgument)(jsons[i]));
	        }
	    },
	    transformReply: undefined
	};
	
	return ARRINSERT;
}

var ARRLEN = {};

var hasRequiredARRLEN;

function requireARRLEN () {
	if (hasRequiredARRLEN) return ARRLEN;
	hasRequiredARRLEN = 1;
	Object.defineProperty(ARRLEN, "__esModule", { value: true });
	ARRLEN.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Returns the length of an array in a JSON document.
	     * Returns null if the path does not exist or the value is not an array.
	     *
	     * @param parser - The Redis command parser
	     * @param key - The key containing the array
	     * @param options - Optional parameters
	     * @param options.path - Path to the array in the JSON document
	     */
	    parseCommand(parser, key, options) {
	        parser.push('JSON.ARRLEN');
	        parser.pushKey(key);
	        if (options?.path !== undefined) {
	            parser.push(options.path);
	        }
	    },
	    transformReply: undefined
	};
	
	return ARRLEN;
}

var ARRPOP = {};

var hasRequiredARRPOP;

function requireARRPOP () {
	if (hasRequiredARRPOP) return ARRPOP;
	hasRequiredARRPOP = 1;
	Object.defineProperty(ARRPOP, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	ARRPOP.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Removes and returns an element from an array in a JSON document.
	     * Returns null if the path does not exist or the value is not an array.
	     *
	     * @param parser - The Redis command parser
	     * @param key - The key containing the array
	     * @param options - Optional parameters
	     * @param options.path - Path to the array in the JSON document
	     * @param options.index - Optional index to pop from. Default is -1 (last element)
	     */
	    parseCommand(parser, key, options) {
	        parser.push('JSON.ARRPOP');
	        parser.pushKey(key);
	        if (options) {
	            parser.push(options.path);
	            if (options.index !== undefined) {
	                parser.push(options.index.toString());
	            }
	        }
	    },
	    transformReply(reply) {
	        return (0, generic_transformers_1.isArrayReply)(reply) ?
	            reply.map(item => (0, generic_transformers_1.transformRedisJsonNullReply)(item)) :
	            (0, generic_transformers_1.transformRedisJsonNullReply)(reply);
	    }
	};
	
	return ARRPOP;
}

var ARRTRIM = {};

var hasRequiredARRTRIM;

function requireARRTRIM () {
	if (hasRequiredARRTRIM) return ARRTRIM;
	hasRequiredARRTRIM = 1;
	Object.defineProperty(ARRTRIM, "__esModule", { value: true });
	ARRTRIM.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Trims an array in a JSON document to include only elements within the specified range.
	     * Returns the new array length after trimming, or null if the path does not exist.
	     *
	     * @param parser - The Redis command parser
	     * @param key - The key containing the array
	     * @param path - Path to the array in the JSON document
	     * @param start - Starting index (inclusive)
	     * @param stop - Ending index (inclusive)
	     */
	    parseCommand(parser, key, path, start, stop) {
	        parser.push('JSON.ARRTRIM');
	        parser.pushKey(key);
	        parser.push(path, start.toString(), stop.toString());
	    },
	    transformReply: undefined
	};
	
	return ARRTRIM;
}

var CLEAR = {};

var hasRequiredCLEAR;

function requireCLEAR () {
	if (hasRequiredCLEAR) return CLEAR;
	hasRequiredCLEAR = 1;
	Object.defineProperty(CLEAR, "__esModule", { value: true });
	CLEAR.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Clears container values (arrays/objects) in a JSON document.
	     * Returns the number of values cleared (0 or 1), or null if the path does not exist.
	     *
	     * @param parser - The Redis command parser
	     * @param key - The key containing the JSON document
	     * @param options - Optional parameters
	     * @param options.path - Path to the container to clear
	     */
	    parseCommand(parser, key, options) {
	        parser.push('JSON.CLEAR');
	        parser.pushKey(key);
	        if (options?.path !== undefined) {
	            parser.push(options.path);
	        }
	    },
	    transformReply: undefined
	};
	
	return CLEAR;
}

var DEBUG_MEMORY = {};

var hasRequiredDEBUG_MEMORY;

function requireDEBUG_MEMORY () {
	if (hasRequiredDEBUG_MEMORY) return DEBUG_MEMORY;
	hasRequiredDEBUG_MEMORY = 1;
	Object.defineProperty(DEBUG_MEMORY, "__esModule", { value: true });
	DEBUG_MEMORY.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Reports memory usage details for a JSON document value.
	     * Returns size in bytes of the value, or null if the key or path does not exist.
	     *
	     * @param parser - The Redis command parser
	     * @param key - The key containing the JSON document
	     * @param options - Optional parameters
	     * @param options.path - Path to the value to examine
	     */
	    parseCommand(parser, key, options) {
	        parser.push('JSON.DEBUG', 'MEMORY');
	        parser.pushKey(key);
	        if (options?.path !== undefined) {
	            parser.push(options.path);
	        }
	    },
	    transformReply: undefined
	};
	
	return DEBUG_MEMORY;
}

var DEL$1 = {};

var hasRequiredDEL$1;

function requireDEL$1 () {
	if (hasRequiredDEL$1) return DEL$1;
	hasRequiredDEL$1 = 1;
	Object.defineProperty(DEL$1, "__esModule", { value: true });
	DEL$1.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Deletes a value from a JSON document.
	     * Returns the number of paths deleted (0 or 1), or null if the key does not exist.
	     *
	     * @param parser - The Redis command parser
	     * @param key - The key containing the JSON document
	     * @param options - Optional parameters
	     * @param options.path - Path to the value to delete
	     */
	    parseCommand(parser, key, options) {
	        parser.push('JSON.DEL');
	        parser.pushKey(key);
	        if (options?.path !== undefined) {
	            parser.push(options.path);
	        }
	    },
	    transformReply: undefined
	};
	
	return DEL$1;
}

var FORGET = {};

var hasRequiredFORGET;

function requireFORGET () {
	if (hasRequiredFORGET) return FORGET;
	hasRequiredFORGET = 1;
	Object.defineProperty(FORGET, "__esModule", { value: true });
	FORGET.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Alias for JSON.DEL - Deletes a value from a JSON document.
	     * Returns the number of paths deleted (0 or 1), or null if the key does not exist.
	     *
	     * @param parser - The Redis command parser
	     * @param key - The key containing the JSON document
	     * @param options - Optional parameters
	     * @param options.path - Path to the value to delete
	     */
	    parseCommand(parser, key, options) {
	        parser.push('JSON.FORGET');
	        parser.pushKey(key);
	        if (options?.path !== undefined) {
	            parser.push(options.path);
	        }
	    },
	    transformReply: undefined
	};
	
	return FORGET;
}

var GET$1 = {};

var hasRequiredGET$1;

function requireGET$1 () {
	if (hasRequiredGET$1) return GET$1;
	hasRequiredGET$1 = 1;
	Object.defineProperty(GET$1, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	GET$1.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Gets values from a JSON document.
	     * Returns the value at the specified path, or null if the key or path does not exist.
	     *
	     * @param parser - The Redis command parser
	     * @param key - The key containing the JSON document
	     * @param options - Optional parameters
	     * @param options.path - Path(s) to the value(s) to retrieve
	     */
	    parseCommand(parser, key, options) {
	        parser.push('JSON.GET');
	        parser.pushKey(key);
	        if (options?.path !== undefined) {
	            parser.pushVariadic(options.path);
	        }
	    },
	    transformReply: generic_transformers_1.transformRedisJsonNullReply
	};
	
	return GET$1;
}

var MERGE = {};

var hasRequiredMERGE;

function requireMERGE () {
	if (hasRequiredMERGE) return MERGE;
	hasRequiredMERGE = 1;
	Object.defineProperty(MERGE, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	MERGE.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Merges a given JSON value into a JSON document.
	     * Returns OK on success, or null if the key does not exist.
	     *
	     * @param parser - The Redis command parser
	     * @param key - The key containing the JSON document
	     * @param path - Path to merge into
	     * @param value - JSON value to merge
	     */
	    parseCommand(parser, key, path, value) {
	        parser.push('JSON.MERGE');
	        parser.pushKey(key);
	        parser.push(path, (0, generic_transformers_1.transformRedisJsonArgument)(value));
	    },
	    transformReply: undefined
	};
	
	return MERGE;
}

var MGET$1 = {};

var hasRequiredMGET$1;

function requireMGET$1 () {
	if (hasRequiredMGET$1) return MGET$1;
	hasRequiredMGET$1 = 1;
	Object.defineProperty(MGET$1, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	MGET$1.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Gets values at a specific path from multiple JSON documents.
	     * Returns an array of values at the path from each key, null for missing keys/paths.
	     *
	     * @param parser - The Redis command parser
	     * @param keys - Array of keys containing JSON documents
	     * @param path - Path to retrieve from each document
	     */
	    parseCommand(parser, keys, path) {
	        parser.push('JSON.MGET');
	        parser.pushKeys(keys);
	        parser.push(path);
	    },
	    transformReply(reply) {
	        return reply.map(json => (0, generic_transformers_1.transformRedisJsonNullReply)(json));
	    }
	};
	
	return MGET$1;
}

var MSET = {};

var hasRequiredMSET;

function requireMSET () {
	if (hasRequiredMSET) return MSET;
	hasRequiredMSET = 1;
	Object.defineProperty(MSET, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	MSET.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Sets multiple JSON values in multiple documents.
	     * Returns OK on success.
	     *
	     * @param parser - The Redis command parser
	     * @param items - Array of objects containing key, path, and value to set
	     * @param items[].key - The key containing the JSON document
	     * @param items[].path - Path in the document to set
	     * @param items[].value - JSON value to set at the path
	     */
	    parseCommand(parser, items) {
	        parser.push('JSON.MSET');
	        for (let i = 0; i < items.length; i++) {
	            parser.pushKey(items[i].key);
	            parser.push(items[i].path, (0, generic_transformers_1.transformRedisJsonArgument)(items[i].value));
	        }
	    },
	    transformReply: undefined
	};
	
	return MSET;
}

var NUMINCRBY = {};

var hasRequiredNUMINCRBY;

function requireNUMINCRBY () {
	if (hasRequiredNUMINCRBY) return NUMINCRBY;
	hasRequiredNUMINCRBY = 1;
	Object.defineProperty(NUMINCRBY, "__esModule", { value: true });
	NUMINCRBY.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Increments a numeric value stored in a JSON document by a given number.
	     * Returns the value after increment, or null if the key/path doesn't exist or value is not numeric.
	     *
	     * @param parser - The Redis command parser
	     * @param key - The key containing the JSON document
	     * @param path - Path to the numeric value
	     * @param by - Amount to increment by
	     */
	    parseCommand(parser, key, path, by) {
	        parser.push('JSON.NUMINCRBY');
	        parser.pushKey(key);
	        parser.push(path, by.toString());
	    },
	    transformReply: {
	        2: (reply) => {
	            return JSON.parse(reply.toString());
	        },
	        3: undefined
	    }
	};
	
	return NUMINCRBY;
}

var NUMMULTBY = {};

var hasRequiredNUMMULTBY;

function requireNUMMULTBY () {
	if (hasRequiredNUMMULTBY) return NUMMULTBY;
	hasRequiredNUMMULTBY = 1;
	var __importDefault = (NUMMULTBY && NUMMULTBY.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(NUMMULTBY, "__esModule", { value: true });
	const NUMINCRBY_1 = __importDefault(requireNUMINCRBY());
	NUMMULTBY.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Multiplies a numeric value stored in a JSON document by a given number.
	     * Returns the value after multiplication, or null if the key/path doesn't exist or value is not numeric.
	     *
	     * @param parser - The Redis command parser
	     * @param key - The key containing the JSON document
	     * @param path - Path to the numeric value
	     * @param by - Amount to multiply by
	     */
	    parseCommand(parser, key, path, by) {
	        parser.push('JSON.NUMMULTBY');
	        parser.pushKey(key);
	        parser.push(path, by.toString());
	    },
	    transformReply: NUMINCRBY_1.default.transformReply
	};
	
	return NUMMULTBY;
}

var OBJKEYS = {};

var hasRequiredOBJKEYS;

function requireOBJKEYS () {
	if (hasRequiredOBJKEYS) return OBJKEYS;
	hasRequiredOBJKEYS = 1;
	Object.defineProperty(OBJKEYS, "__esModule", { value: true });
	OBJKEYS.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Returns the keys in the object stored in a JSON document.
	     * Returns array of keys, array of arrays for multiple paths, or null if path doesn't exist.
	     *
	     * @param parser - The Redis command parser
	     * @param key - The key containing the JSON document
	     * @param options - Optional parameters
	     * @param options.path - Path to the object to examine
	     */
	    parseCommand(parser, key, options) {
	        parser.push('JSON.OBJKEYS');
	        parser.pushKey(key);
	        if (options?.path !== undefined) {
	            parser.push(options.path);
	        }
	    },
	    transformReply: undefined
	};
	
	return OBJKEYS;
}

var OBJLEN = {};

var hasRequiredOBJLEN;

function requireOBJLEN () {
	if (hasRequiredOBJLEN) return OBJLEN;
	hasRequiredOBJLEN = 1;
	Object.defineProperty(OBJLEN, "__esModule", { value: true });
	OBJLEN.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Returns the number of keys in the object stored in a JSON document.
	     * Returns length of object, array of lengths for multiple paths, or null if path doesn't exist.
	     *
	     * @param parser - The Redis command parser
	     * @param key - The key containing the JSON document
	     * @param options - Optional parameters
	     * @param options.path - Path to the object to examine
	     */
	    parseCommand(parser, key, options) {
	        parser.push('JSON.OBJLEN');
	        parser.pushKey(key);
	        if (options?.path !== undefined) {
	            parser.push(options.path);
	        }
	    },
	    transformReply: undefined
	};
	
	return OBJLEN;
}

var SET = {};

var hasRequiredSET;

function requireSET () {
	if (hasRequiredSET) return SET;
	hasRequiredSET = 1;
	Object.defineProperty(SET, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	SET.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Sets a JSON value at a specific path in a JSON document.
	     * Returns OK on success, or null if condition (NX/XX) is not met.
	     *
	     * @param parser - The Redis command parser
	     * @param key - The key containing the JSON document
	     * @param path - Path in the document to set
	     * @param json - JSON value to set at the path
	     * @param options - Optional parameters
	     * @param options.condition - Set condition: NX (only if doesn't exist) or XX (only if exists)
	     * @deprecated options.NX - Use options.condition instead
	     * @deprecated options.XX - Use options.condition instead
	     */
	    parseCommand(parser, key, path, json, options) {
	        parser.push('JSON.SET');
	        parser.pushKey(key);
	        parser.push(path, (0, generic_transformers_1.transformRedisJsonArgument)(json));
	        if (options?.condition) {
	            parser.push(options?.condition);
	        }
	        else if (options?.NX) {
	            parser.push('NX');
	        }
	        else if (options?.XX) {
	            parser.push('XX');
	        }
	    },
	    transformReply: undefined
	};
	
	return SET;
}

var STRAPPEND = {};

var hasRequiredSTRAPPEND;

function requireSTRAPPEND () {
	if (hasRequiredSTRAPPEND) return STRAPPEND;
	hasRequiredSTRAPPEND = 1;
	Object.defineProperty(STRAPPEND, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	STRAPPEND.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Appends a string to a string value stored in a JSON document.
	     * Returns new string length after append, or null if the path doesn't exist or value is not a string.
	     *
	     * @param parser - The Redis command parser
	     * @param key - The key containing the JSON document
	     * @param append - String to append
	     * @param options - Optional parameters
	     * @param options.path - Path to the string value
	     */
	    parseCommand(parser, key, append, options) {
	        parser.push('JSON.STRAPPEND');
	        parser.pushKey(key);
	        if (options?.path !== undefined) {
	            parser.push(options.path);
	        }
	        parser.push((0, generic_transformers_1.transformRedisJsonArgument)(append));
	    },
	    transformReply: undefined
	};
	
	return STRAPPEND;
}

var STRLEN = {};

var hasRequiredSTRLEN;

function requireSTRLEN () {
	if (hasRequiredSTRLEN) return STRLEN;
	hasRequiredSTRLEN = 1;
	Object.defineProperty(STRLEN, "__esModule", { value: true });
	STRLEN.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Returns the length of a string value stored in a JSON document.
	     * Returns string length, array of lengths for multiple paths, or null if path doesn't exist.
	     *
	     * @param parser - The Redis command parser
	     * @param key - The key containing the JSON document
	     * @param options - Optional parameters
	     * @param options.path - Path to the string value
	     */
	    parseCommand(parser, key, options) {
	        parser.push('JSON.STRLEN');
	        parser.pushKey(key);
	        if (options?.path) {
	            parser.push(options.path);
	        }
	    },
	    transformReply: undefined
	};
	
	return STRLEN;
}

var TOGGLE = {};

var hasRequiredTOGGLE;

function requireTOGGLE () {
	if (hasRequiredTOGGLE) return TOGGLE;
	hasRequiredTOGGLE = 1;
	Object.defineProperty(TOGGLE, "__esModule", { value: true });
	TOGGLE.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Toggles a boolean value stored in a JSON document.
	     * Returns 1 if value was toggled to true, 0 if toggled to false, or null if path doesn't exist.
	     *
	     * @param parser - The Redis command parser
	     * @param key - The key containing the JSON document
	     * @param path - Path to the boolean value
	     */
	    parseCommand(parser, key, path) {
	        parser.push('JSON.TOGGLE');
	        parser.pushKey(key);
	        parser.push(path);
	    },
	    transformReply: undefined
	};
	
	return TOGGLE;
}

var TYPE = {};

var hasRequiredTYPE;

function requireTYPE () {
	if (hasRequiredTYPE) return TYPE;
	hasRequiredTYPE = 1;
	Object.defineProperty(TYPE, "__esModule", { value: true });
	TYPE.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Returns the type of JSON value at a specific path in a JSON document.
	     * Returns the type as a string, array of types for multiple paths, or null if path doesn't exist.
	     *
	     * @param parser - The Redis command parser
	     * @param key - The key containing the JSON document
	     * @param options - Optional parameters
	     * @param options.path - Path to examine
	     */
	    parseCommand(parser, key, options) {
	        parser.push('JSON.TYPE');
	        parser.pushKey(key);
	        if (options?.path) {
	            parser.push(options.path);
	        }
	    },
	    transformReply: {
	        2: undefined,
	        // TODO: RESP3 wraps the response in another array, but only returns 1 
	        3: (reply) => {
	            return reply[0];
	        }
	    },
	};
	
	return TYPE;
}

var hasRequiredCommands$2;

function requireCommands$2 () {
	if (hasRequiredCommands$2) return commands$2;
	hasRequiredCommands$2 = 1;
	(function (exports) {
		var __importDefault = (commands$2 && commands$2.__importDefault) || function (mod) {
		    return (mod && mod.__esModule) ? mod : { "default": mod };
		};
		Object.defineProperty(exports, "__esModule", { value: true });
		exports.transformRedisJsonNullReply = exports.transformRedisJsonReply = exports.transformRedisJsonArgument = void 0;
		const ARRAPPEND_1 = __importDefault(requireARRAPPEND());
		const ARRINDEX_1 = __importDefault(requireARRINDEX());
		const ARRINSERT_1 = __importDefault(requireARRINSERT());
		const ARRLEN_1 = __importDefault(requireARRLEN());
		const ARRPOP_1 = __importDefault(requireARRPOP());
		const ARRTRIM_1 = __importDefault(requireARRTRIM());
		const CLEAR_1 = __importDefault(requireCLEAR());
		const DEBUG_MEMORY_1 = __importDefault(requireDEBUG_MEMORY());
		const DEL_1 = __importDefault(requireDEL$1());
		const FORGET_1 = __importDefault(requireFORGET());
		const GET_1 = __importDefault(requireGET$1());
		const MERGE_1 = __importDefault(requireMERGE());
		const MGET_1 = __importDefault(requireMGET$1());
		const MSET_1 = __importDefault(requireMSET());
		const NUMINCRBY_1 = __importDefault(requireNUMINCRBY());
		const NUMMULTBY_1 = __importDefault(requireNUMMULTBY());
		const OBJKEYS_1 = __importDefault(requireOBJKEYS());
		const OBJLEN_1 = __importDefault(requireOBJLEN());
		// import RESP from './RESP';
		const SET_1 = __importDefault(requireSET());
		const STRAPPEND_1 = __importDefault(requireSTRAPPEND());
		const STRLEN_1 = __importDefault(requireSTRLEN());
		const TOGGLE_1 = __importDefault(requireTOGGLE());
		const TYPE_1 = __importDefault(requireTYPE());
		var generic_transformers_1 = requireGenericTransformers();
		Object.defineProperty(exports, "transformRedisJsonArgument", { enumerable: true, get: function () { return generic_transformers_1.transformRedisJsonArgument; } });
		Object.defineProperty(exports, "transformRedisJsonReply", { enumerable: true, get: function () { return generic_transformers_1.transformRedisJsonReply; } });
		Object.defineProperty(exports, "transformRedisJsonNullReply", { enumerable: true, get: function () { return generic_transformers_1.transformRedisJsonNullReply; } });
		exports.default = {
		    ARRAPPEND: ARRAPPEND_1.default,
		    arrAppend: ARRAPPEND_1.default,
		    ARRINDEX: ARRINDEX_1.default,
		    arrIndex: ARRINDEX_1.default,
		    ARRINSERT: ARRINSERT_1.default,
		    arrInsert: ARRINSERT_1.default,
		    ARRLEN: ARRLEN_1.default,
		    arrLen: ARRLEN_1.default,
		    ARRPOP: ARRPOP_1.default,
		    arrPop: ARRPOP_1.default,
		    ARRTRIM: ARRTRIM_1.default,
		    arrTrim: ARRTRIM_1.default,
		    CLEAR: CLEAR_1.default,
		    clear: CLEAR_1.default,
		    DEBUG_MEMORY: DEBUG_MEMORY_1.default,
		    debugMemory: DEBUG_MEMORY_1.default,
		    DEL: DEL_1.default,
		    del: DEL_1.default,
		    FORGET: FORGET_1.default,
		    forget: FORGET_1.default,
		    GET: GET_1.default,
		    get: GET_1.default,
		    MERGE: MERGE_1.default,
		    merge: MERGE_1.default,
		    MGET: MGET_1.default,
		    mGet: MGET_1.default,
		    MSET: MSET_1.default,
		    mSet: MSET_1.default,
		    NUMINCRBY: NUMINCRBY_1.default,
		    numIncrBy: NUMINCRBY_1.default,
		    /**
		     * @deprecated since JSON version 2.0
		     */
		    NUMMULTBY: NUMMULTBY_1.default,
		    /**
		     * @deprecated since JSON version 2.0
		     */
		    numMultBy: NUMMULTBY_1.default,
		    OBJKEYS: OBJKEYS_1.default,
		    objKeys: OBJKEYS_1.default,
		    OBJLEN: OBJLEN_1.default,
		    objLen: OBJLEN_1.default,
		    // RESP,
		    // resp: RESP,
		    SET: SET_1.default,
		    set: SET_1.default,
		    STRAPPEND: STRAPPEND_1.default,
		    strAppend: STRAPPEND_1.default,
		    STRLEN: STRLEN_1.default,
		    strLen: STRLEN_1.default,
		    TOGGLE: TOGGLE_1.default,
		    toggle: TOGGLE_1.default,
		    TYPE: TYPE_1.default,
		    type: TYPE_1.default
		};
		
	} (commands$2));
	return commands$2;
}

var hasRequiredLib$2;

function requireLib$2 () {
	if (hasRequiredLib$2) return lib$2;
	hasRequiredLib$2 = 1;
	(function (exports) {
		var __importDefault = (lib$2 && lib$2.__importDefault) || function (mod) {
		    return (mod && mod.__esModule) ? mod : { "default": mod };
		};
		Object.defineProperty(exports, "__esModule", { value: true });
		exports.default = void 0;
		var commands_1 = requireCommands$2();
		Object.defineProperty(exports, "default", { enumerable: true, get: function () { return __importDefault(commands_1).default; } });
		
	} (lib$2));
	return lib$2;
}

var lib$1 = {};

var commands$1 = {};

var _LIST = {};

var hasRequired_LIST;

function require_LIST () {
	if (hasRequired_LIST) return _LIST;
	hasRequired_LIST = 1;
	Object.defineProperty(_LIST, "__esModule", { value: true });
	_LIST.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Lists all existing indexes in the database.
	     * @param parser - The command parser
	     */
	    parseCommand(parser) {
	        parser.push('FT._LIST');
	    },
	    transformReply: {
	        2: undefined,
	        3: undefined
	    }
	};
	
	return _LIST;
}

var ALTER$1 = {};

var CREATE$1 = {};

var hasRequiredCREATE$1;

function requireCREATE$1 () {
	if (hasRequiredCREATE$1) return CREATE$1;
	hasRequiredCREATE$1 = 1;
	(function (exports) {
		Object.defineProperty(exports, "__esModule", { value: true });
		exports.REDISEARCH_LANGUAGE = exports.parseSchema = exports.SCHEMA_GEO_SHAPE_COORD_SYSTEM = exports.SCHEMA_VECTOR_FIELD_ALGORITHM = exports.SCHEMA_TEXT_FIELD_PHONETIC = exports.SCHEMA_FIELD_TYPE = void 0;
		const generic_transformers_1 = requireGenericTransformers();
		exports.SCHEMA_FIELD_TYPE = {
		    TEXT: 'TEXT',
		    NUMERIC: 'NUMERIC',
		    GEO: 'GEO',
		    TAG: 'TAG',
		    VECTOR: 'VECTOR',
		    GEOSHAPE: 'GEOSHAPE'
		};
		exports.SCHEMA_TEXT_FIELD_PHONETIC = {
		    DM_EN: 'dm:en',
		    DM_FR: 'dm:fr',
		    FM_PT: 'dm:pt',
		    DM_ES: 'dm:es'
		};
		exports.SCHEMA_VECTOR_FIELD_ALGORITHM = {
		    FLAT: 'FLAT',
		    HNSW: 'HNSW'
		};
		exports.SCHEMA_GEO_SHAPE_COORD_SYSTEM = {
		    SPHERICAL: 'SPHERICAL',
		    FLAT: 'FLAT'
		};
		function parseCommonSchemaFieldOptions(parser, fieldOptions) {
		    if (fieldOptions.SORTABLE) {
		        parser.push('SORTABLE');
		        if (fieldOptions.SORTABLE === 'UNF') {
		            parser.push('UNF');
		        }
		    }
		    if (fieldOptions.NOINDEX) {
		        parser.push('NOINDEX');
		    }
		}
		function parseSchema(parser, schema) {
		    for (const [field, fieldOptions] of Object.entries(schema)) {
		        parser.push(field);
		        if (typeof fieldOptions === 'string') {
		            parser.push(fieldOptions);
		            continue;
		        }
		        if (fieldOptions.AS) {
		            parser.push('AS', fieldOptions.AS);
		        }
		        parser.push(fieldOptions.type);
		        if (fieldOptions.INDEXMISSING) {
		            parser.push('INDEXMISSING');
		        }
		        switch (fieldOptions.type) {
		            case exports.SCHEMA_FIELD_TYPE.TEXT:
		                if (fieldOptions.NOSTEM) {
		                    parser.push('NOSTEM');
		                }
		                if (fieldOptions.WEIGHT) {
		                    parser.push('WEIGHT', fieldOptions.WEIGHT.toString());
		                }
		                if (fieldOptions.PHONETIC) {
		                    parser.push('PHONETIC', fieldOptions.PHONETIC);
		                }
		                if (fieldOptions.WITHSUFFIXTRIE) {
		                    parser.push('WITHSUFFIXTRIE');
		                }
		                if (fieldOptions.INDEXEMPTY) {
		                    parser.push('INDEXEMPTY');
		                }
		                parseCommonSchemaFieldOptions(parser, fieldOptions);
		                break;
		            case exports.SCHEMA_FIELD_TYPE.NUMERIC:
		            case exports.SCHEMA_FIELD_TYPE.GEO:
		                parseCommonSchemaFieldOptions(parser, fieldOptions);
		                break;
		            case exports.SCHEMA_FIELD_TYPE.TAG:
		                if (fieldOptions.SEPARATOR) {
		                    parser.push('SEPARATOR', fieldOptions.SEPARATOR);
		                }
		                if (fieldOptions.CASESENSITIVE) {
		                    parser.push('CASESENSITIVE');
		                }
		                if (fieldOptions.WITHSUFFIXTRIE) {
		                    parser.push('WITHSUFFIXTRIE');
		                }
		                if (fieldOptions.INDEXEMPTY) {
		                    parser.push('INDEXEMPTY');
		                }
		                parseCommonSchemaFieldOptions(parser, fieldOptions);
		                break;
		            case exports.SCHEMA_FIELD_TYPE.VECTOR:
		                parser.push(fieldOptions.ALGORITHM);
		                const args = [];
		                args.push('TYPE', fieldOptions.TYPE, 'DIM', fieldOptions.DIM.toString(), 'DISTANCE_METRIC', fieldOptions.DISTANCE_METRIC);
		                if (fieldOptions.INITIAL_CAP) {
		                    args.push('INITIAL_CAP', fieldOptions.INITIAL_CAP.toString());
		                }
		                switch (fieldOptions.ALGORITHM) {
		                    case exports.SCHEMA_VECTOR_FIELD_ALGORITHM.FLAT:
		                        if (fieldOptions.BLOCK_SIZE) {
		                            args.push('BLOCK_SIZE', fieldOptions.BLOCK_SIZE.toString());
		                        }
		                        break;
		                    case exports.SCHEMA_VECTOR_FIELD_ALGORITHM.HNSW:
		                        if (fieldOptions.M) {
		                            args.push('M', fieldOptions.M.toString());
		                        }
		                        if (fieldOptions.EF_CONSTRUCTION) {
		                            args.push('EF_CONSTRUCTION', fieldOptions.EF_CONSTRUCTION.toString());
		                        }
		                        if (fieldOptions.EF_RUNTIME) {
		                            args.push('EF_RUNTIME', fieldOptions.EF_RUNTIME.toString());
		                        }
		                        break;
		                }
		                parser.pushVariadicWithLength(args);
		                break;
		            case exports.SCHEMA_FIELD_TYPE.GEOSHAPE:
		                if (fieldOptions.COORD_SYSTEM !== undefined) {
		                    parser.push('COORD_SYSTEM', fieldOptions.COORD_SYSTEM);
		                }
		                break;
		        }
		    }
		}
		exports.parseSchema = parseSchema;
		exports.REDISEARCH_LANGUAGE = {
		    ARABIC: 'Arabic',
		    BASQUE: 'Basque',
		    CATALANA: 'Catalan',
		    DANISH: 'Danish',
		    DUTCH: 'Dutch',
		    ENGLISH: 'English',
		    FINNISH: 'Finnish',
		    FRENCH: 'French',
		    GERMAN: 'German',
		    GREEK: 'Greek',
		    HUNGARIAN: 'Hungarian',
		    INDONESAIN: 'Indonesian',
		    IRISH: 'Irish',
		    ITALIAN: 'Italian',
		    LITHUANIAN: 'Lithuanian',
		    NEPALI: 'Nepali',
		    NORWEIGAN: 'Norwegian',
		    PORTUGUESE: 'Portuguese',
		    ROMANIAN: 'Romanian',
		    RUSSIAN: 'Russian',
		    SPANISH: 'Spanish',
		    SWEDISH: 'Swedish',
		    TAMIL: 'Tamil',
		    TURKISH: 'Turkish',
		    CHINESE: 'Chinese'
		};
		exports.default = {
		    NOT_KEYED_COMMAND: true,
		    IS_READ_ONLY: true,
		    /**
		     * Creates a new search index with the given schema and options.
		     * @param parser - The command parser
		     * @param index - Name of the index to create
		     * @param schema - Index schema defining field names and types (TEXT, NUMERIC, GEO, TAG, VECTOR, GEOSHAPE)
		     * @param options - Optional parameters:
		     *   - ON: Type of container to index (HASH or JSON)
		     *   - PREFIX: Prefixes for document keys to index
		     *   - FILTER: Expression that filters indexed documents
		     *   - LANGUAGE/LANGUAGE_FIELD: Default language for indexing
		     *   - SCORE/SCORE_FIELD: Document ranking parameters
		     *   - MAXTEXTFIELDS: Index all text fields without specifying them
		     *   - TEMPORARY: Create a temporary index
		     *   - NOOFFSETS/NOHL/NOFIELDS/NOFREQS: Index optimization flags
		     *   - STOPWORDS: Custom stopword list
		     */
		    parseCommand(parser, index, schema, options) {
		        parser.push('FT.CREATE', index);
		        if (options?.ON) {
		            parser.push('ON', options.ON);
		        }
		        (0, generic_transformers_1.parseOptionalVariadicArgument)(parser, 'PREFIX', options?.PREFIX);
		        if (options?.FILTER) {
		            parser.push('FILTER', options.FILTER);
		        }
		        if (options?.LANGUAGE) {
		            parser.push('LANGUAGE', options.LANGUAGE);
		        }
		        if (options?.LANGUAGE_FIELD) {
		            parser.push('LANGUAGE_FIELD', options.LANGUAGE_FIELD);
		        }
		        if (options?.SCORE) {
		            parser.push('SCORE', options.SCORE.toString());
		        }
		        if (options?.SCORE_FIELD) {
		            parser.push('SCORE_FIELD', options.SCORE_FIELD);
		        }
		        // if (options?.PAYLOAD_FIELD) {
		        //     parser.push('PAYLOAD_FIELD', options.PAYLOAD_FIELD);
		        // }
		        if (options?.MAXTEXTFIELDS) {
		            parser.push('MAXTEXTFIELDS');
		        }
		        if (options?.TEMPORARY) {
		            parser.push('TEMPORARY', options.TEMPORARY.toString());
		        }
		        if (options?.NOOFFSETS) {
		            parser.push('NOOFFSETS');
		        }
		        if (options?.NOHL) {
		            parser.push('NOHL');
		        }
		        if (options?.NOFIELDS) {
		            parser.push('NOFIELDS');
		        }
		        if (options?.NOFREQS) {
		            parser.push('NOFREQS');
		        }
		        if (options?.SKIPINITIALSCAN) {
		            parser.push('SKIPINITIALSCAN');
		        }
		        (0, generic_transformers_1.parseOptionalVariadicArgument)(parser, 'STOPWORDS', options?.STOPWORDS);
		        parser.push('SCHEMA');
		        parseSchema(parser, schema);
		    },
		    transformReply: undefined
		};
		
	} (CREATE$1));
	return CREATE$1;
}

var hasRequiredALTER$1;

function requireALTER$1 () {
	if (hasRequiredALTER$1) return ALTER$1;
	hasRequiredALTER$1 = 1;
	Object.defineProperty(ALTER$1, "__esModule", { value: true });
	const CREATE_1 = requireCREATE$1();
	ALTER$1.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Alters an existing RediSearch index schema by adding new fields.
	     * @param parser - The command parser
	     * @param index - The index to alter
	     * @param schema - The schema definition containing new fields to add
	     */
	    parseCommand(parser, index, schema) {
	        parser.push('FT.ALTER', index, 'SCHEMA', 'ADD');
	        (0, CREATE_1.parseSchema)(parser, schema);
	    },
	    transformReply: undefined
	};
	
	return ALTER$1;
}

var AGGREGATE_WITHCURSOR = {};

var AGGREGATE = {};

var SEARCH = {};

var _default = {};

var hasRequired_default;

function require_default () {
	if (hasRequired_default) return _default;
	hasRequired_default = 1;
	Object.defineProperty(_default, "__esModule", { value: true });
	_default.DEFAULT_DIALECT = void 0;
	_default.DEFAULT_DIALECT = '2';
	
	return _default;
}

var hasRequiredSEARCH;

function requireSEARCH () {
	if (hasRequiredSEARCH) return SEARCH;
	hasRequiredSEARCH = 1;
	Object.defineProperty(SEARCH, "__esModule", { value: true });
	SEARCH.parseSearchOptions = SEARCH.parseParamsArgument = void 0;
	const generic_transformers_1 = requireGenericTransformers();
	const default_1 = require_default();
	function parseParamsArgument(parser, params) {
	    if (params) {
	        parser.push('PARAMS');
	        const args = [];
	        for (const key in params) {
	            if (!Object.hasOwn(params, key))
	                continue;
	            const value = params[key];
	            args.push(key, typeof value === 'number' ? value.toString() : value);
	        }
	        parser.pushVariadicWithLength(args);
	    }
	}
	SEARCH.parseParamsArgument = parseParamsArgument;
	function parseSearchOptions(parser, options) {
	    if (options?.VERBATIM) {
	        parser.push('VERBATIM');
	    }
	    if (options?.NOSTOPWORDS) {
	        parser.push('NOSTOPWORDS');
	    }
	    (0, generic_transformers_1.parseOptionalVariadicArgument)(parser, 'INKEYS', options?.INKEYS);
	    (0, generic_transformers_1.parseOptionalVariadicArgument)(parser, 'INFIELDS', options?.INFIELDS);
	    (0, generic_transformers_1.parseOptionalVariadicArgument)(parser, 'RETURN', options?.RETURN);
	    if (options?.SUMMARIZE) {
	        parser.push('SUMMARIZE');
	        if (typeof options.SUMMARIZE === 'object') {
	            (0, generic_transformers_1.parseOptionalVariadicArgument)(parser, 'FIELDS', options.SUMMARIZE.FIELDS);
	            if (options.SUMMARIZE.FRAGS !== undefined) {
	                parser.push('FRAGS', options.SUMMARIZE.FRAGS.toString());
	            }
	            if (options.SUMMARIZE.LEN !== undefined) {
	                parser.push('LEN', options.SUMMARIZE.LEN.toString());
	            }
	            if (options.SUMMARIZE.SEPARATOR !== undefined) {
	                parser.push('SEPARATOR', options.SUMMARIZE.SEPARATOR);
	            }
	        }
	    }
	    if (options?.HIGHLIGHT) {
	        parser.push('HIGHLIGHT');
	        if (typeof options.HIGHLIGHT === 'object') {
	            (0, generic_transformers_1.parseOptionalVariadicArgument)(parser, 'FIELDS', options.HIGHLIGHT.FIELDS);
	            if (options.HIGHLIGHT.TAGS) {
	                parser.push('TAGS', options.HIGHLIGHT.TAGS.open, options.HIGHLIGHT.TAGS.close);
	            }
	        }
	    }
	    if (options?.SLOP !== undefined) {
	        parser.push('SLOP', options.SLOP.toString());
	    }
	    if (options?.TIMEOUT !== undefined) {
	        parser.push('TIMEOUT', options.TIMEOUT.toString());
	    }
	    if (options?.INORDER) {
	        parser.push('INORDER');
	    }
	    if (options?.LANGUAGE) {
	        parser.push('LANGUAGE', options.LANGUAGE);
	    }
	    if (options?.EXPANDER) {
	        parser.push('EXPANDER', options.EXPANDER);
	    }
	    if (options?.SCORER) {
	        parser.push('SCORER', options.SCORER);
	    }
	    if (options?.SORTBY) {
	        parser.push('SORTBY');
	        if (typeof options.SORTBY === 'string' || options.SORTBY instanceof Buffer) {
	            parser.push(options.SORTBY);
	        }
	        else {
	            parser.push(options.SORTBY.BY);
	            if (options.SORTBY.DIRECTION) {
	                parser.push(options.SORTBY.DIRECTION);
	            }
	        }
	    }
	    if (options?.LIMIT) {
	        parser.push('LIMIT', options.LIMIT.from.toString(), options.LIMIT.size.toString());
	    }
	    parseParamsArgument(parser, options?.PARAMS);
	    if (options?.DIALECT) {
	        parser.push('DIALECT', options.DIALECT.toString());
	    }
	    else {
	        parser.push('DIALECT', default_1.DEFAULT_DIALECT);
	    }
	}
	SEARCH.parseSearchOptions = parseSearchOptions;
	SEARCH.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Searches a RediSearch index with the given query.
	     * @param parser - The command parser
	     * @param index - The index name to search
	     * @param query - The text query to search. For syntax, see https://redis.io/docs/stack/search/reference/query_syntax
	     * @param options - Optional search parameters including:
	     *   - VERBATIM: do not try to use stemming for query expansion
	     *   - NOSTOPWORDS: do not filter stopwords from the query
	     *   - INKEYS/INFIELDS: restrict the search to specific keys/fields
	     *   - RETURN: limit which fields are returned
	     *   - SUMMARIZE/HIGHLIGHT: create search result highlights
	     *   - LIMIT: pagination control
	     *   - SORTBY: sort results by a specific field
	     *   - PARAMS: bind parameters to the query
	     */
	    parseCommand(parser, index, query, options) {
	        parser.push('FT.SEARCH', index, query);
	        parseSearchOptions(parser, options);
	    },
	    transformReply: {
	        2: (reply) => {
	            const withoutDocuments = (reply[0] + 1 == reply.length);
	            const documents = [];
	            let i = 1;
	            while (i < reply.length) {
	                documents.push({
	                    id: reply[i++],
	                    value: withoutDocuments ? Object.create(null) : documentValue(reply[i++])
	                });
	            }
	            return {
	                total: reply[0],
	                documents
	            };
	        },
	        3: undefined
	    },
	    unstableResp3: true
	};
	function documentValue(tuples) {
	    const message = Object.create(null);
	    if (!tuples) {
	        return message;
	    }
	    let i = 0;
	    while (i < tuples.length) {
	        const key = tuples[i++], value = tuples[i++];
	        if (key === '$') { // might be a JSON reply
	            try {
	                Object.assign(message, JSON.parse(value));
	                continue;
	            }
	            catch {
	                // set as a regular property if not a valid JSON
	            }
	        }
	        message[key] = value;
	    }
	    return message;
	}
	
	return SEARCH;
}

var hasRequiredAGGREGATE;

function requireAGGREGATE () {
	if (hasRequiredAGGREGATE) return AGGREGATE;
	hasRequiredAGGREGATE = 1;
	(function (exports) {
		Object.defineProperty(exports, "__esModule", { value: true });
		exports.parseAggregateOptions = exports.FT_AGGREGATE_GROUP_BY_REDUCERS = exports.FT_AGGREGATE_STEPS = void 0;
		const SEARCH_1 = requireSEARCH();
		const generic_transformers_1 = requireGenericTransformers();
		const default_1 = require_default();
		exports.FT_AGGREGATE_STEPS = {
		    GROUPBY: 'GROUPBY',
		    SORTBY: 'SORTBY',
		    APPLY: 'APPLY',
		    LIMIT: 'LIMIT',
		    FILTER: 'FILTER'
		};
		exports.FT_AGGREGATE_GROUP_BY_REDUCERS = {
		    COUNT: 'COUNT',
		    COUNT_DISTINCT: 'COUNT_DISTINCT',
		    COUNT_DISTINCTISH: 'COUNT_DISTINCTISH',
		    SUM: 'SUM',
		    MIN: 'MIN',
		    MAX: 'MAX',
		    AVG: 'AVG',
		    STDDEV: 'STDDEV',
		    QUANTILE: 'QUANTILE',
		    TOLIST: 'TOLIST',
		    FIRST_VALUE: 'FIRST_VALUE',
		    RANDOM_SAMPLE: 'RANDOM_SAMPLE'
		};
		exports.default = {
		    NOT_KEYED_COMMAND: true,
		    IS_READ_ONLY: false,
		    /**
		     * Performs an aggregation query on a RediSearch index.
		     * @param parser - The command parser
		     * @param index - The index name to query
		     * @param query - The text query to use as filter, use * to indicate no filtering
		     * @param options - Optional parameters for aggregation:
		     *   - VERBATIM: disable stemming in query evaluation
		     *   - LOAD: specify fields to load from documents
		     *   - STEPS: sequence of aggregation steps (GROUPBY, SORTBY, APPLY, LIMIT, FILTER)
		     *   - PARAMS: bind parameters for query evaluation
		     *   - TIMEOUT: maximum time to run the query
		     */
		    parseCommand(parser, index, query, options) {
		        parser.push('FT.AGGREGATE', index, query);
		        return parseAggregateOptions(parser, options);
		    },
		    transformReply: {
		        2: (rawReply, preserve, typeMapping) => {
		            const results = [];
		            for (let i = 1; i < rawReply.length; i++) {
		                results.push((0, generic_transformers_1.transformTuplesReply)(rawReply[i], preserve, typeMapping));
		            }
		            return {
		                //  https://redis.io/docs/latest/commands/ft.aggregate/#return
		                //  FT.AGGREGATE returns an array reply where each row is an array reply and represents a single aggregate result.
		                // The integer reply at position 1 does not represent a valid value.
		                total: Number(rawReply[0]),
		                results
		            };
		        },
		        3: undefined
		    },
		    unstableResp3: true
		};
		function parseAggregateOptions(parser, options) {
		    if (options?.VERBATIM) {
		        parser.push('VERBATIM');
		    }
		    if (options?.ADDSCORES) {
		        parser.push('ADDSCORES');
		    }
		    if (options?.LOAD) {
		        const args = [];
		        if (Array.isArray(options.LOAD)) {
		            for (const load of options.LOAD) {
		                pushLoadField(args, load);
		            }
		        }
		        else {
		            pushLoadField(args, options.LOAD);
		        }
		        parser.push('LOAD');
		        parser.pushVariadicWithLength(args);
		    }
		    if (options?.TIMEOUT !== undefined) {
		        parser.push('TIMEOUT', options.TIMEOUT.toString());
		    }
		    if (options?.STEPS) {
		        for (const step of options.STEPS) {
		            parser.push(step.type);
		            switch (step.type) {
		                case exports.FT_AGGREGATE_STEPS.GROUPBY:
		                    if (!step.properties) {
		                        parser.push('0');
		                    }
		                    else {
		                        parser.pushVariadicWithLength(step.properties);
		                    }
		                    if (Array.isArray(step.REDUCE)) {
		                        for (const reducer of step.REDUCE) {
		                            parseGroupByReducer(parser, reducer);
		                        }
		                    }
		                    else {
		                        parseGroupByReducer(parser, step.REDUCE);
		                    }
		                    break;
		                case exports.FT_AGGREGATE_STEPS.SORTBY:
		                    const args = [];
		                    if (Array.isArray(step.BY)) {
		                        for (const by of step.BY) {
		                            pushSortByProperty(args, by);
		                        }
		                    }
		                    else {
		                        pushSortByProperty(args, step.BY);
		                    }
		                    if (step.MAX) {
		                        args.push('MAX', step.MAX.toString());
		                    }
		                    parser.pushVariadicWithLength(args);
		                    break;
		                case exports.FT_AGGREGATE_STEPS.APPLY:
		                    parser.push(step.expression, 'AS', step.AS);
		                    break;
		                case exports.FT_AGGREGATE_STEPS.LIMIT:
		                    parser.push(step.from.toString(), step.size.toString());
		                    break;
		                case exports.FT_AGGREGATE_STEPS.FILTER:
		                    parser.push(step.expression);
		                    break;
		            }
		        }
		    }
		    (0, SEARCH_1.parseParamsArgument)(parser, options?.PARAMS);
		    if (options?.DIALECT) {
		        parser.push('DIALECT', options.DIALECT.toString());
		    }
		    else {
		        parser.push('DIALECT', default_1.DEFAULT_DIALECT);
		    }
		}
		exports.parseAggregateOptions = parseAggregateOptions;
		function pushLoadField(args, toLoad) {
		    if (typeof toLoad === 'string' || toLoad instanceof Buffer) {
		        args.push(toLoad);
		    }
		    else {
		        args.push(toLoad.identifier);
		        if (toLoad.AS) {
		            args.push('AS', toLoad.AS);
		        }
		    }
		}
		function parseGroupByReducer(parser, reducer) {
		    parser.push('REDUCE', reducer.type);
		    switch (reducer.type) {
		        case exports.FT_AGGREGATE_GROUP_BY_REDUCERS.COUNT:
		            parser.push('0');
		            break;
		        case exports.FT_AGGREGATE_GROUP_BY_REDUCERS.COUNT_DISTINCT:
		        case exports.FT_AGGREGATE_GROUP_BY_REDUCERS.COUNT_DISTINCTISH:
		        case exports.FT_AGGREGATE_GROUP_BY_REDUCERS.SUM:
		        case exports.FT_AGGREGATE_GROUP_BY_REDUCERS.MIN:
		        case exports.FT_AGGREGATE_GROUP_BY_REDUCERS.MAX:
		        case exports.FT_AGGREGATE_GROUP_BY_REDUCERS.AVG:
		        case exports.FT_AGGREGATE_GROUP_BY_REDUCERS.STDDEV:
		        case exports.FT_AGGREGATE_GROUP_BY_REDUCERS.TOLIST:
		            parser.push('1', reducer.property);
		            break;
		        case exports.FT_AGGREGATE_GROUP_BY_REDUCERS.QUANTILE:
		            parser.push('2', reducer.property, reducer.quantile.toString());
		            break;
		        case exports.FT_AGGREGATE_GROUP_BY_REDUCERS.FIRST_VALUE: {
		            const args = [reducer.property];
		            if (reducer.BY) {
		                args.push('BY');
		                if (typeof reducer.BY === 'string' || reducer.BY instanceof Buffer) {
		                    args.push(reducer.BY);
		                }
		                else {
		                    args.push(reducer.BY.property);
		                    if (reducer.BY.direction) {
		                        args.push(reducer.BY.direction);
		                    }
		                }
		            }
		            parser.pushVariadicWithLength(args);
		            break;
		        }
		        case exports.FT_AGGREGATE_GROUP_BY_REDUCERS.RANDOM_SAMPLE:
		            parser.push('2', reducer.property, reducer.sampleSize.toString());
		            break;
		    }
		    if (reducer.AS) {
		        parser.push('AS', reducer.AS);
		    }
		}
		function pushSortByProperty(args, sortBy) {
		    if (typeof sortBy === 'string' || sortBy instanceof Buffer) {
		        args.push(sortBy);
		    }
		    else {
		        args.push(sortBy.BY);
		        if (sortBy.DIRECTION) {
		            args.push(sortBy.DIRECTION);
		        }
		    }
		}
		
	} (AGGREGATE));
	return AGGREGATE;
}

var hasRequiredAGGREGATE_WITHCURSOR;

function requireAGGREGATE_WITHCURSOR () {
	if (hasRequiredAGGREGATE_WITHCURSOR) return AGGREGATE_WITHCURSOR;
	hasRequiredAGGREGATE_WITHCURSOR = 1;
	var __importDefault = (AGGREGATE_WITHCURSOR && AGGREGATE_WITHCURSOR.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(AGGREGATE_WITHCURSOR, "__esModule", { value: true });
	const AGGREGATE_1 = __importDefault(requireAGGREGATE());
	AGGREGATE_WITHCURSOR.default = {
	    IS_READ_ONLY: AGGREGATE_1.default.IS_READ_ONLY,
	    /**
	     * Performs an aggregation with a cursor for retrieving large result sets.
	     * @param parser - The command parser
	     * @param index - Name of the index to query
	     * @param query - The aggregation query
	     * @param options - Optional parameters:
	     *   - All options supported by FT.AGGREGATE
	     *   - COUNT: Number of results to return per cursor fetch
	     *   - MAXIDLE: Maximum idle time for cursor in milliseconds
	     */
	    parseCommand(parser, index, query, options) {
	        AGGREGATE_1.default.parseCommand(parser, index, query, options);
	        parser.push('WITHCURSOR');
	        if (options?.COUNT !== undefined) {
	            parser.push('COUNT', options.COUNT.toString());
	        }
	        if (options?.MAXIDLE !== undefined) {
	            parser.push('MAXIDLE', options.MAXIDLE.toString());
	        }
	    },
	    transformReply: {
	        2: (reply) => {
	            return {
	                ...AGGREGATE_1.default.transformReply[2](reply[0]),
	                cursor: reply[1]
	            };
	        },
	        3: undefined
	    },
	    unstableResp3: true
	};
	
	return AGGREGATE_WITHCURSOR;
}

var ALIASADD = {};

var hasRequiredALIASADD;

function requireALIASADD () {
	if (hasRequiredALIASADD) return ALIASADD;
	hasRequiredALIASADD = 1;
	Object.defineProperty(ALIASADD, "__esModule", { value: true });
	ALIASADD.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Adds an alias to a RediSearch index.
	     * @param parser - The command parser
	     * @param alias - The alias to add
	     * @param index - The index name to alias
	     */
	    parseCommand(parser, alias, index) {
	        parser.push('FT.ALIASADD', alias, index);
	    },
	    transformReply: undefined
	};
	
	return ALIASADD;
}

var ALIASDEL = {};

var hasRequiredALIASDEL;

function requireALIASDEL () {
	if (hasRequiredALIASDEL) return ALIASDEL;
	hasRequiredALIASDEL = 1;
	Object.defineProperty(ALIASDEL, "__esModule", { value: true });
	ALIASDEL.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Removes an existing alias from a RediSearch index.
	     * @param parser - The command parser
	     * @param alias - The alias to remove
	     */
	    parseCommand(parser, alias) {
	        parser.push('FT.ALIASDEL', alias);
	    },
	    transformReply: undefined
	};
	
	return ALIASDEL;
}

var ALIASUPDATE = {};

var hasRequiredALIASUPDATE;

function requireALIASUPDATE () {
	if (hasRequiredALIASUPDATE) return ALIASUPDATE;
	hasRequiredALIASUPDATE = 1;
	Object.defineProperty(ALIASUPDATE, "__esModule", { value: true });
	ALIASUPDATE.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Updates the index pointed to by an existing alias.
	     * @param parser - The command parser
	     * @param alias - The existing alias to update
	     * @param index - The new index name that the alias should point to
	     */
	    parseCommand(parser, alias, index) {
	        parser.push('FT.ALIASUPDATE', alias, index);
	    },
	    transformReply: undefined
	};
	
	return ALIASUPDATE;
}

var CONFIG_GET = {};

var hasRequiredCONFIG_GET;

function requireCONFIG_GET () {
	if (hasRequiredCONFIG_GET) return CONFIG_GET;
	hasRequiredCONFIG_GET = 1;
	Object.defineProperty(CONFIG_GET, "__esModule", { value: true });
	CONFIG_GET.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Gets a RediSearch configuration option value.
	     * @param parser - The command parser
	     * @param option - The name of the configuration option to retrieve
	     */
	    parseCommand(parser, option) {
	        parser.push('FT.CONFIG', 'GET', option);
	    },
	    transformReply(reply) {
	        const transformedReply = Object.create(null);
	        for (const item of reply) {
	            const [key, value] = item;
	            transformedReply[key.toString()] = value;
	        }
	        return transformedReply;
	    }
	};
	
	return CONFIG_GET;
}

var CONFIG_SET = {};

var hasRequiredCONFIG_SET;

function requireCONFIG_SET () {
	if (hasRequiredCONFIG_SET) return CONFIG_SET;
	hasRequiredCONFIG_SET = 1;
	Object.defineProperty(CONFIG_SET, "__esModule", { value: true });
	CONFIG_SET.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Sets a RediSearch configuration option value.
	     * @param parser - The command parser
	     * @param property - The name of the configuration option to set
	     * @param value - The value to set for the configuration option
	     */
	    parseCommand(parser, property, value) {
	        parser.push('FT.CONFIG', 'SET', property, value);
	    },
	    transformReply: undefined
	};
	
	return CONFIG_SET;
}

var CURSOR_DEL = {};

var hasRequiredCURSOR_DEL;

function requireCURSOR_DEL () {
	if (hasRequiredCURSOR_DEL) return CURSOR_DEL;
	hasRequiredCURSOR_DEL = 1;
	Object.defineProperty(CURSOR_DEL, "__esModule", { value: true });
	CURSOR_DEL.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Deletes a cursor from an index.
	     * @param parser - The command parser
	     * @param index - The index name that contains the cursor
	     * @param cursorId - The cursor ID to delete
	     */
	    parseCommand(parser, index, cursorId) {
	        parser.push('FT.CURSOR', 'DEL', index, cursorId.toString());
	    },
	    transformReply: undefined
	};
	
	return CURSOR_DEL;
}

var CURSOR_READ = {};

var hasRequiredCURSOR_READ;

function requireCURSOR_READ () {
	if (hasRequiredCURSOR_READ) return CURSOR_READ;
	hasRequiredCURSOR_READ = 1;
	var __importDefault = (CURSOR_READ && CURSOR_READ.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(CURSOR_READ, "__esModule", { value: true });
	const AGGREGATE_WITHCURSOR_1 = __importDefault(requireAGGREGATE_WITHCURSOR());
	CURSOR_READ.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Reads from an existing cursor to get more results from an index.
	     * @param parser - The command parser
	     * @param index - The index name that contains the cursor
	     * @param cursor - The cursor ID to read from
	     * @param options - Optional parameters:
	     *   - COUNT: Maximum number of results to return
	     */
	    parseCommand(parser, index, cursor, options) {
	        parser.push('FT.CURSOR', 'READ', index, cursor.toString());
	        if (options?.COUNT !== undefined) {
	            parser.push('COUNT', options.COUNT.toString());
	        }
	    },
	    transformReply: AGGREGATE_WITHCURSOR_1.default.transformReply,
	    unstableResp3: true
	};
	
	return CURSOR_READ;
}

var DICTADD = {};

var hasRequiredDICTADD;

function requireDICTADD () {
	if (hasRequiredDICTADD) return DICTADD;
	hasRequiredDICTADD = 1;
	Object.defineProperty(DICTADD, "__esModule", { value: true });
	DICTADD.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Adds terms to a dictionary.
	     * @param parser - The command parser
	     * @param dictionary - Name of the dictionary to add terms to
	     * @param term - One or more terms to add to the dictionary
	     */
	    parseCommand(parser, dictionary, term) {
	        parser.push('FT.DICTADD', dictionary);
	        parser.pushVariadic(term);
	    },
	    transformReply: undefined
	};
	
	return DICTADD;
}

var DICTDEL = {};

var hasRequiredDICTDEL;

function requireDICTDEL () {
	if (hasRequiredDICTDEL) return DICTDEL;
	hasRequiredDICTDEL = 1;
	Object.defineProperty(DICTDEL, "__esModule", { value: true });
	DICTDEL.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Deletes terms from a dictionary.
	     * @param parser - The command parser
	     * @param dictionary - Name of the dictionary to remove terms from
	     * @param term - One or more terms to delete from the dictionary
	     */
	    parseCommand(parser, dictionary, term) {
	        parser.push('FT.DICTDEL', dictionary);
	        parser.pushVariadic(term);
	    },
	    transformReply: undefined
	};
	
	return DICTDEL;
}

var DICTDUMP = {};

var hasRequiredDICTDUMP;

function requireDICTDUMP () {
	if (hasRequiredDICTDUMP) return DICTDUMP;
	hasRequiredDICTDUMP = 1;
	Object.defineProperty(DICTDUMP, "__esModule", { value: true });
	DICTDUMP.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Returns all terms in a dictionary.
	     * @param parser - The command parser
	     * @param dictionary - Name of the dictionary to dump
	     */
	    parseCommand(parser, dictionary) {
	        parser.push('FT.DICTDUMP', dictionary);
	    },
	    transformReply: {
	        2: undefined,
	        3: undefined
	    }
	};
	
	return DICTDUMP;
}

var DROPINDEX = {};

var hasRequiredDROPINDEX;

function requireDROPINDEX () {
	if (hasRequiredDROPINDEX) return DROPINDEX;
	hasRequiredDROPINDEX = 1;
	Object.defineProperty(DROPINDEX, "__esModule", { value: true });
	DROPINDEX.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Deletes an index and all associated documents.
	     * @param parser - The command parser
	     * @param index - Name of the index to delete
	     * @param options - Optional parameters:
	     *   - DD: Also delete the indexed documents themselves
	     */
	    parseCommand(parser, index, options) {
	        parser.push('FT.DROPINDEX', index);
	        if (options?.DD) {
	            parser.push('DD');
	        }
	    },
	    transformReply: {
	        2: undefined,
	        3: undefined
	    }
	};
	
	return DROPINDEX;
}

var EXPLAIN = {};

var hasRequiredEXPLAIN;

function requireEXPLAIN () {
	if (hasRequiredEXPLAIN) return EXPLAIN;
	hasRequiredEXPLAIN = 1;
	Object.defineProperty(EXPLAIN, "__esModule", { value: true });
	const SEARCH_1 = requireSEARCH();
	const default_1 = require_default();
	EXPLAIN.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Returns the execution plan for a complex query.
	     * @param parser - The command parser
	     * @param index - Name of the index to explain query against
	     * @param query - The query string to explain
	     * @param options - Optional parameters:
	     *   - PARAMS: Named parameters to use in the query
	     *   - DIALECT: Version of query dialect to use (defaults to 1)
	     */
	    parseCommand(parser, index, query, options) {
	        parser.push('FT.EXPLAIN', index, query);
	        (0, SEARCH_1.parseParamsArgument)(parser, options?.PARAMS);
	        if (options?.DIALECT) {
	            parser.push('DIALECT', options.DIALECT.toString());
	        }
	        else {
	            parser.push('DIALECT', default_1.DEFAULT_DIALECT);
	        }
	    },
	    transformReply: undefined
	};
	
	return EXPLAIN;
}

var EXPLAINCLI = {};

var hasRequiredEXPLAINCLI;

function requireEXPLAINCLI () {
	if (hasRequiredEXPLAINCLI) return EXPLAINCLI;
	hasRequiredEXPLAINCLI = 1;
	Object.defineProperty(EXPLAINCLI, "__esModule", { value: true });
	const default_1 = require_default();
	EXPLAINCLI.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Returns the execution plan for a complex query in a more verbose format than FT.EXPLAIN.
	     * @param parser - The command parser
	     * @param index - Name of the index to explain query against
	     * @param query - The query string to explain
	     * @param options - Optional parameters:
	     *   - DIALECT: Version of query dialect to use (defaults to 1)
	     */
	    parseCommand(parser, index, query, options) {
	        parser.push('FT.EXPLAINCLI', index, query);
	        if (options?.DIALECT) {
	            parser.push('DIALECT', options.DIALECT.toString());
	        }
	        else {
	            parser.push('DIALECT', default_1.DEFAULT_DIALECT);
	        }
	    },
	    transformReply: undefined
	};
	
	return EXPLAINCLI;
}

var INFO$1 = {};

var hasRequiredINFO$1;

function requireINFO$1 () {
	if (hasRequiredINFO$1) return INFO$1;
	hasRequiredINFO$1 = 1;
	Object.defineProperty(INFO$1, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	INFO$1.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Returns information and statistics about an index.
	     * @param parser - The command parser
	     * @param index - Name of the index to get information about
	     */
	    parseCommand(parser, index) {
	        parser.push('FT.INFO', index);
	    },
	    transformReply: {
	        2: transformV2Reply,
	        3: undefined
	    },
	    unstableResp3: true
	};
	function transformV2Reply(reply, preserve, typeMapping) {
	    const myTransformFunc = (0, generic_transformers_1.createTransformTuplesReplyFunc)(preserve, typeMapping);
	    const ret = {};
	    for (let i = 0; i < reply.length; i += 2) {
	        const key = reply[i].toString();
	        switch (key) {
	            case 'index_name':
	            case 'index_options':
	            case 'num_docs':
	            case 'max_doc_id':
	            case 'num_terms':
	            case 'num_records':
	            case 'total_inverted_index_blocks':
	            case 'hash_indexing_failures':
	            case 'indexing':
	            case 'number_of_uses':
	            case 'cleaning':
	            case 'stopwords_list':
	                ret[key] = reply[i + 1];
	                break;
	            case 'inverted_sz_mb':
	            case 'vector_index_sz_mb':
	            case 'offset_vectors_sz_mb':
	            case 'doc_table_size_mb':
	            case 'sortable_values_size_mb':
	            case 'key_table_size_mb':
	            case 'text_overhead_sz_mb':
	            case 'tag_overhead_sz_mb':
	            case 'total_index_memory_sz_mb':
	            case 'geoshapes_sz_mb':
	            case 'records_per_doc_avg':
	            case 'bytes_per_record_avg':
	            case 'offsets_per_term_avg':
	            case 'offset_bits_per_record_avg':
	            case 'total_indexing_time':
	            case 'percent_indexed':
	                ret[key] = generic_transformers_1.transformDoubleReply[2](reply[i + 1], undefined, typeMapping);
	                break;
	            case 'index_definition':
	                ret[key] = myTransformFunc(reply[i + 1]);
	                break;
	            case 'attributes':
	                ret[key] = reply[i + 1].map(attribute => myTransformFunc(attribute));
	                break;
	            case 'gc_stats': {
	                const innerRet = {};
	                const array = reply[i + 1];
	                for (let i = 0; i < array.length; i += 2) {
	                    const innerKey = array[i].toString();
	                    switch (innerKey) {
	                        case 'bytes_collected':
	                        case 'total_ms_run':
	                        case 'total_cycles':
	                        case 'average_cycle_time_ms':
	                        case 'last_run_time_ms':
	                        case 'gc_numeric_trees_missed':
	                        case 'gc_blocks_denied':
	                            innerRet[innerKey] = generic_transformers_1.transformDoubleReply[2](array[i + 1], undefined, typeMapping);
	                            break;
	                    }
	                }
	                ret[key] = innerRet;
	                break;
	            }
	            case 'cursor_stats': {
	                const innerRet = {};
	                const array = reply[i + 1];
	                for (let i = 0; i < array.length; i += 2) {
	                    const innerKey = array[i].toString();
	                    switch (innerKey) {
	                        case 'global_idle':
	                        case 'global_total':
	                        case 'index_capacity':
	                        case 'index_total':
	                            innerRet[innerKey] = array[i + 1];
	                            break;
	                    }
	                }
	                ret[key] = innerRet;
	                break;
	            }
	        }
	    }
	    return ret;
	}
	
	return INFO$1;
}

var PROFILE_SEARCH = {};

var hasRequiredPROFILE_SEARCH;

function requirePROFILE_SEARCH () {
	if (hasRequiredPROFILE_SEARCH) return PROFILE_SEARCH;
	hasRequiredPROFILE_SEARCH = 1;
	var __createBinding = (PROFILE_SEARCH && PROFILE_SEARCH.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (PROFILE_SEARCH && PROFILE_SEARCH.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar = (PROFILE_SEARCH && PROFILE_SEARCH.__importStar) || function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
	    __setModuleDefault(result, mod);
	    return result;
	};
	Object.defineProperty(PROFILE_SEARCH, "__esModule", { value: true });
	const SEARCH_1 = __importStar(requireSEARCH());
	PROFILE_SEARCH.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Profiles the execution of a search query for performance analysis.
	     * @param parser - The command parser
	     * @param index - Name of the index to profile query against
	     * @param query - The search query to profile
	     * @param options - Optional parameters:
	     *   - LIMITED: Collect limited timing information only
	     *   - All options supported by FT.SEARCH command
	     */
	    parseCommand(parser, index, query, options) {
	        parser.push('FT.PROFILE', index, 'SEARCH');
	        if (options?.LIMITED) {
	            parser.push('LIMITED');
	        }
	        parser.push('QUERY', query);
	        (0, SEARCH_1.parseSearchOptions)(parser, options);
	    },
	    transformReply: {
	        2: (reply) => {
	            return {
	                results: SEARCH_1.default.transformReply[2](reply[0]),
	                profile: reply[1]
	            };
	        },
	        3: (reply) => reply
	    },
	    unstableResp3: true
	};
	
	return PROFILE_SEARCH;
}

var PROFILE_AGGREGATE = {};

var hasRequiredPROFILE_AGGREGATE;

function requirePROFILE_AGGREGATE () {
	if (hasRequiredPROFILE_AGGREGATE) return PROFILE_AGGREGATE;
	hasRequiredPROFILE_AGGREGATE = 1;
	var __createBinding = (PROFILE_AGGREGATE && PROFILE_AGGREGATE.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (PROFILE_AGGREGATE && PROFILE_AGGREGATE.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar = (PROFILE_AGGREGATE && PROFILE_AGGREGATE.__importStar) || function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
	    __setModuleDefault(result, mod);
	    return result;
	};
	Object.defineProperty(PROFILE_AGGREGATE, "__esModule", { value: true });
	const AGGREGATE_1 = __importStar(requireAGGREGATE());
	PROFILE_AGGREGATE.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Profiles the execution of an aggregation query for performance analysis.
	     * @param parser - The command parser
	     * @param index - Name of the index to profile query against
	     * @param query - The aggregation query to profile
	     * @param options - Optional parameters:
	     *   - LIMITED: Collect limited timing information only
	     *   - All options supported by FT.AGGREGATE command
	     */
	    parseCommand(parser, index, query, options) {
	        parser.push('FT.PROFILE', index, 'AGGREGATE');
	        if (options?.LIMITED) {
	            parser.push('LIMITED');
	        }
	        parser.push('QUERY', query);
	        (0, AGGREGATE_1.parseAggregateOptions)(parser, options);
	    },
	    transformReply: {
	        2: (reply) => {
	            return {
	                results: AGGREGATE_1.default.transformReply[2](reply[0]),
	                profile: reply[1]
	            };
	        },
	        3: (reply) => reply
	    },
	    unstableResp3: true
	};
	
	return PROFILE_AGGREGATE;
}

var SEARCH_NOCONTENT = {};

var hasRequiredSEARCH_NOCONTENT;

function requireSEARCH_NOCONTENT () {
	if (hasRequiredSEARCH_NOCONTENT) return SEARCH_NOCONTENT;
	hasRequiredSEARCH_NOCONTENT = 1;
	var __importDefault = (SEARCH_NOCONTENT && SEARCH_NOCONTENT.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(SEARCH_NOCONTENT, "__esModule", { value: true });
	const SEARCH_1 = __importDefault(requireSEARCH());
	SEARCH_NOCONTENT.default = {
	    NOT_KEYED_COMMAND: SEARCH_1.default.NOT_KEYED_COMMAND,
	    IS_READ_ONLY: SEARCH_1.default.IS_READ_ONLY,
	    /**
	     * Performs a search query but returns only document ids without their contents.
	     * @param args - Same parameters as FT.SEARCH:
	     *   - parser: The command parser
	     *   - index: Name of the index to search
	     *   - query: The text query to search
	     *   - options: Optional search parameters
	     */
	    parseCommand(...args) {
	        SEARCH_1.default.parseCommand(...args);
	        args[0].push('NOCONTENT');
	    },
	    transformReply: {
	        2: (reply) => {
	            return {
	                total: reply[0],
	                documents: reply.slice(1)
	            };
	        },
	        3: undefined
	    },
	    unstableResp3: true
	};
	
	return SEARCH_NOCONTENT;
}

var SPELLCHECK = {};

var hasRequiredSPELLCHECK;

function requireSPELLCHECK () {
	if (hasRequiredSPELLCHECK) return SPELLCHECK;
	hasRequiredSPELLCHECK = 1;
	Object.defineProperty(SPELLCHECK, "__esModule", { value: true });
	const default_1 = require_default();
	SPELLCHECK.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Performs spelling correction on a search query.
	     * @param parser - The command parser
	     * @param index - Name of the index to use for spelling corrections
	     * @param query - The search query to check for spelling
	     * @param options - Optional parameters:
	     *   - DISTANCE: Maximum Levenshtein distance for spelling suggestions
	     *   - TERMS: Custom dictionary terms to include/exclude
	     *   - DIALECT: Version of query dialect to use (defaults to 1)
	     */
	    parseCommand(parser, index, query, options) {
	        parser.push('FT.SPELLCHECK', index, query);
	        if (options?.DISTANCE) {
	            parser.push('DISTANCE', options.DISTANCE.toString());
	        }
	        if (options?.TERMS) {
	            if (Array.isArray(options.TERMS)) {
	                for (const term of options.TERMS) {
	                    parseTerms(parser, term);
	                }
	            }
	            else {
	                parseTerms(parser, options.TERMS);
	            }
	        }
	        if (options?.DIALECT) {
	            parser.push('DIALECT', options.DIALECT.toString());
	        }
	        else {
	            parser.push('DIALECT', default_1.DEFAULT_DIALECT);
	        }
	    },
	    transformReply: {
	        2: (rawReply) => {
	            return rawReply.map(([, term, suggestions]) => ({
	                term,
	                suggestions: suggestions.map(([score, suggestion]) => ({
	                    score: Number(score),
	                    suggestion
	                }))
	            }));
	        },
	        3: undefined,
	    },
	    unstableResp3: true
	};
	function parseTerms(parser, { mode, dictionary }) {
	    parser.push('TERMS', mode, dictionary);
	}
	
	return SPELLCHECK;
}

var SUGADD = {};

var hasRequiredSUGADD;

function requireSUGADD () {
	if (hasRequiredSUGADD) return SUGADD;
	hasRequiredSUGADD = 1;
	Object.defineProperty(SUGADD, "__esModule", { value: true });
	SUGADD.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Adds a suggestion string to an auto-complete suggestion dictionary.
	     * @param parser - The command parser
	     * @param key - The suggestion dictionary key
	     * @param string - The suggestion string to add
	     * @param score - The suggestion score used for sorting
	     * @param options - Optional parameters:
	     *   - INCR: If true, increment the existing entry's score
	     *   - PAYLOAD: Optional payload to associate with the suggestion
	     */
	    parseCommand(parser, key, string, score, options) {
	        parser.push('FT.SUGADD');
	        parser.pushKey(key);
	        parser.push(string, score.toString());
	        if (options?.INCR) {
	            parser.push('INCR');
	        }
	        if (options?.PAYLOAD) {
	            parser.push('PAYLOAD', options.PAYLOAD);
	        }
	    },
	    transformReply: undefined
	};
	
	return SUGADD;
}

var SUGDEL = {};

var hasRequiredSUGDEL;

function requireSUGDEL () {
	if (hasRequiredSUGDEL) return SUGDEL;
	hasRequiredSUGDEL = 1;
	Object.defineProperty(SUGDEL, "__esModule", { value: true });
	SUGDEL.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Deletes a string from a suggestion dictionary.
	     * @param parser - The command parser
	     * @param key - The suggestion dictionary key
	     * @param string - The suggestion string to delete
	     */
	    parseCommand(parser, key, string) {
	        parser.push('FT.SUGDEL');
	        parser.pushKey(key);
	        parser.push(string);
	    },
	    transformReply: undefined
	};
	
	return SUGDEL;
}

var SUGGET_WITHPAYLOADS = {};

var SUGGET = {};

var hasRequiredSUGGET;

function requireSUGGET () {
	if (hasRequiredSUGGET) return SUGGET;
	hasRequiredSUGGET = 1;
	Object.defineProperty(SUGGET, "__esModule", { value: true });
	SUGGET.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Gets completion suggestions for a prefix from a suggestion dictionary.
	     * @param parser - The command parser
	     * @param key - The suggestion dictionary key
	     * @param prefix - The prefix to get completion suggestions for
	     * @param options - Optional parameters:
	     *   - FUZZY: Enable fuzzy prefix matching
	     *   - MAX: Maximum number of results to return
	     */
	    parseCommand(parser, key, prefix, options) {
	        parser.push('FT.SUGGET');
	        parser.pushKey(key);
	        parser.push(prefix);
	        if (options?.FUZZY) {
	            parser.push('FUZZY');
	        }
	        if (options?.MAX !== undefined) {
	            parser.push('MAX', options.MAX.toString());
	        }
	    },
	    transformReply: undefined
	};
	
	return SUGGET;
}

var hasRequiredSUGGET_WITHPAYLOADS;

function requireSUGGET_WITHPAYLOADS () {
	if (hasRequiredSUGGET_WITHPAYLOADS) return SUGGET_WITHPAYLOADS;
	hasRequiredSUGGET_WITHPAYLOADS = 1;
	var __importDefault = (SUGGET_WITHPAYLOADS && SUGGET_WITHPAYLOADS.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(SUGGET_WITHPAYLOADS, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	const SUGGET_1 = __importDefault(requireSUGGET());
	SUGGET_WITHPAYLOADS.default = {
	    IS_READ_ONLY: SUGGET_1.default.IS_READ_ONLY,
	    /**
	     * Gets completion suggestions with their payloads from a suggestion dictionary.
	     * @param args - Same parameters as FT.SUGGET:
	     *   - parser: The command parser
	     *   - key: The suggestion dictionary key
	     *   - prefix: The prefix to get completion suggestions for
	     *   - options: Optional parameters for fuzzy matching and max results
	     */
	    parseCommand(...args) {
	        SUGGET_1.default.parseCommand(...args);
	        args[0].push('WITHPAYLOADS');
	    },
	    transformReply(reply) {
	        if ((0, generic_transformers_1.isNullReply)(reply))
	            return null;
	        const transformedReply = new Array(reply.length / 2);
	        let replyIndex = 0, arrIndex = 0;
	        while (replyIndex < reply.length) {
	            transformedReply[arrIndex++] = {
	                suggestion: reply[replyIndex++],
	                payload: reply[replyIndex++]
	            };
	        }
	        return transformedReply;
	    }
	};
	
	return SUGGET_WITHPAYLOADS;
}

var SUGGET_WITHSCORES_WITHPAYLOADS = {};

var hasRequiredSUGGET_WITHSCORES_WITHPAYLOADS;

function requireSUGGET_WITHSCORES_WITHPAYLOADS () {
	if (hasRequiredSUGGET_WITHSCORES_WITHPAYLOADS) return SUGGET_WITHSCORES_WITHPAYLOADS;
	hasRequiredSUGGET_WITHSCORES_WITHPAYLOADS = 1;
	var __importDefault = (SUGGET_WITHSCORES_WITHPAYLOADS && SUGGET_WITHSCORES_WITHPAYLOADS.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(SUGGET_WITHSCORES_WITHPAYLOADS, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	const SUGGET_1 = __importDefault(requireSUGGET());
	SUGGET_WITHSCORES_WITHPAYLOADS.default = {
	    IS_READ_ONLY: SUGGET_1.default.IS_READ_ONLY,
	    /**
	     * Gets completion suggestions with their scores and payloads from a suggestion dictionary.
	     * @param args - Same parameters as FT.SUGGET:
	     *   - parser: The command parser
	     *   - key: The suggestion dictionary key
	     *   - prefix: The prefix to get completion suggestions for
	     *   - options: Optional parameters for fuzzy matching and max results
	     */
	    parseCommand(...args) {
	        SUGGET_1.default.parseCommand(...args);
	        args[0].push('WITHSCORES', 'WITHPAYLOADS');
	    },
	    transformReply: {
	        2: (reply, preserve, typeMapping) => {
	            if ((0, generic_transformers_1.isNullReply)(reply))
	                return null;
	            const transformedReply = new Array(reply.length / 3);
	            let replyIndex = 0, arrIndex = 0;
	            while (replyIndex < reply.length) {
	                transformedReply[arrIndex++] = {
	                    suggestion: reply[replyIndex++],
	                    score: generic_transformers_1.transformDoubleReply[2](reply[replyIndex++], preserve, typeMapping),
	                    payload: reply[replyIndex++]
	                };
	            }
	            return transformedReply;
	        },
	        3: (reply) => {
	            if ((0, generic_transformers_1.isNullReply)(reply))
	                return null;
	            const transformedReply = new Array(reply.length / 3);
	            let replyIndex = 0, arrIndex = 0;
	            while (replyIndex < reply.length) {
	                transformedReply[arrIndex++] = {
	                    suggestion: reply[replyIndex++],
	                    score: reply[replyIndex++],
	                    payload: reply[replyIndex++]
	                };
	            }
	            return transformedReply;
	        }
	    }
	};
	
	return SUGGET_WITHSCORES_WITHPAYLOADS;
}

var SUGGET_WITHSCORES = {};

var hasRequiredSUGGET_WITHSCORES;

function requireSUGGET_WITHSCORES () {
	if (hasRequiredSUGGET_WITHSCORES) return SUGGET_WITHSCORES;
	hasRequiredSUGGET_WITHSCORES = 1;
	var __importDefault = (SUGGET_WITHSCORES && SUGGET_WITHSCORES.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(SUGGET_WITHSCORES, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	const SUGGET_1 = __importDefault(requireSUGGET());
	SUGGET_WITHSCORES.default = {
	    IS_READ_ONLY: SUGGET_1.default.IS_READ_ONLY,
	    /**
	     * Gets completion suggestions with their scores from a suggestion dictionary.
	     * @param args - Same parameters as FT.SUGGET:
	     *   - parser: The command parser
	     *   - key: The suggestion dictionary key
	     *   - prefix: The prefix to get completion suggestions for
	     *   - options: Optional parameters for fuzzy matching and max results
	     */
	    parseCommand(...args) {
	        SUGGET_1.default.parseCommand(...args);
	        args[0].push('WITHSCORES');
	    },
	    transformReply: {
	        2: (reply, preserve, typeMapping) => {
	            if ((0, generic_transformers_1.isNullReply)(reply))
	                return null;
	            const transformedReply = new Array(reply.length / 2);
	            let replyIndex = 0, arrIndex = 0;
	            while (replyIndex < reply.length) {
	                transformedReply[arrIndex++] = {
	                    suggestion: reply[replyIndex++],
	                    score: generic_transformers_1.transformDoubleReply[2](reply[replyIndex++], preserve, typeMapping)
	                };
	            }
	            return transformedReply;
	        },
	        3: (reply) => {
	            if ((0, generic_transformers_1.isNullReply)(reply))
	                return null;
	            const transformedReply = new Array(reply.length / 2);
	            let replyIndex = 0, arrIndex = 0;
	            while (replyIndex < reply.length) {
	                transformedReply[arrIndex++] = {
	                    suggestion: reply[replyIndex++],
	                    score: reply[replyIndex++]
	                };
	            }
	            return transformedReply;
	        }
	    }
	};
	
	return SUGGET_WITHSCORES;
}

var SUGLEN = {};

var hasRequiredSUGLEN;

function requireSUGLEN () {
	if (hasRequiredSUGLEN) return SUGLEN;
	hasRequiredSUGLEN = 1;
	Object.defineProperty(SUGLEN, "__esModule", { value: true });
	SUGLEN.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Gets the size of a suggestion dictionary.
	     * @param parser - The command parser
	     * @param key - The suggestion dictionary key
	     */
	    parseCommand(parser, key) {
	        parser.push('FT.SUGLEN', key);
	    },
	    transformReply: undefined
	};
	
	return SUGLEN;
}

var SYNDUMP = {};

var hasRequiredSYNDUMP;

function requireSYNDUMP () {
	if (hasRequiredSYNDUMP) return SYNDUMP;
	hasRequiredSYNDUMP = 1;
	Object.defineProperty(SYNDUMP, "__esModule", { value: true });
	SYNDUMP.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Dumps the contents of a synonym group.
	     * @param parser - The command parser
	     * @param index - Name of the index that contains the synonym group
	     */
	    parseCommand(parser, index) {
	        parser.push('FT.SYNDUMP', index);
	    },
	    transformReply: {
	        2: (reply) => {
	            const result = {};
	            let i = 0;
	            while (i < reply.length) {
	                const key = reply[i++].toString(), value = reply[i++];
	                result[key] = value;
	            }
	            return result;
	        },
	        3: undefined
	    }
	};
	
	return SYNDUMP;
}

var SYNUPDATE = {};

var hasRequiredSYNUPDATE;

function requireSYNUPDATE () {
	if (hasRequiredSYNUPDATE) return SYNUPDATE;
	hasRequiredSYNUPDATE = 1;
	Object.defineProperty(SYNUPDATE, "__esModule", { value: true });
	SYNUPDATE.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Updates a synonym group with new terms.
	     * @param parser - The command parser
	     * @param index - Name of the index that contains the synonym group
	     * @param groupId - ID of the synonym group to update
	     * @param terms - One or more synonym terms to add to the group
	     * @param options - Optional parameters:
	     *   - SKIPINITIALSCAN: Skip the initial scan for existing documents
	     */
	    parseCommand(parser, index, groupId, terms, options) {
	        parser.push('FT.SYNUPDATE', index, groupId);
	        if (options?.SKIPINITIALSCAN) {
	            parser.push('SKIPINITIALSCAN');
	        }
	        parser.pushVariadic(terms);
	    },
	    transformReply: undefined
	};
	
	return SYNUPDATE;
}

var TAGVALS = {};

var hasRequiredTAGVALS;

function requireTAGVALS () {
	if (hasRequiredTAGVALS) return TAGVALS;
	hasRequiredTAGVALS = 1;
	Object.defineProperty(TAGVALS, "__esModule", { value: true });
	TAGVALS.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Returns the distinct values in a TAG field.
	     * @param parser - The command parser
	     * @param index - Name of the index
	     * @param fieldName - Name of the TAG field to get values from
	     */
	    parseCommand(parser, index, fieldName) {
	        parser.push('FT.TAGVALS', index, fieldName);
	    },
	    transformReply: {
	        2: undefined,
	        3: undefined
	    }
	};
	
	return TAGVALS;
}

var hasRequiredCommands$1;

function requireCommands$1 () {
	if (hasRequiredCommands$1) return commands$1;
	hasRequiredCommands$1 = 1;
	var __importDefault = (commands$1 && commands$1.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(commands$1, "__esModule", { value: true });
	const _LIST_1 = __importDefault(require_LIST());
	const ALTER_1 = __importDefault(requireALTER$1());
	const AGGREGATE_WITHCURSOR_1 = __importDefault(requireAGGREGATE_WITHCURSOR());
	const AGGREGATE_1 = __importDefault(requireAGGREGATE());
	const ALIASADD_1 = __importDefault(requireALIASADD());
	const ALIASDEL_1 = __importDefault(requireALIASDEL());
	const ALIASUPDATE_1 = __importDefault(requireALIASUPDATE());
	const CONFIG_GET_1 = __importDefault(requireCONFIG_GET());
	const CONFIG_SET_1 = __importDefault(requireCONFIG_SET());
	const CREATE_1 = __importDefault(requireCREATE$1());
	const CURSOR_DEL_1 = __importDefault(requireCURSOR_DEL());
	const CURSOR_READ_1 = __importDefault(requireCURSOR_READ());
	const DICTADD_1 = __importDefault(requireDICTADD());
	const DICTDEL_1 = __importDefault(requireDICTDEL());
	const DICTDUMP_1 = __importDefault(requireDICTDUMP());
	const DROPINDEX_1 = __importDefault(requireDROPINDEX());
	const EXPLAIN_1 = __importDefault(requireEXPLAIN());
	const EXPLAINCLI_1 = __importDefault(requireEXPLAINCLI());
	const INFO_1 = __importDefault(requireINFO$1());
	const PROFILE_SEARCH_1 = __importDefault(requirePROFILE_SEARCH());
	const PROFILE_AGGREGATE_1 = __importDefault(requirePROFILE_AGGREGATE());
	const SEARCH_NOCONTENT_1 = __importDefault(requireSEARCH_NOCONTENT());
	const SEARCH_1 = __importDefault(requireSEARCH());
	const SPELLCHECK_1 = __importDefault(requireSPELLCHECK());
	const SUGADD_1 = __importDefault(requireSUGADD());
	const SUGDEL_1 = __importDefault(requireSUGDEL());
	const SUGGET_WITHPAYLOADS_1 = __importDefault(requireSUGGET_WITHPAYLOADS());
	const SUGGET_WITHSCORES_WITHPAYLOADS_1 = __importDefault(requireSUGGET_WITHSCORES_WITHPAYLOADS());
	const SUGGET_WITHSCORES_1 = __importDefault(requireSUGGET_WITHSCORES());
	const SUGGET_1 = __importDefault(requireSUGGET());
	const SUGLEN_1 = __importDefault(requireSUGLEN());
	const SYNDUMP_1 = __importDefault(requireSYNDUMP());
	const SYNUPDATE_1 = __importDefault(requireSYNUPDATE());
	const TAGVALS_1 = __importDefault(requireTAGVALS());
	commands$1.default = {
	    _LIST: _LIST_1.default,
	    _list: _LIST_1.default,
	    ALTER: ALTER_1.default,
	    alter: ALTER_1.default,
	    AGGREGATE_WITHCURSOR: AGGREGATE_WITHCURSOR_1.default,
	    aggregateWithCursor: AGGREGATE_WITHCURSOR_1.default,
	    AGGREGATE: AGGREGATE_1.default,
	    aggregate: AGGREGATE_1.default,
	    ALIASADD: ALIASADD_1.default,
	    aliasAdd: ALIASADD_1.default,
	    ALIASDEL: ALIASDEL_1.default,
	    aliasDel: ALIASDEL_1.default,
	    ALIASUPDATE: ALIASUPDATE_1.default,
	    aliasUpdate: ALIASUPDATE_1.default,
	    /**
	     * @deprecated Redis >=8 uses the standard CONFIG command
	     */
	    CONFIG_GET: CONFIG_GET_1.default,
	    /**
	     * @deprecated Redis >=8 uses the standard CONFIG command
	     */
	    configGet: CONFIG_GET_1.default,
	    /**
	     * @deprecated Redis >=8 uses the standard CONFIG command
	     */
	    CONFIG_SET: CONFIG_SET_1.default,
	    /**
	     * @deprecated Redis >=8 uses the standard CONFIG command
	     */
	    configSet: CONFIG_SET_1.default,
	    CREATE: CREATE_1.default,
	    create: CREATE_1.default,
	    CURSOR_DEL: CURSOR_DEL_1.default,
	    cursorDel: CURSOR_DEL_1.default,
	    CURSOR_READ: CURSOR_READ_1.default,
	    cursorRead: CURSOR_READ_1.default,
	    DICTADD: DICTADD_1.default,
	    dictAdd: DICTADD_1.default,
	    DICTDEL: DICTDEL_1.default,
	    dictDel: DICTDEL_1.default,
	    DICTDUMP: DICTDUMP_1.default,
	    dictDump: DICTDUMP_1.default,
	    DROPINDEX: DROPINDEX_1.default,
	    dropIndex: DROPINDEX_1.default,
	    EXPLAIN: EXPLAIN_1.default,
	    explain: EXPLAIN_1.default,
	    EXPLAINCLI: EXPLAINCLI_1.default,
	    explainCli: EXPLAINCLI_1.default,
	    INFO: INFO_1.default,
	    info: INFO_1.default,
	    PROFILESEARCH: PROFILE_SEARCH_1.default,
	    profileSearch: PROFILE_SEARCH_1.default,
	    PROFILEAGGREGATE: PROFILE_AGGREGATE_1.default,
	    profileAggregate: PROFILE_AGGREGATE_1.default,
	    SEARCH_NOCONTENT: SEARCH_NOCONTENT_1.default,
	    searchNoContent: SEARCH_NOCONTENT_1.default,
	    SEARCH: SEARCH_1.default,
	    search: SEARCH_1.default,
	    SPELLCHECK: SPELLCHECK_1.default,
	    spellCheck: SPELLCHECK_1.default,
	    SUGADD: SUGADD_1.default,
	    sugAdd: SUGADD_1.default,
	    SUGDEL: SUGDEL_1.default,
	    sugDel: SUGDEL_1.default,
	    SUGGET_WITHPAYLOADS: SUGGET_WITHPAYLOADS_1.default,
	    sugGetWithPayloads: SUGGET_WITHPAYLOADS_1.default,
	    SUGGET_WITHSCORES_WITHPAYLOADS: SUGGET_WITHSCORES_WITHPAYLOADS_1.default,
	    sugGetWithScoresWithPayloads: SUGGET_WITHSCORES_WITHPAYLOADS_1.default,
	    SUGGET_WITHSCORES: SUGGET_WITHSCORES_1.default,
	    sugGetWithScores: SUGGET_WITHSCORES_1.default,
	    SUGGET: SUGGET_1.default,
	    sugGet: SUGGET_1.default,
	    SUGLEN: SUGLEN_1.default,
	    sugLen: SUGLEN_1.default,
	    SYNDUMP: SYNDUMP_1.default,
	    synDump: SYNDUMP_1.default,
	    SYNUPDATE: SYNUPDATE_1.default,
	    synUpdate: SYNUPDATE_1.default,
	    TAGVALS: TAGVALS_1.default,
	    tagVals: TAGVALS_1.default
	};
	
	return commands$1;
}

var hasRequiredLib$1;

function requireLib$1 () {
	if (hasRequiredLib$1) return lib$1;
	hasRequiredLib$1 = 1;
	(function (exports) {
		var __importDefault = (lib$1 && lib$1.__importDefault) || function (mod) {
		    return (mod && mod.__esModule) ? mod : { "default": mod };
		};
		Object.defineProperty(exports, "__esModule", { value: true });
		exports.FT_AGGREGATE_STEPS = exports.FT_AGGREGATE_GROUP_BY_REDUCERS = exports.SCHEMA_VECTOR_FIELD_ALGORITHM = exports.SCHEMA_TEXT_FIELD_PHONETIC = exports.SCHEMA_FIELD_TYPE = exports.REDISEARCH_LANGUAGE = exports.default = void 0;
		var commands_1 = requireCommands$1();
		Object.defineProperty(exports, "default", { enumerable: true, get: function () { return __importDefault(commands_1).default; } });
		var CREATE_1 = requireCREATE$1();
		Object.defineProperty(exports, "REDISEARCH_LANGUAGE", { enumerable: true, get: function () { return CREATE_1.REDISEARCH_LANGUAGE; } });
		Object.defineProperty(exports, "SCHEMA_FIELD_TYPE", { enumerable: true, get: function () { return CREATE_1.SCHEMA_FIELD_TYPE; } });
		Object.defineProperty(exports, "SCHEMA_TEXT_FIELD_PHONETIC", { enumerable: true, get: function () { return CREATE_1.SCHEMA_TEXT_FIELD_PHONETIC; } });
		Object.defineProperty(exports, "SCHEMA_VECTOR_FIELD_ALGORITHM", { enumerable: true, get: function () { return CREATE_1.SCHEMA_VECTOR_FIELD_ALGORITHM; } });
		var AGGREGATE_1 = requireAGGREGATE();
		Object.defineProperty(exports, "FT_AGGREGATE_GROUP_BY_REDUCERS", { enumerable: true, get: function () { return AGGREGATE_1.FT_AGGREGATE_GROUP_BY_REDUCERS; } });
		Object.defineProperty(exports, "FT_AGGREGATE_STEPS", { enumerable: true, get: function () { return AGGREGATE_1.FT_AGGREGATE_STEPS; } });
		
	} (lib$1));
	return lib$1;
}

var lib = {};

var commands = {};

var ADD = {};

var helpers = {};

var hasRequiredHelpers;

function requireHelpers () {
	if (hasRequiredHelpers) return helpers;
	hasRequiredHelpers = 1;
	(function (exports) {
		Object.defineProperty(exports, "__esModule", { value: true });
		exports.transformRESP2LabelsWithSources = exports.transformRESP2Labels = exports.parseSelectedLabelsArguments = exports.resp3MapToValue = exports.resp2MapToValue = exports.transformSamplesReply = exports.transformSampleReply = exports.parseLabelsArgument = exports.transformTimestampArgument = exports.parseDuplicatePolicy = exports.TIME_SERIES_DUPLICATE_POLICIES = exports.parseChunkSizeArgument = exports.parseEncodingArgument = exports.TIME_SERIES_ENCODING = exports.parseRetentionArgument = exports.parseIgnoreArgument = void 0;
		const client_1 = requireDist$1();
		function parseIgnoreArgument(parser, ignore) {
		    if (ignore !== undefined) {
		        parser.push('IGNORE', ignore.maxTimeDiff.toString(), ignore.maxValDiff.toString());
		    }
		}
		exports.parseIgnoreArgument = parseIgnoreArgument;
		function parseRetentionArgument(parser, retention) {
		    if (retention !== undefined) {
		        parser.push('RETENTION', retention.toString());
		    }
		}
		exports.parseRetentionArgument = parseRetentionArgument;
		exports.TIME_SERIES_ENCODING = {
		    COMPRESSED: 'COMPRESSED',
		    UNCOMPRESSED: 'UNCOMPRESSED'
		};
		function parseEncodingArgument(parser, encoding) {
		    if (encoding !== undefined) {
		        parser.push('ENCODING', encoding);
		    }
		}
		exports.parseEncodingArgument = parseEncodingArgument;
		function parseChunkSizeArgument(parser, chunkSize) {
		    if (chunkSize !== undefined) {
		        parser.push('CHUNK_SIZE', chunkSize.toString());
		    }
		}
		exports.parseChunkSizeArgument = parseChunkSizeArgument;
		exports.TIME_SERIES_DUPLICATE_POLICIES = {
		    BLOCK: 'BLOCK',
		    FIRST: 'FIRST',
		    LAST: 'LAST',
		    MIN: 'MIN',
		    MAX: 'MAX',
		    SUM: 'SUM'
		};
		function parseDuplicatePolicy(parser, duplicatePolicy) {
		    if (duplicatePolicy !== undefined) {
		        parser.push('DUPLICATE_POLICY', duplicatePolicy);
		    }
		}
		exports.parseDuplicatePolicy = parseDuplicatePolicy;
		function transformTimestampArgument(timestamp) {
		    if (typeof timestamp === 'string')
		        return timestamp;
		    return (typeof timestamp === 'number' ?
		        timestamp :
		        timestamp.getTime()).toString();
		}
		exports.transformTimestampArgument = transformTimestampArgument;
		function parseLabelsArgument(parser, labels) {
		    if (labels) {
		        parser.push('LABELS');
		        for (const [label, value] of Object.entries(labels)) {
		            parser.push(label, value);
		        }
		    }
		}
		exports.parseLabelsArgument = parseLabelsArgument;
		exports.transformSampleReply = {
		    2(reply) {
		        const [timestamp, value] = reply;
		        return {
		            timestamp,
		            value: Number(value) // TODO: use double type mapping instead
		        };
		    },
		    3(reply) {
		        const [timestamp, value] = reply;
		        return {
		            timestamp,
		            value
		        };
		    }
		};
		exports.transformSamplesReply = {
		    2(reply) {
		        return reply
		            .map(sample => exports.transformSampleReply[2](sample));
		    },
		    3(reply) {
		        return reply
		            .map(sample => exports.transformSampleReply[3](sample));
		    }
		};
		// TODO: move to @redis/client?
		function resp2MapToValue(wrappedReply, parseFunc, typeMapping) {
		    const reply = wrappedReply;
		    switch (typeMapping?.[client_1.RESP_TYPES.MAP]) {
		        case Map: {
		            const ret = new Map();
		            for (const wrappedTuple of reply) {
		                const tuple = wrappedTuple;
		                const key = tuple[0];
		                ret.set(key.toString(), parseFunc(tuple));
		            }
		            return ret;
		        }
		        case Array: {
		            for (const wrappedTuple of reply) {
		                const tuple = wrappedTuple;
		                tuple[1] = parseFunc(tuple);
		            }
		            return reply;
		        }
		        default: {
		            const ret = Object.create(null);
		            for (const wrappedTuple of reply) {
		                const tuple = wrappedTuple;
		                const key = tuple[0];
		                ret[key.toString()] = parseFunc(tuple);
		            }
		            return ret;
		        }
		    }
		}
		exports.resp2MapToValue = resp2MapToValue;
		function resp3MapToValue(wrappedReply, parseFunc) {
		    const reply = wrappedReply;
		    if (reply instanceof Array) {
		        for (let i = 1; i < reply.length; i += 2) {
		            reply[i] = parseFunc(reply[i]);
		        }
		    }
		    else if (reply instanceof Map) {
		        for (const [key, value] of reply.entries()) {
		            reply.set(key, parseFunc(value));
		        }
		    }
		    else {
		        for (const [key, value] of Object.entries(reply)) {
		            reply[key] = parseFunc(value);
		        }
		    }
		    return reply;
		}
		exports.resp3MapToValue = resp3MapToValue;
		function parseSelectedLabelsArguments(parser, selectedLabels) {
		    parser.push('SELECTED_LABELS');
		    parser.pushVariadic(selectedLabels);
		}
		exports.parseSelectedLabelsArguments = parseSelectedLabelsArguments;
		function transformRESP2Labels(labels, typeMapping) {
		    const unwrappedLabels = labels;
		    switch (typeMapping?.[client_1.RESP_TYPES.MAP]) {
		        case Map:
		            const map = new Map();
		            for (const tuple of unwrappedLabels) {
		                const [key, value] = tuple;
		                const unwrappedKey = key;
		                map.set(unwrappedKey.toString(), value);
		            }
		            return map;
		        case Array:
		            return unwrappedLabels.flat();
		        case Object:
		        default:
		            const labelsObject = Object.create(null);
		            for (const tuple of unwrappedLabels) {
		                const [key, value] = tuple;
		                const unwrappedKey = key;
		                labelsObject[unwrappedKey.toString()] = value;
		            }
		            return labelsObject;
		    }
		}
		exports.transformRESP2Labels = transformRESP2Labels;
		function transformRESP2LabelsWithSources(labels, typeMapping) {
		    const unwrappedLabels = labels;
		    const to = unwrappedLabels.length - 2; // ignore __reducer__ and __source__
		    let transformedLabels;
		    switch (typeMapping?.[client_1.RESP_TYPES.MAP]) {
		        case Map:
		            const map = new Map();
		            for (let i = 0; i < to; i++) {
		                const [key, value] = unwrappedLabels[i];
		                const unwrappedKey = key;
		                map.set(unwrappedKey.toString(), value);
		            }
		            transformedLabels = map;
		            break;
		        case Array:
		            transformedLabels = unwrappedLabels.slice(0, to).flat();
		            break;
		        case Object:
		        default:
		            const labelsObject = Object.create(null);
		            for (let i = 0; i < to; i++) {
		                const [key, value] = unwrappedLabels[i];
		                const unwrappedKey = key;
		                labelsObject[unwrappedKey.toString()] = value;
		            }
		            transformedLabels = labelsObject;
		            break;
		    }
		    const sourcesTuple = unwrappedLabels[unwrappedLabels.length - 1];
		    const unwrappedSourcesTuple = sourcesTuple;
		    // the __source__ label will never be null
		    const transformedSources = transformRESP2Sources(unwrappedSourcesTuple[1]);
		    return {
		        labels: transformedLabels,
		        sources: transformedSources
		    };
		}
		exports.transformRESP2LabelsWithSources = transformRESP2LabelsWithSources;
		function transformRESP2Sources(sourcesRaw) {
		    // if a label contains "," this function will produce incorrcet results..
		    // there is not much we can do about it, and we assume most users won't be using "," in their labels..
		    const unwrappedSources = sourcesRaw;
		    if (typeof unwrappedSources === 'string') {
		        return unwrappedSources.split(',');
		    }
		    const indexOfComma = unwrappedSources.indexOf(',');
		    if (indexOfComma === -1) {
		        return [unwrappedSources];
		    }
		    const sourcesArray = [
		        unwrappedSources.subarray(0, indexOfComma)
		    ];
		    let previousComma = indexOfComma + 1;
		    while (true) {
		        const indexOf = unwrappedSources.indexOf(',', previousComma);
		        if (indexOf === -1) {
		            sourcesArray.push(unwrappedSources.subarray(previousComma));
		            break;
		        }
		        const source = unwrappedSources.subarray(previousComma, indexOf);
		        sourcesArray.push(source);
		        previousComma = indexOf + 1;
		    }
		    return sourcesArray;
		}
		
	} (helpers));
	return helpers;
}

var hasRequiredADD;

function requireADD () {
	if (hasRequiredADD) return ADD;
	hasRequiredADD = 1;
	Object.defineProperty(ADD, "__esModule", { value: true });
	const helpers_1 = requireHelpers();
	ADD.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Creates or appends a sample to a time series
	     * @param parser - The command parser
	     * @param key - The key name for the time series
	     * @param timestamp - The timestamp of the sample
	     * @param value - The value of the sample
	     * @param options - Optional configuration parameters
	     */
	    parseCommand(parser, key, timestamp, value, options) {
	        parser.push('TS.ADD');
	        parser.pushKey(key);
	        parser.push((0, helpers_1.transformTimestampArgument)(timestamp), value.toString());
	        (0, helpers_1.parseRetentionArgument)(parser, options?.RETENTION);
	        (0, helpers_1.parseEncodingArgument)(parser, options?.ENCODING);
	        (0, helpers_1.parseChunkSizeArgument)(parser, options?.CHUNK_SIZE);
	        if (options?.ON_DUPLICATE) {
	            parser.push('ON_DUPLICATE', options.ON_DUPLICATE);
	        }
	        (0, helpers_1.parseLabelsArgument)(parser, options?.LABELS);
	        (0, helpers_1.parseIgnoreArgument)(parser, options?.IGNORE);
	    },
	    transformReply: undefined
	};
	
	return ADD;
}

var ALTER = {};

var hasRequiredALTER;

function requireALTER () {
	if (hasRequiredALTER) return ALTER;
	hasRequiredALTER = 1;
	Object.defineProperty(ALTER, "__esModule", { value: true });
	const helpers_1 = requireHelpers();
	ALTER.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Alters the configuration of an existing time series
	     * @param parser - The command parser
	     * @param key - The key name for the time series
	     * @param options - Configuration parameters to alter
	     */
	    parseCommand(parser, key, options) {
	        parser.push('TS.ALTER');
	        parser.pushKey(key);
	        (0, helpers_1.parseRetentionArgument)(parser, options?.RETENTION);
	        (0, helpers_1.parseChunkSizeArgument)(parser, options?.CHUNK_SIZE);
	        (0, helpers_1.parseDuplicatePolicy)(parser, options?.DUPLICATE_POLICY);
	        (0, helpers_1.parseLabelsArgument)(parser, options?.LABELS);
	        (0, helpers_1.parseIgnoreArgument)(parser, options?.IGNORE);
	    },
	    transformReply: undefined
	};
	
	return ALTER;
}

var CREATE = {};

var hasRequiredCREATE;

function requireCREATE () {
	if (hasRequiredCREATE) return CREATE;
	hasRequiredCREATE = 1;
	Object.defineProperty(CREATE, "__esModule", { value: true });
	const helpers_1 = requireHelpers();
	CREATE.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Creates a new time series
	     * @param parser - The command parser
	     * @param key - The key name for the new time series
	     * @param options - Optional configuration parameters
	     */
	    parseCommand(parser, key, options) {
	        parser.push('TS.CREATE');
	        parser.pushKey(key);
	        (0, helpers_1.parseRetentionArgument)(parser, options?.RETENTION);
	        (0, helpers_1.parseEncodingArgument)(parser, options?.ENCODING);
	        (0, helpers_1.parseChunkSizeArgument)(parser, options?.CHUNK_SIZE);
	        (0, helpers_1.parseDuplicatePolicy)(parser, options?.DUPLICATE_POLICY);
	        (0, helpers_1.parseLabelsArgument)(parser, options?.LABELS);
	        (0, helpers_1.parseIgnoreArgument)(parser, options?.IGNORE);
	    },
	    transformReply: undefined
	};
	
	return CREATE;
}

var CREATERULE = {};

var hasRequiredCREATERULE;

function requireCREATERULE () {
	if (hasRequiredCREATERULE) return CREATERULE;
	hasRequiredCREATERULE = 1;
	Object.defineProperty(CREATERULE, "__esModule", { value: true });
	CREATERULE.TIME_SERIES_AGGREGATION_TYPE = void 0;
	CREATERULE.TIME_SERIES_AGGREGATION_TYPE = {
	    AVG: 'AVG',
	    FIRST: 'FIRST',
	    LAST: 'LAST',
	    MIN: 'MIN',
	    MAX: 'MAX',
	    SUM: 'SUM',
	    RANGE: 'RANGE',
	    COUNT: 'COUNT',
	    STD_P: 'STD.P',
	    STD_S: 'STD.S',
	    VAR_P: 'VAR.P',
	    VAR_S: 'VAR.S',
	    TWA: 'TWA'
	};
	CREATERULE.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Creates a compaction rule from source time series to destination time series
	     * @param parser - The command parser
	     * @param sourceKey - The source time series key
	     * @param destinationKey - The destination time series key
	     * @param aggregationType - The aggregation type to use
	     * @param bucketDuration - The duration of each bucket in milliseconds
	     * @param alignTimestamp - Optional timestamp for alignment
	     */
	    parseCommand(parser, sourceKey, destinationKey, aggregationType, bucketDuration, alignTimestamp) {
	        parser.push('TS.CREATERULE');
	        parser.pushKeys([sourceKey, destinationKey]);
	        parser.push('AGGREGATION', aggregationType, bucketDuration.toString());
	        if (alignTimestamp !== undefined) {
	            parser.push(alignTimestamp.toString());
	        }
	    },
	    transformReply: undefined
	};
	
	return CREATERULE;
}

var DECRBY = {};

var INCRBY = {};

var hasRequiredINCRBY;

function requireINCRBY () {
	if (hasRequiredINCRBY) return INCRBY;
	hasRequiredINCRBY = 1;
	Object.defineProperty(INCRBY, "__esModule", { value: true });
	INCRBY.parseIncrByArguments = void 0;
	const helpers_1 = requireHelpers();
	/**
	 * Parses arguments for incrementing a time series value
	 * @param parser - The command parser
	 * @param key - The key name of the time series
	 * @param value - The value to increment by
	 * @param options - Optional parameters for the command
	 */
	function parseIncrByArguments(parser, key, value, options) {
	    parser.pushKey(key);
	    parser.push(value.toString());
	    if (options?.TIMESTAMP !== undefined && options?.TIMESTAMP !== null) {
	        parser.push('TIMESTAMP', (0, helpers_1.transformTimestampArgument)(options.TIMESTAMP));
	    }
	    (0, helpers_1.parseRetentionArgument)(parser, options?.RETENTION);
	    if (options?.UNCOMPRESSED) {
	        parser.push('UNCOMPRESSED');
	    }
	    (0, helpers_1.parseChunkSizeArgument)(parser, options?.CHUNK_SIZE);
	    (0, helpers_1.parseLabelsArgument)(parser, options?.LABELS);
	    (0, helpers_1.parseIgnoreArgument)(parser, options?.IGNORE);
	}
	INCRBY.parseIncrByArguments = parseIncrByArguments;
	INCRBY.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Increases the value of a time series by a given amount
	     * @param args - Arguments passed to the {@link parseIncrByArguments} function
	     */
	    parseCommand(...args) {
	        const parser = args[0];
	        parser.push('TS.INCRBY');
	        parseIncrByArguments(...args);
	    },
	    transformReply: undefined
	};
	
	return INCRBY;
}

var hasRequiredDECRBY;

function requireDECRBY () {
	if (hasRequiredDECRBY) return DECRBY;
	hasRequiredDECRBY = 1;
	var __createBinding = (DECRBY && DECRBY.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (DECRBY && DECRBY.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar = (DECRBY && DECRBY.__importStar) || function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
	    __setModuleDefault(result, mod);
	    return result;
	};
	Object.defineProperty(DECRBY, "__esModule", { value: true });
	const INCRBY_1 = __importStar(requireINCRBY());
	DECRBY.default = {
	    IS_READ_ONLY: INCRBY_1.default.IS_READ_ONLY,
	    /**
	     * Decreases the value of a time series by a given amount
	     * @param args - Arguments passed to the parseIncrByArguments function
	     */
	    parseCommand(...args) {
	        const parser = args[0];
	        parser.push('TS.DECRBY');
	        (0, INCRBY_1.parseIncrByArguments)(...args);
	    },
	    transformReply: INCRBY_1.default.transformReply
	};
	
	return DECRBY;
}

var DEL = {};

var hasRequiredDEL;

function requireDEL () {
	if (hasRequiredDEL) return DEL;
	hasRequiredDEL = 1;
	Object.defineProperty(DEL, "__esModule", { value: true });
	const helpers_1 = requireHelpers();
	DEL.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Deletes samples between two timestamps from a time series
	     * @param parser - The command parser
	     * @param key - The key name of the time series
	     * @param fromTimestamp - Start timestamp to delete from
	     * @param toTimestamp - End timestamp to delete until
	     */
	    parseCommand(parser, key, fromTimestamp, toTimestamp) {
	        parser.push('TS.DEL');
	        parser.pushKey(key);
	        parser.push((0, helpers_1.transformTimestampArgument)(fromTimestamp), (0, helpers_1.transformTimestampArgument)(toTimestamp));
	    },
	    transformReply: undefined
	};
	
	return DEL;
}

var DELETERULE = {};

var hasRequiredDELETERULE;

function requireDELETERULE () {
	if (hasRequiredDELETERULE) return DELETERULE;
	hasRequiredDELETERULE = 1;
	Object.defineProperty(DELETERULE, "__esModule", { value: true });
	DELETERULE.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Deletes a compaction rule between source and destination time series
	     * @param parser - The command parser
	     * @param sourceKey - The source time series key
	     * @param destinationKey - The destination time series key
	     */
	    parseCommand(parser, sourceKey, destinationKey) {
	        parser.push('TS.DELETERULE');
	        parser.pushKeys([sourceKey, destinationKey]);
	    },
	    transformReply: undefined
	};
	
	return DELETERULE;
}

var GET = {};

var hasRequiredGET;

function requireGET () {
	if (hasRequiredGET) return GET;
	hasRequiredGET = 1;
	Object.defineProperty(GET, "__esModule", { value: true });
	GET.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Gets the last sample of a time series
	     * @param parser - The command parser
	     * @param key - The key name of the time series
	     * @param options - Optional parameters for the command
	     */
	    parseCommand(parser, key, options) {
	        parser.push('TS.GET');
	        parser.pushKey(key);
	        if (options?.LATEST) {
	            parser.push('LATEST');
	        }
	    },
	    transformReply: {
	        2(reply) {
	            return reply.length === 0 ? null : {
	                timestamp: reply[0],
	                value: Number(reply[1])
	            };
	        },
	        3(reply) {
	            return reply.length === 0 ? null : {
	                timestamp: reply[0],
	                value: reply[1]
	            };
	        }
	    }
	};
	
	return GET;
}

var INFO_DEBUG = {};

var INFO = {};

var hasRequiredINFO;

function requireINFO () {
	if (hasRequiredINFO) return INFO;
	hasRequiredINFO = 1;
	Object.defineProperty(INFO, "__esModule", { value: true });
	const generic_transformers_1 = requireGenericTransformers();
	INFO.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Gets information about a time series
	     * @param parser - The command parser
	     * @param key - The key name of the time series
	     */
	    parseCommand(parser, key) {
	        parser.push('TS.INFO');
	        parser.pushKey(key);
	    },
	    transformReply: {
	        2: (reply, _, typeMapping) => {
	            const ret = {};
	            for (let i = 0; i < reply.length; i += 2) {
	                const key = reply[i].toString();
	                switch (key) {
	                    case 'totalSamples':
	                    case 'memoryUsage':
	                    case 'firstTimestamp':
	                    case 'lastTimestamp':
	                    case 'retentionTime':
	                    case 'chunkCount':
	                    case 'chunkSize':
	                    case 'chunkType':
	                    case 'duplicatePolicy':
	                    case 'sourceKey':
	                    case 'ignoreMaxTimeDiff':
	                        ret[key] = reply[i + 1];
	                        break;
	                    case 'labels':
	                        ret[key] = reply[i + 1].map(([name, value]) => ({
	                            name,
	                            value
	                        }));
	                        break;
	                    case 'rules':
	                        ret[key] = reply[i + 1].map(([key, timeBucket, aggregationType]) => ({
	                            key,
	                            timeBucket,
	                            aggregationType
	                        }));
	                        break;
	                    case 'ignoreMaxValDiff':
	                        ret[key] = generic_transformers_1.transformDoubleReply[2](reply[27], undefined, typeMapping);
	                        break;
	                }
	            }
	            return ret;
	        },
	        3: undefined
	    },
	    unstableResp3: true
	};
	
	return INFO;
}

var hasRequiredINFO_DEBUG;

function requireINFO_DEBUG () {
	if (hasRequiredINFO_DEBUG) return INFO_DEBUG;
	hasRequiredINFO_DEBUG = 1;
	var __importDefault = (INFO_DEBUG && INFO_DEBUG.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(INFO_DEBUG, "__esModule", { value: true });
	const INFO_1 = __importDefault(requireINFO());
	INFO_DEBUG.default = {
	    IS_READ_ONLY: INFO_1.default.IS_READ_ONLY,
	    /**
	     * Gets debug information about a time series
	     * @param parser - The command parser
	     * @param key - The key name of the time series
	     */
	    parseCommand(parser, key) {
	        INFO_1.default.parseCommand(parser, key);
	        parser.push('DEBUG');
	    },
	    transformReply: {
	        2: (reply, _, typeMapping) => {
	            const ret = INFO_1.default.transformReply[2](reply, _, typeMapping);
	            for (let i = 0; i < reply.length; i += 2) {
	                const key = reply[i].toString();
	                switch (key) {
	                    case 'keySelfName': {
	                        ret[key] = reply[i + 1];
	                        break;
	                    }
	                    case 'Chunks': {
	                        ret['chunks'] = reply[i + 1].map(chunk => ({
	                            startTimestamp: chunk[1],
	                            endTimestamp: chunk[3],
	                            samples: chunk[5],
	                            size: chunk[7],
	                            bytesPerSample: chunk[9]
	                        }));
	                        break;
	                    }
	                }
	            }
	            return ret;
	        },
	        3: undefined
	    },
	    unstableResp3: true
	};
	
	return INFO_DEBUG;
}

var MADD = {};

var hasRequiredMADD;

function requireMADD () {
	if (hasRequiredMADD) return MADD;
	hasRequiredMADD = 1;
	Object.defineProperty(MADD, "__esModule", { value: true });
	const helpers_1 = requireHelpers();
	MADD.default = {
	    IS_READ_ONLY: false,
	    /**
	     * Adds multiple samples to multiple time series
	     * @param parser - The command parser
	     * @param toAdd - Array of samples to add to different time series
	     */
	    parseCommand(parser, toAdd) {
	        parser.push('TS.MADD');
	        for (const { key, timestamp, value } of toAdd) {
	            parser.pushKey(key);
	            parser.push((0, helpers_1.transformTimestampArgument)(timestamp), value.toString());
	        }
	    },
	    transformReply: undefined
	};
	
	return MADD;
}

var MGET_SELECTED_LABELS = {};

var MGET = {};

var hasRequiredMGET;

function requireMGET () {
	if (hasRequiredMGET) return MGET;
	hasRequiredMGET = 1;
	Object.defineProperty(MGET, "__esModule", { value: true });
	MGET.parseFilterArgument = MGET.parseLatestArgument = void 0;
	const helpers_1 = requireHelpers();
	/**
	 * Adds LATEST argument to command if specified
	 * @param parser - The command parser
	 * @param latest - Whether to include the LATEST argument
	 */
	function parseLatestArgument(parser, latest) {
	    if (latest) {
	        parser.push('LATEST');
	    }
	}
	MGET.parseLatestArgument = parseLatestArgument;
	/**
	 * Adds FILTER argument to command
	 * @param parser - The command parser
	 * @param filter - Filter to match time series keys
	 */
	function parseFilterArgument(parser, filter) {
	    parser.push('FILTER');
	    parser.pushVariadic(filter);
	}
	MGET.parseFilterArgument = parseFilterArgument;
	MGET.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Gets the last samples matching a specific filter from multiple time series
	     * @param parser - The command parser
	     * @param filter - Filter to match time series keys
	     * @param options - Optional parameters for the command
	     */
	    parseCommand(parser, filter, options) {
	        parser.push('TS.MGET');
	        parseLatestArgument(parser, options?.LATEST);
	        parseFilterArgument(parser, filter);
	    },
	    transformReply: {
	        2(reply, _, typeMapping) {
	            return (0, helpers_1.resp2MapToValue)(reply, ([, , sample]) => {
	                return {
	                    sample: helpers_1.transformSampleReply[2](sample)
	                };
	            }, typeMapping);
	        },
	        3(reply) {
	            return (0, helpers_1.resp3MapToValue)(reply, ([, sample]) => {
	                return {
	                    sample: helpers_1.transformSampleReply[3](sample)
	                };
	            });
	        }
	    }
	};
	
	return MGET;
}

var MGET_WITHLABELS = {};

var hasRequiredMGET_WITHLABELS;

function requireMGET_WITHLABELS () {
	if (hasRequiredMGET_WITHLABELS) return MGET_WITHLABELS;
	hasRequiredMGET_WITHLABELS = 1;
	Object.defineProperty(MGET_WITHLABELS, "__esModule", { value: true });
	MGET_WITHLABELS.createTransformMGetLabelsReply = void 0;
	const MGET_1 = requireMGET();
	const helpers_1 = requireHelpers();
	function createTransformMGetLabelsReply() {
	    return {
	        2(reply, _, typeMapping) {
	            return (0, helpers_1.resp2MapToValue)(reply, ([, labels, sample]) => {
	                return {
	                    labels: (0, helpers_1.transformRESP2Labels)(labels),
	                    sample: helpers_1.transformSampleReply[2](sample)
	                };
	            }, typeMapping);
	        },
	        3(reply) {
	            return (0, helpers_1.resp3MapToValue)(reply, ([labels, sample]) => {
	                return {
	                    labels,
	                    sample: helpers_1.transformSampleReply[3](sample)
	                };
	            });
	        }
	    };
	}
	MGET_WITHLABELS.createTransformMGetLabelsReply = createTransformMGetLabelsReply;
	MGET_WITHLABELS.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Gets the last samples matching a specific filter with labels
	     * @param parser - The command parser
	     * @param filter - Filter to match time series keys
	     * @param options - Optional parameters for the command
	     */
	    parseCommand(parser, filter, options) {
	        parser.push('TS.MGET');
	        (0, MGET_1.parseLatestArgument)(parser, options?.LATEST);
	        parser.push('WITHLABELS');
	        (0, MGET_1.parseFilterArgument)(parser, filter);
	    },
	    transformReply: createTransformMGetLabelsReply(),
	};
	
	return MGET_WITHLABELS;
}

var hasRequiredMGET_SELECTED_LABELS;

function requireMGET_SELECTED_LABELS () {
	if (hasRequiredMGET_SELECTED_LABELS) return MGET_SELECTED_LABELS;
	hasRequiredMGET_SELECTED_LABELS = 1;
	Object.defineProperty(MGET_SELECTED_LABELS, "__esModule", { value: true });
	const MGET_1 = requireMGET();
	const helpers_1 = requireHelpers();
	const MGET_WITHLABELS_1 = requireMGET_WITHLABELS();
	MGET_SELECTED_LABELS.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Gets the last samples matching a specific filter with selected labels
	     * @param parser - The command parser
	     * @param filter - Filter to match time series keys
	     * @param selectedLabels - Labels to include in the output
	     * @param options - Optional parameters for the command
	     */
	    parseCommand(parser, filter, selectedLabels, options) {
	        parser.push('TS.MGET');
	        (0, MGET_1.parseLatestArgument)(parser, options?.LATEST);
	        (0, helpers_1.parseSelectedLabelsArguments)(parser, selectedLabels);
	        (0, MGET_1.parseFilterArgument)(parser, filter);
	    },
	    transformReply: (0, MGET_WITHLABELS_1.createTransformMGetLabelsReply)(),
	};
	
	return MGET_SELECTED_LABELS;
}

var MRANGE_GROUPBY = {};

var RANGE = {};

var hasRequiredRANGE;

function requireRANGE () {
	if (hasRequiredRANGE) return RANGE;
	hasRequiredRANGE = 1;
	Object.defineProperty(RANGE, "__esModule", { value: true });
	RANGE.transformRangeArguments = RANGE.parseRangeArguments = RANGE.TIME_SERIES_BUCKET_TIMESTAMP = void 0;
	const helpers_1 = requireHelpers();
	RANGE.TIME_SERIES_BUCKET_TIMESTAMP = {
	    LOW: '-',
	    MIDDLE: '~',
	    END: '+'
	};
	function parseRangeArguments(parser, fromTimestamp, toTimestamp, options) {
	    parser.push((0, helpers_1.transformTimestampArgument)(fromTimestamp), (0, helpers_1.transformTimestampArgument)(toTimestamp));
	    if (options?.LATEST) {
	        parser.push('LATEST');
	    }
	    if (options?.FILTER_BY_TS) {
	        parser.push('FILTER_BY_TS');
	        for (const timestamp of options.FILTER_BY_TS) {
	            parser.push((0, helpers_1.transformTimestampArgument)(timestamp));
	        }
	    }
	    if (options?.FILTER_BY_VALUE) {
	        parser.push('FILTER_BY_VALUE', options.FILTER_BY_VALUE.min.toString(), options.FILTER_BY_VALUE.max.toString());
	    }
	    if (options?.COUNT !== undefined) {
	        parser.push('COUNT', options.COUNT.toString());
	    }
	    if (options?.AGGREGATION) {
	        if (options?.ALIGN !== undefined) {
	            parser.push('ALIGN', (0, helpers_1.transformTimestampArgument)(options.ALIGN));
	        }
	        parser.push('AGGREGATION', options.AGGREGATION.type, (0, helpers_1.transformTimestampArgument)(options.AGGREGATION.timeBucket));
	        if (options.AGGREGATION.BUCKETTIMESTAMP) {
	            parser.push('BUCKETTIMESTAMP', options.AGGREGATION.BUCKETTIMESTAMP);
	        }
	        if (options.AGGREGATION.EMPTY) {
	            parser.push('EMPTY');
	        }
	    }
	}
	RANGE.parseRangeArguments = parseRangeArguments;
	function transformRangeArguments(parser, key, fromTimestamp, toTimestamp, options) {
	    parser.pushKey(key);
	    parseRangeArguments(parser, fromTimestamp, toTimestamp, options);
	}
	RANGE.transformRangeArguments = transformRangeArguments;
	RANGE.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Gets samples from a time series within a time range
	     * @param args - Arguments passed to the {@link transformRangeArguments} function
	     */
	    parseCommand(...args) {
	        const parser = args[0];
	        parser.push('TS.RANGE');
	        transformRangeArguments(...args);
	    },
	    transformReply: {
	        2(reply) {
	            return helpers_1.transformSamplesReply[2](reply);
	        },
	        3(reply) {
	            return helpers_1.transformSamplesReply[3](reply);
	        }
	    }
	};
	
	return RANGE;
}

var hasRequiredMRANGE_GROUPBY;

function requireMRANGE_GROUPBY () {
	if (hasRequiredMRANGE_GROUPBY) return MRANGE_GROUPBY;
	hasRequiredMRANGE_GROUPBY = 1;
	Object.defineProperty(MRANGE_GROUPBY, "__esModule", { value: true });
	MRANGE_GROUPBY.extractResp3MRangeSources = MRANGE_GROUPBY.createTransformMRangeGroupByArguments = MRANGE_GROUPBY.parseGroupByArguments = MRANGE_GROUPBY.TIME_SERIES_REDUCERS = void 0;
	const helpers_1 = requireHelpers();
	const RANGE_1 = requireRANGE();
	const MGET_1 = requireMGET();
	MRANGE_GROUPBY.TIME_SERIES_REDUCERS = {
	    AVG: 'AVG',
	    SUM: 'SUM',
	    MIN: 'MIN',
	    MAX: 'MAX',
	    RANGE: 'RANGE',
	    COUNT: 'COUNT',
	    STD_P: 'STD.P',
	    STD_S: 'STD.S',
	    VAR_P: 'VAR.P',
	    VAR_S: 'VAR.S'
	};
	/**
	 * Adds GROUPBY arguments to command
	 * @param parser - The command parser
	 * @param groupBy - Group by parameters
	 */
	function parseGroupByArguments(parser, groupBy) {
	    parser.push('GROUPBY', groupBy.label, 'REDUCE', groupBy.REDUCE);
	}
	MRANGE_GROUPBY.parseGroupByArguments = parseGroupByArguments;
	/**
	 * Creates a function that parses arguments for multi-range commands with grouping
	 * @param command - The command name to use (TS.MRANGE or TS.MREVRANGE)
	 */
	function createTransformMRangeGroupByArguments(command) {
	    return (parser, fromTimestamp, toTimestamp, filter, groupBy, options) => {
	        parser.push(command);
	        (0, RANGE_1.parseRangeArguments)(parser, fromTimestamp, toTimestamp, options);
	        (0, MGET_1.parseFilterArgument)(parser, filter);
	        parseGroupByArguments(parser, groupBy);
	    };
	}
	MRANGE_GROUPBY.createTransformMRangeGroupByArguments = createTransformMRangeGroupByArguments;
	/**
	 * Extracts source keys from RESP3 metadata reply
	 * @param raw - Raw metadata from RESP3 reply
	 */
	function extractResp3MRangeSources(raw) {
	    const unwrappedMetadata2 = raw;
	    if (unwrappedMetadata2 instanceof Map) {
	        return unwrappedMetadata2.get('sources');
	    }
	    else if (unwrappedMetadata2 instanceof Array) {
	        return unwrappedMetadata2[1];
	    }
	    else {
	        return unwrappedMetadata2.sources;
	    }
	}
	MRANGE_GROUPBY.extractResp3MRangeSources = extractResp3MRangeSources;
	MRANGE_GROUPBY.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Gets samples for time series matching a filter within a time range with grouping
	     * @param parser - The command parser
	     * @param fromTimestamp - Start timestamp for range
	     * @param toTimestamp - End timestamp for range
	     * @param filter - Filter to match time series keys
	     * @param groupBy - Group by parameters
	     * @param options - Optional parameters for the command
	     */
	    parseCommand: createTransformMRangeGroupByArguments('TS.MRANGE'),
	    transformReply: {
	        2(reply, _, typeMapping) {
	            return (0, helpers_1.resp2MapToValue)(reply, ([_key, _labels, samples]) => {
	                return {
	                    samples: helpers_1.transformSamplesReply[2](samples)
	                };
	            }, typeMapping);
	        },
	        3(reply) {
	            return (0, helpers_1.resp3MapToValue)(reply, ([_labels, _metadata1, metadata2, samples]) => {
	                return {
	                    sources: extractResp3MRangeSources(metadata2),
	                    samples: helpers_1.transformSamplesReply[3](samples)
	                };
	            });
	        }
	    },
	};
	
	return MRANGE_GROUPBY;
}

var MRANGE_SELECTED_LABELS_GROUPBY = {};

var MRANGE_SELECTED_LABELS = {};

var hasRequiredMRANGE_SELECTED_LABELS;

function requireMRANGE_SELECTED_LABELS () {
	if (hasRequiredMRANGE_SELECTED_LABELS) return MRANGE_SELECTED_LABELS;
	hasRequiredMRANGE_SELECTED_LABELS = 1;
	Object.defineProperty(MRANGE_SELECTED_LABELS, "__esModule", { value: true });
	MRANGE_SELECTED_LABELS.createTransformMRangeSelectedLabelsArguments = void 0;
	const helpers_1 = requireHelpers();
	const RANGE_1 = requireRANGE();
	const MGET_1 = requireMGET();
	/**
	 * Creates a function that parses arguments for multi-range commands with selected labels
	 * @param command - The command name to use (TS.MRANGE or TS.MREVRANGE)
	 */
	function createTransformMRangeSelectedLabelsArguments(command) {
	    return (parser, fromTimestamp, toTimestamp, selectedLabels, filter, options) => {
	        parser.push(command);
	        (0, RANGE_1.parseRangeArguments)(parser, fromTimestamp, toTimestamp, options);
	        (0, helpers_1.parseSelectedLabelsArguments)(parser, selectedLabels);
	        (0, MGET_1.parseFilterArgument)(parser, filter);
	    };
	}
	MRANGE_SELECTED_LABELS.createTransformMRangeSelectedLabelsArguments = createTransformMRangeSelectedLabelsArguments;
	MRANGE_SELECTED_LABELS.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Gets samples for time series matching a filter with selected labels
	     * @param parser - The command parser
	     * @param fromTimestamp - Start timestamp for range
	     * @param toTimestamp - End timestamp for range
	     * @param selectedLabels - Labels to include in the output
	     * @param filter - Filter to match time series keys
	     * @param options - Optional parameters for the command
	     */
	    parseCommand: createTransformMRangeSelectedLabelsArguments('TS.MRANGE'),
	    transformReply: {
	        2(reply, _, typeMapping) {
	            return (0, helpers_1.resp2MapToValue)(reply, ([_key, labels, samples]) => {
	                return {
	                    labels: (0, helpers_1.transformRESP2Labels)(labels, typeMapping),
	                    samples: helpers_1.transformSamplesReply[2](samples)
	                };
	            }, typeMapping);
	        },
	        3(reply) {
	            return (0, helpers_1.resp3MapToValue)(reply, ([_key, labels, samples]) => {
	                return {
	                    labels,
	                    samples: helpers_1.transformSamplesReply[3](samples)
	                };
	            });
	        }
	    },
	};
	
	return MRANGE_SELECTED_LABELS;
}

var hasRequiredMRANGE_SELECTED_LABELS_GROUPBY;

function requireMRANGE_SELECTED_LABELS_GROUPBY () {
	if (hasRequiredMRANGE_SELECTED_LABELS_GROUPBY) return MRANGE_SELECTED_LABELS_GROUPBY;
	hasRequiredMRANGE_SELECTED_LABELS_GROUPBY = 1;
	var __importDefault = (MRANGE_SELECTED_LABELS_GROUPBY && MRANGE_SELECTED_LABELS_GROUPBY.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(MRANGE_SELECTED_LABELS_GROUPBY, "__esModule", { value: true });
	MRANGE_SELECTED_LABELS_GROUPBY.createMRangeSelectedLabelsGroupByTransformArguments = void 0;
	const helpers_1 = requireHelpers();
	const RANGE_1 = requireRANGE();
	const MRANGE_GROUPBY_1 = requireMRANGE_GROUPBY();
	const MGET_1 = requireMGET();
	const MRANGE_SELECTED_LABELS_1 = __importDefault(requireMRANGE_SELECTED_LABELS());
	/**
	 * Creates a function that parses arguments for multi-range commands with selected labels and grouping
	 * @param command - The command name to use (TS.MRANGE or TS.MREVRANGE)
	 */
	function createMRangeSelectedLabelsGroupByTransformArguments(command) {
	    return (parser, fromTimestamp, toTimestamp, selectedLabels, filter, groupBy, options) => {
	        parser.push(command);
	        (0, RANGE_1.parseRangeArguments)(parser, fromTimestamp, toTimestamp, options);
	        (0, helpers_1.parseSelectedLabelsArguments)(parser, selectedLabels);
	        (0, MGET_1.parseFilterArgument)(parser, filter);
	        (0, MRANGE_GROUPBY_1.parseGroupByArguments)(parser, groupBy);
	    };
	}
	MRANGE_SELECTED_LABELS_GROUPBY.createMRangeSelectedLabelsGroupByTransformArguments = createMRangeSelectedLabelsGroupByTransformArguments;
	MRANGE_SELECTED_LABELS_GROUPBY.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Gets samples for time series matching a filter with selected labels and grouping
	     * @param parser - The command parser
	     * @param fromTimestamp - Start timestamp for range
	     * @param toTimestamp - End timestamp for range
	     * @param selectedLabels - Labels to include in the output
	     * @param filter - Filter to match time series keys
	     * @param groupBy - Group by parameters
	     * @param options - Optional parameters for the command
	     */
	    parseCommand: createMRangeSelectedLabelsGroupByTransformArguments('TS.MRANGE'),
	    transformReply: {
	        2: MRANGE_SELECTED_LABELS_1.default.transformReply[2],
	        3(reply) {
	            return (0, helpers_1.resp3MapToValue)(reply, ([labels, _metadata, metadata2, samples]) => {
	                return {
	                    labels,
	                    sources: (0, MRANGE_GROUPBY_1.extractResp3MRangeSources)(metadata2),
	                    samples: helpers_1.transformSamplesReply[3](samples)
	                };
	            });
	        }
	    },
	};
	
	return MRANGE_SELECTED_LABELS_GROUPBY;
}

var MRANGE_WITHLABELS_GROUPBY = {};

var hasRequiredMRANGE_WITHLABELS_GROUPBY;

function requireMRANGE_WITHLABELS_GROUPBY () {
	if (hasRequiredMRANGE_WITHLABELS_GROUPBY) return MRANGE_WITHLABELS_GROUPBY;
	hasRequiredMRANGE_WITHLABELS_GROUPBY = 1;
	Object.defineProperty(MRANGE_WITHLABELS_GROUPBY, "__esModule", { value: true });
	MRANGE_WITHLABELS_GROUPBY.createMRangeWithLabelsGroupByTransformArguments = void 0;
	const helpers_1 = requireHelpers();
	const RANGE_1 = requireRANGE();
	const MRANGE_GROUPBY_1 = requireMRANGE_GROUPBY();
	const MGET_1 = requireMGET();
	function createMRangeWithLabelsGroupByTransformArguments(command) {
	    return (parser, fromTimestamp, toTimestamp, filter, groupBy, options) => {
	        parser.push(command);
	        (0, RANGE_1.parseRangeArguments)(parser, fromTimestamp, toTimestamp, options);
	        parser.push('WITHLABELS');
	        (0, MGET_1.parseFilterArgument)(parser, filter);
	        (0, MRANGE_GROUPBY_1.parseGroupByArguments)(parser, groupBy);
	    };
	}
	MRANGE_WITHLABELS_GROUPBY.createMRangeWithLabelsGroupByTransformArguments = createMRangeWithLabelsGroupByTransformArguments;
	MRANGE_WITHLABELS_GROUPBY.default = {
	    IS_READ_ONLY: true,
	    /**
	     * Gets samples for time series matching a filter with labels and grouping
	     * @param parser - The command parser
	     * @param fromTimestamp - Start timestamp for range
	     * @param toTimestamp - End timestamp for range
	     * @param filter - Filter to match time series keys
	     * @param groupBy - Group by parameters
	     * @param options - Optional parameters for the command
	     */
	    parseCommand: createMRangeWithLabelsGroupByTransformArguments('TS.MRANGE'),
	    transformReply: {
	        2(reply, _, typeMapping) {
	            return (0, helpers_1.resp2MapToValue)(reply, ([_key, labels, samples]) => {
	                const transformed = (0, helpers_1.transformRESP2LabelsWithSources)(labels);
	                return {
	                    labels: transformed.labels,
	                    sources: transformed.sources,
	                    samples: helpers_1.transformSamplesReply[2](samples)
	                };
	            }, typeMapping);
	        },
	        3(reply) {
	            return (0, helpers_1.resp3MapToValue)(reply, ([labels, _metadata, metadata2, samples]) => {
	                return {
	                    labels,
	                    sources: (0, MRANGE_GROUPBY_1.extractResp3MRangeSources)(metadata2),
	                    samples: helpers_1.transformSamplesReply[3](samples)
	                };
	            });
	        }
	    },
	};
	
	return MRANGE_WITHLABELS_GROUPBY;
}

var MRANGE_WITHLABELS = {};

var hasRequiredMRANGE_WITHLABELS;

function requireMRANGE_WITHLABELS () {
	if (hasRequiredMRANGE_WITHLABELS) return MRANGE_WITHLABELS;
	hasRequiredMRANGE_WITHLABELS = 1;
	Object.defineProperty(MRANGE_WITHLABELS, "__esModule", { value: true });
	MRANGE_WITHLABELS.createTransformMRangeWithLabelsArguments = void 0;
	const helpers_1 = requireHelpers();
	const RANGE_1 = requireRANGE();
	const MGET_1 = requireMGET();
	/**
	 * Creates a function that parses arguments for multi-range commands with labels
	 * @param command - The command name to use (TS.MRANGE or TS.MREVRANGE)
	 */
	function createTransformMRangeWithLabelsArguments(command) {
	    return (parser, fromTimestamp, toTimestamp, filter, options) => {
	        parser.push(command);
	        (0, RANGE_1.parseRangeArguments)(parser, fromTimestamp, toTimestamp, options);
	        parser.push('WITHLABELS');
	        (0, MGET_1.parseFilterArgument)(parser, filter);
	    };
	}
	MRANGE_WITHLABELS.createTransformMRangeWithLabelsArguments = createTransformMRangeWithLabelsArguments;
	MRANGE_WITHLABELS.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Gets samples for time series matching a filter with labels
	     * @param parser - The command parser
	     * @param fromTimestamp - Start timestamp for range
	     * @param toTimestamp - End timestamp for range
	     * @param filter - Filter to match time series keys
	     * @param options - Optional parameters for the command
	     */
	    parseCommand: createTransformMRangeWithLabelsArguments('TS.MRANGE'),
	    transformReply: {
	        2(reply, _, typeMapping) {
	            return (0, helpers_1.resp2MapToValue)(reply, ([_key, labels, samples]) => {
	                const unwrappedLabels = labels;
	                // TODO: use Map type mapping for labels
	                const labelsObject = Object.create(null);
	                for (const tuple of unwrappedLabels) {
	                    const [key, value] = tuple;
	                    const unwrappedKey = key;
	                    labelsObject[unwrappedKey.toString()] = value;
	                }
	                return {
	                    labels: labelsObject,
	                    samples: helpers_1.transformSamplesReply[2](samples)
	                };
	            }, typeMapping);
	        },
	        3(reply) {
	            return (0, helpers_1.resp3MapToValue)(reply, ([labels, _metadata, samples]) => {
	                return {
	                    labels,
	                    samples: helpers_1.transformSamplesReply[3](samples)
	                };
	            });
	        }
	    },
	};
	
	return MRANGE_WITHLABELS;
}

var MRANGE = {};

var hasRequiredMRANGE;

function requireMRANGE () {
	if (hasRequiredMRANGE) return MRANGE;
	hasRequiredMRANGE = 1;
	Object.defineProperty(MRANGE, "__esModule", { value: true });
	MRANGE.createTransformMRangeArguments = void 0;
	const helpers_1 = requireHelpers();
	const RANGE_1 = requireRANGE();
	const MGET_1 = requireMGET();
	/**
	 * Creates a function that parses arguments for multi-range commands
	 * @param command - The command name to use (TS.MRANGE or TS.MREVRANGE)
	 */
	function createTransformMRangeArguments(command) {
	    return (parser, fromTimestamp, toTimestamp, filter, options) => {
	        parser.push(command);
	        (0, RANGE_1.parseRangeArguments)(parser, fromTimestamp, toTimestamp, options);
	        (0, MGET_1.parseFilterArgument)(parser, filter);
	    };
	}
	MRANGE.createTransformMRangeArguments = createTransformMRangeArguments;
	MRANGE.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Gets samples for time series matching a specific filter within a time range
	     * @param parser - The command parser
	     * @param fromTimestamp - Start timestamp for range
	     * @param toTimestamp - End timestamp for range
	     * @param filter - Filter to match time series keys
	     * @param options - Optional parameters for the command
	     */
	    parseCommand: createTransformMRangeArguments('TS.MRANGE'),
	    transformReply: {
	        2(reply, _, typeMapping) {
	            return (0, helpers_1.resp2MapToValue)(reply, ([_key, _labels, samples]) => {
	                return helpers_1.transformSamplesReply[2](samples);
	            }, typeMapping);
	        },
	        3(reply) {
	            return (0, helpers_1.resp3MapToValue)(reply, ([_labels, _metadata, samples]) => {
	                return helpers_1.transformSamplesReply[3](samples);
	            });
	        }
	    },
	};
	
	return MRANGE;
}

var MREVRANGE_GROUPBY = {};

var hasRequiredMREVRANGE_GROUPBY;

function requireMREVRANGE_GROUPBY () {
	if (hasRequiredMREVRANGE_GROUPBY) return MREVRANGE_GROUPBY;
	hasRequiredMREVRANGE_GROUPBY = 1;
	var __createBinding = (MREVRANGE_GROUPBY && MREVRANGE_GROUPBY.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (MREVRANGE_GROUPBY && MREVRANGE_GROUPBY.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar = (MREVRANGE_GROUPBY && MREVRANGE_GROUPBY.__importStar) || function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
	    __setModuleDefault(result, mod);
	    return result;
	};
	Object.defineProperty(MREVRANGE_GROUPBY, "__esModule", { value: true });
	const MRANGE_GROUPBY_1 = __importStar(requireMRANGE_GROUPBY());
	MREVRANGE_GROUPBY.default = {
	    IS_READ_ONLY: MRANGE_GROUPBY_1.default.IS_READ_ONLY,
	    /**
	     * Gets samples for time series matching a filter within a time range with grouping (in reverse order)
	     * @param parser - The command parser
	     * @param fromTimestamp - Start timestamp for range
	     * @param toTimestamp - End timestamp for range
	     * @param filter - Filter to match time series keys
	     * @param groupBy - Group by parameters
	     * @param options - Optional parameters for the command
	     */
	    parseCommand: (0, MRANGE_GROUPBY_1.createTransformMRangeGroupByArguments)('TS.MREVRANGE'),
	    transformReply: MRANGE_GROUPBY_1.default.transformReply,
	};
	
	return MREVRANGE_GROUPBY;
}

var MREVRANGE_SELECTED_LABELS_GROUPBY = {};

var hasRequiredMREVRANGE_SELECTED_LABELS_GROUPBY;

function requireMREVRANGE_SELECTED_LABELS_GROUPBY () {
	if (hasRequiredMREVRANGE_SELECTED_LABELS_GROUPBY) return MREVRANGE_SELECTED_LABELS_GROUPBY;
	hasRequiredMREVRANGE_SELECTED_LABELS_GROUPBY = 1;
	var __createBinding = (MREVRANGE_SELECTED_LABELS_GROUPBY && MREVRANGE_SELECTED_LABELS_GROUPBY.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (MREVRANGE_SELECTED_LABELS_GROUPBY && MREVRANGE_SELECTED_LABELS_GROUPBY.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar = (MREVRANGE_SELECTED_LABELS_GROUPBY && MREVRANGE_SELECTED_LABELS_GROUPBY.__importStar) || function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
	    __setModuleDefault(result, mod);
	    return result;
	};
	Object.defineProperty(MREVRANGE_SELECTED_LABELS_GROUPBY, "__esModule", { value: true });
	const MRANGE_SELECTED_LABELS_GROUPBY_1 = __importStar(requireMRANGE_SELECTED_LABELS_GROUPBY());
	MREVRANGE_SELECTED_LABELS_GROUPBY.default = {
	    IS_READ_ONLY: MRANGE_SELECTED_LABELS_GROUPBY_1.default.IS_READ_ONLY,
	    /**
	     * Gets samples for time series matching a filter with selected labels and grouping (in reverse order)
	     * @param parser - The command parser
	     * @param fromTimestamp - Start timestamp for range
	     * @param toTimestamp - End timestamp for range
	     * @param selectedLabels - Labels to include in the output
	     * @param filter - Filter to match time series keys
	     * @param groupBy - Group by parameters
	     * @param options - Optional parameters for the command
	     */
	    parseCommand: (0, MRANGE_SELECTED_LABELS_GROUPBY_1.createMRangeSelectedLabelsGroupByTransformArguments)('TS.MREVRANGE'),
	    transformReply: MRANGE_SELECTED_LABELS_GROUPBY_1.default.transformReply,
	};
	
	return MREVRANGE_SELECTED_LABELS_GROUPBY;
}

var MREVRANGE_SELECTED_LABELS = {};

var hasRequiredMREVRANGE_SELECTED_LABELS;

function requireMREVRANGE_SELECTED_LABELS () {
	if (hasRequiredMREVRANGE_SELECTED_LABELS) return MREVRANGE_SELECTED_LABELS;
	hasRequiredMREVRANGE_SELECTED_LABELS = 1;
	var __createBinding = (MREVRANGE_SELECTED_LABELS && MREVRANGE_SELECTED_LABELS.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (MREVRANGE_SELECTED_LABELS && MREVRANGE_SELECTED_LABELS.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar = (MREVRANGE_SELECTED_LABELS && MREVRANGE_SELECTED_LABELS.__importStar) || function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
	    __setModuleDefault(result, mod);
	    return result;
	};
	Object.defineProperty(MREVRANGE_SELECTED_LABELS, "__esModule", { value: true });
	const MRANGE_SELECTED_LABELS_1 = __importStar(requireMRANGE_SELECTED_LABELS());
	MREVRANGE_SELECTED_LABELS.default = {
	    IS_READ_ONLY: MRANGE_SELECTED_LABELS_1.default.IS_READ_ONLY,
	    /**
	     * Gets samples for time series matching a filter with selected labels (in reverse order)
	     * @param parser - The command parser
	     * @param fromTimestamp - Start timestamp for range
	     * @param toTimestamp - End timestamp for range
	     * @param selectedLabels - Labels to include in the output
	     * @param filter - Filter to match time series keys
	     * @param options - Optional parameters for the command
	     */
	    parseCommand: (0, MRANGE_SELECTED_LABELS_1.createTransformMRangeSelectedLabelsArguments)('TS.MREVRANGE'),
	    transformReply: MRANGE_SELECTED_LABELS_1.default.transformReply,
	};
	
	return MREVRANGE_SELECTED_LABELS;
}

var MREVRANGE_WITHLABELS_GROUPBY = {};

var hasRequiredMREVRANGE_WITHLABELS_GROUPBY;

function requireMREVRANGE_WITHLABELS_GROUPBY () {
	if (hasRequiredMREVRANGE_WITHLABELS_GROUPBY) return MREVRANGE_WITHLABELS_GROUPBY;
	hasRequiredMREVRANGE_WITHLABELS_GROUPBY = 1;
	var __createBinding = (MREVRANGE_WITHLABELS_GROUPBY && MREVRANGE_WITHLABELS_GROUPBY.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (MREVRANGE_WITHLABELS_GROUPBY && MREVRANGE_WITHLABELS_GROUPBY.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar = (MREVRANGE_WITHLABELS_GROUPBY && MREVRANGE_WITHLABELS_GROUPBY.__importStar) || function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
	    __setModuleDefault(result, mod);
	    return result;
	};
	Object.defineProperty(MREVRANGE_WITHLABELS_GROUPBY, "__esModule", { value: true });
	const MRANGE_WITHLABELS_GROUPBY_1 = __importStar(requireMRANGE_WITHLABELS_GROUPBY());
	MREVRANGE_WITHLABELS_GROUPBY.default = {
	    IS_READ_ONLY: MRANGE_WITHLABELS_GROUPBY_1.default.IS_READ_ONLY,
	    /**
	     * Gets samples for time series matching a filter with labels and grouping (in reverse order)
	     * @param parser - The command parser
	     * @param fromTimestamp - Start timestamp for range
	     * @param toTimestamp - End timestamp for range
	     * @param filter - Filter to match time series keys
	     * @param groupBy - Group by parameters
	     * @param options - Optional parameters for the command
	     */
	    parseCommand: (0, MRANGE_WITHLABELS_GROUPBY_1.createMRangeWithLabelsGroupByTransformArguments)('TS.MREVRANGE'),
	    transformReply: MRANGE_WITHLABELS_GROUPBY_1.default.transformReply,
	};
	
	return MREVRANGE_WITHLABELS_GROUPBY;
}

var MREVRANGE_WITHLABELS = {};

var hasRequiredMREVRANGE_WITHLABELS;

function requireMREVRANGE_WITHLABELS () {
	if (hasRequiredMREVRANGE_WITHLABELS) return MREVRANGE_WITHLABELS;
	hasRequiredMREVRANGE_WITHLABELS = 1;
	var __createBinding = (MREVRANGE_WITHLABELS && MREVRANGE_WITHLABELS.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (MREVRANGE_WITHLABELS && MREVRANGE_WITHLABELS.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar = (MREVRANGE_WITHLABELS && MREVRANGE_WITHLABELS.__importStar) || function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
	    __setModuleDefault(result, mod);
	    return result;
	};
	Object.defineProperty(MREVRANGE_WITHLABELS, "__esModule", { value: true });
	const MRANGE_WITHLABELS_1 = __importStar(requireMRANGE_WITHLABELS());
	MREVRANGE_WITHLABELS.default = {
	    NOT_KEYED_COMMAND: MRANGE_WITHLABELS_1.default.NOT_KEYED_COMMAND,
	    IS_READ_ONLY: MRANGE_WITHLABELS_1.default.IS_READ_ONLY,
	    /**
	     * Gets samples for time series matching a filter with labels (in reverse order)
	     * @param parser - The command parser
	     * @param fromTimestamp - Start timestamp for range
	     * @param toTimestamp - End timestamp for range
	     * @param filter - Filter to match time series keys
	     * @param options - Optional parameters for the command
	     */
	    parseCommand: (0, MRANGE_WITHLABELS_1.createTransformMRangeWithLabelsArguments)('TS.MREVRANGE'),
	    transformReply: MRANGE_WITHLABELS_1.default.transformReply,
	};
	
	return MREVRANGE_WITHLABELS;
}

var MREVRANGE = {};

var hasRequiredMREVRANGE;

function requireMREVRANGE () {
	if (hasRequiredMREVRANGE) return MREVRANGE;
	hasRequiredMREVRANGE = 1;
	var __createBinding = (MREVRANGE && MREVRANGE.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (MREVRANGE && MREVRANGE.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar = (MREVRANGE && MREVRANGE.__importStar) || function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
	    __setModuleDefault(result, mod);
	    return result;
	};
	Object.defineProperty(MREVRANGE, "__esModule", { value: true });
	const MRANGE_1 = __importStar(requireMRANGE());
	MREVRANGE.default = {
	    NOT_KEYED_COMMAND: MRANGE_1.default.NOT_KEYED_COMMAND,
	    IS_READ_ONLY: MRANGE_1.default.IS_READ_ONLY,
	    /**
	     * Gets samples for time series matching a specific filter within a time range (in reverse order)
	     * @param parser - The command parser
	     * @param fromTimestamp - Start timestamp for range
	     * @param toTimestamp - End timestamp for range
	     * @param filter - Filter to match time series keys
	     * @param options - Optional parameters for the command
	     */
	    parseCommand: (0, MRANGE_1.createTransformMRangeArguments)('TS.MREVRANGE'),
	    transformReply: MRANGE_1.default.transformReply,
	};
	
	return MREVRANGE;
}

var QUERYINDEX = {};

var hasRequiredQUERYINDEX;

function requireQUERYINDEX () {
	if (hasRequiredQUERYINDEX) return QUERYINDEX;
	hasRequiredQUERYINDEX = 1;
	Object.defineProperty(QUERYINDEX, "__esModule", { value: true });
	QUERYINDEX.default = {
	    NOT_KEYED_COMMAND: true,
	    IS_READ_ONLY: true,
	    /**
	     * Queries the index for time series matching a specific filter
	     * @param parser - The command parser
	     * @param filter - Filter to match time series labels
	     */
	    parseCommand(parser, filter) {
	        parser.push('TS.QUERYINDEX');
	        parser.pushVariadic(filter);
	    },
	    transformReply: {
	        2: undefined,
	        3: undefined
	    }
	};
	
	return QUERYINDEX;
}

var REVRANGE = {};

var hasRequiredREVRANGE;

function requireREVRANGE () {
	if (hasRequiredREVRANGE) return REVRANGE;
	hasRequiredREVRANGE = 1;
	var __createBinding = (REVRANGE && REVRANGE.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (REVRANGE && REVRANGE.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar = (REVRANGE && REVRANGE.__importStar) || function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
	    __setModuleDefault(result, mod);
	    return result;
	};
	Object.defineProperty(REVRANGE, "__esModule", { value: true });
	const RANGE_1 = __importStar(requireRANGE());
	REVRANGE.default = {
	    IS_READ_ONLY: RANGE_1.default.IS_READ_ONLY,
	    /**
	     * Gets samples from a time series within a time range (in reverse order)
	     * @param args - Arguments passed to the {@link transformRangeArguments} function
	     */
	    parseCommand(...args) {
	        const parser = args[0];
	        parser.push('TS.REVRANGE');
	        (0, RANGE_1.transformRangeArguments)(...args);
	    },
	    transformReply: RANGE_1.default.transformReply
	};
	
	return REVRANGE;
}

var hasRequiredCommands;

function requireCommands () {
	if (hasRequiredCommands) return commands;
	hasRequiredCommands = 1;
	(function (exports) {
		var __createBinding = (commands && commands.__createBinding) || (Object.create ? (function(o, m, k, k2) {
		    if (k2 === undefined) k2 = k;
		    var desc = Object.getOwnPropertyDescriptor(m, k);
		    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
		      desc = { enumerable: true, get: function() { return m[k]; } };
		    }
		    Object.defineProperty(o, k2, desc);
		}) : (function(o, m, k, k2) {
		    if (k2 === undefined) k2 = k;
		    o[k2] = m[k];
		}));
		var __exportStar = (commands && commands.__exportStar) || function(m, exports) {
		    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
		};
		var __importDefault = (commands && commands.__importDefault) || function (mod) {
		    return (mod && mod.__esModule) ? mod : { "default": mod };
		};
		Object.defineProperty(exports, "__esModule", { value: true });
		const ADD_1 = __importDefault(requireADD());
		const ALTER_1 = __importDefault(requireALTER());
		const CREATE_1 = __importDefault(requireCREATE());
		const CREATERULE_1 = __importDefault(requireCREATERULE());
		const DECRBY_1 = __importDefault(requireDECRBY());
		const DEL_1 = __importDefault(requireDEL());
		const DELETERULE_1 = __importDefault(requireDELETERULE());
		const GET_1 = __importDefault(requireGET());
		const INCRBY_1 = __importDefault(requireINCRBY());
		const INFO_DEBUG_1 = __importDefault(requireINFO_DEBUG());
		const INFO_1 = __importDefault(requireINFO());
		const MADD_1 = __importDefault(requireMADD());
		const MGET_SELECTED_LABELS_1 = __importDefault(requireMGET_SELECTED_LABELS());
		const MGET_WITHLABELS_1 = __importDefault(requireMGET_WITHLABELS());
		const MGET_1 = __importDefault(requireMGET());
		const MRANGE_GROUPBY_1 = __importDefault(requireMRANGE_GROUPBY());
		const MRANGE_SELECTED_LABELS_GROUPBY_1 = __importDefault(requireMRANGE_SELECTED_LABELS_GROUPBY());
		const MRANGE_SELECTED_LABELS_1 = __importDefault(requireMRANGE_SELECTED_LABELS());
		const MRANGE_WITHLABELS_GROUPBY_1 = __importDefault(requireMRANGE_WITHLABELS_GROUPBY());
		const MRANGE_WITHLABELS_1 = __importDefault(requireMRANGE_WITHLABELS());
		const MRANGE_1 = __importDefault(requireMRANGE());
		const MREVRANGE_GROUPBY_1 = __importDefault(requireMREVRANGE_GROUPBY());
		const MREVRANGE_SELECTED_LABELS_GROUPBY_1 = __importDefault(requireMREVRANGE_SELECTED_LABELS_GROUPBY());
		const MREVRANGE_SELECTED_LABELS_1 = __importDefault(requireMREVRANGE_SELECTED_LABELS());
		const MREVRANGE_WITHLABELS_GROUPBY_1 = __importDefault(requireMREVRANGE_WITHLABELS_GROUPBY());
		const MREVRANGE_WITHLABELS_1 = __importDefault(requireMREVRANGE_WITHLABELS());
		const MREVRANGE_1 = __importDefault(requireMREVRANGE());
		const QUERYINDEX_1 = __importDefault(requireQUERYINDEX());
		const RANGE_1 = __importDefault(requireRANGE());
		const REVRANGE_1 = __importDefault(requireREVRANGE());
		__exportStar(requireHelpers(), exports);
		exports.default = {
		    ADD: ADD_1.default,
		    add: ADD_1.default,
		    ALTER: ALTER_1.default,
		    alter: ALTER_1.default,
		    CREATE: CREATE_1.default,
		    create: CREATE_1.default,
		    CREATERULE: CREATERULE_1.default,
		    createRule: CREATERULE_1.default,
		    DECRBY: DECRBY_1.default,
		    decrBy: DECRBY_1.default,
		    DEL: DEL_1.default,
		    del: DEL_1.default,
		    DELETERULE: DELETERULE_1.default,
		    deleteRule: DELETERULE_1.default,
		    GET: GET_1.default,
		    get: GET_1.default,
		    INCRBY: INCRBY_1.default,
		    incrBy: INCRBY_1.default,
		    INFO_DEBUG: INFO_DEBUG_1.default,
		    infoDebug: INFO_DEBUG_1.default,
		    INFO: INFO_1.default,
		    info: INFO_1.default,
		    MADD: MADD_1.default,
		    mAdd: MADD_1.default,
		    MGET_SELECTED_LABELS: MGET_SELECTED_LABELS_1.default,
		    mGetSelectedLabels: MGET_SELECTED_LABELS_1.default,
		    MGET_WITHLABELS: MGET_WITHLABELS_1.default,
		    mGetWithLabels: MGET_WITHLABELS_1.default,
		    MGET: MGET_1.default,
		    mGet: MGET_1.default,
		    MRANGE_GROUPBY: MRANGE_GROUPBY_1.default,
		    mRangeGroupBy: MRANGE_GROUPBY_1.default,
		    MRANGE_SELECTED_LABELS_GROUPBY: MRANGE_SELECTED_LABELS_GROUPBY_1.default,
		    mRangeSelectedLabelsGroupBy: MRANGE_SELECTED_LABELS_GROUPBY_1.default,
		    MRANGE_SELECTED_LABELS: MRANGE_SELECTED_LABELS_1.default,
		    mRangeSelectedLabels: MRANGE_SELECTED_LABELS_1.default,
		    MRANGE_WITHLABELS_GROUPBY: MRANGE_WITHLABELS_GROUPBY_1.default,
		    mRangeWithLabelsGroupBy: MRANGE_WITHLABELS_GROUPBY_1.default,
		    MRANGE_WITHLABELS: MRANGE_WITHLABELS_1.default,
		    mRangeWithLabels: MRANGE_WITHLABELS_1.default,
		    MRANGE: MRANGE_1.default,
		    mRange: MRANGE_1.default,
		    MREVRANGE_GROUPBY: MREVRANGE_GROUPBY_1.default,
		    mRevRangeGroupBy: MREVRANGE_GROUPBY_1.default,
		    MREVRANGE_SELECTED_LABELS_GROUPBY: MREVRANGE_SELECTED_LABELS_GROUPBY_1.default,
		    mRevRangeSelectedLabelsGroupBy: MREVRANGE_SELECTED_LABELS_GROUPBY_1.default,
		    MREVRANGE_SELECTED_LABELS: MREVRANGE_SELECTED_LABELS_1.default,
		    mRevRangeSelectedLabels: MREVRANGE_SELECTED_LABELS_1.default,
		    MREVRANGE_WITHLABELS_GROUPBY: MREVRANGE_WITHLABELS_GROUPBY_1.default,
		    mRevRangeWithLabelsGroupBy: MREVRANGE_WITHLABELS_GROUPBY_1.default,
		    MREVRANGE_WITHLABELS: MREVRANGE_WITHLABELS_1.default,
		    mRevRangeWithLabels: MREVRANGE_WITHLABELS_1.default,
		    MREVRANGE: MREVRANGE_1.default,
		    mRevRange: MREVRANGE_1.default,
		    QUERYINDEX: QUERYINDEX_1.default,
		    queryIndex: QUERYINDEX_1.default,
		    RANGE: RANGE_1.default,
		    range: RANGE_1.default,
		    REVRANGE: REVRANGE_1.default,
		    revRange: REVRANGE_1.default
		};
		
	} (commands));
	return commands;
}

var hasRequiredLib;

function requireLib () {
	if (hasRequiredLib) return lib;
	hasRequiredLib = 1;
	(function (exports) {
		var __importDefault = (lib && lib.__importDefault) || function (mod) {
		    return (mod && mod.__esModule) ? mod : { "default": mod };
		};
		Object.defineProperty(exports, "__esModule", { value: true });
		exports.TIME_SERIES_REDUCERS = exports.TIME_SERIES_BUCKET_TIMESTAMP = exports.TIME_SERIES_AGGREGATION_TYPE = exports.TIME_SERIES_DUPLICATE_POLICIES = exports.TIME_SERIES_ENCODING = exports.default = void 0;
		var commands_1 = requireCommands();
		Object.defineProperty(exports, "default", { enumerable: true, get: function () { return __importDefault(commands_1).default; } });
		Object.defineProperty(exports, "TIME_SERIES_ENCODING", { enumerable: true, get: function () { return commands_1.TIME_SERIES_ENCODING; } });
		Object.defineProperty(exports, "TIME_SERIES_DUPLICATE_POLICIES", { enumerable: true, get: function () { return commands_1.TIME_SERIES_DUPLICATE_POLICIES; } });
		var CREATERULE_1 = requireCREATERULE();
		Object.defineProperty(exports, "TIME_SERIES_AGGREGATION_TYPE", { enumerable: true, get: function () { return CREATERULE_1.TIME_SERIES_AGGREGATION_TYPE; } });
		var RANGE_1 = requireRANGE();
		Object.defineProperty(exports, "TIME_SERIES_BUCKET_TIMESTAMP", { enumerable: true, get: function () { return RANGE_1.TIME_SERIES_BUCKET_TIMESTAMP; } });
		var MRANGE_GROUPBY_1 = requireMRANGE_GROUPBY();
		Object.defineProperty(exports, "TIME_SERIES_REDUCERS", { enumerable: true, get: function () { return MRANGE_GROUPBY_1.TIME_SERIES_REDUCERS; } });
		
	} (lib));
	return lib;
}

var hasRequiredDist;

function requireDist () {
	if (hasRequiredDist) return dist$1;
	hasRequiredDist = 1;
	(function (exports) {
		var __createBinding = (dist$1 && dist$1.__createBinding) || (Object.create ? (function(o, m, k, k2) {
		    if (k2 === undefined) k2 = k;
		    var desc = Object.getOwnPropertyDescriptor(m, k);
		    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
		      desc = { enumerable: true, get: function() { return m[k]; } };
		    }
		    Object.defineProperty(o, k2, desc);
		}) : (function(o, m, k, k2) {
		    if (k2 === undefined) k2 = k;
		    o[k2] = m[k];
		}));
		var __exportStar = (dist$1 && dist$1.__exportStar) || function(m, exports) {
		    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
		};
		var __importDefault = (dist$1 && dist$1.__importDefault) || function (mod) {
		    return (mod && mod.__esModule) ? mod : { "default": mod };
		};
		Object.defineProperty(exports, "__esModule", { value: true });
		exports.createSentinel = exports.createCluster = exports.createClient = void 0;
		const client_1 = requireDist$1();
		const bloom_1 = __importDefault(requireLib$3());
		const json_1 = __importDefault(requireLib$2());
		const search_1 = __importDefault(requireLib$1());
		const time_series_1 = __importDefault(requireLib());
		__exportStar(requireDist$1(), exports);
		__exportStar(requireLib$3(), exports);
		__exportStar(requireLib$2(), exports);
		__exportStar(requireLib$1(), exports);
		__exportStar(requireLib(), exports);
		const modules = {
		    ...bloom_1.default,
		    json: json_1.default,
		    ft: search_1.default,
		    ts: time_series_1.default
		};
		function createClient(options) {
		    return (0, client_1.createClient)({
		        ...options,
		        modules: {
		            ...modules,
		            ...options?.modules
		        }
		    });
		}
		exports.createClient = createClient;
		function createCluster(options) {
		    return (0, client_1.createCluster)({
		        ...options,
		        modules: {
		            ...modules,
		            ...options?.modules
		        }
		    });
		}
		exports.createCluster = createCluster;
		function createSentinel(options) {
		    return (0, client_1.createSentinel)({
		        ...options,
		        modules: {
		            ...modules,
		            ...options?.modules
		        }
		    });
		}
		exports.createSentinel = createSentinel;
		
	} (dist$1));
	return dist$1;
}

var distExports = requireDist();

var src = {exports: {}};

var browser = {exports: {}};

/**
 * Helpers.
 */

var ms;
var hasRequiredMs;

function requireMs () {
	if (hasRequiredMs) return ms;
	hasRequiredMs = 1;
	var s = 1000;
	var m = s * 60;
	var h = m * 60;
	var d = h * 24;
	var w = d * 7;
	var y = d * 365.25;

	/**
	 * Parse or format the given `val`.
	 *
	 * Options:
	 *
	 *  - `long` verbose formatting [false]
	 *
	 * @param {String|Number} val
	 * @param {Object} [options]
	 * @throws {Error} throw an error if val is not a non-empty string or a number
	 * @return {String|Number}
	 * @api public
	 */

	ms = function (val, options) {
	  options = options || {};
	  var type = typeof val;
	  if (type === 'string' && val.length > 0) {
	    return parse(val);
	  } else if (type === 'number' && isFinite(val)) {
	    return options.long ? fmtLong(val) : fmtShort(val);
	  }
	  throw new Error(
	    'val is not a non-empty string or a valid number. val=' +
	      JSON.stringify(val)
	  );
	};

	/**
	 * Parse the given `str` and return milliseconds.
	 *
	 * @param {String} str
	 * @return {Number}
	 * @api private
	 */

	function parse(str) {
	  str = String(str);
	  if (str.length > 100) {
	    return;
	  }
	  var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
	    str
	  );
	  if (!match) {
	    return;
	  }
	  var n = parseFloat(match[1]);
	  var type = (match[2] || 'ms').toLowerCase();
	  switch (type) {
	    case 'years':
	    case 'year':
	    case 'yrs':
	    case 'yr':
	    case 'y':
	      return n * y;
	    case 'weeks':
	    case 'week':
	    case 'w':
	      return n * w;
	    case 'days':
	    case 'day':
	    case 'd':
	      return n * d;
	    case 'hours':
	    case 'hour':
	    case 'hrs':
	    case 'hr':
	    case 'h':
	      return n * h;
	    case 'minutes':
	    case 'minute':
	    case 'mins':
	    case 'min':
	    case 'm':
	      return n * m;
	    case 'seconds':
	    case 'second':
	    case 'secs':
	    case 'sec':
	    case 's':
	      return n * s;
	    case 'milliseconds':
	    case 'millisecond':
	    case 'msecs':
	    case 'msec':
	    case 'ms':
	      return n;
	    default:
	      return undefined;
	  }
	}

	/**
	 * Short format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function fmtShort(ms) {
	  var msAbs = Math.abs(ms);
	  if (msAbs >= d) {
	    return Math.round(ms / d) + 'd';
	  }
	  if (msAbs >= h) {
	    return Math.round(ms / h) + 'h';
	  }
	  if (msAbs >= m) {
	    return Math.round(ms / m) + 'm';
	  }
	  if (msAbs >= s) {
	    return Math.round(ms / s) + 's';
	  }
	  return ms + 'ms';
	}

	/**
	 * Long format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function fmtLong(ms) {
	  var msAbs = Math.abs(ms);
	  if (msAbs >= d) {
	    return plural(ms, msAbs, d, 'day');
	  }
	  if (msAbs >= h) {
	    return plural(ms, msAbs, h, 'hour');
	  }
	  if (msAbs >= m) {
	    return plural(ms, msAbs, m, 'minute');
	  }
	  if (msAbs >= s) {
	    return plural(ms, msAbs, s, 'second');
	  }
	  return ms + ' ms';
	}

	/**
	 * Pluralization helper.
	 */

	function plural(ms, msAbs, n, name) {
	  var isPlural = msAbs >= n * 1.5;
	  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
	}
	return ms;
}

var common;
var hasRequiredCommon;

function requireCommon () {
	if (hasRequiredCommon) return common;
	hasRequiredCommon = 1;
	/**
	 * This is the common logic for both the Node.js and web browser
	 * implementations of `debug()`.
	 */

	function setup(env) {
		createDebug.debug = createDebug;
		createDebug.default = createDebug;
		createDebug.coerce = coerce;
		createDebug.disable = disable;
		createDebug.enable = enable;
		createDebug.enabled = enabled;
		createDebug.humanize = requireMs();
		createDebug.destroy = destroy;

		Object.keys(env).forEach(key => {
			createDebug[key] = env[key];
		});

		/**
		* The currently active debug mode names, and names to skip.
		*/

		createDebug.names = [];
		createDebug.skips = [];

		/**
		* Map of special "%n" handling functions, for the debug "format" argument.
		*
		* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
		*/
		createDebug.formatters = {};

		/**
		* Selects a color for a debug namespace
		* @param {String} namespace The namespace string for the debug instance to be colored
		* @return {Number|String} An ANSI color code for the given namespace
		* @api private
		*/
		function selectColor(namespace) {
			let hash = 0;

			for (let i = 0; i < namespace.length; i++) {
				hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
				hash |= 0; // Convert to 32bit integer
			}

			return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
		}
		createDebug.selectColor = selectColor;

		/**
		* Create a debugger with the given `namespace`.
		*
		* @param {String} namespace
		* @return {Function}
		* @api public
		*/
		function createDebug(namespace) {
			let prevTime;
			let enableOverride = null;
			let namespacesCache;
			let enabledCache;

			function debug(...args) {
				// Disabled?
				if (!debug.enabled) {
					return;
				}

				const self = debug;

				// Set `diff` timestamp
				const curr = Number(new Date());
				const ms = curr - (prevTime || curr);
				self.diff = ms;
				self.prev = prevTime;
				self.curr = curr;
				prevTime = curr;

				args[0] = createDebug.coerce(args[0]);

				if (typeof args[0] !== 'string') {
					// Anything else let's inspect with %O
					args.unshift('%O');
				}

				// Apply any `formatters` transformations
				let index = 0;
				args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
					// If we encounter an escaped % then don't increase the array index
					if (match === '%%') {
						return '%';
					}
					index++;
					const formatter = createDebug.formatters[format];
					if (typeof formatter === 'function') {
						const val = args[index];
						match = formatter.call(self, val);

						// Now we need to remove `args[index]` since it's inlined in the `format`
						args.splice(index, 1);
						index--;
					}
					return match;
				});

				// Apply env-specific formatting (colors, etc.)
				createDebug.formatArgs.call(self, args);

				const logFn = self.log || createDebug.log;
				logFn.apply(self, args);
			}

			debug.namespace = namespace;
			debug.useColors = createDebug.useColors();
			debug.color = createDebug.selectColor(namespace);
			debug.extend = extend;
			debug.destroy = createDebug.destroy; // XXX Temporary. Will be removed in the next major release.

			Object.defineProperty(debug, 'enabled', {
				enumerable: true,
				configurable: false,
				get: () => {
					if (enableOverride !== null) {
						return enableOverride;
					}
					if (namespacesCache !== createDebug.namespaces) {
						namespacesCache = createDebug.namespaces;
						enabledCache = createDebug.enabled(namespace);
					}

					return enabledCache;
				},
				set: v => {
					enableOverride = v;
				}
			});

			// Env-specific initialization logic for debug instances
			if (typeof createDebug.init === 'function') {
				createDebug.init(debug);
			}

			return debug;
		}

		function extend(namespace, delimiter) {
			const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
			newDebug.log = this.log;
			return newDebug;
		}

		/**
		* Enables a debug mode by namespaces. This can include modes
		* separated by a colon and wildcards.
		*
		* @param {String} namespaces
		* @api public
		*/
		function enable(namespaces) {
			createDebug.save(namespaces);
			createDebug.namespaces = namespaces;

			createDebug.names = [];
			createDebug.skips = [];

			const split = (typeof namespaces === 'string' ? namespaces : '')
				.trim()
				.replace(/\s+/g, ',')
				.split(',')
				.filter(Boolean);

			for (const ns of split) {
				if (ns[0] === '-') {
					createDebug.skips.push(ns.slice(1));
				} else {
					createDebug.names.push(ns);
				}
			}
		}

		/**
		 * Checks if the given string matches a namespace template, honoring
		 * asterisks as wildcards.
		 *
		 * @param {String} search
		 * @param {String} template
		 * @return {Boolean}
		 */
		function matchesTemplate(search, template) {
			let searchIndex = 0;
			let templateIndex = 0;
			let starIndex = -1;
			let matchIndex = 0;

			while (searchIndex < search.length) {
				if (templateIndex < template.length && (template[templateIndex] === search[searchIndex] || template[templateIndex] === '*')) {
					// Match character or proceed with wildcard
					if (template[templateIndex] === '*') {
						starIndex = templateIndex;
						matchIndex = searchIndex;
						templateIndex++; // Skip the '*'
					} else {
						searchIndex++;
						templateIndex++;
					}
				} else if (starIndex !== -1) { // eslint-disable-line no-negated-condition
					// Backtrack to the last '*' and try to match more characters
					templateIndex = starIndex + 1;
					matchIndex++;
					searchIndex = matchIndex;
				} else {
					return false; // No match
				}
			}

			// Handle trailing '*' in template
			while (templateIndex < template.length && template[templateIndex] === '*') {
				templateIndex++;
			}

			return templateIndex === template.length;
		}

		/**
		* Disable debug output.
		*
		* @return {String} namespaces
		* @api public
		*/
		function disable() {
			const namespaces = [
				...createDebug.names,
				...createDebug.skips.map(namespace => '-' + namespace)
			].join(',');
			createDebug.enable('');
			return namespaces;
		}

		/**
		* Returns true if the given mode name is enabled, false otherwise.
		*
		* @param {String} name
		* @return {Boolean}
		* @api public
		*/
		function enabled(name) {
			for (const skip of createDebug.skips) {
				if (matchesTemplate(name, skip)) {
					return false;
				}
			}

			for (const ns of createDebug.names) {
				if (matchesTemplate(name, ns)) {
					return true;
				}
			}

			return false;
		}

		/**
		* Coerce `val`.
		*
		* @param {Mixed} val
		* @return {Mixed}
		* @api private
		*/
		function coerce(val) {
			if (val instanceof Error) {
				return val.stack || val.message;
			}
			return val;
		}

		/**
		* XXX DO NOT USE. This is a temporary stub function.
		* XXX It WILL be removed in the next major release.
		*/
		function destroy() {
			console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
		}

		createDebug.enable(createDebug.load());

		return createDebug;
	}

	common = setup;
	return common;
}

/* eslint-env browser */

var hasRequiredBrowser;

function requireBrowser () {
	if (hasRequiredBrowser) return browser.exports;
	hasRequiredBrowser = 1;
	(function (module, exports) {
		/**
		 * This is the web browser implementation of `debug()`.
		 */

		exports.formatArgs = formatArgs;
		exports.save = save;
		exports.load = load;
		exports.useColors = useColors;
		exports.storage = localstorage();
		exports.destroy = (() => {
			let warned = false;

			return () => {
				if (!warned) {
					warned = true;
					console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
				}
			};
		})();

		/**
		 * Colors.
		 */

		exports.colors = [
			'#0000CC',
			'#0000FF',
			'#0033CC',
			'#0033FF',
			'#0066CC',
			'#0066FF',
			'#0099CC',
			'#0099FF',
			'#00CC00',
			'#00CC33',
			'#00CC66',
			'#00CC99',
			'#00CCCC',
			'#00CCFF',
			'#3300CC',
			'#3300FF',
			'#3333CC',
			'#3333FF',
			'#3366CC',
			'#3366FF',
			'#3399CC',
			'#3399FF',
			'#33CC00',
			'#33CC33',
			'#33CC66',
			'#33CC99',
			'#33CCCC',
			'#33CCFF',
			'#6600CC',
			'#6600FF',
			'#6633CC',
			'#6633FF',
			'#66CC00',
			'#66CC33',
			'#9900CC',
			'#9900FF',
			'#9933CC',
			'#9933FF',
			'#99CC00',
			'#99CC33',
			'#CC0000',
			'#CC0033',
			'#CC0066',
			'#CC0099',
			'#CC00CC',
			'#CC00FF',
			'#CC3300',
			'#CC3333',
			'#CC3366',
			'#CC3399',
			'#CC33CC',
			'#CC33FF',
			'#CC6600',
			'#CC6633',
			'#CC9900',
			'#CC9933',
			'#CCCC00',
			'#CCCC33',
			'#FF0000',
			'#FF0033',
			'#FF0066',
			'#FF0099',
			'#FF00CC',
			'#FF00FF',
			'#FF3300',
			'#FF3333',
			'#FF3366',
			'#FF3399',
			'#FF33CC',
			'#FF33FF',
			'#FF6600',
			'#FF6633',
			'#FF9900',
			'#FF9933',
			'#FFCC00',
			'#FFCC33'
		];

		/**
		 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
		 * and the Firebug extension (any Firefox version) are known
		 * to support "%c" CSS customizations.
		 *
		 * TODO: add a `localStorage` variable to explicitly enable/disable colors
		 */

		// eslint-disable-next-line complexity
		function useColors() {
			// NB: In an Electron preload script, document will be defined but not fully
			// initialized. Since we know we're in Chrome, we'll just detect this case
			// explicitly
			if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
				return true;
			}

			// Internet Explorer and Edge do not support colors.
			if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
				return false;
			}

			let m;

			// Is webkit? http://stackoverflow.com/a/16459606/376773
			// document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
			// eslint-disable-next-line no-return-assign
			return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
				// Is firebug? http://stackoverflow.com/a/398120/376773
				(typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
				// Is firefox >= v31?
				// https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
				(typeof navigator !== 'undefined' && navigator.userAgent && (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31) ||
				// Double check webkit in userAgent just in case we are in a worker
				(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
		}

		/**
		 * Colorize log arguments if enabled.
		 *
		 * @api public
		 */

		function formatArgs(args) {
			args[0] = (this.useColors ? '%c' : '') +
				this.namespace +
				(this.useColors ? ' %c' : ' ') +
				args[0] +
				(this.useColors ? '%c ' : ' ') +
				'+' + module.exports.humanize(this.diff);

			if (!this.useColors) {
				return;
			}

			const c = 'color: ' + this.color;
			args.splice(1, 0, c, 'color: inherit');

			// The final "%c" is somewhat tricky, because there could be other
			// arguments passed either before or after the %c, so we need to
			// figure out the correct index to insert the CSS into
			let index = 0;
			let lastC = 0;
			args[0].replace(/%[a-zA-Z%]/g, match => {
				if (match === '%%') {
					return;
				}
				index++;
				if (match === '%c') {
					// We only are interested in the *last* %c
					// (the user may have provided their own)
					lastC = index;
				}
			});

			args.splice(lastC, 0, c);
		}

		/**
		 * Invokes `console.debug()` when available.
		 * No-op when `console.debug` is not a "function".
		 * If `console.debug` is not available, falls back
		 * to `console.log`.
		 *
		 * @api public
		 */
		exports.log = console.debug || console.log || (() => {});

		/**
		 * Save `namespaces`.
		 *
		 * @param {String} namespaces
		 * @api private
		 */
		function save(namespaces) {
			try {
				if (namespaces) {
					exports.storage.setItem('debug', namespaces);
				} else {
					exports.storage.removeItem('debug');
				}
			} catch (error) {
				// Swallow
				// XXX (@Qix-) should we be logging these?
			}
		}

		/**
		 * Load `namespaces`.
		 *
		 * @return {String} returns the previously persisted debug modes
		 * @api private
		 */
		function load() {
			let r;
			try {
				r = exports.storage.getItem('debug') || exports.storage.getItem('DEBUG') ;
			} catch (error) {
				// Swallow
				// XXX (@Qix-) should we be logging these?
			}

			// If debug isn't set in LS, and we're in Electron, try to load $DEBUG
			if (!r && typeof process !== 'undefined' && 'env' in process) {
				r = process.env.DEBUG;
			}

			return r;
		}

		/**
		 * Localstorage attempts to return the localstorage.
		 *
		 * This is necessary because safari throws
		 * when a user disables cookies/localstorage
		 * and you attempt to access it.
		 *
		 * @return {LocalStorage}
		 * @api private
		 */

		function localstorage() {
			try {
				// TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
				// The Browser also has localStorage in the global context.
				return localStorage;
			} catch (error) {
				// Swallow
				// XXX (@Qix-) should we be logging these?
			}
		}

		module.exports = requireCommon()(exports);

		const {formatters} = module.exports;

		/**
		 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
		 */

		formatters.j = function (v) {
			try {
				return JSON.stringify(v);
			} catch (error) {
				return '[UnexpectedJSONParseError]: ' + error.message;
			}
		}; 
	} (browser, browser.exports));
	return browser.exports;
}

var node = {exports: {}};

var hasFlag;
var hasRequiredHasFlag;

function requireHasFlag () {
	if (hasRequiredHasFlag) return hasFlag;
	hasRequiredHasFlag = 1;

	hasFlag = (flag, argv = process.argv) => {
		const prefix = flag.startsWith('-') ? '' : (flag.length === 1 ? '-' : '--');
		const position = argv.indexOf(prefix + flag);
		const terminatorPosition = argv.indexOf('--');
		return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
	};
	return hasFlag;
}

var supportsColor_1;
var hasRequiredSupportsColor;

function requireSupportsColor () {
	if (hasRequiredSupportsColor) return supportsColor_1;
	hasRequiredSupportsColor = 1;
	const os = require$$0$3;
	const tty = require$$1$1;
	const hasFlag = requireHasFlag();

	const {env} = process;

	let forceColor;
	if (hasFlag('no-color') ||
		hasFlag('no-colors') ||
		hasFlag('color=false') ||
		hasFlag('color=never')) {
		forceColor = 0;
	} else if (hasFlag('color') ||
		hasFlag('colors') ||
		hasFlag('color=true') ||
		hasFlag('color=always')) {
		forceColor = 1;
	}

	if ('FORCE_COLOR' in env) {
		if (env.FORCE_COLOR === 'true') {
			forceColor = 1;
		} else if (env.FORCE_COLOR === 'false') {
			forceColor = 0;
		} else {
			forceColor = env.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(env.FORCE_COLOR, 10), 3);
		}
	}

	function translateLevel(level) {
		if (level === 0) {
			return false;
		}

		return {
			level,
			hasBasic: true,
			has256: level >= 2,
			has16m: level >= 3
		};
	}

	function supportsColor(haveStream, streamIsTTY) {
		if (forceColor === 0) {
			return 0;
		}

		if (hasFlag('color=16m') ||
			hasFlag('color=full') ||
			hasFlag('color=truecolor')) {
			return 3;
		}

		if (hasFlag('color=256')) {
			return 2;
		}

		if (haveStream && !streamIsTTY && forceColor === undefined) {
			return 0;
		}

		const min = forceColor || 0;

		if (env.TERM === 'dumb') {
			return min;
		}

		if (process.platform === 'win32') {
			// Windows 10 build 10586 is the first Windows release that supports 256 colors.
			// Windows 10 build 14931 is the first release that supports 16m/TrueColor.
			const osRelease = os.release().split('.');
			if (
				Number(osRelease[0]) >= 10 &&
				Number(osRelease[2]) >= 10586
			) {
				return Number(osRelease[2]) >= 14931 ? 3 : 2;
			}

			return 1;
		}

		if ('CI' in env) {
			if (['TRAVIS', 'CIRCLECI', 'APPVEYOR', 'GITLAB_CI', 'GITHUB_ACTIONS', 'BUILDKITE'].some(sign => sign in env) || env.CI_NAME === 'codeship') {
				return 1;
			}

			return min;
		}

		if ('TEAMCITY_VERSION' in env) {
			return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
		}

		if (env.COLORTERM === 'truecolor') {
			return 3;
		}

		if ('TERM_PROGRAM' in env) {
			const version = parseInt((env.TERM_PROGRAM_VERSION || '').split('.')[0], 10);

			switch (env.TERM_PROGRAM) {
				case 'iTerm.app':
					return version >= 3 ? 3 : 2;
				case 'Apple_Terminal':
					return 2;
				// No default
			}
		}

		if (/-256(color)?$/i.test(env.TERM)) {
			return 2;
		}

		if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
			return 1;
		}

		if ('COLORTERM' in env) {
			return 1;
		}

		return min;
	}

	function getSupportLevel(stream) {
		const level = supportsColor(stream, stream && stream.isTTY);
		return translateLevel(level);
	}

	supportsColor_1 = {
		supportsColor: getSupportLevel,
		stdout: translateLevel(supportsColor(true, tty.isatty(1))),
		stderr: translateLevel(supportsColor(true, tty.isatty(2)))
	};
	return supportsColor_1;
}

/**
 * Module dependencies.
 */

var hasRequiredNode;

function requireNode () {
	if (hasRequiredNode) return node.exports;
	hasRequiredNode = 1;
	(function (module, exports) {
		const tty = require$$1$1;
		const util = require$$1$2;

		/**
		 * This is the Node.js implementation of `debug()`.
		 */

		exports.init = init;
		exports.log = log;
		exports.formatArgs = formatArgs;
		exports.save = save;
		exports.load = load;
		exports.useColors = useColors;
		exports.destroy = util.deprecate(
			() => {},
			'Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.'
		);

		/**
		 * Colors.
		 */

		exports.colors = [6, 2, 3, 4, 5, 1];

		try {
			// Optional dependency (as in, doesn't need to be installed, NOT like optionalDependencies in package.json)
			// eslint-disable-next-line import/no-extraneous-dependencies
			const supportsColor = requireSupportsColor();

			if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
				exports.colors = [
					20,
					21,
					26,
					27,
					32,
					33,
					38,
					39,
					40,
					41,
					42,
					43,
					44,
					45,
					56,
					57,
					62,
					63,
					68,
					69,
					74,
					75,
					76,
					77,
					78,
					79,
					80,
					81,
					92,
					93,
					98,
					99,
					112,
					113,
					128,
					129,
					134,
					135,
					148,
					149,
					160,
					161,
					162,
					163,
					164,
					165,
					166,
					167,
					168,
					169,
					170,
					171,
					172,
					173,
					178,
					179,
					184,
					185,
					196,
					197,
					198,
					199,
					200,
					201,
					202,
					203,
					204,
					205,
					206,
					207,
					208,
					209,
					214,
					215,
					220,
					221
				];
			}
		} catch (error) {
			// Swallow - we only care if `supports-color` is available; it doesn't have to be.
		}

		/**
		 * Build up the default `inspectOpts` object from the environment variables.
		 *
		 *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
		 */

		exports.inspectOpts = Object.keys(process.env).filter(key => {
			return /^debug_/i.test(key);
		}).reduce((obj, key) => {
			// Camel-case
			const prop = key
				.substring(6)
				.toLowerCase()
				.replace(/_([a-z])/g, (_, k) => {
					return k.toUpperCase();
				});

			// Coerce string value into JS value
			let val = process.env[key];
			if (/^(yes|on|true|enabled)$/i.test(val)) {
				val = true;
			} else if (/^(no|off|false|disabled)$/i.test(val)) {
				val = false;
			} else if (val === 'null') {
				val = null;
			} else {
				val = Number(val);
			}

			obj[prop] = val;
			return obj;
		}, {});

		/**
		 * Is stdout a TTY? Colored output is enabled when `true`.
		 */

		function useColors() {
			return 'colors' in exports.inspectOpts ?
				Boolean(exports.inspectOpts.colors) :
				tty.isatty(process.stderr.fd);
		}

		/**
		 * Adds ANSI color escape codes if enabled.
		 *
		 * @api public
		 */

		function formatArgs(args) {
			const {namespace: name, useColors} = this;

			if (useColors) {
				const c = this.color;
				const colorCode = '\u001B[3' + (c < 8 ? c : '8;5;' + c);
				const prefix = `  ${colorCode};1m${name} \u001B[0m`;

				args[0] = prefix + args[0].split('\n').join('\n' + prefix);
				args.push(colorCode + 'm+' + module.exports.humanize(this.diff) + '\u001B[0m');
			} else {
				args[0] = getDate() + name + ' ' + args[0];
			}
		}

		function getDate() {
			if (exports.inspectOpts.hideDate) {
				return '';
			}
			return new Date().toISOString() + ' ';
		}

		/**
		 * Invokes `util.formatWithOptions()` with the specified arguments and writes to stderr.
		 */

		function log(...args) {
			return process.stderr.write(util.formatWithOptions(exports.inspectOpts, ...args) + '\n');
		}

		/**
		 * Save `namespaces`.
		 *
		 * @param {String} namespaces
		 * @api private
		 */
		function save(namespaces) {
			if (namespaces) {
				process.env.DEBUG = namespaces;
			} else {
				// If you set a process.env field to null or undefined, it gets cast to the
				// string 'null' or 'undefined'. Just delete instead.
				delete process.env.DEBUG;
			}
		}

		/**
		 * Load `namespaces`.
		 *
		 * @return {String} returns the previously persisted debug modes
		 * @api private
		 */

		function load() {
			return process.env.DEBUG;
		}

		/**
		 * Init logic for `debug` instances.
		 *
		 * Create a new `inspectOpts` object in case `useColors` is set
		 * differently for a particular `debug` instance.
		 */

		function init(debug) {
			debug.inspectOpts = {};

			const keys = Object.keys(exports.inspectOpts);
			for (let i = 0; i < keys.length; i++) {
				debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
			}
		}

		module.exports = requireCommon()(exports);

		const {formatters} = module.exports;

		/**
		 * Map %o to `util.inspect()`, all on a single line.
		 */

		formatters.o = function (v) {
			this.inspectOpts.colors = this.useColors;
			return util.inspect(v, this.inspectOpts)
				.split('\n')
				.map(str => str.trim())
				.join(' ');
		};

		/**
		 * Map %O to `util.inspect()`, allowing multiple lines if needed.
		 */

		formatters.O = function (v) {
			this.inspectOpts.colors = this.useColors;
			return util.inspect(v, this.inspectOpts);
		}; 
	} (node, node.exports));
	return node.exports;
}

/**
 * Detect Electron renderer / nwjs process, which is node, but we should
 * treat as a browser.
 */

var hasRequiredSrc;

function requireSrc () {
	if (hasRequiredSrc) return src.exports;
	hasRequiredSrc = 1;
	if (typeof process === 'undefined' || process.type === 'renderer' || process.browser === true || process.__nwjs) {
		src.exports = requireBrowser();
	} else {
		src.exports = requireNode();
	}
	return src.exports;
}

var srcExports = requireSrc();
var debug = /*@__PURE__*/getDefaultExportFromCjs(srcExports);

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
const log = debug("umami:redis-client");
const DELETED = "__DELETED__";
const logError = (err) => log(err);
class PaseoRedisClient {
  constructor(url = "") {
    __publicField(this, "url");
    __publicField(this, "client");
    __publicField(this, "isConnected");
    const client = distExports.createClient({ url }).on("error", logError);
    this.url = url;
    this.client = client;
    this.isConnected = false;
  }
  async connect() {
    if (!this.isConnected) {
      this.isConnected = true;
      await this.client.connect();
      log("Redis connected");
    }
  }
  async get(key) {
    await this.connect();
    const data = await this.client.get(key);
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
  async set(key, value) {
    await this.connect();
    return this.client.set(key, JSON.stringify(value));
  }
  async del(key) {
    await this.connect();
    return this.client.del(key);
  }
  async incr(key) {
    await this.connect();
    return this.client.incr(key);
  }
  async expire(key, seconds) {
    await this.connect();
    return this.client.expire(key, seconds);
  }
  async rateLimit(key, limit, seconds) {
    await this.connect();
    const res = await this.client.incr(key);
    if (res === 1) {
      await this.client.expire(key, seconds);
    }
    return res >= limit;
  }
  async fetch(key, query, time = 0) {
    const result = await this.get(key);
    if (result === DELETED) {
      return null;
    }
    if (!result && query) {
      return query().then(async (data) => {
        if (data) {
          await this.store(key, data, time);
        }
        return data;
      });
    }
    return result;
  }
  async store(key, data, time = 0) {
    const result = this.set(key, data);
    if (time > 0) {
      await this.expire(key, time);
    }
    return result;
  }
  async remove(key, soft = false) {
    return soft ? this.set(key, DELETED) : this.del(key);
  }
}

exports.DELETED = DELETED;
exports.PaseoRedisClient = PaseoRedisClient;
exports.log = log;
