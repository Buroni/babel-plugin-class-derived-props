const TEST_MSG = "Hello, world!";

class A3 {}

class B3 extends A3 {}

A3.prototype.hello = () => TEST_MSG;

const b = new B3();

module.exports = {
    isInstanceOf: b instanceof A3,
    prototypeMethod: b.hello,
    TEST_MSG,
};
