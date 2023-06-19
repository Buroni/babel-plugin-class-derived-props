const EXPECTED_VAL_G = "getter value overwritten";
const EXPECTED_VAL_C = "from C4";
const EXPECTED_VAL_BASEMETHOD = "base method";

class A4 {
    a;
    _g;

    baseMethod() {
        return EXPECTED_VAL_BASEMETHOD;
    }

    get g() {
        if (!this._g) {
            this._g = "getter value";
        }
        return this._g;
    }

    constructor(a) {
        this.a = a;
    }
}

class B4 extends A4 {
    get g() {
        if (!this._g) {
            this._g = EXPECTED_VAL_G;
        }
        return this._g;
    }
}

class C4 extends B4 {
    constructor(a) {
        super(a);
    }
}

const c = new C4("from C4");

module.exports = { c, EXPECTED_VAL_G, EXPECTED_VAL_C, EXPECTED_VAL_BASEMETHOD };
