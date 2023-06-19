const EXPECTED_VAL = "a";

class A5 {
    result;
    constructor(a, b) {
        this.result = a;
        if (b) {
            this.result += b;
        }
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

const c5 = new C5(EXPECTED_VAL, "b");

module.exports = { c5, EXPECTED_VAL };
