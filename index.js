var watch = require('watch').watch

var Emitter = require('emitter')


/**
 * Make an object reactive, i.e. emit `change` events when
 * its properties change.
 *
 * Takes an optional single key or array of keys to make reactive.
 *```js
 * var Stock = function(options) {
 *   options = options || {}
 *   this.value = options.value
 *   this.name = options.name
 *   react(this) // make this react to changes
 * }
 *
 * // Generate new instance exactly as normal.
 * var AAPL = new Stock({
 *    value: 100,
 *    name: 'AAPL'
 *  })
 *
 *  AAPL.on('change value', function(newValue, oldValue) {
 *    console.log('AAPL value changed from %d to %d!', oldValue, newValue)
 *  })
 *
 *  // Note: no stupid .get() or .set() BS :D
 *  AAPL.value = 200
 *  // => AAPL value changed from 100 to 200!
 *```
 *
 * @param {Object} obj
 * @param {Array|String} properties
 * @api public
 */
module.exports = function react(obj, properties) {
  if (!isEmitter(obj)) {
    Emitter(obj.__proto__ || obj)
  }
  var onWatch = function(prop, action, newValue, oldValue) {
    obj.emit('change', prop, newValue, oldValue, action) // generic 'change'
    obj.emit('change ' + prop, newValue, oldValue, action) // reactive compatible
  }
  var args = []
  args.push(obj)
  properties && args.push(properties)
  args.push(onWatch)
  watch.apply(undefined, args)
}

function isEmitter(obj) {
  for (var key in Emitter.prototype) {
    if (!key in obj) return false
  }
}
