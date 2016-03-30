.pragma library
.import Quickly 0.1 as QML_quickly
.import QtQuick.LocalStorage 2.0 as QML_localstorage

var __filename = Qt.resolvedUrl('database.js').substring(7);
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
exports.documentClasses = undefined;
exports.database = database;
exports.debugMode = debugMode;
exports.isDebugging = isDebugging;
exports.connect = connect;
exports.migrate = migrate;
exports.executeSql = executeSql;
exports.transaction = transaction;
exports.readTransaction = readTransaction;

var _localstorage = require(QML_localstorage.LocalStorage);

var debug = false;
var db = null;
var current_tx = null;

var documentClasses = exports.documentClasses = {};

function database() {
    return db;
}

function debugMode() {
    debug = true;
}

function isDebugging() {
    return debug;
}

function connect(name, description) {
    if (debug) console.log('Connecting to ' + name + ' (' + description + ')');

    db = (0, _localstorage.openDatabaseSync)(name, '', description, 100000);
    for (var className in documentClasses) {
        var classObj = documentClasses[className];
        classObj.createTable();
    }
}

function migrate(version, callback) {
    if (db.version !== version) {
        if (debug) console.log('Migrating from \'' + db.version + '\' to \'' + version + '\'');
        db.changeVersion(db.version, version, function (tx) {
            withTransaction(tx, callback);
        });
    }

    // Return a convience object so you can do migrate(...).migrate(...)
    return {
        migrate: migrate
    };
}

function executeSql(sql, args) {
    if (!args) args = [];
    if (debug) console.log('Executing ' + sql + ' ' + JSON.stringify(args));

    if (current_tx) {
        return current_tx.executeSql(sql, args);
    } else {
        var result = null;
        db.transaction(function (tx) {
            result = tx.executeSql(sql, args);
        });
        return result;
    }
}

function transaction(callback) {
    db.transaction(function (tx) {
        withTransaction(tx, callback);
    });
}

function readTransaction(callback) {
    db.readTransaction(function (tx) {
        withTransaction(tx, callback);
    });
}

function withTransaction(tx, callback) {
    var oldTx = current_tx;
    current_tx = tx;

    try {
        callback(tx);
    } finally {
        current_tx = oldTx;
    }
}

var documentClasses = exports.documentClasses;
var database = exports.database;
var debugMode = exports.debugMode;
var isDebugging = exports.isDebugging;
var connect = exports.connect;
var migrate = exports.migrate;
var executeSql = exports.executeSql;
var transaction = exports.transaction;
var readTransaction = exports.readTransaction;
