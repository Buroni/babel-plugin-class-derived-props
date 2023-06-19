test("Simple class properties and methods should act as normal", () => {
    const { a10, EXPECTED_VAL } = require("./dist/single-class");

    expect(a10.a).toBe(EXPECTED_VAL);
    expect(a10.message()).toBe(EXPECTED_VAL);
});

describe("Simple inheritance tests", () => {
    const {
        b,
        EXPECTED_VAL_Y,
        EXPECTED_VAL_MSG,
    } = require("./dist/simple-inheritance");
    const { b11, EXPECTED_VAL_PRIVATE } = require("./dist/private-field");

    test("Property defined in base class should have derived value", () => {
        expect(b.y).toBe(EXPECTED_VAL_Y);
    });

    test("Base class method should be reflected in derived class as normal", () => {
        expect(b.message()).toBe(EXPECTED_VAL_MSG);
    });

    test("Private base class field shouldn't override subclass", () => {
        expect(b11.a).toBe(EXPECTED_VAL_PRIVATE);
    });
});

test("Property defined in base class should have derived value when subclass is in inner scope", () => {
    const { BFactory, EXPECTED_VAL } = require("./dist/nested");
    const b = BFactory();
    expect(b.y).toBe(EXPECTED_VAL);
});

describe("Service tests", () => {
    const { jpg, EXPECTED_VAL_SERVICE } = require("./dist/service");

    test("Injected service defined in base class should equal derived service", () => {
        expect(jpg.service.url).toBe(EXPECTED_VAL_SERVICE);
    });
});

describe("Prototype and instanceof patching tests", () => {
    const {
        isInstanceOf,
        prototypeMethod,
        EXPECTED_VAL,
    } = require("./dist/prototype");

    test("`instanceof` should be patched", () => {
        expect(isInstanceOf).toBe(true);
    });

    test("Prototype should be patched", () => {
        expect(prototypeMethod()).toBe(EXPECTED_VAL);
    });
});

test("Base class shouldn't inherit constructor param left out of `super`", () => {
    const { c5, EXPECTED_VAL } = require("./dist/params-subset-super");

    expect(c5.result).toBe(EXPECTED_VAL);
});

test("Mixins should inherit as normal", () => {
    const { b6, EXPECTED_VAL } = require("./dist/mixins");

    expect(b6.mult(2)).toBe(EXPECTED_VAL);
});

describe("Scope tests", () => {
    test("Two classes with the same name in different scopes should inherit within their own scopes", () => {
        const { b8, EXPECTED_VAL } = require("./dist/dup-classnames");

        expect(b8.message).toBe(EXPECTED_VAL);
    });

    test("Plugin shouldn't interfere with 3rd party modules", () => {
        const { b9, EXPECTED_VAL } = require("./dist/3rd-party");
        expect(b9.from).toBe(EXPECTED_VAL);
    });
});
