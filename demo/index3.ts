class A {
    x = "a";

    constructor() {
        console.log(this.x);
    }
}

class B extends A {
    x = "b";

    constructor() {
        super();
        console.log("this is B");
    }
}
