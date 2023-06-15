class A {
    x = "a";
}

class B extends A {
    x = "b";
}

const b = new B();

console.log(b instanceof B);
console.log(b instanceof A);
