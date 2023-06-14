class Service {
    url = "me.com";
}

class ImageService {
    url = "image.me.com";
}

class Base {
    b = "base";
}

class A extends Base {
    foo = new Service();

    constructor() {
        super();
        console.log(this.foo);
        console.log(this.b);
    }
}

class B extends A {
    foo = new ImageService();
}

new B();
