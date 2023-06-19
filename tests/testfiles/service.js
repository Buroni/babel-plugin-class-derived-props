const EXPECTED_VAL_SERVICE = "jpg-image.me.com";
const EXPECTED_VAL_X = "a from Image";

class Service {
    url = "me.com";
}

class ImageService extends Service {
    url = "image.me.com";
}

class JpgImageService extends ImageService {
    url = EXPECTED_VAL_SERVICE;
}

class Base {
    service = new Service();
    x;
    message = "from Base";

    constructor(x) {
        this.x = `${x} ${this.message}`;
        this._service = this.service;
    }
}

class Image extends Base {
    service = new ImageService();
    message = "from Image";
}

class JpgImage extends Image {
    service = new JpgImageService();
}

const jpg = new JpgImage("a");

module.exports = { jpg, EXPECTED_VAL_SERVICE, EXPECTED_VAL_X };
