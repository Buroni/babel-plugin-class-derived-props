class A8 {
    name = "A8";
}

const b8 = (() => {
    class A8 {
        name = "A8 inner scope";
        message;
        constructor() {
            this.message = this.name;
        }
    }

    class B8 extends A8 {
        name = "B8";
    }

    return new B8();
})();

module.exports = { b8 };
