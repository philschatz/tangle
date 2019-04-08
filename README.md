
# Dynamic documents

## Example

Simple HTML content:

```html
When you eat <input data-var="cookies" type="number" min="2" max="100" data-init="(randomSeed) => Math.round(randomSeed * 10) + 2"/> cookies, you consume <var data-inputs="cookies" data-fn="(c) => c * 50"/> calories.
```

See [./index.xhtml](./index.xhtml) for more examples.

## API

Elements contain a few additional attributes:

- `data-fn="(cookies) => cookies * 50"` : The code that executes to generate the desired value. The text of the element updates to show the value
- `data-var="calories"` : An optional variable that stores the value. This can be used as input to other `data-fn="..."`.
- `data-init="(randomSeed) => 2"` : Function that defines the initial value. It always accepts `randomSeed` as the last argument.
- `data-inputs="cookies"` : The arguments that will be passed in to the `data-fn`. These **must** be comma-separated and **must** match the number of expected arguments to `data-fn`.

## About

This is inspired by [Bret Victor's Tangle example](http://worrydream.com/Tangle/)