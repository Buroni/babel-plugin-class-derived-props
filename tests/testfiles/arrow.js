class A {
    foo = "bar";

    arrow = () => this;

    constructor() {
        console.dir(this.arrow(), { depth: null });
    }
}

class B extends A {
    foo = "baz";

    arrow = () => this;
}

new B();
