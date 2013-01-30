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
    clock.time = new Date()
  }, 1000)

  react(clock).on('change', function(prop, newValue, oldValue) {
    console.log("The "+prop+" is now: " + newValue)
    // => the time is now Sat Jan 05 2013 11:38:31 GMT+0800 (SGT)
  })

  // alternatively, listen for particular property changes:
  react(clock).on('change time', function(newValue, oldValue) {
    console.log("The time is: " + newValue)
    // => the time is now Sat Jan 05 2013 11:38:31 GMT+0800 (SGT)
  })

```

### Use with `component/reactive`

If you're using `react` with [component/reactive](https://github.com/component/reactive) you can
simply wrap your data with `react()` as you pass it to `reactive`:

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

`reactive` needs an `Emitter` (or something that looks like one). If the object you pass to `react` isn't an `Emitter`, `react` returns a new `Emitter` with the passed-in object set as the prototype.

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
