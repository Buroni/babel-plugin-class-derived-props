const EXPECTED_VAL = "b";

class A {
    x = "a";
    y;

    constructor() {
        this.y = this.x;
    }
}

class B extends A {
    x = EXPECTED_VAL;
}

const b = new B();

module.exports = { b, EXPECTED_VAL };
