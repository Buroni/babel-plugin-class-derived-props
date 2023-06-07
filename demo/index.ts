import { MY_CONST } from "./a";

const showMessage = () => void console.log(MY_CONST);

function msgFn() {
    return MY_CONST + "!";
}

class Clazz {
    c = MY_CONST;
}

const clazz = new Clazz;