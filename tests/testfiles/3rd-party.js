const { A9 } = require("./utils/cdn");

(() => {
    class A9 {
        from = "local";
    }
})();

class B9 extends A9 {}

const b9 = new B9();

module.exports = { b9 };
