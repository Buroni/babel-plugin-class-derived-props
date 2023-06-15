// class Base {
//     b = "base";
//
//     constructor() {
//         console.log("base", this.b);
//     }
// }
// class A extends Base {
//     foo = "A"
//
//     constructor() {
//         console.log(this.foo);
//     }
// }
//
// class B extends A {
//     foo = "B"
//     b = "B not base";
//
//     constructor() {
//         console.log("from b");
//     }
// }

class _Base {
    b;

    ctor() {
        console.log("base:2", this.b);
    }

    initProps() {
        this.b = "base";
    }
}

class _A extends _Base {
    foo;

    ctor() {
        super.ctor();
        console.log(this.foo);
    }

    initProps() {
        this.foo = "A";
    }
}

class _B extends _A {
    ctor() {
        super.ctor();
        console.log("from b");
    }

    initProps() {
        super.initProps();
        this.foo = "B";
        this.b = "B not base";
    }
}

class Base {
    constructor() {
        const _class = new _Base();
        _class.initProps();
        _class.ctor();
        return _class;
    }
}

class A {
    constructor() {
        const _class = new _A();
        _class.initProps();
        _class.ctor();
        return _class;
    }
}

class B {
    constructor() {
        const _class = new _B();
        _class.initProps();
        _class.ctor();
        return _class;
    }
}

new B();
