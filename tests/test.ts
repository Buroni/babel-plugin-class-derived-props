const { b } = require("./dist/simple");
const { BFactory } = require("./dist/nested");
const { jpg } = require("./dist/service");
const { isInstanceOf, prototypeMethod, TEST_MSG } = require("./dist/prototype");
const { c } = require("./dist/multiple-inheritance-getter");
const { c5 } = require("./dist/params-subset-super");
const { b6 } = require("./dist/mixins");
const { b7 } = require("./dist/base-method-derived");
const { b8 } = require("./dist/dup-classnames");
const { b9 } = require("./dist/3rd-party");

test("Property defined in base class should have derived value in same scope", () => {
    expect(b.y).toBe("b");
});

test("Property defined in base class should have derived value when subclass is in inner scope", () => {
    const b = BFactory();
    expect(b.y).toBe("b");
});

test("Injected service defined in base class should equal derived service", () => {
    expect(jpg._service.url).toBe("jpg-image.me.com");
});

test("Property defined in base class should be set via derived class constructor argument", () => {
    expect(jpg.x).toBe("a from Image");
});

test("`instanceof` should be patched", () => {
    expect(isInstanceOf).toBe(true);
});

test("Prototype should be patched", () => {
    expect(prototypeMethod()).toBe(TEST_MSG);
});

test("Getters should inherit as normal", () => {
    expect(c.g).toBe("getter value overwritten");
});

test("Argument passed into subclass constructor should be reflected in base class as normal", () => {
    expect(c.a).toBe("from C4");
});

test("Base class method should be reflected in sub class as normal", () => {
    expect(c.baseMethod()).toBe("base method");
});

test("Base class shouldn't inherit constructor param left out of `super`", () => {
    expect(c5.result).toBe("a");
});

test("Mixins should inherit as normal", () => {
    expect(b6.mult(2)).toBe(4);
});

test("Mixins should inherit as normal", () => {
    expect(b6.mult(2)).toBe(4);
});

test("Class properties defined on the base class should be available in the erived class", () => {
    expect(b7.something).toBe("ok");
});

test("Two classes with the same name in different scopes should inherit within their own scopes", () => {
    expect(b8.message).toBe("B8");
});

test("Plugin shouldn't interfere with 3rd party modules", () => {
    expect(b9.from).toBe("cdn");
});
