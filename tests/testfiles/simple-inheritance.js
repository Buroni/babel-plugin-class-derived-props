const EXPECTED_VAL_Y = "b";
const EXPECTED_VAL_MSG = "hello";

class A {
    x = "a";
    y;

    message() {
        return EXPECTED_VAL_MSG;
    }

    constructor() {
        this.y = this.x;
    }
}

class B extends A {
    x = EXPECTED_VAL_Y;
}

const b = new B();

module.exports = { b, EXPECTED_VAL_Y, EXPECTED_VAL_MSG };
