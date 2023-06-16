class A {
    x = "a";
    y;

    constructor() {
        this.y = this.x;
    }
}

class B extends A {
    x = "b";
}

const b = new B();

module.exports = { b };
