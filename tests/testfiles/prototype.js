const EXPECTED_VAL = "Hello, world!";

class A3 {}

class B3 extends A3 {}

A3.prototype.hello = () => EXPECTED_VAL;

const b = new B3();

module.exports = {
    isInstanceOf: b instanceof A3,
    prototypeMethod: b.hello,
    EXPECTED_VAL,
};
