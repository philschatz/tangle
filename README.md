
# Dynamic documents

## Example

Suppose you want something like the following content in a book or exercise:

> When you eat _4_ cookies, you consume _200_ calories.

the content would need to be marked up like this:

```html
When you eat 

<input 
  data-var="cookies" 
  value="4"
  type="number" 
  min="2" 
  max="99" 
  />
  
cookies, you consume 

<var data-inputs="cookies" data-fn="(c) => c * 50"/> calories.
```


## Custom Initial Values

In order to give different users different variants, the editable fields can contain a `data-init="(randomSeed) => ..."` attribute.

In the cookies example above, we can replace `value="4"` with `data-init="(randomSeed) => Math.round(randomSeed * 10) + 2"` to give each user a different initial number of cookies.

When printing to a PDF, the same random seed can be provided and the values can be "baked" in to the content. But when viewed on the web, those values can be immediately replaced with a custom variant.

See [./index.xhtml](./index.xhtml) for more examples.


## Integration with sims

Since these values are dynamic, changing them can change the values used in a sim. This allows the sim to match the textbook content (and vice versa).


## API

Elements contain a few additional attributes:

- `data-var="cookies"` : An optional variable name which can be referred to use the value. This is used as input to other `data-fn="..."`.
- `data-fn="(c) => c * 50"` : The code that executes to generate the desired value. The text of the element updates to show the value
- `data-inputs="cookies"` : The arguments that will be passed in to the `data-fn`. These **must** be comma-separated and **must** match the number of expected arguments to `data-fn`.
- `data-init="(randomSeed) => 2"` : Function that defines the initial value. It always accepts `randomSeed` as the last argument.


## About

This is inspired by [Bret Victor's Tangle example](http://worrydream.com/Tangle/)