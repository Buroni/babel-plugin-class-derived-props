import { types as t, NodePath } from "@babel/core";

const getSuperArgs = (
    constr: t.ClassMethod
): t.CallExpression["arguments"] | undefined => {
    /**
     * Get `<args`> from `super(<args>)`
     */
    if (!constr) {
        return;
    }
    const superCall = constr.body.body.find(
        (n) =>
            t.isExpressionStatement(n) &&
            t.isCallExpression(n.expression) &&
            n.expression.callee.type === "Super"
    ) as t.ExpressionStatement | undefined;

    const callExpression = superCall?.expression as
        | t.CallExpression
        | undefined;

    return callExpression?.arguments;
};

const getConstr = (classDeclr: t.ClassDeclaration): t.ClassMethod | undefined =>
    /**
     * Get constructor method from class declaration
     */
    classDeclr.body.body.find(
        (n) =>
            t.isClassMethod(n) &&
            t.isIdentifier(n.key) &&
            n.key.name === "constructor"
    ) as t.ClassMethod;

const callMemberExpression = (
    member: t.Expression,
    property: string,
    args: t.CallExpression["arguments"] = []
): t.ExpressionStatement =>
    /**
     * Calling an object member, e.g. `this.initProps()`
     */
    t.expressionStatement(
        t.callExpression(
            t.memberExpression(member, t.identifier(property)),
            args
        )
    );

const ctorBlock = (
    constr: t.ClassMethod,
    node: t.ClassDeclaration,
    superArgs: t.CallExpression["arguments"]
): t.BlockStatement => {
    /**
     * Builds block body inside `ctor(<params>)` methods
     */
    const superCtorCall = () =>
        /**
         * Builds `ctor.super(<params>)`
         */
        callMemberExpression(
            t.super(),
            "ctor",
            superArgs ? [...superArgs] : [t.spreadElement(t.identifier("args"))]
        );

    const ctorBlock = t.blockStatement([
        node.superClass ? superCtorCall() : t.emptyStatement(),
    ]);

    // Push original class constructor properties (except `super`) to underscored class `ctor()`
    if (constr) {
        ctorBlock.body.push(
            ...(constr.body.body as t.ExpressionStatement[]).filter(
                (b) =>
                    (b.expression as t.CallExpression)?.callee?.type !== "Super"
            )
        );
    }

    return ctorBlock;
};

const ctorMethod = (
    node: t.ClassDeclaration,
    constr: t.ClassMethod,
    superArgs: t.CallExpression["arguments"]
): t.ClassMethod =>
    /**
     * Builds whole `ctor(<params>)` method
     */
    t.classMethod(
        "method",
        t.identifier("ctor"),
        constr ? [...constr.params] : [t.restElement(t.identifier("args"))],
        ctorBlock(constr, node, superArgs)
    );

const initBlock = (
    node: t.ClassDeclaration,
    classProps: t.ClassProperty[]
): t.BlockStatement => {
    /**
     * Builds block body inside `initProps()` method
     */

    const superInitCall = node.superClass
        ? callMemberExpression(t.super(), "initProps")
        : t.emptyStatement();

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

const initMethod = (
    classProps: t.ClassProperty[],
    node: t.ClassDeclaration
): t.ClassMethod =>
    /**
     * Builds whole `initProps()` method
     *
     * initProps() {
     *     super.initProps();
     *     this.foo = "bar";
     *     // Other class properties...
     * }
     */
    t.classMethod(
        "method",
        t.identifier("initProps"),
        [],
        initBlock(node, classProps)
    );

const buildUnderscoredConstructorBlock = (
    node: t.ClassDeclaration,
    constr: t.ClassMethod,
    superArgs: t.CallExpression["arguments"]
) =>
    /**
     * Builds the constructor method block for underscored class
     *
     * ```
     * __class = new __A;
     * __class.initProps();
     * __class.ctor();
     * return __class;
     * ```
     *
     */
    t.blockStatement([
        t.variableDeclaration("var", [
            t.variableDeclarator(
                t.identifier("__class"),
                t.newExpression(t.identifier(`__${node.id.name}`), [])
            ),
        ]),
        callMemberExpression(t.identifier("__class"), "initProps"),
        callMemberExpression(
            t.identifier("__class"),
            "ctor",
            // Spread constructor args up to parent ctor if no explicit params
            superArgs ? [...superArgs] : [t.spreadElement(t.identifier("args"))]
        ),
        t.returnStatement(t.identifier("__class")),
    ]);

const buildUnderscoredConstructorMethod = (node: t.ClassDeclaration) => {
    /**
     * Builds the constructor method for underscored class
     *
     * ```
     * constructor() {
     *     __class = new __A;
     *     __class.initProps();
     *     __class.ctor();
     *     return __class;
     * }
     * ```
     */
    const constr = getConstr(node);

    const superArgs = getSuperArgs(constr);

    return t.classMethod(
        "constructor",
        t.identifier("constructor"),
        constr ? [...constr.params] : [t.restElement(t.identifier("args"))],
        buildUnderscoredConstructorBlock(node, constr, superArgs)
    );
};

export const buildClassAST = (
    path: NodePath<t.ClassDeclaration>
): t.ClassDeclaration => {
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

    return t.classDeclaration(
        // Prefix with `__$TRANSFORMED__` then remove later, as for some reason babel
        // throws a "duplicate name" error when swapping a class with one of the same name
        t.identifier(`__$TRANSFORMED__${node.id.name}`),
        null,
        t.classBody([buildUnderscoredConstructorMethod(node)])
    );
};

export const buildUnderscoredClassAST = (
    path: NodePath<t.ClassDeclaration>
): t.ClassDeclaration => {
    /**
     * Builds the underscored class `__<class-name>` for each class, e.g.
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

    const constr = getConstr(node);
    const superArgs = getSuperArgs(constr);

    // `body` array of a `ClassBody` node
    const classBody = path.get("body").get("body");

    const classProps = classBody
        .map((p) => p.node)
        .filter((n) => t.isClassProperty(n)) as t.ClassProperty[];

    // Other (non-constructor) class methods/getters which aren't properties should be copied across to underscored class
    const remainingBody = classBody
        .map((p) => p.node)
        // TODO -- move into `isConstructor` helper
        .filter(
            (n) =>
                !t.isClassProperty(n) &&
                !(
                    t.isClassMethod(n) &&
                    t.isIdentifier(n.key) &&
                    n.key.name === "constructor"
                )
        );

    return t.classDeclaration(
        t.identifier(`__${node.id.name}`),
        // superClass is typed as `Expression` but seems only ever parsed as `Identifier`
        node.superClass
            ? t.identifier(`__${(node.superClass as t.Identifier).name}`)
            : null,
        t.classBody([
            ...remainingBody,
            ctorMethod(node, constr, superArgs),
            initMethod(classProps, node),
        ])
    );
};
