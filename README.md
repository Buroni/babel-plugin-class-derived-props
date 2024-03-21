# babel-plugin-derived-class-props

Allows ES6 derived class properties to be available in the base constructor like in python

```js
class A {
    foo = "bar";

    constructor() {
        console.log(this.foo);
    }
}

class B extends A {
    foo = "baz";
}

// logs "baz"
const b = new B();
```
