import { types as t } from "@babel/core";

const findClassPropsVisitor = {
    ClassProperty(path, { classProps }) {
        classProps.push(path.node); // TODO - destructure?
    },
};

export const buildClassAst = (path: any) => {
    const { node } = path;
    const constr = node.body.body.find((n) => n.key?.name === "constructor");

    return t.classDeclaration(
        t.identifier(`__$TRANSFORMED__${node.id.name}`),
        null,
        t.classBody([
            t.classMethod(
                "constructor",
                t.identifier("constructor"),
                constr ? [...constr.params] : [],
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
                    t.expressionStatement(
                        t.callExpression(
                            t.memberExpression(
                                t.identifier("__class"),
                                t.identifier("initProps")
                            ),
                            []
                        )
                    ),
                    t.expressionStatement(
                        t.callExpression(
                            t.memberExpression(
                                t.identifier("__class"),
                                t.identifier("ctor")
                            ),
                            constr ? [...constr.params] : []
                        )
                    ),
                    t.returnStatement(t.identifier("__class")),
                ])
            ),
        ])
    );
};

export const build__classAst = (path: any) => {
    const classProps = [];
    const { node } = path;
    const constr = node.body.body.find((n) => n.key?.name === "constructor");

    path.traverse(findClassPropsVisitor, { classProps });

    const superCtorCall = node.superClass
        ? t.expressionStatement(
              t.callExpression(
                  t.memberExpression(t.super(), t.identifier("ctor")),
                  []
              )
          )
        : t.emptyStatement();

    const superInitCall = node.superClass
        ? t.expressionStatement(
              t.callExpression(
                  t.memberExpression(t.super(), t.identifier("initProps")),
                  []
              )
          )
        : t.emptyStatement();

    const ctorBlock = t.blockStatement([superCtorCall]);
    const initBlock = t.blockStatement([superInitCall]);

    if (constr) {
        ctorBlock.body.push(
            ...constr.body.body.filter(
                (b) => b.expression?.callee?.type !== "Super"
            )
        );
        initBlock.body.push(
            ...classProps.map((p) =>
                t.expressionStatement(
                    t.assignmentExpression(
                        "=",
                        t.memberExpression(t.thisExpression(), p.key),
                        p.value
                    )
                )
            )
        );
    }

    return t.classDeclaration(
        t.identifier(`__${node.id.name}`),
        node.superClass ? t.identifier(`__${node.superClass.name}`) : null,
        t.classBody([
            t.classMethod(
                "method",
                t.identifier("ctor"),
                constr ? [...constr.params] : [],
                ctorBlock
            ),
            t.classMethod("method", t.identifier("initProps"), [], initBlock),
        ])
    );
};
