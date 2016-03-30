.pragma library
.import Quickly 0.1 as QML_quickly

var __filename = Qt.resolvedUrl('utils.js').substring(7);
var __dirname = __filename.substring(0, __filename.lastIndexOf('/'));

var module = { exports: {} };
var exports = module.exports;
var global = {};

function require(qualifier) {
    return qualifier.module ? qualifier.module.exports : qualifier;
}

var setTimeout = global.setTimeout = QML_quickly.Polyfills.global.setTimeout;
var Symbol = global.Symbol = QML_quickly.Polyfills.global.Symbol;
var WeakMap = global.WeakMap = QML_quickly.Polyfills.global.WeakMap;
var Map = global.Map = QML_quickly.Polyfills.global.Map;
var Set = global.Set = QML_quickly.Polyfills.global.Set;
var WeakSet = global.WeakSet = QML_quickly.Polyfills.global.WeakSet;
var Reflect = global.Reflect = QML_quickly.Polyfills.global.Reflect;
var Headers = global.Headers = QML_quickly.Polyfills.global.Headers;
var Request = global.Request = QML_quickly.Polyfills.global.Request;
var Response = global.Response = QML_quickly.Polyfills.global.Response;
var fetch = global.fetch = QML_quickly.Polyfills.global.fetch;
var Promise = global.Promise = QML_quickly.Polyfills.global.Promise;

'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.compare = compare;
exports.isValidDate = isValidDate;
function compare(a, b, sortBy) {
    var sortKeys = Array.isArray(sortBy) ? sortBy : sortBy.split(',');

    for (var i = 0; i < sortKeys.length; i++) {
        var key = sortKeys[i];
        var ascending = true;

        if (key.indexOf('+') == 0) {
            ascending = true;
            key = key.slice(1);
        } else if (key.indexOf('-') == 0) {
            ascending = false;
            key = key.slice(1);
        }

        var value1 = a.valueForKey(key);
        var value2 = b.valueForKey(key);
        var type = typeof value1 === 'undefined' ? 'undefined' : _typeof(value1);

        if (!isNaN(value1) && !isNaN(value2)) type = 'number';
        if (value1 instanceof Date) type = 'date';

        var sort = 0;

        if (type == 'boolean') {
            sort = Number(value2) - Number(value1);
        } else if (type == 'string') {
            sort = value2.localeCompare(value1);
        } else if (type == 'date') {
            sort = value2 - value1;
        } else {
            sort = Number(value2) - Number(value1);
        }

        sort = sort * (ascending ? 1 : -1);

        if (sort != 0) return sort;
    }

    return 0;
}

function isValidDate(date) {
    return date && new Date(date).toString() != 'Invalid Date';
}

var compare = exports.compare;
var isValidDate = exports.isValidDate;
