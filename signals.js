.pragma library
.import Quickly 0.1 as QML_quickly

var __filename = Qt.resolvedUrl('signals.js').substring(7);
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

"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Signal = function () {
    function Signal() {
        _classCallCheck(this, Signal);

        this.listeners = [];
    }

    _createClass(Signal, [{
        key: "connect",
        value: function connect(listener) {
            this.listeners.push(listener);
        }
    }, {
        key: "emit",
        value: function emit() {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            this.listeners.forEach(function (listener) {
                listener.apply(null, args);
            });
        }
    }]);

    return Signal;
}();

var objectChanged = exports.objectChanged = new Signal();
var objectDeleted = exports.objectDeleted = new Signal();

var objectChanged = exports.objectChanged;
var objectDeleted = exports.objectDeleted;
