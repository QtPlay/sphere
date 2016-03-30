.pragma library
.import Quickly 0.1 as QML_quickly
.import "./database.js" as QML_database
.import "./signals.js" as QML_signals

var __filename = Qt.resolvedUrl('query.js').substring(7);
var __dirname = __filename.substring(0, __filename.lastIndexOf('/'));

var module = { exports: {} };
var exports = module.exports;
var global = {};

function require(qualifier) {
    return qualifier.module ? qualifier.module.exports : qualifier;
}

var setTimeout = global.setTimeout = QML_signals.global.setTimeout;
var Symbol = global.Symbol = QML_signals.global.Symbol;
var WeakMap = global.WeakMap = QML_signals.global.WeakMap;
var Map = global.Map = QML_signals.global.Map;
var Set = global.Set = QML_signals.global.Set;
var WeakSet = global.WeakSet = QML_signals.global.WeakSet;
var Reflect = global.Reflect = QML_signals.global.Reflect;
var Headers = global.Headers = QML_signals.global.Headers;
var Request = global.Request = QML_signals.global.Request;
var Response = global.Response = QML_signals.global.Response;
var fetch = global.fetch = QML_signals.global.fetch;
var Promise = global.Promise = QML_signals.global.Promise;

'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.QuerySet = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.$ne = $ne;
exports.$like = $like;

var _database = require(QML_database);

var _signals = require(QML_signals);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function op(name, value) {
    var query = {};
    query[name] = value;

    return query;
}

function $ne(value) {
    return op('$ne', value);
}

function $like(value) {
    return op('$like', value);
}

function operator(query) {
    if ((typeof query === 'undefined' ? 'undefined' : _typeof(query)) === 'object') {
        var keys = Object.keys(query);

        if (keys.length == 1) {
            var _op = keys[0];
            return { op: _op, value: query[_op] };
        }
    }

    return { op: null, value: query };
}

var QuerySet = exports.QuerySet = function () {
    function QuerySet(classObject, query, args) {
        _classCallCheck(this, QuerySet);

        this.classObject = classObject;
        this.className = classObject.className;
        this.query = query;
        this.args = args ? args : [];
    }

    _createClass(QuerySet, [{
        key: 'executeSql',
        value: function executeSql(action, limit) {
            var _sqlQuery = this.sqlQuery;
            var query = _sqlQuery.query;
            var args = _sqlQuery.args;

            var sql = action + ' FROM ' + this.className;

            if (query) sql += ' WHERE ' + query;

            if (this.sort) sql += ' ORDER BY ' + this.sqlOrderBy;

            if (limit) sql += ' LIMIT ' + limit;

            return (0, _database.executeSql)(sql, args);
        }
    }, {
        key: 'objects',
        value: function objects(limit) {
            var rows = this.executeSql('SELECT *', limit).rows;

            var results = [];

            for (var i = 0; i < rows.length; i++) {
                results.push(this.classObject.loadRow(rows.item(i)));
            }

            return results;
        }
    }, {
        key: 'count',
        value: function count() {
            return this.executeSql('SELECT COUNT(*) as count').rows.item(0)['count'];
        }
    }, {
        key: 'first',
        value: function first() {
            var objects = this.objects(1);

            if (objects.length > 0) {
                return objects[0];
            } else {
                return null;
            }
        }
    }, {
        key: 'get',
        value: function get() {
            var objects = this.objects(2);

            if (objects.length == 1) {
                return objects[0];
            } else if (objects.length == 0) {
                return null;
            } else {
                throw new Error('More than one object matches the query!');
            }
        }
    }, {
        key: 'all',
        value: function all() {
            return this.objects();
        }
    }, {
        key: 'delete',
        value: function _delete() {
            var objects = this.all();
            this.executeSql('DELETE');
            _signals.objectDeleted.emit(this.className, objects);
        }
    }, {
        key: 'where',
        value: function where(query, args) {
            if (typeof this.query === 'string' || typeof query === 'string') {
                var queryObj = new QuerySet(this.classObject, query, args);

                var _sqlQuery2 = this.sqlQuery;
                var query1 = _sqlQuery2.query;
                var args1 = _sqlQuery2.args;
                var _queryObj$sqlQuery = queryObj.sqlQuery;
                var query2 = _queryObj$sqlQuery.query;
                var args2 = _queryObj$sqlQuery.args;

                if (!query1) {
                    return new QuerySet(this.classObject, query2, args2);
                } else if (!query2) {
                    return new QuerySet(this.classObject, query1, args1);
                } else {
                    return new QuerySet(this.classObject, '(' + query1 + ') AND (' + query2 + ')', args1.concat(args2));
                }
            } else {
                var joinedQuery = {};
                Object.assign(joinedQuery, this.query, query);
                return new QuerySet(this.classObject, joinedQuery);
            }
        }
    }, {
        key: 'orderBy',
        value: function orderBy(sort) {
            this.sort = sort;
        }
    }, {
        key: 'sqlQuery',
        get: function get() {
            if (_typeof(this.query) === 'object') {
                var query = [];
                var args = [];

                for (var key in this.query) {
                    var _operator = operator(this.query[key]);

                    var _op2 = _operator.op;
                    var value = _operator.value;

                    if (_op2 === '$ne') {
                        query.push(key + ' != ?');
                    } else if (_op2 === 'like') {
                        query.push(key + ' LIKE \'%?%\'');
                    } else {
                        query.push(key + ' = ?');
                    }

                    args.push(value);
                }

                return { query: query.join(' AND '), args: args };
            } else {
                return { query: this.query, args: this.args };
            }
        }
    }, {
        key: 'sqlOrderBy',
        get: function get() {
            var columns = this.sort.split(',').map(function (field) {
                if (field.indexOf('+') == 0) {
                    return field.slice(1) + ' ASC';
                } else if (field.indexOf('-') == 0) {
                    return field.slice(1) + ' DESC';
                } else {
                    return field;
                }
            });

            return columns.join(', ');
        }
    }]);

    return QuerySet;
}();

var QuerySet = exports.QuerySet;
