import { transformSync, types as t } from "@babel/core";
import fs from "fs";

const content = fs.readFileSync("demo/index3.ts", "utf-8");

const buildClassAst = (path: any) => {
    const { node } = path;
    const constr = node.body.body.find((n) => n.key?.name === "constructor");

    return t.classDeclaration(
        t.identifier(`__$TRANSFORMED__${node.id.name}`),
        null,
        t.classBody([
            t.classMethod(
                "constructor",
                t.identifier("constructor"),
                [...constr.params],
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
                            [...constr.params]
                        )
                    ),
                    t.returnStatement(t.identifier("__class")),
                ])
            ),
        ])
    );
};

const build__classAst = (path: any) => {
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

    return t.classDeclaration(
        t.identifier(`__${node.id.name}`),
        node.superClass ? t.identifier(`__${node.superClass.name}`) : null,
        t.classBody([
            t.classMethod(
                "method",
                t.identifier("ctor"),
                [...constr.params],
                t.blockStatement([
                    superCtorCall,
                    ...constr.body.body.filter(
                        (b) => b.expression?.callee?.type !== "Super"
                    ),
                ])
            ),
            t.classMethod(
                "method",
                t.identifier("initProps"),
                [],
                t.blockStatement([
                    superInitCall,
                    ...classProps.map((p) =>
                        t.expressionStatement(
                            t.assignmentExpression(
                                "=",
                                t.memberExpression(t.thisExpression(), p.key),
                                p.value
                            )
                        )
                    ),
                ])
            ),
        ])
    );
};

const findSubClassesVisitor = {
    ClassDeclaration(path, { superName, __classes }) {
        const { node } = path;
        if (node.superClass?.name === superName) {
            __classes[`__${node.id.name}`] = build__classAst(path);
        }
    },
};

const findClassPropsVisitor = {
    ClassProperty(path, { classProps }) {
        classProps.push(path.node); // TODO - destructure?
    },
};

function myCustomPlugin({ types: t }) {
    return {
        visitor: {
            ClassDeclaration(path) {
                const { node } = path;

                if (node.id.name.startsWith("__")) {
                    return;
                } else if (node.superClass) {
                    path.replaceWith(buildClassAst(path));
                    return;
                }

                const __classes = {
                    [`__${node.id.name}`]: build__classAst(path),
                };

                path.parentPath.traverse(findSubClassesVisitor, {
                    superName: node.id.name,
                    __classes,
                });

                for (const __className in __classes) {
                    path.insertBefore(__classes[__className]);
                }

                path.replaceWith(buildClassAst(path));
            },
        },
    };
}

const output = transformSync(content, {
    plugins: [myCustomPlugin],
    ast: true,
});

fs.writeFileSync("./dist.js", output.code.replace(/__\$TRANSFORMED__/g, ""));
