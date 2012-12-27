var react = require('react')
var assert = require('timoxley-assert')


var User = function(options) {
  options = options || {}
  this.name = options.name
  this.age = options.age
  react(this)
}

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
})

