import { types as t, NodePath } from "@babel/core";
import { callMemberExpression, getConstr, getSuperArgs } from "./utils";

const buildWrapperConstructorBlock = (
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

const buildWrapperConstructorMethod = (node: t.ClassDeclaration) => {
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
        buildWrapperConstructorBlock(node, constr, superArgs)
    );
};

export const buildWrapperClassAST = (
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
        t.classBody([buildWrapperConstructorMethod(node)])
    );
};
