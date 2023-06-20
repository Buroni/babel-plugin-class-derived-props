class __A {
    ctor() {
        console.log(this.foo);
    }

    initProps() {
        this.foo = "bar";
    }
}

class __B extends __A {
    initProps() {
        super.initProps();
        this.foo = "baz";
    }

    ctor() {
        super.ctor();
    }
}

class A {
    constructor() {
        const __class = new __A();
        __class.initProps();
        __class.ctor();
        return __class;
    }
}

class B {
    constructor() {
        const __class = new __B();
        __class.initProps();
        __class.ctor();
        return __class;
    }
}

new B();
