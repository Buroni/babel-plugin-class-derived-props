const EXPECTED_VAL_PRIVATE = "bar";

class A11 {
    #foo = EXPECTED_VAL_PRIVATE;
    a;

    constructor() {
        this.a = this.#foo;
    }
}

class B11 extends A11 {
    #foo = "baz";
}

const b11 = new B11();

module.exports = { b11, EXPECTED_VAL_PRIVATE };
