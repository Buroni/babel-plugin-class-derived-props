import { types as t } from "@babel/core";

const callMemberExpression = (
    member: any,
    property: string,
    args: any[] = []
): any =>
    /**
     * Calling an object member, e.g. `this.initProps()`
     */
    t.expressionStatement(
        t.callExpression(
            t.memberExpression(member, t.identifier(property)),
            args
        )
    );

const ctorBlock = (constr: any, node: any) => {
    const superCtorCall = (constr: any) =>
        callMemberExpression(
            t.super(),
            "ctor",
            constr
                ? [...constr.params]
                : [t.spreadElement(t.identifier("args"))]
        );

    const ctorBlock = t.blockStatement([
        node.superClass ? superCtorCall(constr) : t.emptyStatement(),
    ]);

    // Push original class constructor properties (except `super`) to underscored class `ctor()`
    if (constr) {
        ctorBlock.body.push(
            ...constr.body.body.filter(
                (b) => b.expression?.callee?.type !== "Super"
            )
        );
    }

    return ctorBlock;
};

const initBlock = (node, classBody) => {
    const superInitCall = node.superClass
        ? callMemberExpression(t.super(), "initProps")
        : t.emptyStatement();

    const classProps = classBody
        .filter((p) => t.isClassProperty(p))
        .map((p) => p.node);

    const initBlock = t.blockStatement([superInitCall]);

    // Push constructor class properties to `initProps()`,
    // e.g. `foo = "bar"` in the class body becomes `this.foo = "bar"` in `initProps()`
    initBlock.body.push(
        ...classProps.map((p) =>
            t.expressionStatement(
                t.assignmentExpression(
                    "=",
                    t.memberExpression(t.thisExpression(), p.key),
                    p.value === null ? t.nullLiteral() : p.value
                )
            )
        )
    );

    return initBlock;
};

const ctorMethod = (constr: any, node: any) =>
    t.classMethod(
        "method",
        t.identifier("ctor"),
        constr ? [...constr.params] : [t.restElement(t.identifier("args"))],
        ctorBlock(constr, node)
    );

export const buildClassAST = (path: any) => {
    /**
     * Builds the class wrapper which returns `__[clas-name]` internally, e.g.
     *
     * ```
     * class A {
     *     constructor() {
     *         __class = new __A;
     *         __class.initProps();
     *         __class.ctor();
     *         return __class;
     *     }
     * }
     * ```
     */
    const { node } = path;
    const constr = node.body.body.find((n) => n.key?.name === "constructor");

    return t.classDeclaration(
        // Prefix with `__$TRANSFORMED__` then remove later, as for some reason babel
        // throws a "duplicate name" error when swapping a class with one of the same name
        t.identifier(`__$TRANSFORMED__${node.id.name}`),
        null,
        t.classBody([
            t.classMethod(
                "constructor",
                t.identifier("constructor"),
                constr
                    ? [...constr.params]
                    : [t.restElement(t.identifier("args"))],
                t.blockStatement([
                    t.variableDeclaration("var", [
                        t.variableDeclarator(
                            t.identifier("__class"),
                            t.newExpression(
                                t.identifier(`__${node.id.name}`),
                                []
                            )
                        ),
                    ]),
                    callMemberExpression(t.identifier("__class"), "initProps"),
                    callMemberExpression(
                        t.identifier("__class"),
                        "ctor",
                        // Spread constructor args up to parent ctor if no explicit params
                        constr
                            ? [...constr.params]
                            : [t.spreadElement(t.identifier("args"))]
                    ),
                    t.returnStatement(t.identifier("__class")),
                ])
            ),
        ])
    );
};

export const buildUnderscoredClassAST = (path: any) => {
    /**
     * Builds the underscored class `__[class-name]` for each class, e.g.
     *
     * ```
     * class A extends Base {
     *     foo = "bar";
     *
     *     constructor() {
     *         console.log(this.foo);
     *     }
     * }
     * ```
     *
     * Becomes:
     *
     * ```
     * class __A extends __Base {
     *     ctor() {
     *         super.ctor();
     *         console.log(this.foo);
     *     }
     *
     *     initProps() {
     *         super.initProps();
     *         this.foo = "bar";
     *     }
     * }
     * ```
     */
    const { node } = path;
    const constr = node.body.body.find((n) => n.key?.name === "constructor");

    // `body` array of a `ClassBody` node
    const classBody = path.get("body").get("body");

    // Other class methods/getters which aren't properties should be copied across to underscored class
    const remainingBody = classBody
        .filter((p) => !t.isClassProperty(p))
        .map((p) => p.node);

    return t.classDeclaration(
        t.identifier(`__${node.id.name}`),
        node.superClass ? t.identifier(`__${node.superClass.name}`) : null,
        t.classBody([
            ...remainingBody,
            ctorMethod(constr, node),
            t.classMethod(
                "method",
                t.identifier("initProps"),
                [],
                initBlock(node, classBody)
            ),
        ])
    );
};
