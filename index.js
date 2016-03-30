.pragma library
.import Quickly 0.1 as QML_quickly
.import "./compat.js" as QML_compat
.import "./database.js" as QML_database
.import "./document.js" as QML_document
.import "./signals.js" as QML_signals
.import "./utils.js" as QML_utils
.import "./query.js" as QML_query

var __filename = Qt.resolvedUrl('index.js').substring(7);
var __dirname = __filename.substring(0, __filename.lastIndexOf('/'));

var module = { exports: {} };
var exports = module.exports;
var global = {};

function require(qualifier) {
    return qualifier.module ? qualifier.module.exports : qualifier;
}

var setTimeout = global.setTimeout = QML_query.global.setTimeout;
var Symbol = global.Symbol = QML_query.global.Symbol;
var WeakMap = global.WeakMap = QML_query.global.WeakMap;
var Map = global.Map = QML_query.global.Map;
var Set = global.Set = QML_query.global.Set;
var WeakSet = global.WeakSet = QML_query.global.WeakSet;
var Reflect = global.Reflect = QML_query.global.Reflect;
var Headers = global.Headers = QML_query.global.Headers;
var Request = global.Request = QML_query.global.Request;
var Response = global.Response = QML_query.global.Response;
var fetch = global.fetch = QML_query.global.fetch;
var Promise = global.Promise = QML_query.global.Promise;

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _compat = require(QML_compat);

var define = exports.define = _compat.define;
var stringField = exports.stringField = _compat.stringField;
var numberField = exports.numberField = _compat.numberField;
var booleanField = exports.booleanField = _compat.booleanField;
var dateField = exports.dateField = _compat.dateField;

var _database = require(QML_database);

var connect = exports.connect = _database.connect;
var database = exports.database = _database.database;
var debugMode = exports.debugMode = _database.debugMode;
var executeSql = exports.executeSql = _database.executeSql;
var migrate = exports.migrate = _database.migrate;
var transaction = exports.transaction = _database.transaction;
var readTransaction = exports.readTransaction = _database.readTransaction;

var _document = require(QML_document);

var getDocumentClass = exports.getDocumentClass = _document.getDocumentClass;
var field = exports.field = _document.field;
var register = exports.register = _document.register;
var Document = exports.Document = _document.Document;

var _signals = require(QML_signals);

var objectChanged = exports.objectChanged = _signals.objectChanged;
var objectDeleted = exports.objectDeleted = _signals.objectDeleted;

var _utils = require(QML_utils);

var compare = exports.compare = _utils.compare;
var isValidDate = exports.isValidDate = _utils.isValidDate;

var _query = require(QML_query);

var $ne = exports.$ne = _query.$ne;
var $like = exports.$like = _query.$like;

var define = exports.define;
var stringField = exports.stringField;
var numberField = exports.numberField;
var booleanField = exports.booleanField;
var dateField = exports.dateField;
var connect = exports.connect;
var database = exports.database;
var debugMode = exports.debugMode;
var executeSql = exports.executeSql;
var migrate = exports.migrate;
var transaction = exports.transaction;
var readTransaction = exports.readTransaction;
var getDocumentClass = exports.getDocumentClass;
var field = exports.field;
var register = exports.register;
var Document = exports.Document;
var objectChanged = exports.objectChanged;
var objectDeleted = exports.objectDeleted;
var compare = exports.compare;
var isValidDate = exports.isValidDate;
