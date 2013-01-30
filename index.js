"use strict"

var watch = require('watch').watch
var Emitter = require('emitter')

/**
 * Make an object react when changed.
 * i.e. emit `change` events when properties change.
 *
 * @param {Object} source
 * @param {Array|String} properties
 * @api public
 */
module.exports = function react(source, properties) {
  var target = source
  if (!isEmitter(source)) {
    target = Object.create(source)
    Emitter(target)
  }

  var onWatch = function(prop, action, newValue, oldValue) {
    target[prop] = newValue
    target.emit('change', prop, newValue, oldValue, action) // generic 'change'
    target.emit('change ' + prop, newValue, oldValue, action) // reactive compatible
  }
  // properties is optional and we only want to spply `watch`
  // with them if they are present.
  var args = []
  args.push(source)
  properties && args.push(properties)
  args.push(onWatch)
  args.push(1)
  watch.apply(undefined, args)
  return target
}

/**
 * true if `obj` looks like an `Emitter`.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isEmitter(obj) {
  if (obj instanceof Emitter) return true
  for (var key in Emitter.prototype) {
    if (!(key in obj)) return false
  }
  return true
}

/**
 * Create a dummy object  for use as a data-source
 * stand-in if the real data source is not an event
 * emitter already.
 *
 * @param {Object} source
 * @return {Emitter}
 * @api private
 */

function createEmitterClone(source) {
  function EmitterDataClone(){}
  Emitter(EmitterDataClone.prototype)
  var target = new EmitterDataClone()
  return mixin(target, source)
}

/**
 * Mix `source` properties into `target`
 *
 * @param target
 * @param source
 * @api private
 */

function mixin(target, source) {
  for (var key in source) {
    target[key] = source[key]
  }
  return target
}
