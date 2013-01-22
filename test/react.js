var react = require('react')
var assert = require('timoxley-assert')
var Emitter = require('component-emitter')

var User = function(options) {
  options = options || {}
  this.name = options.name
  this.age = options.age
  react(this)
}

Emitter(User.prototype)

describe('events', function() {
  var model
  beforeEach(function() {
    model = new User({name: undefined, age: 27})
  })

  it('fires events when properties are set', function(done) {
    model.once('change', function(prop, value) {
      assert.equal(prop, 'name')
      assert.equal(value, 'Tim')
      done()
    })
    model.name = 'Tim'
  })

  it('fires change events when properties are updated', function(done) {
    model.once('change', function(prop, value) {
      assert.equal(prop, 'name')
      assert.equal(value, 'Tim')
      done()
    })
    model.name = 'Tim'
  })
  it('fires reactive-style "change prop" events when properties are updated', function(done) {
    model.once('change name', function(value) {
      assert.equal(value, 'Tim')
      done()
    })
    model.name = 'Tim'
  })

  it('can take list of properties', function(done) {
    var User = function(options) {
      options = options || {}
      this.name = options.name
      this.age = options.age
      react(this, ['age'])
    }

    User.prototype = new Emitter

    model = new User({name: 'Tim'})
    model.once('change name', function(value) {
      throw new Error('Should not fire on name')
    })
    model.once('change', function() {
      setTimeout(function() {
        done()
      }, 1)
    })
    model.name = 'Tim Oxley' // should not fire change
    model.age = 27
  })
  it('supports recursion', function() {
    var parent = react(Emitter({name: 'Tim'}))
    var child = react(Emitter({name: 'Bob', parent: parent}))
    var parent2 = react(Emitter({name: 'Jill', child: child}))
    child.parent = parent2
  })
})

