class A4 {
    a;
    _g;

    baseMethod() {
        return "base method";
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
            this._g = "getter value overwritten";
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

module.exports = { c };
