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

class C extends B {
    foo = new BlobService();
}

new C();
