import { MY_CONST, fromA } from "./a";

const showMessage = () => void console.log(MY_CONST);

function msgFn() {
    return MY_CONST + "!";
}

class Clazz {
    c = MY_CONST;

    foo() {
        fromA();
    }
}

const clazz = new Clazz;