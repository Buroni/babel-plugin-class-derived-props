const { b } = require("./dist/simple");
const { BFactory } = require("./dist/nested");
const { jpg } = require("./dist/service");
const { isInstanceOf, prototypeMethod, TEST_MSG } = require("./dist/prototype");

test("Checks overwritten inherited property of subclass", () => {
    expect(b.y).toBe("b");
});

test("Checks classes in different scopes inherit properly", () => {
    const b = BFactory();
    expect(b.y).toBe("b");
});

test("Injected service class with arguments", () => {
    expect(jpg.service.url).toBe("jpg-image.me.com");
    expect(jpg.x).toBe("a from Image");
});

test("`instanceof` patching", () => {
    expect(isInstanceOf).toBe(true);
});

test("Prototype patching", () => {
    expect(prototypeMethod()).toBe(TEST_MSG);
});
