/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(p, parent, orig){
  var path = require.resolve(p)
    , mod = require.modules[path];

  // lookup failed
  if (null == path) {
    orig = orig || p;
    parent = parent || 'root';
    throw new Error('failed to require "' + orig + '" from "' + parent + '"');
  }

  // perform real require()
  // by invoking the module's
  // registered function
  if (!mod.exports) {
    mod.exports = {};
    mod.client = mod.component = true;
    mod.call(this, mod, mod.exports, require.relative(path));
  }

  return mod.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path){
  var orig = path
    , reg = path + '.js'
    , regJSON = path + '.json'
    , index = path + '/index.js'
    , indexJSON = path + '/index.json';

  return require.modules[reg] && reg
    || require.modules[regJSON] && regJSON
    || require.modules[index] && index
    || require.modules[indexJSON] && indexJSON
    || require.modules[orig] && orig
    || require.aliases[index];
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `fn`.
 *
 * @param {String} path
 * @param {Function} fn
 * @api private
 */

require.register = function(path, fn){
  require.modules[path] = fn;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to){
  var fn = require.modules[from];
  if (!fn) throw new Error('failed to alias "' + from + '", it does not exist');
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj){
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function fn(path){
    var orig = path;
    path = fn.resolve(path);
    return require(path, parent, orig);
  }

  /**
   * Resolve relative to the parent.
   */

  fn.resolve = function(path){
    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    if ('.' != path.charAt(0)) {
      var segs = parent.split('/');
      var i = lastIndexOf(segs, 'deps') + 1;
      if (!i) i = 0;
      path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
      return path;
    }
    return require.normalize(p, path);
  };

  /**
   * Check if module is defined at `path`.
   */

  fn.exists = function(path){
    return !! require.modules[fn.resolve(path)];
  };

  return fn;
};require.register("timoxley-watch/index.js", Function("module, exports, require",
"/**\n * DEVELOPED BY\n * GIL LOPES BUENO\n * gilbueno.mail@gmail.com\n *\n * WORKS WITH:\n * IE 9+, FF 4+, SF 5+, WebKit, CH 7+, OP 12+, BESEN, Rhino 1.7+\n *\n * FORK:\n * https://github.com/melanke/Watch.JS\n */\n\n\"use strict\";\n(function (factory) {\n    if (typeof exports === 'object') {\n        // Node. Does not work with strict CommonJS, but\n        // only CommonJS-like enviroments that support module.exports,\n        // like Node.\n        module.exports = factory();\n    } else if (typeof define === 'function' && define.amd) {\n        // AMD. Register as an anonymous module.\n        define(factory);\n    } else {\n        // Browser globals\n        window.WatchJS = factory();\n        window.watch = window.WatchJS.watch;\n        window.unwatch = window.WatchJS.unwatch;\n        window.callWatchers = window.WatchJS.callWatchers;\n    }\n}(function () {\n\n    var WatchJS = {\n        noMore: false\n    },\n    defineWatcher,\n    unwatchOne,\n    callWatchers;\n\n    var isFunction = function (functionToCheck) {\n            var getType = {};\n            return functionToCheck && getType.toString.call(functionToCheck) == '[object Function]';\n    };\n\n    var isInt = function (x) {\n        return x % 1 === 0;\n    };\n\n    var isArray = function(obj) {\n        return Object.prototype.toString.call(obj) === '[object Array]';\n    };\n\n    var isModernBrowser = function () {\n        return Object.defineProperty || Object.prototype.__defineGetter__;\n    };\n\n    var defineGetAndSet = function (obj, propName, getter, setter) {\n        try {\n                Object.defineProperty(obj, propName, {\n                        get: getter,\n                        set: setter,\n                        enumerable: true,\n                        configurable: true\n                });\n        } catch(error) {\n            try{\n                Object.prototype.__defineGetter__.call(obj, propName, getter);\n                Object.prototype.__defineSetter__.call(obj, propName, setter);\n            }catch(error2){\n                throw \"watchJS error: browser not supported :/\"\n            }\n        }\n    };\n\n    var defineProp = function (obj, propName, value) {\n        try {\n            Object.defineProperty(obj, propName, {\n                enumerable: false,\n                configurable: true,\n                writable: false,\n                value: value\n            });\n        } catch(error) {\n            obj[propName] = value;\n        }\n    };\n\n    var watch = function () {\n\n        if (isFunction(arguments[1])) {\n            watchAll.apply(this, arguments);\n        } else if (isArray(arguments[1])) {\n            watchMany.apply(this, arguments);\n        } else {\n            watchOne.apply(this, arguments);\n        }\n\n    };\n\n\n    var watchAll = function (obj, watcher, level) {\n\n        if (obj instanceof String || (!(obj instanceof Object) && !isArray(obj))) { //accepts only objects and array (not string)\n            return;\n        }\n\n        var props = [];\n\n\n        if(isArray(obj)) {\n            for (var prop = 0; prop < obj.length; prop++) { //for each item if obj is an array\n                props.push(prop); //put in the props\n            }\n        } else {\n            for (var prop2 in obj) { //for each attribute if obj is an object\n                props.push(prop2); //put in the props\n            }\n        }\n\n        watchMany(obj, props, watcher, level); //watch all itens of the props\n    };\n\n\n    var watchMany = function (obj, props, watcher, level) {\n\n        for (var prop in props) { //watch each attribute of \"props\" if is an object\n            watchOne(obj, props[prop], watcher, level);\n        }\n\n    };\n\n    var watchOne = function (obj, prop, watcher, level) {\n\n        if(isFunction(obj[prop])) { //dont watch if it is a function\n            return;\n        }\n\n        if(obj[prop] != null && (level === undefined || level > 0)){\n            if(level !== undefined){\n                level--;\n            }\n            watchAll(obj[prop], watcher, level); //recursively watch all attributes of this\n        }\n\n        defineWatcher(obj, prop, watcher);\n\n    };\n\n    var unwatch = function () {\n\n        if (isFunction(arguments[1])) {\n            unwatchAll.apply(this, arguments);\n        } else if (isArray(arguments[1])) {\n            unwatchMany.apply(this, arguments);\n        } else {\n            unwatchOne.apply(this, arguments);\n        }\n\n    };\n\n    var unwatchAll = function (obj, watcher) {\n\n        if (obj instanceof String || (!(obj instanceof Object) && !isArray(obj))) { //accepts only objects and array (not string)\n            return;\n        }\n\n        var props = [];\n\n\n        if (isArray(obj)) {\n            for (var prop = 0; prop < obj.length; prop++) { //for each item if obj is an array\n                props.push(prop); //put in the props\n            }\n        } else {\n            for (var prop2 in obj) { //for each attribute if obj is an object\n                props.push(prop2); //put in the props\n            }\n        }\n\n        unwatchMany(obj, props, watcher); //watch all itens of the props\n    };\n\n\n    var unwatchMany = function (obj, props, watcher) {\n\n        for (var prop2 in props) { //watch each attribute of \"props\" if is an object\n            unwatchOne(obj, props[prop2], watcher);\n        }\n    };\n\n    if(isModernBrowser()){\n\n        defineWatcher = function (obj, prop, watcher) {\n\n            var val = obj[prop];\n\n            watchFunctions(obj, prop);\n\n            if (!obj.watchers) {\n                defineProp(obj, \"watchers\", {});\n            }\n\n            if (!obj.watchers[prop]) {\n                obj.watchers[prop] = [];\n            }\n\n\n            obj.watchers[prop].push(watcher); //add the new watcher in the watchers array\n\n\n            var getter = function () {\n                return val;\n            };\n\n\n            var setter = function (newval) {\n                var oldval = val;\n                val = newval;\n\n                if (obj[prop]){\n                    watchAll(obj[prop], watcher);\n                }\n\n                watchFunctions(obj, prop);\n\n                if (!WatchJS.noMore){\n                    if (JSON.stringify(oldval) !== JSON.stringify(newval)) {\n                        callWatchers(obj, prop, \"set\", newval, oldval);\n                        WatchJS.noMore = false;\n                    }\n                }\n            };\n\n            defineGetAndSet(obj, prop, getter, setter);\n\n        };\n\n        callWatchers = function (obj, prop, action, newval, oldval) {\n\n            for (var wr in obj.watchers[prop]) {\n                if (isInt(wr)){\n                    obj.watchers[prop][wr].call(obj, prop, action, newval, oldval);\n                }\n            }\n        };\n\n        // @todo code related to \"watchFunctions\" is certainly buggy\n        var methodNames = ['pop', 'push', 'reverse', 'shift', 'sort', 'slice', 'unshift'];\n        var defineArrayMethodWatcher = function (obj, prop, original, methodName) {\n            defineProp(obj[prop], methodName, function () {\n                var response = original.apply(obj[prop], arguments);\n                watchOne(obj, obj[prop]);\n                if (methodName !== 'slice') {\n                    callWatchers(obj, prop, methodName,arguments);\n                }\n                return response;\n            });\n        };\n\n        var watchFunctions = function(obj, prop) {\n\n            if ((!obj[prop]) || (obj[prop] instanceof String) || (!isArray(obj[prop]))) {\n                return;\n            }\n\n            for (var i = methodNames.length, methodName; i--;) {\n                methodName = methodNames[i];\n                defineArrayMethodWatcher(obj, prop, obj[prop][methodName], methodName);\n            }\n\n        };\n\n        unwatchOne = function (obj, prop, watcher) {\n            for(var i in obj.watchers[prop]){\n                var w = obj.watchers[prop][i];\n\n                if(w == watcher) {\n                    obj.watchers[prop].splice(i, 1);\n                }\n            }\n        };\n\n    } else {\n        //this implementation dont work because it cant handle the gap between \"settings\".\n        //I mean, if you use a setter for an attribute after another setter of the same attribute it will only fire the second\n        //but I think we could think something to fix it\n\n        var subjects = [];\n\n        defineWatcher = function(obj, prop, watcher){\n\n            subjects.push({\n                obj: obj,\n                prop: prop,\n                serialized: JSON.stringify(obj[prop]),\n                watcher: watcher\n            });\n\n        };\n\n        unwatchOne = function (obj, prop, watcher) {\n\n            for (var i in subjects) {\n                var subj = subjects[i];\n\n                if (subj.obj == obj && subj.prop == prop && subj.watcher == watcher) {\n                    subjects.splice(i, 1);\n                }\n\n            }\n\n        };\n\n        callWatchers = function (obj, prop, action, value) {\n\n            for (var i in subjects) {\n                var subj = subjects[i];\n\n                if (subj.obj == obj && subj.prop == prop) {\n                    subj.watcher.call(obj, prop, action, value);\n                }\n\n            }\n\n        };\n\n        var loop = function(){\n\n            for(var i in subjects){\n\n                var subj = subjects[i];\n                var newSer = JSON.stringify(subj.obj[subj.prop]);\n                if(newSer != subj.serialized){\n                    subj.watcher.call(subj.obj, subj.prop, subj.obj[subj.prop], JSON.parse(subj.serialized));\n                    subj.serialized = newSer;\n                }\n\n            }\n\n        };\n\n        setInterval(loop, 50);\n\n    }\n\n    WatchJS.watch = watch;\n    WatchJS.unwatch = unwatch;\n    WatchJS.callWatchers = callWatchers;\n\n    return WatchJS;\n\n}));\n//@ sourceURL=timoxley-watch/index.js"
));
require.register("component-emitter/index.js", Function("module, exports, require",
"\n/**\n * Expose `Emitter`.\n */\n\nmodule.exports = Emitter;\n\n/**\n * Initialize a new `Emitter`.\n * \n * @api public\n */\n\nfunction Emitter(obj) {\n  if (obj) return mixin(obj);\n};\n\n/**\n * Mixin the emitter properties.\n *\n * @param {Object} obj\n * @return {Object}\n * @api private\n */\n\nfunction mixin(obj) {\n  for (var key in Emitter.prototype) {\n    obj[key] = Emitter.prototype[key];\n  }\n  return obj;\n}\n\n/**\n * Listen on the given `event` with `fn`.\n *\n * @param {String} event\n * @param {Function} fn\n * @return {Emitter}\n * @api public\n */\n\nEmitter.prototype.on = function(event, fn){\n  this._callbacks = this._callbacks || {};\n  (this._callbacks[event] = this._callbacks[event] || [])\n    .push(fn);\n  return this;\n};\n\n/**\n * Adds an `event` listener that will be invoked a single\n * time then automatically removed.\n *\n * @param {String} event\n * @param {Function} fn\n * @return {Emitter}\n * @api public\n */\n\nEmitter.prototype.once = function(event, fn){\n  var self = this;\n  this._callbacks = this._callbacks || {};\n\n  function on() {\n    self.off(event, on);\n    fn.apply(this, arguments);\n  }\n\n  fn._off = on;\n  this.on(event, on);\n  return this;\n};\n\n/**\n * Remove the given callback for `event` or all\n * registered callbacks.\n *\n * @param {String} event\n * @param {Function} fn\n * @return {Emitter}\n * @api public\n */\n\nEmitter.prototype.off = function(event, fn){\n  this._callbacks = this._callbacks || {};\n  var callbacks = this._callbacks[event];\n  if (!callbacks) return this;\n\n  // remove all handlers\n  if (1 == arguments.length) {\n    delete this._callbacks[event];\n    return this;\n  }\n\n  // remove specific handler\n  var i = callbacks.indexOf(fn._off || fn);\n  if (~i) callbacks.splice(i, 1);\n  return this;\n};\n\n/**\n * Emit `event` with the given args.\n *\n * @param {String} event\n * @param {Mixed} ...\n * @return {Emitter} \n */\n\nEmitter.prototype.emit = function(event){\n  this._callbacks = this._callbacks || {};\n  var args = [].slice.call(arguments, 1)\n    , callbacks = this._callbacks[event];\n\n  if (callbacks) {\n    callbacks = callbacks.slice(0);\n    for (var i = 0, len = callbacks.length; i < len; ++i) {\n      callbacks[i].apply(this, args);\n    }\n  }\n\n  return this;\n};\n\n/**\n * Return array of callbacks for `event`.\n *\n * @param {String} event\n * @return {Array}\n * @api public\n */\n\nEmitter.prototype.listeners = function(event){\n  this._callbacks = this._callbacks || {};\n  return this._callbacks[event] || [];\n};\n\n/**\n * Check if this emitter has `event` handlers.\n *\n * @param {String} event\n * @return {Boolean}\n * @api public\n */\n\nEmitter.prototype.hasListeners = function(event){\n  return !! this.listeners(event).length;\n};\n\n//@ sourceURL=component-emitter/index.js"
));
require.register("component-inherit/index.js", Function("module, exports, require",
"\nmodule.exports = function(a, b){\n  var fn = function(){};\n  fn.prototype = b.prototype;\n  a.prototype = new fn;\n  a.prototype.constructor = a;\n};//@ sourceURL=component-inherit/index.js"
));
require.register("timoxley-assert/index.js", Function("module, exports, require",
"// http://wiki.commonjs.org/wiki/Unit_Testing/1.0\n//\n// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!\n//\n// Originally from narwhal.js (http://narwhaljs.org)\n// Copyright (c) 2009 Thomas Robinson <280north.com>\n//\n// Permission is hereby granted, free of charge, to any person obtaining a copy\n// of this software and associated documentation files (the 'Software'), to\n// deal in the Software without restriction, including without limitation the\n// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or\n// sell copies of the Software, and to permit persons to whom the Software is\n// furnished to do so, subject to the following conditions:\n//\n// The above copyright notice and this permission notice shall be included in\n// all copies or substantial portions of the Software.\n//\n// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN\n// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION\n// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n\n\n// Adapted for browser components by Tim Oxley\n// from https://github.com/joyent/node/blob/72bc4dcda4cfa99ed064419e40d104bd1b2e0e25/lib/assert.js\n\n// UTILITY\nvar inherit = require('inherit');\nvar pSlice = Array.prototype.slice;\n\n// 1. The assert module provides functions that throw\n// AssertionError's when particular conditions are not met. The\n// assert module must conform to the following interface.\n\nvar assert = module.exports = ok;\n\n// 2. The AssertionError is defined in assert.\n// new assert.AssertionError({ message: message,\n//                             actual: actual,\n//                             expected: expected })\n\nassert.AssertionError = function AssertionError(options) {\n  this.name = 'AssertionError';\n  this.message = options.message;\n  this.actual = options.actual;\n  this.expected = options.expected;\n  this.operator = options.operator;\n  var stackStartFunction = options.stackStartFunction || fail;\n\n  if (Error.captureStackTrace) {\n    Error.captureStackTrace(this, stackStartFunction);\n  }\n};\n\n// assert.AssertionError instanceof Error\ninherit(assert.AssertionError, Error);\n\nfunction replacer(key, value) {\n  if (value === undefined) {\n    return '' + value;\n  }\n  if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) {\n    return value.toString();\n  }\n  if (typeof value === 'function' || value instanceof RegExp) {\n    return value.toString();\n  }\n  return value;\n}\n\nfunction truncate(s, n) {\n  if (typeof s == 'string') {\n    return s.length < n ? s : s.slice(0, n);\n  } else {\n    return s;\n  }\n}\n\nassert.AssertionError.prototype.toString = function() {\n  if (this.message) {\n    return [this.name + ':', this.message].join(' ');\n  } else {\n    return [\n      this.name + ':',\n      truncate(JSON.stringify(this.actual, replacer), 128),\n      this.operator,\n      truncate(JSON.stringify(this.expected, replacer), 128)\n    ].join(' ');\n  }\n};\n\n// At present only the three keys mentioned above are used and\n// understood by the spec. Implementations or sub modules can pass\n// other keys to the AssertionError's constructor - they will be\n// ignored.\n\n// 3. All of the following functions must throw an AssertionError\n// when a corresponding condition is not met, with a message that\n// may be undefined if not provided.  All assertion methods provide\n// both the actual and expected values to the assertion error for\n// display purposes.\n\nfunction fail(actual, expected, message, operator, stackStartFunction) {\n  throw new assert.AssertionError({\n    message: message,\n    actual: actual,\n    expected: expected,\n    operator: operator,\n    stackStartFunction: stackStartFunction\n  });\n}\n\n// EXTENSION! allows for well behaved errors defined elsewhere.\nassert.fail = fail;\n\n// 4. Pure assertion tests whether a value is truthy, as determined\n// by !!guard.\n// assert.ok(guard, message_opt);\n// This statement is equivalent to assert.equal(true, !!guard,\n// message_opt);. To test strictly for the value true, use\n// assert.strictEqual(true, guard, message_opt);.\n\nfunction ok(value, message) {\n  if (!!!value) fail(value, true, message, '==', assert.ok);\n}\nassert.ok = ok;\n\n// 5. The equality assertion tests shallow, coercive equality with\n// ==.\n// assert.equal(actual, expected, message_opt);\n\nassert.equal = function equal(actual, expected, message) {\n  if (actual != expected) fail(actual, expected, message, '==', assert.equal);\n};\n\n// 6. The non-equality assertion tests for whether two objects are not equal\n// with != assert.notEqual(actual, expected, message_opt);\n\nassert.notEqual = function notEqual(actual, expected, message) {\n  if (actual == expected) {\n    fail(actual, expected, message, '!=', assert.notEqual);\n  }\n};\n\n// 7. The equivalence assertion tests a deep equality relation.\n// assert.deepEqual(actual, expected, message_opt);\n\nassert.deepEqual = function deepEqual(actual, expected, message) {\n  if (!_deepEqual(actual, expected)) {\n    fail(actual, expected, message, 'deepEqual', assert.deepEqual);\n  }\n};\n\nfunction _deepEqual(actual, expected) {\n  // 7.1. All identical values are equivalent, as determined by ===.\n  if (actual === expected) {\n    return true;\n\n  // 7.2. If the expected value is a Date object, the actual value is\n  // equivalent if it is also a Date object that refers to the same time.\n  } else if (actual instanceof Date && expected instanceof Date) {\n    return actual.getTime() === expected.getTime();\n\n  // 7.3 If the expected value is a RegExp object, the actual value is\n  // equivalent if it is also a RegExp object with the same source and\n  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).\n  } else if (actual instanceof RegExp && expected instanceof RegExp) {\n    return actual.source === expected.source &&\n           actual.global === expected.global &&\n           actual.multiline === expected.multiline &&\n           actual.lastIndex === expected.lastIndex &&\n           actual.ignoreCase === expected.ignoreCase;\n\n  // 7.4. Other pairs that do not both pass typeof value == 'object',\n  // equivalence is determined by ==.\n  } else if (typeof actual != 'object' && typeof expected != 'object') {\n    return actual == expected;\n\n  // 7.5 For all other Object pairs, including Array objects, equivalence is\n  // determined by having the same number of owned properties (as verified\n  // with Object.prototype.hasOwnProperty.call), the same set of keys\n  // (although not necessarily the same order), equivalent values for every\n  // corresponding key, and an identical 'prototype' property. Note: this\n  // accounts for both named and indexed properties on Arrays.\n  } else {\n    return objEquiv(actual, expected);\n  }\n}\n\nfunction isUndefinedOrNull(value) {\n  return value === null || value === undefined;\n}\n\nfunction isArguments(object) {\n  return Object.prototype.toString.call(object) == '[object Arguments]';\n}\n\nfunction objEquiv(a, b) {\n  if (isUndefinedOrNull(a) || isUndefinedOrNull(b))\n    return false;\n  // an identical 'prototype' property.\n  if (a.prototype !== b.prototype) return false;\n  //~~~I've managed to break Object.keys through screwy arguments passing.\n  //   Converting to array solves the problem.\n  if (isArguments(a)) {\n    if (!isArguments(b)) {\n      return false;\n    }\n    a = pSlice.call(a);\n    b = pSlice.call(b);\n    return _deepEqual(a, b);\n  }\n  try {\n    var ka = Object.keys(a),\n        kb = Object.keys(b),\n        key, i;\n  } catch (e) {//happens when one is a string literal and the other isn't\n    return false;\n  }\n  // having the same number of owned properties (keys incorporates\n  // hasOwnProperty)\n  if (ka.length != kb.length)\n    return false;\n  //the same set of keys (although not necessarily the same order),\n  ka.sort();\n  kb.sort();\n  //~~~cheap key test\n  for (i = ka.length - 1; i >= 0; i--) {\n    if (ka[i] != kb[i])\n      return false;\n  }\n  //equivalent values for every corresponding key, and\n  //~~~possibly expensive deep test\n  for (i = ka.length - 1; i >= 0; i--) {\n    key = ka[i];\n    if (!_deepEqual(a[key], b[key])) return false;\n  }\n  return true;\n}\n\n// 8. The non-equivalence assertion tests for any deep inequality.\n// assert.notDeepEqual(actual, expected, message_opt);\n\nassert.notDeepEqual = function notDeepEqual(actual, expected, message) {\n  if (_deepEqual(actual, expected)) {\n    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);\n  }\n};\n\n// 9. The strict equality assertion tests strict equality, as determined by ===.\n// assert.strictEqual(actual, expected, message_opt);\n\nassert.strictEqual = function strictEqual(actual, expected, message) {\n  if (actual !== expected) {\n    fail(actual, expected, message, '===', assert.strictEqual);\n  }\n};\n\n// 10. The strict non-equality assertion tests for strict inequality, as\n// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);\n\nassert.notStrictEqual = function notStrictEqual(actual, expected, message) {\n  if (actual === expected) {\n    fail(actual, expected, message, '!==', assert.notStrictEqual);\n  }\n};\n\nfunction expectedException(actual, expected) {\n  if (!actual || !expected) {\n    return false;\n  }\n\n  if (expected instanceof RegExp) {\n    return expected.test(actual);\n  } else if (actual instanceof expected) {\n    return true;\n  } else if (expected.call({}, actual) === true) {\n    return true;\n  }\n\n  return false;\n}\n\nfunction _throws(shouldThrow, block, expected, message) {\n  var actual;\n\n  if (typeof expected === 'string') {\n    message = expected;\n    expected = null;\n  }\n\n  try {\n    block();\n  } catch (e) {\n    actual = e;\n  }\n\n  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +\n            (message ? ' ' + message : '.');\n\n  if (shouldThrow && !actual) {\n    fail(actual, expected, 'Missing expected exception' + message);\n  }\n\n  if (!shouldThrow && expectedException(actual, expected)) {\n    fail(actual, expected, 'Got unwanted exception' + message);\n  }\n\n  if ((shouldThrow && actual && expected &&\n      !expectedException(actual, expected)) || (!shouldThrow && actual)) {\n    throw actual;\n  }\n}\n\n// 11. Expected to throw an error:\n// assert.throws(block, Error_opt, message_opt);\n\nassert.throws = function(block, /*optional*/error, /*optional*/message) {\n  _throws.apply(this, [true].concat(pSlice.call(arguments)));\n};\n\n// EXTENSION! This is annoying to write outside this module.\nassert.doesNotThrow = function(block, /*optional*/message) {\n  _throws.apply(this, [false].concat(pSlice.call(arguments)));\n};\n\nassert.ifError = function(err) { if (err) {throw err;}};\n//@ sourceURL=timoxley-assert/index.js"
));
require.register("component-format-parser/index.js", Function("module, exports, require",
"\n/**\n * Parse the given format `str`.\n *\n * @param {String} str\n * @return {Array}\n * @api public\n */\n\nmodule.exports = function(str){\n  return str.split(/ *\\| */).map(function(call){\n    var parts = call.split(':');\n    var name = parts.shift();\n    var args = parseArgs(parts.join(':'));\n\n    return {\n      name: name,\n      args: args\n    };\n  });\n};\n\n/**\n * Parse args `str`.\n *\n * @param {String} str\n * @return {Array}\n * @api private\n */\n\nfunction parseArgs(str) {\n  var args = [];\n  var re = /\"([^\"]*)\"|'([^']*)'|([^ \\t,]+)/g;\n  var m;\n  \n  while (m = re.exec(str)) {\n    args.push(m[2] || m[1] || m[0]);\n  }\n  \n  return args;\n}\n//@ sourceURL=component-format-parser/index.js"
));
require.register("visionmedia-debug/index.js", Function("module, exports, require",
"if ('undefined' == typeof window) {\n  module.exports = require('./lib/debug');\n} else {\n  module.exports = require('./debug');\n}\n//@ sourceURL=visionmedia-debug/index.js"
));
require.register("visionmedia-debug/debug.js", Function("module, exports, require",
"\n/**\n * Expose `debug()` as the module.\n */\n\nmodule.exports = debug;\n\n/**\n * Create a debugger with the given `name`.\n *\n * @param {String} name\n * @return {Type}\n * @api public\n */\n\nfunction debug(name) {\n  if (!debug.enabled(name)) return function(){};\n\n  return function(fmt){\n    var curr = new Date;\n    var ms = curr - (debug[name] || curr);\n    debug[name] = curr;\n\n    fmt = name\n      + ' '\n      + fmt\n      + ' +' + debug.humanize(ms);\n\n    // This hackery is required for IE8\n    // where `console.log` doesn't have 'apply'\n    window.console\n      && console.log\n      && Function.prototype.apply.call(console.log, console, arguments);\n  }\n}\n\n/**\n * The currently active debug mode names.\n */\n\ndebug.names = [];\ndebug.skips = [];\n\n/**\n * Enables a debug mode by name. This can include modes\n * separated by a colon and wildcards.\n *\n * @param {String} name\n * @api public\n */\n\ndebug.enable = function(name) {\n  localStorage.debug = name;\n\n  var split = (name || '').split(/[\\s,]+/)\n    , len = split.length;\n\n  for (var i = 0; i < len; i++) {\n    name = split[i].replace('*', '.*?');\n    if (name[0] === '-') {\n      debug.skips.push(new RegExp('^' + name.substr(1) + '$'));\n    }\n    else {\n      debug.names.push(new RegExp('^' + name + '$'));\n    }\n  }\n};\n\n/**\n * Disable debug output.\n *\n * @api public\n */\n\ndebug.disable = function(){\n  debug.enable('');\n};\n\n/**\n * Humanize the given `ms`.\n *\n * @param {Number} m\n * @return {String}\n * @api private\n */\n\ndebug.humanize = function(ms) {\n  var sec = 1000\n    , min = 60 * 1000\n    , hour = 60 * min;\n\n  if (ms >= hour) return (ms / hour).toFixed(1) + 'h';\n  if (ms >= min) return (ms / min).toFixed(1) + 'm';\n  if (ms >= sec) return (ms / sec | 0) + 's';\n  return ms + 'ms';\n};\n\n/**\n * Returns true if the given mode name is enabled, false otherwise.\n *\n * @param {String} name\n * @return {Boolean}\n * @api public\n */\n\ndebug.enabled = function(name) {\n  for (var i = 0, len = debug.skips.length; i < len; i++) {\n    if (debug.skips[i].test(name)) {\n      return false;\n    }\n  }\n  for (var i = 0, len = debug.names.length; i < len; i++) {\n    if (debug.names[i].test(name)) {\n      return true;\n    }\n  }\n  return false;\n};\n\n// persist\n\nif (window.localStorage) debug.enable(localStorage.debug);//@ sourceURL=visionmedia-debug/debug.js"
));
require.register("component-event/index.js", Function("module, exports, require",
"\n/**\n * Bind `el` event `type` to `fn`.\n *\n * @param {Element} el\n * @param {String} type\n * @param {Function} fn\n * @param {Boolean} capture\n * @return {Function}\n * @api public\n */\n\nexports.bind = function(el, type, fn, capture){\n  if (el.addEventListener) {\n    el.addEventListener(type, fn, capture);\n  } else {\n    el.attachEvent('on' + type, fn);\n  }\n  return fn;\n};\n\n/**\n * Unbind `el` event `type`'s callback `fn`.\n *\n * @param {Element} el\n * @param {String} type\n * @param {Function} fn\n * @param {Boolean} capture\n * @return {Function}\n * @api public\n */\n\nexports.unbind = function(el, type, fn, capture){\n  if (el.removeEventListener) {\n    el.removeEventListener(type, fn, capture);\n  } else {\n    el.detachEvent('on' + type, fn);\n  }\n  return fn;\n};\n//@ sourceURL=component-event/index.js"
));
require.register("component-indexof/index.js", Function("module, exports, require",
"\nvar indexOf = [].indexOf;\n\nmodule.exports = function(arr, obj){\n  if (indexOf) return arr.indexOf(obj);\n  for (var i = 0; i < arr.length; ++i) {\n    if (arr[i] === obj) return i;\n  }\n  return -1;\n};//@ sourceURL=component-indexof/index.js"
));
require.register("component-classes/index.js", Function("module, exports, require",
"\n/**\n * Module dependencies.\n */\n\nvar index = require('indexof');\n\n/**\n * Whitespace regexp.\n */\n\nvar re = /\\s+/;\n\n/**\n * Wrap `el` in a `ClassList`.\n *\n * @param {Element} el\n * @return {ClassList}\n * @api public\n */\n\nmodule.exports = function(el){\n  return new ClassList(el);\n};\n\n/**\n * Initialize a new ClassList for `el`.\n *\n * @param {Element} el\n * @api private\n */\n\nfunction ClassList(el) {\n  this.el = el;\n  this.list = el.classList;\n}\n\n/**\n * Add class `name` if not already present.\n *\n * @param {String} name\n * @return {ClassList}\n * @api public\n */\n\nClassList.prototype.add = function(name){\n  // classList\n  if (this.list) {\n    this.list.add(name);\n    return this;\n  }\n\n  // fallback\n  var arr = this.array();\n  var i = index(arr, name);\n  if (!~i) arr.push(name);\n  this.el.className = arr.join(' ');\n  return this;\n};\n\n/**\n * Remove class `name` when present.\n *\n * @param {String} name\n * @return {ClassList}\n * @api public\n */\n\nClassList.prototype.remove = function(name){\n  // classList\n  if (this.list) {\n    this.list.remove(name);\n    return this;\n  }\n\n  // fallback\n  var arr = this.array();\n  var i = index(arr, name);\n  if (~i) arr.splice(i, 1);\n  this.el.className = arr.join(' ');\n  return this;\n};\n\n/**\n * Toggle class `name`.\n *\n * @param {String} name\n * @return {ClassList}\n * @api public\n */\n\nClassList.prototype.toggle = function(name){\n  // classList\n  if (this.list) {\n    this.list.toggle(name);\n    return this;\n  }\n\n  // fallback\n  if (this.has(name)) {\n    this.remove(name);\n  } else {\n    this.add(name);\n  }\n  return this;\n};\n\n/**\n * Return an array of classes.\n *\n * @return {Array}\n * @api public\n */\n\nClassList.prototype.array = function(){\n  var arr = this.el.className.split(re);\n  if ('' === arr[0]) arr.pop();\n  return arr;\n};\n\n/**\n * Check if class `name` is present.\n *\n * @param {String} name\n * @return {ClassList}\n * @api public\n */\n\nClassList.prototype.has =\nClassList.prototype.contains = function(name){\n  return this.list\n    ? this.list.contains(name)\n    : !! ~index(this.array(), name);\n};\n//@ sourceURL=component-classes/index.js"
));
require.register("timoxley-reactive/lib/index.js", Function("module, exports, require",
"\n/**\n * Module dependencies.\n */\n\nvar debug = require('debug')('reactive')\n  , Binding = require('./binding')\n  , bindings = require('./bindings');\n\n/**\n * Expose `Reactive`.\n */\n\nexports = module.exports = Reactive;\n\n/**\n * Bindings.\n */\n\nexports.bindings = {};\n\n/**\n * Define subscription function.\n *\n * @param {Function} fn\n * @api public\n */\n\nexports.subscribe = function(fn){\n  Binding.subscribe = fn;\n};\n\n/**\n * Define unsubscribe function.\n *\n * @param {Function} fn\n * @api public\n */\n\nexports.unsubscribe = function(fn){\n  Binding.unsubscribe = fn;\n};\n\n/**\n * Selector engine.\n */\n\nexports.query = function(el, selector){\n  return el.querySelectorAll(selector);\n};\n\n/**\n * Define binding `name` with callback `fn(el, val)`.\n *\n * @param {String} name or object\n * @param {String|Object} name\n * @param {Function} fn\n * @api public\n */\n\nexports.bind = function(name, fn){\n  if ('object' == typeof name) {\n    for (var key in name) {\n      exports.bind(key, name[key]);\n    }\n    return;\n  }\n\n  exports.bindings[name] = fn;\n};\n\n/**\n * Initialize a reactive template for `el` and `obj`.\n *\n * @param {Element} el\n * @param {Element} obj\n * @param {Object} options\n * @api public\n */\n\nfunction Reactive(el, obj, options) {\n  if (!(this instanceof Reactive)) return new Reactive(el, obj, options);\n  this.el = el;\n  this.obj = obj;\n  this.els = [];\n  this.fns = options || {};\n  this.bindAll();\n}\n\n/**\n * Apply all bindings.\n *\n * @api private\n */\n\nReactive.prototype.bindAll = function() {\n  for (var name in exports.bindings) {\n    this.bind(name, exports.bindings[name]);\n  }\n};\n\n/**\n * Bind `name` to `fn`.\n *\n * @param {String|Object} name or object\n * @param {Function} fn\n * @api public\n */\n\nReactive.prototype.bind = function(name, fn) {\n  if ('object' == typeof name) {\n    for (var key in name) {\n      this.bind(key, name[key]);\n    }\n    return;\n  }\n\n  var obj = this.obj;\n  var els = exports.query(this.el, '[' + name + ']');\n  if (!els.length) return;\n\n  debug('bind [%s] (%d elements)', name, els.length);\n  for (var i = 0; i < els.length; i++) {\n    var binding = new Binding(name, this, els[i], fn);\n    binding.bind();\n  }\n};\n\n// bundled bindings\n\nbindings(exports.bind);\n//@ sourceURL=timoxley-reactive/lib/index.js"
));
require.register("timoxley-reactive/lib/binding.js", Function("module, exports, require",
"\n/**\n * Module dependencies.\n */\n\nvar parse = require('format-parser');\n\n/**\n * Expose `Binding`.\n */\n\nmodule.exports = Binding;\n\n/**\n * Initialize a binding.\n *\n * @api private\n */\n\nfunction Binding(name, view, el, fn) {\n  this.name = name;\n  this.view = view;\n  this.obj = view.obj;\n  this.fns = view.fns;\n  this.el = el;\n  this.fn = fn;\n}\n\n/**\n * Apply the binding.\n *\n * @api private\n */\n\nBinding.prototype.bind = function() {\n  var val = this.el.getAttribute(this.name);\n  this.fn(this.el, val, this.obj);\n};\n\n/**\n * Return value for property `name`.\n *\n *  - check if the \"view\" has a `name` method\n *  - check if the \"model\" has a `name` method\n *  - check if the \"model\" has a `name` property\n *\n * @param {String} name\n * @return {Mixed}\n * @api public\n */\n\nBinding.prototype.value = function(name) {\n  var obj = this.obj;\n  var view = this.view.fns;\n\n  // view method\n  if ('function' == typeof view[name]) {\n    return view[name]();\n  }\n\n  // getter-style method\n  if ('function' == typeof obj[name]) {\n    return obj[name]();\n  }\n\n  // value\n  return obj[name];\n};\n\n/**\n * Return formatted property.\n *\n * @param {String} fmt\n * @return {Mixed}\n * @api public\n */\n\nBinding.prototype.formatted = function(fmt) {\n  var calls = parse(fmt);\n  var name = calls[0].name;\n  var val = this.value(name);\n\n  for (var i = 1; i < calls.length; ++i) {\n    var call = calls[i];\n    call.args.unshift(val);\n    var fn = this.fns[call.name];\n    val = fn.apply(this.fns, call.args);\n  }\n\n  return val;\n};\n\n/**\n * Define subscription `fn`.\n *\n * @param {Function} fn\n * @api public\n */\n\nBinding.prototype.subscribe = function(fn){\n  this._subscribe = fn;\n};\n\n/**\n * Define unsubscribe `fn`.\n *\n * @param {Function} fn\n * @api public\n */\n\nBinding.prototype.unsubscribe = function(fn){\n  this._unsubscribe = fn;\n};\n\n/**\n * Invoke `fn` on changes.\n *\n * @param {Function} fn\n * @api public\n */\n\nBinding.prototype.change = function(fn) {\n  fn.call(this);\n  var calls = parse(this.el.getAttribute(this.name));\n  var prop = calls[0].name;\n\n  var sub = this._subscribe || Binding.subscribe;\n  sub(this.obj, prop, fn.bind(this));\n};\n\n/**\n * Default subscription method.\n */\n\nBinding.subscribe = function(obj, prop, fn) {\n  if (!obj.on) return;\n  obj.on('change '+ prop, fn);\n};\n\n/**\n * Default unsubscription method.\n */\n\nBinding.unsubscribe = function(obj, prop, fn) {\n  if (!obj.off) return;\n  obj.off('change '+ prop, fn);\n};\n//@ sourceURL=timoxley-reactive/lib/binding.js"
));
require.register("timoxley-reactive/lib/bindings.js", Function("module, exports, require",
"\n/**\n * Module dependencies.\n */\n\nvar event = require('event')\n  , classes = require('classes');\n\n/**\n * Attributes supported.\n */\n\nvar attrs = [\n  'id',\n  'src',\n  'rel',\n  'cols',\n  'rows',\n  'name',\n  'href',\n  'title',\n  'style',\n  'width',\n  'value',\n  'height',\n  'tabindex',\n  'placeholder'\n];\n\n/**\n * Events supported.\n */\n\nvar events = [\n  'change',\n  'click',\n  'mousedown',\n  'mouseup',\n  'blur',\n  'focus',\n  'input',\n  'keydown',\n  'keypress',\n  'keyup'\n];\n\n/**\n * Apply bindings.\n */\n\nmodule.exports = function(bind){\n\n  /**\n   * Generate attribute bindings.\n   */\n\n  attrs.forEach(function(attr){\n    bind('data-' + attr, function(el, name, obj){\n      this.change(function(){\n        el.setAttribute(attr, this.formatted(name));\n      });\n    });\n  });\n\n  /**\n   * Show binding.\n   */\n\n  bind('data-show', function(el, name){\n    this.change(function(){\n      if (this.value(name)) {\n        classes(el).add('show').remove('hide');\n      } else {\n        classes(el).remove('show').add('hide');\n      }\n    });\n  });\n\n  /**\n   * Hide binding.\n   */\n\n  bind('data-hide', function(el, name){\n    this.change(function(){\n      if (this.value(name)) {\n        classes(el).remove('show').add('hide');\n      } else {\n        classes(el).add('show').remove('hide');\n      }\n    });\n  });\n\n  /**\n   * Checked binding.\n   */\n\n  bind('data-checked', function(el, name){\n    this.change(function(){\n      if (this.value(name)) {\n        el.setAttribute('checked', 'checked');\n      } else {\n        el.removeAttribute('checked');\n      }\n    });\n  });\n\n  /**\n   * Text binding.\n   */\n\n  bind('data-text', function(el, name){\n    this.change(function(){\n      el.textContent = this.formatted(name);\n    });\n  });\n\n  /**\n   * Generate event bindings.\n   */\n\n  events.forEach(function(name){\n    bind('on-' + name, function(el, method){\n      var fns = this.view.fns\n      event.bind(el, name, function(e){\n        var fn = fns[method];\n        if (!fn) throw new Error('method .' + method + '() missing');\n        fns[method](e);\n      });\n    });\n  });\n};\n//@ sourceURL=timoxley-reactive/lib/bindings.js"
));
require.register("react/index.js", Function("module, exports, require",
"\"use strict\"\n\nvar watch = require('watch').watch\nvar Emitter = require('emitter')\n\n/**\n * Make an object react when changed.\n * i.e. emit `change` events when properties change.\n *\n * @param {Object} source\n * @param {Array|String} properties\n * @api public\n */\nmodule.exports = function react(source, properties) {\n  var target = isEmitter(source)\n    ? source\n    : createEmitterClone(source)\n\n  var onWatch = function(prop, action, newValue, oldValue) {\n    target[prop] = newValue\n    target.emit('change', prop, newValue, oldValue, action) // generic 'change'\n    target.emit('change ' + prop, newValue, oldValue, action) // reactive compatible\n  }\n  // properties is optional and we only want to spply `watch`\n  // with them if they are present.\n  var args = []\n  args.push(source)\n  properties && args.push(properties)\n  args.push(onWatch)\n  watch.apply(undefined, args)\n  return target\n}\n\n/**\n * true if `obj` looks like an `Emitter`.\n *\n * @param {Object} obj\n * @return {Boolean}\n * @api private\n */\n\nfunction isEmitter(obj) {\n  if (obj instanceof Emitter) return true\n  for (var key in Emitter.prototype) {\n    if (!(key in obj)) return false\n  }\n  return true\n}\n\n/**\n * Create a dummy object  for use as a data-source\n * stand-in if the real data source is not an event\n * emitter already.\n *\n * @param {Object} source\n * @return {Emitter}\n * @api private\n */\n\nfunction createEmitterClone(source) {\n  function EmitterDataClone(){}\n  Emitter(EmitterDataClone.prototype)\n  var target = new EmitterDataClone()\n  return mixin(target, source)\n}\n\n/**\n * Mix `source` properties into `target`\n *\n * @param target\n * @param source\n * @api private\n */\n\nfunction mixin(target, source) {\n  for (var key in source) {\n    target[key] = source[key]\n  }\n  return target\n}\n//@ sourceURL=react/index.js"
));
require.alias("timoxley-watch/index.js", "react/deps/watch/index.js");

require.alias("component-emitter/index.js", "react/deps/emitter/index.js");

require.alias("timoxley-assert/index.js", "react/deps/assert/index.js");
require.alias("component-inherit/index.js", "timoxley-assert/deps/inherit/index.js");

require.alias("timoxley-reactive/lib/index.js", "react/deps/reactive/lib/index.js");
require.alias("timoxley-reactive/lib/binding.js", "react/deps/reactive/lib/binding.js");
require.alias("timoxley-reactive/lib/bindings.js", "react/deps/reactive/lib/bindings.js");
require.alias("timoxley-reactive/lib/index.js", "react/deps/reactive/index.js");
require.alias("component-format-parser/index.js", "timoxley-reactive/deps/format-parser/index.js");

require.alias("visionmedia-debug/index.js", "timoxley-reactive/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "timoxley-reactive/deps/debug/debug.js");

require.alias("component-event/index.js", "timoxley-reactive/deps/event/index.js");

require.alias("component-classes/index.js", "timoxley-reactive/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");
