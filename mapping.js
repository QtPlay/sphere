.pragma library
.import Quickly 0.1 as QML_quickly
.import "./utils.js" as QML_utils

var __filename = Qt.resolvedUrl('mapping.js').substring(7);
var __dirname = __filename.substring(0, __filename.lastIndexOf('/'));

var module = { exports: {} };
var exports = module.exports;
var global = {};

function require(qualifier) {
    return qualifier.module ? qualifier.module.exports : qualifier;
}

var setTimeout = global.setTimeout = QML_utils.global.setTimeout;
var Symbol = global.Symbol = QML_utils.global.Symbol;
var WeakMap = global.WeakMap = QML_utils.global.WeakMap;
var Map = global.Map = QML_utils.global.Map;
var Set = global.Set = QML_utils.global.Set;
var WeakSet = global.WeakSet = QML_utils.global.WeakSet;
var Reflect = global.Reflect = QML_utils.global.Reflect;
var Headers = global.Headers = QML_utils.global.Headers;
var Request = global.Request = QML_utils.global.Request;
var Response = global.Response = QML_utils.global.Response;
var fetch = global.fetch = QML_utils.global.fetch;
var Promise = global.Promise = QML_utils.global.Promise;

'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.sqlType = sqlType;
exports.sqlToJS = sqlToJS;
exports.jsToSQL = jsToSQL;

var _utils = require(QML_utils);

var types = {
    'string': 'TEXT',
    'number': 'FLOAT',
    'int': 'INTEGER',
    'integer': 'INTEGER',
    'bool': 'BOOLEAN',
    'boolean': 'BOOLEAN',
    'date': 'DATE'
};

function sqlType(opts) {
    var sql = types[opts.type];

    if (opts.unique) sql += ' UNIQUE';
    if (opts.primaryKey) sql += ' PRIMARY KEY';

    return sql;
}

function sqlToJS(value, opts) {
    var type = opts.type;

    if (value == undefined) value = null;

    if (type == 'date') {
        value = (0, _utils.isValidDate)(value) ? new Date(value) : null;
    } else if (type == 'number') {
        value = Number(value);
    } else if (type == 'json') {
        value = JSON.parse(value);
    } else if (type == 'boolean' || type == 'bool') {
        value = value ? true : false;
    }

    return value;
}

function jsToSQL(value, opts) {
    var type = opts.type;

    if (value == null || value == undefined) {
        value = null;
    } else if (type == 'date') {
        value = value ? (0, _utils.isValidDate)(value) ? value.toISOString() : '' : undefined;
    } else if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) == 'object' || type == 'json') {
        value = JSON.stringify(value);
    }

    return value;
}

var sqlType = exports.sqlType;
var sqlToJS = exports.sqlToJS;
var jsToSQL = exports.jsToSQL;
