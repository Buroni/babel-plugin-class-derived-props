const EXPECTED_VAL = "b";

class A2 {
    x = "a";
    y;

    constructor() {
        this.y = this.x;
    }
}

const BFactory = () => {
    class B2 extends A2 {
        x = EXPECTED_VAL;
    }

    return new B2();
};

module.exports = { BFactory, EXPECTED_VAL };
