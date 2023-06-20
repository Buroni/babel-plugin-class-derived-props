import { NodePath, types as t } from "@babel/core";
import {
    callMemberExpression,
    getConstr,
    getSuperArgs,
    isSuperCall,
    isConstr,
} from "./utils";
import { withPluginPrefix } from "../utils";

const shadowSuperClass = (superClassPath: NodePath<t.Expression>) => {
    /**
     * For class with `extends B` convert to `extends __B`
     * Also works with mixins e.g. `extends myMixIn(B)`
     *
     * TODO - don't do this in-place
     */

    if (
        t.isIdentifier(superClassPath.node) &&
        superClassPath.scope.hasBinding(
            withPluginPrefix(superClassPath.node.name)
        )
    ) {
        superClassPath.replaceWith(
            t.identifier(withPluginPrefix(superClassPath.node.name))
        );
        return;
    }
    superClassPath.traverse({
        Identifier(idPath: NodePath<t.Identifier>) {
            const idShadowedName = withPluginPrefix(idPath.node.name);

            // Only modify superclass to shadowed version if shadowed version is in scope
            if (idPath.scope.hasBinding(idShadowedName)) {
                idPath.replaceWith(t.identifier(idShadowedName));
                idPath.stop();
            }
        },
    });
};

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

    const ctorBlock = t.blockStatement([superCtorCall()]);

    // Push original class constructor properties (except `super`) to shadowed class `ctor()`
    if (constr) {
        ctorBlock.body.push(
            ...constr.body.body.filter((s: t.Statement) => !isSuperCall(s))
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

    const initBlock = t.blockStatement([
        callMemberExpression(t.super(), "initProps"),
    ]);

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

export const buildUnderscoredClassAST = (
    path: NodePath<t.ClassDeclaration>
): t.ClassDeclaration => {
    /**
     * Builds the shadowed class `__<class-name>` for each class, e.g.
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
    const shadowedName = withPluginPrefix(node.id.name);

    if (node.superClass) {
        shadowSuperClass(path.get("superClass") as NodePath<t.Expression>);
    }

    // `body` array of a `ClassBody` node
    const classBody = path.get("body").get("body");

    const classProps = classBody
        .map((p) => p.node)
        .filter((n): n is t.ClassProperty => t.isClassProperty(n));

    // Other (non-constructor) class methods/getters which aren't properties should be copied across to shadowed class
    const remainingBody = classBody
        .map((p) => p.node)
        .filter((n) => !t.isClassProperty(n) && !isConstr(n));

    return t.classDeclaration(
        t.identifier(shadowedName),
        node.superClass,
        t.classBody([
            ...remainingBody,
            ctorMethod(node, constr, superArgs),
            initMethod(classProps, node),
        ])
    );
};
