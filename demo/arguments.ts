class A {
    p;
    foo = "bar";

    constructor(p) {
        console.log("foo = " + this.foo);
        this.p = p;
    }
}

class B extends A {
    foo = "baz";

    constructor(p) {
        super();
        this.p = p + " from B";
    }
}

const a = new A("propA");
const b = new B("propB");

console.log(a.p);
console.log(b.p);
