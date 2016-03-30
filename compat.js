.pragma library
.import Quickly 0.1 as QML_quickly
.import "./document.js" as QML_document

var __filename = Qt.resolvedUrl('compat.js').substring(7);
var __dirname = __filename.substring(0, __filename.lastIndexOf('/'));

var module = { exports: {} };
var exports = module.exports;
var global = {};

function require(qualifier) {
    return qualifier.module ? qualifier.module.exports : qualifier;
}

var setTimeout = global.setTimeout = QML_document.global.setTimeout;
var Symbol = global.Symbol = QML_document.global.Symbol;
var WeakMap = global.WeakMap = QML_document.global.WeakMap;
var Map = global.Map = QML_document.global.Map;
var Set = global.Set = QML_document.global.Set;
var WeakSet = global.WeakSet = QML_document.global.WeakSet;
var Reflect = global.Reflect = QML_document.global.Reflect;
var Headers = global.Headers = QML_document.global.Headers;
var Request = global.Request = QML_document.global.Request;
var Response = global.Response = QML_document.global.Response;
var fetch = global.fetch = QML_document.global.fetch;
var Promise = global.Promise = QML_document.global.Promise;

'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.makeField = makeField;
exports.stringField = stringField;
exports.numberField = numberField;
exports.booleanField = booleanField;
exports.dateField = dateField;
exports.define = define;

var _document = require(QML_document);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function makeField(type, opts) {
    if (!opts) opts = {};
    opts.type = type;
    opts.__field = true;
    return opts;
}

function stringField(opts) {
    return makeField('string', opts);
}

function numberField(opts) {
    return makeField('number', opts);
}

function booleanField(opts) {
    return makeField('boolean', opts);
}

function dateField(opts) {
    return makeField('date', opts);
}

function define(className, members) {
    var DocumentSubclass = function (_Document) {
        _inherits(DocumentSubclass, _Document);

        function DocumentSubclass() {
            _classCallCheck(this, DocumentSubclass);

            return _possibleConstructorReturn(this, Object.getPrototypeOf(DocumentSubclass).apply(this, arguments));
        }

        return DocumentSubclass;
    }(_document.Document);

    Object.defineProperty(DocumentSubclass, 'className', { value: className });

    for (var key in members) {
        var member = members[key];

        if ((typeof member === 'undefined' ? 'undefined' : _typeof(member)) == 'object' && member.__field) {
            var descriptor = {
                writable: true,
                enumerable: true
            };
            (0, _document.field)(member.type, member)(DocumentSubclass.prototype, key, descriptor);
            Object.defineProperty(DocumentSubclass.prototype, key, descriptor);
        } else {
            Object.defineProperty(DocumentSubclass.prototype, key, {
                value: member
            });
        }
    }

    (0, _document.register)(DocumentSubclass);

    return DocumentSubclass;
}

var makeField = exports.makeField;
var stringField = exports.stringField;
var numberField = exports.numberField;
var booleanField = exports.booleanField;
var dateField = exports.dateField;
var define = exports.define;
