class A:
    foo = "foo"

    def __init__(self):
        print(self.foo)


class B(A):
    foo = "bar"


B()
