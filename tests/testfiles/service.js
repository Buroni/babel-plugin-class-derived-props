const EXPECTED_VAL_SERVICE = "jpg-image.me.com";

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
    ServiceType = Service;
    service;

    constructor() {
        this.service = new this.ServiceType();
    }
}

class Image extends Base {
    ServiceType = ImageService;
}

class JpgImage extends Image {
    ServiceType = JpgImageService;
}

const jpg = new JpgImage();

module.exports = { jpg, EXPECTED_VAL_SERVICE };
