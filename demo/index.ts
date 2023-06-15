class BaseService {
    url;
}

class Service extends BaseService {
    url = "me.com";
}

class ImageService extends BaseService {
    url = "image.me.com";
}

class BlobService extends BaseService {
    url = "blob.me.com";
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
}

class C extends B {
    b = "not base; C";
    foo = new BlobService();
}

new C();
