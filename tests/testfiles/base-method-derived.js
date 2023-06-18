class A7 {
    thing = "ok";
    getThing() {
        return this.thing;
    }
}
class B7 extends A7 {
    something = this.getThing();
}

const b7 = new B7();

module.exports = { b7 };
