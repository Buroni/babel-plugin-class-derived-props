import { transformSync, parseSync, types as t } from "@babel/core";
import generate from "@babel/generator";
import fs from "fs";

const content = fs.readFileSync("demo/index3.ts", "utf-8");

const codeToAst = (code: string) => ({ ...parseSync(code).program.body[0] });

const build__classAst = (path: any) => {
    const classProps = [];
    const { node } = path;
    const constr = node.body.body.find((n) => n.key?.name === "constructor");

    console.log("BUILD AST");

    path.traverse(findClassPropsVisitor, { classProps });

    return t.classDeclaration(
        t.identifier(`__${node.id.name}`),
        node.superClass ? t.identifier(`__${node.superClass.name}`) : null,
        t.classBody([
            t.classMethod(
                "method",
                t.identifier("ctor"),
                [...constr.params],
                t.blockStatement([...constr.body.body])
            ),
            t.classMethod(
                "method",
                t.identifier("initProps"),
                [],
                t.blockStatement([
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

                if (node.superClass || node.id.name.startsWith("__")) {
                    // We only want to deal with base classes in this visitor
                    return;
                }

                const __classes = {
                    [`__${node.id.name}`]: build__classAst(path),
                };

                path.parentPath.traverse(findSubClassesVisitor, {
                    superName: node.id.name,
                    __classes,
                });

                console.log(__classes);

                for (const __className in __classes) {
                    path.insertBefore(__classes[__className]);
                }
            },
        },
    };
}

const output = transformSync(content, {
    plugins: [myCustomPlugin],
});

// fs.writeFileSync("./dist.js", output.code);
