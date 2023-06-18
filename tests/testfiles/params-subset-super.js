class A5 {
    result;
    constructor(a, b) {
        this.result = a + b;
    }
}

class B5 extends A5 {
    foo = "bar";
}

class C5 extends B5 {
    constructor(a, b) {
        super(a);
    }
}

const c5 = new C5("a", "b");

module.exports = { c5 };
