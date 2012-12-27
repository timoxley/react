# react

  Emit reactive-compatible change events whenever an object changes.

## Installation

    $ component install timoxley/react

## API

## React()

Make an object reactive, i.e. emit `change` events when its properties change.

```js
var Stock = function(options) {
  options = options || {}
  this.value = options.value
  this.name = options.name
  react(this) // make this react to changes
}

// Generate new instance exactly as normal.
var AAPL = new Stock({
  value: 100,
  name: 'AAPL'
})

AAPL.on('change value', function(newValue, oldValue) {
  console.log('AAPL value changed from %d to %d!', oldValue, newValue)
})

// Note: no stupid .get() or .set() BS :D
AAPL.value = 200
// => AAPL value changed from 100 to 200!
```

## License

  MIT
