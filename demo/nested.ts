class A {
    foo = "bar";

    constructor() {
        console.log(this.foo);
    }
}

function callB() {
    class B extends A {
        foo = "baz";
    }

    const b = new B();
}

callB();
