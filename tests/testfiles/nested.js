class A2 {
    x = "a";
    y;

    constructor() {
        this.y = this.x;
    }
}

const BFactory = () => {
    class B2 extends A2 {
        x = "b";
    }

    return new B2();
};

module.exports = { BFactory };
