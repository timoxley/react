var watch = require('watch').watch

var Emitter = require('emitter')

module.exports = function react(obj) {
  if (!isEmitter(obj)) {
    Emitter(obj.__proto__ || obj)
  }
  watch(obj, function(prop, action, newValue, oldValue) {
    obj.emit('change', prop, newValue, oldValue, action) // generic 'change'
    obj.emit('change ' + prop, newValue, oldValue, action) // reactive compatible
  })
}

function isEmitter(obj) {
  for (var key in Emitter.prototype) {
    if (!key in obj) return false
  }
}
