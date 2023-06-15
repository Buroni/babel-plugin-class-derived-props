class A {
    x = "a";
}

class B extends A {
    x = "b";
}

B.prototype.hello = () => console.log("Hello, world!");

const b = new B();

console.log(b instanceof B);
console.log(b instanceof A);

b.hello();
