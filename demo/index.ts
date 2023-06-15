class BaseService {
    url = "";

    constructor() {}
}

class Service extends BaseService {
    url = "me.com";

    constructor() {
        super();
    }
}

class ImageService extends BaseService {
    url = "image.me.com";

    constructor() {
        super();
    }
}

class BlobService extends BaseService {
    url = "blob.me.com";

    constructor() {
        super();
    }
}

class Base {
    b = "base";

    constructor() {
        console.log("b", this.b);
    }
}

class A extends Base {
    foo = new Service();

    constructor() {
        super();
        console.log(this.foo);
    }
}

class B extends A {
    foo = new ImageService();

    constructor() {
        super();
    }
}

class C extends B {
    b = "not base; C";
    foo = new BlobService();

    constructor() {
        super();
    }
}

new C();
