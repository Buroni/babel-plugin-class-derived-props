const EXPECTED_VAL = 4;

const multiplierMixin = (Base) =>
    class extends Base {
        mult(a, b) {
            return a * this.rightTerm;
        }
    };

const randomizerMixin = (Base) =>
    class extends Base {
        randomize() {
            return Math.random();
        }
    };

class A6 {
    rightTerm = 1;

    add(a, b) {
        return a + this.rightTerm;
    }
}

class B6 extends multiplierMixin(randomizerMixin(A6)) {
    rightTerm = 2;
}

const b6 = new B6();

module.exports = { b6, EXPECTED_VAL };
