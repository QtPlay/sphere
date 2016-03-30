.pragma library
.import Quickly 0.1 as QML_quickly
.import "./database.js" as QML_database
.import "./signals.js" as QML_signals
.import "./mapping.js" as QML_mapping
.import "./query.js" as QML_query

var __filename = Qt.resolvedUrl('document.js').substring(7);
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
exports.Document = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _dec, _desc, _value, _class, _descriptor;

exports.field = field;
exports.register = register;
exports.getDocumentClass = getDocumentClass;

var _database = require(QML_database);

var _signals = require(QML_signals);

var _mapping = require(QML_mapping);

var _query = require(QML_query);

function _initDefineProp(target, property, descriptor, context) {
    if (!descriptor) return;
    Object.defineProperty(target, property, {
        enumerable: descriptor.enumerable,
        configurable: descriptor.configurable,
        writable: descriptor.writable,
        value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
    });
}

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
    var desc = {};
    Object['ke' + 'ys'](descriptor).forEach(function (key) {
        desc[key] = descriptor[key];
    });
    desc.enumerable = !!desc.enumerable;
    desc.configurable = !!desc.configurable;

    if ('value' in desc || desc.initializer) {
        desc.writable = true;
    }

    desc = decorators.slice().reverse().reduce(function (desc, decorator) {
        return decorator(target, property, desc) || desc;
    }, desc);

    if (context && desc.initializer !== void 0) {
        desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
        desc.initializer = undefined;
    }

    if (desc.initializer === void 0) {
        Object['define' + 'Property'](target, property, desc);
        desc = null;
    }

    return desc;
}

function _initializerWarningHelper(descriptor, context) {
    throw new Error('Decorating class property failed. Please ensure that transform-class-properties is enabled.');
}

function field(type, opts) {
    return function (target, key, descriptor) {
        if (!target.constructor.schema) target.constructor.schema = {};
        if (!opts) opts = {};
        opts['type'] = type;
        target.constructor.schema[key] = opts;
        descriptor.writable = true;
        descriptor.enumerable = true;

        return descriptor;
    };
}

function register() {
    for (var _len = arguments.length, classes = Array(_len), _key = 0; _key < _len; _key++) {
        classes[_key] = arguments[_key];
    }

    classes.forEach(function (classObj) {
        _database.documentClasses[classObj.className] = classObj;
        if (_database.isDebugging) console.log('Registering ' + classObj.className);
        if ((0, _database.database)()) classObj.createTable();
    });
}

function getDocumentClass(className) {
    return _database.documentClasses[className];
}

var Document = exports.Document = (_dec = field('int', { primaryKey: true }), (_class = function () {
    function Document() {
        _classCallCheck(this, Document);

        _initDefineProp(this, 'id', _descriptor, this);
    }

    _createClass(Document, [{
        key: 'load',
        value: function load(json) {
            for (var key in json) {
                if (this.constructor.schema.hasOwnProperty(key)) this[key] = (0, _mapping.sqlToJS)(json[key], this.constructor.schema[key]);
            }
        }
    }, {
        key: 'save',
        value: function save() {
            var _this = this;

            var keys = Object.keys(this.constructor.schema);

            if (!this.id) keys = keys.filter(function (key) {
                return key != 'id';
            });

            var args = keys.map(function (key) {
                var opts = _this.constructor.schema[key];
                var value = _this[key];

                return (0, _mapping.jsToSQL)(value, opts);
            });

            var placeholders = args.map(function () {
                return '?';
            });

            (0, _database.executeSql)('INSERT OR REPLACE INTO ' + this.constructor.className + '(' + keys.join(', ') + ') VALUES (' + placeholders.join(', ') + ')', args);
            var row = (0, _database.executeSql)('SELECT last_insert_rowid() as id').rows.item(0);
            this.id = row['id'];
            _signals.objectChanged.emit(this.constructor.className, this);
        }
    }, {
        key: 'delete',
        value: function _delete() {
            (0, _database.executeSql)('DELETE FROM ' + this.constructor.className + ' WHERE id = ?', [this.id]);
            _signals.objectDeleted.emit(this.constructor.className, this);
        }
    }, {
        key: 'valueForKey',
        value: function valueForKey(key) {
            if (!key.includes('.')) {
                return this[key];
            } else {
                var keys = key.split('.');

                var obj = this;

                for (var i = 0; i < keys.length; i++) {
                    var subkey = keys;

                    obj = obj[subkey];
                    if (obj === undefined) return obj;
                }

                return obj;
            }
        }
    }], [{
        key: 'loadRow',
        value: function loadRow(row) {
            var document = new this();
            document.load(row);

            return document;
        }
    }, {
        key: 'where',
        value: function where(query, args) {
            return new _query.QuerySet(this, query, args);
        }
    }, {
        key: 'get',
        value: function get(id) {
            return this.where('id = ?', [id]).get();
        }
    }, {
        key: 'all',
        value: function all() {
            return this.where().all();
        }
    }, {
        key: 'first',
        value: function first() {
            return this.where().first();
        }
    }, {
        key: 'deleteAll',
        value: function deleteAll() {
            return this.where().delete();
        }
    }, {
        key: 'createTable',
        value: function createTable() {
            var _this2 = this;

            var args = Object.keys(this.schema).map(function (key) {
                return key + ' ' + (0, _mapping.sqlType)(_this2.schema[key]);
            });

            (0, _database.executeSql)('CREATE TABLE IF NOT EXISTS ' + this.className + ' (' + args.join(', ') + ')');
        }
    }, {
        key: 'className',
        get: function get() {
            return this.name;
        }
    }]);

    return Document;
}(), (_descriptor = _applyDecoratedDescriptor(_class.prototype, 'id', [_dec], {
    enumerable: true,
    initializer: null
})), _class));

var Document = exports.Document;
var field = exports.field;
var register = exports.register;
var getDocumentClass = exports.getDocumentClass;
