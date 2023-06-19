const EXPECTED_VAL = "a";

class A10 {
    a = EXPECTED_VAL;

    message() {
        return this.a;
    }
}

const a10 = new A10();

module.exports = { a10, EXPECTED_VAL };
