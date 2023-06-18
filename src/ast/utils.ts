import { types as t } from "@babel/core";

export const isConstr = (n: t.Node): n is t.ClassMethod =>
    t.isClassMethod(n) && t.isIdentifier(n.key) && n.key.name === "constructor";

export const getConstr = (
    classDeclr: t.ClassDeclaration
): t.ClassMethod | undefined =>
    /**
     * Get constructor method from class declaration
     */
    classDeclr.body.body.find(isConstr);

export const isSuperCall = (
    n: t.Node
): n is t.ExpressionStatement & { expression: t.CallExpression } =>
    t.isExpressionStatement(n) &&
    t.isCallExpression(n.expression) &&
    n.expression.callee.type === "Super";

export const callMemberExpression = (
    member: t.Expression,
    property: string,
    args: t.CallExpression["arguments"] = []
): t.ExpressionStatement =>
    /**
     * Calling an object member, e.g. `this.initProps && this.initProps()`
     *
     * The existence check is to make the call a no-op for 3rd party classes and base classes
     */
    t.expressionStatement(
        t.logicalExpression(
            "&&",
            t.memberExpression(member, t.identifier(property)),
            t.callExpression(
                t.memberExpression(member, t.identifier(property)),
                args
            )
        )
    );

export const getSuperArgs = (
    constr: t.ClassMethod
): t.CallExpression["arguments"] | undefined => {
    /**
     * Get `<args`> from `super(<args>)`
     */
    if (!constr) {
        return;
    }
    const superCall = constr.body.body.find(isSuperCall);

    const callExpression = superCall?.expression;
    return callExpression?.arguments;
};
