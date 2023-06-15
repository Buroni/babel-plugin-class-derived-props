class Base:
    b = "base"

    def __init__(self):
        print(self.b)


class A(Base):
    foo = "foo"

    def __init__(self):
        super().__init__()
        print(self.foo)


class B(A):
    b = "not base"
    foo = "bar"

B()
