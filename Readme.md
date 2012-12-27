# react

  Emit reactive-compatible change events whenever an object changes.

## Installation

    $ component install timoxley/react

## Usage

```js
  var react = require('react')

  var clock = {
    time: new Date()
  }

  setInterval(function() {
    // whoa, no need to call any silly .set() methods
    time.now = new Date()
  }, 1000)

  react(data).on('change', function(prop, newValue) {
    console.log("The "+prop+" is now: " + newValue)
  })

```

### Use with `reactive`

If you're just using `react` with `reactive`, simply wrap your data
with a call to `react` as you pass it into `reactive`:

```js
  reactive(element, react(model))
```

### Use with Classes

If your data source is an event Emitter, you can use `react` in your
data type's constructor to make all instances reactive:

```js
// Emitter data type
function Stock(name, value) {
  this.name = name
  this.value = value
  react(this)
}

Stock.prototype = new Emitter()

var AAPL = new Stock('AAPL', 100)
AAPL.on('change value', function(value) {
  console.log('new value for '+ this.name +' is', value)
})

```

If your data source is NOT an event Emitter, `react` will return a new
event Emitter fires `change` events whenever your original data source
changes. This emitter will also have all the synced properties of the
original data source, making this perfect for consumption with `reactive`.

```js
// Non-Emitter data type
function Stock(name, value) {
  this.name = name
  this.value = value
}

var AAPL = new Stock('AAPL', 100)
var stockListener = react(AAPL)
stockListener.on('change value', function(value) {
  // note the default value of `this` in this context is
  // a copy of the data source.
  console.log('new value for '+ this.name +' is', value)
})
```

## API

## react(obj, properties)

Make an object reactive, i.e. emit `change` events when its properties change.

Takes an optional list of properties to monitor for changes. Without
`properties`, events will fire whenever any property on `obj` changes.

## License

  MIT
