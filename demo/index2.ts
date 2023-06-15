// class Base {
//     x = "base class";
//
//     constructor() {
//         console.log(this.x);
//     }
// }
//
// class A extends Base {
//     x = "a class not base"
//     y = "a class";
//
//     constructor() {
//         super();
//         console.log(this.y);
//     }
// }
//
// class B extends A {
//     x = "b class not base";
//     y = "b class not a";
//
//     constructor() {
//         super();
//         console.log("this is B");
//     }
// }

/////

class Base_A {
    x = "a class not base";

    constructor() {
        console.log(this.x);
    }
}

class Base_B {
    x = "b class not base";

    constructor() {
        console.log(this.x);
    }
}

class A extends Base_A {
    y = "a class";

    constructor() {
        super();
        console.log(this.y);
    }
}

class A_B extends Base_B {
    y = "b class not a";

    constructor() {
        super();
        console.log(this.y);
    }
}

class B extends A_B {
    constructor() {
        super();
        console.log("this is B");
    }
}

new B();
new A();
