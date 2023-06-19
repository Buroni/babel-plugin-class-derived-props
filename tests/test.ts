test("Simple class properties and methods should act as normal", () => {
    const { a10, EXPECTED_VAL } = require("./dist/single-class");

    expect(a10.a).toBe(EXPECTED_VAL);
    expect(a10.message()).toBe(EXPECTED_VAL);
});

test("Property defined in base class should have derived value in same scope", () => {
    const { b, EXPECTED_VAL } = require("./dist/simple-inheritance");

    expect(b.y).toBe(EXPECTED_VAL);
});

test("Property defined in base class should have derived value when subclass is in inner scope", () => {
    const { BFactory, EXPECTED_VAL } = require("./dist/nested");
    const b = BFactory();
    expect(b.y).toBe(EXPECTED_VAL);
});

test("Injected service defined in base class should equal derived service", () => {
    const { jpg, EXPECTED_VAL_SERVICE } = require("./dist/service");

    expect(jpg._service.url).toBe(EXPECTED_VAL_SERVICE);
});

test("Property defined in base class should be set via derived class constructor argument", () => {
    const { jpg, EXPECTED_VAL_X } = require("./dist/service");

    expect(jpg.x).toBe(EXPECTED_VAL_X);
});

test("`instanceof` should be patched", () => {
    const { isInstanceOf } = require("./dist/prototype");

    expect(isInstanceOf).toBe(true);
});

test("Prototype should be patched", () => {
    const { prototypeMethod, EXPECTED_VAL } = require("./dist/prototype");

    expect(prototypeMethod()).toBe(EXPECTED_VAL);
});

test("Getters should inherit as normal", () => {
    const { c, EXPECTED_VAL_G } = require("./dist/multiple-inheritance-getter");

    expect(c.g).toBe(EXPECTED_VAL_G);
});

test("Argument passed into subclass constructor should be reflected in base class as normal", () => {
    const { c, EXPECTED_VAL_C } = require("./dist/multiple-inheritance-getter");

    expect(c.a).toBe(EXPECTED_VAL_C);
});

test("Base class method should be reflected in sub class as normal", () => {
    const {
        c,
        EXPECTED_VAL_BASEMETHOD,
    } = require("./dist/multiple-inheritance-getter");

    expect(c.baseMethod()).toBe(EXPECTED_VAL_BASEMETHOD);
});

test("Base class shouldn't inherit constructor param left out of `super`", () => {
    const { c5, EXPECTED_VAL } = require("./dist/params-subset-super");

    expect(c5.result).toBe(EXPECTED_VAL);
});

test("Mixins should inherit as normal", () => {
    const { b6, EXPECTED_VAL } = require("./dist/mixins");

    expect(b6.mult(2)).toBe(EXPECTED_VAL);
});

test("Class properties defined on the base class should be available in the derived class", () => {
    const { b7, EXPECTED_VAL } = require("./dist/base-method-derived");

    expect(b7.something).toBe(EXPECTED_VAL);
});

test("Two classes with the same name in different scopes should inherit within their own scopes", () => {
    const { b8, EXPECTED_VAL } = require("./dist/dup-classnames");

    expect(b8.message).toBe(EXPECTED_VAL);
});

test("Plugin shouldn't interfere with 3rd party modules", () => {
    const { b9, EXPECTED_VAL } = require("./dist/3rd-party");
    expect(b9.from).toBe(EXPECTED_VAL);
});
