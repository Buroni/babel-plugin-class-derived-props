const EXPECTED_VAL_PRIVATE = "bar";

class A11 {
    private foo: string = EXPECTED_VAL_PRIVATE;
    a;

    constructor() {
        this.a = this.foo;
    }
}

class B11 extends A11 {
    private foo: string;
}

const b11 = new B11();

console.log(b11.foo);
module.exports = { b11, EXPECTED_VAL_PRIVATE };
